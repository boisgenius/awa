/**
 * POST /api/agents/claim
 * Verify agent ownership via Twitter
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  isValidClaimTokenFormat,
  isClaimTokenExpired,
  getRateLimiter,
  createRateLimitHeaders,
  ErrorCodes,
  type ApiResponse,
  type ClaimRequest,
  type ClaimResult,
  type TweetVerification,
} from '@/lib/auth';

/**
 * Parse Twitter URL and extract tweet ID
 */
function parseTweetUrl(url: string): { tweetId: string; username: string } | null {
  try {
    const parsed = new URL(url);

    // Support twitter.com and x.com
    if (!parsed.hostname.includes('twitter.com') && !parsed.hostname.includes('x.com')) {
      return null;
    }

    // Extract tweet ID from path like /username/status/123456789
    const match = parsed.pathname.match(/\/([^/]+)\/status\/(\d+)/);
    if (!match) {
      return null;
    }

    return {
      username: match[1],
      tweetId: match[2],
    };
  } catch {
    return null;
  }
}

/**
 * Verify tweet content contains verification code
 * Note: In production, this should use Twitter API to fetch actual tweet content
 */
async function verifyTweet(
  tweetUrl: string,
  verificationCode: string
): Promise<TweetVerification> {
  // Parse the tweet URL
  const parsed = parseTweetUrl(tweetUrl);
  if (!parsed) {
    return {
      isValid: false,
      error: 'Invalid tweet URL format',
    };
  }

  // In production, use Twitter API to verify tweet content
  // For now, we'll do a basic validation and trust the user
  // TODO: Implement actual Twitter API verification

  const twitterBearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (twitterBearerToken) {
    try {
      // Fetch tweet from Twitter API
      const response = await fetch(
        `https://api.twitter.com/2/tweets/${parsed.tweetId}?expansions=author_id&user.fields=username`,
        {
          headers: {
            Authorization: `Bearer ${twitterBearerToken}`,
          },
        }
      );

      if (!response.ok) {
        return {
          isValid: false,
          error: 'Could not fetch tweet',
        };
      }

      const data = await response.json();

      // Verify tweet text contains verification code
      const tweetText = data.data?.text || '';
      if (!tweetText.includes(verificationCode)) {
        return {
          isValid: false,
          error: 'Verification code not found in tweet',
        };
      }

      // Verify tweet mentions ClawAcademy
      if (!tweetText.toLowerCase().includes('clawacademy')) {
        return {
          isValid: false,
          error: 'Tweet must mention ClawAcademy',
        };
      }

      // Get author info
      const author = data.includes?.users?.[0];

      return {
        isValid: true,
        twitterId: data.data.author_id,
        twitterHandle: author?.username || parsed.username,
      };
    } catch (error) {
      console.error('Twitter API error:', error);
      return {
        isValid: false,
        error: 'Failed to verify tweet via Twitter API',
      };
    }
  }

  // Fallback: Accept without verification (development mode)
  // In production, you should require Twitter API verification
  console.warn('Twitter API not configured - accepting claim without verification');
  return {
    isValid: true,
    twitterId: `mock_${parsed.username}`,
    twitterHandle: parsed.username,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ClaimResult>>> {
  try {
    // Rate limiting
    const rateLimiter = getRateLimiter();
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimiter.consume(`claim:${clientIp}`, 'claim');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMITED,
            message: 'Too many claim attempts. Please try again later.',
          },
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse request body
    let body: ClaimRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid JSON body',
          },
        },
        { status: 400 }
      );
    }

    const { claimToken, tweetUrl } = body;

    // Validate inputs
    if (!claimToken || !tweetUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'claimToken and tweetUrl are required',
          },
        },
        { status: 400 }
      );
    }

    // Validate claim token format
    if (!isValidClaimTokenFormat(claimToken)) {
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
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('id, name, verification_code, status, claim_token_expires_at')
      .eq('claim_token', claimToken)
      .single();

    if (fetchError || !agent) {
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

    // Verify tweet
    const verification = await verifyTweet(tweetUrl, agent.verification_code);

    if (!verification.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VERIFICATION_FAILED,
            message: verification.error || 'Tweet verification failed',
          },
        },
        { status: 400 }
      );
    }

    // Create or get user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('twitter_id', verification.twitterId)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          twitter_id: verification.twitterId,
          twitter_handle: verification.twitterHandle,
          twitter_verified_at: new Date().toISOString(),
          display_name: verification.twitterHandle,
        })
        .select('id')
        .single();

      if (userError || !newUser) {
        console.error('Failed to create user:', userError);
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCodes.INTERNAL_ERROR,
              message: 'Failed to create user account',
            },
          },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // Update agent with owner info and clear claim token
    const claimedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('agents')
      .update({
        owner_id: userId,
        status: 'active',
        claim_token: null,
        claim_token_expires_at: null,
        verification_code: null,
        claimed_at: claimedAt,
      })
      .eq('id', agent.id);

    if (updateError) {
      console.error('Failed to update agent:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Failed to complete claim',
          },
        },
        { status: 500 }
      );
    }

    // Return success
    const result: ClaimResult = {
      agentId: agent.id,
      agentName: agent.name,
      status: 'active',
      owner: {
        twitterId: verification.twitterId!,
        twitterHandle: verification.twitterHandle!,
      },
      claimedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Claim error:', error);
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
