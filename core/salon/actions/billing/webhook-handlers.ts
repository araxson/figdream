"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";
import type {
  StripePaymentIntent,
  StripeInvoice,
  StripeSubscription,
  StripePaymentMethod,
  StripeCharge,
} from "./webhook-types";

/**
 * Webhook Handler Functions - Individual handlers for each Stripe event type
 */

export async function handlePaymentIntentSucceeded(
  paymentIntent: StripePaymentIntent,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Update billing record status
    const { error } = await supabase
      .from("billing")
      .update({
        status: "completed",
        metadata: {
          stripe_payment_intent: paymentIntent as unknown as Json,
          completed_at: new Date().toISOString(),
        } as Json,
      })
      .eq("stripe_payment_intent_id", paymentIntent.id);

    if (error) {
      console.error("Error updating billing record:", error);
    }

    // Update revenue analytics
    await updateRevenueAnalytics(paymentIntent, supabase);

    console.error(`Payment succeeded: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
  }
}

export async function handlePaymentIntentFailed(
  paymentIntent: StripePaymentIntent,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Update billing record status
    const { error } = await supabase
      .from("billing")
      .update({
        status: "failed",
        metadata: {
          stripe_payment_intent: paymentIntent as unknown as Json,
          failed_at: new Date().toISOString(),
          failure_reason: paymentIntent.last_payment_error?.message,
        } as Json,
      })
      .eq("stripe_payment_intent_id", paymentIntent.id);

    if (error) {
      console.error("Error updating billing record:", error);
    }

    console.error(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
  }
}

export async function handleInvoicePaymentSucceeded(
  invoice: StripeInvoice,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Update invoice status
    const { error } = await supabase
      .from("invoices")
      .update({
        status: "paid",
        amount_paid: invoice.amount_paid / 100, // Convert from cents
        paid_at: invoice.status_transitions.paid_at
          ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
          : new Date().toISOString(),
        metadata: {
          stripe_invoice: invoice as unknown as Json,
        } as Json,
      })
      .eq("stripe_invoice_id", invoice.id);

    if (error) {
      console.error("Error updating invoice:", error);
    }

    console.error(`Invoice payment succeeded: ${invoice.id}`);
  } catch (error) {
    console.error("Error handling invoice.payment_succeeded:", error);
  }
}

export async function handleInvoicePaymentFailed(
  invoice: StripeInvoice,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Update invoice status
    const { error } = await supabase
      .from("invoices")
      .update({
        status: "overdue",
        metadata: {
          stripe_invoice: invoice as unknown as Json,
          payment_failed_at: new Date().toISOString(),
        } as Json,
      })
      .eq("stripe_invoice_id", invoice.id);

    if (error) {
      console.error("Error updating invoice:", error);
    }

    console.error(`Invoice payment failed: ${invoice.id}`);
  } catch (error) {
    console.error("Error handling invoice.payment_failed:", error);
  }
}

export async function handleSubscriptionCreated(
  subscription: StripeSubscription,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    const salonId = subscription.metadata?.salon_id;
    const customerId = subscription.metadata?.customer_id;

    if (!salonId || !customerId) {
      console.error("Missing salon_id or customer_id in subscription metadata");
      return;
    }

    // Create or update subscription record
    const { error } = await supabase
      .from("subscriptions")
      .upsert([{
        salon_id: salonId,
        customer_id: customerId,
        stripe_subscription_id: subscription.id,
        plan_id: subscription.items.data[0]?.price?.id || "unknown",
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        metadata: {
          stripe_subscription: subscription,
          monthly_amount: subscription.items.data[0]?.price?.unit_amount
            ? subscription.items.data[0].price.unit_amount / 100
            : 0,
        } as Json,
      }]);

    if (error) {
      console.error("Error creating subscription:", error);
    }

    console.error(`Subscription created: ${subscription.id}`);
  } catch (error) {
    console.error("Error handling customer.subscription.created:", error);
  }
}

export async function handleSubscriptionUpdated(
  subscription: StripeSubscription,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Update subscription record
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        metadata: {
          stripe_subscription: subscription as unknown as Json,
          updated_at: new Date().toISOString(),
        } as Json,
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Error updating subscription:", error);
    }

    console.error(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    console.error("Error handling customer.subscription.updated:", error);
  }
}

export async function handleSubscriptionDeleted(
  subscription: StripeSubscription,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Update subscription status to cancelled
    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        metadata: {
          stripe_subscription: subscription as unknown as Json,
          cancelled_at: new Date().toISOString(),
        } as Json,
      })
      .eq("stripe_subscription_id", subscription.id);

    if (error) {
      console.error("Error updating subscription:", error);
    }

    console.error(`Subscription deleted: ${subscription.id}`);
  } catch (error) {
    console.error("Error handling customer.subscription.deleted:", error);
  }
}

export function handleInvoiceCreated(
  invoice: StripeInvoice,
  _supabase: SupabaseClient<Database>
): void {
  try {
    // This could be used to sync Stripe-generated invoices with local records
    console.error(`Invoice created: ${invoice.id}`);
  } catch (error) {
    console.error("Error handling invoice.created:", error);
  }
}

export async function handlePaymentMethodAttached(
  paymentMethod: StripePaymentMethod,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Find the user by customer ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", paymentMethod.customer)
      .single();

    if (!profile) {
      console.error("User not found for customer:", paymentMethod.customer);
      return;
    }

    // Create or update payment method record
    const { error } = await supabase
      .from("payment_methods")
      .upsert([{
        user_id: profile.id,
        stripe_payment_method_id: paymentMethod.id,
        type: paymentMethod.type,
        is_default: false, // Set based on customer's default_payment_method
        last_four: paymentMethod.card?.last4 || null,
        brand: paymentMethod.card?.brand || null,
        exp_month: paymentMethod.card?.exp_month || null,
        exp_year: paymentMethod.card?.exp_year || null,
        metadata: {
          stripe_payment_method: paymentMethod as unknown as Json,
        } as Json,
      }]);

    if (error) {
      console.error("Error creating payment method:", error);
    }

    console.error(`Payment method attached: ${paymentMethod.id}`);
  } catch (error) {
    console.error("Error handling payment_method.attached:", error);
  }
}

export async function handlePaymentMethodDetached(
  paymentMethod: StripePaymentMethod,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Remove payment method record
    const { error } = await supabase
      .from("payment_methods")
      .delete()
      .eq("stripe_payment_method_id", paymentMethod.id);

    if (error) {
      console.error("Error deleting payment method:", error);
    }

    console.error(`Payment method detached: ${paymentMethod.id}`);
  } catch (error) {
    console.error("Error handling payment_method.detached:", error);
  }
}

export async function handleChargeDisputeCreated(
  charge: StripeCharge,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    // Update billing record with dispute information
    const { error } = await supabase
      .from("billing")
      .update({
        status: "failed",  // Use 'failed' instead of 'disputed' which doesn't exist
        metadata: {
          charge_id: charge.id,
          disputed_at: new Date().toISOString(),
          dispute_reason: charge.dispute?.reason,
        } as Json,
      })
      .eq("stripe_payment_intent_id", charge.id);

    if (error) {
      console.error("Error updating billing record with dispute:", error);
    }

    console.error(`Charge dispute created: ${charge.id}`);
  } catch (error) {
    console.error("Error handling charge.dispute.created:", error);
  }
}

export async function updateRevenueAnalytics(
  paymentIntent: StripePaymentIntent,
  supabase: SupabaseClient<Database>
): Promise<void> {
  try {
    const amount = paymentIntent.amount / 100; // Convert from cents
    const date = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
    const salonId = paymentIntent.metadata?.salon_id;

    if (!salonId) {
      console.error("Missing salon_id in payment intent metadata");
      return;
    }

    // Determine if this is subscription or one-time revenue
    const isSubscription = paymentIntent.metadata?.subscription_id;

    // Update or create revenue analytics record
    const { error } = await supabase
      .from("revenue_analytics")
      .upsert([{
        salon_id: salonId,
        date: date,
        total_revenue: amount,
        subscription_revenue: isSubscription ? amount : 0,
        one_time_revenue: isSubscription ? 0 : amount,
        transaction_count: 1,
      }]);

    if (error) {
      console.error("Error updating revenue analytics:", error);
    }
  } catch (error) {
    console.error("Error updating revenue analytics:", error);
  }
}

// Utility function to verify webhook events (can be used for manual verification)
export function verifyWebhookEvent(eventId: string): boolean {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    // TODO: Install Stripe SDK and implement proper verification
    // For now, return false as we can't verify without the SDK
    console.error("Stripe SDK not installed - cannot verify event:", eventId);
    return false;
  } catch (error) {
    console.error("Error verifying webhook event:", error);
    return false;
  }
}