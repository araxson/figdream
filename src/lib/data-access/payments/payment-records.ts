import { createClient } from '@/lib/database/supabase/server'
import {
  Payment,
  PaymentInsert,
  Customer,
  StaffProfile,
  Appointment,
  Profile
} from '@/types/db-types'

// Use database Payment type instead of custom type
type PaymentRecord = Payment

// Extended payment type with relationships
type PaymentRecordWithRelations = Payment & {
  customer?: Pick<Customer, 'id'> & {
    profile?: Pick<Profile, 'full_name' | 'email' | 'phone'>
  }
  staff?: Pick<StaffProfile, 'id' | 'display_name'>
  appointment?: Pick<Appointment, 'id' | 'start_time'> & {
    end_time?: string
    service_name?: string
  }
  recorded_by_user?: Pick<Profile, 'id' | 'full_name'>
}

export async function createPaymentRecord(data: Omit<PaymentInsert, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = await createClient()
  
  const { data: payment, error } = await supabase
    .from('payment_records')
    .insert(data)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create payment record')
  }

  return payment
}

export async function getPaymentRecordById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_records')
    .select(`
      *,
      customer:profiles!payment_records_customer_id_fkey(
        id,
        full_name,
        email,
        phone
      ),
      staff:profiles!payment_records_staff_id_fkey(
        id,
        full_name
      ),
      appointment:appointments(
        id,
        start_time,
        end_time,
        service_name
      ),
      recorded_by_user:profiles!payment_records_recorded_by_fkey(
        id,
        full_name
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    return null
  }

  return data as PaymentRecordWithRelations
}

export async function getPaymentRecordsBySalon(
  salonId: string,
  options?: {
    startDate?: string
    endDate?: string
    staffId?: string
    customerId?: string
    paymentMethod?: string
    limit?: number
    offset?: number
  }
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('payment_records')
    .select(`
      *,
      customer:profiles!payment_records_customer_id_fkey(
        id,
        full_name,
        email,
        phone
      ),
      staff:profiles!payment_records_staff_id_fkey(
        id,
        full_name
      ),
      appointment:appointments(
        id,
        start_time,
        end_time,
        service_name
      )
    `, { count: 'exact' })
    .eq('salon_id', salonId)
    .order('payment_date', { ascending: false })

  if (options?.startDate) {
    query = query.gte('payment_date', options.startDate)
  }
  
  if (options?.endDate) {
    query = query.lte('payment_date', options.endDate)
  }
  
  if (options?.staffId) {
    query = query.eq('staff_id', options.staffId)
  }
  
  if (options?.customerId) {
    query = query.eq('customer_id', options.customerId)
  }
  
  if (options?.paymentMethod) {
    query = query.eq('payment_method', options.paymentMethod)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    return { data: [], count: 0 }
  }

  return { data: data as PaymentRecordWithRelations[], count: count || 0 }
}

export async function getPaymentRecordsByLocation(
  locationId: string,
  options?: {
    startDate?: string
    endDate?: string
    staffId?: string
    limit?: number
    offset?: number
  }
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('payment_records')
    .select(`
      *,
      customer:profiles!payment_records_customer_id_fkey(
        id,
        full_name,
        email
      ),
      staff:profiles!payment_records_staff_id_fkey(
        id,
        full_name
      )
    `, { count: 'exact' })
    .eq('location_id', locationId)
    .order('payment_date', { ascending: false })

  if (options?.startDate) {
    query = query.gte('payment_date', options.startDate)
  }
  
  if (options?.endDate) {
    query = query.lte('payment_date', options.endDate)
  }
  
  if (options?.staffId) {
    query = query.eq('staff_id', options.staffId)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    return { data: [], count: 0 }
  }

  return { data: data as PaymentRecordWithRelations[], count: count || 0 }
}

export async function getCustomerPaymentHistory(
  customerId: string,
  options?: {
    salonId?: string
    limit?: number
    offset?: number
  }
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('payment_records')
    .select(`
      *,
      salon:salons(
        id,
        name
      ),
      staff:profiles!payment_records_staff_id_fkey(
        id,
        full_name
      ),
      appointment:appointments(
        id,
        start_time,
        service_name
      )
    `, { count: 'exact' })
    .eq('customer_id', customerId)
    .order('payment_date', { ascending: false })

  if (options?.salonId) {
    query = query.eq('salon_id', options.salonId)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    return { data: [], count: 0 }
  }

  return { data, count: count || 0 }
}

export async function getStaffTipsReport(
  staffId: string,
  options?: {
    startDate?: string
    endDate?: string
  }
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('payment_records')
    .select('tip_amount, payment_date, customer:profiles!payment_records_customer_id_fkey(full_name)')
    .eq('staff_id', staffId)
    .gt('tip_amount', 0)
    .order('payment_date', { ascending: false })

  if (options?.startDate) {
    query = query.gte('payment_date', options.startDate)
  }
  
  if (options?.endDate) {
    query = query.lte('payment_date', options.endDate)
  }

  const { data, error } = await query

  if (error) {
    return { tips: [], total: 0 }
  }

  const total = data?.reduce((sum, record) => sum + (record.tip_amount || 0), 0) || 0

  return { tips: data || [], total }
}

export async function getRevenueAnalytics(
  salonId: string,
  options: {
    startDate: string
    endDate: string
    groupBy?: 'day' | 'week' | 'month'
  }
) {
  const supabase = await createClient()
  
  // Fetch current period data
  const { data, error } = await supabase
    .from('payment_records')
    .select('service_amount, tip_amount, tax_amount, discount_amount, total_amount, payment_date, payment_method')
    .eq('salon_id', salonId)
    .gte('payment_date', options.startDate)
    .lte('payment_date', options.endDate)
    .order('payment_date')

  if (error) {
    return null
  }

  // Calculate previous period dates
  const startDateObj = new Date(options.startDate)
  const endDateObj = new Date(options.endDate)
  const periodLength = endDateObj.getTime() - startDateObj.getTime()
  const previousEndDate = new Date(startDateObj.getTime() - 1).toISOString().split('T')[0]
  const previousStartDate = new Date(startDateObj.getTime() - periodLength).toISOString().split('T')[0]
  
  // Fetch previous period data for comparison
  const { data: previousData } = await supabase
    .from('payment_records')
    .select('total_amount')
    .eq('salon_id', salonId)
    .gte('payment_date', previousStartDate)
    .lte('payment_date', previousEndDate)

  const previousPeriodTotal = previousData?.reduce((sum, r) => sum + (r.total_amount || 0), 0) || 0

  // Group data by specified period
  const groupedData = groupDataByPeriod(data, options.groupBy || 'day')
  
  return {
    totalRevenue: data.reduce((sum, r) => sum + (r.total_amount || 0), 0),
    totalTips: data.reduce((sum, r) => sum + (r.tip_amount || 0), 0),
    totalDiscounts: data.reduce((sum, r) => sum + (r.discount_amount || 0), 0),
    averageTransaction: data.length > 0 ? data.reduce((sum, r) => sum + (r.total_amount || 0), 0) / data.length : 0,
    transactionCount: data.length,
    paymentMethodBreakdown: getPaymentMethodBreakdown(data),
    revenueByPeriod: groupedData,
    previousPeriodTotal // Add previous period total for comparison
  }
}

export async function updatePaymentRecord(
  id: string,
  updates: Partial<Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at' | 'total_amount'>>
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_records')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to update payment record')
  }

  return data
}

export async function deletePaymentRecord(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('payment_records')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error('Failed to delete payment record')
  }

  return true
}

export async function bulkCreatePaymentRecords(
  records: Array<Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at' | 'total_amount'>>
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_records')
    .insert(records)
    .select()

  if (error) {
    throw new Error('Failed to bulk create payment records')
  }

  return data
}

// Helper functions
interface PaymentDataItem {
  payment_date: string
  total_amount: number | null
}

function groupDataByPeriod(
  data: PaymentDataItem[],
  period: 'day' | 'week' | 'month'
): Record<string, { revenue: number; transactions: number }> {
  const grouped: Record<string, { revenue: number; transactions: number }> = {}
  
  data.forEach(record => {
    const date = new Date(record.payment_date)
    let key: string
    
    if (period === 'day') {
      key = date.toISOString().split('T')[0]
    } else if (period === 'week') {
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      key = weekStart.toISOString().split('T')[0]
    } else {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }
    
    if (!grouped[key]) {
      grouped[key] = { revenue: 0, transactions: 0 }
    }
    
    grouped[key].revenue += record.total_amount || 0
    grouped[key].transactions += 1
  })
  
  return grouped
}

interface PaymentMethodItem {
  payment_method?: string | null
  total_amount?: number | null
}

function getPaymentMethodBreakdown(data: PaymentMethodItem[]): Record<string, number> {
  const breakdown: Record<string, number> = {}
  
  data.forEach(record => {
    const method = record.payment_method || 'unknown'
    breakdown[method] = (breakdown[method] || 0) + (record.total_amount || 0)
  })
  
  return breakdown
}

export async function getStaffEarningsReport(
  salonId: string,
  options: {
    startDate: string
    endDate: string
    staffId?: string
  }
) {
  const supabase = await createClient()
  
  let query = supabase
    .from('payment_records')
    .select(`
      staff_id,
      service_amount,
      tip_amount,
      total_amount,
      staff:profiles!payment_records_staff_id_fkey(
        id,
        full_name
      )
    `)
    .eq('salon_id', salonId)
    .gte('payment_date', options.startDate)
    .lte('payment_date', options.endDate)

  if (options.staffId) {
    query = query.eq('staff_id', options.staffId)
  }

  const { data, error } = await query

  if (error) {
    return []
  }

  // Group by staff
  interface StaffEarningData {
    staff_id: string
    staff_name: string
    total_services: number
    total_service_amount: number
    total_tips: number
    total_earnings: number
    transaction_count: number
  }
  const staffEarnings: Record<string, StaffEarningData> = {}
  
  data?.forEach(record => {
    const staffId = record.staff_id
    if (!staffEarnings[staffId]) {
      staffEarnings[staffId] = {
        staff_id: staffId,
        staff_name: record.staff?.full_name || 'Unknown',
        total_services: 0,
        total_service_amount: 0,
        total_tips: 0,
        total_earnings: 0,
        transaction_count: 0
      }
    }
    
    staffEarnings[staffId].total_service_amount += record.service_amount || 0
    staffEarnings[staffId].total_tips += record.tip_amount || 0
    staffEarnings[staffId].total_earnings += record.total_amount || 0
    staffEarnings[staffId].transaction_count += 1
  })
  
  return Object.values(staffEarnings)
}