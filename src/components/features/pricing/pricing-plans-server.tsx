import { createClient } from '@/lib/supabase/server'
import { PricingPlansClient } from './pricing-plans-client'

async function getPricingData() {
  const supabase = await createClient()
  
  // Get pricing plans with features
  const { data: plans, error: plansError } = await supabase
    .from('pricing_plans')
    .select(`
      *,
      features:pricing_features(*)
    `)
    .order('display_order', { ascending: true })
  
  if (plansError) {
    console.error('Error fetching pricing plans:', plansError)
  }
  
  // Get subscription counts per plan
  const { data: subscriptions } = await supabase
    .from('platform_subscriptions')
    .select('plan_id')
  
  const subscriptionCounts = subscriptions?.reduce((acc, sub) => {
    acc[sub.plan_id] = (acc[sub.plan_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  // Get statistics
  const { count: totalPlans } = await supabase
    .from('pricing_plans')
    .select('*', { count: 'exact', head: true })
  
  const { count: activePlans } = await supabase
    .from('pricing_plans')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const { count: totalSubscriptions } = await supabase
    .from('platform_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  // Calculate total revenue
  const { data: revenueData } = await supabase
    .from('platform_subscriptions')
    .select('amount')
    .eq('status', 'active')
  
  const monthlyRevenue = revenueData?.reduce((sum, sub) => sum + (sub.amount || 0), 0) || 0
  
  return {
    plans: plans?.map(plan => ({
      ...plan,
      subscriptionCount: subscriptionCounts[plan.id] || 0
    })) || [],
    counts: {
      total: totalPlans || 0,
      active: activePlans || 0,
      subscriptions: totalSubscriptions || 0,
      monthlyRevenue
    }
  }
}

export async function PricingPlansServer() {
  const data = await getPricingData()
  
  return <PricingPlansClient {...data} />
}