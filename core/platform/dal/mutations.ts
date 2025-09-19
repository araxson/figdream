import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

// Update salon status (admin action)
export async function updateSalonStatus(salonId: string, status: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    const { error } = await supabase
      .from('salons')
      .update({ status })
      .eq('id', salonId)

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

// Update user role (admin action)
export async function updateUserRole(userId: string, role: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    const { error } = await supabase
      .from('profiles')
      .update({ role })
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