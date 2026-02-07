// Agent Authentication Types

export type AgentStatus = 'pending_claim' | 'active' | 'suspended' | 'expired';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  ownerId?: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  walletPublicKey: string;
  walletEncryptedKey: string;
  status: AgentStatus;
  claimToken?: string;
  claimTokenExpiresAt?: Date;
  verificationCode?: string;
  lastSeenAt?: Date;
  claimedAt?: Date;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  agentId: string;
  keyHash: string;
  prefix: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface WalletInfo {
  publicKey: string;
  balance?: number;
}

export interface AuthResult {
  success: boolean;
  agent?: Agent;
  error?: string;
}

// Registration types
export interface RegisterRequest {
  name: string;
  description?: string;
  ownerHint?: string;
}

export interface RegisterResult {
  id: string;
  name: string;
  apiKey: string;
  claimUrl: string;
  claimToken: string;
  verificationCode: string;
  walletPublicKey: string;
  status: AgentStatus;
  createdAt: string;
}

// Claim types
export interface ClaimRequest {
  claimToken: string;
  tweetUrl: string;
}

export interface WalletClaimRequest {
  claimToken: string;
  walletAddress: string;
  signature: string;  // base58 encoded signature
  message: string;    // original signed message
}

export interface ClaimResult {
  agentId: string;
  agentName: string;
  status: AgentStatus;
  owner: {
    twitterId: string;
    twitterHandle: string;
  };
  claimedAt: string;
}

export interface ClaimInfo {
  agentName: string;
  verificationCode: string;
  status: AgentStatus;
  expiresAt: string;
}

// Tweet verification
export interface TweetVerification {
  isValid: boolean;
  twitterId?: string;
  twitterHandle?: string;
  error?: string;
}

// Rate limiting
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

// API response format
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error codes
export const ErrorCodes = {
  MISSING_AUTH: 'MISSING_AUTH',
  INVALID_API_KEY: 'INVALID_API_KEY',
  AGENT_SUSPENDED: 'AGENT_SUSPENDED',
  AGENT_NOT_ACTIVE: 'AGENT_NOT_ACTIVE',
  RATE_LIMITED: 'RATE_LIMITED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  ALREADY_PURCHASED: 'ALREADY_PURCHASED',
  SKILL_NOT_FOUND: 'SKILL_NOT_FOUND',
  AGENT_NOT_FOUND: 'AGENT_NOT_FOUND',
  INVALID_CLAIM_TOKEN: 'INVALID_CLAIM_TOKEN',
  CLAIM_EXPIRED: 'CLAIM_EXPIRED',
  INVALID_TWEET: 'INVALID_TWEET',
  VERIFICATION_FAILED: 'VERIFICATION_FAILED',
  NAME_TAKEN: 'NAME_TAKEN',
  INVALID_NAME: 'INVALID_NAME',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
