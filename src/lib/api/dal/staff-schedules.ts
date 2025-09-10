import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type StaffSchedule = Tables['staff_schedules']['Row']
type StaffScheduleInsert = Tables['staff_schedules']['Insert']
type StaffScheduleUpdate = Tables['staff_schedules']['Update']

export interface StaffScheduleDTO {
  id: string
  staff_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_working: boolean
  created_at: string
  updated_at: string
}

function toStaffScheduleDTO(schedule: StaffSchedule): StaffScheduleDTO {
  return {
    id: schedule.id,
    staff_id: schedule.staff_id,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    is_working: schedule.is_working ?? true,
    created_at: schedule.created_at || new Date().toISOString(),
    updated_at: schedule.updated_at || new Date().toISOString()
  }
}

export const getStaffSchedules = cache(async (
  staffId: string
): Promise<StaffScheduleDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .order('day_of_week')
  
  if (error) {
    console.error('Error fetching staff schedules:', error)
    return []
  }
  
  return (data || []).map(toStaffScheduleDTO)
})

export const getSalonStaffSchedules = cache(async (
  salonId: string
): Promise<StaffScheduleDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('staff_id, day_of_week')
  
  if (error) {
    console.error('Error fetching salon staff schedules:', error)
    return []
  }
  
  return (data || []).map(toStaffScheduleDTO)
})

export const getStaffScheduleByDay = cache(async (
  staffId: string,
  dayOfWeek: number
): Promise<StaffScheduleDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true)
    .single()
  
  if (error) {
    console.error('Error fetching staff schedule by day:', error)
    return null
  }
  
  return data ? toStaffScheduleDTO(data) : null
})

export async function createStaffSchedule(
  schedule: StaffScheduleInsert
): Promise<StaffScheduleDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_schedules')
    .insert(schedule)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating staff schedule:', error)
    throw new Error('Failed to create staff schedule')
  }
  
  return data ? toStaffScheduleDTO(data) : null
}

export async function updateStaffSchedule(
  id: string,
  updates: StaffScheduleUpdate
): Promise<StaffScheduleDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating staff schedule:', error)
    throw new Error('Failed to update staff schedule')
  }
  
  return data ? toStaffScheduleDTO(data) : null
}

export async function deleteStaffSchedule(id: string): Promise<boolean> {
  await requireAuth()
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('staff_schedules')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting staff schedule:', error)
    throw new Error('Failed to delete staff schedule')
  }
  
  return true
}

export async function bulkUpdateStaffSchedules(
  staffId: string,
  schedules: StaffScheduleInsert[]
): Promise<StaffScheduleDTO[]> {
  await requireAuth()
  const supabase = await createClient()
  
  // Delete existing schedules
  const { error: deleteError } = await supabase
    .from('staff_schedules')
    .delete()
    .eq('staff_id', staffId)
  
  if (deleteError) {
    console.error('Error deleting existing schedules:', deleteError)
    throw new Error('Failed to update staff schedules')
  }
  
  // Insert new schedules
  const { data, error } = await supabase
    .from('staff_schedules')
    .insert(schedules)
    .select()
  
  if (error) {
    console.error('Error creating staff schedules:', error)
    throw new Error('Failed to create staff schedules')
  }
  
  return (data || []).map(toStaffScheduleDTO)
}