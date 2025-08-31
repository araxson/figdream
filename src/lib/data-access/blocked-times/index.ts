'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type BlockedTime = Database['public']['Tables']['blocked_times']['Row']
type BlockedTimeInsert = Database['public']['Tables']['blocked_times']['Insert']
type BlockedTimeUpdate = Database['public']['Tables']['blocked_times']['Update']

// Get blocked times for a salon or staff member
export async function getBlockedTimes(options?: {
  salonId?: string
  staffId?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createClient()
  
  let query = supabase
    .from('blocked_times')
    .select(`
      *,
      staff_profiles (
        id,
        full_name,
        email
      ),
      salons (
        id,
        name
      )
    `)
    .order('start_time', { ascending: false })

  if (options?.salonId) {
    query = query.eq('salon_id', options.salonId)
  }

  if (options?.staffId) {
    query = query.eq('staff_id', options.staffId)
  }

  if (options?.startDate && options?.endDate) {
    query = query
      .gte('start_time', options.startDate)
      .lte('end_time', options.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching blocked times:', error)
    throw new Error('Failed to fetch blocked times')
  }

  return data
}

export async function createBlockedTime(blockedTime: BlockedTimeInsert) {
  const supabase = await createClient()
  
  // Validate that end time is after start time
  if (new Date(blockedTime.end_time) <= new Date(blockedTime.start_time)) {
    throw new Error('End time must be after start time')
  }

  // Check for overlapping blocked times
  const overlapping = await checkOverlappingBlockedTimes({
    staffId: blockedTime.staff_id,
    salonId: blockedTime.salon_id,
    startTime: blockedTime.start_time,
    endTime: blockedTime.end_time
  })

  if (overlapping) {
    throw new Error('This time slot overlaps with existing blocked time')
  }

  const { data, error } = await supabase
    .from('blocked_times')
    .insert(blockedTime)
    .select()
    .single()

  if (error) {
    console.error('Error creating blocked time:', error)
    throw new Error('Failed to create blocked time')
  }

  revalidatePath('/salon-admin/blocked-times')
  revalidatePath('/staff/schedule')
  
  return data
}

export async function updateBlockedTime(id: string, updates: BlockedTimeUpdate) {
  const supabase = await createClient()
  
  // Validate times if both are provided
  if (updates.start_time && updates.end_time) {
    if (new Date(updates.end_time) <= new Date(updates.start_time)) {
      throw new Error('End time must be after start time')
    }
  }

  const { data, error } = await supabase
    .from('blocked_times')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating blocked time:', error)
    throw new Error('Failed to update blocked time')
  }

  revalidatePath('/salon-admin/blocked-times')
  revalidatePath('/staff/schedule')
  
  return data
}

export async function deleteBlockedTime(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('blocked_times')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting blocked time:', error)
    throw new Error('Failed to delete blocked time')
  }

  revalidatePath('/salon-admin/blocked-times')
  revalidatePath('/staff/schedule')
  
  return { success: true }
}

// Create recurring blocked times (e.g., lunch breaks)
export async function createRecurringBlockedTimes(params: {
  staffId?: string
  salonId?: string
  startDate: string
  endDate: string
  timeSlot: { startTime: string; endTime: string }
  daysOfWeek: number[] // 0 = Sunday, 6 = Saturday
  reason: string
  blockType: Database['public']['Enums']['block_type']
}) {
  const supabase = await createClient()
  const blockedTimes: BlockedTimeInsert[] = []
  
  const currentDate = new Date(params.startDate)
  const endDate = new Date(params.endDate)
  
  while (currentDate <= endDate) {
    if (params.daysOfWeek.includes(currentDate.getDay())) {
      const startDateTime = new Date(currentDate)
      const [startHour, startMinute] = params.timeSlot.startTime.split(':')
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0)
      
      const endDateTime = new Date(currentDate)
      const [endHour, endMinute] = params.timeSlot.endTime.split(':')
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0)
      
      blockedTimes.push({
        staff_id: params.staffId,
        salon_id: params.salonId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        reason: params.reason,
        block_type: params.blockType,
        is_recurring: true
      })
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  if (blockedTimes.length === 0) {
    throw new Error('No blocked times to create for selected days')
  }

  const { data, error } = await supabase
    .from('blocked_times')
    .insert(blockedTimes)
    .select()

  if (error) {
    console.error('Error creating recurring blocked times:', error)
    throw new Error('Failed to create recurring blocked times')
  }

  revalidatePath('/salon-admin/blocked-times')
  revalidatePath('/staff/schedule')
  
  return data
}

// Check if a time slot is available (not blocked)
export async function isTimeSlotAvailable(params: {
  staffId?: string
  salonId?: string
  startTime: string
  endTime: string
}): Promise<boolean> {
  const overlapping = await checkOverlappingBlockedTimes(params)
  return !overlapping
}

// Check for overlapping blocked times
async function checkOverlappingBlockedTimes(params: {
  staffId?: string
  salonId?: string
  startTime: string
  endTime: string
  excludeId?: string
}): Promise<boolean> {
  const supabase = await createClient()
  
  let query = supabase
    .from('blocked_times')
    .select('id')
    .or(`and(start_time.lt.${params.endTime},end_time.gt.${params.startTime})`)

  if (params.staffId) {
    query = query.eq('staff_id', params.staffId)
  }

  if (params.salonId && !params.staffId) {
    query = query.eq('salon_id', params.salonId)
  }

  if (params.excludeId) {
    query = query.neq('id', params.excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking overlapping blocked times:', error)
    return false
  }

  return data.length > 0
}

// Get blocked times for calendar view
export async function getBlockedTimesForCalendar(
  year: number,
  month: number,
  salonId?: string,
  staffId?: string
) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  
  return getBlockedTimes({
    salonId,
    staffId,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  })
}