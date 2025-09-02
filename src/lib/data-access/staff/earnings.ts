'use server'

import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'

// Type definitions from database
type StaffEarning = Database['public']['Tables']['staff_earnings']['Row']
type StaffEarningInsert = Database['public']['Tables']['staff_earnings']['Insert']
type StaffEarningUpdate = Database['public']['Tables']['staff_earnings']['Update']

export interface EarningsFilters {
  staff_id?: string
  salon_id?: string
  location_id?: string
  date_from?: string
  date_to?: string
  is_paid_out?: boolean
  limit?: number
  offset?: number
}

export interface EarningsSummary {
  total_earnings: number
  total_commission: number
  total_tips: number
  total_services: number
  unpaid_amount: number
  paid_amount: number
}

/**
 * Get staff earnings with filters
 * @param filters - Filtering options
 * @returns Array of staff earnings
 */
export async function getStaffEarnings(filters: EarningsFilters = {}): Promise<StaffEarning[]> {
  const supabase = await createClient()
  
  let query = supabase.from('staff_earnings').select('*')
  
  if (filters.staff_id) {
    query = query.eq('staff_id', filters.staff_id)
  }
  if (filters.salon_id) {
    query = query.eq('salon_id', filters.salon_id)
  }
  if (filters.location_id) {
    query = query.eq('location_id', filters.location_id)
  }
  if (filters.date_from) {
    query = query.gte('service_date', filters.date_from)
  }
  if (filters.date_to) {
    query = query.lte('service_date', filters.date_to)
  }
  if (filters.is_paid_out !== undefined) {
    query = query.eq('is_paid_out', filters.is_paid_out)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }
  
  const { data, error } = await query.order('service_date', { ascending: false })
  
  if (error) {
    console.error('Error fetching staff earnings:', error)
    throw new Error('Failed to fetch staff earnings')
  }
  
  return data || []
}

/**
 * Create a new staff earning record
 * @param earning - The earning data to create
 * @returns The created earning record
 */
export async function createStaffEarning(earning: StaffEarningInsert): Promise<StaffEarning> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_earnings')
    .insert(earning)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating staff earning:', error)
    throw new Error('Failed to create staff earning')
  }
  
  return data
}

/**
 * Update a staff earning record
 * @param id - The earning ID
 * @param updates - The fields to update
 * @returns The updated earning record
 */
export async function updateStaffEarning(
  id: string,
  updates: StaffEarningUpdate
): Promise<StaffEarning> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_earnings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating staff earning:', error)
    throw new Error('Failed to update staff earning')
  }
  
  return data
}

/**
 * Calculate commission for an appointment
 * @param appointmentId - The appointment ID
 * @param staffId - The staff member ID
 * @param serviceAmount - The service amount
 * @param commissionRate - Commission rate (0-1)
 * @returns Calculated commission amount
 */
export async function calculateCommission(
  appointmentId: string,
  staffId: string,
  serviceAmount: number,
  commissionRate: number
): Promise<{ commissionAmount: number; totalEarnings: number }> {
  const commissionAmount = serviceAmount * commissionRate
  const totalEarnings = commissionAmount // Tips would be added separately
  
  return { commissionAmount, totalEarnings }
}

/**
 * Mark earnings as paid out
 * @param earningIds - Array of earning IDs to mark as paid
 * @param paidBy - User ID who processed the payment
 * @param paymentMethod - Method of payment
 * @returns Number of records updated
 */
export async function markEarningsAsPaid(
  earningIds: string[],
  paidBy: string,
  paymentMethod: string
): Promise<number> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_earnings')
    .update({
      is_paid_out: true,
      paid_out_date: new Date().toISOString(),
      paid_out_by: paidBy,
      payment_method: paymentMethod
    })
    .in('id', earningIds)
    .select()
  
  if (error) {
    console.error('Error marking earnings as paid:', error)
    throw new Error('Failed to mark earnings as paid')
  }
  
  return data?.length || 0
}

/**
 * Get earnings summary for a staff member
 * @param staffId - The staff member ID
 * @param dateFrom - Optional start date
 * @param dateTo - Optional end date
 * @returns Earnings summary
 */
