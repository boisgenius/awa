import type { PurchaseResult, TransactionResult, Purchase } from './types';

export interface AgentWalletData {
  publicKey: string;
  encryptedPrivateKey: string;
  balance: number;
}

export interface TransactionData {
  transaction: string;
  recipient: string;
}

export interface PaymentServiceAdapter {
  getAgentWallet(agentId: string): Promise<AgentWalletData | null>;
  getSkillPrice(skillId: string): Promise<number>;
  createTransaction(
    fromWallet: string,
    toWallet: string,
    amount: number
  ): Promise<TransactionData>;
  signAndSubmitTransaction(
    transaction: string,
    encryptedPrivateKey: string
  ): Promise<string>;
  verifyTransaction(signature: string): Promise<TransactionResult>;
  savePurchase(purchase: Omit<Purchase, 'id' | 'createdAt'>): Promise<Purchase>;
  getAgentPurchases(agentId: string): Promise<Purchase[]>;
  hasAgentPurchasedSkill(agentId: string, skillId: string): Promise<boolean>;
  getSkillContent(skillId: string): Promise<string>;
}

export class AutoPaymentService {
  private adapter: PaymentServiceAdapter;

  constructor(adapter: PaymentServiceAdapter) {
    this.adapter = adapter;
  }

  /**
   * Purchase a skill for an agent
   * Automatically handles wallet signing and transaction submission
   */
  async purchaseSkill(agentId: string, skillId: string): Promise<PurchaseResult> {
    try {
      // Check if already purchased
      const alreadyPurchased = await this.adapter.hasAgentPurchasedSkill(
        agentId,
        skillId
      );
      if (alreadyPurchased) {
        return { success: false, error: 'Skill already purchased' };
      }

      // Get agent wallet
      const wallet = await this.adapter.getAgentWallet(agentId);
      if (!wallet) {
        return { success: false, error: 'Wallet not found' };
      }

      // Get skill price
      const price = await this.adapter.getSkillPrice(skillId);

      // Check balance
      if (wallet.balance < price) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create and submit transaction
      const txData = await this.adapter.createTransaction(
        wallet.publicKey,
        '', // recipient will be filled by adapter
        price
      );

      const signature = await this.adapter.signAndSubmitTransaction(
        txData.transaction,
        wallet.encryptedPrivateKey
      );

      // Verify transaction
      const verification = await this.adapter.verifyTransaction(signature);
      if (!verification.confirmed) {
        return { success: false, error: 'Transaction not confirmed' };
      }

      // Save purchase record
      await this.adapter.savePurchase({
        agentId,
        skillId,
        price,
        currency: 'SOL',
        txSignature: signature,
        status: 'confirmed',
      });

      // Get skill content
      const skillContent = await this.adapter.getSkillContent(skillId);

      return {
        success: true,
        transactionSignature: signature,
        skillContent,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify a transaction by signature
   */
  async verifyTransaction(signature: string): Promise<TransactionResult> {
    return this.adapter.verifyTransaction(signature);
  }

  /**
   * Get agent wallet balance
   */
  async getAgentBalance(agentId: string): Promise<number> {
    const wallet = await this.adapter.getAgentWallet(agentId);
    return wallet?.balance ?? 0;
  }

  /**
   * Get agent purchase history
   */
  async getAgentPurchases(agentId: string): Promise<Purchase[]> {
    return this.adapter.getAgentPurchases(agentId);
  }
}
