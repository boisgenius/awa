import { NextRequest, NextResponse } from 'next/server';
import type { Agent } from './types';

export interface AuthenticatedContext {
  agent: Agent;
}

export type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: AuthenticatedContext
) => Promise<T>;

export type ValidateApiKeyFn = (key: string) => Promise<Agent | null>;

/**
 * Extract API key from request headers
 * Supports both X-API-Key header and Authorization Bearer token
 */
function extractApiKey(request: NextRequest): string | null {
  // Try X-API-Key header first
  const xApiKey = request.headers.get('x-api-key');
  if (xApiKey) {
    return xApiKey;
  }

  // Try Authorization Bearer header
  const authorization = request.headers.get('authorization');
  if (authorization?.startsWith('Bearer ')) {
    return authorization.slice(7);
  }

  return null;
}

/**
 * Create an authentication middleware for API routes
 *
 * Usage:
 * ```typescript
 * const authMiddleware = createAuthMiddleware(agentAuth.validateApiKey.bind(agentAuth));
 *
 * export const GET = authMiddleware(async (request, { agent }) => {
 *   // agent is authenticated
 *   return NextResponse.json({ agentId: agent.id });
 * });
 * ```
 */
export function createAuthMiddleware(validateApiKey: ValidateApiKeyFn) {
  return function authMiddleware<T>(handler: AuthenticatedHandler<T>) {
    return async (request: NextRequest): Promise<NextResponse | T> => {
      const apiKey = extractApiKey(request);

      if (!apiKey) {
        return NextResponse.json(
          { error: 'API key required' },
          { status: 401 }
        );
      }

      const agent = await validateApiKey(apiKey);

      if (!agent) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      return handler(request, { agent });
    };
  };
}

/**
 * Optional authentication middleware - doesn't require API key
 * but provides agent context if API key is present
 */
export function createOptionalAuthMiddleware(validateApiKey: ValidateApiKeyFn) {
  return function optionalAuthMiddleware<T>(
    handler: (
      request: NextRequest,
      context: { agent: Agent | null }
    ) => Promise<T>
  ) {
    return async (request: NextRequest): Promise<T> => {
      const apiKey = extractApiKey(request);
      let agent: Agent | null = null;

      if (apiKey) {
        agent = await validateApiKey(apiKey);
      }

      return handler(request, { agent });
    };
  };
}
