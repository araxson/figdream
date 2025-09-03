'use server'
import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
// Type definitions from database
type StaffSchedule = Database['public']['Tables']['staff_schedules']['Row']
type StaffScheduleInsert = Database['public']['Tables']['staff_schedules']['Insert']
// type StaffScheduleUpdate = Database['public']['Tables']['staff_schedules']['Update']
export interface WeeklySchedule {
  monday: StaffSchedule | null
  tuesday: StaffSchedule | null
  wednesday: StaffSchedule | null
  thursday: StaffSchedule | null
  friday: StaffSchedule | null
  saturday: StaffSchedule | null
  sunday: StaffSchedule | null
}
export interface ScheduleAvailability {
  date: string
  dayOfWeek: number
  isWorking: boolean
  startTime: string | null
  endTime: string | null
  availableSlots: TimeSlot[]
}
export interface TimeSlot {
  start: string
  end: string
  available: boolean
}
/**
 * Get staff schedule for all days of the week
 * @param staffId - The staff member ID
 * @returns Weekly schedule object
 */
export async function getStaffWeeklySchedule(staffId: string): Promise<WeeklySchedule> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .order('day_of_week', { ascending: true })
  if (error) {
    throw new Error('Failed to fetch staff schedule')
  }
  // Initialize weekly schedule
  const weeklySchedule: WeeklySchedule = {
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
    sunday: null
  }
  // Map schedules to days (0 = Sunday, 1 = Monday, etc.)
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  data?.forEach(schedule => {
    const dayName = dayNames[schedule.day_of_week] as keyof WeeklySchedule
    if (dayName) {
      weeklySchedule[dayName] = schedule
    }
  })
  return weeklySchedule
}
/**
 * Get staff schedule for a specific day
 * @param staffId - The staff member ID
 * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @returns Schedule for the specified day
 */
export async function getStaffDaySchedule(
  staffId: string,
  dayOfWeek: number
): Promise<StaffSchedule | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .single()
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    throw new Error('Failed to fetch staff schedule')
  }
  return data
}
/**
 * Create or update staff schedule for a day
 * @param schedule - The schedule data
 * @returns The created or updated schedule
 */
export async function upsertStaffSchedule(
  schedule: StaffScheduleInsert
): Promise<StaffSchedule> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_schedules')
    .upsert(schedule, {
      onConflict: 'staff_id,day_of_week'
    })
    .select()
    .single()
  if (error) {
    throw new Error('Failed to update staff schedule')
  }
  return data
}
/**
 * Update multiple staff schedules at once
 * @param staffId - The staff member ID
 * @param schedules - Array of schedules to update
 * @returns Array of updated schedules
 */
export async function updateStaffWeeklySchedule(
  staffId: string,
  schedules: Omit<StaffScheduleInsert, 'staff_id'>[]
): Promise<StaffSchedule[]> {
  const supabase = await createClient()
  // Add staff_id to each schedule
  const schedulesWithStaffId = schedules.map(schedule => ({
    ...schedule,
    staff_id: staffId
  }))
  const { data, error } = await supabase
    .from('staff_schedules')
    .upsert(schedulesWithStaffId, {
      onConflict: 'staff_id,day_of_week'
    })
    .select()
  if (error) {
    throw new Error('Failed to update weekly schedule')
  }
  return data || []
}
/**
 * Delete staff schedule for a specific day
 * @param staffId - The staff member ID
 * @param dayOfWeek - Day of week to delete
 */
export async function deleteStaffDaySchedule(
  staffId: string,
  dayOfWeek: number
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('staff_schedules')
    .delete()
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
  if (error) {
    throw new Error('Failed to delete staff schedule')
  }
}
/**
 * Check if staff is available at a specific time
 * @param staffId - The staff member ID
 * @param date - The date to check
 * @param startTime - Start time to check
 * @param endTime - End time to check
 * @returns Whether the staff is available
 */
