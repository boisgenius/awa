import { NextRequest, NextResponse } from 'next/server';
import { SkillManager, type SkillManagerAdapter } from '@/lib/skills';
import type { Skill, SkillQuery, CreateSkillInput, UpdateSkillInput, PaginatedResult } from '@/lib/skills';
import { createAuthMiddleware } from '@/lib/auth';

// Mock data store
const skillsStore = new Map<string, Skill>([
  ['1', {
    id: '1',
    name: 'Web Research Pro',
    slug: 'web-research-pro',
    authorId: 'author-1',
    description: 'Advanced web research and information gathering capabilities.',
    category: 'research',
    status: 'live',
    priority: 'high',
    price: 0.5,
    rating: 4.8,
    ratingCount: 156,
    downloads: 2340,
    verified: true,
    features: ['Search', 'Summarize', 'Extract', 'Verify'],
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
    description: 'Automated code review with best practices.',
    category: 'coding',
    status: 'live',
    priority: 'high',
    price: 0.8,
    rating: 4.9,
    ratingCount: 89,
    downloads: 1560,
    verified: true,
    features: ['Review', 'Security', 'Performance'],
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
    let skills = Array.from(skillsStore.values());

    if (query.category) {
      skills = skills.filter(s => s.category === query.category);
    }
    if (query.status) {
      skills = skills.filter(s => s.status === query.status);
    }
    if (query.search) {
      const search = query.search.toLowerCase();
      skills = skills.filter(s =>
        s.name.toLowerCase().includes(search) ||
        s.description.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (query.sort) {
      case 'newest':
        skills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'rating':
        skills.sort((a, b) => b.rating - a.rating);
        break;
      case 'downloads':
        skills.sort((a, b) => b.downloads - a.downloads);
        break;
      default: // trending
        skills.sort((a, b) => (b.downloads * b.rating) - (a.downloads * a.rating));
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedSkills = skills.slice(start, end);

    return {
      data: paginatedSkills,
      total: skills.length,
      page,
      limit,
      hasMore: end < skills.length,
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

// Mock auth validator - returns agent if API key starts with 'claw_'
async function mockValidateApiKey(key: string) {
  if (key.startsWith('claw_')) {
    return {
      id: 'agent-1',
      name: 'Test Agent',
      apiKeyHash: 'hash',
      apiKeyPrefix: 'claw_sk_',
      walletPublicKey: 'wallet-public-key',
      walletEncryptedKey: 'encrypted',
      status: 'active' as const,
      createdAt: new Date(),
    };
  }
  return null;
}

const authMiddleware = createAuthMiddleware(mockValidateApiKey);

/**
 * GET /api/skills
 * List skills with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query: SkillQuery = {
    category: searchParams.get('category') as any || undefined,
    status: searchParams.get('status') as any || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') as any || 'trending',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  };

  try {
    const result = await skillManager.getSkills(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/skills
 * Create a new skill (requires authentication)
 */
export const POST = authMiddleware(async (request, { agent }) => {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.description || !body.category || body.price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, category, price' },
        { status: 400 }
      );
    }

    const input: CreateSkillInput = {
      name: body.name,
      description: body.description,
      category: body.category,
      price: body.price,
      features: body.features || [],
      content: body.content || '',
    };

    const skill = await skillManager.createSkill(agent.id, input);
    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
});
