import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RateLimiter, getRateLimiter, RATE_LIMITS, createRateLimitHeaders } from './rate-limiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    rateLimiter = new RateLimiter();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('consume', () => {
    it('should allow requests within limit', () => {
      const result = rateLimiter.consume('test-key', 'default');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMITS.default.maxRequests - 1);
    });

    it('should track consumption correctly', () => {
      // Consume multiple times
      for (let i = 0; i < 5; i++) {
        rateLimiter.consume('test-key', 'default');
      }

      const result = rateLimiter.consume('test-key', 'default');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMITS.default.maxRequests - 6);
    });

    it('should block when limit exceeded', () => {
      const limit = RATE_LIMITS.default.maxRequests;

      // Exhaust the limit
      for (let i = 0; i < limit; i++) {
        rateLimiter.consume('test-key', 'default');
      }

      const result = rateLimiter.consume('test-key', 'default');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', () => {
      const limit = RATE_LIMITS.default.maxRequests;

      // Exhaust the limit
      for (let i = 0; i < limit; i++) {
        rateLimiter.consume('test-key', 'default');
      }

      // Verify blocked
      expect(rateLimiter.consume('test-key', 'default').allowed).toBe(false);

      // Advance time past window
      vi.advanceTimersByTime(RATE_LIMITS.default.windowMs + 1000);

      // Should be allowed again
      const result = rateLimiter.consume('test-key', 'default');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(limit - 1);
    });

    it('should track different keys separately', () => {
      // Exhaust limit for key1
      for (let i = 0; i < RATE_LIMITS.default.maxRequests; i++) {
        rateLimiter.consume('key1', 'default');
      }

      // key1 should be blocked
      expect(rateLimiter.consume('key1', 'default').allowed).toBe(false);

      // key2 should still be allowed
      expect(rateLimiter.consume('key2', 'default').allowed).toBe(true);
    });

    it('should apply different limits for different types', () => {
      // Register limit is much lower (5/day)
      for (let i = 0; i < RATE_LIMITS.register.maxRequests; i++) {
        rateLimiter.consume('test-key', 'register');
      }

      const registerResult = rateLimiter.consume('test-key', 'register');
      expect(registerResult.allowed).toBe(false);

      // But default limit should still be available
      const defaultResult = rateLimiter.consume('test-key', 'default');
      expect(defaultResult.allowed).toBe(true);
    });
  });

  describe('check', () => {
    it('should check limit without consuming', () => {
      const check1 = rateLimiter.check('test-key', 'default');
      const check2 = rateLimiter.check('test-key', 'default');

      expect(check1.remaining).toBe(check2.remaining);
    });

    it('should reflect consumed tokens', () => {
      rateLimiter.consume('test-key', 'default');
      rateLimiter.consume('test-key', 'default');

      const result = rateLimiter.check('test-key', 'default');
      // check() calculates remaining as if it would consume one more
      expect(result.remaining).toBe(RATE_LIMITS.default.maxRequests - 2 - 1);
    });
  });
});

describe('getRateLimiter', () => {
  it('should return a singleton instance', () => {
    const limiter1 = getRateLimiter();
    const limiter2 = getRateLimiter();

    expect(limiter1).toBe(limiter2);
  });
});

describe('createRateLimitHeaders', () => {
  it('should create correct headers', () => {
    const result = {
      allowed: true,
      remaining: 50,
      resetAt: 1707220800000,
    };

    const headers = createRateLimitHeaders(result);

    expect(headers['X-RateLimit-Remaining']).toBe('50');
    expect(headers['X-RateLimit-Reset']).toBe('1707220800');
  });

  it('should include Retry-After when blocked', () => {
    const now = Date.now();
    const result = {
      allowed: false,
      remaining: 0,
      resetAt: now + 60000, // 60 seconds from now
    };

    const headers = createRateLimitHeaders(result);

    expect(headers['Retry-After']).toBeDefined();
    expect(parseInt(headers['Retry-After'])).toBeGreaterThan(0);
  });
});

describe('RATE_LIMITS', () => {
  it('should have expected limit types', () => {
    expect(RATE_LIMITS.default).toBeDefined();
    expect(RATE_LIMITS.register).toBeDefined();
    expect(RATE_LIMITS.claim).toBeDefined();
    expect(RATE_LIMITS.purchase).toBeDefined();
    expect(RATE_LIMITS.download).toBeDefined();
    expect(RATE_LIMITS.browse).toBeDefined();
  });

  it('should have valid configurations', () => {
    Object.values(RATE_LIMITS).forEach(limit => {
      expect(limit.maxRequests).toBeGreaterThan(0);
      expect(limit.windowMs).toBeGreaterThan(0);
    });
  });
});
