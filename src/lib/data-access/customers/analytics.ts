'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions from database
type CustomerAnalytics = Database['public']['Tables']['customer_analytics']['Row']
type CustomerAnalyticsInsert = Database['public']['Tables']['customer_analytics']['Insert']
type CustomerAnalyticsUpdate = Database['public']['Tables']['customer_analytics']['Update']

export interface AnalyticsFilters {
  customer_id?: string
  salon_id?: string
  date_from?: string
  date_to?: string
  limit?: number
  offset?: number
}

export interface CustomerMetrics {
  total_visits: number
  total_spent: number
  average_spend: number
  last_visit_date: string | null
  first_visit_date: string | null
  favorite_service: string | null
  favorite_staff: string | null
  no_show_count: number
  cancellation_count: number
  retention_rate: number
  lifetime_value: number
}

export interface CustomerSegment {
  segment: 'new' | 'regular' | 'vip' | 'at_risk' | 'churned'
  criteria: string
  customer_count?: number
}

/**
 * Get customer analytics with filters
 * @param filters - Filtering options
 * @returns Array of customer analytics records
 */
export async function getCustomerAnalytics(
  filters: AnalyticsFilters = {}
): Promise<CustomerAnalytics[]> {
  const supabase = await createClient()
  
  let query = supabase.from('customer_analytics').select('*')
  
  if (filters.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }
  if (filters.salon_id) {
    query = query.eq('salon_id', filters.salon_id)
  }
  if (filters.date_from) {
    query = query.gte('last_visit_date', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('last_visit_date', filters.date_to)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }
  
  const { data, error } = await query.order('last_visit_date', { ascending: false })
  
  if (error) {
    console.error('Error fetching customer analytics:', error)
    throw new Error('Failed to fetch customer analytics')
  }
  
  return data || []
}

/**
 * Get analytics for a specific customer
 * @param customerId - The customer ID
 * @param salonId - Optional salon ID for salon-specific metrics
 * @returns Customer analytics record
 */
export async function getCustomerMetrics(
  customerId: string,
  salonId?: string
): Promise<CustomerMetrics> {
  const supabase = await createClient()
  
  let query = supabase
    .from('customer_analytics')
    .select('*')
    .eq('customer_id', customerId)
  
  if (salonId) {
    query = query.eq('salon_id', salonId)
  }
  
  const { data, error } = await query.single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching customer metrics:', error)
    throw new Error('Failed to fetch customer metrics')
  }
  
  if (!data) {
    // Return default metrics if no data exists
    return {
      total_visits: 0,
      total_spent: 0,
      average_spend: 0,
      last_visit_date: null,
      first_visit_date: null,
      favorite_service: null,
      favorite_staff: null,
      no_show_count: 0,
      cancellation_count: 0,
      retention_rate: 0,
      lifetime_value: 0
    }
  }
  
  return {
    total_visits: data.total_visits || 0,
    total_spent: data.total_spent || 0,
    average_spend: data.average_spend || 0,
    last_visit_date: data.last_visit_date,
    first_visit_date: data.first_visit_date,
    favorite_service: data.favorite_service,
    favorite_staff: data.favorite_staff,
    no_show_count: data.no_show_count || 0,
    cancellation_count: data.cancellation_count || 0,
    retention_rate: data.retention_rate || 0,
    lifetime_value: data.lifetime_value || 0
  }
}

/**
 * Update customer analytics
 * @param customerId - The customer ID
 * @param updates - Analytics data to update
 * @returns Updated analytics record
 */
export async function updateCustomerAnalytics(
  customerId: string,
  updates: CustomerAnalyticsUpdate
): Promise<CustomerAnalytics> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_analytics')
    .upsert({
      customer_id: customerId,
      ...updates,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'customer_id'
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error updating customer analytics:', error)
    throw new Error('Failed to update customer analytics')
  }
  
  return data
}

/**
 * Track customer visit
 * @param customerId - The customer ID
 * @param visitData - Visit details
 * @returns Updated analytics
 */
