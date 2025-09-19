"use server";

import { createClient } from "@/lib/supabase/server";
import type { BillingInsert, BillingUpdate } from "../dal/billing-types";

// Stripe configuration (env variables should be added to .env.local)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Payment Intent Creation
export async function createPaymentIntent(
  amount: number,
  currency = "usd",
  metadata?: Record<string, string>
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('[Payment Intent] Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    if (!user) {
      console.error('[Payment Intent] No user found in session');
      throw new Error("Authentication required. Please sign in to continue.");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    // Stripe payment intent creation
    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        user_id: user.id,
        ...metadata,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
    };
  } catch (error) {
    console.error('[Payment Intent] Creation failed:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        throw error; // Re-throw authentication errors
      }
      if (error.message.includes('Stripe') || error.message.includes('payment')) {
        throw new Error(`Payment processing error: ${error.message}`);
      }
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }

    throw new Error("Unable to process payment. Please try again or contact support.");
  }
}

// Process one-time payment
export async function processPayment(
  salonId: string,
  customerId: string,
  amount: number,
  paymentMethodId: string,
  description?: string
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('[Process Payment] Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    if (!user) {
      console.error('[Process Payment] No user found in session');
      throw new Error("Authentication required. Please sign in to continue.");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/payment-confirmation`,
      metadata: {
        salon_id: salonId,
        customer_id: customerId,
      },
    });

    // Create billing record
    const billingData: BillingInsert = {
      salon_id: salonId,
      customer_id: customerId,
      amount: amount,
      currency: 'USD',
      status: paymentIntent.status === 'succeeded' ? 'completed' as const : 'processing' as const,
      payment_method_id: paymentMethodId,
      stripe_payment_intent_id: paymentIntent.id,
      description: description || 'One-time payment',
      metadata: {
        stripe_payment_intent: paymentIntent,
      } as any,
    };

    const { data: billing, error } = await supabase
      .from("billing")
      .insert(billingData)
      .select()
      .single();

    if (error) throw error;

    return {
      billing,
      payment_intent: paymentIntent,
      requires_action: paymentIntent.status === 'requires_action',
      client_secret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('[Process Payment] Transaction failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        throw error;
      }
      if (error.message.includes('insufficient_funds')) {
        throw new Error("Payment declined: Insufficient funds. Please try a different payment method.");
      }
      if (error.message.includes('card_declined')) {
        throw new Error("Payment declined: Card was declined. Please check your card details or try a different card.");
      }
      if (error.message.includes('Stripe')) {
        throw new Error(`Payment processing error: ${error.message}`);
      }
      throw new Error(`Payment failed: ${error.message}`);
    }

    throw new Error("Unable to process payment. Please verify your payment details and try again.");
  }
}

// Retry failed payment
export async function retryFailedPayment(billingId: string) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get billing record
    const { data: billing, error: billingError } = await supabase
      .from("billing")
      .select("*")
      .eq("id", billingId)
      .single();

    if (billingError || !billing) {
      throw new Error("Billing record not found");
    }

    if (billing.status !== 'failed') {
      throw new Error("Payment is not in failed status");
    }

    if (!billing.stripe_payment_intent_id) {
      throw new Error("No Stripe payment intent found");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Confirm payment intent again
    const paymentIntent = await stripe.paymentIntents.confirm(
      billing.stripe_payment_intent_id
    );

    // Update billing status based on result
    const newStatus: "completed" | "processing" | "failed" =
      paymentIntent.status === 'succeeded' ? 'completed' :
      paymentIntent.status === 'requires_action' ? 'processing' : 'failed';

    const { data: updatedBilling, error: updateError } = await supabase
      .from("billing")
      .update({
        status: newStatus,
        metadata: {
          ...(billing.metadata as any || {}),
          retry_attempted_at: new Date().toISOString(),
          retry_attempted_by: user.id,
        } as any,
      })
      .eq("id", billingId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      billing: updatedBilling,
      payment_intent: paymentIntent,
      requires_action: paymentIntent.status === 'requires_action',
    };
  } catch (error) {
    console.error("Error retrying payment:", error);
    throw new Error("Failed to retry payment");
  }
}

// Add payment method
export async function addPaymentMethod(
  customerId: string,
  paymentMethodId: string,
  setAsDefault = false
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    // If setting as default, unset other default payment methods
    if (setAsDefault) {
      await supabase
        .from("payment_methods")
        .update({ is_default: false })
        .eq("user_id", customerId);
    }

    // Save payment method to database
    const { data: newPaymentMethod, error } = await supabase
      .from("payment_methods")
      .insert({
        user_id: customerId,
        stripe_payment_method_id: paymentMethodId,
        type: paymentMethod.type,
        is_default: setAsDefault,
        last_four: paymentMethod.card?.last4 || null,
        brand: paymentMethod.card?.brand || null,
        exp_month: paymentMethod.card?.exp_month || null,
        exp_year: paymentMethod.card?.exp_year || null,
        metadata: {
          stripe_payment_method: paymentMethod,
        },
      })
      .select()
      .single();

    if (error) throw error;

    return newPaymentMethod;
  } catch (error) {
    console.error("Error adding payment method:", error);
    throw new Error("Failed to add payment method");
  }
}