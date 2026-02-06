/**
 * Rate Limiter
 * Simple in-memory rate limiting for API endpoints
 */

import type { RateLimitResult, RateLimitConfig } from './types';

// Default rate limit configurations
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Default for most endpoints
  default: { windowMs: 60_000, maxRequests: 100 },      // 100/minute

  // Registration - stricter limit
  register: { windowMs: 86_400_000, maxRequests: 5 },   // 5/day

  // Claim verification
  claim: { windowMs: 3_600_000, maxRequests: 10 },      // 10/hour

  // Purchases - prevent abuse
  purchase: { windowMs: 3_600_000, maxRequests: 20 },   // 20/hour

  // Downloads - moderate limit
  download: { windowMs: 60_000, maxRequests: 30 },      // 30/minute

  // Search/browse - generous limit
  browse: { windowMs: 60_000, maxRequests: 200 },       // 200/minute
};

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limiter
 * Note: For production, use Redis or similar for distributed rate limiting
 */
export class RateLimiter {
  private store: Map<string, RateLimitRecord> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Cleanup expired entries every minute
    this.startCleanup();
  }

  /**
   * Check if a request is allowed without consuming
   */
  check(key: string, limitType: string = 'default'): RateLimitResult {
    const config = RATE_LIMITS[limitType] || RATE_LIMITS.default;
    const now = Date.now();
    const record = this.store.get(key);

    // No record or expired - allowed
    if (!record || now >= record.resetAt) {
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs
      };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt
      };
    }

    return {
      allowed: true,
      remaining: config.maxRequests - record.count - 1,
      resetAt: record.resetAt
    };
  }

  /**
   * Check and consume a request
   */
  consume(key: string, limitType: string = 'default'): RateLimitResult {
    const config = RATE_LIMITS[limitType] || RATE_LIMITS.default;
    const now = Date.now();
    const record = this.store.get(key);

    // No record or expired - create new
    if (!record || now >= record.resetAt) {
      this.store.set(key, {
        count: 1,
        resetAt: now + config.windowMs
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: now + config.windowMs
      };
    }

    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: record.resetAt
      };
    }

    // Increment count
    record.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt
    };
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get rate limit key for IP-based limiting
   */
  static getIpKey(ip: string, endpoint: string): string {
    return `ip:${ip}:${endpoint}`;
  }

  /**
   * Get rate limit key for agent-based limiting
   */
  static getAgentKey(agentId: string, endpoint: string): string {
    return `agent:${agentId}:${endpoint}`;
  }

  /**
   * Start cleanup interval
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60_000); // Every minute
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.store.forEach((record, key) => {
      if (now >= record.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.store.delete(key));
  }

  /**
   * Stop the rate limiter and cleanup
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
let rateLimiterInstance: RateLimiter | null = null;

/**
 * Get singleton rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  if (!rateLimiterInstance) {
    rateLimiterInstance = new RateLimiter();
  }
  return rateLimiterInstance;
}

/**
 * Create rate limit headers for response
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };

  // Add Retry-After header when rate limited
  if (!result.allowed) {
    const retryAfterSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    if (retryAfterSeconds > 0) {
      headers['Retry-After'] = String(retryAfterSeconds);
    }
  }

  return headers;
}
