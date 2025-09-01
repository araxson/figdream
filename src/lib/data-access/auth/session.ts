'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/database/supabase/server'
import { User } from '@supabase/supabase-js'
import { getUserRole, type UserRole } from './utils'

export interface SessionUser {
  id: string
  email: string
  role: UserRole | null
  metadata: Record<string, unknown>
}

/**
 * Get current user from session
 * This follows the DAL pattern - server-side only
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

/**
 * Get current session
 * Note: We use getUser() instead of getSession() per best practices
 */
export async function getCurrentSession(): Promise<SessionUser | null> {
  const user = await getCurrentUser()
  
  if (!user) {
    return null
  }
  
  return {
    id: user.id,
    email: user.email || '',
    role: getUserRole(user),
    metadata: user.user_metadata || {}
  }
}

/**
 * Refresh session if needed
 */
export async function refreshSession(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { session }, error } = await supabase.auth.refreshSession()
  
  if (error || !session) {
    console.error('Failed to refresh session:', error)
    return false
  }
  
  return true
}

/**
 * Sign out user and clear session
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    throw new Error('Failed to sign out')
  }
  
  // Clear any additional cookies if needed
  const cookieStore = await cookies()
  cookieStore.delete('user-role')
  cookieStore.delete('salon-id')
  cookieStore.delete('location-id')
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser()
  return user !== null
}

/**
 * Get user role from session
 */
export async function getSessionRole(): Promise<UserRole | null> {
  const user = await getCurrentUser()
  return getUserRole(user)
}

/**
 * Check if current user has specific role
 */
export async function currentUserHasRole(role: UserRole): Promise<boolean> {
  const userRole = await getSessionRole()
  return userRole === role
}

/**
 * Check if current user has any of the specified roles
 */
export async function currentUserHasAnyRole(roles: UserRole[]): Promise<boolean> {
  const userRole = await getSessionRole()
  return userRole !== null && roles.includes(userRole)
}

/**
 * Check if current user is admin (any admin role)
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  return currentUserHasAnyRole(['super_admin', 'salon_owner', 'location_manager'])
}

/**
 * Get user's salon ID from session
 */
export async function getSessionSalonId(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user) return null
  
  return user.app_metadata?.salon_id || null
}

/**
 * Get user's location ID from session
 */
export async function getSessionLocationId(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user) return null
  
  return user.app_metadata?.location_id || null
}

/**
 * Get user's staff ID from session
 */
export async function getSessionStaffId(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user) return null
  
  return user.app_metadata?.staff_id || null
}

/**
 * Validate session and get user
 * Throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

/**
 * Validate session and require specific role
 * Throws error if not authenticated or wrong role
 */
export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireAuth()
  const userRole = getUserRole(user)
  
  if (userRole !== role) {
    throw new Error(`Unauthorized: ${role} role required`)
  }
  
  return user
}

/**
 * Validate session and require any of specified roles
 * Throws error if not authenticated or wrong role
 */
export async function requireAnyRole(roles: UserRole[]): Promise<User> {
  const user = await requireAuth()
  const userRole = getUserRole(user)
  
  if (!userRole || !roles.includes(userRole)) {
    throw new Error(`Unauthorized: One of ${roles.join(', ')} roles required`)
  }
  
  return user
}

/**
 * Validate session and require admin role
 * Throws error if not authenticated or not admin
 */
export async function requireAdmin(): Promise<User> {
  return requireAnyRole(['super_admin', 'salon_owner', 'location_manager'])
}

/**
 * Store additional session data in cookies
 * Used for quick access without database queries
 */
export async function storeSessionMetadata(
  role: UserRole,
  salonId?: string,
  locationId?: string
): Promise<void> {
  const cookieStore = await cookies()
  
  // Store role
  cookieStore.set('user-role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
  
  // Store salon ID if provided
  if (salonId) {
    cookieStore.set('salon-id', salonId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
  }
  
  // Store location ID if provided
  if (locationId) {
    cookieStore.set('location-id', locationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    })
  }
}

/**
 * Get stored session metadata from cookies
 * Used for quick checks without database queries
 */
export async function getSessionMetadata(): Promise<{
  role?: string
  salonId?: string
  locationId?: string
}> {
  const cookieStore = await cookies()
  
  return {
    role: cookieStore.get('user-role')?.value,
    salonId: cookieStore.get('salon-id')?.value,
    locationId: cookieStore.get('location-id')?.value
  }
}

/**
 * Clear session metadata cookies
 */
export async function clearSessionMetadata(): Promise<void> {
  const cookieStore = await cookies()
  
  cookieStore.delete('user-role')
  cookieStore.delete('salon-id')
  cookieStore.delete('location-id')
}