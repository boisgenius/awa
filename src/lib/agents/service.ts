/**
 * Agent Service
 * Business logic for agent operations
 */

import { createServiceClient } from '@/lib/supabase/server';
import { hashApiKey } from '@/lib/auth/credentials';
import type { Agent, AgentStatus } from '@/lib/auth/types';

export interface AgentWithOwner {
  id: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  walletPublicKey: string;
  owner: {
    id: string;
    twitterHandle: string | null;
    displayName: string | null;
  } | null;
  createdAt: string;
  claimedAt: string | null;
  lastActiveAt: string | null;
}

export interface AgentBalance {
  publicKey: string;
  balance: number;
  currency: string;
}

/**
 * Get agent by API key
 */
export async function getAgentByApiKey(apiKey: string): Promise<Agent | null> {
  const supabase = createServiceClient();
  const keyHash = hashApiKey(apiKey);

  const { data, error } = await supabase
    .from('agents')
    .select(`
      id,
      name,
      description,
      api_key_hash,
      api_key_prefix,
      wallet_public_key,
      wallet_encrypted_key,
      status,
      owner_id,
      claim_token,
      claim_token_expires_at,
      verification_code,
      created_at,
      claimed_at,
      last_active_at
    `)
    .eq('api_key_hash', keyHash)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    ownerId: data.owner_id,
    apiKeyHash: data.api_key_hash,
    apiKeyPrefix: data.api_key_prefix,
    walletPublicKey: data.wallet_public_key,
    walletEncryptedKey: data.wallet_encrypted_key,
    status: data.status as AgentStatus,
    claimToken: data.claim_token,
    claimTokenExpiresAt: data.claim_token_expires_at ? new Date(data.claim_token_expires_at) : undefined,
    verificationCode: data.verification_code,
    createdAt: new Date(data.created_at),
    claimedAt: data.claimed_at ? new Date(data.claimed_at) : undefined,
    lastSeenAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
  };
}

/**
 * Get agent with owner info
 */
export async function getAgentWithOwner(agentId: string): Promise<AgentWithOwner | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('agents')
    .select(`
      id,
      name,
      description,
      status,
      wallet_public_key,
      created_at,
      claimed_at,
      last_active_at,
      users:owner_id (
        id,
        twitter_handle,
        display_name
      )
    `)
    .eq('id', agentId)
    .single();

  if (error || !data) {
    return null;
  }

  // Handle the join result - could be array or single object depending on Supabase version
  const usersData = data.users;
  const user = Array.isArray(usersData) ? usersData[0] : usersData as { id: string; twitter_handle: string | null; display_name: string | null } | null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status as AgentStatus,
    walletPublicKey: data.wallet_public_key,
    owner: user ? {
      id: user.id,
      twitterHandle: user.twitter_handle,
      displayName: user.display_name,
    } : null,
    createdAt: data.created_at,
    claimedAt: data.claimed_at,
    lastActiveAt: data.last_active_at,
  };
}

/**
 * Update agent last active time
 */
export async function updateAgentLastActive(agentId: string): Promise<void> {
  const supabase = createServiceClient();

  await supabase
    .from('agents')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', agentId);
}

/**
 * Get agent purchase count
 */
export async function getAgentPurchaseCount(agentId: string): Promise<number> {
  const supabase = createServiceClient();

  const { count, error } = await supabase
    .from('purchases')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', agentId)
    .eq('tx_status', 'confirmed');

  if (error) {
    return 0;
  }

  return count || 0;
}

/**
 * Get agent's recent purchases with skill info
 */
export async function getAgentRecentPurchases(agentId: string, limit: number = 5) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id,
      price,
      currency,
      tx_signature,
      tx_status,
      created_at,
      confirmed_at,
      skills:skill_id (
        id,
        name,
        slug,
        icon_emoji
      )
    `)
    .eq('agent_id', agentId)
    .eq('tx_status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return data.map(p => ({
    id: p.id,
    skillId: (p.skills as any)?.id,
    skillName: (p.skills as any)?.name,
    skillSlug: (p.skills as any)?.slug,
    skillIcon: (p.skills as any)?.icon_emoji,
    price: p.price,
    currency: p.currency,
    txSignature: p.tx_signature,
    purchasedAt: p.confirmed_at || p.created_at,
  }));
}

/**
 * Check if agent has purchased a skill
 */
export async function hasAgentPurchasedSkill(agentId: string, skillId: string): Promise<boolean> {
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
 * Get all agent purchases
 */
export async function getAgentPurchases(agentId: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id,
      price,
      currency,
      tx_signature,
      tx_status,
      created_at,
      confirmed_at,
      skills:skill_id (
        id,
        name,
        slug,
        description,
        icon_emoji,
        category,
        version
      )
    `)
    .eq('agent_id', agentId)
    .order('created_at', { ascending: false });

  if (error) {
    return [];
  }

  return data.map(p => ({
    id: p.id,
    skill: p.skills ? {
      id: (p.skills as any).id,
      name: (p.skills as any).name,
      slug: (p.skills as any).slug,
      description: (p.skills as any).description,
      icon: (p.skills as any).icon_emoji,
      category: (p.skills as any).category,
      version: (p.skills as any).version,
    } : null,
    price: p.price,
    currency: p.currency,
    txSignature: p.tx_signature,
    status: p.tx_status,
    createdAt: p.created_at,
    confirmedAt: p.confirmed_at,
  }));
}
