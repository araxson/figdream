'use server'

import { createClient } from '@/lib/database/supabase/server'
import { getUser } from '@/lib/data-access/auth'
import {
  type CreateLoyaltyProgramInput,
  type EnrollCustomerInput,
  type AddPointsInput,
  type RedeemPointsInput,
  createLoyaltyProgramSchema,
  enrollCustomerSchema,
  addPointsSchema,
  redeemPointsSchema,
  loyaltyTiers,
} from '@/lib/validations/advanced-features-schema'

/**
 * Data Access Layer for Loyalty Program Management
 * Handles all loyalty program operations including points, tiers, and rewards
 */

export type LoyaltyProgram = {
  id: string
  salon_id: string
  name: string
  description: string | null
  is_active: boolean
  points_config: {
    points_per_dollar: number
    points_value: number
    minimum_redemption: number
    maximum_redemption_percentage: number
    expiration_days: number | null
  }
  tier_config: Array<{
    tier: typeof loyaltyTiers[number]
    name: string
    points_required: number
    benefits: Array<{
      type: 'points_multiplier' | 'discount' | 'free_service' | 'priority_booking' | 'exclusive_access'
      value?: number
      description: string
    }>
    badge_color: string | null
  }>
  earning_rules: Array<{
    action: string
    points: number
    conditions?: Record<string, any>
  }> | null
  redemption_rules: Array<{
    type: string
    points_required: number
    value?: number
    description: string
    restrictions?: Record<string, any>
  }> | null
  created_at: string
  updated_at: string
}

export type CustomerLoyalty = {
  id: string
  customer_id: string
  program_id: string
  current_points: number
  total_earned: number
  total_redeemed: number
  current_tier: typeof loyaltyTiers[number]
  tier_progress: number
  next_tier: typeof loyaltyTiers[number] | null
  points_to_next_tier: number | null
  enrolled_at: string
  last_activity: string | null
  referral_code: string | null
  status: 'active' | 'inactive' | 'suspended'
}

export type PointsTransaction = {
  id: string
  customer_id: string
  program_id: string
  points: number
  transaction_type: string
  description: string
  reference_id: string | null
  booking_id: string | null
  expires_at: string | null
  created_at: string
}

/**
 * Create a new loyalty program for a salon
 */
export async function createLoyaltyProgram(input: CreateLoyaltyProgramInput) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const validatedInput = createLoyaltyProgramSchema.parse(input)
    const supabase = await createClient()

    // Check if user has permission to create loyalty programs for this salon
    const { data: salonAccess } = await supabase
      .from('user_salon_access')
      .select('role')
      .eq('user_id', user.id)
      .eq('salon_id', validatedInput.salon_id)
      .single()

    if (!salonAccess || !['salon_admin', 'super_admin'].includes(salonAccess.role)) {
      throw new Error('Insufficient permissions to create loyalty program')
    }

    const { data, error } = await supabase
      .from('loyalty_programs')
      .insert({
        salon_id: validatedInput.salon_id,
        name: validatedInput.name,
        description: validatedInput.description,
        is_active: validatedInput.is_active,
        points_config: validatedInput.points_config,
        tier_config: validatedInput.tier_config,
        earning_rules: validatedInput.earning_rules,
        redemption_rules: validatedInput.redemption_rules,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating loyalty program:', error)
      throw new Error('Failed to create loyalty program')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Create loyalty program error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create loyalty program'
    }
  }
}

/**
 * Get loyalty program by salon ID
 */
export async function getLoyaltyProgramBySalon(salonId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('loyalty_programs')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching loyalty program:', error)
      throw new Error('Failed to fetch loyalty program')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get loyalty program error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch loyalty program'
    }
  }
}

/**
 * Enroll customer in loyalty program
 */
