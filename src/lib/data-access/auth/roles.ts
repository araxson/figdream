'use server'
import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from './verify'
type UserRole = Database['public']['Enums']['user_role_type']
export interface RoleCheckResult {
  hasRole: boolean
  error: string | null
}
export interface RoleUpdateResult {
  success: boolean
  error: string | null
}
/**
 * Check if current user has a specific role
 */
export async function hasRole(requiredRole: UserRole): Promise<RoleCheckResult> {
  try {
    const { user, error } = await getUserWithRole()
    if (error || !user) {
      return { hasRole: false, error: error || 'User not found' }
    }
    return { hasRole: user.role === requiredRole, error: null }
  } catch (_error) {
    return { hasRole: false, error: 'Failed to check role' }
  }
}
/**
 * Check if current user has any of the specified roles
 */
export async function hasAnyRole(requiredRoles: UserRole[]): Promise<RoleCheckResult> {
  try {
    const { user, error } = await getUserWithRole()
    if (error || !user) {
      return { hasRole: false, error: error || 'User not found' }
    }
    return { hasRole: requiredRoles.includes(user.role), error: null }
  } catch (_error) {
    return { hasRole: false, error: 'Failed to check roles' }
  }
}
/**
 * Check if current user is super admin
 */
export async function isSuperAdmin(): Promise<RoleCheckResult> {
  return hasRole('super_admin')
}
/**
 * Check if current user is salon admin
 */
export async function isSalonOwner(): Promise<RoleCheckResult> {
  return hasRole('salon_owner')
}
/**
 * Check if current user is location admin
 */
export async function isLocationManager(): Promise<RoleCheckResult> {
  return hasRole('location_manager')
}
/**
 * Check if current user is staff member
 */
export async function isStaff(): Promise<RoleCheckResult> {
  return hasRole('staff')
}
/**
 * Check if current user is customer
 */
export async function isCustomer(): Promise<RoleCheckResult> {
  return hasRole('customer')
}
/**
 * Check if current user is admin (super_admin, salon_owner, or location_manager)
 */
export async function isAdmin(): Promise<RoleCheckResult> {
  return hasAnyRole(['super_admin', 'salon_owner', 'location_manager'])
}
/**
 * Check if current user can manage salons (super_admin or salon_owner)
 */
export async function canManageSalons(): Promise<RoleCheckResult> {
  return hasAnyRole(['super_admin', 'salon_owner'])
}
/**
 * Check if current user can manage locations (super_admin, salon_owner, or location_manager)
 */
export async function canManageLocations(): Promise<RoleCheckResult> {
  return hasAnyRole(['super_admin', 'salon_owner', 'location_manager'])
}
/**
 * Check if current user can manage staff (super_admin, salon_owner, or location_manager)
 */
export async function canManageStaff(): Promise<RoleCheckResult> {
  return hasAnyRole(['super_admin', 'salon_owner', 'location_manager'])
}
/**
 * Check if current user can view all data (super_admin)
 */
export async function canViewAllData(): Promise<RoleCheckResult> {
  return hasRole('super_admin')
}
/**
 * Update user role (super admin only)
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<RoleUpdateResult> {
  try {
    // Check if current user is super admin
    const { hasRole: isSuper, error: roleError } = await isSuperAdmin()
    if (roleError) {
      return { success: false, error: roleError }
    }
    if (!isSuper) {
      return { success: false, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Check if user has existing role
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle()
    if (existingRole) {
      // Deactivate existing role
      const { error: deactivateError } = await supabase
        .from('user_roles')
        .update({ is_active: false })
        .eq('id', existingRole.id)
      if (deactivateError) {
        return { success: false, error: 'Failed to deactivate existing role' }
      }
    }
    // Create new role entry in user_roles table
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: newRole,
        is_active: true,
        permissions: {}, // Default permissions
        assigned_by: (await supabase.auth.getUser()).data.user?.id
      })
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, error: null }
  } catch (_error) {
    return { success: false, error: 'Failed to update user role' }
  }
}
/**
 * Get role hierarchy level (for permission checks)
 */
export function getRoleLevel(role: UserRole): number {
  const roleLevels: Record<UserRole, number> = {
    customer: 1,
    staff: 2,
    location_manager: 3,
    salon_owner: 4,
    super_admin: 5
  }
  return roleLevels[role] || 0
}
/**
 * Check if user has higher or equal role level
 */
export async function hasMinimumRoleLevel(minimumRole: UserRole): Promise<RoleCheckResult> {
  try {
    const { user, error } = await getUserWithRole()
    if (error || !user) {
      return { hasRole: false, error: error || 'User not found' }
    }
    const userLevel = getRoleLevel(user.role)
    const requiredLevel = getRoleLevel(minimumRole)
    return { hasRole: userLevel >= requiredLevel, error: null }
  } catch (_error) {
    return { hasRole: false, error: 'Failed to check role level' }
  }
}