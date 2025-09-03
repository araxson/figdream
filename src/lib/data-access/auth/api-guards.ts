'use server'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/database/supabase/server'
import { getUserRole, type UserRole } from './utils'
import { User } from '@supabase/supabase-js'

/**
 * API Route authentication guard
 * Returns user if authenticated, error response if not
 */
export async function requireApiAuth(request: NextRequest): Promise<{
  user: User | null
  response?: NextResponse
}> {
  const supabase = await createClient()
  
  // Get the authorization header
  const authHeader = request.headers.get('authorization')
  
  // Try to get user from session (cookie-based auth)
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    // If no cookie-based auth, check for bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token)
      
      if (!tokenError && tokenUser) {
        return { user: tokenUser }
      }
    }
    
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
  }
  
  return { user }
}

/**
 * API Route role-based authentication guard
 * Returns user if authenticated with correct role, error response if not
 */
export async function requireApiRole(
  request: NextRequest,
  requiredRole: UserRole
): Promise<{
  user: User | null
  role: UserRole | null
  response?: NextResponse
}> {
  const { user, response: authResponse } = await requireApiAuth(request)
  
  if (!user) {
    return { user: null, role: null, response: authResponse }
  }
  
  const userRole = await getUserRole(user.id)
  
  // Super admin can access everything
  if (userRole === 'super_admin') {
    return { user, role: userRole }
  }
  
  if (userRole !== requiredRole) {
    return {
      user: null,
      role: null,
      response: NextResponse.json(
        { 
          error: 'Insufficient permissions', 
          code: 'FORBIDDEN',
          required: requiredRole,
          current: userRole 
        },
        { status: 403 }
      )
    }
  }
  
  return { user, role: userRole }
}

/**
 * API Route multi-role authentication guard
 * Returns user if authenticated with one of the required roles, error response if not
 */
export async function requireApiRoles(
  request: NextRequest,
  requiredRoles: UserRole[]
): Promise<{
  user: User | null
  role: UserRole | null
  response?: NextResponse
}> {
  const { user, response: authResponse } = await requireApiAuth(request)
  
  if (!user) {
    return { user: null, role: null, response: authResponse }
  }
  
  const userRole = await getUserRole(user.id)
  
  // Super admin can access everything
  if (userRole === 'super_admin') {
    return { user, role: userRole }
  }
  
  if (!userRole || !requiredRoles.includes(userRole)) {
    return {
      user: null,
      role: null,
      response: NextResponse.json(
        { 
          error: 'Insufficient permissions', 
          code: 'FORBIDDEN',
          required: requiredRoles,
          current: userRole 
        },
        { status: 403 }
      )
    }
  }
  
  return { user, role: userRole }
}

/**
 * API Route admin authentication guard
 * Returns user if authenticated with admin role, error response if not
 */
export async function requireApiAdmin(request: NextRequest): Promise<{
  user: User | null
  role: UserRole | null
  response?: NextResponse
}> {
  return requireApiRoles(request, ['super_admin', 'salon_owner', 'location_manager'])
}

/**
 * API Route super admin authentication guard
 * Returns user if authenticated with super admin role, error response if not
 */
export async function requireApiSuperAdmin(request: NextRequest): Promise<{
  user: User | null
  role: UserRole | null
  response?: NextResponse
}> {
  return requireApiRole(request, 'super_admin')
}

/**
 * API Route customer authentication guard
 * Returns user if authenticated with customer role, error response if not
 */
export async function requireApiCustomer(request: NextRequest): Promise<{
  user: User | null
  role: UserRole | null
  response?: NextResponse
}> {
  return requireApiRole(request, 'customer')
}

/**
 * API Route staff authentication guard
 * Returns user if authenticated with staff role, error response if not
 */
export async function requireApiStaff(request: NextRequest): Promise<{
  user: User | null
  role: UserRole | null
  response?: NextResponse
}> {
  return requireApiRole(request, 'staff')
}

/**
 * Get user from API request (optional auth)
 * Returns user if authenticated, null if not (no error)
 */
export async function getApiUser(request: NextRequest): Promise<User | null> {
  const supabase = await createClient()
  
  // Get the authorization header
  const authHeader = request.headers.get('authorization')
  
  // Try to get user from session (cookie-based auth)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    return user
  }
  
  // If no cookie-based auth, check for bearer token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user: tokenUser } } = await supabase.auth.getUser(token)
    return tokenUser
  }
  
  return null
}

/**
 * Verify CSRF token for API routes
 */
export async function verifyApiCsrfToken(request: NextRequest): Promise<boolean> {
  // Skip CSRF check for GET requests
  if (request.method === 'GET') {
    return true
  }
  
  const csrfToken = request.headers.get('x-csrf-token')
  if (!csrfToken) {
    return false
  }
  
  // TODO: Implement actual CSRF token verification
  // For now, just check that a token is present
  return true
}