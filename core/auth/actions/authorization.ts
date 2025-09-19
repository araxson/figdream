'use server'

import { createClient } from '@/lib/supabase/server'

// Authorization and permission types
export type UserRole = 'admin' | 'owner' | 'manager' | 'staff' | 'customer'

export type AuthUserData = {
  user: any
  profile: any
  role: UserRole | null
}

// GET CURRENT USER
export async function getCurrentUser(): Promise<AuthUserData | null> {
  try {
    const supabase = await createClient()

    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    return {
      user,
      profile,
      role: userRole?.role as UserRole || null,
    }
  } catch (error) {
    console.error('[Get Current User Error]:', error)
    return null
  }
}

// Check if user has specific role
export async function hasRole(requiredRole: UserRole): Promise<boolean> {
  try {
    const userData = await getCurrentUser()
    return userData?.role === requiredRole
  } catch (error) {
    console.error('[Has Role Error]:', error)
    return false
  }
}

// Check if user has any of the specified roles
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<boolean> {
  try {
    const userData = await getCurrentUser()
    return userData?.role ? requiredRoles.includes(userData.role) : false
  } catch (error) {
    console.error('[Has Any Role Error]:', error)
    return false
  }
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin')
}

// Check if user is staff or higher
export async function isStaffOrHigher(): Promise<boolean> {
  return hasAnyRole(['admin', 'owner', 'manager', 'staff'])
}

// Check if user is manager or higher
export async function isManagerOrHigher(): Promise<boolean> {
  return hasAnyRole(['admin', 'owner', 'manager'])
}

// Check if user is owner or admin
export async function isOwnerOrAdmin(): Promise<boolean> {
  return hasAnyRole(['admin', 'owner'])
}

// Verify user has permission to access salon
export async function hasSalonAccess(salonId: string): Promise<boolean> {
  try {
    const userData = await getCurrentUser()

    if (!userData?.user) {
      return false
    }

    // Admin has access to all salons
    if (userData.role === 'admin') {
      return true
    }

    const supabase = await createClient()

    // Check if user has access to this salon
    const { data: salonAccess } = await supabase
      .from('salon_members')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .single()

    return !!salonAccess
  } catch (error) {
    console.error('[Has Salon Access Error]:', error)
    return false
  }
}

// Verify user owns the salon
export async function ownsSalon(salonId: string): Promise<boolean> {
  try {
    const userData = await getCurrentUser()

    if (!userData?.user) {
      return false
    }

    // Admin has ownership of all salons
    if (userData.role === 'admin') {
      return true
    }

    const supabase = await createClient()

    // Check if user owns this salon
    const { data: salon } = await supabase
      .from('salons')
      .select('owner_id')
      .eq('id', salonId)
      .single()

    return salon?.owner_id === userData.user.id
  } catch (error) {
    console.error('[Owns Salon Error]:', error)
    return false
  }
}

// Check if user can manage appointments
export async function canManageAppointments(salonId: string): Promise<boolean> {
  try {
    const userData = await getCurrentUser()

    if (!userData?.user) {
      return false
    }

    // Admin can manage all appointments
    if (userData.role === 'admin') {
      return true
    }

    // Owner/Manager can manage appointments in their salon
    if ((userData.role === 'owner' || userData.role === 'manager') && await hasSalonAccess(salonId)) {
      return true
    }

    return false
  } catch (error) {
    console.error('[Can Manage Appointments Error]:', error)
    return false
  }
}

// Check if user can manage staff
export async function canManageStaff(salonId: string): Promise<boolean> {
  try {
    const userData = await getCurrentUser()

    if (!userData?.user) {
      return false
    }

    // Admin can manage all staff
    if (userData.role === 'admin') {
      return true
    }

    // Owner/Manager can manage staff in their salon
    if ((userData.role === 'owner' || userData.role === 'manager') && await hasSalonAccess(salonId)) {
      return true
    }

    return false
  } catch (error) {
    console.error('[Can Manage Staff Error]:', error)
    return false
  }
}

// Check if user can view financial data
export async function canViewFinancials(salonId: string): Promise<boolean> {
  try {
    const userData = await getCurrentUser()

    if (!userData?.user) {
      return false
    }

    // Admin can view all financials
    if (userData.role === 'admin') {
      return true
    }

    // Owner can view financials for their salon
    if (userData.role === 'owner' && await ownsSalon(salonId)) {
      return true
    }

    return false
  } catch (error) {
    console.error('[Can View Financials Error]:', error)
    return false
  }
}

// Check if user can access customer data
export async function canAccessCustomerData(customerId?: string): Promise<boolean> {
  try {
    const userData = await getCurrentUser()

    if (!userData?.user) {
      return false
    }

    // Admin can access all customer data
    if (userData.role === 'admin') {
      return true
    }

    // Staff/Manager/Owner can access customer data in their salons
    if (isStaffOrHigher()) {
      return true
    }

    // Customer can only access their own data
    if (userData.role === 'customer' && customerId) {
      return userData.user.id === customerId
    }

    return false
  } catch (error) {
    console.error('[Can Access Customer Data Error]:', error)
    return false
  }
}

// Require authentication (throws if not authenticated)
export async function requireAuth(): Promise<AuthUserData> {
  const userData = await getCurrentUser()

  if (!userData?.user) {
    throw new Error('Authentication required')
  }

  return userData
}

// Require specific role (throws if not authorized)
export async function requireRole(requiredRole: UserRole): Promise<AuthUserData> {
  const userData = await requireAuth()

  if (userData.role !== requiredRole) {
    throw new Error(`Role '${requiredRole}' required`)
  }

  return userData
}

// Require any of the specified roles
export async function requireAnyRole(requiredRoles: UserRole[]): Promise<AuthUserData> {
  const userData = await requireAuth()

  if (!userData.role || !requiredRoles.includes(userData.role)) {
    throw new Error(`One of roles [${requiredRoles.join(', ')}] required`)
  }

  return userData
}

// Require salon access
export async function requireSalonAccess(salonId: string): Promise<AuthUserData> {
  const userData = await requireAuth()

  const hasAccess = await hasSalonAccess(salonId)
  if (!hasAccess) {
    throw new Error('Salon access required')
  }

  return userData
}