import { NextRequest, NextResponse } from 'next/server';

// Mock leaderboard data
const mockLeaderboardData = [
  {
    rank: 1,
    skillId: '1',
    name: 'Web Research Pro',
    author: 'ResearchLabs',
    category: 'research',
    downloads: 2340,
    volume: 1170, // SOL
    rating: 4.8,
    change: 12, // percentage change
  },
  {
    rank: 2,
    skillId: '5',
    name: 'Creative Writer',
    author: 'AIWriters',
    category: 'creative',
    downloads: 1890,
    volume: 756,
    rating: 4.7,
    change: 8,
  },
  {
    rank: 3,
    skillId: '2',
    name: 'Code Review Assistant',
    author: 'DevTools',
    category: 'coding',
    downloads: 1560,
    volume: 1248,
    rating: 4.9,
    change: -2,
  },
  {
    rank: 4,
    skillId: '6',
    name: 'Communication Hub',
    author: 'CommsAI',
    category: 'comms',
    downloads: 1200,
    volume: 840,
    rating: 4.5,
    change: 5,
  },
  {
    rank: 5,
    skillId: '3',
    name: 'Financial Analyst',
    author: 'FinanceAI',
    category: 'finance',
    downloads: 890,
    volume: 1068,
    rating: 4.6,
    change: 0,
  },
  {
    rank: 6,
    skillId: '4',
    name: 'Security Scanner',
    author: 'SecureAI',
    category: 'security',
    downloads: 340,
    volume: 204,
    rating: 4.3,
    change: 15,
  },
];

type TimeRange = '24h' | '7d' | '30d' | 'all';
type SortBy = 'downloads' | 'volume' | 'rating' | 'trending';

interface LeaderboardQuery {
  timeRange: TimeRange;
  sortBy: SortBy;
  category?: string;
  limit: number;
}

function getLeaderboard(query: LeaderboardQuery) {
  let data = [...mockLeaderboardData];

  // Filter by category
  if (query.category && query.category !== 'all') {
    data = data.filter(item => item.category === query.category);
  }

  // Sort
  switch (query.sortBy) {
    case 'downloads':
      data.sort((a, b) => b.downloads - a.downloads);
      break;
    case 'volume':
      data.sort((a, b) => b.volume - a.volume);
      break;
    case 'rating':
      data.sort((a, b) => b.rating - a.rating);
      break;
    case 'trending':
    default:
      // Trending = downloads * rating (simplified algorithm)
      data.sort((a, b) => (b.downloads * b.rating) - (a.downloads * a.rating));
  }

  // Apply time range adjustments (mock - in real app would filter by date)
  if (query.timeRange === '24h') {
    // Reduce numbers for shorter time range
    data = data.map(item => ({
      ...item,
      downloads: Math.floor(item.downloads * 0.04),
      volume: Math.floor(item.volume * 0.04),
    }));
  } else if (query.timeRange === '7d') {
    data = data.map(item => ({
      ...item,
      downloads: Math.floor(item.downloads * 0.25),
      volume: Math.floor(item.volume * 0.25),
    }));
  }

  // Re-rank after sorting
  data = data.slice(0, query.limit).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  return data;
}

/**
 * GET /api/leaderboard
 * Get skill leaderboard with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const query: LeaderboardQuery = {
    timeRange: (searchParams.get('timeRange') || '7d') as TimeRange,
    sortBy: (searchParams.get('sortBy') || 'trending') as SortBy,
    category: searchParams.get('category') || undefined,
    limit: parseInt(searchParams.get('limit') || '10'),
  };

  try {
    const leaderboard = getLeaderboard(query);

    // Calculate summary stats
    const totalVolume = leaderboard.reduce((sum, item) => sum + item.volume, 0);
    const totalDownloads = leaderboard.reduce((sum, item) => sum + item.downloads, 0);
    const avgRating = leaderboard.reduce((sum, item) => sum + item.rating, 0) / leaderboard.length;

    return NextResponse.json({
      data: leaderboard,
      meta: {
        timeRange: query.timeRange,
        sortBy: query.sortBy,
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
