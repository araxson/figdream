import { createClient } from '@/lib/supabase/server'
import { SubscriptionsClient } from './subscriptions-client'

async function getSubscriptionsData(salonId?: string) {
  const supabase = await createClient()
  
  // Get subscriptions with relationships
  let query = supabase
    .from('platform_subscriptions')
    .select(`
      *,
      salon:salons!platform_subscriptions_salon_id_fkey(
        id,
        name,
        slug,
        owner_id
      ),
      plan:pricing_plans!platform_subscriptions_plan_id_fkey(
        id,
        name,
        price,
        billing_period,
        features:pricing_features(*)
      )
    `)
    .order('created_at', { ascending: false })
  
  if (salonId) {
    query = query.eq('salon_id', salonId)
  }
  
  const { data: subscriptions, error: subscriptionsError } = await query
  
  if (subscriptionsError) {
    console.error('Error fetching subscriptions:', subscriptionsError)
  }
  
  // Get salons for filter dropdown
  const { data: salons } = await supabase
    .from('salons')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  // Get available pricing plans
  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('id, name, price, billing_period')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  // Get statistics
  const { count: totalSubscriptions } = await supabase
    .from('platform_subscriptions')
    .select('*', { count: 'exact', head: true })
  
  const { count: activeSubscriptions } = await supabase
    .from('platform_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
  
  const { count: cancelledSubscriptions } = await supabase
    .from('platform_subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'cancelled')
  
  // Calculate monthly recurring revenue (MRR)
  const { data: activeRevenue } = await supabase
    .from('platform_subscriptions')
    .select('amount, plan:pricing_plans!platform_subscriptions_plan_id_fkey(billing_period)')
    .eq('status', 'active')
  
  const mrr = activeRevenue?.reduce((sum, sub) => {
    const amount = sub.amount || 0
    // Convert yearly to monthly
    const monthlyAmount = sub.plan?.billing_period === 'yearly' ? amount / 12 : amount
    return sum + monthlyAmount
  }, 0) || 0
  
  return {
    subscriptions: subscriptions || [],
    salons: salons || [],
    plans: plans || [],
    counts: {
      total: totalSubscriptions || 0,
      active: activeSubscriptions || 0,
      cancelled: cancelledSubscriptions || 0,
      mrr: Math.round(mrr * 100) / 100
    },
    currentSalonId: salonId
  }
}

interface SubscriptionsServerProps {
  salonId?: string
}

export async function SubscriptionsServer({ salonId }: SubscriptionsServerProps) {
  const data = await getSubscriptionsData(salonId)
  
  return <SubscriptionsClient {...data} />
}