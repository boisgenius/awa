/**
 * POST /api/agents/register
 * Register a new AI agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import {
  generateAgentCredentials,
  isValidAgentName,
  generateRandomAgentName,
  getRateLimiter,
  createRateLimitHeaders,
  ErrorCodes,
  type ApiResponse,
  type RegisterRequest,
  type RegisterResult,
} from '@/lib/auth';
import { generateAgentWallet } from '@/lib/solana';

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<RegisterResult>>> {
  try {
    // Rate limiting
    const rateLimiter = getRateLimiter();
    const clientIp = getClientIp(request);
    const rateLimitResult = rateLimiter.consume(`register:${clientIp}`, 'register');

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.RATE_LIMITED,
            message: 'Too many registration attempts. Please try again later.',
          },
        },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Parse request body
    let body: RegisterRequest;
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

    // Use provided name or generate one
    const name = body.name?.trim() || generateRandomAgentName();

    // Validate name format
    if (!isValidAgentName(name)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INVALID_NAME,
            message: 'Name must be 2-32 characters and only contain letters, numbers, and underscores',
          },
        },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = createServiceClient();

    // Check if name is already taken
    const { data: existingAgent } = await supabase
      .from('agents')
      .select('id')
      .eq('name', name)
      .single();

    if (existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.NAME_TAKEN,
            message: 'Agent name already taken',
          },
        },
        { status: 409 }
      );
    }

    // Generate all credentials
    const credentials = generateAgentCredentials();

    // Generate Solana wallet
    let wallet;
    try {
      wallet = generateAgentWallet();
    } catch (error) {
      console.error('Failed to generate wallet:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Failed to generate wallet. Please try again.',
          },
        },
        { status: 500 }
      );
    }

    // Insert agent into database
    const { data: agent, error: insertError } = await supabase
      .from('agents')
      .insert({
        name,
        description: body.description || `AI agent enrolled via Claw Academy`,
        api_key_hash: credentials.apiKeyHash,
        api_key_prefix: credentials.apiKeyPrefix,
        wallet_public_key: wallet.publicKey,
        wallet_encrypted_key: wallet.encryptedPrivateKey,
        status: 'pending_claim',
        claim_token: credentials.claimToken,
        claim_token_expires_at: credentials.claimTokenExpiresAt.toISOString(),
        verification_code: credentials.verificationCode,
      })
      .select('id, name, status, created_at')
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Failed to register agent',
          },
        },
        { status: 500 }
      );
    }

    // Build claim URL from request headers
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${proto}://${host}`;
    const claimUrl = `${baseUrl}/claim/${credentials.claimToken}`;

    // Return registration result
    const result: RegisterResult = {
      id: agent.id,
      name: agent.name,
      apiKey: credentials.apiKey,
      claimUrl,
      claimToken: credentials.claimToken,
      verificationCode: credentials.verificationCode,
      walletPublicKey: wallet.publicKey,
      status: agent.status,
      createdAt: agent.created_at,
    };

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      {
        status: 201,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
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
