/**
 * Stripe Create Subscription API Route for FigDream
 * Handles creating and managing salon subscriptions
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/data-access/auth'
import { 
  createSalonSubscription,
  updateSubscriptionFromStripe 
} from '@/lib/data-access/payments/stripe'
import { 
  updateSubscription, 
  cancelSubscription,
  getSubscription 
} from '@/lib/integrations/stripe/server'

// Request validation schemas
const createSubscriptionSchema = z.object({
  salonId: z.string().uuid('Invalid salon ID'),
  priceId: z.string().min(1, 'Price ID is required'),
  paymentMethodId: z.string().optional(),
  trialDays: z.number().int().min(0).max(365).optional(),
  metadata: z.record(z.string(), z.string()).optional().default({}),
})

const updateSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  priceId: z.string().optional(),
  paymentMethodId: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
})

const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
  cancelAtPeriodEnd: z.boolean().default(true),
})

/**
 * POST /api/stripe/create-subscription
 * Creates a new subscription for a salon
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createSubscriptionSchema.parse(body)
    const { salonId, priceId, paymentMethodId, trialDays } = validatedData
    
    // Verify user has permission to create subscription for this salon
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id, created_by, name')
      .eq('id', salonId)
      .single()

    if (salonError || !salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    if (salon.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if salon already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('salon_id', salonId)
      .in('status', ['active', 'trialing'])
      .single()

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Salon already has an active subscription' },
        { status: 400 }
      )
    }

    // Create Stripe subscription
    const result = await createSalonSubscription({
      salonId,
      priceId,
      paymentMethodId,
      trialDays,
      metadata: {
        ...validatedData.metadata,
        salon_name: salon.name,
        created_by: user.id,
      },
    })

    if (!result.success || !result.subscription) {
      return NextResponse.json(
        { error: result.error || 'Failed to create subscription' },
        { status: 400 }
      )
    }

    const stripeSubscription = result.subscription

    // Store subscription in database
    const { error: dbError } = await supabase.from('subscriptions').insert({
      salon_id: salonId,
      stripe_subscription_id: stripeSubscription.id,
      stripe_customer_id: stripeSubscription.customer as string,
      stripe_price_id: priceId,
      status: stripeSubscription.status,
      current_period_start: new Date(((stripeSubscription as Record<string, unknown>).current_period_start as number) * 1000).toISOString(),
      current_period_end: new Date(((stripeSubscription as Record<string, unknown>).current_period_end as number) * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      metadata: validatedData.metadata,
    })

    if (dbError) {
      // If database insertion fails, cancel the Stripe subscription
      await cancelSubscription(stripeSubscription.id, false)
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        current_period_end: (stripeSubscription as Record<string, unknown>).current_period_end,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
      },
    })
  } catch (error) {
    console.error('Create subscription error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/stripe/create-subscription
 * Updates an existing subscription
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateSubscriptionSchema.parse(body)
    const { subscriptionId, priceId, cancelAtPeriodEnd, metadata } = validatedData

    // Get subscription from database to verify ownership
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        salon_id,
        stripe_subscription_id,
        salons (
          id,
          created_by
        )
      `)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (dbError || !dbSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verify ownership
    if (dbSubscription.salons?.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update subscription in Stripe
    const updateParams: Parameters<typeof updateSubscription>[1] = {}
    
    if (priceId) {
      updateParams.items = [{
        price: priceId,
      }]
    }

    if (cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = cancelAtPeriodEnd
    }

    if (metadata) {
      updateParams.metadata = metadata
    }

    const updatedSubscription = await updateSubscription(subscriptionId, updateParams)

    if (!updatedSubscription) {
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      )
    }

    // Update local database with new subscription data
    await updateSubscriptionFromStripe(updatedSubscription)

    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_end: (updatedSubscription as Record<string, unknown>).current_period_end,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      },
    })
  } catch (error) {
    console.error('Update subscription error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/stripe/create-subscription
 * Cancels a subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = cancelSubscriptionSchema.parse(body)
    const { subscriptionId, cancelAtPeriodEnd } = validatedData

    // Get subscription from database to verify ownership
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        salon_id,
        stripe_subscription_id,
        salons (
          id,
          created_by
        )
      `)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (dbError || !dbSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verify ownership
    if (dbSubscription.salons?.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Cancel subscription in Stripe
    const canceledSubscription = await cancelSubscription(subscriptionId, cancelAtPeriodEnd)

    if (!canceledSubscription) {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      )
    }

    // Update local database
    await updateSubscriptionFromStripe(canceledSubscription)

    return NextResponse.json({
      success: true,
      message: cancelAtPeriodEnd
        ? 'Subscription will be canceled at the end of the billing period'
        : 'Subscription canceled immediately',
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        canceled_at: canceledSubscription.canceled_at,
      },
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stripe/create-subscription
 * Gets subscription details
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscriptionId')
    const salonId = searchParams.get('salonId')

    if (!subscriptionId && !salonId) {
      return NextResponse.json(
        { error: 'Either subscriptionId or salonId is required' },
        { status: 400 }
      )
    }

    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()

    // Build query based on provided parameters
    let query = supabase
      .from('subscriptions')
      .select(`
        *,
        salons (
          id,
          name,
          created_by
        )
      `)

    if (subscriptionId) {
      query = query.eq('stripe_subscription_id', subscriptionId)
    } else if (salonId) {
      query = query.eq('salon_id', salonId)
    }

    const { data: subscription, error } = await query.single()

    if (error || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verify ownership
    if (subscription.salons?.created_by !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Get latest data from Stripe
    if (subscription.stripe_subscription_id) {
      try {
        const stripeSubscription = await getSubscription(subscription.stripe_subscription_id)
        if (stripeSubscription) {
          // Update local database with latest Stripe data
          await updateSubscriptionFromStripe(stripeSubscription)
          
          return NextResponse.json({
            subscription: {
              ...subscription,
              stripe_data: {
                id: stripeSubscription.id,
                status: stripeSubscription.status,
                current_period_start: (stripeSubscription as Record<string, unknown>).current_period_start,
                current_period_end: (stripeSubscription as Record<string, unknown>).current_period_end,
                cancel_at_period_end: stripeSubscription.cancel_at_period_end,
              },
            },
          })
        }
      } catch (stripeError) {
        console.error('Stripe fetch error:', stripeError)
        // Return cached data if Stripe fails
      }
    }

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}