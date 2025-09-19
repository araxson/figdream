/**
 * Authentication and User Context Helpers for Server Actions
 *
 * Enterprise-grade authentication helpers that provide:
 * - Mandatory authentication verification
 * - User context retrieval (salon_id for multi-tenancy)
 * - Permission validation
 * - Consistent error handling
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface UserContext {
  user: {
    id: string
    email?: string
  }
  profile: {
    id: string
    email?: string
    display_name?: string
    first_name?: string
    last_name?: string
    full_name?: string
    phone?: string
    is_active: boolean
    is_verified: boolean
  }
  staffProfile?: {
    id: string
    salon_id: string
    title?: string
    status: string
  }
  salonId?: string
  role?: string
}

export interface AuthError {
  success: false
  error: string
  code: 'AUTH_REQUIRED' | 'PROFILE_REQUIRED' | 'CONTEXT_REQUIRED' | 'PERMISSION_DENIED' | 'ACCOUNT_DISABLED'
}

/**
 * Get authenticated user context with all necessary information
 * This is the primary authentication helper for all server actions
 */
export async function getUserContext(): Promise<UserContext | AuthError> {
  try {
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'Authentication required. Please sign in to continue.',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'User profile not found. Please complete your profile setup.',
        code: 'PROFILE_REQUIRED'
      }
    }

    // Check if account is active
    if (!profile.is_active) {
      return {
        success: false,
        error: 'Your account has been disabled. Please contact support.',
        code: 'ACCOUNT_DISABLED'
      }
    }

    // 3. Get staff profile if exists (for salon context)
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id, salon_id, title, status')
      .eq('user_id', user.id)
      .eq('status', 'available')
      .single()

    // 4. Get user role from user_roles table
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    return {
      user: {
        id: user.id,
        email: user.email
      },
      profile: {
        id: profile.id || '',
        email: profile.email ?? undefined,
        display_name: profile.display_name ?? undefined,
        first_name: profile.first_name ?? undefined,
        last_name: profile.last_name ?? undefined,
        full_name: profile.full_name ?? undefined,
        phone: profile.phone ?? undefined,
        is_active: profile.is_active ?? true,
        is_verified: profile.is_verified ?? false
      },
      staffProfile: staffProfile ? {
        id: staffProfile.id!,
        salon_id: staffProfile.salon_id!,
        title: staffProfile.title ?? undefined,
        status: staffProfile.status || 'available'
      } : undefined,
      salonId: staffProfile?.salon_id ?? undefined,
      role: userRole?.role ?? undefined
    }
  } catch (error) {
    console.error('[Auth Helper Error]:', error)
    return {
      success: false,
      error: 'An error occurred while verifying authentication.',
      code: 'AUTH_REQUIRED'
    }
  }
}

/**
 * Require authentication - throws error if not authenticated
 * Use this for actions that must have authentication
 */
export async function requireAuth(): Promise<UserContext> {
  const context = await getUserContext()

  if ('success' in context && !context.success) {
    throw new Error(context.error)
  }

  return context as UserContext
}

/**
 * Require salon context - ensures user has salon_id
 * Use this for salon-specific operations
 */
export async function requireSalonContext(): Promise<UserContext & { salonId: string }> {
  const context = await requireAuth()

  if (!context.salonId) {
    throw new Error('Salon context required. Please select or join a salon.')
  }

  return context as UserContext & { salonId: string }
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  try {
    const context = await getUserContext()
    if ('error' in context) return false

    return context.role === requiredRole
  } catch {
    return false
  }
}

/**
 * Require specific role - throws error if user doesn't have the role
 */
export async function requireRole(requiredRole: string): Promise<UserContext> {
  const context = await requireAuth()

  if (context.role !== requiredRole) {
    throw new Error(`Access denied. ${requiredRole} role required.`)
  }

  return context
}

/**
 * Check if user is admin
 */
export function isAdmin(): Promise<boolean> {
  return hasRole('admin')
}

/**
 * Check if user is salon owner
 */
export function isSalonOwner(): Promise<boolean> {
  return hasRole('salon_owner')
}

/**
 * Check if user is staff member
 */
export async function isStaff(): Promise<boolean> {
  try {
    const context = await getUserContext()
    if ('error' in context) return false

    return !!context.staffProfile
  } catch {
    return false
  }
}

/**
 * Redirect to login if not authenticated
 * Use in pages that require authentication
 */
export async function redirectIfNotAuthenticated(returnUrl?: string) {
  const context = await getUserContext()

  if ('success' in context && !context.success) {
    const loginUrl = returnUrl
      ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
      : '/login'
    redirect(loginUrl)
  }
}

/**
 * Get salon ID from various sources
 * Priority: staffProfile > form/params > cookie/session
 */
export async function getSalonId(formDataOrParams?: FormData | { salon_id?: string }): Promise<string | null> {
  // Try to get from user context first
  const context = await getUserContext()
  if (!('success' in context) && context.salonId) {
    return context.salonId
  }

  // Try to get from form data or params
  if (formDataOrParams) {
    if (formDataOrParams instanceof FormData) {
      const salonId = formDataOrParams.get('salon_id')
      if (salonId) return salonId.toString()
    } else if (formDataOrParams.salon_id) {
      return formDataOrParams.salon_id
    }
  }

  return null
}

/**
 * Require admin role for an action
 * Returns user context if admin, or error if not
 */
export async function requireAdminRole(): Promise<UserContext | AuthError> {
  const context = await getUserContext()

  // Check if there was an auth error
  if ('error' in context) {
    return context
  }

  // Check if user has admin role
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', context.user.id)
    .single()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return {
      success: false,
      error: 'Administrator access required',
      code: 'PERMISSION_DENIED'
    }
  }

  return context
}

/**
 * Log security events for audit trail
 */
export async function logSecurityEvent(
  eventType: string,
  details: Record<string, any>
): Promise<void> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await (supabase as any).from('audit_logs').insert({
        user_id: user.id,
        event_type: eventType,
        details,
        created_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}