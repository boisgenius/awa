import { NextRequest, NextResponse } from 'next/server';
import { SkillManager } from '@/lib/skills';
import type { SkillQuery, CreateSkillInput } from '@/lib/skills';
import { supabaseSkillAdapter } from '@/lib/skills/supabase-adapter';
import { withAuth } from '@/lib/auth/api-middleware';
import { createServiceClient } from '@/lib/supabase/server';

const skillManager = new SkillManager(supabaseSkillAdapter);

/**
 * GET /api/skills
 * List skills with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Support fetching by IDs (for saved page)
  const idsParam = searchParams.get('ids');
  if (idsParam) {
    try {
      const ids = idsParam.split(',').filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ data: [], total: 0, page: 1, limit: 20, hasMore: false });
      }
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from('skills')
        .select('*, authors(author_name)')
        .in('id', ids);

      if (error) {
        return NextResponse.json({ data: [], total: 0, page: 1, limit: 20, hasMore: false });
      }

      // Map to app types inline
      const skills = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        authorId: row.author_id || '',
        description: row.description || '',
        category: row.category,
        status: row.status,
        price: row.price,
        rating: row.rating,
        downloads: row.downloads,
        verified: row.is_verified,
        features: row.features || [],
        version: row.version,
        iconEmoji: row.icon_emoji || undefined,
        currency: row.currency,
        authorName: row.authors?.author_name || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return NextResponse.json({
        data: skills,
        total: skills.length,
        page: 1,
        limit: skills.length,
        hasMore: false,
      });
    } catch (error) {
      console.error('Error fetching skills by IDs:', error);
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
    }
  }

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

    // Get category counts
    const supabase = createServiceClient();
    const { data: countData } = await supabase
      .from('skills')
      .select('category');

    const categoryCounts: Record<string, number> = { all: 0 };
    if (countData) {
      categoryCounts.all = countData.length;
      for (const row of countData) {
        categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
      }
    }

    return NextResponse.json({
      ...result,
      categoryCounts,
    });
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
export const POST = withAuth(async (request, { agent }) => {
  try {
    const body = await request.json();

    if (!body.name || !body.description || !body.category || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields: name, description, category, price' } },
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
    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create skill' } },
      { status: 500 }
    );
  }
});
