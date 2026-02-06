import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or API key as identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';
  const apiKey = request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  return apiKey ? `key:${apiKey.substring(0, 8)}` : `ip:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetIn: record.resetTime - now };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Rate limiting
  const key = getRateLimitKey(request);
  const { allowed, remaining, resetIn } = checkRateLimit(key);

  // Add rate limit headers
  const response = allowed
    ? NextResponse.next()
    : NextResponse.json(
        { error: 'Too many requests', retryAfter: Math.ceil(resetIn / 1000) },
        { status: 429 }
      );

  response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetIn / 1000).toString());

  if (!allowed) {
    response.headers.set('Retry-After', Math.ceil(resetIn / 1000).toString());
    return response;
  }

  // Log API request (in production, would use proper logging service)
  const logData = {
    method: request.method,
    path: pathname,
    timestamp: new Date().toISOString(),
    key: key.substring(0, 12), // Truncate for privacy
  };
  console.log('[API]', JSON.stringify(logData));

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
