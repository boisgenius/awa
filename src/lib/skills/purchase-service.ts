/**
 * Skill Purchase Service
 * Handle skill purchases with Solana payments
 */

import { createServiceClient } from '@/lib/supabase/server';
import { getBalance, createTransferTransaction, signAndSendTransaction } from '@/lib/solana';
import { restoreKeypair } from '@/lib/solana/wallet';

export interface PurchaseResult {
  success: boolean;
  purchaseId?: string;
  txSignature?: string;
  error?: string;
}

export interface SkillForPurchase {
  id: string;
  name: string;
  price: number;
  currency: string;
  authorWallet: string | null;
}

/**
 * Get skill info for purchase
 */
export async function getSkillForPurchase(skillId: string): Promise<SkillForPurchase | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('skills')
    .select(`
      id,
      name,
      price,
      currency,
      authors:author_id (
        users:user_id (
          id
        )
      )
    `)
    .eq('id', skillId)
    .eq('status', 'live')
    .single();

  if (error || !data) {
    return null;
  }

  // Get author's agent wallet if they have one
  let authorWallet: string | null = null;
  const authorUser = (data.authors as any)?.users;
  if (authorUser?.id) {
    const { data: authorAgent } = await supabase
      .from('agents')
      .select('wallet_public_key')
      .eq('owner_id', authorUser.id)
      .single();

    authorWallet = authorAgent?.wallet_public_key || null;
  }

  return {
    id: data.id,
    name: data.name,
    price: Number(data.price),
    currency: data.currency,
    authorWallet,
  };
}

/**
 * Check if agent has already purchased a skill
 */
export async function hasPurchased(agentId: string, skillId: string): Promise<boolean> {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from('purchases')
    .select('id')
    .eq('agent_id', agentId)
    .eq('skill_id', skillId)
    .eq('tx_status', 'confirmed')
    .single();

  return !!data;
}

/**
 * Get agent wallet info for purchase
 */
async function getAgentWallet(agentId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('agents')
    .select('wallet_public_key, wallet_encrypted_key')
    .eq('id', agentId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    publicKey: data.wallet_public_key,
    encryptedKey: data.wallet_encrypted_key,
  };
}

/**
 * Purchase a skill
 */
export async function purchaseSkill(
  agentId: string,
  skillId: string
): Promise<PurchaseResult> {
  const supabase = createServiceClient();

  // 1. Check if already purchased
  const alreadyPurchased = await hasPurchased(agentId, skillId);
  if (alreadyPurchased) {
    return {
      success: false,
      error: 'Skill already purchased',
    };
  }

  // 2. Get skill info
  const skill = await getSkillForPurchase(skillId);
  if (!skill) {
    return {
      success: false,
      error: 'Skill not found or not available',
    };
  }

  // 3. Get agent wallet
  const wallet = await getAgentWallet(agentId);
  if (!wallet) {
    return {
      success: false,
      error: 'Agent wallet not found',
    };
  }

  // 4. Check balance
  let balance: number;
  try {
    balance = await getBalance(wallet.publicKey);
  } catch (error) {
    console.error('Failed to get balance:', error);
    return {
      success: false,
      error: 'Failed to check wallet balance',
    };
  }

  if (balance < skill.price) {
    return {
      success: false,
      error: `Insufficient balance. Need ${skill.price} SOL, have ${balance} SOL`,
    };
  }

  // 5. Create pending purchase record
  const { data: purchase, error: insertError } = await supabase
    .from('purchases')
    .insert({
      agent_id: agentId,
      skill_id: skillId,
      price: skill.price,
      currency: skill.currency,
      tx_status: 'pending',
    })
    .select('id')
    .single();

  if (insertError || !purchase) {
    console.error('Failed to create purchase record:', insertError);
    return {
      success: false,
      error: 'Failed to initiate purchase',
    };
  }

  // 6. Execute payment (if skill has a price and author wallet)
  let txSignature: string | null = null;

  if (skill.price > 0 && skill.authorWallet) {
    try {
      // Create transaction
      const transaction = await createTransferTransaction(
        wallet.publicKey,
        skill.authorWallet,
        skill.price
      );

      // Sign and send
      const keypair = restoreKeypair(wallet.encryptedKey);
      txSignature = await signAndSendTransaction(transaction, keypair);
    } catch (error) {
      console.error('Payment failed:', error);

      // Update purchase as failed
      await supabase
        .from('purchases')
        .update({ tx_status: 'failed' })
        .eq('id', purchase.id);

      return {
        success: false,
        error: 'Payment failed',
      };
    }
  }

  // 7. Update purchase as confirmed
  const { error: updateError } = await supabase
    .from('purchases')
    .update({
      tx_signature: txSignature,
      tx_status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .eq('id', purchase.id);

  if (updateError) {
    console.error('Failed to confirm purchase:', updateError);
    // Payment was made but record update failed - still return success
  }

  // 8. Increment skill downloads (best effort, fire and forget)
  (async () => {
    try {
      const { data } = await supabase
        .from('skills')
        .select('downloads')
        .eq('id', skillId)
        .single();

      if (data) {
        await supabase
          .from('skills')
          .update({ downloads: (data.downloads || 0) + 1 })
          .eq('id', skillId);
      }
    } catch (e) {
      console.error('Failed to increment downloads:', e);
    }
  })();

  return {
    success: true,
    purchaseId: purchase.id,
    txSignature: txSignature || undefined,
  };
}

/**
 * Get skill content (only for purchased skills)
 */
export async function getSkillContent(agentId: string, skillId: string) {
  const supabase = createServiceClient();

  // Verify purchase
  const purchased = await hasPurchased(agentId, skillId);
  if (!purchased) {
    return null;
  }

  // Get skill content
  const { data, error } = await supabase
    .from('skills')
    .select('id, name, version, content')
    .eq('id', skillId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    skillId: data.id,
    name: data.name,
    version: data.version,
    content: data.content,
  };
}
