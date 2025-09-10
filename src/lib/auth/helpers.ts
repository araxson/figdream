import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { USER_ROLES, UserRole, isRoleAllowed } from '@/lib/auth/constants'

export type AuthenticatedRequest = NextRequest & {
  user: {
    id: string
    email: string
    role: UserRole
  }
}

/**
 * Middleware helper to verify authentication for API routes
 * Returns user data if authenticated, or an error response
 */
export async function verifyApiAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    )
  }
  
  // Get user role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  const userRole = (profile?.role || USER_ROLES.CUSTOMER) as UserRole
  
  return {
    id: user.id,
    email: user.email!,
    role: userRole
  }
}

/**
 * Middleware helper to verify role-based access for API routes
 */
export async function verifyApiRole(request: NextRequest, allowedRoles: UserRole[]) {
  const authResult = await verifyApiAuth()
  
  // If it's a NextResponse, it means auth failed
  if (authResult instanceof NextResponse) {
    return authResult
  }
  
  // Check if user has required role
  if (!isRoleAllowed(authResult.role, allowedRoles)) {
    return NextResponse.json(
      { 
        error: 'Forbidden', 
        message: 'Insufficient permissions',
        requiredRoles: allowedRoles,
        userRole: authResult.role
      },
      { status: 403 }
    )
  }
  
  return authResult
}

/**
 * Helper to extract bearer token from request headers
 */
export function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization')
  if (!authorization) return null
  
  const [type, token] = authorization.split(' ')
  if (type.toLowerCase() !== 'bearer') return null
  
  return token
}