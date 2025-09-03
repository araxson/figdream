'use server'
import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'
import { getUserWithRole } from '@/lib/data-access/auth/verify'
import { canAccessSalon, canAccessLocation } from '@/lib/data-access/auth/permissions'
import { hasMinimumRoleLevel } from '@/lib/data-access/auth/roles'
type Service = Database['public']['Tables']['services']['Row']
type ServiceInsert = Database['public']['Tables']['services']['Insert']
type ServiceUpdate = Database['public']['Tables']['services']['Update']
type Category = Database['public']['Tables']['service_categories']['Row']
// SalonService type removed - table doesn't exist in database
export interface ServiceResult {
  data: Service | null
  error: string | null
}
export interface ServicesResult {
  data: Service[] | null
  error: string | null
}
export interface ServiceWithCategory extends Service {
  category: Category | null
}
export interface ServiceWithCategoryResult {
  data: ServiceWithCategory | null
  error: string | null
}
export interface ServicesWithCategoryResult {
  data: ServiceWithCategory[] | null
  error: string | null
}
// SalonServiceResult interface removed - table doesn't exist
export interface ServiceCreateResult {
  data: Service | null
  error: string | null
}
export interface ServiceUpdateResult {
  data: Service | null
  error: string | null
}
export interface ServiceDeleteResult {
  success: boolean
  error: string | null
}
/**
 * Get service by ID
 */
export async function getServiceById(serviceId: string): Promise<ServiceResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', serviceId)
      .single()
    if (error) {
      return { data: null, error: 'Service not found' }
    }
    return { data: service, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get service' }
  }
}
/**
 * Get service with category
 */
export async function getServiceWithCategory(serviceId: string): Promise<ServiceWithCategoryResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        service_categories (*)
      `)
      .eq('id', serviceId)
      .single()
    if (error) {
      return { data: null, error: 'Service not found' }
    }
    const serviceWithCategory: ServiceWithCategory = {
      ...service,
      category: service.service_categories as Category || null
    }
    return { data: serviceWithCategory, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get service with category' }
  }
}
/**
 * Get all services (for super admin) or salon-specific services
 */
export async function getAllServices(): Promise<ServicesResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('name')
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: services || [], error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get services' }
  }
}
/**
 * Get services with categories
 */
export async function getServicesWithCategories(): Promise<ServicesWithCategoryResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        *,
        service_categories (*)
      `)
      .order('name')
    if (error) {
      return { data: null, error: error.message }
    }
    const servicesWithCategories = (services || []).map(service => ({
      ...service,
      category: service.service_categories as Category || null
    }))
    return { data: servicesWithCategories, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get services with categories' }
  }
}
/**
 * Get services for a specific salon
 */
export async function getSalonServices(salonId: string): Promise<{
  data: Array<Service & { 
    custom_price: number | null
    custom_duration: number | null
    is_active: boolean
  }> | null
  error: string | null
}> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }
    const supabase = await createClient()
    const { data: salonServices, error } = await supabase
      .from('salon_services')
      .select(`
        custom_price,
        custom_duration,
        is_active,
        services (*)
      `)
      .eq('salon_id', salonId)
      .eq('is_active', true)
    if (error) {
      return { data: null, error: error.message }
    }
    const services = (salonServices || []).map(ss => ({
      ...(ss.services as Service),
      custom_price: ss.custom_price,
      custom_duration: ss.custom_duration,
      is_active: ss.is_active
    }))
    return { data: services, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get salon services' }
  }
}
/**
 * Get services for a specific location
 */
export async function getLocationServices(locationId: string): Promise<{
  data: Array<Service & { 
    custom_price: number | null
    custom_duration: number | null
    is_active: boolean
  }> | null
  error: string | null
}> {
  try {
    const { allowed, error: permissionError } = await canAccessLocation(locationId)
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Get salon_id from location first
    const { data: location, error: locationError } = await supabase
      .from('locations')
      .select('salon_id')
      .eq('id', locationId)
      .single()
    if (locationError || !location) {
      return { data: null, error: 'Location not found' }
    }
    return getSalonServices(location.salon_id)
  } catch (_error) {
    return { data: null, error: 'Failed to get location services' }
  }
}
/**
 * Get services by category
 */
