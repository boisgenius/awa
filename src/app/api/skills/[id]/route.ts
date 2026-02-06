import { NextRequest, NextResponse } from 'next/server';
import { SkillManager, type SkillManagerAdapter } from '@/lib/skills';
import type { Skill, SkillQuery, UpdateSkillInput, PaginatedResult } from '@/lib/skills';
import { createAuthMiddleware } from '@/lib/auth';

// Mock data store (shared with parent route in production)
const skillsStore = new Map<string, Skill>([
  ['1', {
    id: '1',
    name: 'Web Research Pro',
    slug: 'web-research-pro',
    authorId: 'author-1',
    description: 'Advanced web research and information gathering capabilities with multi-source verification.',
    category: 'research',
    status: 'live',
    priority: 'high',
    price: 0.5,
    rating: 4.8,
    ratingCount: 156,
    downloads: 2340,
    verified: true,
    features: ['Multi-source Search', 'Fact Verification', 'Data Extraction', 'Report Generation'],
    content: 'skill content here',
    version: '2.1.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  }],
  ['2', {
    id: '2',
    name: 'Code Review Assistant',
    slug: 'code-review-assistant',
    authorId: 'author-2',
    description: 'Automated code review with best practices enforcement and security vulnerability detection.',
    category: 'coding',
    status: 'live',
    priority: 'high',
    price: 0.8,
    rating: 4.9,
    ratingCount: 89,
    downloads: 1560,
    verified: true,
    features: ['Review', 'Security', 'Performance', 'Style'],
    content: 'skill content here',
    version: '1.5.0',
    createdAt: new Date(),
    updatedAt: new Date(),
  }],
]);

// Mock adapter implementing SkillManagerAdapter
const mockSkillAdapter: SkillManagerAdapter = {
  async getSkill(id: string): Promise<Skill | null> {
    return skillsStore.get(id) || null;
  },

  async getSkillBySlug(slug: string): Promise<Skill | null> {
    const skills = Array.from(skillsStore.values());
    for (const skill of skills) {
      if (skill.slug === slug) return skill;
    }
    return null;
  },

  async getSkills(query: SkillQuery): Promise<PaginatedResult<Skill>> {
    return {
      data: Array.from(skillsStore.values()),
      total: skillsStore.size,
      page: 1,
      limit: 20,
      hasMore: false,
    };
  },

  async createSkill(skillData: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount' | 'downloads'>): Promise<Skill> {
    const id = crypto.randomUUID();
    const skill: Skill = {
      ...skillData,
      id,
      rating: 0,
      ratingCount: 0,
      downloads: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    skillsStore.set(id, skill);
    return skill;
  },

  async updateSkill(id: string, input: UpdateSkillInput): Promise<Skill> {
    const skill = skillsStore.get(id);
    if (!skill) throw new Error('Skill not found');
    const updated: Skill = { ...skill, ...input, updatedAt: new Date() };
    skillsStore.set(id, updated);
    return updated;
  },

  async deleteSkill(id: string): Promise<void> {
    skillsStore.delete(id);
  },
};

const skillManager = new SkillManager(mockSkillAdapter);

// Mock auth validator
async function mockValidateApiKey(key: string) {
  if (key.startsWith('claw_')) {
    return {
      id: 'agent-1',
      name: 'Test Agent',
      apiKeyHash: 'hash',
      apiKeyPrefix: 'claw_',
      walletPublicKey: 'wallet-public-key',
      walletEncryptedKey: 'encrypted',
      isActive: true,
      createdAt: new Date(),
    };
  }
  return null;
}

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
  // Wrap with auth middleware manually for dynamic routes
  const apiKey = request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    );
  }

  const agent = await mockValidateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  try {
    const skill = await skillManager.getSkill(params.id);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check ownership
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
  const apiKey = request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required' },
      { status: 401 }
    );
  }

  const agent = await mockValidateApiKey(apiKey);
  if (!agent) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }

  try {
    const skill = await skillManager.getSkill(params.id);

    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    // Check ownership
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
