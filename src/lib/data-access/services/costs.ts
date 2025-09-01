'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions from database
type ServiceCost = Database['public']['Tables']['service_costs']['Row']
type ServiceCostInsert = Database['public']['Tables']['service_costs']['Insert']
type ServiceCostUpdate = Database['public']['Tables']['service_costs']['Update']

export interface ServiceCostFilters {
  service_id?: string
  location_id?: string
  is_active?: boolean
  date?: string // For checking which pricing rule is active on a specific date
}

export interface PricingRule {
  base_price: number
  peak_multiplier?: number
  weekend_multiplier?: number
  holiday_multiplier?: number
  discount_percentage?: number
  final_price: number
}

/**
 * Get service costs with filters
 * @param filters - Filtering options
 * @returns Array of service costs
 */
export async function getServiceCosts(filters: ServiceCostFilters = {}): Promise<ServiceCost[]> {
  const supabase = await createClient()
  
  let query = supabase.from('service_costs').select('*')
  
  if (filters.service_id) {
    query = query.eq('service_id', filters.service_id)
  }
  if (filters.location_id) {
    query = query.eq('location_id', filters.location_id)
  }
  if (filters.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active)
  }
  if (filters.date) {
    // Get pricing rules valid for the specified date
    query = query
      .lte('effective_from', filters.date)
      .or(`effective_until.is.null,effective_until.gte.${filters.date}`)
  }
  
  const { data, error } = await query.order('effective_from', { ascending: false })
  
  if (error) {
    console.error('Error fetching service costs:', error)
    throw new Error('Failed to fetch service costs')
  }
  
  return data || []
}

/**
 * Get active service cost for a specific service and location
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @param date - Optional date to check (defaults to today)
 * @returns The active service cost or null
 */
export async function getActiveServiceCost(
  serviceId: string,
  locationId: string,
  date?: string
): Promise<ServiceCost | null> {
  const supabase = await createClient()
  
  const checkDate = date || new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabase
    .from('service_costs')
    .select('*')
    .eq('service_id', serviceId)
    .eq('location_id', locationId)
    .eq('is_active', true)
    .lte('effective_from', checkDate)
    .or(`effective_until.is.null,effective_until.gte.${checkDate}`)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active service cost:', error)
    throw new Error('Failed to fetch active service cost')
  }
  
  return data
}

/**
 * Create a new service cost
 * @param cost - The service cost data
 * @returns The created service cost
 */
export async function createServiceCost(cost: ServiceCostInsert): Promise<ServiceCost> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_costs')
    .insert(cost)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating service cost:', error)
    throw new Error('Failed to create service cost')
  }
  
  return data
}

/**
 * Update a service cost
 * @param id - The service cost ID
 * @param updates - The fields to update
 * @returns The updated service cost
 */
export async function updateServiceCost(
  id: string,
  updates: ServiceCostUpdate
): Promise<ServiceCost> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_costs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating service cost:', error)
    throw new Error('Failed to update service cost')
  }
  
  return data
}

/**
 * Delete a service cost
 * @param id - The service cost ID
 */
export async function deleteServiceCost(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('service_costs')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting service cost:', error)
    throw new Error('Failed to delete service cost')
  }
}

/**
 * Calculate dynamic price based on various factors
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @param datetime - The date and time for the service
 * @param options - Additional pricing options
 * @returns Calculated pricing details
 */
export async function calculateDynamicPrice(
  serviceId: string,
  locationId: string,
  datetime: string,
  options: {
    isHoliday?: boolean
    demandMultiplier?: number
    promoCode?: string
  } = {}
): Promise<PricingRule> {
  const supabase = await createClient()
  
  // Get the active service cost
  const cost = await getActiveServiceCost(serviceId, locationId, datetime.split('T')[0])
  
  if (!cost) {
    throw new Error('No active pricing found for this service and location')
  }
  
  let finalPrice = cost.base_price
  const pricingRule: PricingRule = {
    base_price: cost.base_price,
    final_price: cost.base_price
  }
  
  // Apply time-based pricing
  const date = new Date(datetime)
  const hour = date.getHours()
  const dayOfWeek = date.getDay()
  
  // Peak hours (typically 10am-2pm and 5pm-8pm)
  if ((hour >= 10 && hour <= 14) || (hour >= 17 && hour <= 20)) {
    if (cost.peak_hours_multiplier) {
      pricingRule.peak_multiplier = cost.peak_hours_multiplier
      finalPrice *= cost.peak_hours_multiplier
    }
  }
  
  // Weekend pricing (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (cost.weekend_multiplier) {
      pricingRule.weekend_multiplier = cost.weekend_multiplier
      finalPrice *= cost.weekend_multiplier
    }
  }
  
  // Holiday pricing
  if (options.isHoliday && cost.holiday_multiplier) {
    pricingRule.holiday_multiplier = cost.holiday_multiplier
    finalPrice *= cost.holiday_multiplier
  }
  
  // Demand-based pricing
  if (options.demandMultiplier) {
    finalPrice *= options.demandMultiplier
  }
  
  // Apply any discounts
  if (cost.discount_percentage && cost.discount_percentage > 0) {
    pricingRule.discount_percentage = cost.discount_percentage
    finalPrice *= (1 - cost.discount_percentage / 100)
  }
  
  pricingRule.final_price = Math.round(finalPrice * 100) / 100 // Round to 2 decimal places
  
  return pricingRule
}

