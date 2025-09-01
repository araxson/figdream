'use server'

import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import type { Database } from '@/types/database.types'

/**
 * Data Access Layer for Dashboard Metric Views
 * Provides read-only access to pre-computed dashboard metrics
 */

// Type definitions from database views
export type DashboardRealtime = Database['public']['Views']['dashboard_realtime']['Row']
export type ServiceProfitability = Database['public']['Views']['service_profitability']['Row']
export type StaffEarningsSummary = Database['public']['Views']['staff_earnings_summary']['Row']
export type StaffPerformanceDashboard = Database['public']['Views']['staff_performance_dashboard']['Row']

/**
 * Get real-time dashboard metrics
 */
export async function getDashboardRealtime() {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const supabase = await createClient()

    // Fetch real-time dashboard data
    const { data, error } = await supabase
      .from('dashboard_realtime')
      .select('*')
      .single()

    if (error) {
      console.error('Error fetching dashboard realtime:', error)
      throw new Error('Failed to fetch dashboard metrics')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get dashboard realtime error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch dashboard metrics'
    }
  }
}

/**
 * Get service profitability analysis for a salon
 */
export async function getServiceProfitability(salonId: string) {
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

    // Fetch service profitability data
    const { data, error } = await supabase
      .from('service_profitability')
      .select('*')
      .eq('salon_id', salonId)
      .order('price', { ascending: false })

    if (error) {
      console.error('Error fetching service profitability:', error)
      throw new Error('Failed to fetch service profitability')
    }

    // Calculate metrics
    const totalServices = data?.length || 0
    const averagePrice = totalServices > 0 
      ? data.reduce((sum, service) => sum + (service.price || 0), 0) / totalServices 
      : 0
    const highestPrice = Math.max(...(data?.map(s => s.price || 0) || [0]))
    const lowestPrice = Math.min(...(data?.filter(s => s.price).map(s => s.price || 0) || [0]))

    return { 
      success: true, 
      data,
      metrics: {
        totalServices,
        averagePrice,
        highestPrice,
        lowestPrice,
        priceRange: highestPrice - lowestPrice
      }
    }
  } catch (error) {
    console.error('Get service profitability error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch service profitability'
    }
  }
}

/**
 * Get staff earnings summary for a salon
 */
export async function getStaffEarningsSummary(salonId: string, dateRange?: { start: Date; end: Date }) {
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

    // Build query
    let query = supabase
      .from('staff_earnings_summary')
      .select('*')
      .eq('salon_id', salonId)

    // Apply date range filter if provided
    if (dateRange) {
      query = query
        .gte('service_date', dateRange.start.toISOString())
        .lte('service_date', dateRange.end.toISOString())
    }

    query = query.order('service_date', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching staff earnings summary:', error)
      throw new Error('Failed to fetch staff earnings summary')
    }

    // Calculate aggregated metrics
    const totalEarnings = data?.reduce((sum, record) => 
      sum + (record.total_earnings || 0), 0) || 0
    const uniqueStaff = new Set(data?.map(r => r.staff_id)).size
    const averageEarningsPerStaff = uniqueStaff > 0 ? totalEarnings / uniqueStaff : 0

    return { 
      success: true, 
      data,
      metrics: {
        totalEarnings,
        uniqueStaff,
        averageEarningsPerStaff,
        recordCount: data?.length || 0
      }
    }
  } catch (error) {
    console.error('Get staff earnings summary error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch staff earnings summary'
    }
  }
}

/**
 * Get staff performance dashboard metrics
 */
export async function getStaffPerformanceDashboard(salonId: string) {
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

    // Fetch staff performance data
    const { data, error } = await supabase
      .from('staff_performance_dashboard')
      .select('*')
      .eq('salon_id', salonId)

    if (error) {
      console.error('Error fetching staff performance dashboard:', error)
      throw new Error('Failed to fetch staff performance metrics')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get staff performance dashboard error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch staff performance metrics'
    }
  }
}

/**
 * Get individual staff member's performance metrics
 */
export async function getStaffMemberPerformance(staffId: string, salonId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const supabase = await createClient()

    // Check if user is the staff member or has salon permissions
    const isStaffMember = user.id === staffId

    if (!isStaffMember) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('salon_id', salonId)
        .single()

      if (!userRole || !['salon_owner', 'location_manager', 'super_admin'].includes(userRole.role)) {
        throw new Error('Insufficient permissions')
      }
    }

    // Fetch individual staff performance
    const { data, error } = await supabase
      .from('staff_performance_dashboard')
      .select('*')
      .eq('staff_id', staffId)
      .eq('salon_id', salonId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return { 
          success: true, 
          data: null,
          message: 'No performance data found for this staff member'
        }
      }
      console.error('Error fetching staff member performance:', error)
      throw new Error('Failed to fetch staff performance')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get staff member performance error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch staff performance'
    }
  }
}

/**
 * Get top performing services by profitability
 */
export async function getTopProfitableServices(salonId: string, limit: number = 10) {
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

    // Fetch top profitable services
    const { data, error } = await supabase
      .from('service_profitability')
      .select('*')
      .eq('salon_id', salonId)
      .order('price', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching top profitable services:', error)
      throw new Error('Failed to fetch top services')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get top profitable services error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch top services'
    }
  }
}

/**
 * Get optimization summary metrics
 */
export async function getOptimizationSummary() {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const supabase = await createClient()

    // Admin only access
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      throw new Error('Admin access required')
    }

    // Fetch optimization summary
    const { data, error } = await supabase
      .from('optimization_summary')
      .select('*')
      .order('calculated_at', { ascending: false })

    if (error) {
      console.error('Error fetching optimization summary:', error)
      throw new Error('Failed to fetch optimization summary')
    }

    // Group by type
    const groupedData = data?.reduce((acc, item) => {
      if (!acc[item.type || 'unknown']) {
        acc[item.type || 'unknown'] = []
      }
      acc[item.type || 'unknown'].push(item)
      return acc
    }, {} as Record<string, typeof data>)

    return { 
      success: true, 
      data,
      grouped: groupedData
    }
  } catch (error) {
    console.error('Get optimization summary error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch optimization summary'
    }
  }
}