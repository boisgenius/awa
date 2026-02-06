/**
 * GET /api/agents/purchases
 * Get current agent's purchase history
 */

import { getAgentPurchases } from '@/lib/agents';
import { withAuth, successResponse } from '@/lib/auth';

interface PurchaseItem {
  id: string;
  skill: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    category: string;
    version: string;
  } | null;
  price: number;
  currency: string;
  txSignature: string | null;
  status: string;
  createdAt: string;
  confirmedAt: string | null;
}

interface PurchasesResponse {
  purchases: PurchaseItem[];
  total: number;
}

/**
 * GET /api/agents/purchases
 */
export const GET = withAuth<PurchasesResponse>(
  async (_request, { agent }) => {
    const purchases = await getAgentPurchases(agent.id);

    return successResponse({
      purchases: purchases.map(p => ({
        id: p.id,
        skill: p.skill,
        price: p.price,
        currency: p.currency,
        txSignature: p.txSignature,
        status: p.status,
        createdAt: p.createdAt,
        confirmedAt: p.confirmedAt,
      })),
      total: purchases.length,
    });
  },
  { rateLimit: 'browse' }
);
