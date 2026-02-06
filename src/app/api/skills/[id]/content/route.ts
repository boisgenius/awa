/**
 * GET /api/skills/:id/content
 * Download skill content (requires purchase)
 */

import { NextRequest } from 'next/server';
import { getSkillContent, hasPurchased } from '@/lib/skills';
import {
  withAuth,
  successResponse,
  errorResponse,
  ErrorCodes,
} from '@/lib/auth';

interface SkillContentResponse {
  skillId: string;
  name: string;
  version: string;
  files: Array<{
    path: string;
    content: string;
    size: number;
  }>;
  checksum?: string;
}

/**
 * Extract skillId from URL path
 */
function extractSkillId(request: NextRequest): string | null {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  // /api/skills/[id]/content -> id is at index -2
  return pathParts[pathParts.length - 2] || null;
}

/**
 * GET /api/skills/:id/content
 */
export const GET = withAuth<SkillContentResponse>(
  async (request, { agent }) => {
    const skillId = extractSkillId(request);

    if (!skillId) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Skill ID is required',
        400
      );
    }

    // Check if purchased
    const purchased = await hasPurchased(agent.id, skillId);
    if (!purchased) {
      return errorResponse(
        'NOT_PURCHASED',
        'You must purchase this skill before downloading content',
        403
      );
    }

    // Get skill content
    const content = await getSkillContent(agent.id, skillId);

    if (!content) {
      return errorResponse(
        ErrorCodes.SKILL_NOT_FOUND,
        'Skill content not found',
        404
      );
    }

    // Parse content (stored as JSONB or string)
    let files: Array<{ path: string; content: string; size: number }> = [];

    if (content.content) {
      if (typeof content.content === 'string') {
        // Content is a single SKILL.md file
        files = [
          {
            path: 'SKILL.md',
            content: content.content,
            size: content.content.length,
          },
        ];
      } else if (typeof content.content === 'object') {
        // Content is JSONB with files array
        const jsonContent = content.content as { files?: Array<{ path: string; content: string; size?: number }> };
        if (jsonContent.files) {
          files = jsonContent.files.map(f => ({
            path: f.path,
            content: f.content,
            size: f.size || f.content.length,
          }));
        }
      }
    }

    return successResponse({
      skillId: content.skillId,
      name: content.name,
      version: content.version,
      files,
    });
  },
  { rateLimit: 'download' }
);
