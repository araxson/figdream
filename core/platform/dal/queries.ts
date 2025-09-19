import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

// Get platform analytics data
export async function getPlatformAnalytics(): Promise<any> {
  const supabase = createServerComponentClient<Database>({ cookies })

  // Platform-wide analytics queries would go here
  // This is a placeholder for the consolidated platform analytics
  return {}
}

// Get all salons for admin management
export async function getAllSalons(): Promise<Database['public']['Views']['salons']['Row'][]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: salons, error } = await supabase
    .from('salons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return salons || []
}

// Get all users for admin management
export async function getAllUsers(): Promise<Database['public']['Views']['profiles']['Row'][]> {
  const supabase = createServerComponentClient<Database>({ cookies })

  const { data: users, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return users || []
}

// Get system monitoring data
export async function getSystemHealth(): Promise<any> {
  const supabase = createServerComponentClient<Database>({ cookies })

  // System health monitoring queries would go here
  // This is a placeholder for consolidated monitoring data
  return {}
}