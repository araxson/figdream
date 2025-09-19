"use server";

import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database.types";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Stripe types - minimal interface since Stripe SDK is not installed
interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer?: string;
  metadata?: Record<string, string>;
  last_payment_error?: {
    message?: string;
  };
}

interface StripeInvoice {
  id: string;
  amount_paid: number;
  amount_due: number;
  currency: string;
  status: string;
  customer: string;
  subscription?: string;
  metadata?: Record<string, string>;
  status_transitions: {
    paid_at?: number;
  };
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  trial_end?: number | null;
  metadata?: Record<string, string>;
  items: {
    data: Array<{
      price?: {
        id: string;
        unit_amount?: number;
      };
    }>;
  };
}

interface StripePaymentMethod {
  id: string;
  type: string;
  customer: string;
  card?: {
    last4?: string;
    brand?: string;
    exp_month?: number;
    exp_year?: number;
  };
}

interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  customer?: string;
  dispute?: {
    id: string;
    reason: string;
  };
}

type StripeObject =
  | StripePaymentIntent
  | StripeInvoice
  | StripeSubscription
  | StripePaymentMethod
  | StripeCharge;

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: StripeObject;
    previous_attributes?: Partial<StripeObject>;
  };
  created: number;
  api_version: string;
  request?: {
    id: string;
    idempotency_key?: string;
  };
}

export async function handleStripeWebhook(request: Request): Promise<Response> {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!STRIPE_WEBHOOK_SECRET) {
      throw new Error("Stripe webhook secret not configured");
    }

    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    // Note: Stripe SDK is not installed, so we'll parse the event directly
    // In production, you should install and use the Stripe SDK for signature verification
    let event: StripeEvent;

    try {
      // Parse the event without SDK (not recommended for production)
      // TODO: Install Stripe SDK and properly verify signature
      event = JSON.parse(body) as StripeEvent;

      // Basic validation
      if (!event.id || !event.type || !event.data?.object) {
        throw new Error("Invalid webhook payload");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error("Webhook parsing failed:", errorMessage);
      return new Response(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    // Process the event
    await processStripeEvent(event);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

async function processStripeEvent(event: StripeEvent): Promise<void> {
  const supabase = await createClient();

  // Use console.error for logging in production
  console.error(`Processing Stripe event: ${event.type}`);

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object as StripePaymentIntent, supabase);
      break;

    case "payment_intent.payment_failed":
      await handlePaymentIntentFailed(event.data.object as StripePaymentIntent, supabase);
      break;

    case "invoice.payment_succeeded":
      await handleInvoicePaymentSucceeded(event.data.object as StripeInvoice, supabase);
      break;

    case "invoice.payment_failed":
      await handleInvoicePaymentFailed(event.data.object as StripeInvoice, supabase);
      break;

    case "customer.subscription.created":
      await handleSubscriptionCreated(event.data.object as StripeSubscription, supabase);
      break;

    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as StripeSubscription, supabase);
      break;

    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object as StripeSubscription, supabase);
      break;

    case "invoice.created":
      handleInvoiceCreated(event.data.object as StripeInvoice, supabase);
      break;

    case "payment_method.attached":
      await handlePaymentMethodAttached(event.data.object as StripePaymentMethod, supabase);
      break;

    case "payment_method.detached":
      await handlePaymentMethodDetached(event.data.object as StripePaymentMethod, supabase);
      break;

    case "charge.dispute.created":
      await handleChargeDisputeCreated(event.data.object as StripeCharge, supabase);
      break;

    default:
      console.error(`Unhandled event type: ${event.type}`);
  }
}

async function handlePaymentIntentSucceeded(
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

async function handlePaymentIntentFailed(
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

async function handleInvoicePaymentSucceeded(
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

async function handleInvoicePaymentFailed(
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

async function handleSubscriptionCreated(
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

async function handleSubscriptionUpdated(
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

async function handleSubscriptionDeleted(
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

function handleInvoiceCreated(
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

async function handlePaymentMethodAttached(
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

async function handlePaymentMethodDetached(
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

async function handleChargeDisputeCreated(
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

async function updateRevenueAnalytics(
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