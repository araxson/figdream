// Types based on actual database schema
export interface Billing {
  id: string;
  salon_id: string;
  customer_id: string;
  subscription_id?: string | null;
  amount: number;
  currency: string | null;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  payment_method_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_invoice_id?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

export type BillingInsert = Omit<Billing, "id" | "created_at" | "updated_at">;

export type BillingUpdate = Partial<Omit<Billing, "id" | "created_at">>;

export interface BillingFilters {
  salon_id?: string;
  customer_id?: string;
  subscription_id?: string;
  status?: Billing["status"];
  from_date?: string;
  to_date?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface Invoice {
  id: string;
  billing_id: string;
  invoice_number: string;
  due_date: string;
  paid_at?: string | null;
  amount_due: number;
  amount_paid: number | null;
  tax_amount: number | null;
  discount_amount: number | null;
  status?: "pending" | "paid" | "overdue" | "cancelled" | null;
  metadata?: Record<string, any> | null;
  line_items?: InvoiceLineItem[];
  created_at: string | null;
  updated_at: string | null;
}

export interface InvoiceLineItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number | null;
  unit_price: number;
  total_price: number;
  tax_rate: number | null;
  discount_percentage: number | null;
  created_at?: string | null;
}

export interface PaymentMethod {
  id: string;
  user_id: string;  // Changed from customer_id to match database
  stripe_payment_method_id?: string | null;
  type: "card" | "bank_account" | "paypal" | "other";
  is_default: boolean | null;
  last_four?: string | null;
  brand?: string | null;
  exp_month?: number | null;
  exp_year?: number | null;
  metadata?: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BillingStats {
  total_revenue: number;
  monthly_revenue: number;
  pending_payments: number;
  failed_payments: number;
  active_subscriptions: number;
  churn_rate: number;
}

// Subscription types based on actual database table
export interface Subscription {
  id: string;
  salon_id: string;
  customer_id: string;
  stripe_subscription_id?: string | null;
  plan_id: string;
  status: "active" | "cancelled" | "past_due" | "trialing" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  trial_end?: string | null;
  cancel_at_period_end?: boolean | null;
  metadata?: Record<string, any> | null;
  created_at: string | null;
  updated_at: string | null;
}

export type SubscriptionInsert = Omit<Subscription, "id" | "created_at" | "updated_at">;
export type SubscriptionUpdate = Partial<Omit<Subscription, "id" | "created_at">>;
