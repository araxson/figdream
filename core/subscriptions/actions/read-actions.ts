'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResponse, Subscription } from './subscription-types'

export async function getSubscriptions(
  filters?: { salon_id?: string; customer_id?: string; status?: string }
): Promise<ActionResponse<Subscription[]>> {
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
    let query = supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.salon_id) {
      query = query.eq('salon_id', filters.salon_id)
    }

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    const { data, error } = await query

    if (error) throw error

    return {
      success: true,
      data: (data || []) as Subscription[]
    }

  } catch (error) {
    console.error('[Server Action Error - getSubscriptions]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to fetch subscriptions',
      code: 'OPERATION_FAILED'
    }
  }
}

export async function getSubscriptionById(
  id: string
): Promise<ActionResponse<Subscription | null>> {
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
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return {
      success: true,
      data: data as Subscription | null
    }

  } catch (error) {
    console.error('[Server Action Error - getSubscriptionById]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      subscriptionId: id,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to fetch subscription',
      code: 'OPERATION_FAILED'
    }
  }
}

export async function getActiveSubscription(
  salonId: string
): Promise<ActionResponse<Subscription | null>> {
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
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('salon_id', salonId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error

    return {
      success: true,
      data: data as Subscription | null
    }

  } catch (error) {
    console.error('[Server Action Error - getActiveSubscription]:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      salonId,
      userId: user.id,
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      error: error instanceof Error
        ? error.message
        : 'Failed to fetch active subscription',
      code: 'OPERATION_FAILED'
    }
  }
}