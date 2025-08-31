/**
 * Stripe server-side configuration for FigDream
 * Server-side Stripe operations and utilities
 */

import Stripe from 'stripe'
import { formatAmountForStripe, formatAmountFromStripe } from './client'

// Initialize Stripe with server-side configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
  appInfo: {
    name: 'FigDream',
    version: '1.0.0',
    url: 'https://figdream.com',
  },
  typescript: true,
})

export { stripe }

/**
 * Create a Payment Intent for one-time payments
 */
export async function createPaymentIntent(params: {
  amount: number
  currency: string
  customerId?: string
  metadata?: Record<string, string>
  description?: string
  setupFutureUsage?: 'off_session' | 'on_session'
  paymentMethodTypes?: string[]
  captureMethod?: 'automatic' | 'manual'
}): Promise<Stripe.PaymentIntent> {
  const {
    amount,
    currency = 'usd',
    customerId,
    metadata = {},
    description,
    setupFutureUsage,
    paymentMethodTypes = ['card', 'us_bank_account'],
    captureMethod = 'automatic',
  } = params

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(amount, currency as any),
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        ...metadata,
        source: 'figdream-booking',
      },
      description: description || 'FigDream booking payment',
      setup_future_usage: setupFutureUsage,
      payment_method_types: paymentMethodTypes,
      capture_method: captureMethod,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw new Error('Failed to create payment intent')
  }
}

/**
 * Confirm a Payment Intent
 */
export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
    })

    return paymentIntent
  } catch (error) {
    console.error('Error confirming payment intent:', error)
    throw new Error('Failed to confirm payment')
  }
}

/**
 * Create a Setup Intent for saving payment methods
 */
export async function createSetupIntent(params: {
  customerId: string
  paymentMethodTypes?: string[]
  metadata?: Record<string, string>
  usage?: 'off_session' | 'on_session'
}): Promise<Stripe.SetupIntent> {
  const {
    customerId,
    paymentMethodTypes = ['card'],
    metadata = {},
    usage = 'off_session',
  } = params

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: paymentMethodTypes,
      usage,
      metadata: {
        ...metadata,
        source: 'figdream-save-payment-method',
      },
    })

    return setupIntent
  } catch (error) {
    console.error('Error creating setup intent:', error)
    throw new Error('Failed to create setup intent')
  }
}

/**
 * Create a Stripe Customer
 */
export async function createCustomer(params: {
  email: string
  name?: string
  phone?: string
  metadata?: Record<string, string>
  address?: Stripe.AddressParam
}): Promise<Stripe.Customer> {
  const { email, name, phone, metadata = {}, address } = params

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        ...metadata,
        source: 'figdream',
      },
      address,
    })

    return customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }
}

/**
 * Get Stripe Customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | null> {
  try {
    const customer = await stripe.customers.retrieve(customerId)
    
    if (customer.deleted) {
      return null
    }
    
    return customer as Stripe.Customer
  } catch (error) {
    console.error('Error retrieving customer:', error)
    return null
  }
}

/**
 * Update Stripe Customer
 */
export async function updateCustomer(
  customerId: string,
  params: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> {
  try {
    const customer = await stripe.customers.update(customerId, params)
    return customer
  } catch (error) {
    console.error('Error updating customer:', error)
    throw new Error('Failed to update customer')
  }
}

/**
 * Get customer's payment methods
 */
export async function getCustomerPaymentMethods(
  customerId: string,
  type?: string
): Promise<Stripe.PaymentMethod[]> {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: type as any,
    })

    return paymentMethods.data
  } catch (error) {
    console.error('Error retrieving payment methods:', error)
    return []
  }
}

/**
 * Detach a payment method from customer
 */
export async function detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
  try {
    const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)
    return paymentMethod
  } catch (error) {
    console.error('Error detaching payment method:', error)
    throw new Error('Failed to remove payment method')
  }
}

/**
 * Create a subscription
 */
export async function createSubscription(params: {
  customerId: string
  priceId: string
  paymentMethodId?: string
  metadata?: Record<string, string>
  trialPeriodDays?: number
  prorationBehavior?: 'create_prorations' | 'none'
}): Promise<Stripe.Subscription> {
  const {
    customerId,
    priceId,
    paymentMethodId,
    metadata = {},
    trialPeriodDays,
    prorationBehavior = 'create_prorations',
  } = params

  try {
    const subscriptionParams: Stripe.SubscriptionCreateParams = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        ...metadata,
        source: 'figdream-subscription',
      },
      expand: ['latest_invoice.payment_intent'],
      proration_behavior: prorationBehavior,
    }

    if (paymentMethodId) {
      subscriptionParams.default_payment_method = paymentMethodId
    }

    if (trialPeriodDays) {
      subscriptionParams.trial_period_days = trialPeriodDays
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams)
    return subscription
  } catch (error) {
    console.error('Error creating subscription:', error)
    throw new Error('Failed to create subscription')
  }
}

