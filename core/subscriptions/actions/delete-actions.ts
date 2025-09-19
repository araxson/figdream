'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { ActionResponse, Subscription } from './subscription-types'
import { checkSubscriptionPermissions, getInvalidationTags } from './subscription-helpers'

export async function cancelSubscription(
  id: string,
  immediately = false
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

    // Cancel subscription
    const updateData = immediately
      ? { status: 'cancelled' as const, updated_at: new Date().toISOString() }
      : { cancel_at_period_end: true, updated_at: new Date().toISOString() }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update(updateData)
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
      message: immediately
        ? 'Subscription cancelled immediately'
        : 'Subscription will be cancelled at the end of the current period'
    }

  } catch (error) {
    console.error('[Server Action Error - cancelSubscription]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to cancel subscription',
      code: 'OPERATION_FAILED'
    }
  }
}

export async function reactivateSubscription(
  id: string
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

    // Can only reactivate if cancelled but period hasn't ended
    if (existing.status === 'cancelled' && !existing.cancel_at_period_end) {
      return {
        success: false,
        error: 'Cannot reactivate a fully cancelled subscription',
        code: 'INVALID_STATUS'
      }
    }

    if (!existing.cancel_at_period_end) {
      return {
        success: false,
        error: 'Subscription is not scheduled for cancellation',
        code: 'NOT_CANCELLING'
      }
    }

    // Reactivate subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
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
      message: 'Subscription reactivated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - reactivateSubscription]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to reactivate subscription',
      code: 'OPERATION_FAILED'
    }
  }
}