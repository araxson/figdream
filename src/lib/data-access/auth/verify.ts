'use server'

import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']
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
  } catch (error) {
    console.error('Error getting user:', error)
    return { user: null, error: 'Failed to get user' }
  }
}

/**
 * Get the current user with their role
 */
export async function getUserWithRole(): Promise<{ user: UserWithRole | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !authUser) {
      return { user: null, error: 'Not authenticated' }
    }

    // Get role from raw_app_meta_data
    const role = authUser.raw_app_meta_data?.role as UserRole
    if (!role) {
      return { user: null, error: 'User role not found' }
    }

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
  } catch (error) {
    console.error('Error getting user with role:', error)
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
  } catch (error) {
    console.error('Error verifying authentication:', error)
    return { authenticated: false, error: 'Failed to verify authentication' }
  }
}

/**
 * Get user's role
 */
export async function getUserRole(): Promise<{ role: UserRole | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return { role: null, error: 'Not authenticated' }
    }

    const role = user.raw_app_meta_data?.role as UserRole
    if (!role) {
      return { role: null, error: 'User role not found' }
    }

    return { role, error: null }
  } catch (error) {
    console.error('Error getting user role:', error)
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
  } catch (error) {
    console.error('Error getting user ID:', error)
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
  } catch (error) {
    console.error('Error refreshing session:', error)
    return { success: false, error: 'Failed to refresh session' }
  }
}