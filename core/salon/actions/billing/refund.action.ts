"use server";

import { createClient } from "@/lib/supabase/server";
import type { BillingUpdate } from "../dal/billing-types";

// Stripe configuration (env variables should be added to .env.local)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Refund payment
export async function refundPayment(
  billingId: string,
  amount?: number,
  reason?: string
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('[Refund Payment] Authentication error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    if (!user) {
      console.error('[Refund Payment] No user found in session');
      throw new Error("Authentication required. Please sign in to continue.");
    }

    // Get billing record
    const { data: billing, error: billingError } = await supabase
      .from("billing")
      .select("*")
      .eq("id", billingId)
      .single();

    if (billingError || !billing) {
      throw new Error("Billing record not found");
    }

    if (!billing.stripe_payment_intent_id) {
      throw new Error("No Stripe payment intent found");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: billing.stripe_payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || 'requested_by_customer',
      metadata: {
        billing_id: billingId,
        refunded_by: user.id,
      },
    });

    // Update billing status
    const updateData: BillingUpdate = {
      status: 'refunded' as const,
      metadata: {
        ...(billing.metadata as any || {}),
        refund: refund,
        refunded_at: new Date().toISOString(),
        refunded_by: user.id,
      } as any,
    };

    const { data: updatedBilling, error: updateError } = await supabase
      .from("billing")
      .update(updateData)
      .eq("id", billingId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      billing: updatedBilling,
      refund,
    };
  } catch (error) {
    console.error('[Refund Payment] Refund failed:', error);

    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        throw error;
      }
      if (error.message.includes('not found')) {
        throw new Error("Cannot process refund: Original payment not found.");
      }
      if (error.message.includes('already_refunded')) {
        throw new Error("This payment has already been refunded.");
      }
      if (error.message.includes('Stripe')) {
        throw new Error(`Refund processing error: ${error.message}`);
      }
      throw new Error(`Refund failed: ${error.message}`);
    }

    throw new Error("Unable to process refund. Please contact support for assistance.");
  }
}

// Partial refund
export async function partialRefund(
  billingId: string,
  amount: number,
  reason?: string
) {
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

    // Validate partial refund amount
    const metadata = billing.metadata as any;
    const existingRefunds = metadata?.refunds || [];
    const totalRefunded = existingRefunds.reduce((sum: number, refund: any) => sum + (refund.amount || 0), 0);
    const maxRefundAmount = billing.amount - totalRefunded;

    if (amount > maxRefundAmount) {
      throw new Error(`Cannot refund $${amount}. Maximum refundable amount is $${maxRefundAmount}`);
    }

    if (!billing.stripe_payment_intent_id) {
      throw new Error("No Stripe payment intent found");
    }

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    // Create partial refund
    const refund = await stripe.refunds.create({
      payment_intent: billing.stripe_payment_intent_id,
      amount: Math.round(amount * 100),
      reason: reason || 'requested_by_customer',
      metadata: {
        billing_id: billingId,
        refunded_by: user.id,
        refund_type: 'partial',
      },
    });

    // Update billing metadata with new refund
    const updatedRefunds = [...existingRefunds, {
      id: refund.id,
      amount: amount,
      reason: reason || 'requested_by_customer',
      created_at: new Date().toISOString(),
      refunded_by: user.id,
      stripe_refund: refund,
    }];

    const newTotalRefunded = totalRefunded + amount;
    const isFullyRefunded = newTotalRefunded >= billing.amount;

    const updateData: BillingUpdate = {
      status: isFullyRefunded ? 'refunded' as const : billing.status,
      metadata: {
        ...(billing.metadata as any || {}),
        refunds: updatedRefunds,
        total_refunded: newTotalRefunded,
        last_refund_at: new Date().toISOString(),
      } as any,
    };

    const { data: updatedBilling, error: updateError } = await supabase
      .from("billing")
      .update(updateData)
      .eq("id", billingId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      billing: updatedBilling,
      refund,
      total_refunded: newTotalRefunded,
      fully_refunded: isFullyRefunded,
    };
  } catch (error) {
    console.error("Error processing partial refund:", error);
    throw new Error("Failed to process partial refund");
  }
}

// Get refund status
export async function getRefundStatus(billingId: string) {
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

    const metadata = billing.metadata as any;
    const refunds = metadata?.refunds || [];
    const totalRefunded = refunds.reduce((sum: number, refund: any) => sum + (refund.amount || 0), 0);

    return {
      billing_id: billingId,
      original_amount: billing.amount,
      total_refunded: totalRefunded,
      remaining_amount: billing.amount - totalRefunded,
      is_fully_refunded: totalRefunded >= billing.amount,
      refund_count: refunds.length,
      refunds: refunds,
      status: billing.status,
    };
  } catch (error) {
    console.error("Error getting refund status:", error);
    throw new Error("Failed to get refund status");
  }
}

// Process dispute
export async function processDispute(
  billingId: string,
  disputeReason: string,
  evidence?: Record<string, any>
) {
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

    // Update billing with dispute information
    const updateData: BillingUpdate = {
      status: 'disputed' as const,
      metadata: {
        ...(billing.metadata as any || {}),
        dispute: {
          reason: disputeReason,
          evidence: evidence,
          disputed_at: new Date().toISOString(),
          disputed_by: user.id,
          status: 'under_review',
        },
      } as any,
    };

    const { data: updatedBilling, error: updateError } = await supabase
      .from("billing")
      .update(updateData)
      .eq("id", billingId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      billing: updatedBilling,
      dispute_status: 'under_review',
    };
  } catch (error) {
    console.error("Error processing dispute:", error);
    throw new Error("Failed to process dispute");
  }
}