// Agent Authentication Types

export interface Agent {
  id: string;
  name: string;
  apiKeyHash: string;
  apiKeyPrefix: string;
  walletPublicKey: string;
  walletEncryptedKey: string;
  isActive: boolean;
  lastSeenAt?: Date;
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
