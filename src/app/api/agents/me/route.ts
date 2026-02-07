/**
 * GET /api/agents/me
 * Get current authenticated agent info
 */

import {
  getAgentWithOwner,
  getAgentPurchaseCount,
  getAgentRecentPurchases,
} from '@/lib/agents';
import { getBalance } from '@/lib/solana';
import { withAuth, successResponse, errorResponse, ErrorCodes } from '@/lib/auth';

interface AgentInfo {
  id: string;
  name: string;
  description: string | null;
  status: string;
  wallet: {
    publicKey: string;
    balance: number;
    currency: string;
  };
  owner: {
    twitterHandle: string | null;
    displayName: string | null;
  } | null;
  stats: {
    purchaseCount: number;
  };
  recentPurchases: Array<{
    id: string;
    skillId: string;
    skillName: string;
    skillIcon: string | null;
    price: number;
    currency: string;
    purchasedAt: string;
  }>;
  createdAt: string;
  claimedAt: string | null;
  lastActiveAt: string | null;
}

/**
 * GET /api/agents/me
 */
export const GET = withAuth<AgentInfo>(
  async (_request, { agent }) => {
    // Check if suspended (we allow viewing info but return error)
    if (agent.status === 'suspended') {
      return errorResponse(
        ErrorCodes.AGENT_SUSPENDED,
        'Agent is suspended',
        403
      );
    }

    // Get additional info in parallel
    const [agentWithOwner, purchaseCount, recentPurchases, balance] = await Promise.all([
      getAgentWithOwner(agent.id),
      getAgentPurchaseCount(agent.id),
      getAgentRecentPurchases(agent.id, 5),
      getBalance(agent.walletPublicKey).catch(() => 0),
    ]);

    const response: AgentInfo = {
      id: agent.id,
      name: agent.name,
      description: agent.description || null,
      status: agent.status,
      wallet: {
        publicKey: agent.walletPublicKey,
        balance,
        currency: 'SOL',
      },
      owner: agentWithOwner?.owner || null,
      stats: {
        purchaseCount,
      },
      recentPurchases: recentPurchases.map(p => ({
        id: p.id,
        skillId: p.skillId,
        skillName: p.skillName,
        skillIcon: p.skillIcon,
        price: p.price,
        currency: p.currency,
        purchasedAt: p.purchasedAt,
      })),
      createdAt: agent.createdAt.toISOString(),
      claimedAt: agent.claimedAt?.toISOString() || null,
      lastActiveAt: agent.lastSeenAt?.toISOString() || null,
    };

    return successResponse(response);
  },
  { requireActive: false, rateLimit: 'browse' }
);
