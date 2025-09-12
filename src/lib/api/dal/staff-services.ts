import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from './auth'
import { Database } from '@/types/database.types'

// type StaffService = Database['public']['Tables']['staff_services']['Row']
type StaffServiceInsert = Database['public']['Tables']['staff_services']['Insert']
type StaffServiceUpdate = Database['public']['Tables']['staff_services']['Update']

export const getStaffServices = cache(async (staffId: string) => {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions based on role
  if (session.user.role === 'customer') {
    throw new Error('Unauthorized')
  }
  
  if (session.user.role === 'staff' && staffId !== session.user.id) {
    throw new Error('Unauthorized: Can only view own services')
  }
  
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      *,
      services (
        id,
        name,
        description,
        duration,
        price,
        category_id,
        service_categories (
          id,
          name
        )
      )
    `)
    .eq('staff_id', staffId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
})

export const getStaffServicesBySalon = cache(async (salonId: string) => {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (!['super_admin', 'salon_owner', 'salon_manager'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
  
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      *,
      staff_profiles!inner (
        id,
        user_id,
        salon_id,
        profiles (
          id,
          full_name,
          email
        )
      ),
      services (
        id,
        name,
        description,
        duration,
        price,
        category_id
      )
    `)
    .eq('staff_profiles.salon_id', salonId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
})

export async function createStaffService(data: StaffServiceInsert) {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (!['super_admin', 'salon_owner', 'salon_manager', 'staff'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
  
  // Staff can only add services for themselves
  if (session.user.role === 'staff' && data.staff_id !== session.user.id) {
    throw new Error('Unauthorized: Can only manage own services')
  }
  
  // Verify staff belongs to the right salon if not super_admin
  if (session.user.role !== 'super_admin') {
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
  
  const { data: newService, error } = await supabase
    .from('staff_services')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return newService
}

export async function updateStaffService(id: string, data: StaffServiceUpdate) {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (!['super_admin', 'salon_owner', 'salon_manager', 'staff'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
  
  // Get the existing staff service
  const { data: existingService } = await supabase
    .from('staff_services')
    .select('staff_id')
    .eq('id', id)
    .single()
  
  if (!existingService) {
    throw new Error('Staff service not found')
  }
  
  // Staff can only update their own services
  if (session.user.role === 'staff' && existingService.staff_id !== session.user.id) {
    throw new Error('Unauthorized: Can only manage own services')
  }
  
  const { data: updatedService, error } = await supabase
    .from('staff_services')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return updatedService
}

export async function deleteStaffService(id: string) {
  const session = await requireAuth()
  const supabase = await createClient()
  
  // Check permissions
  if (!['super_admin', 'salon_owner', 'salon_manager', 'staff'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
  
  // Get the existing staff service
  const { data: existingService } = await supabase
    .from('staff_services')
    .select('staff_id')
    .eq('id', id)
    .single()
  
  if (!existingService) {
    throw new Error('Staff service not found')
  }
  
  // Staff can only delete their own services
  if (session.user.role === 'staff' && existingService.staff_id !== session.user.id) {
    throw new Error('Unauthorized: Can only manage own services')
  }
  
  const { error } = await supabase
    .from('staff_services')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
}

export const getAvailableServicesForStaff = cache(async (staffId: string, salonId: string) => {
  await requireAuth() // Verify user is authenticated
  const supabase = await createClient()
  
  // Get services that the staff member doesn't already have
  const { data: existingServices } = await supabase
    .from('staff_services')
    .select('service_id')
    .eq('staff_id', staffId)
  
  const existingServiceIds = existingServices?.map(s => s.service_id) || []
  
  let query = supabase
    .from('services')
    .select(`
      *,
      service_categories (
        id,
        name
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name')
  
  if (existingServiceIds.length > 0) {
    query = query.not('id', 'in', existingServiceIds)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
})