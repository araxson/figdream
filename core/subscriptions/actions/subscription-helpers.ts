// Shared utilities and helpers for subscription actions

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Subscription } from './subscription-types'

// Validation schemas
export const CreateSubscriptionSchema = z.object({
  salon_id: z.string().uuid('Invalid salon ID'),
  plan_id: z.string().min(1, 'Plan ID required'),
  trial_days: z.number().min(0).max(90).optional(),
  payment_method_id: z.string().uuid().optional(),
  metadata: z.record(z.any()).optional()
})

export const UpdateSubscriptionSchema = z.object({
  cancel_at_period_end: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
})

export const ChangePlanSchema = z.object({
  new_plan_id: z.string().min(1, 'New plan ID required'),
  prorate: z.boolean().default(true)
})

// Permission check helper
export async function checkSubscriptionPermissions(
  subscription: Subscription,
  userId: string
): Promise<{ isAuthorized: boolean; isOwner: boolean; isSalonAdmin: boolean }> {
  const supabase = await createClient()

  // Check if user is the subscription owner
  const isOwner = subscription.customer_id === userId

  // Check if user is salon admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_salon_id, role')
    .eq('id', userId)
    .single()

  const isSalonAdmin = profile?.current_salon_id === subscription.salon_id &&
                      ['admin', 'owner', 'manager'].includes(profile?.role || '')

  return {
    isAuthorized: isOwner || isSalonAdmin,
    isOwner,
    isSalonAdmin
  }
}

// Cache invalidation helper
export function getInvalidationTags(subscription: Subscription): string[] {
  return [
    `subscriptions-${subscription.salon_id}`,
    `subscriptions-customer-${subscription.customer_id}`
  ]
}

// Date calculation helpers
export function calculateSubscriptionPeriods() {
  const currentPeriodStart = new Date()
  const currentPeriodEnd = new Date()
  currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1)

  return {
    currentPeriodStart: currentPeriodStart.toISOString(),
    currentPeriodEnd: currentPeriodEnd.toISOString()
  }
}

export function calculateTrialEnd(trialDays?: number): string | undefined {
  if (!trialDays) return undefined
  return new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
}