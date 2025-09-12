import { cache } from 'react'
import { createServiceClient } from '@/lib/supabase/service'
import { User } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

export interface TimeOffRequest {
  id: string
  staff_id: string
  start_date: string
  end_date: string
  reason: string | null
  status: string
  request_type: string
  created_at: string
  updated_at: string
  approved_by?: string | null
  approved_at?: string | null
  staff?: {
    user: {
      first_name: string
      last_name: string
      email: string
    }
  }
  approver?: {
    first_name: string
    last_name: string
  }
}

export const getTimeOffRequests = cache(async (staffId?: string, status?: string) => {
  const supabase = await createServiceClient()
  
  let query = supabase
    .from('time_off_requests')
    .select(`
      *,
      staff:staff_profiles!staff_id (
        user:profiles (
          first_name,
          last_name,
          email
        )
      ),
      approver:profiles!approved_by (
        first_name,
        last_name
      )
    `)
    .order('created_at', { ascending: false })
  
  if (staffId) {
    query = query.eq('staff_id', staffId)
  }
  
  if (status) {
    query = query.eq('status', status)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching time off requests:', error)
    return []
  }
  
  return data || []
})

export const createTimeOffRequest = async (
  staffId: string,
  startDate: string,
  endDate: string,
  reason: string
) => {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('time_off_requests')
    .insert({
      staff_id: staffId,
      start_date: startDate,
      end_date: endDate,
      reason,
      status: 'pending',
      request_type: 'time_off'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating time off request:', error)
    throw error
  }
  
  return data
}

export const updateTimeOffRequest = async (
  requestId: string,
  status: 'approved' | 'rejected',
  userId: string,
  rejectionReason?: string
) => {
  const supabase = await createServiceClient()
  
  const updateData: any = {
    status,
    approved_by: userId,
    approved_at: new Date().toISOString()
  }
  
  if (status === 'rejected' && rejectionReason) {
    updateData.rejection_reason = rejectionReason
  }
  
  const { data, error } = await supabase
    .from('time_off_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating time off request:', error)
    throw error
  }
  
  // If approved, create staff_time_off entries
  if (status === 'approved' && data) {
    await createStaffTimeOff(data.staff_id, data.start_date, data.end_date, data.reason || 'Time off')
  }
  
  return data
}

export const deleteTimeOffRequest = async (requestId: string) => {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('time_off_requests')
    .delete()
    .eq('id', requestId)
  
  if (error) {
    console.error('Error deleting time off request:', error)
    throw error
  }
  
  return true
}

// Staff Time Off (approved time off)
export const getStaffTimeOff = cache(async (staffId?: string, startDate?: string, endDate?: string) => {
  const supabase = await createServiceClient()
  
  let query = supabase
    .from('staff_time_off')
    .select('*')
    .order('start_date', { ascending: true })
  
  if (staffId) {
    query = query.eq('staff_id', staffId)
  }
  
  if (startDate && endDate) {
    query = query
      .gte('start_date', startDate)
      .lte('end_date', endDate)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching staff time off:', error)
    return []
  }
  
  return data
})

export const createStaffTimeOff = async (
  staffId: string,
  startDate: string,
  endDate: string,
  reason: string
) => {
  const supabase = await createServiceClient()
  
  const { data, error } = await supabase
    .from('staff_time_off')
    .insert({
      staff_id: staffId,
      start_date: startDate,
      end_date: endDate,
      reason
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating staff time off:', error)
    throw error
  }
  
  return data
}

export const deleteStaffTimeOff = async (timeOffId: string) => {
  const supabase = await createServiceClient()
  
  const { error } = await supabase
    .from('staff_time_off')
    .delete()
    .eq('id', timeOffId)
  
  if (error) {
    console.error('Error deleting staff time off:', error)
    throw error
  }
  
  return true
}