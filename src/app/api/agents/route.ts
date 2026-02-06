import { NextRequest, NextResponse } from 'next/server';
import { AgentAuth, type AgentAuthAdapter } from '@/lib/auth';
import type { Agent, WalletInfo } from '@/lib/auth';

// Mock data store for development
const agentsStore = new Map<string, Agent>();
const apiKeyHashMap = new Map<string, string>(); // hash -> agentId

// Mock adapter implementing AgentAuthAdapter
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
    const agent = agentsStore.get(agentId);
    if (agent) {
      agent.apiKeyHash = keyHash;
      agent.apiKeyPrefix = prefix;
      agentsStore.set(agentId, agent);
    }
  },

  async revokeApiKey(keyId: string) {
    // In real implementation, would lookup and remove by keyId
    // For mock, we'd need to track key IDs separately
  },

  async getAgentWallet(agentId: string): Promise<WalletInfo | null> {
    const agent = agentsStore.get(agentId);
    if (!agent) return null;
    return {
      publicKey: agent.walletPublicKey,
      balance: 10.5, // Mock balance
    };
  },
};

// Helper to create agent (not part of adapter interface)
async function createAgent(name: string): Promise<Agent> {
  const id = crypto.randomUUID();
  const agent: Agent = {
    id,
    name,
    apiKeyHash: '',
    apiKeyPrefix: '',
    walletPublicKey: `wallet_${crypto.randomUUID().slice(0, 8)}`,
    walletEncryptedKey: `encrypted_${crypto.randomUUID()}`,
    status: 'active',
    createdAt: new Date(),
  };
  agentsStore.set(id, agent);
  return agent;
}

const agentAuth = new AgentAuth(mockAgentAdapter);

/**
 * POST /api/agents
 * Register a new agent and generate API key
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'Agent name is required' },
        { status: 400 }
      );
    }

    // Create agent with mock wallet
    const agent = await createAgent(body.name);

    // Generate API key for the agent
    const { key, prefix } = await agentAuth.generateApiKey(agent.id);

    return NextResponse.json({
      agent: {
        id: agent.id,
        name: agent.name,
        walletPublicKey: agent.walletPublicKey,
        createdAt: agent.createdAt,
      },
      apiKey: {
        key, // Only returned once at creation
        prefix,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
