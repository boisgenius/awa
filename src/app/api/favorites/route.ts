/**
 * Favorites API
 * GET /api/favorites - Get agent's favorites
 * POST /api/favorites - Add a favorite
 */

import { NextRequest } from 'next/server';
import { getAgentFavorites, addFavorite } from '@/lib/agents';
import {
  withAuth,
  errorResponse,
  successResponse,
  ErrorCodes,
} from '@/lib/auth';
import type { FavoriteSkill } from '@/lib/agents';

interface FavoritesResponse {
  favorites: FavoriteSkill[];
  total: number;
}

interface AddFavoriteResponse {
  skillId: string;
  addedAt: string;
}

/**
 * GET /api/favorites
 * Get agent's favorite skills
 */
export const GET = withAuth<FavoritesResponse>(
  async (_request, { agent }) => {
    const favorites = await getAgentFavorites(agent.id);

    return successResponse({
      favorites,
      total: favorites.length,
    });
  },
  { rateLimit: 'browse' }
);

/**
 * POST /api/favorites
 * Add a skill to favorites
 */
export const POST = withAuth<AddFavoriteResponse>(
  async (request: NextRequest, { agent }) => {
    // Parse body
    let body: { skillId?: string };
    try {
      body = await request.json();
    } catch {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Invalid JSON body',
        400
      );
    }

    if (!body.skillId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'skillId is required',
        400
      );
    }

    // Add favorite
    const result = await addFavorite(agent.id, body.skillId);

    if (!result.success) {
      const status = result.error === 'Skill not found' ? 404 : 409;
      return errorResponse(
        result.error === 'Skill not found' ? ErrorCodes.SKILL_NOT_FOUND : 'ALREADY_FAVORITED',
        result.error || 'Failed to add favorite',
        status
      );
    }

    return successResponse(
      {
        skillId: body.skillId,
        addedAt: new Date().toISOString(),
      },
      201
    );
  },
  { rateLimit: 'default' }
);
