/**
 * GET /api/skills/:id/content
 * Download skill content (requires purchase)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey } from '@/lib/agents';
import { getSkillContent, hasPurchased } from '@/lib/skills';
import {
  isValidApiKeyFormat,
  getRateLimiter,
  createRateLimitHeaders,
  ErrorCodes,
  type ApiResponse,
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

export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<SkillContentResponse>>> {
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
            message: 'Agent must be active to download content',
          },
        },
        { status: 403 }
      );
    }

    // Rate limiting
    const rateLimiter = getRateLimiter();
    const rateLimitResult = rateLimiter.consume(`download:${agent.id}`, 'download');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMITED,
            message: 'Too many download requests. Please try again later.',
          },
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Check if purchased
    const purchased = await hasPurchased(agent.id, skillId);
    if (!purchased) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_PURCHASED',
            message: 'You must purchase this skill before downloading content',
          },
        },
        { status: 403 }
      );
    }

    // Get skill content
    const content = await getSkillContent(agent.id, skillId);

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.SKILL_NOT_FOUND,
            message: 'Skill content not found',
          },
        },
        { status: 404 }
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

    // Return content
    const response: SkillContentResponse = {
      skillId: content.skillId,
      name: content.name,
      version: content.version,
      files,
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
    console.error('Content download error:', error);
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
