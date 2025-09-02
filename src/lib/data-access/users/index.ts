'use server'

import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from '../auth/verify'
import { isSuperAdmin } from '../auth/roles'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface UserResult {
  data: Profile | null
  error: string | null
}

export interface UsersResult {
  data: Profile[] | null
  error: string | null
}

export interface UserCreateResult {
  data: Profile | null
  error: string | null
}

export interface UserUpdateResult {
  data: Profile | null
  error: string | null
}

export interface UserDeleteResult {
  success: boolean
  error: string | null
}

/**
 * Get current user's profile
 */
export async function getCurrentUser(): Promise<UserResult> {
  try {
    const { user, error } = await getUserWithRole()
    
    if (error || !user) {
      return { data: null, error: error || 'User not found' }
    }

    // Remove the role property that was added by getUserWithRole
    const { role, ...profile } = user
    
    return { data: profile, error: null }
  } catch (error) {
    console.error('Error getting current user:', error)
    return { data: null, error: 'Failed to get current user' }
  }
}

/**
 * Get user by ID (with permission check)
 */
export async function getUserById(userId: string): Promise<UserResult> {
  try {
    const { user: currentUser, error: authError } = await getUserWithRole()
    
    if (authError || !currentUser) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    // Super admin can access any user
    // Other users can only access their own profile
    if (currentUser.role !== 'super_admin' && currentUser.user_id !== userId) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      return { data: null, error: 'User not found' }
    }

    return { data: profile, error: null }
  } catch (error) {
    console.error('Error getting user by ID:', error)
    return { data: null, error: 'Failed to get user' }
  }
}

/**
 * Get user by profile ID
 */
export async function getUserByProfileId(profileId: string): Promise<UserResult> {
  try {
    const { user: currentUser, error: authError } = await getUserWithRole()
    
    if (authError || !currentUser) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    // Super admin can access any user
    // Other users can only access their own profile
    if (currentUser.role !== 'super_admin' && currentUser.id !== profileId) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (error) {
      return { data: null, error: 'User not found' }
    }

    return { data: profile, error: null }
  } catch (error) {
    console.error('Error getting user by profile ID:', error)
    return { data: null, error: 'Failed to get user' }
  }
}

/**
 * Get all users (super admin only)
 */
export async function getAllUsers(limit = 50, offset = 0): Promise<UsersResult> {
  try {
    const { hasRole: isSuper, error: roleError } = await isSuperAdmin()
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!isSuper) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: profiles || [], error: null }
  } catch (error) {
    console.error('Error getting all users:', error)
    return { data: null, error: 'Failed to get users' }
  }
}

/**
 * Search users by name or email (super admin only)
 */
export async function searchUsers(query: string, limit = 20): Promise<UsersResult> {
  try {
    const { hasRole: isSuper, error: roleError } = await isSuperAdmin()
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!isSuper) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: profiles || [], error: null }
  } catch (error) {
    console.error('Error searching users:', error)
    return { data: null, error: 'Failed to search users' }
  }
}

/**
 * Update current user's profile
 */
export async function updateCurrentUser(updates: ProfileUpdate): Promise<UserUpdateResult> {
  try {
    const { user: currentUser, error: authError } = await getUserWithRole()
    
    if (authError || !currentUser) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    // Remove fields that users shouldn't be able to update directly
    const safeUpdates = { ...updates }
    delete (safeUpdates as any).id
    delete (safeUpdates as any).user_id
    delete (safeUpdates as any).created_at
    delete (safeUpdates as any).updated_at

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', currentUser.user_id)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: profile, error: null }
  } catch (error) {
    console.error('Error updating current user:', error)
    return { data: null, error: 'Failed to update user' }
  }
}

/**
 * Update user by ID (super admin only)
 */
export async function updateUserById(userId: string, updates: ProfileUpdate): Promise<UserUpdateResult> {
  try {
    const { hasRole: isSuper, error: roleError } = await isSuperAdmin()
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!isSuper) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Remove fields that shouldn't be updated directly
    const safeUpdates = { ...updates }
    delete (safeUpdates as any).id
    delete (safeUpdates as any).user_id
    delete (safeUpdates as any).created_at
    delete (safeUpdates as any).updated_at

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: profile, error: null }
  } catch (error) {
    console.error('Error updating user by ID:', error)
    return { data: null, error: 'Failed to update user' }
  }
}

/**
 * Create user profile (typically called after auth signup)
 */
export async function createUserProfile(profileData: ProfileInsert): Promise<UserCreateResult> {
  try {
    const supabase = await createClient()

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: profile, error: null }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return { data: null, error: 'Failed to create user profile' }
  }
}

/**
 * Delete user (super admin only) - soft delete by deactivating
 */
export async function deleteUser(userId: string): Promise<UserDeleteResult> {
  try {
    const { hasRole: isSuper, error: roleError } = await isSuperAdmin()
    
    if (roleError) {
      return { success: false, error: roleError }
    }

    if (!isSuper) {
      return { success: false, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Instead of hard delete, we deactivate the auth user
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, {
      ban_duration: 'none', // This effectively disables the user
    })
    
    // Also deactivate in user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ is_active: false })
      .eq('user_id', userId)
    
    const error = authError || roleError

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

/**
 * Get users by role (super admin only)
 */
export async function getUsersByRole(role: Database['public']['Enums']['user_role']): Promise<UsersResult> {
  try {
    const { hasRole: isSuper, error: roleError } = await isSuperAdmin()
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!isSuper) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Query user_roles table to get users by role
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', role)
      .eq('is_active', true)

    if (userRolesError) {
      return { data: null, error: userRolesError.message }
    }

    const filteredUserIds = userRoles.map(ur => ur.user_id)

    if (filteredUserIds.length === 0) {
      return { data: [], error: null }
    }

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', filteredUserIds)
      .order('created_at', { ascending: false })

    if (profilesError) {
      return { data: null, error: profilesError.message }
    }

    return { data: profiles || [], error: null }
  } catch (error) {
    console.error('Error getting users by role:', error)
    return { data: null, error: 'Failed to get users by role' }
  }
}