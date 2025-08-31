'use server'

import { createClient } from '@/lib/database/supabase/server'
import type { Database } from '@/types/database.types'

// ULTRA-TYPES: Comprehensive type definitions
type SubscriptionPlan = Database['public']['Tables']['platform_subscription_plans']['Row']
type SubscriptionPlanInsert = Database['public']['Tables']['platform_subscription_plans']['Insert']
type SubscriptionPlanUpdate = Database['public']['Tables']['platform_subscription_plans']['Update']

type PlatformSubscription = Database['public']['Tables']['platform_subscriptions']['Row']
type SubscriptionInsert = Database['public']['Tables']['platform_subscriptions']['Insert']
type SubscriptionUpdate = Database['public']['Tables']['platform_subscriptions']['Update']

// ULTRA-INTERFACES: Extended types with relationships
export interface SubscriptionPlanWithStats extends SubscriptionPlan {
  active_subscriptions_count?: number
  total_revenue?: number
  churn_rate?: number
}

export interface PlatformSubscriptionWithDetails extends PlatformSubscription {
  salon?: {
    id: string
    name: string
    email?: string
    phone?: string
    owner_id?: string
  }
  plan?: SubscriptionPlan
  billing_history?: Array<{
    id: string
    amount: number
    status: string
    created_at: string
    invoice_url?: string
  }>
  usage?: {
    staff_count: number
    location_count: number
    appointment_count: number
    sms_count: number
    storage_gb: number
  }
}

// ULTRA-RESULTS: Standardized result types
export interface SubscriptionPlanResult {
  data: SubscriptionPlan | null
  error: string | null
}

export interface SubscriptionPlansResult {
  data: SubscriptionPlanWithStats[] | null
  error: string | null
}

export interface SubscriptionResult {
  data: PlatformSubscription | null
  error: string | null
}

export interface SubscriptionsResult {
  data: PlatformSubscriptionWithDetails[] | null
  error: string | null
}

export interface SubscriptionMetrics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  activeSubscriptions: number
  trialSubscriptions: number
  churnRate: number
  averageRevenuePerUser: number
  lifetimeValue: number
}

// ULTRA-FUNCTION: Get all subscription plans with statistics
export async function getSubscriptionPlans(): Promise<SubscriptionPlansResult> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { data: null, error: 'Insufficient permissions' }
    }

    // Fetch plans with related data
    const { data: plans, error } = await supabase
      .from('platform_subscription_plans')
      .select(`
        *,
        platform_subscriptions (
          id,
          status,
          amount,
          salon_id
        )
      `)
      .order('price_monthly', { ascending: true })

    if (error) {
      return { data: null, error: error.message }
    }

    // Calculate statistics for each plan
    const plansWithStats = (plans || []).map(plan => {
      const subscriptions = plan.platform_subscriptions || []
      const activeSubscriptions = subscriptions.filter((sub: any) => sub.status === 'active')
      
      return {
        ...plan,
        active_subscriptions_count: activeSubscriptions.length,
        total_revenue: activeSubscriptions.reduce((sum: number, sub: any) => sum + (sub.amount || plan.price_monthly || 0), 0),
        churn_rate: 0 // Would calculate from historical data
      }
    })

    return { data: plansWithStats, error: null }
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return { data: null, error: 'Failed to fetch subscription plans' }
  }
}

// ULTRA-FUNCTION: Get subscription plan by ID
export async function getSubscriptionPlanById(planId: string): Promise<SubscriptionPlanResult> {
  try {
    const supabase = await createClient()
    
    const { data: plan, error } = await supabase
      .from('platform_subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: plan, error: null }
  } catch (error) {
    console.error('Error fetching subscription plan:', error)
    return { data: null, error: 'Failed to fetch subscription plan' }
  }
}

// ULTRA-FUNCTION: Create subscription plan
export async function createSubscriptionPlan(planData: SubscriptionPlanInsert): Promise<SubscriptionPlanResult> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { data: null, error: 'Insufficient permissions' }
    }

    const { data: plan, error } = await supabase
      .from('platform_subscription_plans')
      .insert({
        ...planData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: plan, error: null }
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return { data: null, error: 'Failed to create subscription plan' }
  }
}

