import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { trackApiRequest } from '@/lib/data-access/monitoring/api-usage'
import { logError } from '@/lib/data-access/monitoring/error-logs'
import { createClient } from '@/lib/database/supabase/server'
/**
 * API Monitoring Middleware
 * Tracks all API requests for performance monitoring and rate limiting
 */
export async function apiMonitoringMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>
) {
  const startTime = Date.now()
  const endpoint = request.nextUrl.pathname
  const method = request.method
  let userId: string | undefined
  let response: NextResponse
  let statusCode = 200
  try {
    // Try to get the current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id
    // Execute the actual API handler
    response = await handler()
    statusCode = response.status
  } catch (error) {
    // Log the error
    await logError(
      `API Error: ${endpoint}`,
      'api',
      'high',
      {
        endpoint,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId
      }
    )
    statusCode = 500
    response = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  } finally {
    // Calculate response time
    const responseTime = Date.now() - startTime
    // Track the API request
    await trackApiRequest(
      endpoint,
      method,
      userId,
      responseTime,
      statusCode
    ).catch(_err => {
      // Don't let monitoring failures break the API
    })
  }
  // Add performance headers
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
  response.headers.set('X-Request-Id', crypto.randomUUID())
  return response
}
/**
 * Rate limiting check
 * Returns true if request should be allowed, false if rate limited
 */
export async function checkRateLimit(
  userId?: string,
  ip?: string,
  endpoint?: string
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const supabase = await createClient()
    // Define rate limits (requests per minute)
    const limits = {
      authenticated: 60,
      anonymous: 30,
      perEndpoint: 20
    }
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    if (userId) {
      // Check authenticated user rate limit
      const { count } = await supabase
        .from('api_usage')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneMinuteAgo)
      if ((count || 0) >= limits.authenticated) {
        return { allowed: false, retryAfter: 60 }
      }
    } else if (ip) {
      // Check IP-based rate limit for anonymous users
      const { count } = await supabase
        .from('api_usage')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .is('user_id', null)
        .gte('created_at', oneMinuteAgo)
      if ((count || 0) >= limits.anonymous) {
        return { allowed: false, retryAfter: 60 }
      }
    }
    // Check per-endpoint limit if specified
    if (endpoint) {
      const query = supabase
        .from('api_usage')
        .select('*', { count: 'exact', head: true })
        .eq('endpoint', endpoint)
        .gte('created_at', oneMinuteAgo)
      if (userId) {
        query.eq('user_id', userId)
      } else if (ip) {
        query.eq('ip_address', ip)
      }
      const { count } = await query
      if ((count || 0) >= limits.perEndpoint) {
        return { allowed: false, retryAfter: 60 }
      }
    }
    return { allowed: true }
  } catch (_error) {
    // On error, allow the request but log it
    return { allowed: true }
  }
}
/**
 * CORS configuration for API routes
 */
export function corsHeaders(origin?: string | null) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  const isAllowed = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : allowedOrigins[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400',
  }
}
/**
 * Standard API response wrapper
 */
export function apiResponse<T>(
  data: T,
  status = 200,
  headers?: HeadersInit
): NextResponse {
  return NextResponse.json(
    {
      success: status >= 200 && status < 300,
      data,
      timestamp: new Date().toISOString()
    },
    {
      status,
      headers
    }
  )
}
/**
 * Standard API error response
 */
export function apiError(
  message: string,
  status = 500,
  code?: string,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        code: code || 'INTERNAL_ERROR',
        details,
        timestamp: new Date().toISOString()
      }
    },
    {
      status
    }
  )
}