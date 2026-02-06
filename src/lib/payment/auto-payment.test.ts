import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AutoPaymentService, PaymentServiceAdapter } from './auto-payment';
import type { PurchaseResult, Purchase, PaymentToken } from './types';

describe('AutoPaymentService', () => {
  let paymentService: AutoPaymentService;
  let mockAdapter: PaymentServiceAdapter;

  const mockPurchase: Purchase = {
    id: 'purchase-123',
    agentId: 'agent-1',
    skillId: 'skill-1',
    price: 0.5,
    currency: 'SOL',
    txSignature: 'sig123456',
    status: 'confirmed',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockAdapter = {
      getAgentWallet: vi.fn(),
      getSkillPrice: vi.fn(),
      createTransaction: vi.fn(),
      signAndSubmitTransaction: vi.fn(),
      verifyTransaction: vi.fn(),
      savePurchase: vi.fn(),
      getAgentPurchases: vi.fn(),
      hasAgentPurchasedSkill: vi.fn(),
      getSkillContent: vi.fn(),
    };
    paymentService = new AutoPaymentService(mockAdapter);
  });

  describe('purchaseSkill', () => {
    it('should successfully purchase a skill', async () => {
      vi.mocked(mockAdapter.hasAgentPurchasedSkill).mockResolvedValue(false);
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue({
        publicKey: 'wallet123',
        encryptedPrivateKey: 'encrypted',
        balance: 10,
      });
      vi.mocked(mockAdapter.getSkillPrice).mockResolvedValue(0.5);
      vi.mocked(mockAdapter.createTransaction).mockResolvedValue({
        transaction: 'tx-data',
        recipient: 'seller-wallet',
      });
      vi.mocked(mockAdapter.signAndSubmitTransaction).mockResolvedValue('sig123456');
      vi.mocked(mockAdapter.verifyTransaction).mockResolvedValue({
        confirmed: true,
        signature: 'sig123456',
      });
      vi.mocked(mockAdapter.savePurchase).mockResolvedValue(mockPurchase);
      vi.mocked(mockAdapter.getSkillContent).mockResolvedValue('skill content here');

      const result = await paymentService.purchaseSkill('agent-1', 'skill-1');

      expect(result.success).toBe(true);
      expect(result.transactionSignature).toBe('sig123456');
      expect(result.skillContent).toBe('skill content here');
    });

    it('should return error if already purchased', async () => {
      vi.mocked(mockAdapter.hasAgentPurchasedSkill).mockResolvedValue(true);

      const result = await paymentService.purchaseSkill('agent-1', 'skill-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Skill already purchased');
    });

    it('should return error if wallet not found', async () => {
      vi.mocked(mockAdapter.hasAgentPurchasedSkill).mockResolvedValue(false);
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue(null);

      const result = await paymentService.purchaseSkill('agent-1', 'skill-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Wallet not found');
    });

    it('should return error if insufficient balance', async () => {
      vi.mocked(mockAdapter.hasAgentPurchasedSkill).mockResolvedValue(false);
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue({
        publicKey: 'wallet123',
        encryptedPrivateKey: 'encrypted',
        balance: 0.1,
      });
      vi.mocked(mockAdapter.getSkillPrice).mockResolvedValue(0.5);

      const result = await paymentService.purchaseSkill('agent-1', 'skill-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Insufficient balance');
    });

    it('should return error if transaction fails', async () => {
      vi.mocked(mockAdapter.hasAgentPurchasedSkill).mockResolvedValue(false);
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue({
        publicKey: 'wallet123',
        encryptedPrivateKey: 'encrypted',
        balance: 10,
      });
      vi.mocked(mockAdapter.getSkillPrice).mockResolvedValue(0.5);
      vi.mocked(mockAdapter.createTransaction).mockResolvedValue({
        transaction: 'tx-data',
        recipient: 'seller-wallet',
      });
      vi.mocked(mockAdapter.signAndSubmitTransaction).mockRejectedValue(
        new Error('Transaction failed')
      );

      const result = await paymentService.purchaseSkill('agent-1', 'skill-1');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Transaction failed');
    });
  });

  describe('verifyTransaction', () => {
    it('should verify a confirmed transaction', async () => {
      vi.mocked(mockAdapter.verifyTransaction).mockResolvedValue({
        confirmed: true,
        signature: 'sig123',
        slot: 12345,
      });

      const result = await paymentService.verifyTransaction('sig123');

      expect(result.confirmed).toBe(true);
      expect(result.signature).toBe('sig123');
    });

    it('should return unconfirmed for failed transaction', async () => {
      vi.mocked(mockAdapter.verifyTransaction).mockResolvedValue({
        confirmed: false,
        signature: 'sig123',
        error: 'Transaction not found',
      });

      const result = await paymentService.verifyTransaction('sig123');

      expect(result.confirmed).toBe(false);
    });
  });

  describe('getAgentBalance', () => {
    it('should return agent wallet balance', async () => {
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue({
        publicKey: 'wallet123',
        encryptedPrivateKey: 'encrypted',
        balance: 5.5,
      });

      const result = await paymentService.getAgentBalance('agent-1');

      expect(result).toBe(5.5);
    });

    it('should return 0 if no wallet', async () => {
      vi.mocked(mockAdapter.getAgentWallet).mockResolvedValue(null);

      const result = await paymentService.getAgentBalance('agent-1');

      expect(result).toBe(0);
    });
  });

  describe('getAgentPurchases', () => {
    it('should return list of purchases', async () => {
      vi.mocked(mockAdapter.getAgentPurchases).mockResolvedValue([mockPurchase]);

      const result = await paymentService.getAgentPurchases('agent-1');

      expect(result).toEqual([mockPurchase]);
      expect(mockAdapter.getAgentPurchases).toHaveBeenCalledWith('agent-1');
    });
  });
});
