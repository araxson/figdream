/**
 * Stripe-specific Data Access Layer for FigDream
 * Handles Stripe operations for SALON SUBSCRIPTIONS ONLY
 * 
 * Business Model:
 * - ONLY salon owners pay for platform subscriptions
 * - Customers book appointments for FREE
 * - No customer payment processing through the platform
 */
'use server'

import { createClient } from '@/lib/database/supabase/server'
import { 
  createCustomer,
  createSubscription as stripeCreateSubscription,
  updateSubscription as stripeUpdateSubscription,
  cancelSubscription as stripeCancelSubscription,
  createBillingPortalSession,
  getSubscription
} from '@/lib/integrations/stripe/server'
import type { Database } from '@/types/database.types'
import type Stripe from 'stripe'

type SalonRow = Database['public']['Tables']['salons']['Row']

/**
 * Create or retrieve Stripe customer for a salon owner
 * This is only for salon owners who need to pay subscriptions
 */
export async function ensureStripeCustomerForSalon(salonId: string): Promise<string> {
  const supabase = await createClient()
  
  try {
    // Get salon details with owner profile
    const { data: salon } = await supabase
      .from('salons')
      .select(`
        id,
        name,
        owner_id,
        stripe_customer_id,
        profiles!owner_id (
          email,
          full_name,
          phone
        )
      `)
      .eq('id', salonId)
      .single()
    
    if (!salon) {
      throw new Error('Salon not found')
    }
    
    // If customer already exists, return the ID
    if (salon.stripe_customer_id) {
      return salon.stripe_customer_id
    }
    
    // Create new Stripe customer for salon
    const profile = salon.profiles as unknown as { email: string; full_name: string | null; phone: string | null }
    const customer = await createCustomer({
      email: profile.email,
      name: salon.name,
      phone: profile.phone || undefined,
      metadata: {
        salon_id: salonId,
        owner_id: salon.owner_id,
        platform: 'figdream'
      },
    })
    
    // Update salon with Stripe customer ID
    const { error: updateError } = await supabase
      .from('salons')
      .update({ stripe_customer_id: customer.id })
      .eq('id', salonId)
    
    if (updateError) {
      throw new Error('Failed to link Stripe customer to salon')
    }
    
    return customer.id
  } catch (_error) {
    throw new Error('Failed to create or retrieve Stripe customer for salon')
  }
}

/**
 * Create a subscription for a salon
 * This is the primary payment method for the platform
 */
export async function createSalonSubscription(params: {
  salonId: string
  priceId: string
  paymentMethodId?: string
  trialDays?: number
}): Promise<{
  subscription: Stripe.Subscription
  clientSecret?: string
}> {
  const { salonId, priceId, paymentMethodId, trialDays } = params
  const supabase = await createClient()
  
  try {
    // Ensure salon has a Stripe customer
    const stripeCustomerId = await ensureStripeCustomerForSalon(salonId)
    
    // Create the subscription
    const subscription = await stripeCreateSubscription({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      trial_period_days: trialDays,
      metadata: {
        salon_id: salonId,
        platform: 'figdream'
      },
      ...(paymentMethodId && {
        default_payment_method: paymentMethodId
      })
    })
    
    // Store subscription in database
    const { error: dbError } = await supabase
      .from('salon_subscriptions')
      .upsert({
        salon_id: salonId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: stripeCustomerId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        price_id: priceId,
        updated_at: new Date().toISOString()
      })
    
    if (dbError) {
      throw new Error('Failed to store subscription in database')
    }
    
    // Return subscription with client secret if payment is required
    const latestInvoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent
    
    return {
      subscription,
      clientSecret: paymentIntent?.client_secret || undefined
    }
  } catch (_error) {
    throw new Error('Failed to create salon subscription')
  }
}

/**
 * Update a salon's subscription (upgrade/downgrade plan)
 */
