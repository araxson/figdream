import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']

export async function getUserById(id: string): Promise<User | null> {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getAllUsers() {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      profiles(*)
    `)
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function getUserActivity(userId: string, limit = 20) {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  // This would typically come from an audit_logs or activity table
  // For now, return empty array as placeholder
  return []
}

export async function getAvailableRoles() {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  // Return available roles - this could come from a roles table
  return [
    { id: 'customer', name: 'Customer' },
    { id: 'staff', name: 'Staff' },
    { id: 'salon_manager', name: 'Salon Manager' },
    { id: 'salon_owner', name: 'Salon Owner' },
    { id: 'super_admin', name: 'Super Admin' }
  ]
}

export async function getUserSecuritySettings(userId: string) {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  // Return security settings - this could come from user preferences or security table
  return {
    twoFactorEnabled: false,
    lastPasswordChange: new Date(),
    loginAttempts: 0,
    accountLocked: false,
    sessionTimeout: 30,
    allowedIpAddresses: []
  }
}

export async function getUsersWithRoles() {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      profiles(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getUserManagementStats() {
  const supabase = createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Unauthorized')

  // Return management stats - this could come from aggregated queries
  return {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalSalons: 0,
    totalStaff: 0
  }
}