import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

type ProfileUpdate = Database['public']['Views']['profiles']['Update']

// Update user profile
export async function updateUserProfile(userId: string, updates: ProfileUpdate): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Update user password
export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}