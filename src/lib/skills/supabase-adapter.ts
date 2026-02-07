import { createServiceClient } from '@/lib/supabase/server';
import type { Skill as DbSkill } from '@/lib/supabase/database.types';
import type { SkillManagerAdapter } from './skill-manager';
import type { Skill, SkillQuery, PaginatedResult, UpdateSkillInput } from './types';

function mapDbSkillToSkill(row: DbSkill & { authors?: { author_name: string } | null }): Skill {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    authorId: row.author_id || '',
    description: row.description || '',
    category: row.category,
    status: row.status,
    priority: 'medium',
    price: row.price,
    rating: row.rating,
    ratingCount: 0,
    downloads: row.downloads,
    verified: row.is_verified,
    features: row.features || [],
    content: typeof row.content === 'string' ? row.content : JSON.stringify(row.content || ''),
    version: row.version,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    iconEmoji: row.icon_emoji || undefined,
    currency: row.currency,
    authorName: row.authors?.author_name || undefined,
  };
}

export const supabaseSkillAdapter: SkillManagerAdapter = {
  async getSkill(id: string): Promise<Skill | null> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('skills')
      .select('*, authors(author_name)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapDbSkillToSkill(data as DbSkill & { authors: { author_name: string } | null });
  },

  async getSkillBySlug(slug: string): Promise<Skill | null> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('skills')
      .select('*, authors(author_name)')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return mapDbSkillToSkill(data as DbSkill & { authors: { author_name: string } | null });
  },

  async getSkills(query: SkillQuery): Promise<PaginatedResult<Skill>> {
    const supabase = createServiceClient();
    const page = query.page || 1;
    const limit = query.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let q = supabase
      .from('skills')
      .select('*, authors(author_name)', { count: 'exact' });

    if (query.category) {
      q = q.eq('category', query.category);
    }
    if (query.status) {
      q = q.eq('status', query.status);
    }
    if (query.search) {
      q = q.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%`);
    }

    // Sort
    switch (query.sort) {
      case 'newest':
        q = q.order('created_at', { ascending: false });
        break;
      case 'rating':
        q = q.order('rating', { ascending: false });
        break;
      case 'downloads':
        q = q.order('downloads', { ascending: false });
        break;
      case 'trending':
      default:
        // trending = downloads * rating approximation — sort by downloads desc as primary
        q = q.order('downloads', { ascending: false });
        break;
    }

    q = q.range(from, to);

    const { data, count, error } = await q;

    if (error) {
      console.error('Error fetching skills:', error);
      return { data: [], total: 0, page, limit, hasMore: false };
    }

    const skills = (data || []).map((row: any) => mapDbSkillToSkill(row));
    const total = count || 0;

    return {
      data: skills,
      total,
      page,
      limit,
      hasMore: from + limit < total,
    };
  },

  async createSkill(skillData: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount' | 'downloads'>): Promise<Skill> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('skills')
      .insert({
        name: skillData.name,
        slug: skillData.slug,
        description: skillData.description,
        author_id: skillData.authorId,
        category: skillData.category,
        status: skillData.status,
        price: skillData.price,
        currency: (skillData.currency as any) || 'SOL',
        content: skillData.content ? { files: [], checksum: '' } : null,
        version: skillData.version,
        icon_emoji: skillData.iconEmoji || null,
        features: skillData.features,
        is_verified: skillData.verified,
        rating: 0,
        downloads: 0,
      })
      .select('*, authors(author_name)')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create skill');
    }

    return mapDbSkillToSkill(data as DbSkill & { authors: { author_name: string } | null });
  },

  async updateSkill(id: string, input: UpdateSkillInput): Promise<Skill> {
    const supabase = createServiceClient();

    const updateData: Record<string, any> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.price !== undefined) updateData.price = input.price;
    if (input.features !== undefined) updateData.features = input.features;
    if (input.content !== undefined) updateData.content = input.content ? { files: [], checksum: '' } : null;

    const { data, error } = await supabase
      .from('skills')
      .update(updateData)
      .eq('id', id)
      .select('*, authors(author_name)')
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update skill');
    }

    return mapDbSkillToSkill(data as DbSkill & { authors: { author_name: string } | null });
  },

  async deleteSkill(id: string): Promise<void> {
    const supabase = createServiceClient();
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