export async function trackCustomerVisit(
  customerId: string,
  visitData: {
    salon_id: string
    location_id: string
    service_id: string
    staff_id: string
    amount_spent: number
    visit_date: string
  }
): Promise<CustomerAnalytics> {
  const supabase = await createClient()
  
  // Get current analytics
  const { data: current } = await supabase
    .from('customer_analytics')
    .select('*')
    .eq('customer_id', customerId)
    .eq('salon_id', visitData.salon_id)
    .single()
  
  // Calculate updated metrics
  const totalVisits = (current?.total_visits || 0) + 1
  const totalSpent = (current?.total_spent || 0) + visitData.amount_spent
  const averageSpend = totalSpent / totalVisits
  
  const updates: CustomerAnalyticsUpdate = {
    salon_id: visitData.salon_id,
    total_visits: totalVisits,
    total_spent: totalSpent,
    average_spend: averageSpend,
    last_visit_date: visitData.visit_date,
    first_visit_date: current?.first_visit_date || visitData.visit_date,
    lifetime_value: totalSpent
  }
  
  return updateCustomerAnalytics(customerId, updates)
}

/**
 * Track customer cancellation or no-show
 * @param customerId - The customer ID
 * @param salonId - The salon ID
 * @param type - 'cancellation' or 'no_show'
 * @returns Updated analytics
 */
export async function trackCustomerBehavior(
  customerId: string,
  salonId: string,
  type: 'cancellation' | 'no_show'
): Promise<CustomerAnalytics> {
  const supabase = await createClient()
  
  // Get current analytics
  const { data: current } = await supabase
    .from('customer_analytics')
    .select('*')
    .eq('customer_id', customerId)
    .eq('salon_id', salonId)
    .single()
  
  const updates: CustomerAnalyticsUpdate = {
    salon_id: salonId
  }
  
  if (type === 'cancellation') {
    updates.cancellation_count = (current?.cancellation_count || 0) + 1
  } else {
    updates.no_show_count = (current?.no_show_count || 0) + 1
  }
  
  return updateCustomerAnalytics(customerId, updates)
}

/**
 * Calculate customer retention rate
 * @param customerId - The customer ID
 * @param salonId - The salon ID
 * @param periodMonths - Period to calculate retention over (default 12 months)
 * @returns Retention rate percentage
 */
export async function calculateRetentionRate(
  customerId: string,
  salonId: string,
  periodMonths = 12
): Promise<number> {
  const supabase = await createClient()
  
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - periodMonths)
  
  // Get appointments in the period
  const { data, error } = await supabase
    .from('appointments')
    .select('booking_date')
    .eq('customer_id', customerId)
    .eq('salon_id', salonId)
    .gte('booking_date', startDate.toISOString().split('T')[0])
    .eq('status', 'completed')
    .order('booking_date', { ascending: true })
  
  if (error) {
    console.error('Error calculating retention:', error)
    return 0
  }
  
  if (!data || data.length === 0) {
    return 0
  }
  
  // Calculate months with visits
  const visitMonths = new Set<string>()
  data.forEach(apt => {
    const date = new Date(apt.booking_date)
    visitMonths.add(`${date.getFullYear()}-${date.getMonth()}`)
  })
  
  return (visitMonths.size / periodMonths) * 100
}

/**
 * Segment customers based on behavior
 * @param salonId - The salon ID
 * @returns Array of customer segments with counts
 */
