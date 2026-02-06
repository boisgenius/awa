/**
 * GET /api/agents/claim-info
 * Get claim information by token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  isValidClaimTokenFormat,
  isClaimTokenExpired,
  ErrorCodes,
  type ApiResponse,
  type ClaimInfo,
} from '@/lib/auth';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<ClaimInfo>>> {
  try {
    // Get token from query params
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Claim token is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate token format
    if (!isValidClaimTokenFormat(token)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_CLAIM_TOKEN,
            message: 'Invalid claim token format',
          },
        },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = createServiceClient();

    // Look up agent by claim token
    const { data: agent, error } = await supabase
      .from('agents')
      .select('name, verification_code, status, claim_token_expires_at')
      .eq('claim_token', token)
      .single();

    if (error || !agent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_CLAIM_TOKEN,
            message: 'Claim token not found or already used',
          },
        },
        { status: 404 }
      );
    }

    // Check if token has expired
    if (agent.claim_token_expires_at && isClaimTokenExpired(new Date(agent.claim_token_expires_at))) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.CLAIM_EXPIRED,
            message: 'Claim token has expired',
          },
        },
        { status: 410 }
      );
    }

    // Check if already claimed
    if (agent.status !== 'pending_claim') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_CLAIM_TOKEN,
            message: 'Agent has already been claimed',
          },
        },
        { status: 400 }
      );
    }

    // Return claim info
    const claimInfo: ClaimInfo = {
      agentName: agent.name,
      verificationCode: agent.verification_code,
      status: agent.status,
      expiresAt: agent.claim_token_expires_at,
    };

    return NextResponse.json({
      success: true,
      data: claimInfo,
    });
  } catch (error) {
    console.error('Claim info error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: 'An unexpected error occurred',
        },
      },
      { status: 500 }
    );
  }
}
