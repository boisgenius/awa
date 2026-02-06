import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentAuth, AgentAuthAdapter } from './agent-auth';
import type { Agent } from './types';

describe('AgentAuth', () => {
  let agentAuth: AgentAuth;
  let mockAdapter: AgentAuthAdapter;

  const mockAgent: Agent = {
    id: 'agent-123',
    name: 'Test Agent',
    apiKeyHash: 'somehash123456',
    apiKeyPrefix: 'awa_0123',
    walletPublicKey: 'ABC123publickey',
    walletEncryptedKey: 'encrypted-private-key',
    isActive: true,
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockAdapter = {
      getAgentByApiKeyHash: vi.fn(),
      getAgentById: vi.fn(),
      saveApiKey: vi.fn(),
      revokeApiKey: vi.fn(),
      getAgentWallet: vi.fn(),
    };
    agentAuth = new AgentAuth(mockAdapter);
  });

  describe('generateApiKey', () => {
    it('should generate a new API key for an agent', async () => {
      vi.mocked(mockAdapter.getAgentById).mockResolvedValue(mockAgent);
      vi.mocked(mockAdapter.saveApiKey).mockResolvedValue(undefined);

      const result = await agentAuth.generateApiKey('agent-123');

      expect(result).toHaveProperty('key');
      expect(result).toHaveProperty('prefix');
      expect(result.key).toMatch(/^awa_/);
      expect(result.prefix).toMatch(/^awa_/);
      expect(mockAdapter.saveApiKey).toHaveBeenCalled();
    });

    it('should throw error if agent not found', async () => {
      vi.mocked(mockAdapter.getAgentById).mockResolvedValue(null);

      await expect(agentAuth.generateApiKey('invalid-id')).rejects.toThrow(
        'Agent not found'
      );
    });
  });

  describe('validateApiKey', () => {
    it('should return agent for valid API key', async () => {
      vi.mocked(mockAdapter.getAgentByApiKeyHash).mockResolvedValue(mockAgent);

      const result = await agentAuth.validateApiKey('awa_0123456789abcdef');

      expect(result).toEqual(mockAgent);
      expect(mockAdapter.getAgentByApiKeyHash).toHaveBeenCalled();
    });

    it('should return null for invalid API key from database', async () => {
      vi.mocked(mockAdapter.getAgentByApiKeyHash).mockResolvedValue(null);

      const result = await agentAuth.validateApiKey('awa_0123456789abcdef');

      expect(result).toBeNull();
    });

    it('should return null for inactive agent', async () => {
      vi.mocked(mockAdapter.getAgentByApiKeyHash).mockResolvedValue({
        ...mockAgent,
        isActive: false,
      });

      const result = await agentAuth.validateApiKey('awa_0123456789abcdef');

      expect(result).toBeNull();
    });

    it('should reject malformed API keys (no prefix)', async () => {
      const result = await agentAuth.validateApiKey('not-a-valid-key');

      expect(result).toBeNull();
      expect(mockAdapter.getAgentByApiKeyHash).not.toHaveBeenCalled();
    });

    it('should reject empty API keys', async () => {
      const result = await agentAuth.validateApiKey('');

      expect(result).toBeNull();
      expect(mockAdapter.getAgentByApiKeyHash).not.toHaveBeenCalled();
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an existing API key', async () => {
      vi.mocked(mockAdapter.revokeApiKey).mockResolvedValue(undefined);

      await agentAuth.revokeApiKey('key-id-123');

      expect(mockAdapter.revokeApiKey).toHaveBeenCalledWith('key-id-123');
    });
  });

  describe('getAgentWallet', () => {
    it('should return wallet info for agent', async () => {
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue({
        publicKey: 'ABC123publickey',
        balance: 1.5,
      });

      const result = await agentAuth.getAgentWallet('agent-123');

      expect(result).toEqual({
        publicKey: 'ABC123publickey',
        balance: 1.5,
      });
    });

    it('should return null if agent has no wallet', async () => {
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue(null);

      const result = await agentAuth.getAgentWallet('agent-123');

      expect(result).toBeNull();
    });
  });

  describe('hasValidWallet', () => {
    it('should return true if agent has valid wallet', async () => {
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue({
        publicKey: 'ABC123publickey',
        balance: 1.5,
      });

      const result = await agentAuth.hasValidWallet('agent-123');

      expect(result).toBe(true);
    });

    it('should return false if agent has no wallet', async () => {
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue(null);

      const result = await agentAuth.hasValidWallet('agent-123');

      expect(result).toBe(false);
    });
  });
});
