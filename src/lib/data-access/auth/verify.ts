'use server'
import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
type UserRole = Database['public']['Enums']['user_role_type']
type User = Database['public']['Tables']['profiles']['Row']
export interface AuthResult {
  user: User | null
  error: string | null
}
export interface UserWithRole extends User {
  role: UserRole
}
/**
 * Get the current authenticated user
 * Returns user from profiles table, not auth.users
 */
export async function getUser(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return { user: null, error: 'Not authenticated' }
    }
    // Get user profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()
    if (profileError || !profile) {
      return { user: null, error: 'User profile not found' }
    }
    return { user: profile, error: null }
  } catch (_error) {
    return { user: null, error: 'Failed to get user' }
  }
}
/**
 * Get the current user with their role from user_roles table
 */
export async function getUserWithRole(): Promise<{ user: UserWithRole | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return { user: null, error: 'Not authenticated' }
    }
    // Get role from user_roles table instead of raw_app_meta_data
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', authUser.id)
      .eq('is_active', true)
      .maybeSingle()
    if (roleError) {
      return { user: null, error: 'User role not found' }
    }
    const role = roleData?.role || 'customer'
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()
    if (profileError || !profile) {
      return { user: null, error: 'User profile not found' }
    }
    const userWithRole: UserWithRole = {
      ...profile,
      role
    }
    return { user: userWithRole, error: null }
  } catch (_error) {
    return { user: null, error: 'Failed to get user with role' }
  }
}
/**
 * Verify if user is authenticated
 */
export async function verifyAuthenticated(): Promise<{ authenticated: boolean; error: string | null }> {
  try {
    const { user, error } = await getUser()
    return { authenticated: !!user, error }
  } catch (_error) {
    return { authenticated: false, error: 'Failed to verify authentication' }
  }
}
/**
 * Get user's role from user_roles table
 */
export async function getUserRole(): Promise<{ role: UserRole | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return { role: null, error: 'Not authenticated' }
    }
    // Query user_roles table instead of using raw_app_meta_data
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    if (roleError) {
      return { role: null, error: 'User role not found' }
    }
    const role = roleData?.role || 'customer'
    return { role, error: null }
  } catch (_error) {
    return { role: null, error: 'Failed to get user role' }
  }
}
/**
 * Get user ID
 */
export async function getUserId(): Promise<{ userId: string | null; error: string | null }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return { userId: null, error: 'Not authenticated' }
    }
    return { userId: user.id, error: null }
  } catch (_error) {
    return { userId: null, error: 'Failed to get user ID' }
  }
}
/**
 * Refresh user session
 */
export async function refreshSession(): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.refreshSession()
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, error: null }
  } catch (_error) {
    return { success: false, error: 'Failed to refresh session' }
  }
}