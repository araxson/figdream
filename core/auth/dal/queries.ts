import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

type AuthUser = Database['public']['Views']['profiles']['Row']

// Get current authenticated user profile
export async function getCurrentUserProfile(): Promise<AuthUser | null> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return null

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return profile
}

// Get user by email
export async function getUserByEmail(email: string): Promise<AuthUser | null> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single()

  if (error) return null
  return profile
}

// Check if user has specific role
export async function userHasRole(userId: string, role: string): Promise<boolean> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !profile) return false
  return profile.role === role
}