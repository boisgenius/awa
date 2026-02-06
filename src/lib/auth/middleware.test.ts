import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createAuthMiddleware } from './middleware';
import type { Agent } from './types';
import { NextRequest } from 'next/server';

// Mock NextRequest
vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((data, init) => ({ data, status: init?.status || 200 })),
  },
}));

describe('Auth Middleware', () => {
  const mockAgent: Agent = {
    id: 'agent-123',
    name: 'Test Agent',
    apiKeyHash: 'somehash',
    apiKeyPrefix: 'awa_test',
    walletPublicKey: 'ABC123',
    walletEncryptedKey: 'encrypted',
    isActive: true,
    createdAt: new Date(),
  };

  let mockValidateApiKey: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockValidateApiKey = vi.fn();
  });

  const createMockRequest = (headers: Record<string, string> = {}) => {
    return {
      headers: {
        get: (key: string) => headers[key] || null,
      },
    } as unknown as NextRequest;
  };

  describe('createAuthMiddleware', () => {
    it('should call handler with agent when API key is valid', async () => {
      mockValidateApiKey.mockResolvedValue(mockAgent);
      const handler = vi.fn().mockResolvedValue({ success: true });

      const middleware = createAuthMiddleware(mockValidateApiKey);
      const request = createMockRequest({
        'x-api-key': 'awa_validkey123',
      });

      await middleware(handler)(request);

      expect(handler).toHaveBeenCalledWith(request, { agent: mockAgent });
    });

    it('should return 401 when API key is missing', async () => {
      const handler = vi.fn();
      const middleware = createAuthMiddleware(mockValidateApiKey);
      const request = createMockRequest({});

      const result = await middleware(handler)(request);

      expect(handler).not.toHaveBeenCalled();
      expect(result.status).toBe(401);
      expect(result.data.error).toBe('API key required');
    });

    it('should return 401 when API key is invalid', async () => {
      mockValidateApiKey.mockResolvedValue(null);
      const handler = vi.fn();

      const middleware = createAuthMiddleware(mockValidateApiKey);
      const request = createMockRequest({
        'x-api-key': 'awa_invalidkey',
      });

      const result = await middleware(handler)(request);

      expect(handler).not.toHaveBeenCalled();
      expect(result.status).toBe(401);
      expect(result.data.error).toBe('Invalid API key');
    });

    it('should support Authorization Bearer header', async () => {
      mockValidateApiKey.mockResolvedValue(mockAgent);
      const handler = vi.fn().mockResolvedValue({ success: true });

      const middleware = createAuthMiddleware(mockValidateApiKey);
      const request = createMockRequest({
        authorization: 'Bearer awa_validkey123',
      });

      await middleware(handler)(request);

      expect(mockValidateApiKey).toHaveBeenCalledWith('awa_validkey123');
      expect(handler).toHaveBeenCalled();
    });
  });
});
