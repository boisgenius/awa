import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * GET /api/skills/trending
 * Get trending skills based on recent activity
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');

  try {
    const supabase = createServiceClient();

    let query = supabase
      .from('skills')
      .select('*, authors(author_name)')
      .eq('status', 'live')
      .order('downloads', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching trending skills:', error);
      return NextResponse.json(
        { error: 'Failed to fetch trending skills' },
        { status: 500 }
      );
    }

    const skills = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      category: row.category,
      rating: row.rating,
      downloads: row.downloads,
      price: row.price,
      iconEmoji: row.icon_emoji || undefined,
      authorName: row.authors?.author_name || undefined,
      verified: row.is_verified,
      description: row.description || '',
      features: row.features || [],
      status: row.status,
      currency: row.currency,
    }));

    return NextResponse.json({
      data: skills,
      meta: {
        total: skills.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching trending skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending skills' },
      { status: 500 }
    );
  }
}
