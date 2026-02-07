import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

type TimeRange = '24h' | '7d' | '30d' | 'all';
type SortBy = 'downloads' | 'volume' | 'rating' | 'trending';

/**
 * GET /api/leaderboard
 * Get skill leaderboard with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const timeRange = (searchParams.get('timeRange') || '7d') as TimeRange;
  const sortBy = (searchParams.get('sortBy') || 'trending') as SortBy;
  const category = searchParams.get('category') || undefined;
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const supabase = createServiceClient();

    let query = supabase
      .from('skills')
      .select('*, authors(author_name)')
      .eq('status', 'live');

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Sort
    switch (sortBy) {
      case 'downloads':
        query = query.order('downloads', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'volume':
      case 'trending':
      default:
        query = query.order('downloads', { ascending: false });
        break;
    }

    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      );
    }

    const leaderboard = (data || []).map((row: any, index: number) => ({
      rank: index + 1,
      skillId: row.id,
      name: row.name,
      author: row.authors?.author_name || 'Unknown',
      category: row.category,
      downloads: row.downloads,
      volume: Math.floor(row.downloads * row.price),
      rating: row.rating,
      change: 0,
      iconEmoji: row.icon_emoji || undefined,
      verified: row.is_verified,
    }));

    const totalVolume = leaderboard.reduce((sum: number, item: any) => sum + item.volume, 0);
    const totalDownloads = leaderboard.reduce((sum: number, item: any) => sum + item.downloads, 0);
    const avgRating = leaderboard.length > 0
      ? leaderboard.reduce((sum: number, item: any) => sum + item.rating, 0) / leaderboard.length
      : 0;

    return NextResponse.json({
      data: leaderboard,
      meta: {
        timeRange,
        sortBy,
        totalVolume,
        totalDownloads,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
