/**
 * Stripe Create Subscription API Route for FigDream
 * Handles creating and managing salon subscriptions
 */
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUser } from '@/lib/data-access/auth'
import { createSalonSubscription } from '@/lib/data-access/payments/stripe'
import { 
  updateSubscription, 
  cancelSubscription,
  getSubscription 
} from '@/lib/integrations/stripe/server'
import type Stripe from 'stripe'

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
  immediately: z.boolean().default(false),
  cancellationReason: z.string().optional(),
})

/**
 * POST - Create new subscription
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await getUser()
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    // Parse and validate request body
    const body = await request.json()
    const validatedData = createSubscriptionSchema.parse(body)
    const { salonId, priceId, paymentMethodId, trialDays, metadata } = validatedData
    
    // Verify user has permission to create subscription for this salon
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id, created_by, name')
      .eq('id', salonId)
      .single()
      
    if (salonError || !salon) {
      return NextResponse.json(
        { error: 'Salon not found' },
        { status: 404 }
      )
    }
    
    // Check if user owns the salon or has admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    const role = roleData?.role || 'customer'
    
    if (salon.created_by !== user.id && role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized to create subscription for this salon' },
        { status: 403 }
      )
    }
    
    // Check if salon already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('platform_subscriptions')
      .select('id, status, stripe_subscription_id')
      .eq('salon_id', salonId)
      .in('status', ['active', 'trialing', 'past_due'])
      .limit(1)
      
    if (existingSubscription && existingSubscription.length > 0) {
      return NextResponse.json(
        { error: 'Salon already has an active subscription' },
        { status: 400 }
      )
    }
    
    // Create subscription
    const result = await createSalonSubscription({
      salonId,
      priceId,
      paymentMethodId,
      trialDays
    })
    
    const stripeSubscription = result.subscription as Stripe.Subscription
    
    // Extract client_secret from payment_intent if available
    let clientSecret: string | undefined
    if (stripeSubscription.latest_invoice && typeof stripeSubscription.latest_invoice !== 'string') {
      const invoice = stripeSubscription.latest_invoice as Stripe.Invoice
      if (invoice.payment_intent) {
        if (typeof invoice.payment_intent === 'string') {
          // payment_intent is just an ID string, we can't get client_secret from it
          clientSecret = undefined
        } else {
          // payment_intent is an expanded PaymentIntent object
          const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent
          clientSecret = paymentIntent.client_secret || undefined
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        client_secret: result.clientSecret
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues 
        },
        { status: 400 }
      )
    }
    if (error instanceof Error) {
      if (error.message.includes('No such price')) {
        return NextResponse.json(
          { error: 'Invalid price ID' },
          { status: 400 }
        )
      }
      if (error.message.includes('No such customer')) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 400 }
        )
      }
    }
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

/**
 * GET - Retrieve subscription details
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await getUser()
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get('subscription_id')
    const salonId = searchParams.get('salon_id')
    
    if (!subscriptionId && !salonId) {
      return NextResponse.json(
        { error: 'Subscription ID or Salon ID is required' },
        { status: 400 }
      )
    }
    
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    
    let query = supabase
      .from('platform_subscriptions')
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
    
    const { data: subscriptionRecord, error: dbError } = await query.single()
    
    if (dbError || !subscriptionRecord) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    // Verify user has permission to view this subscription
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    const role = roleData?.role || 'customer'
    
    if (subscriptionRecord.salons.created_by !== user.id && role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Get latest subscription data from Stripe
    const stripeSubscription = await getSubscription(subscriptionRecord.stripe_subscription_id || '')
    if (!stripeSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found in Stripe' },
        { status: 404 }
      )
    }
    
    // Access subscription timestamps directly
    const subscriptionData = stripeSubscription as Stripe.Subscription
    
    return NextResponse.json({
      success: true,
      subscription: {
        id: stripeSubscription.id,
        status: stripeSubscription.status,
        current_period_start: subscriptionData.current_period_start,
        current_period_end: subscriptionData.current_period_end,
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        canceled_at: stripeSubscription.canceled_at,
        trial_end: stripeSubscription.trial_end,
        items: stripeSubscription.items.data.map(item => ({
          id: item.id,
          price: {
            id: item.price.id,
            nickname: item.price.nickname,
            unit_amount: item.price.unit_amount,
            currency: item.price.currency,
            recurring: item.price.recurring,
          },
          quantity: item.quantity,
        })),
        default_payment_method: stripeSubscription.default_payment_method,
        metadata: stripeSubscription.metadata,
      },
      subscriptionRecord,
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to retrieve subscription' },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update subscription
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await getUser()
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    const body = await request.json()
    const validatedData = updateSubscriptionSchema.parse(body)
    const { subscriptionId, priceId, paymentMethodId, cancelAtPeriodEnd, metadata } = validatedData
    
    // Get subscription to verify ownership
    const { getSubscriptionByStripeId } = await import('@/lib/data-access/payments/stripe')
    const subscriptionRecord = await getSubscriptionByStripeId(subscriptionId)
    
    if (!subscriptionRecord) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    // Verify user has permission to update this subscription
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    
    const { data: salon } = await supabase
      .from('salons')
      .select('created_by')
      .eq('id', subscriptionRecord.salon_id)
      .single()
      
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    const role = roleData?.role || 'customer'
    
    if (!salon || (salon.created_by !== user.id && role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Prepare update parameters
    const updateParams: Record<string, unknown> = {}
    
    if (priceId) {
      // Get current subscription to update items
      const stripeSubscription = await getSubscription(subscriptionId)
      if (stripeSubscription && stripeSubscription.items.data.length > 0) {
        updateParams.items = [{
          id: stripeSubscription.items.data[0].id,
          price: priceId,
        }]
        updateParams.proration_behavior = 'create_prorations'
      }
    }
    
    if (paymentMethodId) {
      updateParams.default_payment_method = paymentMethodId
    }
    
    if (cancelAtPeriodEnd !== undefined) {
      updateParams.cancel_at_period_end = cancelAtPeriodEnd
    }
    
    if (metadata) {
      const existingMetadata = (subscriptionRecord as { metadata?: Record<string, string> }).metadata || {}
      updateParams.metadata = {
        ...existingMetadata,
        ...metadata,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      }
    }
    
    // Update subscription in Stripe
    const updatedSubscription = await updateSubscription(subscriptionId, updateParams)
    
    // Update subscription record in database
    await updateSubscriptionFromStripe(subscriptionId, updatedSubscription)
    
    // Access subscription timestamps directly
    const updatedSubscriptionData = updatedSubscription as Stripe.Subscription
    
    return NextResponse.json({
      success: true,
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_start: updatedSubscriptionData.current_period_start,
        current_period_end: updatedSubscriptionData.current_period_end,
        cancel_at_period_end: updatedSubscription.cancel_at_period_end,
        canceled_at: updatedSubscription.canceled_at,
        metadata: updatedSubscription.metadata,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Cancel subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await getUser()
    if (authResult.error || !authResult.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    const user = authResult.user
    
    const body = await request.json()
    const validatedData = cancelSubscriptionSchema.parse(body)
    const { subscriptionId, immediately, cancellationReason } = validatedData
    
    // Get subscription to verify ownership
    const { getSubscriptionByStripeId } = await import('@/lib/data-access/payments/stripe')
    const subscriptionRecord = await getSubscriptionByStripeId(subscriptionId)
    
    if (!subscriptionRecord) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }
    
    // Verify user has permission to cancel this subscription
    const { createClient } = await import('@/lib/database/supabase/server')
    const supabase = await createClient()
    
    const { data: salon } = await supabase
      .from('salons')
      .select('created_by')
      .eq('id', subscriptionRecord.salon_id)
      .single()
      
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    const role = roleData?.role || 'customer'
    
    if (!salon || (salon.created_by !== user.id && role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Cancel subscription
    const canceledSubscription = await cancelSubscription(subscriptionId, immediately)
    
    // Update subscription record
    await updateSubscriptionFromStripe(subscriptionId, canceledSubscription)
    
    // Log cancellation reason if provided (using error_logs table since subscription_events doesn't exist)
    if (cancellationReason) {
      await supabase
        .from('error_logs')
        .insert({
          error_type: 'subscription_cancellation',
          error_message: cancellationReason,
          metadata: {
            subscription_id: subscriptionRecord.id,
            canceled_by: user.id,
            immediately,
            event_type: 'cancellation_requested'
          },
          salon_id: subscriptionRecord.salon_id,
          user_id: user.id
        })
    }
    
    // Access subscription timestamps directly
    const canceledSubscriptionData = canceledSubscription as Stripe.Subscription
    
    return NextResponse.json({
      success: true,
      message: immediately ? 'Subscription canceled immediately' : 'Subscription will cancel at period end',
      subscription: {
        id: canceledSubscription.id,
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        canceled_at: canceledSubscription.canceled_at,
        current_period_end: canceledSubscriptionData.current_period_end,
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.issues 
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}