'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions from database
type ServiceAvailability = Database['public']['Tables']['service_availability']['Row']
type ServiceAvailabilityInsert = Database['public']['Tables']['service_availability']['Insert']
type ServiceAvailabilityUpdate = Database['public']['Tables']['service_availability']['Update']
type Service = Database['public']['Tables']['services']['Row']
type Location = Database['public']['Tables']['locations']['Row']

// Extended types
export type ServiceAvailabilityWithDetails = ServiceAvailability & {
  service: Service
  location: Location
}

export interface AvailabilityFilters {
  service_id?: string
  location_id?: string
  day_of_week?: number
  is_available?: boolean
}

export interface TimeSlot {
  start: string
  end: string
}

/**
 * Get service availability with filters
 * @param filters - Filtering options
 * @returns Array of service availability records
 */
export async function getServiceAvailability(
  filters: AvailabilityFilters = {}
): Promise<ServiceAvailability[]> {
  const supabase = await createClient()
  
  let query = supabase.from('service_availability').select('*')
  
  if (filters.service_id) {
    query = query.eq('service_id', filters.service_id)
  }
  if (filters.location_id) {
    query = query.eq('location_id', filters.location_id)
  }
  if (filters.day_of_week !== undefined) {
    query = query.eq('day_of_week', filters.day_of_week)
  }
  if (filters.is_available !== undefined) {
    query = query.eq('is_available', filters.is_available)
  }
  
  const { data, error } = await query.order('day_of_week', { ascending: true })
  
  if (error) {
    console.error('Error fetching service availability:', error)
    throw new Error('Failed to fetch service availability')
  }
  
  return data || []
}

/**
 * Get service availability for a specific location
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @returns Array of availability records for all days
 */
export async function getServiceLocationAvailability(
  serviceId: string,
  locationId: string
): Promise<ServiceAvailability[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_availability')
    .select('*')
    .eq('service_id', serviceId)
    .eq('location_id', locationId)
    .order('day_of_week', { ascending: true })
  
  if (error) {
    console.error('Error fetching service location availability:', error)
    throw new Error('Failed to fetch service availability')
  }
  
  return data || []
}

/**
 * Check if a service is available at a location on a specific day
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @param dayOfWeek - Day of week (0 = Sunday, 6 = Saturday)
 * @param time - Optional specific time to check
 * @returns Whether the service is available
 */
export async function isServiceAvailable(
  serviceId: string,
  locationId: string,
  dayOfWeek: number,
  time?: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_availability')
    .select('*')
    .eq('service_id', serviceId)
    .eq('location_id', locationId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking service availability:', error)
    throw new Error('Failed to check service availability')
  }
  
  if (!data) {
    return false
  }
  
  // If no specific time requested, just check if available that day
  if (!time) {
    return true
  }
  
  // Check if time falls within available hours
  if (data.start_time && data.end_time) {
    return time >= data.start_time && time <= data.end_time
  }
  
  return true
}

/**
 * Create or update service availability
 * @param availability - The availability data
 * @returns The created or updated availability record
 */
export async function upsertServiceAvailability(
  availability: ServiceAvailabilityInsert
): Promise<ServiceAvailability> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_availability')
    .upsert(availability, {
      onConflict: 'service_id,location_id,day_of_week'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error upserting service availability:', error)
    throw new Error('Failed to update service availability')
  }
  
  return data
}

/**
 * Update service availability
 * @param id - The availability record ID
 * @param updates - The fields to update
 * @returns The updated availability record
 */
export async function updateServiceAvailability(
  id: string,
  updates: ServiceAvailabilityUpdate
): Promise<ServiceAvailability> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_availability')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating service availability:', error)
    throw new Error('Failed to update service availability')
  }
  
  return data
}

/**
 * Delete service availability record
 * @param id - The availability record ID
 */
export async function deleteServiceAvailability(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('service_availability')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting service availability:', error)
    throw new Error('Failed to delete service availability')
  }
}

/**
 * Set weekly availability for a service at a location
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @param weeklySchedule - Map of day to availability settings
 * @returns Array of created/updated availability records
 */
export async function setWeeklyServiceAvailability(
  serviceId: string,
  locationId: string,
  weeklySchedule: Map<number, {
    is_available: boolean
    start_time?: string
    end_time?: string
    max_bookings?: number
  }>
): Promise<ServiceAvailability[]> {
  const supabase = await createClient()
  
  const availabilityRecords: ServiceAvailabilityInsert[] = []
  
  for (const [dayOfWeek, settings] of weeklySchedule) {
    availabilityRecords.push({
      service_id: serviceId,
      location_id: locationId,
      day_of_week: dayOfWeek,
      ...settings
    })
  }
  
  const { data, error } = await supabase
    .from('service_availability')
    .upsert(availabilityRecords, {
      onConflict: 'service_id,location_id,day_of_week'
    })
    .select()
  
  if (error) {
    console.error('Error setting weekly availability:', error)
    throw new Error('Failed to set weekly availability')
  }
  
  return data || []
}

/**
 * Get available services at a location for a specific date/time
 * @param locationId - The location ID
 * @param datetime - The date and time to check
 * @returns Array of available services
 */
