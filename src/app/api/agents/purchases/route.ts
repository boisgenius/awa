/**
 * GET /api/agents/purchases
 * Get current agent's purchase history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey, getAgentPurchases } from '@/lib/agents';
import {
  isValidApiKeyFormat,
  getRateLimiter,
  createRateLimitHeaders,
  ErrorCodes,
  type ApiResponse,
} from '@/lib/auth';

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

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<PurchasesResponse>>> {
  try {
    // Extract and validate API key
    const apiKey = extractApiKey(request);

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.MISSING_AUTH,
            message: 'API key required',
          },
        },
        { status: 401 }
      );
    }

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

    // Get agent
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
    if (agent.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.AGENT_NOT_ACTIVE,
            message: 'Agent must be active to view purchases',
          },
        },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimiter = getRateLimiter();
    const rateLimitResult = rateLimiter.consume(`browse:${agent.id}`, 'browse');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMITED,
            message: 'Too many requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Get purchases
    const purchases = await getAgentPurchases(agent.id);

    const response: PurchasesResponse = {
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
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      {
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'Failed to fetch purchases',
        },
      },
      { status: 500 }
    );
  }
}
