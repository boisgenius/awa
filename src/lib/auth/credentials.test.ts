import { describe, it, expect } from 'vitest';
import {
  generateApiKey,
  generateClaimToken,
  generateVerificationCode,
  hashApiKey,
  isValidApiKeyFormat,
  isValidClaimTokenFormat,
  API_KEY_PREFIX,
  CLAIM_TOKEN_PREFIX,
} from './credentials';

describe('credentials', () => {
  describe('generateApiKey', () => {
    it('should generate a key with correct prefix', () => {
      const key = generateApiKey();
      expect(key.startsWith(API_KEY_PREFIX)).toBe(true);
    });

    it('should generate a key of correct length', () => {
      const key = generateApiKey();
      // claw_sk_ (8) + 64 hex chars = 72
      expect(key.length).toBe(72);
    });

    it('should generate unique keys', () => {
      const key1 = generateApiKey();
      const key2 = generateApiKey();
      expect(key1).not.toBe(key2);
    });

    it('should only contain valid characters', () => {
      const key = generateApiKey();
      const suffix = key.slice(API_KEY_PREFIX.length);
      expect(suffix).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('generateClaimToken', () => {
    it('should generate a token with correct prefix', () => {
      const token = generateClaimToken();
      expect(token.startsWith(CLAIM_TOKEN_PREFIX)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateClaimToken();
      const token2 = generateClaimToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('generateVerificationCode', () => {
    it('should generate a code in correct format', () => {
      const code = generateVerificationCode();
      // Format: word-XXXX (word + hyphen + 4 chars)
      expect(code).toMatch(/^[a-z]+-[A-Z0-9]{4}$/);
    });

    it('should generate unique codes', () => {
      const codes = new Set<string>();
      for (let i = 0; i < 100; i++) {
        codes.add(generateVerificationCode());
      }
      // Should have high uniqueness (allowing some collisions due to random nature)
      expect(codes.size).toBeGreaterThan(90);
    });
  });

  describe('hashApiKey', () => {
    it('should produce consistent hashes', () => {
      const key = 'claw_sk_test123';
      const hash1 = hashApiKey(key);
      const hash2 = hashApiKey(key);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different keys', () => {
      const hash1 = hashApiKey('claw_sk_key1');
      const hash2 = hashApiKey('claw_sk_key2');
      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64-character hex string', () => {
      const hash = hashApiKey('claw_sk_test');
      expect(hash.length).toBe(64);
      expect(hash).toMatch(/^[a-f0-9]+$/);
    });
  });

  describe('isValidApiKeyFormat', () => {
    it('should accept valid API keys', () => {
      const validKey = generateApiKey();
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it('should reject keys without prefix', () => {
      expect(isValidApiKeyFormat('invalid_key_123')).toBe(false);
    });

    it('should reject keys that are too short', () => {
      expect(isValidApiKeyFormat('claw_sk_short')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidApiKeyFormat('')).toBe(false);
    });

    it('should reject null/undefined', () => {
      expect(isValidApiKeyFormat(null as unknown as string)).toBe(false);
      expect(isValidApiKeyFormat(undefined as unknown as string)).toBe(false);
    });
  });

  describe('isValidClaimTokenFormat', () => {
    it('should accept valid claim tokens', () => {
      const validToken = generateClaimToken();
      expect(isValidClaimTokenFormat(validToken)).toBe(true);
    });

    it('should reject tokens without prefix', () => {
      expect(isValidClaimTokenFormat('invalid_token')).toBe(false);
    });

    it('should reject empty strings', () => {
      expect(isValidClaimTokenFormat('')).toBe(false);
    });
  });
});