export async function segmentCustomers(salonId: string): Promise<CustomerSegment[]> {
  const supabase = await createClient()
  
  const segments: CustomerSegment[] = []
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  
  // New customers (first visit in last 30 days)
  const { count: newCount } = await supabase
    .from('customer_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('first_visit_date', thirtyDaysAgo.toISOString().split('T')[0])
  
  segments.push({
    segment: 'new',
    criteria: 'First visit within last 30 days',
    customer_count: newCount || 0
  })
  
  // Regular customers (3+ visits, last visit in 30 days)
  const { count: regularCount } = await supabase
    .from('customer_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('total_visits', 3)
    .gte('last_visit_date', thirtyDaysAgo.toISOString().split('T')[0])
  
  segments.push({
    segment: 'regular',
    criteria: '3+ visits, active in last 30 days',
    customer_count: regularCount || 0
  })
  
  // VIP customers (10+ visits or $1000+ spent)
  const { count: vipCount } = await supabase
    .from('customer_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .or('total_visits.gte.10,total_spent.gte.1000')
  
  segments.push({
    segment: 'vip',
    criteria: '10+ visits or $1000+ lifetime spend',
    customer_count: vipCount || 0
  })
  
  // At-risk customers (no visit in 30-90 days)
  const { count: atRiskCount } = await supabase
    .from('customer_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .lt('last_visit_date', thirtyDaysAgo.toISOString().split('T')[0])
    .gte('last_visit_date', ninetyDaysAgo.toISOString().split('T')[0])
  
  segments.push({
    segment: 'at_risk',
    criteria: 'No visit in 30-90 days',
    customer_count: atRiskCount || 0
  })
  
  // Churned customers (no visit in 90+ days)
  const { count: churnedCount } = await supabase
    .from('customer_analytics')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .lt('last_visit_date', ninetyDaysAgo.toISOString().split('T')[0])
  
  segments.push({
    segment: 'churned',
    criteria: 'No visit in 90+ days',
    customer_count: churnedCount || 0
  })
  
  return segments
}

/**
 * Get top customers by spending
 * @param salonId - The salon ID
 * @param limit - Number of customers to return
 * @returns Array of top spending customers
 */
export async function getTopCustomers(
  salonId: string,
  limit = 10
): Promise<CustomerAnalytics[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_analytics')
    .select('*')
    .eq('salon_id', salonId)
    .order('total_spent', { ascending: false })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching top customers:', error)
    throw new Error('Failed to fetch top customers')
  }
  
  return data || []
}

/**
 * Get customers at risk of churning
 * @param salonId - The salon ID
 * @param daysInactive - Days of inactivity to consider at risk
 * @returns Array of at-risk customers
 */
export async function getAtRiskCustomers(
  salonId: string,
  daysInactive = 60
): Promise<CustomerAnalytics[]> {
  const supabase = await createClient()
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive)
  
  const { data, error } = await supabase
    .from('customer_analytics')
    .select('*')
    .eq('salon_id', salonId)
    .lt('last_visit_date', cutoffDate.toISOString().split('T')[0])
    .gte('total_visits', 2) // Only consider customers who visited at least twice
    .order('lifetime_value', { ascending: false })
  
  if (error) {
    console.error('Error fetching at-risk customers:', error)
    throw new Error('Failed to fetch at-risk customers')
  }
  
  return data || []
}

/**
 * Calculate customer lifetime value prediction
 * @param customerId - The customer ID
 * @param salonId - The salon ID
 * @returns Predicted lifetime value
 */
export async function predictCustomerLifetimeValue(
  customerId: string,
  salonId: string
): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_analytics')
    .select('*')
    .eq('customer_id', customerId)
    .eq('salon_id', salonId)
    .single()
  
  if (error || !data) {
    return 0
  }
  
  // Simple CLV calculation: Average spend * Visit frequency * Expected lifetime
  const avgSpend = data.average_spend || 0
  const visitsPerYear = data.total_visits || 0 // Simplified - would need date range
  const expectedYears = 3 // Industry average customer lifetime
  
  return avgSpend * visitsPerYear * expectedYears
}

/**
 * Batch update analytics for multiple customers
 * @param updates - Array of customer analytics updates
 * @returns Number of updated records
 */
export async function batchUpdateAnalytics(
  updates: CustomerAnalyticsInsert[]
): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customer_analytics')
    .upsert(updates, {
      onConflict: 'customer_id,salon_id'
    })
    .select()
  
  if (error) {
    console.error('Error batch updating analytics:', error)
    throw new Error('Failed to batch update analytics')
  }
  
  return data?.length || 0
}