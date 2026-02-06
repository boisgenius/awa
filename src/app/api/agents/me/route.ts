/**
 * GET /api/agents/me
 * Get current authenticated agent info
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAgentByApiKey,
  getAgentWithOwner,
  updateAgentLastActive,
  getAgentPurchaseCount,
  getAgentRecentPurchases,
} from '@/lib/agents';
import { getBalance } from '@/lib/solana';
import { isValidApiKeyFormat, ErrorCodes, type ApiResponse } from '@/lib/auth';

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
 * Extract API key from request
 */
function extractApiKey(request: NextRequest): string | null {
  const xApiKey = request.headers.get('x-api-key');
  if (xApiKey) return xApiKey;

  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<AgentInfo>>> {
  try {
    // Extract API key
    const apiKey = extractApiKey(request);

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.MISSING_AUTH,
            message: 'API key required. Use X-API-Key header or Authorization: Bearer <key>',
          },
        },
        { status: 401 }
      );
    }

    // Validate format
    if (!isValidApiKeyFormat(apiKey)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_API_KEY,
            message: 'Invalid API key format',
          },
        },
        { status: 401 }
      );
    }

    // Get agent by API key
    const agent = await getAgentByApiKey(apiKey);

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_API_KEY,
            message: 'Invalid API key',
          },
        },
        { status: 401 }
      );
    }

    // Check agent status
    if (agent.status === 'suspended') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.AGENT_SUSPENDED,
            message: 'Agent is suspended',
          },
        },
        { status: 403 }
      );
    }

    // Update last active time (fire and forget)
    updateAgentLastActive(agent.id).catch(console.error);

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

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error fetching agent info:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Failed to fetch agent info',
        },
      },
      { status: 500 }
    );
  }
}
