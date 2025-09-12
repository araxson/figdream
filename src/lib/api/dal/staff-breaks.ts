import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from './auth'
import { Database } from '@/types/database.types'

type StaffBreakInsert = Database['public']['Tables']['staff_breaks']['Insert']
type StaffBreakUpdate = Database['public']['Tables']['staff_breaks']['Update']

export const getStaffBreaks = cache(async (staffId?: string, dayOfWeek?: number) => {
  const session = await requireAuth()
  const supabase = await createClient()
  
  let query = supabase
    .from('staff_breaks')
    .select('*')
    .order('day_of_week', { ascending: true, nullsFirst: false })
    .order('start_time')

  // Apply staff filter
  if (staffId) {
    // Check permissions
    if (session.user.role === 'staff') {
      // Staff can only see their own breaks
      const { data: staffProfile } = await supabase
        .from('staff_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single()
      
      if (!staffProfile || staffProfile.id !== staffId) {
        throw new Error('Unauthorized: Can only view own breaks')
      }
    }
    query = query.eq('staff_id', staffId)
  } else if (session.user.role === 'staff') {
    // If no staffId provided and user is staff, show only their breaks
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
    
    if (staffProfile) {
      query = query.eq('staff_id', staffProfile.id)
    }
  } else if (!['super_admin', 'salon_owner', 'salon_manager'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }

  // Apply day of week filter
  if (dayOfWeek !== undefined) {
    query = query.eq('day_of_week', dayOfWeek)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data
})

export const getStaffBreaksBySalon = cache(async (salonId: string, dayOfWeek?: number) => {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (!['super_admin', 'salon_owner', 'salon_manager'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
  
  // For salon owners, verify they own the salon
  if (session.user.role === 'salon_owner') {
    const { data: salon } = await supabase
      .from('salons')
      .select('id')
      .eq('id', salonId)
      .eq('created_by', session.user.id)
      .single()
    
    if (!salon) {
      throw new Error('Unauthorized: Not the salon owner')
    }
  }
  
  let query = supabase
    .from('staff_breaks')
    .select(`
      *,
      staff_profiles!inner (
        id,
        salon_id,
        user_id,
        profiles (
          id,
          full_name,
          email
        )
      )
    `)
    .eq('staff_profiles.salon_id', salonId)
    .order('day_of_week', { ascending: true, nullsFirst: false })
    .order('start_time')

  if (dayOfWeek !== undefined) {
    query = query.eq('day_of_week', dayOfWeek)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data
})

export async function createStaffBreak(data: StaffBreakInsert) {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (session.user.role === 'customer') {
    throw new Error('Unauthorized')
  }
  
  // Staff can only create breaks for themselves
  if (session.user.role === 'staff') {
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
    
    if (!staffProfile || staffProfile.id !== data.staff_id) {
      throw new Error('Unauthorized: Can only create own breaks')
    }
  }
  
  // Verify staff belongs to the right salon if not super_admin
  if (session.user.role !== 'super_admin' && data.staff_id) {
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('salon_id')
      .eq('id', data.staff_id)
      .single()
    
    if (!staffProfile) {
      throw new Error('Staff profile not found')
    }
    
    // For salon owners, verify they own the salon
    if (session.user.role === 'salon_owner') {
      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('id', staffProfile.salon_id)
        .eq('created_by', session.user.id)
        .single()
      
      if (!salon) {
        throw new Error('Unauthorized: Staff does not belong to your salon')
      }
    }
  }
  
  const { data: newBreak, error } = await supabase
    .from('staff_breaks')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return newBreak
}

export async function updateStaffBreak(id: string, data: StaffBreakUpdate) {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (session.user.role === 'customer') {
    throw new Error('Unauthorized')
  }
  
  // Get the existing break
  const { data: existingBreak } = await supabase
    .from('staff_breaks')
    .select('staff_id')
    .eq('id', id)
    .single()
  
  if (!existingBreak) {
    throw new Error('Break not found')
  }
  
  // Staff can only update their own breaks
  if (session.user.role === 'staff') {
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
    
    if (!staffProfile || staffProfile.id !== existingBreak.staff_id) {
      throw new Error('Unauthorized: Can only update own breaks')
    }
  }
  
  const { data: updatedBreak, error } = await supabase
    .from('staff_breaks')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return updatedBreak
}

export async function deleteStaffBreak(id: string) {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (session.user.role === 'customer') {
    throw new Error('Unauthorized')
  }
  
  // Get the existing break
  const { data: existingBreak } = await supabase
    .from('staff_breaks')
    .select('staff_id')
    .eq('id', id)
    .single()
  
  if (!existingBreak) {
    throw new Error('Break not found')
  }
  
  // Staff can only delete their own breaks
  if (session.user.role === 'staff') {
    const { data: staffProfile } = await supabase
      .from('staff_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()
    
    if (!staffProfile || staffProfile.id !== existingBreak.staff_id) {
      throw new Error('Unauthorized: Can only delete own breaks')
    }
  }
  
  const { error } = await supabase
    .from('staff_breaks')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}