/**
 * Bulk update service costs for a location
 * @param locationId - The location ID
 * @param updates - Map of service ID to price updates
 * @returns Number of updated records
 */
export async function bulkUpdateLocationPrices(
  locationId: string,
  updates: Map<string, { base_price?: number; discount_percentage?: number }>
): Promise<number> {
  const supabase = await createClient()
  
  let updatedCount = 0
  
  for (const [serviceId, priceUpdate] of updates) {
    const { data, error } = await supabase
      .from('service_costs')
      .update(priceUpdate)
      .eq('location_id', locationId)
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .select()
    
    if (error) {
      console.error(`Error updating price for service ${serviceId}:`, error)
      continue
    }
    
    updatedCount += data?.length || 0
  }
  
  return updatedCount
}

/**
 * Set seasonal pricing for services
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @param seasonalPricing - Seasonal pricing configuration
 * @returns The created service cost
 */
export async function setSeasonalPricing(
  serviceId: string,
  locationId: string,
  seasonalPricing: {
    base_price: number
    effective_from: string
    effective_until: string
    peak_hours_multiplier?: number
    weekend_multiplier?: number
    holiday_multiplier?: number
    discount_percentage?: number
  }
): Promise<ServiceCost> {
  const supabase = await createClient()
  
  // Deactivate current pricing
  await supabase
    .from('service_costs')
    .update({ is_active: false })
    .eq('service_id', serviceId)
    .eq('location_id', locationId)
    .eq('is_active', true)
  
  // Create new seasonal pricing
  const newCost: ServiceCostInsert = {
    service_id: serviceId,
    location_id: locationId,
    ...seasonalPricing,
    is_active: true
  }
  
  return createServiceCost(newCost)
}

/**
 * Get pricing history for a service at a location
 * @param serviceId - The service ID
 * @param locationId - The location ID
 * @param limit - Maximum number of records to return
 * @returns Array of historical service costs
 */
export async function getServicePricingHistory(
  serviceId: string,
  locationId: string,
  limit = 10
): Promise<ServiceCost[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('service_costs')
    .select('*')
    .eq('service_id', serviceId)
    .eq('location_id', locationId)
    .order('effective_from', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching pricing history:', error)
    throw new Error('Failed to fetch pricing history')
  }
  
  return data || []
}

/**
 * Clone pricing from one location to another
 * @param sourceLocationId - Source location ID
 * @param targetLocationId - Target location ID
 * @returns Number of costs cloned
 */
export async function cloneLocationPricing(
  sourceLocationId: string,
  targetLocationId: string
): Promise<number> {
  const supabase = await createClient()
  
  // Get all active costs from source location
  const { data: sourceCosts, error: fetchError } = await supabase
    .from('service_costs')
    .select('*')
    .eq('location_id', sourceLocationId)
    .eq('is_active', true)
  
  if (fetchError || !sourceCosts) {
    console.error('Error fetching source costs:', fetchError)
    throw new Error('Failed to fetch source location pricing')
  }
  
  // Create costs for target location
  const targetCosts: ServiceCostInsert[] = sourceCosts.map(cost => ({
    service_id: cost.service_id,
    location_id: targetLocationId,
    base_price: cost.base_price,
    peak_hours_multiplier: cost.peak_hours_multiplier,
    weekend_multiplier: cost.weekend_multiplier,
    holiday_multiplier: cost.holiday_multiplier,
    discount_percentage: cost.discount_percentage,
    effective_from: new Date().toISOString().split('T')[0],
    effective_until: cost.effective_until,
    is_active: true
  }))
  
  const { data, error } = await supabase
    .from('service_costs')
    .insert(targetCosts)
    .select()
  
  if (error) {
    console.error('Error cloning pricing:', error)
    throw new Error('Failed to clone pricing')
  }
  
  return data?.length || 0
}