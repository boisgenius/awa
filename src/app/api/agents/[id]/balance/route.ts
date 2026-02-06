import { NextRequest, NextResponse } from 'next/server';
import type { Agent } from '@/lib/auth';

// Mock agents data
const mockAgents: Record<string, Agent> = {
  'agent-1': {
    id: 'agent-1',
    name: 'Test Agent',
    apiKeyHash: 'hash',
    apiKeyPrefix: 'claw_sk_',
    walletPublicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    walletEncryptedKey: 'encrypted',
    status: 'active',
    createdAt: new Date('2024-01-01'),
  },
};

// Mock balances (in production, would query Solana)
const mockBalances: Record<string, number> = {
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU': 15.75,
  'Hx5KtG2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsX': 8.25,
};

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/agents/[id]/balance
 * Get agent wallet balance
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const agent = mockAgents[params.id];

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const balance = mockBalances[agent.walletPublicKey] ?? 0;

    return NextResponse.json({
      agentId: agent.id,
      wallet: {
        publicKey: agent.walletPublicKey,
        balance,
        currency: 'SOL',
      },
      // Mock USD value (in production, would fetch real price)
      usdValue: balance * 100, // Assuming 1 SOL = $100
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
