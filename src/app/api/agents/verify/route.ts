import { NextRequest, NextResponse } from 'next/server';
import { AgentAuth, type AgentAuthAdapter } from '@/lib/auth';
import type { Agent, WalletInfo } from '@/lib/auth';

// Mock data store (shared across routes in production)
const agentsStore = new Map<string, Agent>();
const apiKeyHashMap = new Map<string, string>();

// Add a test agent for verification
const testAgent: Agent = {
  id: 'agent-1',
  name: 'Test Agent',
  apiKeyHash: '', // Will be set dynamically
  apiKeyPrefix: 'awa_',
  walletPublicKey: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  walletEncryptedKey: 'encrypted-key',
  isActive: true,
  createdAt: new Date('2024-01-01'),
};
agentsStore.set(testAgent.id, testAgent);

// Mock adapter
const mockAgentAdapter: AgentAuthAdapter = {
  async getAgentByApiKeyHash(hash: string) {
    const agentId = apiKeyHashMap.get(hash);
    if (!agentId) return null;
    return agentsStore.get(agentId) || null;
  },

  async getAgentById(id: string) {
    return agentsStore.get(id) || null;
  },

  async saveApiKey(agentId: string, keyHash: string, prefix: string) {
    apiKeyHashMap.set(keyHash, agentId);
  },

  async revokeApiKey() {},

  async getAgentWallet(agentId: string): Promise<WalletInfo | null> {
    const agent = agentsStore.get(agentId);
    if (!agent) return null;
    return { publicKey: agent.walletPublicKey, balance: 15.75 };
  },
};

const agentAuth = new AgentAuth(mockAgentAdapter);

/**
 * POST /api/agents/verify
 * Verify an API key and return agent info
 */
export async function POST(request: NextRequest) {
  try {
    // Get API key from header or body
    const apiKey = request.headers.get('x-api-key') ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    let key = apiKey;

    // If not in header, check body
    if (!key) {
      const body = await request.json().catch(() => ({}));
      key = body.apiKey;
    }

    if (!key) {
      return NextResponse.json(
        { error: 'API key required', valid: false },
        { status: 400 }
      );
    }

    const agent = await agentAuth.validateApiKey(key);

    if (!agent) {
      return NextResponse.json(
        { error: 'Invalid API key', valid: false },
        { status: 401 }
      );
    }

    // Get wallet info
    const wallet = await agentAuth.getAgentWallet(agent.id);

    return NextResponse.json({
      valid: true,
      agent: {
        id: agent.id,
        name: agent.name,
        isActive: agent.isActive,
        createdAt: agent.createdAt,
      },
      wallet: wallet ? {
        publicKey: wallet.publicKey,
        balance: wallet.balance,
      } : null,
    });
  } catch (error) {
    console.error('Error verifying API key:', error);
    return NextResponse.json(
      { error: 'Verification failed', valid: false },
      { status: 500 }
    );
  }
}
