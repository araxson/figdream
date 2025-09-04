'use server'
import { cache } from 'react'
import { verifySession } from './session'
import { type UserRole } from './utils'
import type { Database } from '@/types/database.types'
import type { User } from '@supabase/supabase-js'

/**
 * CRITICAL: Data Access Layer Security for CVE-2025-29927
 * 
 * This module implements the Proximity Principle - authentication checks 
 * are performed as close to data access as possible, not in middleware.
 * 
 * Key principles:
 * 1. Always use verifySession() instead of auth.getUser()
 * 2. Perform auth checks in data access functions, not middleware
 * 3. Return secure DTOs that don't expose sensitive data
 * 4. Use React cache() for performance optimization
 */

export interface SecureUserDTO {
  id: string
  email: string
  role: UserRole | null
  permissions: string[]
  salon_id?: string
  location_id?: string
}

export interface AuthContext {
  user: User
  profile: Database['public']['Tables']['profiles']['Row']
  role: UserRole | null
  salon_id?: string
  location_id?: string
}

/**
 * Secure authentication context with Proximity Principle
 * Memoized per request for performance
 */
export const getAuthContext = cache(async (): Promise<{
  context: AuthContext | null
  error: string | null
}> => {
  try {
    // Step 1: Verify session securely
    const { user, error: sessionError } = await verifySession()
    if (sessionError || !user) {
      return { context: null, error: 'Authentication required' }
    }

    // Step 2: Get user profile and role from database
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()

    const [profileResult, roleResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('user_roles')
        .select('role, salon_id, location_id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle()
    ])

    if (profileResult.error || !profileResult.data) {
      return { context: null, error: 'User profile not found' }
    }

    const role = roleResult.data?.role || 'customer' as UserRole
    
    const context: AuthContext = {
      user,
      profile: profileResult.data,
      role,
      salon_id: roleResult.data?.salon_id || undefined,
      location_id: roleResult.data?.location_id || undefined
    }

    return { context, error: null }
  } catch (err) {
    return { 
      context: null, 
      error: err instanceof Error ? err.message : 'Authentication failed' 
    }
  }
})

/**
 * Create a secure user DTO that doesn't expose sensitive data
 */
export async function createSecureUserDTO(context: AuthContext): Promise<SecureUserDTO> {
  return {
    id: context.user.id,
    email: context.profile.email || '',
    role: context.role,
    permissions: getRolePermissions(context.role),
    salon_id: context.salon_id,
    location_id: context.location_id
  }
}

/**
 * Get permissions for a role (used in DTOs)
 */
function getRolePermissions(role: UserRole | null): string[] {
  if (!role) return []
  
  const rolePermissions: Record<UserRole, string[]> = {
    super_admin: ['*'], // Full access
    salon_owner: [
      'manage_salon', 'manage_locations', 'manage_staff', 'manage_services',
      'view_analytics', 'manage_bookings', 'manage_reviews'
    ],
    location_manager: [
      'manage_location', 'manage_local_staff', 'manage_local_services',
      'view_local_analytics', 'manage_local_bookings'
    ],
    staff: [
      'view_own_schedule', 'manage_own_bookings', 'view_own_earnings',
      'update_own_profile'
    ],
    customer: [
      'create_bookings', 'view_own_bookings', 'create_reviews',
      'manage_own_profile', 'view_services'
    ]
  }
  
  return rolePermissions[role] || []
}

/**
 * Require authentication with secure DAL pattern
 */
export async function requireAuth(): Promise<AuthContext> {
  const { context, error } = await getAuthContext()
  if (error || !context) {
    throw new Error('Authentication required')
  }
  return context
}

/**
 * Require specific role with secure DAL pattern
 */
export async function requireRole(requiredRole: UserRole): Promise<AuthContext> {
  const context = await requireAuth()
  
  // Super admin can access everything
  if (context.role === 'super_admin') {
    return context
  }
  
  if (context.role !== requiredRole) {
    throw new Error(`Unauthorized: ${requiredRole} role required`)
  }
  
  return context
}

/**
 * Require any of specified roles with secure DAL pattern
 */
export async function requireAnyRole(requiredRoles: UserRole[]): Promise<AuthContext> {
  const context = await requireAuth()
  
  // Super admin can access everything
  if (context.role === 'super_admin') {
    return context
  }
  
  if (!context.role || !requiredRoles.includes(context.role)) {
    throw new Error(`Unauthorized: One of ${requiredRoles.join(', ')} roles required`)
  }
  
  return context
}

/**
 * Check if user has permission to access resource
 */
export async function requireResourceAccess(
  resourceType: 'salon' | 'location' | 'staff' | 'booking',
  resourceId: string
): Promise<AuthContext> {
  const context = await requireAuth()
  
  // Super admin has access to everything
  if (context.role === 'super_admin') {
    return context
  }
  
  const { createClient } = await import('@/lib/database/supabase/server')
  const supabase = await createClient()
  
  switch (resourceType) {
    case 'salon':
      if (context.role === 'salon_owner' && context.salon_id !== resourceId) {
        throw new Error('Access denied: Salon not owned by user')
      }
      break
      
    case 'location':
      if (context.role === 'location_manager' && context.location_id !== resourceId) {
        throw new Error('Access denied: Location not managed by user')
      }
      break
      
    case 'staff':
      if (context.role === 'staff') {
        const { data: staffProfile } = await supabase
          .from('staff_profiles')
          .select('id')
          .eq('user_id', context.user.id)
          .single()
        
        if (!staffProfile || staffProfile.id !== resourceId) {
          throw new Error('Access denied: Staff profile not owned by user')
        }
      }
      break
      
    case 'booking':
      if (context.role === 'customer') {
        const { data: booking } = await supabase
          .from('appointments')
          .select('customer_id')
          .eq('id', resourceId)
          .single()
        
        if (!booking || booking.customer_id !== context.profile.id) {
          throw new Error('Access denied: Booking not owned by user')
        }
      }
      break
  }
  
  return context
}

/**
 * Secure data fetcher with built-in auth
 * Implements Proximity Principle - auth check right before data access
 */
export async function secureDataAccess<T>(
  operation: string,
  requiredRoles: UserRole[],
  dataFetcher: (context: AuthContext) => Promise<T>
): Promise<T> {
  // Auth check happens right before data access (Proximity Principle)
  const context = await requireAnyRole(requiredRoles)
  
  try {
    return await dataFetcher(context)
  } catch (_error) {
    throw new Error(`Data access failed for operation: ${operation}`)
  }
}

/**
 * Create audit log for data access
 */
export async function logDataAccess(
  operation: string,
  resourceType: string,
  resourceId?: string
): Promise<void> {
  try {
    const { context } = await getAuthContext()
    if (!context) return // Don't log if not authenticated
    
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    
    await supabase
      .from('audit_logs')
      .insert({
        user_id: context.user.id,
        action: operation,
        resource_type: resourceType,
        resource_id: resourceId,
        ip_address: '', // Would need to get from headers
        user_agent: '', // Would need to get from headers
        created_at: new Date().toISOString()
      })
  } catch (error) {
    // Silent failure - don't break app if audit logging fails
    console.warn('Audit logging failed:', error)
  }
}