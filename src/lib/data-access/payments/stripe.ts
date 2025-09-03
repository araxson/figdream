/**
 * Stripe-specific Data Access Layer for FigDream
 * Handles all Stripe-related database operations following DAL patterns
 */
'use server'
import { createClient } from '@/lib/database/supabase/server'
import { 
  createPaymentIntent,
  createSetupIntent,
  createCustomer,
  getCustomerPaymentMethods,
  createSubscription,
  createRefund,
  formatAmountFromStripe
} from '@/lib/integrations/stripe/server'
import type { Database } from '@/types/database.types'
import type Stripe from 'stripe'
type PaymentRow = Database['public']['Tables']['payments']['Row']
/**
 * Create or retrieve Stripe customer for a user
 */
export async function ensureStripeCustomer(userId: string): Promise<string> {
  const supabase = await createClient()
  try {
    // First check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, first_name, last_name, phone')
      .eq('id', userId)
      .single()
    if (!profile) {
      throw new Error('User not found')
    }
    // If customer already exists, return the ID
    if (profile.stripe_customer_id) {
      return profile.stripe_customer_id
    }
    // Create new Stripe customer
    const customer = await createCustomer({
      email: profile.email,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || undefined,
      phone: profile.phone || undefined,
      metadata: {
        user_id: userId,
      },
    })
    // Update profile with Stripe customer ID
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId)
    if (updateError) {
      throw new Error('Failed to link Stripe customer')
    }
    return customer.id
  } catch (_error) {
    throw new Error('Failed to create or retrieve customer')
  }
}
/**
 * Create a payment intent for an appointment
 */
