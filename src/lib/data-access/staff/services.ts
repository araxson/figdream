'use server'
import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
// Type definitions from database
type StaffService = Database['public']['Tables']['staff_services']['Row']
type StaffServiceInsert = Database['public']['Tables']['staff_services']['Insert']
type StaffServiceUpdate = Database['public']['Tables']['staff_services']['Update']
type Service = Database['public']['Tables']['services']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
// Extended types
export type StaffServiceWithDetails = StaffService & {
  service: Service
}
export type ServiceWithStaff = Service & {
  staff: StaffProfile[]
}
/**
 * Get all services a staff member can perform
 * @param staffId - The staff member ID
 * @returns Array of staff services with service details
 */
export async function getStaffServices(staffId: string): Promise<StaffServiceWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      *,
      service:services(*)
    `)
    .eq('staff_id', staffId)
    .eq('can_perform', true)
  if (error) {
    throw new Error('Failed to fetch staff services')
  }
  return data || []
}
/**
 * Get all staff who can perform a specific service
 * @param serviceId - The service ID
 * @returns Array of staff profiles who can perform the service
 */
export async function getStaffByService(serviceId: string): Promise<StaffProfile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      staff:staff_profiles(*)
    `)
    .eq('service_id', serviceId)
    .eq('can_perform', true)
  if (error) {
    throw new Error('Failed to fetch staff by service')
  }
  return data?.map(item => item.staff).filter(Boolean) as StaffProfile[] || []
}
/**
 * Assign services to a staff member
 * @param staffId - The staff member ID
 * @param serviceIds - Array of service IDs to assign
 * @returns Array of created staff services
 */
export async function assignServicesToStaff(
  staffId: string,
  serviceIds: string[]
): Promise<StaffService[]> {
  const supabase = await createClient()
  // Create staff service entries
  const staffServices: StaffServiceInsert[] = serviceIds.map(serviceId => ({
    staff_id: staffId,
    service_id: serviceId,
    can_perform: true
  }))
  const { data, error } = await supabase
    .from('staff_services')
    .upsert(staffServices, {
      onConflict: 'staff_id,service_id'
    })
    .select()
  if (error) {
    throw new Error('Failed to assign services to staff')
  }
  return data || []
}
/**
 * Update staff service capabilities
 * @param staffId - The staff member ID
 * @param serviceId - The service ID
 * @param updates - The fields to update
 * @returns The updated staff service
 */
export async function updateStaffService(
  staffId: string,
  serviceId: string,
  updates: Partial<StaffServiceUpdate>
): Promise<StaffService> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_services')
    .update(updates)
    .eq('staff_id', staffId)
    .eq('service_id', serviceId)
    .select()
    .single()
  if (error) {
    throw new Error('Failed to update staff service')
  }
  return data
}
/**
 * Remove a service from a staff member
 * @param staffId - The staff member ID
 * @param serviceId - The service ID to remove
 */
export async function removeServiceFromStaff(
  staffId: string,
  serviceId: string
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('staff_services')
    .delete()
    .eq('staff_id', staffId)
    .eq('service_id', serviceId)
  if (error) {
    throw new Error('Failed to remove service from staff')
  }
}
/**
 * Update all services for a staff member (replace existing)
 * @param staffId - The staff member ID
 * @param serviceIds - New array of service IDs
 * @returns Array of staff services
 */
export async function updateStaffServices(
  staffId: string,
  serviceIds: string[]
): Promise<StaffService[]> {
  const supabase = await createClient()
  // Delete existing services
  const { error: deleteError } = await supabase
    .from('staff_services')
    .delete()
    .eq('staff_id', staffId)
  if (deleteError) {
    throw new Error('Failed to update staff services')
  }
  // If no services to add, return empty array
  if (serviceIds.length === 0) {
    return []
  }
  // Add new services
  const staffServices: StaffServiceInsert[] = serviceIds.map(serviceId => ({
    staff_id: staffId,
    service_id: serviceId,
    can_perform: true
  }))
  const { data, error } = await supabase
    .from('staff_services')
    .insert(staffServices)
    .select()
  if (error) {
    throw new Error('Failed to update staff services')
  }
  return data || []
}
/**
 * Check if a staff member can perform a service
 * @param staffId - The staff member ID
 * @param serviceId - The service ID
 * @returns Whether the staff can perform the service
 */
export async function canStaffPerformService(
  staffId: string,
  serviceId: string
): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_services')
    .select('can_perform')
    .eq('staff_id', staffId)
    .eq('service_id', serviceId)
    .single()
  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to check staff service capability')
  }
  return data?.can_perform || false
}
/**
 * Set custom duration for a staff service
 * @param staffId - The staff member ID
 * @param serviceId - The service ID
 * @param customDuration - Custom duration in minutes
 * @returns Updated staff service
 */
export async function setStaffServiceDuration(
  staffId: string,
  serviceId: string,
  customDuration: number | null
): Promise<StaffService> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_services')
    .update({ custom_duration: customDuration })
    .eq('staff_id', staffId)
    .eq('service_id', serviceId)
    .select()
    .single()
  if (error) {
    throw new Error('Failed to set custom duration')
  }
  return data
}
/**
 * Get service duration for a specific staff member
 * @param staffId - The staff member ID
 * @param serviceId - The service ID
 * @returns Duration in minutes (custom or default)
 */
export async function getStaffServiceDuration(
  staffId: string,
  serviceId: string
): Promise<number> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      custom_duration,
      service:services(duration)
    `)
    .eq('staff_id', staffId)
    .eq('service_id', serviceId)
    .single()
  if (error && error.code !== 'PGRST116') {
    throw new Error('Failed to fetch service duration')
  }
  // Return custom duration if set, otherwise default service duration
  return data?.custom_duration || data?.service?.duration || 30
}
/**
 * Copy services from one staff to another
 * @param sourceStaffId - Source staff member ID
 * @param targetStaffId - Target staff member ID
 * @returns Array of created staff services
 */
export async function copyStaffServices(
  sourceStaffId: string,
  targetStaffId: string
): Promise<StaffService[]> {
  const supabase = await createClient()
  // Get source staff services
  const { data: sourceServices, error: fetchError } = await supabase
    .from('staff_services')
    .select('*')
    .eq('staff_id', sourceStaffId)
  if (fetchError) {
    throw new Error('Failed to fetch source services')
  }
  if (!sourceServices || sourceServices.length === 0) {
    return []
  }
  // Create services for target staff
  const targetServices: StaffServiceInsert[] = sourceServices.map(service => ({
    staff_id: targetStaffId,
    service_id: service.service_id,
    can_perform: service.can_perform,
    custom_duration: service.custom_duration
  }))
  const { data, error } = await supabase
    .from('staff_services')
    .upsert(targetServices, {
      onConflict: 'staff_id,service_id'
    })
    .select()
  if (error) {
    throw new Error('Failed to copy services')
  }
  return data || []
}
/**
 * Get all staff services for a salon
 * @param salonId - The salon ID
 * @returns Array of staff services with details
 */
export async function getSalonStaffServices(salonId: string): Promise<StaffService[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('staff_services')
    .select(`
      *,
      staff:staff_profiles!inner(
        id,
        full_name,
        salon_id
      ),
      service:services(
        id,
        name,
        duration,
        price
      )
    `)
    .eq('staff.salon_id', salonId)
    .eq('can_perform', true)
  if (error) {
    throw new Error('Failed to fetch staff services')
  }
  return data || []
}