// Global type definitions

export interface Agent {
  id: string;
  name: string;
  apiKeyHash: string;
  walletPublicKey: string;
  walletEncryptedKey: string;
  createdAt: Date;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  status: 'live' | 'dev' | 'deprecated';
  priority: 'high' | 'medium' | 'emerging';
  price: number;
  rating: number;
  downloads: number;
  verified: boolean;
  features: string[];
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type SkillCategory =
  | 'research'
  | 'finance'
  | 'coding'
  | 'security'
  | 'creative'
  | 'comms';

export interface Purchase {
  id: string;
  agentId: string;
  skillId: string;
  price: number;
  currency: 'SOL' | 'USDC' | 'CLAW';
  txSignature: string;
  status: 'confirmed' | 'refunded';
  createdAt: Date;
}