export async function getServicesByCategory(categoryId: string): Promise<ServicesResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .eq('category_id', categoryId)
      .order('name')
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: services || [], error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to get services by category' }
  }
}
/**
 * Create new service (salon admin and above)
 */
export async function createService(serviceData: ServiceInsert): Promise<ServiceCreateResult> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { data: null, error: roleError }
    }
    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    const { data: service, error } = await supabase
      .from('services')
      .insert({
        ...serviceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: service, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to create service' }
  }
}
/**
 * Update service (salon admin and above)
 */
export async function updateService(serviceId: string, updates: ServiceUpdate): Promise<ServiceUpdateResult> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { data: null, error: roleError }
    }
    if (!hasPermission) {
      return { data: null, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Remove fields that shouldn't be updated directly
    const safeUpdates = { ...updates }
    delete (safeUpdates as Record<string, unknown>).id
    delete (safeUpdates as Record<string, unknown>).created_at
    delete (safeUpdates as Record<string, unknown>).updated_at
    const { data: service, error } = await supabase
      .from('services')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .select('*')
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: service, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to update service' }
  }
}
/**
 * Delete service (salon admin and above)
 */
export async function deleteService(serviceId: string): Promise<ServiceDeleteResult> {
  try {
    const { hasRole: hasPermission, error: roleError } = await hasMinimumRoleLevel('salon_owner')
    if (roleError) {
      return { success: false, error: roleError }
    }
    if (!hasPermission) {
      return { success: false, error: 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Check if service is used in any appointments
    const { count: bookingCount, error: bookingError } = await supabase
      .from('appointment_services')
      .select('*', { count: 'exact', head: true })
      .eq('service_id', serviceId)
    if (bookingError) {
      return { success: false, error: 'Failed to check service usage' }
    }
    if ((bookingCount || 0) > 0) {
      return { success: false, error: 'Cannot delete service that has been used in bookings' }
    }
    // Delete service
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, error: null }
  } catch (_error) {
    return { success: false, error: 'Failed to delete service' }
  }
}
/**
 * Add service to salon
 */
export async function addServiceToSalon(
  salonId: string,
  serviceId: string,
  customPrice?: number,
  customDuration?: number
): Promise<SalonServiceResult> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }
    const supabase = await createClient()
    const { data: salonService, error } = await supabase
      .from('salon_services')
      .insert({
        salon_id: salonId,
        service_id: serviceId,
        custom_price: customPrice,
        custom_duration: customDuration,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: salonService, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to add service to salon' }
  }
}
/**
 * Remove service from salon
 */
export async function removeServiceFromSalon(salonId: string, serviceId: string): Promise<ServiceDeleteResult> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    if (!allowed) {
      return { success: false, error: permissionError || 'Insufficient permissions' }
    }
    const supabase = await createClient()
    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('salon_services')
      .update({ is_active: false })
      .eq('salon_id', salonId)
      .eq('service_id', serviceId)
    if (error) {
      return { success: false, error: error.message }
    }
    return { success: true, error: null }
  } catch (_error) {
    return { success: false, error: 'Failed to remove service from salon' }
  }
}
/**
 * Update salon service pricing/duration
 */
export async function updateSalonService(
  salonId: string,
  serviceId: string,
  updates: {
    custom_price?: number | null
    custom_duration?: number | null
    is_active?: boolean
  }
): Promise<SalonServiceResult> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }
    const supabase = await createClient()
    const { data: salonService, error } = await supabase
      .from('salon_services')
      .update(updates)
      .eq('salon_id', salonId)
      .eq('service_id', serviceId)
      .select('*')
      .single()
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: salonService, error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to update salon service' }
  }
}
/**
 * Search services by name
 */
export async function searchServices(query: string, limit = 20): Promise<ServicesResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }
    const supabase = await createClient()
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(limit)
    if (error) {
      return { data: null, error: error.message }
    }
    return { data: services || [], error: null }
  } catch (_error) {
    return { data: null, error: 'Failed to search services' }
  }
}