// ULTRA-FUNCTION: Update subscription plan
export async function updateSubscriptionPlan(
  planId: string,
  updates: SubscriptionPlanUpdate
): Promise<SubscriptionPlanResult> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { data: null, error: 'Insufficient permissions' }
    }

    const { data: plan, error } = await supabase
      .from('platform_subscription_plans')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: plan, error: null }
  } catch (error) {
    console.error('Error updating subscription plan:', error)
    return { data: null, error: 'Failed to update subscription plan' }
  }
}

// ULTRA-FUNCTION: Delete (deactivate) subscription plan
export async function deleteSubscriptionPlan(planId: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { success: false, error: 'Insufficient permissions' }
    }

    // Check for active subscriptions
    const { count } = await supabase
      .from('platform_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId)
      .eq('status', 'active')

    if (count && count > 0) {
      return { success: false, error: 'Cannot delete plan with active subscriptions' }
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('platform_subscription_plans')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', planId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error deleting subscription plan:', error)
    return { success: false, error: 'Failed to delete subscription plan' }
  }
}

// ULTRA-FUNCTION: Get all platform subscriptions with details
export async function getPlatformSubscriptions(
  filters?: {
    status?: string
    salon_id?: string
    plan_id?: string
  }
): Promise<SubscriptionsResult> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { data: null, error: 'Insufficient permissions' }
    }

    let query = supabase
      .from('platform_subscriptions')
      .select(`
        *,
        salons (
          id,
          name,
          email,
          phone,
          owner_id
        ),
        platform_subscription_plans (*)
      `)

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.salon_id) {
      query = query.eq('salon_id', filters.salon_id)
    }
    if (filters?.plan_id) {
      query = query.eq('plan_id', filters.plan_id)
    }

    const { data: subscriptions, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message }
    }

    // Transform data to match interface
    const subscriptionsWithDetails = (subscriptions || []).map(sub => ({
      ...sub,
      salon: sub.salons,
      plan: sub.platform_subscription_plans
    }))

    return { data: subscriptionsWithDetails, error: null }
  } catch (error) {
    console.error('Error fetching platform subscriptions:', error)
    return { data: null, error: 'Failed to fetch platform subscriptions' }
  }
}

// ULTRA-FUNCTION: Get subscription by salon ID
export async function getSubscriptionBySalonId(salonId: string): Promise<SubscriptionResult> {
  try {
    const supabase = await createClient()
    
    const { data: subscription, error } = await supabase
      .from('platform_subscriptions')
      .select(`
        *,
        platform_subscription_plans (*)
      `)
      .eq('salon_id', salonId)
      .eq('status', 'active')
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: subscription, error: null }
  } catch (error) {
    console.error('Error fetching salon subscription:', error)
    return { data: null, error: 'Failed to fetch salon subscription' }
  }
}

// ULTRA-FUNCTION: Create platform subscription
export async function createPlatformSubscription(
  subscriptionData: SubscriptionInsert
): Promise<SubscriptionResult> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { data: null, error: 'Insufficient permissions' }
    }

    // Check if salon already has active subscription
    const { data: existing } = await supabase
      .from('platform_subscriptions')
      .select('id')
      .eq('salon_id', subscriptionData.salon_id)
      .eq('status', 'active')
      .single()

    if (existing) {
      return { data: null, error: 'Salon already has an active subscription' }
    }

    const { data: subscription, error } = await supabase
      .from('platform_subscriptions')
      .insert({
        ...subscriptionData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: subscription, error: null }
  } catch (error) {
    console.error('Error creating platform subscription:', error)
    return { data: null, error: 'Failed to create platform subscription' }
  }
}

// ULTRA-FUNCTION: Update platform subscription
export async function updatePlatformSubscription(
  subscriptionId: string,
  updates: SubscriptionUpdate
): Promise<SubscriptionResult> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { data: null, error: 'Insufficient permissions' }
    }

    const { data: subscription, error } = await supabase
      .from('platform_subscriptions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: subscription, error: null }
  } catch (error) {
    console.error('Error updating platform subscription:', error)
    return { data: null, error: 'Failed to update platform subscription' }
  }
}

// ULTRA-FUNCTION: Cancel platform subscription
export async function cancelPlatformSubscription(
  subscriptionId: string,
  reason?: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { success: false, error: 'Insufficient permissions' }
    }

    const { error } = await supabase
      .from('platform_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error canceling platform subscription:', error)
    return { success: false, error: 'Failed to cancel platform subscription' }
  }
}

