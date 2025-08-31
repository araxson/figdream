'use server'

import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database'
import { getUserWithRole } from '../auth/verify'
import { canAccessSalon } from '../auth/permissions'
import { isSuperAdmin, canManageSalons } from '../auth/roles'

type Salon = Database['public']['Tables']['salons']['Row']
type SalonInsert = Database['public']['Tables']['salons']['Insert']
type SalonUpdate = Database['public']['Tables']['salons']['Update']
type Location = Database['public']['Tables']['locations']['Row']

export interface SalonResult {
  data: Salon | null
  error: string | null
}

export interface SalonsResult {
  data: Salon[] | null
  error: string | null
}

export interface SalonWithLocations extends Salon {
  locations: Location[]
}

export interface SalonWithLocationsResult {
  data: SalonWithLocations | null
  error: string | null
}

export interface SalonsWithLocationsResult {
  data: SalonWithLocations[] | null
  error: string | null
}

export interface SalonCreateResult {
  data: Salon | null
  error: string | null
}

export interface SalonUpdateResult {
  data: Salon | null
  error: string | null
}

export interface SalonDeleteResult {
  success: boolean
  error: string | null
}

/**
 * Get salon by ID (with permission check)
 */
export async function getSalonById(salonId: string): Promise<SalonResult> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    const supabase = await createClient()

    const { data: salon, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', salonId)
      .eq('is_active', true)
      .single()

    if (error) {
      return { data: null, error: 'Salon not found' }
    }

    return { data: salon, error: null }
  } catch (error) {
    console.error('Error getting salon by ID:', error)
    return { data: null, error: 'Failed to get salon' }
  }
}

/**
 * Get salon with locations by ID
 */
export async function getSalonWithLocations(salonId: string): Promise<SalonWithLocationsResult> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    const supabase = await createClient()

    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select(`
        *,
        locations (*)
      `)
      .eq('id', salonId)
      .eq('is_active', true)
      .single()

    if (salonError) {
      return { data: null, error: 'Salon not found' }
    }

    // Type assertion since Supabase doesn't perfectly type nested selects
    const salonWithLocations = salon as SalonWithLocations

    return { data: salonWithLocations, error: null }
  } catch (error) {
    console.error('Error getting salon with locations:', error)
    return { data: null, error: 'Failed to get salon with locations' }
  }
}

/**
 * Get all salons (with role-based filtering)
 */
export async function getAllSalons(): Promise<SalonsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('salons')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Filter by ownership for non-super admins
    if (user.role !== 'super_admin') {
      query = query.eq('owner_id', user.user_id)
    }

    const { data: salons, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: salons || [], error: null }
  } catch (error) {
    console.error('Error getting all salons:', error)
    return { data: null, error: 'Failed to get salons' }
  }
}

/**
 * Get salons owned by current user
 */
export async function getUserSalons(): Promise<SalonsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    const { data: salons, error } = await supabase
      .from('salons')
      .select('*')
      .eq('owner_id', user.user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: salons || [], error: null }
  } catch (error) {
    console.error('Error getting user salons:', error)
    return { data: null, error: 'Failed to get user salons' }
  }
}

/**
 * Get salons with their locations (role-based filtering)
 */