export async function getStaffEarningsSummary(
  staffId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<EarningsSummary> {
  const supabase = await createClient()
  
  let query = supabase
    .from('staff_earnings')
    .select('total_earnings, commission_amount, tip_amount, is_paid_out')
    .eq('staff_id', staffId)
  
  if (dateFrom) {
    query = query.gte('service_date', dateFrom)
  }
  if (dateTo) {
    query = query.lte('service_date', dateTo)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching earnings summary:', error)
    throw new Error('Failed to fetch earnings summary')
  }
  
  const summary: EarningsSummary = {
    total_earnings: 0,
    total_commission: 0,
    total_tips: 0,
    total_services: data?.length || 0,
    unpaid_amount: 0,
    paid_amount: 0
  }
  
  data?.forEach(earning => {
    summary.total_earnings += earning.total_earnings || 0
    summary.total_commission += earning.commission_amount || 0
    summary.total_tips += earning.tip_amount || 0
    
    if (earning.is_paid_out) {
      summary.paid_amount += earning.total_earnings || 0
    } else {
      summary.unpaid_amount += earning.total_earnings || 0
    }
  })
  
  return summary
}

/**
 * Get unpaid earnings for a staff member
 * @param staffId - The staff member ID
 * @returns Array of unpaid earnings
 */
export async function getUnpaidEarnings(staffId: string): Promise<StaffEarning[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_earnings')
    .select('*')
    .eq('staff_id', staffId)
    .eq('is_paid_out', false)
    .order('service_date', { ascending: false })
  
  if (error) {
    console.error('Error fetching unpaid earnings:', error)
    throw new Error('Failed to fetch unpaid earnings')
  }
  
  return data || []
}

/**
 * Add tip to an earning record
 * @param earningId - The earning ID
 * @param tipAmount - The tip amount to add
 * @returns Updated earning record
 */
export async function addTipToEarning(
  earningId: string,
  tipAmount: number
): Promise<StaffEarning> {
  const supabase = await createClient()
  
  // First get the current earning
  const { data: current, error: fetchError } = await supabase
    .from('staff_earnings')
    .select('*')
    .eq('id', earningId)
    .single()
  
  if (fetchError || !current) {
    console.error('Error fetching earning:', fetchError)
    throw new Error('Failed to fetch earning')
  }
  
  // Update with new tip amount
  const newTotalEarnings = (current.commission_amount || 0) + tipAmount
  
  const { data, error } = await supabase
    .from('staff_earnings')
    .update({
      tip_amount: tipAmount,
      total_earnings: newTotalEarnings
    })
    .eq('id', earningId)
    .select()
    .single()
  
  if (error) {
    console.error('Error adding tip:', error)
    throw new Error('Failed to add tip')
  }
  
  return data
}

/**
 * Generate earnings report for a salon
 * @param salonId - The salon ID
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns Array of earnings grouped by staff
 */
export async function generateEarningsReport(
  salonId: string,
  dateFrom: string,
  dateTo: string
): Promise<any[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('staff_earnings')
    .select(`
      staff_id,
      staff:staff_profiles(profiles:user_id(full_name)),
      total_earnings,
      commission_amount,
      tip_amount,
      is_paid_out
    `)
    .eq('salon_id', salonId)
    .gte('service_date', dateFrom)
    .lte('service_date', dateTo)
  
  if (error) {
    console.error('Error generating earnings report:', error)
    throw new Error('Failed to generate earnings report')
  }
  
  // Group by staff and calculate totals
  const report = new Map()
  
  data?.forEach(earning => {
    if (!report.has(earning.staff_id)) {
      report.set(earning.staff_id, {
        staff_id: earning.staff_id,
        staff_name: earning.staff?.full_name || 'Unknown',
        total_earnings: 0,
        total_commission: 0,
        total_tips: 0,
        paid_amount: 0,
        unpaid_amount: 0,
        service_count: 0
      })
    }
    
    const staffReport = report.get(earning.staff_id)
    staffReport.total_earnings += earning.total_earnings || 0
    staffReport.total_commission += earning.commission_amount || 0
    staffReport.total_tips += earning.tip_amount || 0
    staffReport.service_count += 1
    
    if (earning.is_paid_out) {
      staffReport.paid_amount += earning.total_earnings || 0
    } else {
      staffReport.unpaid_amount += earning.total_earnings || 0
    }
  })
  
  return Array.from(report.values())
}