// Payment Types

export interface PurchaseResult {
  success: boolean;
  transactionSignature?: string;
  skillContent?: string;
  error?: string;
}

export interface TransactionResult {
  confirmed: boolean;
  signature: string;
  slot?: number;
  error?: string;
}

export interface Purchase {
  id: string;
  agentId: string;
  skillId: string;
  price: number;
  currency: PaymentToken;
  txSignature: string;
  status: PurchaseStatus;
  createdAt: Date;
}

export type PaymentToken = 'SOL' | 'USDC' | 'CLAW';

export type PurchaseStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
