import { NextRequest, NextResponse } from 'next/server';
import { createAuthMiddleware } from '@/lib/auth';

// Mock auth validator
async function mockValidateApiKey(key: string) {
  if (key.startsWith('claw_')) {
    return {
      id: 'agent-1',
      name: 'Test Agent',
      apiKeyHash: 'hash',
      apiKeyPrefix: 'claw_sk_',
      walletPublicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      walletEncryptedKey: 'encrypted',
      status: 'active' as const,
      lastSeenAt: new Date(),
      createdAt: new Date('2024-01-01'),
    };
  }
  return null;
}

const authMiddleware = createAuthMiddleware(mockValidateApiKey);

// Mock wallet balance
async function getWalletBalance(publicKey: string): Promise<number> {
  // In production, this would query Solana
  return 15.75;
}

// Mock purchases
async function getAgentPurchases(agentId: string) {
  return [
    {
      id: 'purchase-1',
      skillId: '1',
      skillName: 'Web Research Pro',
      price: 0.5,
      purchasedAt: new Date('2024-01-15'),
    },
    {
      id: 'purchase-2',
      skillId: '2',
      skillName: 'Code Review Assistant',
      price: 0.8,
      purchasedAt: new Date('2024-01-20'),
    },
  ];
}

/**
 * GET /api/agents/me
 * Get current authenticated agent info
 */
export const GET = authMiddleware(async (request, { agent }) => {
  try {
    const balance = await getWalletBalance(agent.walletPublicKey);
    const purchases = await getAgentPurchases(agent.id);

    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      wallet: {
        publicKey: agent.walletPublicKey,
        balance,
      },
      status: agent.status,
      lastSeenAt: agent.lastSeenAt,
      createdAt: agent.createdAt,
      purchases: purchases.length,
      recentPurchases: purchases.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching agent info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent info' },
      { status: 500 }
    );
  }
});
