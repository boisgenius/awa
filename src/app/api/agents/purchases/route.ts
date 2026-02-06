import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/auth';
import { AutoPaymentService, type PaymentServiceAdapter } from '@/lib/payment';
import type { Purchase } from '@/lib/payment';

// Mock auth validator
async function mockValidateApiKey(key: string) {
  if (key.startsWith('claw_')) {
    return {
      id: 'agent-1',
      name: 'Test Agent',
      apiKeyHash: 'hash',
      apiKeyPrefix: 'claw_',
      walletPublicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      walletEncryptedKey: 'encrypted',
      isActive: true,
      createdAt: new Date(),
    };
  }
  return null;
}

const authMiddleware = createAuthMiddleware(mockValidateApiKey);

// Mock purchases data
const mockPurchases: Purchase[] = [
  {
    id: 'purchase-1',
    agentId: 'agent-1',
    skillId: '1',
    price: 0.5,
    currency: 'SOL',
    txSignature: 'sig123abc',
    status: 'confirmed',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'purchase-2',
    agentId: 'agent-1',
    skillId: '2',
    price: 0.8,
    currency: 'SOL',
    txSignature: 'sig456def',
    status: 'confirmed',
    createdAt: new Date('2024-01-20'),
  },
];

// Mock skills data
const mockSkills: Record<string, { price: number; content: string }> = {
  '1': { price: 0.5, content: 'Web Research Pro skill content' },
  '2': { price: 0.8, content: 'Code Review Assistant skill content' },
  '3': { price: 1.2, content: 'Financial Analyst skill content' },
};

// Mock payment adapter implementing PaymentServiceAdapter
const mockPaymentAdapter: PaymentServiceAdapter = {
  async getAgentWallet(agentId: string) {
    return {
      publicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      encryptedPrivateKey: 'encrypted-key',
      balance: 15.75,
    };
  },

  async getSkillPrice(skillId: string) {
    return mockSkills[skillId]?.price ?? 0;
  },

  async createTransaction(fromWallet: string, toWallet: string, amount: number) {
    return {
      transaction: `tx_${crypto.randomUUID().slice(0, 8)}`,
      recipient: 'author-wallet-public-key',
    };
  },

  async signAndSubmitTransaction(transaction: string, encryptedPrivateKey: string) {
    return `sig_${crypto.randomUUID().slice(0, 8)}`;
  },

  async verifyTransaction(signature: string) {
    return {
      confirmed: true,
      signature,
      slot: 12345678,
    };
  },

  async savePurchase(purchase: Omit<Purchase, 'id' | 'createdAt'>) {
    const newPurchase: Purchase = {
      ...purchase,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    mockPurchases.push(newPurchase);
    return newPurchase;
  },

  async getAgentPurchases(agentId: string) {
    return mockPurchases.filter(p => p.agentId === agentId);
  },

  async hasAgentPurchasedSkill(agentId: string, skillId: string) {
    return mockPurchases.some(p => p.agentId === agentId && p.skillId === skillId);
  },

  async getSkillContent(skillId: string) {
    return mockSkills[skillId]?.content ?? '';
  },
};

const paymentService = new AutoPaymentService(mockPaymentAdapter);

/**
 * GET /api/agents/purchases
 * Get current agent's purchase history
 */
export const GET = authMiddleware(async (request, { agent }) => {
  try {
    const purchases = await paymentService.getAgentPurchases(agent.id);

    return NextResponse.json({
      purchases,
      total: purchases.length,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/agents/purchases
 * Purchase a skill
 */
export const POST = authMiddleware(async (request, { agent }) => {
  try {
    const body = await request.json();

    if (!body.skillId) {
      return NextResponse.json(
        { error: 'skillId is required' },
        { status: 400 }
      );
    }

    const result = await paymentService.purchaseSkill(agent.id, body.skillId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionSignature: result.transactionSignature,
      message: 'Skill purchased successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error purchasing skill:', error);
    return NextResponse.json(
      { error: 'Failed to purchase skill' },
      { status: 500 }
    );
  }
});
