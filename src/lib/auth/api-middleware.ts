/**
 * API Middleware
 * Reusable middleware for API authentication and rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentByApiKey, updateAgentLastActive } from '@/lib/agents';
import { isValidApiKeyFormat } from './credentials';
import { getRateLimiter, createRateLimitHeaders, RATE_LIMITS } from './rate-limiter';
import { ErrorCodes, type ApiResponse, type Agent } from './types';

export interface AuthContext {
  agent: Agent;
}

export type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: AuthContext
) => Promise<NextResponse<ApiResponse<T>>>;

export interface MiddlewareOptions {
  /** Rate limit type (default, register, claim, purchase, download, browse) */
  rateLimit?: keyof typeof RATE_LIMITS;
  /** Whether agent must be active (default: true) */
  requireActive?: boolean;
  /** Custom rate limit key prefix */
  rateLimitKeyPrefix?: string;
}

/**
 * Extract API key from request headers
 */
export function extractApiKey(request: NextRequest): string | null {
  const xApiKey = request.headers.get('x-api-key');
  if (xApiKey) return xApiKey;

  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return null;
}

/**
 * Get client IP from request
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Create error response
 */
export function errorResponse<T = unknown>(
  code: string,
  message: string,
  status: number,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status, headers }
  );
}

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status, headers }
  );
}

/**
 * Create authenticated API middleware
 * Handles authentication and rate limiting
 */
export function withAuth<T = unknown>(
  handler: AuthenticatedHandler<T>,
  options: MiddlewareOptions = {}
): (request: NextRequest) => Promise<NextResponse<ApiResponse<T>>> {
  const {
    rateLimit = 'default',
    requireActive = true,
    rateLimitKeyPrefix,
  } = options;

  return async (request: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      // Extract API key
      const apiKey = extractApiKey(request);

      if (!apiKey) {
        return errorResponse(
          ErrorCodes.MISSING_AUTH,
          'API key required. Use X-API-Key header or Authorization: Bearer <key>',
          401
        );
      }

      // Validate format
      if (!isValidApiKeyFormat(apiKey)) {
        return errorResponse(
          ErrorCodes.INVALID_API_KEY,
          'Invalid API key format',
          401
        );
      }

      // Get agent
      const agent = await getAgentByApiKey(apiKey);

      if (!agent) {
        return errorResponse(
          ErrorCodes.INVALID_API_KEY,
          'Invalid API key',
          401
        );
      }

      // Check status
      if (requireActive && agent.status !== 'active') {
        if (agent.status === 'suspended') {
          return errorResponse(
            ErrorCodes.AGENT_SUSPENDED,
            'Agent is suspended',
            403
          );
        }
        return errorResponse(
          ErrorCodes.AGENT_NOT_ACTIVE,
          'Agent must be active',
          403
        );
      }

      // Rate limiting
      const rateLimiter = getRateLimiter();
      const keyPrefix = rateLimitKeyPrefix || rateLimit;
      const rateLimitResult = rateLimiter.consume(`${keyPrefix}:${agent.id}`, rateLimit);

      if (!rateLimitResult.allowed) {
        return errorResponse(
          ErrorCodes.RATE_LIMITED,
          'Too many requests. Please try again later.',
          429,
          createRateLimitHeaders(rateLimitResult)
        );
      }

      // Update last active time (fire and forget)
      updateAgentLastActive(agent.id).catch(console.error);

      // Call handler
      const response = await handler(request, { agent });

      // Add rate limit headers to response
      const headers = new Headers(response.headers);
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new NextResponse(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      console.error('API middleware error:', error);
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'An unexpected error occurred',
        500
      );
    }
  };
}

/**
 * Rate limit only middleware (no authentication)
 * Use for public endpoints that need rate limiting
 */
export function withRateLimit<T = unknown>(
  handler: (request: NextRequest) => Promise<NextResponse<ApiResponse<T>>>,
  limitType: keyof typeof RATE_LIMITS = 'default'
): (request: NextRequest) => Promise<NextResponse<ApiResponse<T>>> {
  return async (request: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      const rateLimiter = getRateLimiter();
      const clientIp = getClientIp(request);
      const rateLimitResult = rateLimiter.consume(`ip:${clientIp}:${limitType}`, limitType);

      if (!rateLimitResult.allowed) {
        return errorResponse(
          ErrorCodes.RATE_LIMITED,
          'Too many requests. Please try again later.',
          429,
          createRateLimitHeaders(rateLimitResult)
        );
      }

      const response = await handler(request);

      // Add rate limit headers
      const headers = new Headers(response.headers);
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });

      return new NextResponse(response.body, {
        status: response.status,
        headers,
      });
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        'An unexpected error occurred',
        500
      );
    }
  };
}
