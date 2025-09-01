'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions from database
type AppointmentService = Database['public']['Tables']['appointment_services']['Row']
type AppointmentServiceInsert = Database['public']['Tables']['appointment_services']['Insert']
type AppointmentServiceUpdate = Database['public']['Tables']['appointment_services']['Update']
type Service = Database['public']['Tables']['services']['Row']

// Extended type with service details
export type AppointmentServiceWithDetails = AppointmentService & {
  service: Service
}

/**
 * Get all services for an appointment
 * @param appointmentId - The appointment ID
 * @returns Array of appointment services with details
 */
export async function getAppointmentServices(
  appointmentId: string
): Promise<AppointmentServiceWithDetails[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .select(`
      *,
      service:services(*)
    `)
    .eq('appointment_id', appointmentId)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching appointment services:', error)
    throw new Error('Failed to fetch appointment services')
  }
  
  return data || []
}

/**
 * Add services to an appointment
 * @param services - Array of services to add
 * @returns Array of created appointment services
 */
export async function addAppointmentServices(
  services: AppointmentServiceInsert[]
): Promise<AppointmentService[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .insert(services)
    .select()
  
  if (error) {
    console.error('Error adding appointment services:', error)
    throw new Error('Failed to add appointment services')
  }
  
  return data || []
}

/**
 * Update an appointment service
 * @param id - The appointment service ID
 * @param updates - The fields to update
 * @returns The updated appointment service
 */
export async function updateAppointmentService(
  id: string,
  updates: AppointmentServiceUpdate
): Promise<AppointmentService> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating appointment service:', error)
    throw new Error('Failed to update appointment service')
  }
  
  return data
}

/**
 * Remove a service from an appointment
 * @param id - The appointment service ID to remove
 */
export async function removeAppointmentService(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('appointment_services')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error removing appointment service:', error)
    throw new Error('Failed to remove appointment service')
  }
}

/**
 * Replace all services for an appointment
 * @param appointmentId - The appointment ID
 * @param services - New array of services
 * @returns Array of created appointment services
 */
export async function replaceAppointmentServices(
  appointmentId: string,
  services: Omit<AppointmentServiceInsert, 'appointment_id'>[]
): Promise<AppointmentService[]> {
  const supabase = await createClient()
  
  // Delete existing services
  const { error: deleteError } = await supabase
    .from('appointment_services')
    .delete()
    .eq('appointment_id', appointmentId)
  
  if (deleteError) {
    console.error('Error removing existing services:', deleteError)
    throw new Error('Failed to update appointment services')
  }
  
  // Add new services
  if (services.length === 0) {
    return []
  }
  
  const servicesWithAppointmentId = services.map((service, index) => ({
    ...service,
    appointment_id: appointmentId,
    display_order: index + 1
  }))
  
  const { data, error } = await supabase
    .from('appointment_services')
    .insert(servicesWithAppointmentId)
    .select()
  
  if (error) {
    console.error('Error adding new services:', error)
    throw new Error('Failed to update appointment services')
  }
  
  return data || []
}

/**
 * Calculate total duration and price for appointment services
 * @param appointmentId - The appointment ID
 * @returns Total duration in minutes and total price
 */
export async function calculateAppointmentTotals(appointmentId: string): Promise<{
  totalDuration: number
  totalPrice: number
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointment_services')
    .select('duration_minutes, price')
    .eq('appointment_id', appointmentId)
  
  if (error) {
    console.error('Error calculating appointment totals:', error)
    throw new Error('Failed to calculate appointment totals')
  }
  
  const totalDuration = data?.reduce((sum, service) => sum + service.duration_minutes, 0) || 0
  const totalPrice = data?.reduce((sum, service) => sum + service.price, 0) || 0
  
  return { totalDuration, totalPrice }
}

/**
 * Reorder appointment services
 * @param appointmentId - The appointment ID
 * @param serviceIds - Array of service IDs in desired order
 */
export async function reorderAppointmentServices(
  appointmentId: string,
  serviceIds: string[]
): Promise<void> {
  const supabase = await createClient()
  
  // Update display order for each service
  const updates = serviceIds.map((id, index) => ({
    id,
    display_order: index + 1
  }))
  
  for (const update of updates) {
    const { error } = await supabase
      .from('appointment_services')
      .update({ display_order: update.display_order })
      .eq('id', update.id)
      .eq('appointment_id', appointmentId)
    
    if (error) {
      console.error('Error reordering services:', error)
      throw new Error('Failed to reorder appointment services')
    }
  }
}

/**
 * Get appointment services by service ID
 * @param serviceId - The service ID
 * @param dateFrom - Optional start date filter
 * @param dateTo - Optional end date filter
 * @returns Array of appointment services
 */
export async function getAppointmentServicesByService(
  serviceId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<AppointmentService[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('appointment_services')
    .select('*')
    .eq('service_id', serviceId)
  
  if (dateFrom || dateTo) {
    // Would need to join with appointments table for date filtering
    query = supabase
      .from('appointment_services')
      .select(`
        *,
        appointment:appointments!inner(booking_date)
      `)
      .eq('service_id', serviceId)
    
    if (dateFrom) {
      query = query.gte('appointment.booking_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('appointment.booking_date', dateTo)
    }
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching appointment services by service:', error)
    throw new Error('Failed to fetch appointment services')
  }
  
  return data || []
}