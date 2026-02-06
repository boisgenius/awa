/**
 * DELETE /api/favorites/:skillId
 * Remove a skill from favorites
 *
 * Note: Next.js route handlers with dynamic params need special handling
 * when using middleware wrappers. We extract skillId from the URL.
 */

import { NextRequest } from 'next/server';
import { removeFavorite, isFavorited } from '@/lib/agents';
import {
  withAuth,
  errorResponse,
  successResponse,
  ErrorCodes,
} from '@/lib/auth';

/**
 * Extract skillId from URL path
 */
function extractSkillId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  // /api/favorites/[skillId] -> skillId is the last part
  return pathParts[pathParts.length - 1] || null;
}

/**
 * DELETE /api/favorites/:skillId
 */
export const DELETE = withAuth<{ removed: boolean }>(
  async (request, { agent }) => {
    const skillId = extractSkillId(request);

    if (!skillId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'skillId is required',
        400
      );
    }

    // Check if favorited
    const favorited = await isFavorited(agent.id, skillId);
    if (!favorited) {
      return errorResponse(
        'NOT_FAVORITED',
        'Skill is not in favorites',
        404
      );
    }

    // Remove favorite
    const result = await removeFavorite(agent.id, skillId);

    if (!result.success) {
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        result.error || 'Failed to remove favorite',
        500
      );
    }

    return successResponse({ removed: true });
  },
  { rateLimit: 'default' }
);
