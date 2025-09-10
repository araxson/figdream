import { createClient } from '@/lib/supabase/client'
import { TimeOffFormData, TimeOffRequest } from './time-off-types'

export async function fetchTimeOffRequests(): Promise<TimeOffRequest[]> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!staffProfile) return []

    const { data } = await supabase
      .from('time_off_requests')
      .select('*')
      .eq('staff_id', staffProfile.id)
      .order('created_at', { ascending: false })

    return data || []
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching time off requests:', error)
    }
    return []
  }
}

export async function submitTimeOffRequest(formData: TimeOffFormData) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data: staffProfile } = await supabase
    .from('staff_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!staffProfile) throw new Error('Staff profile not found')

  const { error } = await supabase
    .from('time_off_requests')
    .insert({
      staff_id: staffProfile.id,
      start_date: formData.startDate,
      end_date: formData.endDate,
      reason: formData.reason,
      request_type: 'vacation',
      status: 'pending'
    })

  if (error) throw error
}

export async function cancelTimeOffRequest(requestId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('time_off_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)

  if (error) throw error
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}