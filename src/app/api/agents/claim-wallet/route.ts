/**
 * POST /api/agents/claim-wallet
 * Verify agent ownership via Solana wallet signature
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { createServiceClient } from '@/lib/supabase/server';
import {
  isValidClaimTokenFormat,
  isClaimTokenExpired,
  getRateLimiter,
  createRateLimitHeaders,
  ErrorCodes,
  type ApiResponse,
  type WalletClaimRequest,
} from '@/lib/auth';

interface WalletClaimResult {
  agentId: string;
  agentName: string;
  status: string;
  owner: {
    walletAddress: string;
  };
  claimedAt: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<WalletClaimResult>>> {
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
    let body: WalletClaimRequest;
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

    const { claimToken, walletAddress, signature, message } = body;

    // Validate inputs
    if (!claimToken || !walletAddress || !signature || !message) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'claimToken, walletAddress, signature, and message are required',
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

    // Validate wallet address
    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(walletAddress);
      if (!PublicKey.isOnCurve(pubkey)) {
        throw new Error('Not on curve');
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid wallet address',
          },
        },
        { status: 400 }
      );
    }

    // Verify signature
    try {
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const publicKeyBytes = pubkey.toBytes();

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ErrorCodes.VERIFICATION_FAILED,
              message: 'Signature verification failed',
            },
          },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VERIFICATION_FAILED,
            message: 'Invalid signature format',
          },
        },
        { status: 400 }
      );
    }

    // Verify message contains the claim token
    if (!message.includes(claimToken)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ErrorCodes.VERIFICATION_FAILED,
            message: 'Message does not match claim token',
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

    // Create or get user by wallet address
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user with wallet address
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          wallet_address: walletAddress,
          display_name: `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`,
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
    const result: WalletClaimResult = {
      agentId: agent.id,
      agentName: agent.name,
      status: 'active',
      owner: {
        walletAddress,
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
    console.error('Wallet claim error:', error);
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
