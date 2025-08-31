import { Database } from '@/types/database.types'
import { createServerClient } from '@/lib/database/supabase/server'
import { cache } from 'react'

type LoyaltyProgram = Database['public']['Tables']['loyalty_programs']['Row']
type LoyaltyPointsLedger = Database['public']['Tables']['loyalty_points_ledger']['Row']
type LoyaltyTransaction = Database['public']['Tables']['loyalty_transactions']['Row']
type Customer = Database['public']['Tables']['customers']['Row']

/**
 * Get loyalty program configuration for a salon
 */
export const getLoyaltyProgram = cache(async (salonId: string) => {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('loyalty_programs')
    .select('*')
    .eq('salon_id', salonId)
    .single()

  if (error) {
    console.error('Error fetching loyalty program:', error)
    return null
  }

  return data
})

/**
 * Create or update loyalty program configuration
 */
export async function upsertLoyaltyProgram(
  salonId: string,
  program: Partial<LoyaltyProgram>
) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('loyalty_programs')
    .upsert({
      ...program,
      salon_id: salonId,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting loyalty program:', error)
    throw new Error('Failed to save loyalty program')
  }

  return data
})

/**
 * Get customer points balance
 */
export const getCustomerPoints = cache(async (customerId: string, salonId: string) => {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('loyalty_points_ledger')
    .select('points_balance')
    .eq('customer_id', customerId)
    .eq('salon_id', salonId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No record found, return 0 points
      return { points_balance: 0, tier: 'bronze' }
    }
    console.error('Error fetching customer points:', error)
    return { points_balance: 0, tier: 'bronze' }
  }

  // Calculate tier based on points
  let tier = 'bronze'
  if (data.points_balance >= 5000) tier = 'platinum'
  else if (data.points_balance >= 2000) tier = 'gold'
  else if (data.points_balance >= 500) tier = 'silver'

  return { ...data, tier }
})

/**
 * Adjust customer loyalty points
 */
export async function adjustCustomerPoints(
  customerId: string,
  salonId: string,
  adjustment: {
    points: number
    type: 'earned' | 'redeemed' | 'adjusted' | 'expired'
    description: string
    reference_id?: string
    reference_type?: string
  }
) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get current balance
  const currentBalance = await getCustomerPoints(customerId, salonId)
  const newBalance = Math.max(0, currentBalance.points_balance + adjustment.points)

  // Start transaction
  const { error: ledgerError } = await supabase
    .from('loyalty_points_ledger')
    .upsert({
      customer_id: customerId,
      salon_id: salonId,
      points_balance: newBalance,
      points_earned: adjustment.type === 'earned' 
        ? currentBalance.points_balance + adjustment.points 
        : currentBalance.points_balance,
      points_redeemed: adjustment.type === 'redeemed'
        ? currentBalance.points_balance + Math.abs(adjustment.points)
        : currentBalance.points_balance,
      last_earned_at: adjustment.type === 'earned' 
        ? new Date().toISOString() 
        : undefined,
      last_redeemed_at: adjustment.type === 'redeemed'
        ? new Date().toISOString()
        : undefined
    })

  if (ledgerError) {
    console.error('Error updating points ledger:', ledgerError)
    throw new Error('Failed to update points balance')
  }

  // Record transaction
  const { data: transaction, error: transactionError } = await supabase
    .from('loyalty_transactions')
    .insert({
      customer_id: customerId,
      salon_id: salonId,
      transaction_type: adjustment.type,
      points: adjustment.points,
      balance_after: newBalance,
      description: adjustment.description,
      reference_id: adjustment.reference_id,
      reference_type: adjustment.reference_type,
      created_by: user.id
    })
    .select()
    .single()

  if (transactionError) {
    console.error('Error creating transaction:', transactionError)
    throw new Error('Failed to record transaction')
  }

  return { 
    newBalance, 
    transaction,
    tier: newBalance >= 5000 ? 'platinum' : 
          newBalance >= 2000 ? 'gold' : 
          newBalance >= 500 ? 'silver' : 'bronze'
  }
}

/**
 * Get loyalty transactions history
 */
