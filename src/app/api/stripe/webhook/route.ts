/**
 * Stripe Webhook Handler for FigDream
 * Processes Stripe webhook events for payments, subscriptions, and customers
 */
import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { constructWebhookEvent, isHandledWebhookEvent } from '@/lib/integrations/stripe/server'
import { 
  updatePaymentFromStripe,
  updateSubscriptionFromStripe,
  getSubscriptionByStripeId,
} from '@/lib/data-access/payments/stripe'
import { createClient } from '@/lib/database/supabase/server'
import type Stripe from 'stripe'
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
if (!webhookSecret) {
  throw new Error('STRIPE_WEBHOOK_SECRET is required')
}
/**
 * Process payment intent succeeded event
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    await updatePaymentFromStripe(paymentIntent.id, 'completed', paymentIntent)
    // Send confirmation email/SMS if enabled
    const bookingId = paymentIntent.metadata?.booking_id
    if (bookingId) {
      // TODO: Trigger booking confirmation notifications
    }
  } catch (_error) {
    throw error
  }
}
/**
 * Process payment intent failed event
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    await updatePaymentFromStripe(paymentIntent.id, 'failed', paymentIntent)
    // Send failure notification if enabled
    const bookingId = paymentIntent.metadata?.booking_id
    if (bookingId) {
      // TODO: Trigger payment failure notifications
    }
  } catch (_error) {
    throw error
  }
}
/**
 * Process payment intent canceled event
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update payment status in database
    await updatePaymentFromStripe(paymentIntent.id, 'cancelled', paymentIntent)
  } catch (_error) {
    throw error
  }
}
/**
 * Process subscription created event
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    // Update subscription in database
    await updateSubscriptionFromStripe(subscription.id, subscription)
    // Send welcome email if enabled
    const salonId = subscription.metadata?.salon_id
    if (salonId) {
      // TODO: Trigger subscription welcome notifications
    }
  } catch (_error) {
    // Don't throw for subscription events to prevent webhook retries
  }
}
/**
 * Process subscription updated event
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update subscription in database
    await updateSubscriptionFromStripe(subscription.id, subscription)
    // Handle specific status changes
    if (subscription.status === 'past_due') {
      // TODO: Send past due notification
    } else if (subscription.cancel_at_period_end) {
      // TODO: Send cancellation confirmation
    }
  } catch (_error) {
  }
}
/**
 * Process subscription deleted event
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Update subscription status in database
    await updateSubscriptionFromStripe(subscription.id, subscription)
    // Send cancellation confirmation
    const salonId = subscription.metadata?.salon_id
    if (salonId) {
      // TODO: Trigger subscription cancellation notifications
    }
  } catch (_error) {
  }
}
/**
 * Process invoice payment succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    if (subscriptionId) {
      // Get subscription record
      const subscriptionRecord = await getSubscriptionByStripeId(subscriptionId)
      if (subscriptionRecord) {
        const supabase = await createClient()
        // Record successful invoice payment
        await supabase
          .from('subscription_invoices')
          .insert({
            subscription_id: subscriptionRecord.id,
            stripe_invoice_id: invoice.id,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: 'paid',
            payment_date: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
            invoice_data: invoice as unknown as Record<string, unknown>,
          })
      }
    }
  } catch (_error) {
  }
}
/**
 * Process invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const subscriptionId = invoice.subscription as string
    if (subscriptionId) {
      // Get subscription record
      const subscriptionRecord = await getSubscriptionByStripeId(subscriptionId)
      if (subscriptionRecord) {
        const supabase = await createClient()
        // Record failed invoice payment
        await supabase
          .from('subscription_invoices')
          .insert({
            subscription_id: subscriptionRecord.id,
            stripe_invoice_id: invoice.id,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            status: 'payment_failed',
            due_date: new Date(invoice.due_date! * 1000).toISOString(),
            invoice_data: invoice as unknown as Record<string, unknown>,
          })
        // TODO: Send payment failure notification
      }
    }
  } catch (_error) {
  }
}
/**
 * Process customer created event
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  try {
    const userId = customer.metadata?.user_id
    if (userId) {
      const supabase = await createClient()
      // Update user profile with Stripe customer ID
      await supabase
        .from('profiles')
        .update({ 
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    }
  } catch (_error) {
  }
}
/**
 * Process customer updated event
 */
async function handleCustomerUpdated(customer: Stripe.Customer) {
  try {
    const userId = customer.metadata?.user_id
    if (userId) {
      const supabase = await createClient()
      // Update profile with latest customer data
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      }
      if (customer.email) {
        updateData.email = customer.email
      }
      if (customer.name) {
        const [firstName, ...lastNameParts] = customer.name.split(' ')
        updateData.first_name = firstName
        updateData.last_name = lastNameParts.join(' ')
      }
      if (customer.phone) {
        updateData.phone = customer.phone
      }
      await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
    }
  } catch (_error) {
  }
}
/**
 * Process customer deleted event
 */
async function handleCustomerDeleted(customer: Stripe.Customer) {
  try {
    const userId = customer.metadata?.user_id
    if (userId) {
      const supabase = await createClient()
      // Remove Stripe customer ID from profile
      await supabase
        .from('profiles')
        .update({ 
          stripe_customer_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    }
  } catch (_error) {
  }
}
/**
 * Process payment method attached event
 */
async function handlePaymentMethodAttached(paymentMethod: Stripe.PaymentMethod) {
  try {
    if (paymentMethod.customer) {
      // TODO: Update saved payment methods cache if needed
    }
  } catch (_error) {
  }
}
/**
 * Main webhook handler
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }
    // Construct the webhook event
    let event: Stripe.Event
    try {
      event = constructWebhookEvent(body, signature, webhookSecret)
    } catch (_error) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }
    // Received webhook event: ${event.type} (${event.id})
    // Check if we handle this event type
    if (!isHandledWebhookEvent(event.type)) {
      return NextResponse.json({ received: true })
    }
    // Process the event
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break
        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break
        case 'payment_intent.canceled':
          await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
          break
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
          break
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
          break
        case 'customer.created':
          await handleCustomerCreated(event.data.object as Stripe.Customer)
          break
        case 'customer.updated':
          await handleCustomerUpdated(event.data.object as Stripe.Customer)
          break
        case 'customer.deleted':
          await handleCustomerDeleted(event.data.object as Stripe.Customer)
          break
        case 'payment_method.attached':
          await handlePaymentMethodAttached(event.data.object as Stripe.PaymentMethod)
          break
        default:
          break
      }
      // Successfully processed webhook event: ${event.type} (${event.id})
      return NextResponse.json({ 
        received: true,
        processed: true,
        event_id: event.id,
        event_type: event.type,
      })
    } catch (_processingError) {
      // Error processing webhook event ${event.type} (${event.id}): _processingError
      // For payment events, we want to retry, so return 500
      if (event.type.startsWith('payment_intent.')) {
        return NextResponse.json(
          { error: 'Failed to process payment event', event_id: event.id },
          { status: 500 }
        )
      }
      // For other events, log the error but return 200 to prevent retries
      return NextResponse.json({ 
        received: true,
        processed: false,
        error: 'Processing failed',
        event_id: event.id,
      })
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
/**
 * GET endpoint for webhook verification (optional)
 */
export async function GET() {
  return NextResponse.json({
    message: 'FigDream Stripe Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
  })
}