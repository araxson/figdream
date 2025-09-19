// Unified route protection and authentication checks
import { redirect } from 'next/navigation'
import type { AppContext, RouteGuard, UserRole } from '../types'
import { createClient } from '@/lib/supabase/server'

// Define protected routes and their access rules
const routeGuards: RouteGuard[] = [
  // Admin routes
  {
    path: /^\/admin/,
    roles: ['super_admin', 'platform_admin'],
    redirect: '/unauthorized'
  },
  // Dashboard routes
  {
    path: /^\/dashboard/,
    roles: ['salon_owner', 'salon_manager', 'salon_admin', 'receptionist'],
    redirect: '/login'
  },
  // Staff routes
  {
    path: /^\/staff/,
    roles: ['staff', 'senior_staff'],
    redirect: '/login'
  },
  // Customer routes
  {
    path: /^\/customer/,
    roles: ['customer'],
    redirect: '/login'
  },
  // Booking management (authenticated users only)
  {
    path: /^\/customer\/booking\/(manage|confirmation)/,
    roles: ['customer', 'salon_owner', 'salon_manager', 'salon_admin', 'receptionist', 'staff', 'senior_staff'],
    redirect: '/login'
  },
  // Settings (all authenticated users)
  {
    path: /^\/settings/,
    roles: ['super_admin', 'platform_admin', 'salon_owner', 'salon_manager',
            'salon_admin', 'receptionist', 'staff', 'senior_staff', 'customer'],
    redirect: '/login'
  },
  // Messages (authenticated users except super admins)
  {
    path: /^\/messages/,
    roles: ['salon_owner', 'salon_manager', 'salon_admin', 'receptionist',
            'staff', 'senior_staff', 'customer'],
    redirect: '/login'
  },
  // Notifications (all authenticated users)
  {
    path: /^\/notifications/,
    roles: ['super_admin', 'platform_admin', 'salon_owner', 'salon_manager',
            'salon_admin', 'receptionist', 'staff', 'senior_staff', 'customer'],
    redirect: '/login'
  }
]

export async function checkRouteAccess(pathname: string): Promise<void> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // Check each guard
  for (const guard of routeGuards) {
    const pathMatch = typeof guard.path === 'string'
      ? pathname.startsWith(guard.path)
      : guard.path.test(pathname)

    if (pathMatch) {
      // No user and route requires auth
      if (!user) {
        const redirectUrl = guard.redirect || '/login'
        redirect(`${redirectUrl}?redirect=${encodeURIComponent(pathname)}`)
      }

      // User exists, check role
      if (guard.roles && guard.roles.length > 0) {
        // Get user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError || !profile) {
          console.error('Failed to fetch user profile:', profileError)
          redirect('/login')
        }

        const userRole = profile.role as UserRole

        // Check if user has required role
        if (!guard.roles.includes(userRole)) {
          redirect('/unauthorized')
        }
      }

      // If custom condition exists, evaluate it
      if (guard.condition) {
        const context = await buildAppContext(user.id)
        if (!guard.condition(context)) {
          redirect(guard.redirect || '/unauthorized')
        }
      }

      // Guard passed, no need to check others
      break
    }
  }
}

export async function getAccessibleRoute(role: UserRole): string {
  // Return the default route for each role
  const roleRoutes: Record<UserRole, string> = {
    super_admin: '/admin',
    platform_admin: '/admin',
    salon_owner: '/dashboard/salon',
    salon_manager: '/dashboard/salon',
    salon_admin: '/dashboard/appointments',
    receptionist: '/dashboard/appointments',
    staff: '/staff/appointments',
    senior_staff: '/staff/appointments',
    customer: '/customer/appointments',
    guest: '/customer/booking'
  }

  return roleRoutes[role] || '/'
}

export async function buildAppContext(userId: string): Promise<AppContext> {
  const supabase = await createClient()

  // Get user profile with salon info
  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      salons (
        id,
        name,
        slug,
        settings
      )
    `)
    .eq('id', userId)
    .single()

  // Get notification count
  const { count: notificationCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  return {
    user: profile ? {
      id: userId,
      email: profile.email || '',
      role: profile.role as UserRole,
      profile: {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        salon_id: profile.salon_id,
        staff_id: profile.staff_id
      }
    } : null,
    salon: profile?.salons ? {
      id: profile.salons.id,
      name: profile.salons.name,
      slug: profile.salons.slug,
      settings: profile.salons.settings
    } : null,
    notifications: {
      count: notificationCount || 0,
      unread: unreadCount || 0
    },
    features: {
      // Feature flags can be loaded from database or env
      booking: true,
      campaigns: true,
      reviews: true,
      loyalty: false, // Example disabled feature
      giftCards: false
    }
  }
}

export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/customer/booking',
    '/customer/booking/demo',
    '/about',
    '/contact',
    '/privacy',
    '/terms'
  ]

  return publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

export async function validateSession(): Promise<{ isValid: boolean; userId?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return { isValid: false }
    }

    return { isValid: true, userId: user.id }
  } catch (error) {
    console.error('Session validation error:', error)
    return { isValid: false }
  }
}

export async function enforceRateLimit(userId: string, action: string): Promise<boolean> {
  const supabase = await createClient()

  // Check rate limit from database
  const { data, error } = await supabase
    .rpc('check_rate_limit', {
      p_user_id: userId,
      p_action: action
    })

  if (error) {
    console.error('Rate limit check failed:', error)
    return false
  }

  return data as boolean
}