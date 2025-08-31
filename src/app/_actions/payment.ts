/**
 * Payment Server Actions for FigDream
 * Server-side actions for payment processing and management
 */

'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getUser } from '@/lib/data-access/auth'
import { 
  createBookingPaymentIntent,
  createSavePaymentMethodIntent,
  getUserPaymentMethods,
  processRefund,
  createSalonSubscription,
  ensureStripeCustomer,
} from '@/lib/data-access/payments/stripe'
import { 
  detachPaymentMethod,
  cancelSubscription,
  updateSubscription,
  createSetupIntent,
} from '@/lib/integrations/stripe/server'
import { createClient } from '@/lib/database/supabase/server'
import { 
  createPaymentSchema,
  refundPaymentSchema,
  type CreatePaymentInput,
  type RefundPaymentInput,
} from '@/lib/validations/payment-schema'

// Action result types
type ActionResult<T = any> = {
  success: boolean
  data?: T
  error?: string
  errors?: { [key: string]: string[] }
}

/**
 * Create payment intent for booking
 */
export async function createBookingPayment(
  bookingId: string,
  amount: number,
  options: {
    currency?: string
    isDeposit?: boolean
    depositAmount?: number
    description?: string
    metadata?: Record<string, string>
  } = {}
): Promise<ActionResult<{
  clientSecret: string
  paymentIntentId: string
  paymentId: string
}>> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate inputs
    const schema = z.object({
      bookingId: z.string().uuid(),
      amount: z.number().min(0.01).max(50000),
      currency: z.string().length(3).default('usd'),
      isDeposit: z.boolean().default(false),
      depositAmount: z.number().min(0.01).optional(),
      description: z.string().optional(),
      metadata: z.record(z.string()).default({}),
    })

    const validated = schema.parse({
      bookingId,
      amount,
      ...options,
    })

    // Verify user owns the booking
    const supabase = await createClient()
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, customer_id, status, total_amount')
      .eq('id', bookingId)
      .eq('customer_id', user.id)
      .single()

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found or unauthorized' }
    }

    if (booking.status === 'cancelled') {
      return { success: false, error: 'Cannot pay for cancelled booking' }
    }

    // Create payment intent
    const result = await createBookingPaymentIntent({
      bookingId: validated.bookingId,
      amount: validated.amount,
      currency: validated.currency,
      depositAmount: validated.depositAmount,
      metadata: {
        ...validated.metadata,
        user_id: user.id,
        description: validated.description || `Booking payment${validated.isDeposit ? ' (deposit)' : ''}`,
      },
    })

    return {
      success: true,
      data: {
        clientSecret: result.paymentIntent.client_secret!,
        paymentIntentId: result.paymentIntent.id,
        paymentId: result.paymentRecord.id,
      },
    }

  } catch (error) {
    console.error('Error creating booking payment:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
        errors: error.flatten().fieldErrors,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create payment',
    }
  }
}

/**
 * Create setup intent for saving payment methods
 */
export async function createPaymentMethodSetup(
  metadata?: Record<string, string>
): Promise<ActionResult<{
  clientSecret: string
  setupIntentId: string
}>> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Create setup intent
    const setupIntent = await createSavePaymentMethodIntent(user.id, metadata)

    return {
      success: true,
      data: {
        clientSecret: setupIntent.client_secret!,
        setupIntentId: setupIntent.id,
      },
    }

  } catch (error) {
    console.error('Error creating payment method setup:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create setup intent',
    }
  }
}

/**
 * Remove saved payment method
 */
export async function removePaymentMethod(
  paymentMethodId: string
): Promise<ActionResult> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify payment method belongs to user
    const paymentMethods = await getUserPaymentMethods(user.id)
    const paymentMethod = paymentMethods.find(pm => pm.id === paymentMethodId)

    if (!paymentMethod) {
      return { success: false, error: 'Payment method not found or unauthorized' }
    }

    // Detach payment method
    await detachPaymentMethod(paymentMethodId)

    // Revalidate payment methods page
    revalidatePath('/customer/settings')
    revalidatePath('/customer/profile')

    return { success: true }

  } catch (error) {
    console.error('Error removing payment method:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove payment method',
    }
  }
}

/**
 * Process refund for payment
 */
export async function refundPayment(
  paymentId: string,
  refundData: {
    amount?: number
    reason: string
  }
): Promise<ActionResult> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate refund data
    const schema = refundPaymentSchema.omit({ refunded_by: true, payment_id: true })
    const validated = schema.parse({
      refund_amount: refundData.amount,
      reason: refundData.reason,
    })

    // Verify user has permission to refund
    const supabase = await createClient()
    const { data: payment } = await supabase
      .from('payments')
      .select(`
        *,
        bookings (
          customer_id,
          salon_id,
          salons (
            owner_id
          )
        )
      `)
      .eq('id', paymentId)
      .single()

    if (!payment) {
      return { success: false, error: 'Payment not found' }
    }

    const userRole = user.raw_app_meta_data?.role
    const isCustomer = payment.bookings.customer_id === user.id
    const isOwner = payment.bookings.salons?.owner_id === user.id
    const isAdmin = ['super_admin', 'salon_admin'].includes(userRole)

    if (!isCustomer && !isOwner && !isAdmin) {
      return { success: false, error: 'Unauthorized to refund this payment' }
    }

    // Process refund
    const result = await processRefund({
      paymentId,
      amount: validated.refund_amount,
      reason: validated.reason,
      refundedBy: user.id,
    })

    // Revalidate relevant pages
    revalidatePath('/customer/appointments')
    revalidatePath('/owner/finances')
    revalidatePath('/admin/payments')

    return { success: true }

  } catch (error) {
    console.error('Error processing refund:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid refund data',
        errors: error.flatten().fieldErrors,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    }
  }
}

