/**
 * GET /api/agents/list
 * List agents with optional sorting, filtering, and stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

interface AgentListItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  wallet_public_key: string | null;
  created_at: string;
  claimed_at: string | null;
  last_active_at: string | null;
}

interface AgentListResponse {
  success: boolean;
  data: AgentListItem[];
  stats: {
    totalAgents: number;
    activeAgents: number;
    totalSkills: number;
    totalDownloads: number;
  };
  meta: { total: number };
  error?: { message: string };
}

export async function GET(request: NextRequest): Promise<NextResponse<AgentListResponse>> {
  try {
    const sort = request.nextUrl.searchParams.get('sort') || 'recent';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50', 10);
    const status = request.nextUrl.searchParams.get('status') || 'all';

    const supabase = createServiceClient();

    // Build query
    let query = supabase
      .from('agents')
      .select('id, name, description, status, wallet_public_key, created_at, claimed_at, last_active_at');

    // Filter by status
    if (status === 'active') {
      query = query.eq('status', 'active');
    } else if (status === 'pending_claim') {
      query = query.eq('status', 'pending_claim');
    }

    // Sort
    if (sort === 'name') {
      query = query.order('name', { ascending: true });
    } else {
      // recent (default)
      query = query.order('created_at', { ascending: false });
    }

    // Limit
    query = query.limit(limit);

    const { data: agents, error } = await query;

    if (error) {
      console.error('Agent list query error:', error);
      return NextResponse.json(
        { success: false, data: [], stats: { totalAgents: 0, activeAgents: 0, totalSkills: 0, totalDownloads: 0 }, meta: { total: 0 }, error: { message: 'Failed to fetch agents' } },
        { status: 500 }
      );
    }

    // Get stats counts (agents + skills)
    const [totalResult, activeResult, skillsCountResult, downloadsResult] = await Promise.all([
      supabase.from('agents').select('id', { count: 'exact', head: true }),
      supabase.from('agents').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('skills').select('id', { count: 'exact', head: true }),
      supabase.from('skills').select('downloads'),
    ]);

    const totalAgents = totalResult.count || 0;
    const activeAgents = activeResult.count || 0;
    const totalSkills = skillsCountResult.count || 0;
    const totalDownloads = (downloadsResult.data || []).reduce(
      (sum: number, row: { downloads: number }) => sum + (row.downloads || 0),
      0
    );

    return NextResponse.json({
      success: true,
      data: agents || [],
      stats: {
        totalAgents,
        activeAgents,
        totalSkills,
        totalDownloads,
      },
      meta: { total: agents?.length || 0 },
    });
  } catch (error) {
    console.error('Agent list error:', error);
    return NextResponse.json(
      { success: false, data: [], stats: { totalAgents: 0, activeAgents: 0, totalSkills: 0, totalDownloads: 0 }, meta: { total: 0 }, error: { message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