export async function createBookingPaymentIntent(params: {
  bookingId: string
  amount: number
  currency?: string
  depositAmount?: number
  metadata?: Record<string, string>
}): Promise<{
  paymentIntent: Stripe.PaymentIntent
  paymentRecord: PaymentRow
}> {
  const supabase = await createClient()
  const { bookingId, amount, currency = 'usd', depositAmount, metadata = {} } = params
  try {
    // Get appointment details
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        id,
        customer_id,
        salon_id,
        location_id,
        total_amount,
        appointment_services (
          service_name,
          price
        )
      `)
      .eq('id', bookingId)
      .single()
    if (!appointment) {
      throw new Error('Appointment not found')
    }
    // Ensure customer has Stripe customer ID
    const stripeCustomerId = await ensureStripeCustomer(appointment.customer_id)
    // Determine final amount (use deposit if provided, otherwise full amount)
    const finalAmount = depositAmount || amount
    // Create payment intent
    const paymentIntent = await createPaymentIntent({
      amount: finalAmount,
      currency,
      customerId: stripeCustomerId,
      description: `Appointment payment for ${appointment.appointment_services.map(s => s.service_name).join(', ')}`,
      setupFutureUsage: 'off_session',
      metadata: {
        booking_id: bookingId,
        salon_id: appointment.salon_id,
        location_id: appointment.location_id || '',
        is_deposit: depositAmount ? 'true' : 'false',
        ...metadata,
      },
    })
    // Create payment record in database
    const { data: paymentRecord, error: paymentError } = await supabase
      .from('payments')
      .insert({
        id: paymentIntent.id,
        booking_id: bookingId,
        customer_id: appointment.customer_id,
        amount: finalAmount,
        currency,
        payment_method: 'online',
        status: 'pending',
        stripe_payment_intent_id: paymentIntent.id,
        stripe_customer_id: stripeCustomerId,
        description: paymentIntent.description,
        metadata: paymentIntent.metadata as Record<string, unknown>,
        is_deposit: !!depositAmount,
        deposit_amount: depositAmount,
      })
      .select()
      .single()
    if (paymentError) {
      throw new Error('Failed to create payment record')
    }
    return {
      paymentIntent,
      paymentRecord,
    }
  } catch (_error) {
    throw new Error('Failed to create payment intent')
  }
}
/**
 * Create setup intent for saving payment methods
 */
export async function createSavePaymentMethodIntent(
  userId: string,
  metadata?: Record<string, string>
): Promise<Stripe.SetupIntent> {
  try {
    const stripeCustomerId = await ensureStripeCustomer(userId)
    const setupIntent = await createSetupIntent({
      customerId: stripeCustomerId,
      metadata: {
        user_id: userId,
        ...metadata,
      },
    })
    return setupIntent
  } catch (_error) {
    throw new Error('Failed to create setup intent')
  }
}
/**
 * Get user's saved payment methods
 */
export async function getUserPaymentMethods(userId: string): Promise<Stripe.PaymentMethod[]> {
  const supabase = await createClient()
  try {
    // Get user's Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()
    if (!profile?.stripe_customer_id) {
      return []
    }
    const paymentMethods = await getCustomerPaymentMethods(profile.stripe_customer_id)
    return paymentMethods
  } catch (_error) {
    return []
  }
}
/**
 * Update payment status after Stripe webhook
 */
export async function updatePaymentFromStripe(
  paymentIntentId: string,
  status: 'completed' | 'failed' | 'cancelled',
  stripePaymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('payments')
      .update({
        status,
        stripe_payment_intent_id: paymentIntentId,
        payment_method: stripePaymentIntent.payment_method_types[0] || 'card',
        processed_at: new Date().toISOString(),
        gateway_response: stripePaymentIntent as Record<string, unknown>,
        transaction_id: stripePaymentIntent.latest_charge ? 
          (typeof stripePaymentIntent.latest_charge === 'string' 
            ? stripePaymentIntent.latest_charge 
            : stripePaymentIntent.latest_charge.id) : null,
        receipt_url: typeof stripePaymentIntent.latest_charge === 'object' && stripePaymentIntent.latest_charge ? 
          stripePaymentIntent.latest_charge.receipt_url : null,
      })
      .eq('stripe_payment_intent_id', paymentIntentId)
    if (error) {
      throw new Error('Failed to update payment status')
    }
    // If payment completed, update appointment status
    if (status === 'completed') {
      await updateAppointmentAfterPayment(paymentIntentId)
    }
  } catch (_error) {
    throw error
  }
}
/**
 * Update appointment status after successful payment
 */
async function updateAppointmentAfterPayment(paymentIntentId: string): Promise<void> {
  const supabase = await createClient()
  try {
    // Get payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('booking_id, is_deposit, amount, appointment:appointments(total_amount)')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single()
    if (!payment) {
      throw new Error('Payment not found')
    }
    const appointmentUpdate: {
      updated_at: string;
      status?: string;
      deposit_paid?: boolean;
      deposit_amount?: number;
      paid_at?: string;
    } = {
      updated_at: new Date().toISOString(),
    }
    if (payment.is_deposit) {
      // If it's a deposit, mark as confirmed
      appointmentUpdate.status = 'confirmed'
      appointmentUpdate.deposit_paid = true
      appointmentUpdate.deposit_amount = payment.amount
    } else {
      // Full payment completed
      appointmentUpdate.status = 'confirmed'
      appointmentUpdate.payment_status = 'paid'
      appointmentUpdate.paid_at = new Date().toISOString()
    }
    const { error } = await supabase
      .from('appointments')
      .update(appointmentUpdate)
      .eq('id', payment.booking_id)
    if (error) {
      throw new Error('Failed to update appointment')
    }
  } catch (_error) {
    throw error
  }
}
/**
 * Create subscription for salon
 */
export async function createSalonSubscription(params: {
  salonId: string
  priceId: string
  paymentMethodId?: string
  trialDays?: number
  metadata?: Record<string, string>
}): Promise<{
  subscription: Stripe.Subscription
  subscriptionRecord: Record<string, unknown>
}> {
  const supabase = await createClient()
  const { salonId, priceId, paymentMethodId, trialDays, metadata = {} } = params
  try {
    // Get salon owner details
    const { data: salon } = await supabase
      .from('salons')
      .select(`
        id,
        name,
        owner_id,
        profiles:owner_id (
          id,
          email,
          first_name,
          last_name,
          stripe_customer_id
        )
      `)
      .eq('id', salonId)
      .single()
    if (!salon || !salon.profiles) {
      throw new Error('Salon or owner not found')
    }
    // Ensure owner has Stripe customer ID
    const stripeCustomerId = await ensureStripeCustomer(salon.owner_id)
    // Create subscription
    const subscription = await createSubscription({
      customerId: stripeCustomerId,
      priceId,
      paymentMethodId,
      trialPeriodDays: trialDays,
      metadata: {
        salon_id: salonId,
        salon_name: salon.name,
        ...metadata,
      },
    })
    // Create subscription record
    const { data: subscriptionRecord, error: subError } = await supabase
      .from('salon_subscriptions')
      .insert({
        salon_id: salonId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: stripeCustomerId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        metadata: subscription.metadata as Record<string, unknown>,
      })
      .select()
      .single()
    if (subError) {
      throw new Error('Failed to create subscription record')
    }
    return {
      subscription,
      subscriptionRecord,
    }
  } catch (_error) {
    throw new Error('Failed to create subscription')
  }
}
/**
 * Update subscription status from webhook
 */
export async function updateSubscriptionFromStripe(
  subscriptionId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createClient()
  try {
    const { error } = await supabase
      .from('salon_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at ? 
          new Date(subscription.canceled_at * 1000).toISOString() : null,
        metadata: subscription.metadata as Record<string, unknown>,
      })
      .eq('stripe_subscription_id', subscriptionId)
    if (error) {
      throw new Error('Failed to update subscription status')
    }
  } catch (_error) {
    throw error
  }
}
/**
 * Process refund and update database
 */
export async function processRefund(params: {
  paymentId: string
  amount?: number
  reason: string
  refundedBy: string
}): Promise<{
  refund: Stripe.Refund
  refundRecord: Record<string, unknown>
}> {
  const supabase = await createClient()
  const { paymentId, amount, reason, refundedBy } = params
  try {
    // Get payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()
    if (!payment) {
      throw new Error('Payment not found')
    }
    if (payment.status !== 'completed') {
      throw new Error('Cannot refund incomplete payment')
    }
    if (!payment.stripe_payment_intent_id) {
      throw new Error('No Stripe payment intent found')
    }
    // Create refund in Stripe
    const refund = await createRefund({
      paymentIntentId: payment.stripe_payment_intent_id,
      amount,
      reason: reason,
      metadata: {
        payment_id: paymentId,
        refunded_by: refundedBy,
      },
    })
    // Create refund record
    const { data: refundRecord, error: refundError } = await supabase
      .from('payment_refunds')
      .insert({
        payment_id: paymentId,
        amount: formatAmountFromStripe(refund.amount),
        reason,
        refunded_by: refundedBy,
        stripe_refund_id: refund.id,
        status: refund.status,
        metadata: refund.metadata as Record<string, unknown>,
      })
      .select()
      .single()
    if (refundError) {
      throw new Error('Failed to create refund record')
    }
    // Update payment status
    const isPartialRefund = amount && amount < payment.amount
    await supabase
      .from('payments')
      .update({
        status: isPartialRefund ? 'partially_refunded' : 'refunded',
        refunded_amount: (payment.refunded_amount || 0) + formatAmountFromStripe(refund.amount),
      })
      .eq('id', paymentId)
    return {
      refund,
      refundRecord,
    }
  } catch (_error) {
    throw new Error('Failed to process refund')
  }
}
/**
 * Get payment analytics
 */
export async function getPaymentAnalytics(params: {
  salonId?: string
  locationId?: string
  startDate: string
  endDate: string
  groupBy?: 'day' | 'week' | 'month'
}): Promise<unknown[]> {
  const supabase = await createClient()
  const { salonId, locationId, startDate, endDate, groupBy: _groupBy = 'day' } = params
  try {
    let query = supabase
      .from('payments')
      .select(`
        amount,
        currency,
        payment_method,
        status,
        created_at,
        is_deposit,
        appointments (
          salon_id,
          location_id
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'completed')
    if (salonId) {
      query = query.eq('appointments.salon_id', salonId)
    }
    if (locationId) {
      query = query.eq('appointments.location_id', locationId)
    }
    const { data, error } = await query
    if (error) {
      throw new Error('Failed to get payment analytics')
    }
    return data || []
  } catch (_error) {
    throw error
  }
}
/**
 * Get payment by Stripe payment intent ID
 */
export async function getPaymentByStripeId(stripePaymentIntentId: string): Promise<PaymentRow | null> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', stripePaymentIntentId)
      .single()
    if (error && error.code !== 'PGRST116') {
      return null
    }
    return data
  } catch (_error) {
    return null
  }
}
/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<{id: string; status: string} | null> {
  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('salon_subscriptions')
      .select('*')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single()
    if (error && error.code !== 'PGRST116') {
      return null
    }
    return data
  } catch (_error) {
    return null
  }
}