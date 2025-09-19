'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import type { ActionResponse, Subscription, SubscriptionUpdate } from './subscription-types'
import {
  UpdateSubscriptionSchema,
  ChangePlanSchema,
  checkSubscriptionPermissions,
  getInvalidationTags
} from './subscription-helpers'

export async function updateSubscription(
  id: string,
  data: FormData | SubscriptionUpdate
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
    // Verify ownership
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return {
        success: false,
        error: 'Subscription not found',
        code: 'NOT_FOUND'
      }
    }

    // Check permissions
    const { isAuthorized } = await checkSubscriptionPermissions(existing, user.id)

    if (!isAuthorized) {
      return {
        success: false,
        error: 'SECURITY: Unauthorized access',
        code: 'UNAUTHORIZED'
      }
    }

    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = UpdateSubscriptionSchema.parse(rawData)

    // Update subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Cache invalidation
    revalidatePath('/dashboard/subscriptions')
    revalidatePath('/admin/subscriptions')
    const tags = getInvalidationTags(existing)
    tags.forEach(tag => revalidateTag(tag))

    return {
      success: true,
      data: subscription as Subscription,
      message: 'Subscription updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateSubscription]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: id,
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
        : 'Failed to update subscription',
      code: 'OPERATION_FAILED'
    }
  }
}

export async function changeSubscriptionPlan(
  id: string,
  data: FormData | { new_plan_id: string; prorate?: boolean }
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
    // Verify ownership
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return {
        success: false,
        error: 'Subscription not found',
        code: 'NOT_FOUND'
      }
    }

    // Check permissions
    const { isAuthorized } = await checkSubscriptionPermissions(existing, user.id)

    if (!isAuthorized) {
      return {
        success: false,
        error: 'SECURITY: Unauthorized access',
        code: 'UNAUTHORIZED'
      }
    }

    // Can't change plan for cancelled subscriptions
    if (existing.status === 'cancelled') {
      return {
        success: false,
        error: 'Cannot change plan for cancelled subscription',
        code: 'INVALID_STATUS'
      }
    }

    const rawData = data instanceof FormData
      ? Object.fromEntries(data.entries())
      : data

    const validatedData = ChangePlanSchema.parse(rawData)

    // Update subscription plan
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: validatedData.new_plan_id,
        metadata: {
          ...(existing.metadata || {}),
          plan_changed_at: new Date().toISOString(),
          previous_plan_id: existing.plan_id,
          prorated: validatedData.prorate
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Cache invalidation
    revalidatePath('/dashboard/subscriptions')
    revalidatePath('/admin/subscriptions')
    const tags = getInvalidationTags(existing)
    tags.forEach(tag => revalidateTag(tag))

    return {
      success: true,
      data: subscription as Subscription,
      message: 'Subscription plan changed successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - changeSubscriptionPlan]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: id,
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
        : 'Failed to change subscription plan',
      code: 'OPERATION_FAILED'
    }
  }
}