export async function enrollCustomer(input: EnrollCustomerInput) {
  try {
    const validatedInput = enrollCustomerSchema.parse(input)
    const supabase = await createClient()

    // Check if customer is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('customer_loyalty')
      .select('id')
      .eq('customer_id', validatedInput.customer_id)
      .eq('program_id', validatedInput.program_id)
      .single()

    if (existingEnrollment) {
      throw new Error('Customer is already enrolled in this program')
    }

    // Generate referral code
    const referralCode = generateReferralCode()

    const { data, error } = await supabase
      .from('customer_loyalty')
      .insert({
        customer_id: validatedInput.customer_id,
        program_id: validatedInput.program_id,
        current_points: validatedInput.initial_points,
        total_earned: validatedInput.initial_points,
        total_redeemed: 0,
        current_tier: 'bronze',
        tier_progress: 0,
        referral_code: referralCode,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error enrolling customer:', error)
      throw new Error('Failed to enroll customer')
    }

    // Add welcome bonus if initial points provided
    if (validatedInput.initial_points > 0) {
      await addPointsTransaction({
        customer_id: validatedInput.customer_id,
        program_id: validatedInput.program_id,
        points: validatedInput.initial_points,
        transaction_type: 'earned_bonus',
        description: 'Welcome bonus for joining loyalty program',
      })
    }

    return { success: true, data }
  } catch (error) {
    console.error('Enroll customer error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enroll customer'
    }
  }
}

/**
 * Get customer loyalty information
 */
export async function getCustomerLoyalty(customerId: string, programId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('customer_loyalty')
      .select(`
        *,
        loyalty_programs (
          name,
          points_config,
          tier_config
        )
      `)
      .eq('customer_id', customerId)
      .eq('program_id', programId)
      .single()

    if (error) {
      console.error('Error fetching customer loyalty:', error)
      throw new Error('Failed to fetch customer loyalty information')
    }

    // Calculate tier progress and next tier info
    const tierConfig = data.loyalty_programs.tier_config
    const currentTierIndex = loyaltyTiers.indexOf(data.current_tier)
    const currentTierConfig = tierConfig.find(t => t.tier === data.current_tier)
    const nextTierConfig = tierConfig.find(t => 
      loyaltyTiers.indexOf(t.tier) === currentTierIndex + 1
    )

    let tierProgress = 0
    let pointsToNextTier = null
    let nextTier = null

    if (nextTierConfig) {
      const currentTierPoints = currentTierConfig?.points_required || 0
      const nextTierPoints = nextTierConfig.points_required
      const totalPointsNeeded = nextTierPoints - currentTierPoints
      const currentProgress = Math.max(0, data.total_earned - currentTierPoints)
      
      tierProgress = totalPointsNeeded > 0 ? (currentProgress / totalPointsNeeded) * 100 : 100
      pointsToNextTier = Math.max(0, nextTierPoints - data.total_earned)
      nextTier = nextTierConfig.tier
    }

    const loyaltyData: CustomerLoyalty = {
      ...data,
      tier_progress: Math.min(100, Math.max(0, tierProgress)),
      next_tier: nextTier,
      points_to_next_tier: pointsToNextTier,
    }

    return { success: true, data: loyaltyData }
  } catch (error) {
    console.error('Get customer loyalty error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer loyalty'
    }
  }
}

/**
 * Add points to customer account
 */
