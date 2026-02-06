import { NextRequest, NextResponse } from 'next/server';

// Mock trending skills data
const mockTrendingSkills = [
  {
    id: '1',
    name: 'Web Research Pro',
    slug: 'web-research-pro',
    category: 'research',
    rating: 4.8,
    downloads: 2340,
    price: 0.5,
    trendScore: 85,
    change24h: 12.5,
  },
  {
    id: '4',
    name: 'Security Scanner',
    slug: 'security-scanner',
    category: 'security',
    rating: 4.3,
    downloads: 340,
    price: 0.6,
    trendScore: 78,
    change24h: 45.2,
  },
  {
    id: '2',
    name: 'Code Review Assistant',
    slug: 'code-review-assistant',
    category: 'coding',
    rating: 4.9,
    downloads: 1560,
    price: 0.8,
    trendScore: 72,
    change24h: 8.3,
  },
  {
    id: '5',
    name: 'Creative Writer',
    slug: 'creative-writer',
    category: 'creative',
    rating: 4.7,
    downloads: 1890,
    price: 0.4,
    trendScore: 68,
    change24h: 5.7,
  },
];

/**
 * GET /api/skills/trending
 * Get trending skills based on recent activity
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10');
  const category = searchParams.get('category');

  try {
    let skills = [...mockTrendingSkills];

    // Filter by category if provided
    if (category && category !== 'all') {
      skills = skills.filter(s => s.category === category);
    }

    // Sort by trend score
    skills.sort((a, b) => b.trendScore - a.trendScore);

    // Limit results
    skills = skills.slice(0, limit);

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