export async function getAvailableServicesAtLocation(
  locationId: string,
  datetime: string
): Promise<Service[]> {
  const supabase = await createClient()
  
  const date = new Date(datetime)
  const dayOfWeek = date.getDay()
  const time = date.toTimeString().slice(0, 5) // HH:MM format
  
  const { data, error } = await supabase
    .from('service_availability')
    .select(`
      service:services(*)
    `)
    .eq('location_id', locationId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_available', true)
    .or(`start_time.is.null,start_time.lte.${time}`)
    .or(`end_time.is.null,end_time.gte.${time}`)
  
  if (error) {
    console.error('Error fetching available services:', error)
    throw new Error('Failed to fetch available services')
  }
  
  return data?.map(item => item.service).filter(Boolean) as Service[] || []
}

/**
 * Get locations where a service is available
 * @param serviceId - The service ID
 * @param dayOfWeek - Optional day of week filter
 * @returns Array of locations where the service is available
 */
export async function getServiceLocations(
  serviceId: string,
  dayOfWeek?: number
): Promise<Location[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('service_availability')
    .select(`
      location:locations(*)
    `)
    .eq('service_id', serviceId)
    .eq('is_available', true)
  
  if (dayOfWeek !== undefined) {
    query = query.eq('day_of_week', dayOfWeek)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching service locations:', error)
    throw new Error('Failed to fetch service locations')
  }
  
  // Deduplicate locations
  const locationMap = new Map<string, Location>()
  data?.forEach(item => {
    if (item.location) {
      locationMap.set(item.location.id, item.location as Location)
    }
  })
  
  return Array.from(locationMap.values())
}

/**
 * Copy service availability from one location to another
 * @param serviceId - The service ID
 * @param sourceLocationId - Source location ID
 * @param targetLocationId - Target location ID
 * @returns Array of created availability records
 */
export async function copyServiceAvailability(
  serviceId: string,
  sourceLocationId: string,
  targetLocationId: string
): Promise<ServiceAvailability[]> {
  const supabase = await createClient()
  
  // Get source availability
  const { data: sourceAvailability, error: fetchError } = await supabase
    .from('service_availability')
    .select('*')
    .eq('service_id', serviceId)
    .eq('location_id', sourceLocationId)
  
  if (fetchError || !sourceAvailability) {
    console.error('Error fetching source availability:', fetchError)
    throw new Error('Failed to fetch source availability')
  }
  
  // Create availability for target location
  const targetAvailability: ServiceAvailabilityInsert[] = sourceAvailability.map(avail => ({
    service_id: serviceId,
    location_id: targetLocationId,
    day_of_week: avail.day_of_week,
    is_available: avail.is_available,
    start_time: avail.start_time,
    end_time: avail.end_time,
    max_bookings: avail.max_bookings
  }))
  
  const { data, error } = await supabase
    .from('service_availability')
    .upsert(targetAvailability, {
      onConflict: 'service_id,location_id,day_of_week'
    })
    .select()
  
  if (error) {
    console.error('Error copying availability:', error)
    throw new Error('Failed to copy availability')
  }
  
  return data || []
}

/**
 * Check booking capacity for a service at a location
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @param date - The date to check
 * @returns Available booking capacity
 */
export async function checkServiceCapacity(
  serviceId: string,
  locationId: string,
  date: string
): Promise<{ maxBookings: number; currentBookings: number; availableSlots: number }> {
  const supabase = await createClient()
  
  const dayOfWeek = new Date(date).getDay()
  
  // Get service availability settings
  const { data: availability, error: availError } = await supabase
    .from('service_availability')
    .select('max_bookings')
    .eq('service_id', serviceId)
    .eq('location_id', locationId)
    .eq('day_of_week', dayOfWeek)
    .single()
  
  if (availError && availError.code !== 'PGRST116') {
    console.error('Error fetching availability:', availError)
    throw new Error('Failed to check service capacity')
  }
  
  const maxBookings = availability?.max_bookings || Number.MAX_SAFE_INTEGER
  
  // Count current bookings
  const { count, error: countError } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('location_id', locationId)
    .eq('booking_date', date)
    .in('status', ['confirmed', 'pending'])
  
  if (countError) {
    console.error('Error counting bookings:', countError)
    throw new Error('Failed to count bookings')
  }
  
  const currentBookings = count || 0
  const availableSlots = Math.max(0, maxBookings - currentBookings)
  
  return {
    maxBookings,
    currentBookings,
    availableSlots
  }
}

/**
 * Bulk enable/disable services at a location
 * @param locationId - The location ID
 * @param serviceIds - Array of service IDs
 * @param isAvailable - Whether to enable or disable
 * @returns Number of updated records
 */
export async function bulkUpdateServiceAvailability(
  locationId: string,
  serviceIds: string[],
  isAvailable: boolean
): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_availability')
    .update({ is_available: isAvailable })
    .eq('location_id', locationId)
    .in('service_id', serviceIds)
    .select()
  
  if (error) {
    console.error('Error bulk updating availability:', error)
    throw new Error('Failed to update service availability')
  }
  
  return data?.length || 0
}