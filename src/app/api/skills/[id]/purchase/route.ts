/**
 * POST /api/skills/:id/purchase
 * Purchase a skill
 */

import { NextRequest } from 'next/server';
import { purchaseSkill, hasPurchased, getSkillForPurchase } from '@/lib/skills';
import {
  withAuth,
  successResponse,
  errorResponse,
  ErrorCodes,
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

/**
 * Extract skillId from URL path
 */
function extractSkillId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  // /api/skills/[id]/purchase -> id is at index -2
  return pathParts[pathParts.length - 2] || null;
}

/**
 * POST /api/skills/:id/purchase
 */
export const POST = withAuth<PurchaseResponse>(
  async (request, { agent }) => {
    const skillId = extractSkillId(request);

    if (!skillId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Skill ID is required',
        400
      );
    }

    // Check if already purchased
    const alreadyPurchased = await hasPurchased(agent.id, skillId);
    if (alreadyPurchased) {
      return errorResponse(
        ErrorCodes.ALREADY_PURCHASED,
        'You have already purchased this skill',
        409
      );
    }

    // Get skill info
    const skill = await getSkillForPurchase(skillId);
    if (!skill) {
      return errorResponse(
        ErrorCodes.SKILL_NOT_FOUND,
        'Skill not found or not available for purchase',
        404
      );
    }

    // Execute purchase
    const result = await purchaseSkill(agent.id, skillId);

    if (!result.success) {
      const statusCode = result.error?.includes('Insufficient balance') ? 402 : 400;
      return errorResponse(
        result.error?.includes('Insufficient balance')
          ? ErrorCodes.INSUFFICIENT_BALANCE
          : ErrorCodes.INTERNAL_ERROR,
        result.error || 'Purchase failed',
        statusCode
      );
    }

    return successResponse(
      {
        purchaseId: result.purchaseId!,
        skillId: skill.id,
        skillName: skill.name,
        price: skill.price,
        currency: skill.currency,
        txSignature: result.txSignature,
        purchasedAt: new Date().toISOString(),
      },
      201
    );
  },
  { rateLimit: 'purchase' }
);
