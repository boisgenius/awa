import { randomBytes, createHash } from 'crypto';
import type { Agent, ApiKey, WalletInfo } from './types';

const API_KEY_PREFIX = 'awa_';
const API_KEY_LENGTH = 32;

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

    // Generate random key
    const randomPart = randomBytes(API_KEY_LENGTH).toString('hex');
    const key = `${API_KEY_PREFIX}${randomPart}`;
    const prefix = `${API_KEY_PREFIX}${randomPart.substring(0, 4)}`;

    // Hash the key for storage
    const keyHash = this.hashApiKey(key);

    // Save to database
    await this.adapter.saveApiKey(agentId, keyHash, prefix);

    return { key, prefix };
  }

  /**
   * Validate an API key and return the associated agent
   */
  async validateApiKey(key: string): Promise<Agent | null> {
    // Check key format
    if (!this.isValidKeyFormat(key)) {
      return null;
    }

    // Hash the key and lookup
    const keyHash = this.hashApiKey(key);
    const agent = await this.adapter.getAgentByApiKeyHash(keyHash);

    // Check if agent exists and is active
    if (!agent || !agent.isActive) {
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

  /**
   * Hash an API key for secure storage
   */
  private hashApiKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Validate API key format
   */
  private isValidKeyFormat(key: string): boolean {
    return key.startsWith(API_KEY_PREFIX) && key.length > API_KEY_PREFIX.length + 8;
  }
}
