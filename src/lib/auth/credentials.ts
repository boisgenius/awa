/**
 * Credentials Generation
 * Generate API keys, claim tokens, and verification codes
 */

import { randomBytes, createHash, timingSafeEqual } from 'crypto';

// Constants
export const API_KEY_PREFIX = 'claw_sk_';
export const CLAIM_TOKEN_PREFIX = 'tk_';
const API_KEY_LENGTH = 32; // bytes
const CLAIM_TOKEN_LENGTH = 16; // bytes
const CLAIM_TOKEN_EXPIRY_DAYS = 7;

// Word list for human-readable verification codes
const VERIFICATION_WORDS = [
  'coral', 'reef', 'wave', 'tide', 'shell', 'pearl', 'ocean', 'shore',
  'sand', 'surf', 'crab', 'kelp', 'foam', 'salt', 'deep', 'blue'
];

export interface GeneratedCredentials {
  apiKey: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  claimToken: string;
  claimTokenExpiresAt: Date;
  verificationCode: string;
}

/**
 * Generate a new API key
 * Format: claw_sk_<64 hex chars>
 */
export function generateApiKey(): string {
  const random = randomBytes(API_KEY_LENGTH).toString('hex');
  return `${API_KEY_PREFIX}${random}`;
}

/**
 * Generate claim token
 * Format: tk_<32 hex chars>
 */
export function generateClaimToken(): string {
  const random = randomBytes(CLAIM_TOKEN_LENGTH).toString('hex');
  return `${CLAIM_TOKEN_PREFIX}${random}`;
}

/**
 * Generate human-readable verification code
 * Format: word-XXXX (e.g., coral-X7K9)
 */
export function generateVerificationCode(): string {
  const word = VERIFICATION_WORDS[Math.floor(Math.random() * VERIFICATION_WORDS.length)];
  const code = randomBytes(2).toString('hex').toUpperCase();
  return `${word}-${code}`;
}

/**
 * Hash an API key for secure storage
 * Uses SHA256 for one-way hashing
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Get API key prefix for display
 * Returns first 12 chars after prefix (e.g., claw_sk_a1b2c3d4...)
 */
export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, API_KEY_PREFIX.length + 8) + '...';
}

/**
 * Validate API key format
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || !apiKey.startsWith(API_KEY_PREFIX)) {
    return false;
  }
  const keyPart = apiKey.slice(API_KEY_PREFIX.length);
  // Should be 64 hex characters
  return keyPart.length === 64 && /^[a-f0-9]+$/.test(keyPart);
}

/**
 * Validate claim token format
 */
export function isValidClaimTokenFormat(token: string): boolean {
  if (!token || !token.startsWith(CLAIM_TOKEN_PREFIX)) {
    return false;
  }
  const tokenPart = token.slice(CLAIM_TOKEN_PREFIX.length);
  // Should be 32 hex characters
  return tokenPart.length === 32 && /^[a-f0-9]+$/.test(tokenPart);
}

/**
 * Calculate claim token expiry date
 */
export function getClaimTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + CLAIM_TOKEN_EXPIRY_DAYS);
  return expiry;
}

/**
 * Check if claim token has expired
 */
export function isClaimTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Timing-safe comparison for API keys
 */
export function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Generate all credentials for a new agent
 */
export function generateAgentCredentials(): GeneratedCredentials {
  const apiKey = generateApiKey();

  return {
    apiKey,
    apiKeyHash: hashApiKey(apiKey),
    apiKeyPrefix: getApiKeyPrefix(apiKey),
    claimToken: generateClaimToken(),
    claimTokenExpiresAt: getClaimTokenExpiry(),
    verificationCode: generateVerificationCode(),
  };
}

/**
 * Validate agent name format
 * Must be 2-32 characters, only letters, numbers, and underscores
 */
export function isValidAgentName(name: string): boolean {
  return /^[a-zA-Z0-9_]{2,32}$/.test(name);
}

/**
 * Generate a random agent name if not provided
 */
export function generateRandomAgentName(): string {
  const adjectives = ['swift', 'clever', 'bright', 'noble', 'wise', 'keen', 'bold', 'calm'];
  const nouns = ['agent', 'helper', 'assistant', 'bot', 'mind', 'spark', 'logic', 'think'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}_${noun}_${num}`;
}
