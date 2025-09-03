import { createClient } from '@/lib/database/supabase/server'
import { cache } from 'react'
/**
 * Get loyalty rewards for a salon
 * NOTE: The loyalty_rewards table doesn't exist in the database
 * This returns an empty array to prevent errors
 */
export const getLoyaltyRewards = cache(async (_salonId: string) => {
  // Table doesn't exist - return empty array
  return []
})
/**
 * Get loyalty transactions for a salon
 */
export const getLoyaltyTransactions = cache(async (
  salonId: string,
  options?: {
    customerId?: string
    type?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }
) => {
  const supabase = await createClient()
  let query = supabase
    .from('loyalty_transactions')
    .select(`
      *,
      customers:customer_id (
        id,
        first_name,
        last_name,
        email
      )
    `, { count: 'exact' })
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
  // Apply filters
  if (options?.customerId) {
    query = query.eq('customer_id', options.customerId)
  }
  if (options?.type) {
    query = query.eq('transaction_type', options.type)
  }
  if (options?.startDate) {
    query = query.gte('created_at', options.startDate)
  }
  if (options?.endDate) {
    query = query.lte('created_at', options.endDate)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }
  const { data, count, error } = await query
  if (error) {
    return { transactions: [], total: 0 }
  }
  return {
    transactions: data || [],
    total: count || 0
  }
})
/**
 * Get loyalty program settings for a salon
 */
export const getLoyaltyProgram = cache(async (salonId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('salon_id', salonId)
    .single()
  if (error) {
    return null
  }
  return data
})
/**
 * Get customer loyalty points
 */
export const getCustomerPoints = cache(async (salonId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('loyalty_points')
    .select(`
      *,
      profiles:customer_id (
        id,
        full_name,
        email,
        phone
      )
    `)
    .eq('salon_id', salonId)
    .order('current_points', { ascending: false })
  if (error) {
    return []
  }
  return data || []
})
/**
 * Get loyalty statistics for a salon
 */
export const getLoyaltyStats = cache(async (salonId: string) => {
  const supabase = await createClient()
  // Get basic stats from loyalty_points table
  const { data: points } = await supabase
    .from('loyalty_points')
    .select('current_points, total_earned, total_redeemed')
    .eq('salon_id', salonId)
  const totalMembers = points?.length || 0
  const activeMembers = points?.filter(p => p.current_points > 0).length || 0
  const totalPoints = points?.reduce((sum, p) => sum + (p.current_points || 0), 0) || 0
  const redeemedPoints = points?.reduce((sum, p) => sum + (p.total_redeemed || 0), 0) || 0
  return {
    totalMembers,
    activeMembers,
    totalPoints,
    redeemedPoints,
    averagePointsPerCustomer: totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0,
    monthlyGrowth: 0 // Placeholder - would need historical data
  }
})
/**
 * Get top loyalty customers for a salon
 */
export const getTopLoyaltyCustomers = cache(async (salonId: string, limit = 10) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('loyalty_points')
    .select(`
      *,
      profiles:customer_id (
        id,
        full_name,
        email,
        avatar_url
      )
    `)
    .eq('salon_id', salonId)
    .order('current_points', { ascending: false })
    .limit(limit)
  if (error) {
    return []
  }
  return data || []
})