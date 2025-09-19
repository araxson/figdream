import { headers } from "next/headers";
import { logSecurityEvent } from "../dal/security-logging";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  identifier?: string; // Custom identifier (default: IP address)
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a request
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const headersList = await headers();
  const identifier = config.identifier ||
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const key = `ratelimit:${identifier}`;

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Create new window
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    await logSecurityEvent({
      event_type: 'rate_limit_exceeded',
      action: 'request_blocked',
      details: {
        identifier,
        limit: config.maxRequests,
        window: config.windowMs
      },
      ip_address: identifier,
      severity: 'medium'
    });

    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

/**
 * Rate limiting presets for different endpoints
 */
export const RateLimits = {
  // Authentication endpoints - strict limits
  auth: {
    login: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes
    register: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
    passwordReset: { windowMs: 60 * 60 * 1000, maxRequests: 3 }, // 3 per hour
    otp: { windowMs: 5 * 60 * 1000, maxRequests: 5 }, // 5 per 5 minutes
  },

  // API endpoints - moderate limits
  api: {
    read: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
    write: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 per minute
    delete: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
    search: { windowMs: 60 * 1000, maxRequests: 50 }, // 50 per minute
  },

  // Public endpoints - relaxed limits
  public: {
    landing: { windowMs: 60 * 1000, maxRequests: 200 }, // 200 per minute
    static: { windowMs: 60 * 1000, maxRequests: 500 }, // 500 per minute
  },

  // Admin endpoints - specific limits
  admin: {
    export: { windowMs: 60 * 60 * 1000, maxRequests: 10 }, // 10 per hour
    bulkOperation: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 per minute
    systemConfig: { windowMs: 60 * 60 * 1000, maxRequests: 20 }, // 20 per hour
  }
};

/**
 * Express-style middleware for rate limiting
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  return async function(req: Request): Promise<Response | null> {
    const { allowed, remaining, resetTime } = await checkRateLimit(config);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString(),
            'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Add rate limit headers to response
    return null; // Continue with request
  };
}

/**
 * Helper to create rate limited API route handlers
 */
export function withRateLimit<T extends (...args: any[]) => any>(
  handler: T,
  config: RateLimitConfig
): T {
  return (async (...args: Parameters<T>) => {
    const { allowed } = await checkRateLimit(config);

    if (!allowed) {
      throw new Error('Rate limit exceeded');
    }

    return handler(...args);
  }) as T;
}

/**
 * Rate limit by user ID (for authenticated routes)
 */
export async function checkUserRateLimit(
  userId: string,
  action: string,
  config: RateLimitConfig
): Promise<boolean> {
  const customConfig = {
    ...config,
    identifier: `user:${userId}:${action}`
  };

  const { allowed } = await checkRateLimit(customConfig);
  return allowed;
}