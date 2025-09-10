import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { requireAuth } from './auth'

type Tables = Database['public']['Tables']
type PlatformSubscription = Tables['platform_subscriptions']['Row']
type PlatformSubscriptionInsert = Tables['platform_subscriptions']['Insert']
type PlatformSubscriptionUpdate = Tables['platform_subscriptions']['Update']

export interface PlatformSubscriptionDTO {
  id: string
  salon_id: string
  plan_id: string
  status: string
  amount: number
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

function toPlatformSubscriptionDTO(subscription: PlatformSubscription): PlatformSubscriptionDTO {
  return {
    id: subscription.id,
    salon_id: subscription.salon_id,
    plan_id: subscription.plan_id,
    status: subscription.status || 'inactive',
    amount: subscription.amount || 0,
    current_period_start: subscription.current_period_start || new Date().toISOString(),
    current_period_end: subscription.current_period_end || new Date().toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    stripe_subscription_id: subscription.stripe_subscription_id,
    created_at: subscription.created_at || new Date().toISOString(),
    updated_at: subscription.updated_at || new Date().toISOString()
  }
}

export const getPlatformSubscriptions = cache(async (): Promise<PlatformSubscriptionDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platform_subscriptions')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching platform subscriptions:', error)
    return []
  }
  
  return (data || []).map(toPlatformSubscriptionDTO)
})

export const getPlatformSubscriptionsBySalon = cache(async (
  salonId: string
): Promise<PlatformSubscriptionDTO[]> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platform_subscriptions')
    .select('*')
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching salon subscriptions:', error)
    return []
  }
  
  return (data || []).map(toPlatformSubscriptionDTO)
})

export const getActivePlatformSubscription = cache(async (
  salonId: string
): Promise<PlatformSubscriptionDTO | null> => {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platform_subscriptions')
    .select('*')
    .eq('salon_id', salonId)
    .eq('status', 'active')
    .single()
  
  if (error) {
    console.error('Error fetching active subscription:', error)
    return null
  }
  
  return data ? toPlatformSubscriptionDTO(data) : null
})

export async function createPlatformSubscription(
  subscription: PlatformSubscriptionInsert
): Promise<PlatformSubscriptionDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platform_subscriptions')
    .insert(subscription)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating platform subscription:', error)
    throw new Error('Failed to create subscription')
  }
  
  return data ? toPlatformSubscriptionDTO(data) : null
}

export async function updatePlatformSubscription(
  id: string,
  updates: PlatformSubscriptionUpdate
): Promise<PlatformSubscriptionDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platform_subscriptions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating platform subscription:', error)
    throw new Error('Failed to update subscription')
  }
  
  return data ? toPlatformSubscriptionDTO(data) : null
}

export async function cancelPlatformSubscription(
  id: string
): Promise<PlatformSubscriptionDTO | null> {
  await requireAuth()
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('platform_subscriptions')
    .update({ 
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error cancelling platform subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
  
  return data ? toPlatformSubscriptionDTO(data) : null
}