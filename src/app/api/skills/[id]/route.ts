import { NextRequest, NextResponse } from 'next/server';
import { SkillManager } from '@/lib/skills';
import type { UpdateSkillInput } from '@/lib/skills';
import { supabaseSkillAdapter } from '@/lib/skills/supabase-adapter';
import { extractApiKey, errorResponse, successResponse } from '@/lib/auth/api-middleware';
import { getAgentByApiKey } from '@/lib/agents';

const skillManager = new SkillManager(supabaseSkillAdapter);

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/skills/[id]
 * Get a single skill by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const skill = await skillManager.getSkill(params.id);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/skills/[id]
 * Update a skill (requires authentication and ownership)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return errorResponse('MISSING_AUTH', 'API key required', 401);
  }

  const agent = await getAgentByApiKey(apiKey);
  if (!agent) {
    return errorResponse('INVALID_API_KEY', 'Invalid API key', 401);
  }

  try {
    const skill = await skillManager.getSkill(params.id);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    if (skill.authorId !== agent.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this skill' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const input: UpdateSkillInput = {};

    if (body.name !== undefined) input.name = body.name;
    if (body.description !== undefined) input.description = body.description;
    if (body.category !== undefined) input.category = body.category;
    if (body.status !== undefined) input.status = body.status;
    if (body.price !== undefined) input.price = body.price;
    if (body.features !== undefined) input.features = body.features;
    if (body.content !== undefined) input.content = body.content;

    const updated = await skillManager.updateSkill(params.id, input);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating skill:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/skills/[id]
 * Delete a skill (requires authentication and ownership)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return errorResponse('MISSING_AUTH', 'API key required', 401);
  }

  const agent = await getAgentByApiKey(apiKey);
  if (!agent) {
    return errorResponse('INVALID_API_KEY', 'Invalid API key', 401);
  }

  try {
    const skill = await skillManager.getSkill(params.id);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    if (skill.authorId !== agent.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this skill' },
        { status: 403 }
      );
    }

    await skillManager.deleteSkill(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
