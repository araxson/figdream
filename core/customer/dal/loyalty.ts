import { createServerClient } from '@/lib/supabase/server'
import type {
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyReward,
  LoyaltyTier
} from '../types'

export async function getCustomerLoyaltyPrograms(userId: string): Promise<CustomerLoyalty[]> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('customer_loyalty')
    .select(`
      id,
      customer_id,
      program_id,
      current_points,
      lifetime_points,
      current_tier_id,
      joined_at,
      last_activity_at,
      loyalty_programs!inner(
        id,
        salon_id,
        name,
        description,
        program_type,
        is_active,
        points_per_dollar,
        points_per_visit,
        tiers,
        rewards,
        salons(name)
      )
    `)
    .eq('customer_id', userId)
    .eq('loyalty_programs.is_active', true)

  if (error) {
    throw new Error(`Failed to fetch loyalty programs: ${error.message}`)
  }

  return data?.map(loyalty => {
    const program = loyalty.loyalty_programs
    const tiers = program.tiers as LoyaltyTier[]
    const currentTier = tiers.find(tier => tier.id === loyalty.current_tier_id) || tiers[0]
    const nextTier = tiers.find(tier => tier.minimumPoints > loyalty.current_points)

    return {
      id: loyalty.id,
      customerId: loyalty.customer_id,
      programId: loyalty.program_id,
      program: {
        id: program.id,
        salonId: program.salon_id,
        salonName: program.salons?.name || '',
        name: program.name,
        description: program.description || '',
        type: program.program_type,
        isActive: program.is_active,
        rules: {
          pointsPerDollar: program.points_per_dollar,
          pointsPerVisit: program.points_per_visit
        },
        tiers: tiers,
        rewards: program.rewards as LoyaltyReward[]
      },
      currentPoints: loyalty.current_points,
      lifetimePoints: loyalty.lifetime_points,
      currentTier,
      nextTier,
      pointsToNextTier: nextTier ? nextTier.minimumPoints - loyalty.current_points : undefined,
      joinedAt: new Date(loyalty.joined_at),
      lastActivityAt: new Date(loyalty.last_activity_at)
    }
  }) || []
}

