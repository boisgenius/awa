/**
 * POST /api/skills/:id/purchase
 * Purchase a skill
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey } from '@/lib/agents';
import { purchaseSkill, hasPurchased, getSkillForPurchase } from '@/lib/skills';
import {
  isValidApiKeyFormat,
  getRateLimiter,
  createRateLimitHeaders,
  ErrorCodes,
  type ApiResponse,
} from '@/lib/auth';

interface PurchaseResponse {
  purchaseId: string;
  skillId: string;
  skillName: string;
  price: number;
  currency: string;
  txSignature?: string;
  purchasedAt: string;
}

interface RouteContext {
  params: Promise<{ id: string }>;
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

export async function POST(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<PurchaseResponse>>> {
  try {
    const params = await context.params;
    const skillId = params.id;

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
            message: 'Agent must be active to make purchases',
          },
        },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimiter = getRateLimiter();
    const rateLimitResult = rateLimiter.consume(`purchase:${agent.id}`, 'purchase');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMITED,
            message: 'Too many purchase attempts. Please try again later.',
          },
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Check if already purchased
    const alreadyPurchased = await hasPurchased(agent.id, skillId);
    if (alreadyPurchased) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.ALREADY_PURCHASED,
            message: 'You have already purchased this skill',
          },
        },
        { status: 409 }
      );
    }

    // Get skill info
    const skill = await getSkillForPurchase(skillId);
    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.SKILL_NOT_FOUND,
            message: 'Skill not found or not available for purchase',
          },
        },
        { status: 404 }
      );
    }

    // Execute purchase
    const result = await purchaseSkill(agent.id, skillId);

    if (!result.success) {
      // Determine appropriate status code
      const statusCode = result.error?.includes('Insufficient balance') ? 402 : 400;

      return NextResponse.json(
        {
          success: false,
          error: {
            code: result.error?.includes('Insufficient balance')
              ? ErrorCodes.INSUFFICIENT_BALANCE
              : ErrorCodes.INTERNAL_ERROR,
            message: result.error || 'Purchase failed',
          },
        },
        { status: statusCode }
      );
    }

    // Return success response
    const response: PurchaseResponse = {
      purchaseId: result.purchaseId!,
      skillId: skill.id,
      skillName: skill.name,
      price: skill.price,
      currency: skill.currency,
      txSignature: result.txSignature,
      purchasedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: response,
      },
      {
        status: 201,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
