// Auth module exports
export * from './types';
export { AgentAuth, type AgentAuthAdapter, type GeneratedApiKey } from './agent-auth';
export {
  createAuthMiddleware,
  createOptionalAuthMiddleware,
  type AuthenticatedContext,
  type AuthenticatedHandler,
  type ValidateApiKeyFn,
} from './middleware';
export * from './credentials';
export {
  RateLimiter,
  getRateLimiter,
  RATE_LIMITS,
  createRateLimitHeaders,
} from './rate-limiter';
export {
  withAuth,
  withRateLimit,
  extractApiKey,
  getClientIp,
  errorResponse,
  successResponse,
  type AuthContext,
  type AuthenticatedHandler as ApiAuthenticatedHandler,
  type MiddlewareOptions,
} from './api-middleware';
