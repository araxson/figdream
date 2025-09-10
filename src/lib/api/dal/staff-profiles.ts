import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type StaffProfile = Tables['staff_profiles']['Row']
type StaffProfileInsert = Tables['staff_profiles']['Insert']
type StaffProfileUpdate = Tables['staff_profiles']['Update']

export interface StaffProfileDTO {
  id: string
  user_id: string
  salon_id: string
  employee_id: string
  location_id: string | null
  title: string | null
  specialties: string[] | null
  bio: string | null
  is_active: boolean
  is_bookable: boolean
  commission_rate: number | null
  address: string | null
  hire_date: string | null
  created_at: string
  updated_at: string
}

function toStaffProfileDTO(profile: StaffProfile): StaffProfileDTO {
  return {
    id: profile.id,
    user_id: profile.user_id,
    salon_id: profile.salon_id,
    employee_id: profile.employee_id,
    location_id: profile.location_id,
    title: profile.title,
    specialties: profile.specialties as string[] | null,
    bio: profile.bio,
    is_active: profile.is_active ?? true,
    is_bookable: profile.is_bookable ?? true,
    commission_rate: profile.commission_rate,
    address: profile.address,
    hire_date: profile.hire_date,
    created_at: profile.created_at || new Date().toISOString(),
    updated_at: profile.updated_at || new Date().toISOString()
  }
}

export const getStaffProfiles = cache(async (): Promise<StaffProfileDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching staff profiles:', error)
    return []
  }
  
  return (data || []).map(toStaffProfileDTO)
})

export const getStaffProfileById = cache(async (
  id: string
): Promise<StaffProfileDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching staff profile:', error)
    return null
  }
  
  return data ? toStaffProfileDTO(data) : null
})

export const getStaffProfilesBySalon = cache(async (
  salonId: string
): Promise<StaffProfileDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('employee_id')
  
  if (error) {
    console.error('Error fetching salon staff profiles:', error)
    return []
  }
  
  return (data || []).map(toStaffProfileDTO)
})

export const getStaffProfileByUserId = cache(async (
  userId: string
): Promise<StaffProfileDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching staff profile by user:', error)
    return null
  }
  
  return data ? toStaffProfileDTO(data) : null
})

export async function createStaffProfile(
  profile: StaffProfileInsert
): Promise<StaffProfileDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .insert(profile)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating staff profile:', error)
    throw new Error('Failed to create staff profile')
  }
  
  return data ? toStaffProfileDTO(data) : null
}

export async function updateStaffProfile(
  id: string,
  updates: StaffProfileUpdate
): Promise<StaffProfileDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating staff profile:', error)
    throw new Error('Failed to update staff profile')
  }
  
  return data ? toStaffProfileDTO(data) : null
}

export async function deleteStaffProfile(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('staff_profiles')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting staff profile:', error)
    throw new Error('Failed to delete staff profile')
  }
  
  return true
}

export async function activateStaffProfile(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('staff_profiles')
    .update({ is_active: true })
    .eq('id', id)
  
  if (error) {
    console.error('Error activating staff profile:', error)
    throw new Error('Failed to activate staff profile')
  }
  
  return true
}

export async function deactivateStaffProfile(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('staff_profiles')
    .update({ is_active: false })
    .eq('id', id)
  
  if (error) {
    console.error('Error deactivating staff profile:', error)
    throw new Error('Failed to deactivate staff profile')
  }
  
  return true
}