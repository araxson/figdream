'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import type { ActionResponse, Subscription, SubscriptionInsert } from './subscription-types'
import {
  CreateSubscriptionSchema,
  calculateSubscriptionPeriods,
  calculateTrialEnd,
  getInvalidationTags
} from './subscription-helpers'

export async function createSubscription(
  data: FormData | SubscriptionInsert
): Promise<ActionResponse<Subscription>> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'SECURITY: Authentication required',
      code: 'AUTH_REQUIRED'
    }
  }

  try {
    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = CreateSubscriptionSchema.parse(rawData)

    // Check if salon already has an active subscription
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('salon_id', validatedData.salon_id)
      .in('status', ['active', 'trialing'])

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      return {
        success: false,
        error: 'Salon already has an active subscription',
        code: 'DUPLICATE_SUBSCRIPTION'
      }
    }

    // Calculate subscription periods
    const { currentPeriodStart, currentPeriodEnd } = calculateSubscriptionPeriods()

    // Calculate trial end if specified
    const trialEnd = calculateTrialEnd(validatedData.trial_days)

    // Insert subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        salon_id: validatedData.salon_id,
        customer_id: user.id,
        plan_id: validatedData.plan_id,
        status: trialEnd ? 'trialing' : 'active',
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        cancel_at_period_end: false,
        trial_end: trialEnd,
        metadata: validatedData.metadata || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Cache invalidation
    revalidatePath('/dashboard/subscriptions')
    revalidatePath('/admin/subscriptions')
    revalidateTag(`subscriptions-${validatedData.salon_id}`)
    revalidateTag(`subscriptions-customer-${user.id}`)

    return {
      success: true,
      data: subscription as Subscription,
      message: trialEnd ? 'Trial subscription started' : 'Subscription created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createSubscription]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to create subscription',
      code: 'OPERATION_FAILED'
    }
  }
}