export async function joinLoyaltyProgram(
  userId: string,
  programId: string
): Promise<CustomerLoyalty> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Check if already joined
  const { data: existing } = await supabase
    .from('customer_loyalty')
    .select('id')
    .eq('customer_id', userId)
    .eq('program_id', programId)
    .single()

  if (existing) {
    throw new Error('Already joined this loyalty program')
  }

  // Get program details
  const { data: program, error: programError } = await supabase
    .from('loyalty_programs')
    .select(`
      id,
      salon_id,
      name,
      description,
      program_type,
      is_active,
      points_per_dollar,
      points_per_visit,
      tiers,
      rewards,
      salons(name)
    `)
    .eq('id', programId)
    .eq('is_active', true)
    .single()

  if (programError || !program) {
    throw new Error('Loyalty program not found or inactive')
  }

  const tiers = program.tiers as LoyaltyTier[]
  const firstTier = tiers.sort((a, b) => a.minimumPoints - b.minimumPoints)[0]

  // Join program
  const { data, error } = await supabase
    .from('customer_loyalty')
    .insert({
      customer_id: userId,
      program_id: programId,
      current_points: 0,
      lifetime_points: 0,
      current_tier_id: firstTier.id,
      joined_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to join loyalty program: ${error.message}`)
  }

  const nextTier = tiers.find(tier => tier.minimumPoints > 0)

  return {
    id: data.id,
    customerId: data.customer_id,
    programId: data.program_id,
    program: {
      id: program.id,
      salonId: program.salon_id,
      salonName: program.salons?.name || '',
      name: program.name,
      description: program.description || '',
      type: program.program_type,
      isActive: program.is_active,
      rules: {
        pointsPerDollar: program.points_per_dollar,
        pointsPerVisit: program.points_per_visit
      },
      tiers: tiers,
      rewards: program.rewards as LoyaltyReward[]
    },
    currentPoints: 0,
    lifetimePoints: 0,
    currentTier: firstTier,
    nextTier,
    pointsToNextTier: nextTier ? nextTier.minimumPoints : undefined,
    joinedAt: new Date(data.joined_at),
    lastActivityAt: new Date(data.last_activity_at)
  }
}

export async function getLoyaltyTransactions(
  userId: string,
  programId?: string
): Promise<LoyaltyTransaction[]> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  let query = supabase
    .from('loyalty_transactions')
    .select(`
      id,
      customer_id,
      program_id,
      transaction_type,
      points,
      description,
      appointment_id,
      reward_id,
      reference_id,
      created_at,
      loyalty_programs(name, salons(name))
    `)
    .eq('customer_id', userId)

  if (programId) {
    query = query.eq('program_id', programId)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(`Failed to fetch loyalty transactions: ${error.message}`)
  }

  return data?.map(transaction => ({
    id: transaction.id,
    customerId: transaction.customer_id,
    programId: transaction.program_id,
    type: transaction.transaction_type,
    points: transaction.points,
    description: transaction.description,
    appointmentId: transaction.appointment_id,
    rewardId: transaction.reward_id,
    referenceId: transaction.reference_id,
    createdAt: new Date(transaction.created_at)
  })) || []
}

export async function redeemReward(
  userId: string,
  programId: string,
  rewardId: string
): Promise<LoyaltyTransaction> {
  const supabase = createServerClient()

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    throw new Error('Unauthorized')
  }

  // Get customer loyalty info
  const { data: customerLoyalty, error: loyaltyError } = await supabase
    .from('customer_loyalty')
    .select('id, current_points, program_id')
    .eq('customer_id', userId)
    .eq('program_id', programId)
    .single()

  if (loyaltyError || !customerLoyalty) {
    throw new Error('Not enrolled in this loyalty program')
  }

  // Get reward details
  const { data: program, error: programError } = await supabase
    .from('loyalty_programs')
    .select('rewards')
    .eq('id', programId)
    .single()

  if (programError || !program) {
    throw new Error('Loyalty program not found')
  }

  const rewards = program.rewards as LoyaltyReward[]
  const reward = rewards.find(r => r.id === rewardId)

  if (!reward) {
    throw new Error('Reward not found')
  }

  if (!reward.isActive) {
    throw new Error('Reward is not active')
  }

  if (customerLoyalty.current_points < reward.pointsCost) {
    throw new Error('Insufficient points')
  }

  // Check if reward has expired
  if (reward.expiresAt && new Date(reward.expiresAt) < new Date()) {
    throw new Error('Reward has expired')
  }

  // Deduct points and create transaction
  const newPoints = customerLoyalty.current_points - reward.pointsCost

  const { data, error } = await supabase
    .from('loyalty_transactions')
    .insert({
      customer_id: userId,
      program_id: programId,
      transaction_type: 'redeemed',
      points: -reward.pointsCost,
      description: `Redeemed: ${reward.name}`,
      reward_id: rewardId
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to redeem reward: ${error.message}`)
  }

  // Update customer points
  const { error: updateError } = await supabase
    .from('customer_loyalty')
    .update({
      current_points: newPoints,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', customerLoyalty.id)

  if (updateError) {
    throw new Error(`Failed to update points: ${updateError.message}`)
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    programId: data.program_id,
    type: data.transaction_type,
    points: data.points,
    description: data.description,
    rewardId: data.reward_id,
    referenceId: data.reference_id,
    createdAt: new Date(data.created_at)
  }
}

export async function getAvailableLoyaltyPrograms(
  userId: string,
  salonId?: string
): Promise<LoyaltyProgram[]> {
  const supabase = createServerClient()

  // Get programs the user is not already enrolled in
  let query = supabase
    .from('loyalty_programs')
    .select(`
      id,
      salon_id,
      name,
      description,
      program_type,
      is_active,
      points_per_dollar,
      points_per_visit,
      tiers,
      rewards,
      salons(name)
    `)
    .eq('is_active', true)

  if (salonId) {
    query = query.eq('salon_id', salonId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch loyalty programs: ${error.message}`)
  }

  // Filter out programs the user is already enrolled in
  const { data: enrolledPrograms } = await supabase
    .from('customer_loyalty')
    .select('program_id')
    .eq('customer_id', userId)

  const enrolledIds = enrolledPrograms?.map(p => p.program_id) || []

  return data?.filter(program => !enrolledIds.includes(program.id))
    .map(program => ({
      id: program.id,
      salonId: program.salon_id,
      salonName: program.salons?.name || '',
      name: program.name,
      description: program.description || '',
      type: program.program_type,
      isActive: program.is_active,
      rules: {
        pointsPerDollar: program.points_per_dollar,
        pointsPerVisit: program.points_per_visit
      },
      tiers: program.tiers as LoyaltyTier[],
      rewards: program.rewards as LoyaltyReward[]
    })) || []
}

export async function calculateEarnedPoints(
  appointmentAmount: number,
  programId: string
): Promise<number> {
  const supabase = createServerClient()

  const { data: program, error } = await supabase
    .from('loyalty_programs')
    .select('points_per_dollar, points_per_visit')
    .eq('id', programId)
    .single()

  if (error || !program) {
    return 0
  }

  let points = 0

  if (program.points_per_dollar) {
    points += Math.floor(appointmentAmount * program.points_per_dollar)
  }

  if (program.points_per_visit) {
    points += program.points_per_visit
  }

  return points
}