import { createClient } from '@/lib/supabase/client'
import { ScheduleFormData, BreakFormData, ScheduleData } from '@/types/features/schedule-types'

export async function fetchScheduleData(selectedDate: Date): Promise<ScheduleData | null> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!staffProfile) return null

    const { data: schedules } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('staff_id', staffProfile.id)
      .eq('is_active', true)

    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
    
    const { data: breaks } = await supabase
      .from('staff_breaks')
      .select('*')
      .eq('staff_id', staffProfile.id)

    const { data: timeOffRequests } = await supabase
      .from('time_off_requests')
      .select('*')
      .eq('staff_id', staffProfile.id)
      .in('status', ['approved', 'pending'])
      .gte('end_date', monthStart.toISOString().split('T')[0])
      .lte('start_date', monthEnd.toISOString().split('T')[0])

    return {
      schedules: schedules || [],
      breaks: breaks || [],
      timeOffRequests: timeOffRequests || []
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching schedule data:', error)
    }
    return null
  }
}

export async function saveSchedule(scheduleForm: ScheduleFormData, scheduleData: ScheduleData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: staffProfile } = await supabase
    .from('staff_profiles')
    .select('id, salon_id')
    .eq('profile_id', user.id)
    .single()

  if (!staffProfile) throw new Error('Staff profile not found')

  const existingSchedule = scheduleData.schedules.find(
    s => s.day_of_week === scheduleForm.dayOfWeek
  )

  if (existingSchedule) {
    const { error } = await supabase
      .from('staff_schedules')
      .update({
        start_time: scheduleForm.startTime,
        end_time: scheduleForm.endTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSchedule.id)

    if (error) throw error
  } else {
    const { error } = await supabase
      .from('staff_schedules')
      .insert({
        staff_id: staffProfile.id,
        salon_id: staffProfile.salon_id,
        day_of_week: scheduleForm.dayOfWeek,
        start_time: scheduleForm.startTime,
        end_time: scheduleForm.endTime,
        is_active: true
      })

    if (error) throw error
  }
}

export async function saveBreak(breakForm: BreakFormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: staffProfile } = await supabase
    .from('staff_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!staffProfile) throw new Error('Staff profile not found')

  const dayOfWeek = new Date(breakForm.breakDate).getDay()

  const { error } = await supabase
    .from('staff_breaks')
    .insert({
      staff_id: staffProfile.id,
      day_of_week: dayOfWeek,
      start_time: breakForm.startTime,
      end_time: breakForm.endTime,
      break_type: 'lunch'
    })

  if (error) throw error
}