import { NextRequest, NextResponse } from 'next/server';
import { getAgentWithOwner, getAgentPurchaseCount } from '@/lib/agents/service';

interface RouteParams {
  params: { id: string };
}

/**
 * GET /api/agents/[id]
 * Get agent details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const agent = await getAgentWithOwner(params.id);

    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const purchaseCount = await getAgentPurchaseCount(params.id);

    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      status: agent.status,
      walletPublicKey: agent.walletPublicKey,
      owner: agent.owner,
      createdAt: agent.createdAt,
      claimedAt: agent.claimedAt,
      lastActiveAt: agent.lastActiveAt,
      purchaseCount,
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}
