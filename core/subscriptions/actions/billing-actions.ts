'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { ActionResponse, Subscription } from './subscription-types'
import { checkSubscriptionPermissions, getInvalidationTags } from './subscription-helpers'

export async function pauseSubscription(
  id: string,
  pauseUntil: string
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

    // Validate pause date
    const pauseDate = new Date(pauseUntil)
    if (pauseDate <= new Date()) {
      return {
        success: false,
        error: 'Pause date must be in the future',
        code: 'INVALID_DATE'
      }
    }

    // Update subscription with pause metadata
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        metadata: {
          ...(existing.metadata || {}),
          paused: true,
          pause_until: pauseUntil,
          paused_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Cache invalidation
    revalidatePath('/dashboard/subscriptions')
    const tags = getInvalidationTags(existing)
    tags.forEach(tag => revalidateTag(tag))

    return {
      success: true,
      data: subscription as Subscription,
      message: `Subscription paused until ${pauseDate.toLocaleDateString()}`
    }

  } catch (error) {
    console.error('[Server Action Error - pauseSubscription]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to pause subscription',
      code: 'OPERATION_FAILED'
    }
  }
}

export async function resumeSubscription(
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

    // Check if subscription is paused
    const metadata = existing.metadata as any
    if (!metadata?.paused) {
      return {
        success: false,
        error: 'Subscription is not paused',
        code: 'NOT_PAUSED'
      }
    }

    // Remove pause metadata
    const { paused, pause_until, paused_at, ...cleanMetadata } = metadata

    // Update subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({
        metadata: {
          ...cleanMetadata,
          resumed_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Cache invalidation
    revalidatePath('/dashboard/subscriptions')
    const tags = getInvalidationTags(existing)
    tags.forEach(tag => revalidateTag(tag))

    return {
      success: true,
      data: subscription as Subscription,
      message: 'Subscription resumed successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - resumeSubscription]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to resume subscription',
      code: 'OPERATION_FAILED'
    }
  }
}