export async function checkStaffAvailability(
  staffId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const supabase = await createClient()
  // Get day of week from date
  const dayOfWeek = new Date(date).getDay()
  // Get staff schedule for that day
  const { data: schedule, error } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .single()
  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to check availability')
  }
  // If no schedule or not working, not available
  if (!schedule || !schedule.is_working) {
    return false
  }
  // Check if requested time is within working hours
  const scheduleStart = schedule.start_time
  const scheduleEnd = schedule.end_time
  return startTime >= scheduleStart && endTime <= scheduleEnd
}
/**
 * Get available time slots for a staff member on a date
 * @param staffId - The staff member ID
 * @param date - The date to check
 * @param slotDuration - Duration of each slot in minutes
 * @returns Array of available time slots
 */
export async function getStaffAvailableSlots(
  staffId: string,
  date: string,
  slotDuration: number = 30
): Promise<TimeSlot[]> {
  const supabase = await createClient()
  // Get day of week from date
  const dayOfWeek = new Date(date).getDay()
  // Get staff schedule
  const { data: schedule, error: scheduleError } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .single()
  if (scheduleError && scheduleError.code !== 'PGRST116') {
    throw new Error('Failed to fetch schedule')
  }
  if (!schedule || !schedule.is_working) {
    return []
  }
  // Get existing appointments for this staff on this date
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('booking_date', date)
    .in('status', ['confirmed', 'pending'])
  if (appointmentsError) {
    throw new Error('Failed to fetch appointments')
  }
  // Generate all possible time slots
  const slots: TimeSlot[] = []
  const startHour = parseInt(schedule.start_time.split(':')[0])
  const startMinute = parseInt(schedule.start_time.split(':')[1])
  const endHour = parseInt(schedule.end_time.split(':')[0])
  const endMinute = parseInt(schedule.end_time.split(':')[1])
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute
  for (let minutes = startMinutes; minutes < endMinutes; minutes += slotDuration) {
    const slotStart = `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`
    const slotEndMinutes = minutes + slotDuration
    const slotEnd = `${Math.floor(slotEndMinutes / 60).toString().padStart(2, '0')}:${(slotEndMinutes % 60).toString().padStart(2, '0')}`
    // Check if slot conflicts with any appointment
    const isAvailable = !appointments?.some(apt => {
      return (slotStart >= apt.start_time && slotStart < apt.end_time) ||
             (slotEnd > apt.start_time && slotEnd <= apt.end_time) ||
             (slotStart <= apt.start_time && slotEnd >= apt.end_time)
    })
    slots.push({
      start: slotStart,
      end: slotEnd,
      available: isAvailable
    })
  }
  return slots
}
/**
 * Get all staff schedules for a salon
 * @param salonId - The salon ID
 * @returns Array of staff schedules with staff details
 */
export async function getSalonStaffSchedules(salonId: string): Promise<StaffSchedule[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_schedules')
    .select(`
      *,
      staff:staff_profiles!inner(
        id,
        full_name,
        salon_id
      )
    `)
    .eq('staff.salon_id', salonId)
    .order('day_of_week', { ascending: true })
  if (error) {
    throw new Error('Failed to fetch staff schedules')
  }
  return data || []
}
/**
 * Copy schedule from one staff to another
 * @param sourceStaffId - Source staff member ID
 * @param targetStaffId - Target staff member ID
 * @returns Array of created schedules
 */
export async function copyStaffSchedule(
  sourceStaffId: string,
  targetStaffId: string
): Promise<StaffSchedule[]> {
  const supabase = await createClient()
  // Get source schedule
  const { data: sourceSchedules, error: fetchError } = await supabase
    .from('staff_schedules')
    .select('*')
    .eq('staff_id', sourceStaffId)
  if (fetchError) {
    throw new Error('Failed to fetch source schedule')
  }
  if (!sourceSchedules || sourceSchedules.length === 0) {
    return []
  }
  // Create schedules for target staff
  const targetSchedules = sourceSchedules.map(schedule => ({
    staff_id: targetStaffId,
    day_of_week: schedule.day_of_week,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    is_working: schedule.is_working
  }))
  const { data, error } = await supabase
    .from('staff_schedules')
    .upsert(targetSchedules, {
      onConflict: 'staff_id,day_of_week'
    })
    .select()
  if (error) {
    throw new Error('Failed to copy schedule')
  }
  return data || []
}