/**
 * Update subscription
 */
export async function updateSubscription(
  subscriptionId: string,
  params: Stripe.SubscriptionUpdateParams
): Promise<Stripe.Subscription> {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, params)
    return subscription
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw new Error('Failed to update subscription')
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  try {
    const subscription = immediately
      ? await stripe.subscriptions.cancel(subscriptionId)
      : await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        })

    return subscription
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw new Error('Failed to cancel subscription')
  }
}

/**
 * Create a refund
 */
export async function createRefund(params: {
  paymentIntentId: string
  amount?: number
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  metadata?: Record<string, string>
}): Promise<Stripe.Refund> {
  const { paymentIntentId, amount, reason = 'requested_by_customer', metadata = {} } = params

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? formatAmountForStripe(amount) : undefined,
      reason,
      metadata: {
        ...metadata,
        source: 'figdream-refund',
      },
    })

    return refund
  } catch (error) {
    console.error('Error creating refund:', error)
    throw new Error('Failed to create refund')
  }
}

/**
 * Get refunds for a payment intent
 */
export async function getRefunds(paymentIntentId: string): Promise<Stripe.Refund[]> {
  try {
    const refunds = await stripe.refunds.list({
      payment_intent: paymentIntentId,
    })

    return refunds.data
  } catch (error) {
    console.error('Error retrieving refunds:', error)
    return []
  }
}

/**
 * Create a product in Stripe
 */
export async function createProduct(params: {
  name: string
  description?: string
  metadata?: Record<string, string>
  images?: string[]
}): Promise<Stripe.Product> {
  const { name, description, metadata = {}, images } = params

  try {
    const product = await stripe.products.create({
      name,
      description,
      metadata: {
        ...metadata,
        source: 'figdream',
      },
      images,
    })

    return product
  } catch (error) {
    console.error('Error creating product:', error)
    throw new Error('Failed to create product')
  }
}

/**
 * Create a price for a product
 */
export async function createPrice(params: {
  productId: string
  unitAmount: number
  currency: string
  recurring?: {
    interval: 'day' | 'week' | 'month' | 'year'
    intervalCount?: number
  }
  metadata?: Record<string, string>
}): Promise<Stripe.Price> {
  const { productId, unitAmount, currency = 'usd', recurring, metadata = {} } = params

  try {
    const price = await stripe.prices.create({
      product: productId,
      unit_amount: formatAmountForStripe(unitAmount, currency as any),
      currency: currency.toLowerCase(),
      recurring,
      metadata: {
        ...metadata,
        source: 'figdream',
      },
    })

    return price
  } catch (error) {
    console.error('Error creating price:', error)
    throw new Error('Failed to create price')
  }
}

/**
 * Capture a payment intent (for manual capture)
 */
export async function capturePaymentIntent(
  paymentIntentId: string,
  amountToCapture?: number
): Promise<Stripe.PaymentIntent> {
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amountToCapture ? formatAmountForStripe(amountToCapture) : undefined,
    })

    return paymentIntent
  } catch (error) {
    console.error('Error capturing payment intent:', error)
    throw new Error('Failed to capture payment')
  }
}

/**
 * Construct Stripe webhook event
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (error) {
    console.error('Error constructing webhook event:', error)
    throw new Error('Invalid webhook signature')
  }
}

/**
 * Get payment method details safely
 */
export async function getPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod | null> {
  try {
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId)
    return paymentMethod
  } catch (error) {
    console.error('Error retrieving payment method:', error)
    return null
  }
}

/**
 * Get payment intent details
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    return null
  }
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription | null> {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return subscription
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return null
  }
}

/**
 * Helper function to safely format Stripe amounts
 */
export { formatAmountForStripe, formatAmountFromStripe }

/**
 * Stripe webhook event types we handle
 */
export const HANDLED_WEBHOOK_EVENTS = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
  'payment_intent.canceled',
  'payment_method.attached',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.created',
  'customer.updated',
  'customer.deleted',
] as const

export type HandledWebhookEvent = typeof HANDLED_WEBHOOK_EVENTS[number]

/**
 * Check if webhook event type is handled
 */
export function isHandledWebhookEvent(eventType: string): eventType is HandledWebhookEvent {
  return HANDLED_WEBHOOK_EVENTS.includes(eventType as HandledWebhookEvent)
}