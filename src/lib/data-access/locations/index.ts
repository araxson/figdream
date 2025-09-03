import { Database } from '@/types/database.types'
import { createClient } from '@/lib/database/supabase/server'
import { cache } from 'react'
type SalonLocationInsert = Database['public']['Tables']['salon_locations']['Insert']
type SalonLocationUpdate = Database['public']['Tables']['salon_locations']['Update']
/**
 * Get all locations for a salon
 */
export const getSalonLocations = cache(async (salonId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salon_locations')
    .select(`
      *,
      service_location_availability (
        service_id,
        is_available
      )
    `)
    .eq('salon_id', salonId)
    .order('is_primary', { ascending: false })
    .order('created_at')
  if (error) {
    return []
  }
  return data || []
})
/**
 * Get a single location by ID
 */
export const getLocationById = cache(async (locationId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('salon_locations')
    .select(`
      *,
      salons (
        id,
        name,
        slug
      ),
      service_location_availability (
        service_id,
        is_available
      )
    `)
    .eq('id', locationId)
    .single()
  if (error) {
    return null
  }
  return data
})
/**
 * Create a new salon location
 */
export async function createSalonLocation(location: SalonLocationInsert) {
  const supabase = await createClient()
  // Check user permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  // Validate required fields
  if (!location.salon_id || !location.name || !location.address) {
    throw new Error('Missing required fields')
  }
  // If this is set as primary, unset other primary locations
  if (location.is_primary) {
    await supabase
      .from('salon_locations')
      .update({ is_primary: false })
      .eq('salon_id', location.salon_id)
  }
  const { data, error } = await supabase
    .from('salon_locations')
    .insert(location)
    .select()
    .single()
  if (error) {
    throw new Error('Failed to create location')
  }
  return data
}
/**
 * Update a salon location
 */
export async function updateSalonLocation(
  locationId: string,
  updates: SalonLocationUpdate
) {
  const supabase = await createClient()
  // Check user permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  // If setting as primary, unset other primary locations
  if (updates.is_primary && updates.salon_id) {
    await supabase
      .from('salon_locations')
      .update({ is_primary: false })
      .eq('salon_id', updates.salon_id)
      .neq('id', locationId)
  }
  const { data, error } = await supabase
    .from('salon_locations')
    .update(updates)
    .eq('id', locationId)
    .select()
    .single()
  if (error) {
    throw new Error('Failed to update location')
  }
  return data
}
/**
 * Delete a salon location
 */
export async function deleteSalonLocation(locationId: string) {
  const supabase = await createClient()
  // Check user permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  // Check if this is the last location
  const { data: location } = await supabase
    .from('salon_locations')
    .select('salon_id, is_primary')
    .eq('id', locationId)
    .single()
  if (location?.is_primary) {
    throw new Error('Cannot delete primary location. Set another location as primary first.')
  }
  const { error } = await supabase
    .from('salon_locations')
    .delete()
    .eq('id', locationId)
  if (error) {
    throw new Error('Failed to delete location')
  }
  return true
}
/**
 * Update service availability for a location
 */
export async function updateServiceAvailability(
  locationId: string,
  serviceId: string,
  isAvailable: boolean
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('service_location_availability')
    .upsert({
      location_id: locationId,
      service_id: serviceId,
      is_available: isAvailable
    })
    .select()
    .single()
  if (error) {
    throw new Error('Failed to update service availability')
  }
  return data
}
/**
 * Get location statistics
 */
export const getLocationStats = cache(async (locationId: string) => {
  const supabase = await createClient()
  // Get appointment counts
  const today = new Date().toISOString().split('T')[0]
  const [appointments, revenue, staff] = await Promise.all([
    // Appointment stats
    supabase
      .from('appointments')
      .select('id, status', { count: 'exact' })
      .eq('location_id', locationId)
      .gte('date', today),
    // Revenue stats (last 30 days)
    supabase
      .from('appointments')
      .select('total_amount')
      .eq('location_id', locationId)
      .eq('status', 'completed')
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    // Staff count
    supabase
      .from('staff_profiles')
      .select('id', { count: 'exact' })
      .eq('primary_location_id', locationId)
      .eq('is_active', true)
  ])
  const totalRevenue = revenue.data?.reduce((sum, apt) => sum + (apt.total_amount || 0), 0) || 0
  const upcomingCount = appointments.data?.filter(apt => apt.status === 'confirmed').length || 0
  const staffCount = staff.count || 0
  return {
    upcomingAppointments: upcomingCount,
    monthlyRevenue: totalRevenue,
    activeStaff: staffCount,
    totalAppointments: appointments.count || 0
  }
})
/**
 * Get available services at a location
 */
export const getLocationServices = cache(async (locationId: string) => {
  const supabase = await createClient()
  // First get the salon_id for this location
  const { data: location } = await supabase
    .from('salon_locations')
    .select('salon_id')
    .eq('id', locationId)
    .single()
  if (!location) return []
  // Get all services for the salon with their availability at this location
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      service_categories (
        id,
        name
      ),
      service_location_availability!left (
        is_available
      )
    `)
    .eq('salon_id', location.salon_id)
    .eq('is_active', true)
    .eq('service_location_availability.location_id', locationId)
    .order('category_id')
    .order('name')
  if (error) {
    return []
  }
  // Filter to only available services
  return data?.filter(service => 
    service.service_location_availability?.[0]?.is_available !== false
  ) || []
})
/**
 * Clone location settings to another location
 */
export async function cloneLocationSettings(
  sourceLocationId: string,
  targetLocationId: string
) {
  const supabase = await createClient()
  // Get source location service availability
  const { data: sourceServices } = await supabase
    .from('service_location_availability')
    .select('service_id, is_available')
    .eq('location_id', sourceLocationId)
  if (!sourceServices || sourceServices.length === 0) {
    return { success: true, message: 'No settings to clone' }
  }
  // Clone to target location
  const clonedSettings = sourceServices.map(setting => ({
    ...setting,
    location_id: targetLocationId
  }))
  const { error } = await supabase
    .from('service_location_availability')
    .upsert(clonedSettings)
  if (error) {
    throw new Error('Failed to clone location settings')
  }
  return { success: true, message: 'Settings cloned successfully' }
}