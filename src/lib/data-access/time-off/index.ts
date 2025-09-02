'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type StaffTimeOff = Database['public']['Tables']['staff_time_off']['Row']
type StaffTimeOffInsert = Database['public']['Tables']['staff_time_off']['Insert']
type StaffTimeOffUpdate = Database['public']['Tables']['staff_time_off']['Update']
type TimeOffRequest = Database['public']['Tables']['time_off_requests']['Row']
type TimeOffRequestInsert = Database['public']['Tables']['time_off_requests']['Insert']
type TimeOffRequestUpdate = Database['public']['Tables']['time_off_requests']['Update']

// Staff Time Off Management
export async function getStaffTimeOff(staffId?: string) {
  const supabase = await createClient()
  
  const query = supabase
    .from('staff_time_off')
    .select(`
      *,
      staff_profiles (
        id,
        full_name,
        email
      )
    `)
    .order('start_date', { ascending: false })

  if (staffId) {
    query.eq('staff_id', staffId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching staff time off:', error)
    throw new Error('Failed to fetch staff time off')
  }

  return data
}

export async function createStaffTimeOff(timeOff: StaffTimeOffInsert) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_time_off')
    .insert(timeOff)
    .select()
    .single()

  if (error) {
    console.error('Error creating staff time off:', error)
    throw new Error('Failed to create staff time off')
  }

  revalidatePath('/salon-admin/staff/timeoff')
  revalidatePath('/staff/timeoff')
  
  return data
}

export async function updateStaffTimeOff(id: string, updates: StaffTimeOffUpdate) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_time_off')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating staff time off:', error)
    throw new Error('Failed to update staff time off')
  }

  revalidatePath('/salon-admin/staff/timeoff')
  revalidatePath('/staff/timeoff')
  
  return data
}

export async function deleteStaffTimeOff(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('staff_time_off')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting staff time off:', error)
    throw new Error('Failed to delete staff time off')
  }

  revalidatePath('/salon-admin/staff/timeoff')
  revalidatePath('/staff/timeoff')
  
  return { success: true }
}

// Time Off Requests Management
export async function getTimeOffRequests(staffId?: string, status?: string) {
  const supabase = await createClient()
  
  const query = supabase
    .from('time_off_requests')
    .select(`
      *,
      staff_profiles (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })

  if (staffId) {
    query.eq('staff_id', staffId)
  }

  if (status) {
    query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching time off requests:', error)
    throw new Error('Failed to fetch time off requests')
  }

  return data
}

export async function createTimeOffRequest(request: TimeOffRequestInsert) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('time_off_requests')
    .insert(request)
    .select()
    .single()

  if (error) {
    console.error('Error creating time off request:', error)
    throw new Error('Failed to create time off request')
  }

  revalidatePath('/salon-admin/staff/timeoff/requests')
  revalidatePath('/staff/timeoff')
  
  return data
}

export async function updateTimeOffRequest(id: string, updates: TimeOffRequestUpdate) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('time_off_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating time off request:', error)
    throw new Error('Failed to update time off request')
  }

  revalidatePath('/salon-admin/staff/timeoff/requests')
  revalidatePath('/staff/timeoff')
  
  return data
}

export async function approveTimeOffRequest(id: string, approvedBy: string) {
  const supabase = await createClient()
  
  // Get the request details
  const { data: request, error: fetchError } = await supabase
    .from('time_off_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !request) {
    throw new Error('Failed to fetch time off request')
  }

  // Update request status
  const { error: updateError } = await supabase
    .from('time_off_requests')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)

  if (updateError) {
    throw new Error('Failed to approve time off request')
  }

  // Create staff time off entry
  const { error: createError } = await supabase
    .from('staff_time_off')
    .insert({
      staff_id: request.staff_id,
      start_date: request.start_date,
      end_date: request.end_date,
      reason: request.reason,
      all_day: request.all_day || true,
      created_by: approvedBy
    })

  if (createError) {
    throw new Error('Failed to create staff time off entry')
  }

  revalidatePath('/salon-admin/staff/timeoff')
  revalidatePath('/staff/timeoff')
  
  return { success: true }
}

export async function rejectTimeOffRequest(id: string, rejectedBy: string, rejectionReason?: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('time_off_requests')
    .update({
      status: 'rejected',
      approved_by: rejectedBy,
      approved_at: new Date().toISOString(),
      notes: rejectionReason
    })
    .eq('id', id)

  if (error) {
    throw new Error('Failed to reject time off request')
  }

  revalidatePath('/salon-admin/staff/timeoff/requests')
  revalidatePath('/staff/timeoff')
  
  return { success: true }
}

// Get time off for a specific date range
export async function getTimeOffForDateRange(
  startDate: string,
  endDate: string,
  salonId?: string
) {
  const supabase = await createClient()
  
  const query = supabase
    .from('staff_time_off')
    .select(`
      *,
      staff_profiles (
        id,
        full_name,
        email,
        salon_id
      )
    `)
    .or(`and(start_date.lte.${endDate},end_date.gte.${startDate})`)

  if (salonId) {
    query.eq('staff_profiles.salon_id', salonId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching time off for date range:', error)
    throw new Error('Failed to fetch time off for date range')
  }

  return data
}

// Check if staff member is available on a specific date
export async function isStaffAvailable(staffId: string, date: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_time_off')
    .select('id')
    .eq('staff_id', staffId)
    .lte('start_date', date)
    .gte('end_date', date)
    .limit(1)

  if (error) {
    console.error('Error checking staff availability:', error)
    return true // Default to available if error
  }

  return data.length === 0
}