// ULTRA-FUNCTION: Get subscription metrics
export async function getSubscriptionMetrics(): Promise<{ data: SubscriptionMetrics | null; error: string | null }> {
  try {
    const supabase = await createClient()
    
    // Verify super admin access
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'super_admin') {
      return { data: null, error: 'Insufficient permissions' }
    }

    // Fetch all subscriptions with plan details
    const { data: subscriptions, error } = await supabase
      .from('platform_subscriptions')
      .select(`
        *,
        platform_subscription_plans (
          price_monthly,
          price_yearly
        )
      `)

    if (error) {
      return { data: null, error: error.message }
    }

    // Calculate metrics
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || []
    const trialSubscriptions = subscriptions?.filter(s => s.status === 'trial') || []
    
    const monthlyRecurringRevenue = activeSubscriptions.reduce((sum, sub) => {
      return sum + (sub.amount || sub.platform_subscription_plans?.price_monthly || 0)
    }, 0)

    const annualRecurringRevenue = monthlyRecurringRevenue * 12

    const averageRevenuePerUser = activeSubscriptions.length > 0 
      ? monthlyRecurringRevenue / activeSubscriptions.length 
      : 0

    // Calculate churn rate (simplified - would need historical data)
    const totalSubscriptions = subscriptions?.length || 0
    const canceledSubscriptions = subscriptions?.filter(s => s.status === 'canceled').length || 0
    const churnRate = totalSubscriptions > 0 ? (canceledSubscriptions / totalSubscriptions) * 100 : 0

    // Calculate lifetime value (simplified)
    const averageSubscriptionLength = 12 // months (would calculate from actual data)
    const lifetimeValue = averageRevenuePerUser * averageSubscriptionLength

    const metrics: SubscriptionMetrics = {
      totalRevenue: annualRecurringRevenue,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      activeSubscriptions: activeSubscriptions.length,
      trialSubscriptions: trialSubscriptions.length,
      churnRate,
      averageRevenuePerUser,
      lifetimeValue
    }

    return { data: metrics, error: null }
  } catch (error) {
    console.error('Error calculating subscription metrics:', error)
    return { data: null, error: 'Failed to calculate subscription metrics' }
  }
}

// ULTRA-FUNCTION: Check subscription limits
export async function checkSubscriptionLimits(
  salonId: string
): Promise<{ 
  data: {
    withinLimits: boolean
    limits: any
    usage: any
    warnings: string[]
  } | null
  error: string | null 
}> {
  try {
    const supabase = await createClient()
    
    // Get salon's active subscription
    const { data: subscription, error: subError } = await supabase
      .from('platform_subscriptions')
      .select(`
        *,
        platform_subscription_plans (*)
      `)
      .eq('salon_id', salonId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return { data: null, error: 'No active subscription found' }
    }

    const plan = subscription.platform_subscription_plans
    const limits = plan?.limits || {}

    // Get current usage
    const { count: staffCount } = await supabase
      .from('staff_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true)

    const { count: locationCount } = await supabase
      .from('salon_locations')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true)

    // Calculate monthly appointments (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { count: appointmentCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    const usage = {
      staff: staffCount || 0,
      locations: locationCount || 0,
      appointments: appointmentCount || 0,
      sms: 0, // Would fetch from SMS usage table
      storage: 0 // Would calculate from storage usage
    }

    const warnings: string[] = []
    let withinLimits = true

    // Check limits
    if (limits.staff && usage.staff >= limits.staff) {
      warnings.push(`Staff limit reached (${usage.staff}/${limits.staff})`)
      withinLimits = false
    }
    if (limits.locations && usage.locations >= limits.locations) {
      warnings.push(`Location limit reached (${usage.locations}/${limits.locations})`)
      withinLimits = false
    }
    if (limits.appointments && usage.appointments >= limits.appointments) {
      warnings.push(`Monthly appointment limit reached (${usage.appointments}/${limits.appointments})`)
      withinLimits = false
    }

    return {
      data: {
        withinLimits,
        limits,
        usage,
        warnings
      },
      error: null
    }
  } catch (error) {
    console.error('Error checking subscription limits:', error)
    return { data: null, error: 'Failed to check subscription limits' }
  }
}