export async function addPointsTransaction(input: AddPointsInput) {
  try {
    const validatedInput = addPointsSchema.parse(input)
    const supabase = await createClient()

    // Start transaction
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from('customer_loyalty')
      .select('current_points, total_earned, current_tier, program_id')
      .eq('customer_id', validatedInput.customer_id)
      .eq('program_id', validatedInput.program_id)
      .single()

    if (loyaltyError) {
      throw new Error('Customer not enrolled in loyalty program')
    }

    // Calculate new totals
    const newCurrentPoints = loyaltyData.current_points + validatedInput.points
    const newTotalEarned = loyaltyData.total_earned + validatedInput.points

    // Get tier configuration to check for tier upgrade
    const { data: programData } = await supabase
      .from('loyalty_programs')
      .select('tier_config')
      .eq('id', validatedInput.program_id)
      .single()

    let newTier = loyaltyData.current_tier
    if (programData?.tier_config) {
      // Find the highest tier the customer qualifies for
      const qualifiedTiers = programData.tier_config
        .filter(tier => newTotalEarned >= tier.points_required)
        .sort((a, b) => b.points_required - a.points_required)
      
      if (qualifiedTiers.length > 0) {
        newTier = qualifiedTiers[0].tier
      }
    }

    // Update customer loyalty record
    const { error: updateError } = await supabase
      .from('customer_loyalty')
      .update({
        current_points: newCurrentPoints,
        total_earned: newTotalEarned,
        current_tier: newTier,
        last_activity: new Date().toISOString(),
      })
      .eq('customer_id', validatedInput.customer_id)
      .eq('program_id', validatedInput.program_id)

    if (updateError) {
      throw new Error('Failed to update customer points')
    }

    // Insert points transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        customer_id: validatedInput.customer_id,
        program_id: validatedInput.program_id,
        points: validatedInput.points,
        transaction_type: validatedInput.transaction_type,
        description: validatedInput.description,
        reference_id: validatedInput.reference_id,
        expires_at: validatedInput.expires_at,
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating points transaction:', transactionError)
      throw new Error('Failed to create points transaction')
    }

    return {
      success: true,
      data: {
        transaction: transactionData,
        tierUpgrade: newTier !== loyaltyData.current_tier ? newTier : null,
        newBalance: newCurrentPoints,
      }
    }
  } catch (error) {
    console.error('Add points error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add points'
    }
  }
}

/**
 * Redeem points for rewards
 */
export async function redeemPoints(input: RedeemPointsInput) {
  try {
    const validatedInput = redeemPointsSchema.parse(input)
    const supabase = await createClient()

    // Check current points balance
    const { data: loyaltyData, error: loyaltyError } = await supabase
      .from('customer_loyalty')
      .select('current_points, total_redeemed')
      .eq('customer_id', validatedInput.customer_id)
      .eq('program_id', validatedInput.program_id)
      .single()

    if (loyaltyError) {
      throw new Error('Customer not enrolled in loyalty program')
    }

    if (loyaltyData.current_points < validatedInput.points) {
      throw new Error('Insufficient points balance')
    }

    // Calculate new balances
    const newCurrentPoints = loyaltyData.current_points - validatedInput.points
    const newTotalRedeemed = loyaltyData.total_redeemed + validatedInput.points

    // Update customer loyalty record
    const { error: updateError } = await supabase
      .from('customer_loyalty')
      .update({
        current_points: newCurrentPoints,
        total_redeemed: newTotalRedeemed,
        last_activity: new Date().toISOString(),
      })
      .eq('customer_id', validatedInput.customer_id)
      .eq('program_id', validatedInput.program_id)

    if (updateError) {
      throw new Error('Failed to update customer points')
    }

    // Insert redemption transaction record
    const { data: transactionData, error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        customer_id: validatedInput.customer_id,
        program_id: validatedInput.program_id,
        points: -validatedInput.points, // Negative for redemption
        transaction_type: `redeemed_${validatedInput.redemption_type}`,
        description: validatedInput.description,
        booking_id: validatedInput.booking_id,
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating redemption transaction:', transactionError)
      throw new Error('Failed to create redemption transaction')
    }

    return {
      success: true,
      data: {
        transaction: transactionData,
        newBalance: newCurrentPoints,
        rewardValue: validatedInput.value,
      }
    }
  } catch (error) {
    console.error('Redeem points error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to redeem points'
    }
  }
}

/**
 * Get points transaction history for customer
 */