export async function updateSalonSubscription(params: {
  salonId: string
  subscriptionId: string
  newPriceId: string
}): Promise<Stripe.Subscription> {
  const { salonId, subscriptionId, newPriceId } = params
  const supabase = await createClient()
  
  try {
    // Get current subscription
    const subscription = await getSubscription(subscriptionId)
    
    if (!subscription) {
      throw new Error('Subscription not found')
    }
    
    // Update the subscription with new price
    const updatedSubscription = await stripeUpdateSubscription(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId
      }],
      proration_behavior: 'create_prorations'
    })
    
    // Update database
    const { error: dbError } = await supabase
      .from('salon_subscriptions')
      .update({
        price_id: newPriceId,
        status: updatedSubscription.status,
        updated_at: new Date().toISOString()
      })
      .eq('salon_id', salonId)
    
    if (dbError) {
      throw new Error('Failed to update subscription in database')
    }
    
    return updatedSubscription
  } catch (_error) {
    throw new Error('Failed to update salon subscription')
  }
}

/**
 * Cancel a salon's subscription
 */
export async function cancelSalonSubscription(params: {
  salonId: string
  subscriptionId: string
  cancelAtPeriodEnd?: boolean
}): Promise<Stripe.Subscription> {
  const { salonId, subscriptionId, cancelAtPeriodEnd = true } = params
  const supabase = await createClient()
  
  try {
    // Cancel subscription in Stripe
    const canceledSubscription = await stripeCancelSubscription(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd
    })
    
    // Update database
    const { error: dbError } = await supabase
      .from('salon_subscriptions')
      .update({
        status: canceledSubscription.status,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        canceled_at: canceledSubscription.canceled_at 
          ? new Date(canceledSubscription.canceled_at * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      })
      .eq('salon_id', salonId)
    
    if (dbError) {
      throw new Error('Failed to update subscription cancellation in database')
    }
    
    return canceledSubscription
  } catch (_error) {
    throw new Error('Failed to cancel salon subscription')
  }
}

/**
 * Get Stripe billing portal URL for salon to manage subscription
 */
export async function getSalonBillingPortalUrl(params: {
  salonId: string
  returnUrl: string
}): Promise<string> {
  const { salonId, returnUrl } = params
  
  try {
    // Get salon's Stripe customer ID
    const stripeCustomerId = await ensureStripeCustomerForSalon(salonId)
    
    // Create billing portal session
    const session = await createBillingPortalSession({
      customer: stripeCustomerId,
      return_url: returnUrl
    })
    
    return session.url
  } catch (_error) {
    throw new Error('Failed to create billing portal session')
  }
}

/**
 * Webhook handler for Stripe subscription events
 * Called by the Stripe webhook endpoint
 */
export async function handleSubscriptionWebhook(event: Stripe.Event) {
  const supabase = await createClient()
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const salonId = subscription.metadata?.salon_id
      
      if (!salonId) {
        console.error('No salon_id in subscription metadata')
        return
      }
      
      // Update subscription status in database
      await supabase
        .from('salon_subscriptions')
        .upsert({
          salon_id: salonId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at 
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString()
        })
      
      break
    }
    
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string
      
      // Store invoice record for salon's records
      if (subscriptionId) {
        const { data: subscription } = await supabase
          .from('salon_subscriptions')
          .select('salon_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single()
        
        if (subscription) {
          await supabase
            .from('subscription_invoices')
            .insert({
              salon_id: subscription.salon_id,
              stripe_invoice_id: invoice.id,
              amount_paid: invoice.amount_paid,
              amount_due: invoice.amount_due,
              currency: invoice.currency,
              status: invoice.status || 'paid',
              invoice_pdf: invoice.invoice_pdf,
              created_at: new Date(invoice.created * 1000).toISOString()
            })
        }
      }
      
      break
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = invoice.subscription as string
      
      // Mark subscription as past_due or handle payment failure
      if (subscriptionId) {
        await supabase
          .from('salon_subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscriptionId)
      }
      
      break
    }
  }
}