/**
 * Create salon subscription
 */
export async function createSalonSubscriptionAction(
  salonId: string,
  subscriptionData: {
    priceId: string
    paymentMethodId?: string
    trialDays?: number
  }
): Promise<ActionResult<{
  subscriptionId: string
  clientSecret?: string
  status: string
}>> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate input
    const schema = z.object({
      salonId: z.string().uuid(),
      priceId: z.string().min(1),
      paymentMethodId: z.string().optional(),
      trialDays: z.number().int().min(0).max(365).optional(),
    })

    const validated = schema.parse({ salonId, ...subscriptionData })

    // Verify user owns the salon
    const supabase = await createClient()
    const { data: salon } = await supabase
      .from('salons')
      .select('id, owner_id')
      .eq('id', salonId)
      .single()

    if (!salon || salon.owner_id !== user.id) {
      const userRole = user.raw_app_meta_data?.role
      if (userRole !== 'super_admin') {
        return { success: false, error: 'Unauthorized to create subscription for this salon' }
      }
    }

    // Create subscription
    const result = await createSalonSubscription({
      salonId: validated.salonId,
      priceId: validated.priceId,
      paymentMethodId: validated.paymentMethodId,
      trialDays: validated.trialDays,
      metadata: {
        created_by: user.id,
      },
    })

    // Revalidate subscription pages
    revalidatePath('/owner/settings')
    revalidatePath('/owner/finances')

    return {
      success: true,
      data: {
        subscriptionId: result.subscription.id,
        clientSecret: result.subscription.latest_invoice?.payment_intent?.client_secret,
        status: result.subscription.status,
      },
    }

  } catch (error) {
    console.error('Error creating salon subscription:', error)
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid subscription data',
        errors: error.flatten().fieldErrors,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create subscription',
    }
  }
}

/**
 * Cancel salon subscription
 */
export async function cancelSalonSubscription(
  subscriptionId: string,
  immediately: boolean = false,
  reason?: string
): Promise<ActionResult> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user owns the subscription
    const supabase = await createClient()
    const { data: subscription } = await supabase
      .from('salon_subscriptions')
      .select(`
        *,
        salons (
          owner_id
        )
      `)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    const userRole = user.raw_app_meta_data?.role
    if (subscription.salons.owner_id !== user.id && userRole !== 'super_admin') {
      return { success: false, error: 'Unauthorized to cancel this subscription' }
    }

    // Cancel subscription
    await cancelSubscription(subscriptionId, immediately)

    // Log cancellation reason if provided
    if (reason) {
      await supabase
        .from('subscription_events')
        .insert({
          subscription_id: subscription.id,
          event_type: 'cancellation_requested',
          event_data: {
            reason,
            canceled_by: user.id,
            immediately,
          },
        })
    }

    // Revalidate subscription pages
    revalidatePath('/owner/settings')
    revalidatePath('/owner/finances')

    return { success: true }

  } catch (error) {
    console.error('Error canceling subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    }
  }
}

/**
 * Update subscription payment method
 */
export async function updateSubscriptionPaymentMethod(
  subscriptionId: string,
  paymentMethodId: string
): Promise<ActionResult> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user owns the subscription
    const supabase = await createClient()
    const { data: subscription } = await supabase
      .from('salon_subscriptions')
      .select(`
        *,
        salons (
          owner_id
        )
      `)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    const userRole = user.raw_app_meta_data?.role
    if (subscription.salons.owner_id !== user.id && userRole !== 'super_admin') {
      return { success: false, error: 'Unauthorized to update this subscription' }
    }

    // Update subscription payment method
    await updateSubscription(subscriptionId, {
      default_payment_method: paymentMethodId,
    })

    // Revalidate subscription pages
    revalidatePath('/owner/settings')
    revalidatePath('/owner/finances')

    return { success: true }

  } catch (error) {
    console.error('Error updating subscription payment method:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment method',
    }
  }
}

/**
 * Reactivate canceled subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<ActionResult> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user owns the subscription
    const supabase = await createClient()
    const { data: subscription } = await supabase
      .from('salon_subscriptions')
      .select(`
        *,
        salons (
          owner_id
        )
      `)
      .eq('stripe_subscription_id', subscriptionId)
      .single()

    if (!subscription) {
      return { success: false, error: 'Subscription not found' }
    }

    const userRole = user.raw_app_meta_data?.role
    if (subscription.salons.owner_id !== user.id && userRole !== 'super_admin') {
      return { success: false, error: 'Unauthorized to reactivate this subscription' }
    }

    // Reactivate subscription by removing cancel_at_period_end
    await updateSubscription(subscriptionId, {
      cancel_at_period_end: false,
    })

    // Revalidate subscription pages
    revalidatePath('/owner/settings')
    revalidatePath('/owner/finances')

    return { success: true }

  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reactivate subscription',
    }
  }
}

/**
 * Get user's payment methods with proper error handling
 */
export async function getUserPaymentMethodsAction(): Promise<ActionResult<any[]>> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get payment methods
    const paymentMethods = await getUserPaymentMethods(user.id)

    return {
      success: true,
      data: paymentMethods,
    }

  } catch (error) {
    console.error('Error getting payment methods:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get payment methods',
    }
  }
}

/**
 * Ensure user has Stripe customer ID
 */
export async function ensureStripeCustomerAction(): Promise<ActionResult<{
  customerId: string
}>> {
  try {
    // Check authentication
    const { user, error: authError } = await getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Ensure customer
    const customerId = await ensureStripeCustomer(user.id)

    return {
      success: true,
      data: { customerId },
    }

  } catch (error) {
    console.error('Error ensuring Stripe customer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
    }
  }
}