export async function getAllSalonsWithLocations(): Promise<SalonsWithLocationsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    let query = supabase
      .from('salons')
      .select(`
        *,
        locations (*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Filter by ownership for non-super admins
    if (user.role !== 'super_admin') {
      query = query.eq('owner_id', user.user_id)
    }

    const { data: salons, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    // Type assertion for nested selects
    const salonsWithLocations = (salons || []) as SalonWithLocations[]

    return { data: salonsWithLocations, error: null }
  } catch (error) {
    console.error('Error getting salons with locations:', error)
    return { data: null, error: 'Failed to get salons with locations' }
  }
}

/**
 * Create new salon (salon admins and super admins only)
 */
export async function createSalon(salonData: Omit<SalonInsert, 'owner_id'>): Promise<SalonCreateResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const { hasRole: canManage, error: roleError } = await canManageSalons()
    
    if (roleError) {
      return { data: null, error: roleError }
    }

    if (!canManage) {
      return { data: null, error: 'Insufficient permissions' }
    }

    const supabase = await createClient()

    const { data: salon, error } = await supabase
      .from('salons')
      .insert({
        ...salonData,
        owner_id: user.user_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true
      })
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: salon, error: null }
  } catch (error) {
    console.error('Error creating salon:', error)
    return { data: null, error: 'Failed to create salon' }
  }
}

/**
 * Update salon by ID (with permission check)
 */
export async function updateSalon(salonId: string, updates: SalonUpdate): Promise<SalonUpdateResult> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Remove fields that shouldn't be updated directly
    const safeUpdates = { ...updates }
    delete (safeUpdates as any).id
    delete (safeUpdates as any).owner_id
    delete (safeUpdates as any).created_at
    delete (safeUpdates as any).updated_at

    const { data: salon, error } = await supabase
      .from('salons')
      .update({
        ...safeUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', salonId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: salon, error: null }
  } catch (error) {
    console.error('Error updating salon:', error)
    return { data: null, error: 'Failed to update salon' }
  }
}

/**
 * Delete salon (soft delete by deactivating)
 */
export async function deleteSalon(salonId: string): Promise<SalonDeleteResult> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    
    if (!allowed) {
      return { success: false, error: permissionError || 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('salons')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', salonId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Also deactivate all locations in this salon
    const { error: locationError } = await supabase
      .from('locations')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('salon_id', salonId)

    if (locationError) {
      console.warn('Error deactivating salon locations:', locationError)
      // Continue even if location update fails
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting salon:', error)
    return { success: false, error: 'Failed to delete salon' }
  }
}

/**
 * Search salons by name (with role-based filtering)
 */
export async function searchSalons(query: string, limit = 20): Promise<SalonsResult> {
  try {
    const { user, error: authError } = await getUserWithRole()
    
    if (authError || !user) {
      return { data: null, error: authError || 'Not authenticated' }
    }

    const supabase = await createClient()

    let dbQuery = supabase
      .from('salons')
      .select('*')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .order('name')
      .limit(limit)

    // Filter by ownership for non-super admins
    if (user.role !== 'super_admin') {
      dbQuery = dbQuery.eq('owner_id', user.user_id)
    }

    const { data: salons, error } = await dbQuery

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: salons || [], error: null }
  } catch (error) {
    console.error('Error searching salons:', error)
    return { data: null, error: 'Failed to search salons' }
  }
}

/**
 * Get salon statistics (for dashboard)
 */
export async function getSalonStats(salonId: string): Promise<{
  data: {
    totalLocations: number
    activeStaff: number
    totalBookings: number
    totalRevenue: number
  } | null
  error: string | null
}> {
  try {
    const { allowed, error: permissionError } = await canAccessSalon(salonId)
    
    if (!allowed) {
      return { data: null, error: permissionError || 'Insufficient permissions' }
    }

    const supabase = await createClient()

    // Get locations count
    const { count: locationsCount, error: locationsError } = await supabase
      .from('locations')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true)

    // Get active staff count
    const { count: staffCount, error: staffError } = await supabase
      .from('staff')
      .select('*, locations!inner(*)', { count: 'exact', head: true })
      .eq('locations.salon_id', salonId)
      .eq('is_active', true)

    // Get total bookings count (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: bookingsCount, error: bookingsError } = await supabase
      .from('bookings')
      .select('*, locations!inner(*)', { count: 'exact', head: true })
      .eq('locations.salon_id', salonId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    // Get total revenue (last 30 days)
    const { data: revenueData, error: revenueError } = await supabase
      .from('bookings')
      .select('total_price, locations!inner(*)')
      .eq('locations.salon_id', salonId)
      .eq('status', 'completed')
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (locationsError || staffError || bookingsError || revenueError) {
      return { data: null, error: 'Failed to fetch salon statistics' }
    }

    const totalRevenue = revenueData?.reduce((sum, booking) => sum + booking.total_price, 0) || 0

    return {
      data: {
        totalLocations: locationsCount || 0,
        activeStaff: staffCount || 0,
        totalBookings: bookingsCount || 0,
        totalRevenue
      },
      error: null
    }
  } catch (error) {
    console.error('Error getting salon stats:', error)
    return { data: null, error: 'Failed to get salon statistics' }
  }
}