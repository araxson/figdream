"use server";

import { createClient } from "@/lib/supabase/server";
import type { StripeEvent, StripePaymentIntent, StripeInvoice, StripeSubscription, StripePaymentMethod, StripeCharge } from "./webhook-types";
import {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoiceCreated,
  handlePaymentMethodAttached,
  handlePaymentMethodDetached,
  handleChargeDisputeCreated,
} from "./webhook-handlers";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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