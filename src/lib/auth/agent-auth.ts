import type { Agent, WalletInfo } from './types';
import {
  generateApiKey as genApiKey,
  hashApiKey,
  getApiKeyPrefix,
  isValidApiKeyFormat,
} from './credentials';

export interface AgentAuthAdapter {
  getAgentByApiKeyHash(hash: string): Promise<Agent | null>;
  getAgentById(id: string): Promise<Agent | null>;
  saveApiKey(agentId: string, keyHash: string, prefix: string): Promise<void>;
  revokeApiKey(keyId: string): Promise<void>;
  getAgentWallet(agentId: string): Promise<WalletInfo | null>;
}

export interface GeneratedApiKey {
  key: string;
  prefix: string;
}

export class AgentAuth {
  private adapter: AgentAuthAdapter;

  constructor(adapter: AgentAuthAdapter) {
    this.adapter = adapter;
  }

  /**
   * Generate a new API key for an agent
   */
  async generateApiKey(agentId: string): Promise<GeneratedApiKey> {
    const agent = await this.adapter.getAgentById(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Generate key using credentials module
    const key = genApiKey();
    const prefix = getApiKeyPrefix(key);
    const keyHash = hashApiKey(key);

    // Save to database
    await this.adapter.saveApiKey(agentId, keyHash, prefix);

    return { key, prefix };
  }

  /**
   * Validate an API key and return the associated agent
   */
  async validateApiKey(key: string): Promise<Agent | null> {
    // Check key format
    if (!isValidApiKeyFormat(key)) {
      return null;
    }

    // Hash the key and lookup
    const keyHash = hashApiKey(key);
    const agent = await this.adapter.getAgentByApiKeyHash(keyHash);

    // Check if agent exists and is active
    if (!agent || agent.status !== 'active') {
      return null;
    }

    return agent;
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    await this.adapter.revokeApiKey(keyId);
  }

  /**
   * Get wallet info for an agent
   */
  async getAgentWallet(agentId: string): Promise<WalletInfo | null> {
    return this.adapter.getAgentWallet(agentId);
  }

  /**
   * Check if an agent has a valid wallet
   */
  async hasValidWallet(agentId: string): Promise<boolean> {
    const wallet = await this.getAgentWallet(agentId);
    return wallet !== null;
  }

}
