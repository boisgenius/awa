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
  'agent-2': {
    id: 'agent-2',
    name: 'Production Agent',
    apiKeyHash: 'hash2',
    apiKeyPrefix: 'claw_sk_',
    walletPublicKey: 'Hx5KtG2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsX',
    walletEncryptedKey: 'encrypted',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
};

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/agents/[id]
 * Get agent details by ID
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

    // Return public info only (exclude sensitive data)
    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      walletPublicKey: agent.walletPublicKey,
      status: agent.status,
      createdAt: agent.createdAt,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}
