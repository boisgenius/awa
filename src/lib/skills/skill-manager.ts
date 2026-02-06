import type {
  Skill,
  SkillQuery,
  PaginatedResult,
  CreateSkillInput,
  UpdateSkillInput,
} from './types';

export interface SkillManagerAdapter {
  getSkill(id: string): Promise<Skill | null>;
  getSkills(query: SkillQuery): Promise<PaginatedResult<Skill>>;
  createSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount' | 'downloads'>): Promise<Skill>;
  updateSkill(id: string, input: UpdateSkillInput): Promise<Skill>;
  deleteSkill(id: string): Promise<void>;
  getSkillBySlug(slug: string): Promise<Skill | null>;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export class SkillManager {
  private adapter: SkillManagerAdapter;

  constructor(adapter: SkillManagerAdapter) {
    this.adapter = adapter;
  }

  /**
   * Get a skill by ID
   */
  async getSkill(id: string): Promise<Skill | null> {
    return this.adapter.getSkill(id);
  }

  /**
   * Get a skill by slug
   */
  async getSkillBySlug(slug: string): Promise<Skill | null> {
    return this.adapter.getSkillBySlug(slug);
  }

  /**
   * Get skills with filtering, sorting, and pagination
   */
  async getSkills(query: SkillQuery): Promise<PaginatedResult<Skill>> {
    const normalizedQuery: SkillQuery = {
      ...query,
      page: query.page || DEFAULT_PAGE,
      limit: query.limit || DEFAULT_LIMIT,
    };

    return this.adapter.getSkills(normalizedQuery);
  }

  /**
   * Create a new skill
   */
  async createSkill(authorId: string, input: CreateSkillInput): Promise<Skill> {
    const slug = this.generateSlug(input.name);

    const skillData = {
      ...input,
      authorId,
      slug,
      status: 'dev' as const,
      priority: 'emerging' as const,
      verified: false,
      version: '1.0.0',
    };

    return this.adapter.createSkill(skillData);
  }

  /**
   * Update an existing skill
   */
  async updateSkill(id: string, input: UpdateSkillInput): Promise<Skill> {
    const existing = await this.adapter.getSkill(id);
    if (!existing) {
      throw new Error('Skill not found');
    }

    return this.adapter.updateSkill(id, input);
  }

  /**
   * Delete a skill
   */
  async deleteSkill(id: string): Promise<void> {
    const existing = await this.adapter.getSkill(id);
    if (!existing) {
      throw new Error('Skill not found');
    }

    return this.adapter.deleteSkill(id);
  }

  /**
   * Generate a URL-friendly slug from a name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