export async function getPointsHistory(customerId: string, programId: string, limit = 50) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .eq('program_id', programId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching points history:', error)
      throw new Error('Failed to fetch points history')
    }

    return { success: true, data }
  } catch (error) {
    console.error('Get points history error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch points history'
    }
  }
}

/**
 * Check for expired points and remove them
 */
export async function processExpiredPoints(programId: string) {
  try {
    const supabase = await createClient()
    const now = new Date().toISOString()

    // Find expired points that haven't been processed
    const { data: expiredTransactions, error: fetchError } = await supabase
      .from('points_transactions')
      .select('customer_id, points')
      .eq('program_id', programId)
      .lt('expires_at', now)
      .gt('points', 0) // Only earned points can expire
      .is('processed_at', null)

    if (fetchError) {
      throw new Error('Failed to fetch expired points')
    }

    if (!expiredTransactions.length) {
      return { success: true, data: { expiredPoints: 0, affectedCustomers: 0 } }
    }

    // Group by customer
    const customerExpiredPoints = new Map<string, number>()
    for (const transaction of expiredTransactions) {
      const current = customerExpiredPoints.get(transaction.customer_id) || 0
      customerExpiredPoints.set(transaction.customer_id, current + transaction.points)
    }

    // Process each customer
    for (const [customerId, expiredPoints] of customerExpiredPoints) {
      // Deduct expired points from current balance
      await supabase.rpc('deduct_expired_points', {
        customer_id: customerId,
        program_id: programId,
        expired_points: expiredPoints,
      })

      // Create expiration transaction record
      await supabase
        .from('points_transactions')
        .insert({
          customer_id: customerId,
          program_id: programId,
          points: -expiredPoints,
          transaction_type: 'expired',
          description: `Points expired on ${new Date().toLocaleDateString()}`,
        })
    }

    // Mark expired transactions as processed
    await supabase
      .from('points_transactions')
      .update({ processed_at: now })
      .eq('program_id', programId)
      .lt('expires_at', now)
      .gt('points', 0)
      .is('processed_at', null)

    return {
      success: true,
      data: {
        expiredPoints: Array.from(customerExpiredPoints.values()).reduce((sum, points) => sum + points, 0),
        affectedCustomers: customerExpiredPoints.size,
      }
    }
  } catch (error) {
    console.error('Process expired points error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process expired points'
    }
  }
}

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Get loyalty program analytics for salon admin
 */
export async function getLoyaltyAnalytics(programId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    const supabase = await createClient()

    // Get basic program stats
    const { data: programStats, error: statsError } = await supabase
      .from('customer_loyalty')
      .select('current_tier, status')
      .eq('program_id', programId)

    if (statsError) {
      throw new Error('Failed to fetch program statistics')
    }

    // Calculate tier distribution
    const tierDistribution = loyaltyTiers.reduce((acc, tier) => {
      acc[tier] = programStats.filter(s => s.current_tier === tier && s.status === 'active').length
      return acc
    }, {} as Record<string, number>)

    // Get points activity for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentActivity, error: activityError } = await supabase
      .from('points_transactions')
      .select('transaction_type, points, created_at')
      .eq('program_id', programId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    if (activityError) {
      throw new Error('Failed to fetch recent activity')
    }

    // Calculate activity metrics
    const totalEarned = recentActivity
      .filter(t => t.points > 0)
      .reduce((sum, t) => sum + t.points, 0)

    const totalRedeemed = recentActivity
      .filter(t => t.points < 0)
      .reduce((sum, t) => sum + Math.abs(t.points), 0)

    const analytics = {
      totalMembers: programStats.filter(s => s.status === 'active').length,
      tierDistribution,
      recentActivity: {
        totalEarned,
        totalRedeemed,
        netActivity: totalEarned - totalRedeemed,
      },
      engagementRate: programStats.length > 0 
        ? (recentActivity.length / programStats.length) * 100 
        : 0,
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error('Get loyalty analytics error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics'
    }
  }
}