export const getLoyaltyTransactions = cache(async (
  salonId: string,
  filters?: {
    customerId?: string
    startDate?: string
    endDate?: string
    type?: string
    limit?: number
    offset?: number
  }
) => {
  const supabase = await createServerClient()
  
  let query = supabase
    .from('loyalty_transactions')
    .select(`
      *,
      customers (
        id,
        first_name,
        last_name,
        email
      )
    `, { count: 'exact' })
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })

  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId)
  }
  
  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }
  
  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }
  
  if (filters?.type) {
    query = query.eq('transaction_type', filters.type)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return { transactions: [], total: 0 }
  }

  return { transactions: data || [], total: count || 0 }
})

/**
 * Get loyalty program statistics
 */
export const getLoyaltyStats = cache(async (salonId: string) => {
  const supabase = await createServerClient()
  
  const [program, ledger, transactions] = await Promise.all([
    // Get program config
    getLoyaltyProgram(salonId),
    
    // Get total customers enrolled and total points
    supabase
      .from('loyalty_points_ledger')
      .select('points_balance', { count: 'exact' })
      .eq('salon_id', salonId),
    
    // Get recent transactions
    supabase
      .from('loyalty_transactions')
      .select('points, transaction_type')
      .eq('salon_id', salonId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
  ])

  const totalCustomers = ledger.count || 0
  const totalPoints = ledger.data?.reduce((sum, l) => sum + l.points_balance, 0) || 0
  const avgPointsPerCustomer = totalCustomers > 0 ? Math.round(totalPoints / totalCustomers) : 0
  
  // Calculate monthly activity
  const monthlyEarned = transactions.data
    ?.filter(t => t.transaction_type === 'earned')
    .reduce((sum, t) => sum + t.points, 0) || 0
  
  const monthlyRedeemed = transactions.data
    ?.filter(t => t.transaction_type === 'redeemed')
    .reduce((sum, t) => sum + Math.abs(t.points), 0) || 0

  // Calculate tier distribution
  const tierDistribution = {
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0
  }
  
  ledger.data?.forEach(l => {
    if (l.points_balance >= 5000) tierDistribution.platinum++
    else if (l.points_balance >= 2000) tierDistribution.gold++
    else if (l.points_balance >= 500) tierDistribution.silver++
    else tierDistribution.bronze++
  })

  return {
    program,
    stats: {
      totalCustomers,
      totalPoints,
      avgPointsPerCustomer,
      monthlyEarned,
      monthlyRedeemed,
      tierDistribution
    }
  }
})

/**
 * Get top loyalty customers
 */
export const getTopLoyaltyCustomers = cache(async (salonId: string, limit = 10) => {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('loyalty_points_ledger')
    .select(`
      *,
      customers (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .eq('salon_id', salonId)
    .order('points_balance', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching top customers:', error)
    return []
  }

  return data?.map(item => ({
    ...item,
    tier: item.points_balance >= 5000 ? 'platinum' : 
          item.points_balance >= 2000 ? 'gold' : 
          item.points_balance >= 500 ? 'silver' : 'bronze'
  })) || []
})

/**
 * Search customers for points adjustment
 */
export const searchLoyaltyCustomers = cache(async (
  salonId: string,
  search: string
) => {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      loyalty_points_ledger!left (
        points_balance
      )
    `)
    .eq('salon_id', salonId)
    .or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    .limit(20)

  if (error) {
    console.error('Error searching customers:', error)
    return []
  }

  return data?.map(customer => ({
    ...customer,
    points_balance: customer.loyalty_points_ledger?.[0]?.points_balance || 0
  })) || []
})

/**
 * Bulk adjust points for multiple customers
 */
export async function bulkAdjustPoints(
  salonId: string,
  adjustments: Array<{
    customerId: string
    points: number
    description: string
  }>
) {
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const results = []
  const errors = []

  for (const adjustment of adjustments) {
    try {
      const result = await adjustCustomerPoints(
        adjustment.customerId,
        salonId,
        {
          points: adjustment.points,
          type: adjustment.points > 0 ? 'earned' : 'adjusted',
          description: adjustment.description
        }
      )
      results.push({ customerId: adjustment.customerId, success: true, result })
    } catch (error) {
      errors.push({ customerId: adjustment.customerId, error: error.message })
    }
  }

  return { results, errors }
}

/**
 * Get loyalty rewards for a salon
 */
export const getLoyaltyRewards = cache(async (salonId: string) => {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .eq('salon_id', salonId)
    .order('points_cost', { ascending: true })

  if (error) {
    console.error('Error fetching loyalty rewards:', error)
    return []
  }

  return data || []
})