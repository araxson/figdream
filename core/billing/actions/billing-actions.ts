"use server";

import { createClient } from "@/lib/supabase/server";
import type { BillingInsert } from "../dal/billing-types";

// Stripe configuration (env variables should be added to .env.local)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Process subscription with Stripe
export async function createSubscription(
  salonId: string,
  customerId: string,
  priceId: string,
  paymentMethodId: string
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('[Subscription] Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    if (!user) {
      console.error('[Subscription] No user found in session');
      throw new Error("Authentication required. Please sign in to continue.");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Create Stripe customer if needed
    let stripeCustomer;
    const { data: existingCustomer } = await supabase
      .from("profiles")
      .select("metadata")
      .eq("id", customerId)
      .single();

    const metadata = existingCustomer?.metadata as any;
    const existingStripeId = metadata?.stripe_customer_id;
    if (existingStripeId && typeof existingStripeId === 'string') {
      stripeCustomer = await stripe.customers.retrieve(existingStripeId);
    } else {
      stripeCustomer = await stripe.customers.create({
        metadata: { user_id: customerId },
      });

      // Update profile metadata with Stripe customer ID
      const currentMetadata = (existingCustomer?.metadata as any) || {};
      await supabase
        .from("profiles")
        .update({
          metadata: {
            ...currentMetadata,
            stripe_customer_id: stripeCustomer.id
          } as any
        })
        .eq("id", customerId);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: stripeCustomer.id,
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      metadata: {
        salon_id: salonId,
        customer_id: customerId,
      },
    });

    // Save subscription data in billing table metadata since subscriptions table doesn't exist
    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      plan_id: priceId,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      subscription_type: 'recurring',
      stripe_subscription: subscription,
    };

    const { data: newBilling, error } = await supabase
      .from("billing")
      .insert({
        salon_id: salonId,
        customer_id: customerId,
        amount: ((subscription.items?.data?.[0]?.price?.unit_amount) || 0) / 100,
        currency: subscription.currency?.toUpperCase() || 'USD',
        status: subscription.status === 'active' ? 'completed' as const : 'pending' as const,
        description: `Subscription: ${priceId}`,
        metadata: subscriptionData,
      })
      .select()
      .single();

    if (error) throw error;

    return { ...subscriptionData, id: newBilling.id };
  } catch (error) {
    console.error('[Subscription] Creation failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        throw error;
      }
      if (error.message.includes('Stripe')) {
        throw new Error(`Payment service error: ${error.message}`);
      }
      if (error.message.includes('customer')) {
        throw new Error(`Customer setup error: ${error.message}`);
      }
      throw new Error(`Subscription creation failed: ${error.message}`);
    }

    throw new Error("Unable to create subscription. Please try again or contact support.");
  }
}

// Cancel subscription
export async function cancelSubscription(
  subscriptionId: string,
  cancelAtPeriodEnd = true,
  reason?: string
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get billing record with subscription metadata
    const { data: billing, error: subError } = await supabase
      .from("billing")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (subError || !billing) {
      throw new Error("Subscription not found");
    }

    const metadata = billing.metadata as any;
    const stripeSubscriptionId = metadata?.stripe_subscription_id;
    if (!stripeSubscriptionId || typeof stripeSubscriptionId !== 'string') {
      throw new Error("No Stripe subscription found");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    let stripeSubscription;
    if (cancelAtPeriodEnd) {
      // Cancel at period end
      stripeSubscription = await stripe.subscriptions.update(
        stripeSubscriptionId,
        {
          cancel_at_period_end: true,
          metadata: {
            cancelled_by: user.id,
            cancel_reason: reason || 'requested_by_customer',
          },
        }
      );
    } else {
      // Cancel immediately
      stripeSubscription = await stripe.subscriptions.cancel(
        stripeSubscriptionId,
        {
          metadata: {
            cancelled_by: user.id,
            cancel_reason: reason || 'requested_by_customer',
          },
        }
      );
    }

    // Update billing metadata with cancellation info
    const updatedMetadata = {
      ...(billing.metadata as any || {}),
      status: stripeSubscription.status,
      cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
      cancel_reason: reason || 'No reason provided',
      stripe_subscription: stripeSubscription,
    };

    const { data: updatedBilling, error: updateError } = await supabase
      .from("billing")
      .update({
        status: stripeSubscription.status === 'canceled' ? 'failed' as const : 'completed' as const,
        metadata: updatedMetadata as any,
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      subscription: { ...updatedMetadata, id: subscriptionId },
      stripe_subscription: stripeSubscription,
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw new Error("Failed to cancel subscription");
  }
}

// Update subscription
export async function updateSubscription(
  subscriptionId: string,
  priceId?: string,
  paymentMethodId?: string
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get billing record with subscription metadata
    const { data: billing, error: subError } = await supabase
      .from("billing")
      .select("*")
      .eq("id", subscriptionId)
      .single();

    if (subError || !billing) {
      throw new Error("Subscription not found");
    }

    const metadata = billing.metadata as any;
    const stripeSubscriptionId = metadata?.stripe_subscription_id;
    if (!stripeSubscriptionId || typeof stripeSubscriptionId !== 'string') {
      throw new Error("No Stripe subscription found");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Build update object
    const updateData: any = {
      metadata: {
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
    };

    // Update price if provided
    if (priceId) {
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      updateData.items = [{
        id: subscription.items.data[0].id,
        price: priceId,
      }];
    }

    // Update payment method if provided
    if (paymentMethodId) {
      updateData.default_payment_method = paymentMethodId;
    }

    // Update subscription in Stripe
    const stripeSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      updateData
    );

    // Update billing metadata
    const updatedMetadata = {
      ...(billing.metadata as any || {}),
      status: stripeSubscription.status,
      plan_id: priceId || metadata.plan_id,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
      stripe_subscription: stripeSubscription,
    };

    const { data: updatedBilling, error: updateError } = await supabase
      .from("billing")
      .update({
        amount: ((stripeSubscription.items?.data?.[0]?.price?.unit_amount) || 0) / 100,
        metadata: updatedMetadata as any,
      })
      .eq("id", subscriptionId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      subscription: { ...updatedMetadata, id: subscriptionId },
      stripe_subscription: stripeSubscription,
    };
  } catch (error) {
    console.error("Error updating subscription:", error);
    throw new Error("Failed to update subscription");
  }
}