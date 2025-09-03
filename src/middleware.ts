import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const startTime = Date.now()
  // Create response object for Supabase
  const supabaseResponse = NextResponse.next({
    request,
  })
  // Initialize Supabase client for session management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )
  // IMPORTANT: Only refresh the session, NO auth checks per CLAUDE.md
  // Auth checks should be done in the DAL (Data Access Layer)
  await supabase.auth.getUser()
  // Apply CORS headers for API routes
  if (path.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    const isAllowed = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')
    // Set CORS headers
    supabaseResponse.headers.set(
      'Access-Control-Allow-Origin', 
      isAllowed ? (origin || '*') : allowedOrigins[0]
    )
    supabaseResponse.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    )
    supabaseResponse.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-CSRF-Token'
    )
    supabaseResponse.headers.set('Access-Control-Max-Age', '86400')
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200, 
        headers: supabaseResponse.headers 
      })
    }
    // Add performance tracking header for API routes
    supabaseResponse.headers.set('X-Response-Time', `${Date.now() - startTime}ms`)
  }
  // Security headers for all routes
  supabaseResponse.headers.set('X-Frame-Options', 'DENY')
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff')
  supabaseResponse.headers.set('X-XSS-Protection', '1; mode=block')
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  supabaseResponse.headers.set('X-Request-Id', crypto.randomUUID())
  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ]
  supabaseResponse.headers.set(
    'Content-Security-Policy',
    cspDirectives.join('; ')
  )
  // Permissions Policy (formerly Feature Policy)
  supabaseResponse.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )
  return supabaseResponse
}
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}