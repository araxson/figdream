/**
 * Stripe Webhook Types - Type definitions for Stripe webhook objects
 */

// Stripe types - minimal interface since Stripe SDK is not installed
export interface StripePaymentIntent {
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

export interface StripeInvoice {
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

export interface StripeSubscription {
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

export interface StripePaymentMethod {
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

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  customer?: string;
  dispute?: {
    id: string;
    reason: string;
  };
}

export type StripeObject =
  | StripePaymentIntent
  | StripeInvoice
  | StripeSubscription
  | StripePaymentMethod
  | StripeCharge;

export interface StripeEvent {
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