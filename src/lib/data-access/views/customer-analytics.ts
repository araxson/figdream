'use server'
import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import type { Database } from '@/types/database.types'
/**
 * Data Access Layer for Customer Analytics Views
 * Provides read-only access to pre-computed customer metrics
 */
// Type definitions from database views
export type CustomerLifetimeValue = Database['public']['Views']['customer_lifetime_value']['Row']
export type CustomerLoyaltySummary = Database['public']['Views']['customer_loyalty_summary']['Row']
/**
 * Get customer lifetime value metrics for a salon
 */
export async function getCustomerLifetimeValues(salonId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    const supabase = await createClient()
    // Check user permissions for the salon
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', salonId)
      .single()
    if (!userRole) {
      throw new Error('Insufficient permissions')
    }
    // Fetch customer lifetime values from the view
    const { data, error } = await supabase
      .from('customer_lifetime_value')
      .select('*')
      .eq('salon_id', salonId)
      .order('appointment_count', { ascending: false })
    if (error) {
      throw new Error('Failed to fetch customer lifetime values')
    }
    return { success: true, data }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer lifetime values'
    }
  }
}
/**
 * Get customer loyalty summary for a salon
 */
export async function getCustomerLoyaltySummary(salonId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    const supabase = await createClient()
    // Check user permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', salonId)
      .single()
    if (!userRole) {
      throw new Error('Insufficient permissions')
    }
    // Fetch loyalty summary from the view
    const { data, error } = await supabase
      .from('customer_loyalty_summary')
      .select('*')
      .eq('salon_id', salonId)
      .order('loyalty_points_balance', { ascending: false })
    if (error) {
      throw new Error('Failed to fetch customer loyalty summary')
    }
    // Calculate aggregated metrics
    const totalCustomers = data?.length || 0
    const totalPointsBalance = data?.reduce((sum, customer) => 
      sum + (customer.loyalty_points_balance || 0), 0) || 0
    const totalLifetimeEarned = data?.reduce((sum, customer) => 
      sum + (customer.lifetime_points_earned || 0), 0) || 0
    const totalLifetimeRedeemed = data?.reduce((sum, customer) => 
      sum + (customer.lifetime_points_redeemed || 0), 0) || 0
    const averageBalance = totalCustomers > 0 ? totalPointsBalance / totalCustomers : 0
    return { 
      success: true, 
      data,
      metrics: {
        totalCustomers,
        totalPointsBalance,
        totalLifetimeEarned,
        totalLifetimeRedeemed,
        averageBalance,
        redemptionRate: totalLifetimeEarned > 0 
          ? (totalLifetimeRedeemed / totalLifetimeEarned) * 100 
          : 0
      }
    }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer loyalty summary'
    }
  }
}
/**
 * Get specific customer's lifetime value
 */
export async function getCustomerLifetimeValue(customerId: string, salonId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    const supabase = await createClient()
    // Check permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', salonId)
      .single()
    if (!userRole && user.id !== customerId) {
      throw new Error('Insufficient permissions')
    }
    // Fetch specific customer's lifetime value
    const { data, error } = await supabase
      .from('customer_lifetime_value')
      .select('*')
      .eq('customer_id', customerId)
      .eq('salon_id', salonId)
      .single()
    if (error) {
      if (error.code === 'PGRST116') {
        return { 
          success: true, 
          data: null,
          message: 'No lifetime value data found for this customer'
        }
      }
      throw new Error('Failed to fetch customer lifetime value')
    }
    return { success: true, data }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer lifetime value'
    }
  }
}
/**
 * Get top customers by lifetime value
 */
export async function getTopCustomersByValue(salonId: string, limit: number = 10) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    const supabase = await createClient()
    // Check permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', salonId)
      .single()
    if (!userRole) {
      throw new Error('Insufficient permissions')
    }
    // Fetch top customers with additional customer data
    const { data, error } = await supabase
      .from('customer_lifetime_value')
      .select(`
        *,
        customers!inner (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('salon_id', salonId)
      .order('appointment_count', { ascending: false })
      .limit(limit)
    if (error) {
      throw new Error('Failed to fetch top customers')
    }
    return { success: true, data }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top customers'
    }
  }
}
/**
 * Get customers with highest loyalty points
 */
export async function getTopLoyaltyCustomers(salonId: string, limit: number = 10) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }
    const supabase = await createClient()
    // Check permissions
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', salonId)
      .single()
    if (!userRole) {
      throw new Error('Insufficient permissions')
    }
    // Fetch top loyalty customers with additional data
    const { data, error } = await supabase
      .from('customer_loyalty_summary')
      .select(`
        *,
        customers!inner (
          id,
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('salon_id', salonId)
      .gt('loyalty_points_balance', 0)
      .order('loyalty_points_balance', { ascending: false })
      .limit(limit)
    if (error) {
      throw new Error('Failed to fetch top loyalty customers')
    }
    return { success: true, data }
  } catch (_error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top loyalty customers'
    }
  }
}