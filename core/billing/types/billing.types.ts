import type { Json, TableDefinition, Relationship } from '@/core/shared/types/base.types'

// Billing Domain Types
export interface BillingTables {
  billing: TableDefinition<
    BillingRow,
    BillingInsert,
    BillingUpdate,
    BillingRelationships
  >
  invoice_line_items: TableDefinition<
    InvoiceLineItemRow,
    InvoiceLineItemInsert,
    InvoiceLineItemUpdate,
    InvoiceLineItemRelationships
  >
  invoices: TableDefinition<
    InvoiceRow,
    InvoiceInsert,
    InvoiceUpdate,
    InvoiceRelationships
  >
  payment_methods: TableDefinition<
    PaymentMethodRow,
    PaymentMethodInsert,
    PaymentMethodUpdate,
    PaymentMethodRelationships
  >
  revenue_analytics: TableDefinition<
    RevenueAnalyticsRow,
    RevenueAnalyticsInsert,
    RevenueAnalyticsUpdate,
    RevenueAnalyticsRelationships
  >
  subscriptions: TableDefinition<
    SubscriptionRow,
    SubscriptionInsert,
    SubscriptionUpdate,
    SubscriptionRelationships
  >
}

// Billing Table Types
export interface BillingRow {
  amount: number
  created_at: string | null
  currency: string | null
  customer_id: string
  description: string | null
  id: string
  metadata: Json | null
  payment_method_id: string | null
  salon_id: string
  status: string
  stripe_invoice_id: string | null
  stripe_payment_intent_id: string | null
  subscription_id: string | null
  updated_at: string | null
}

export interface BillingInsert {
  amount: number
  created_at?: string | null
  currency?: string | null
  customer_id: string
  description?: string | null
  id?: string
  metadata?: Json | null
  payment_method_id?: string | null
  salon_id: string
  status: string
  stripe_invoice_id?: string | null
  stripe_payment_intent_id?: string | null
  subscription_id?: string | null
  updated_at?: string | null
}

export interface BillingUpdate {
  amount?: number
  created_at?: string | null
  currency?: string | null
  customer_id?: string
  description?: string | null
  id?: string
  metadata?: Json | null
  payment_method_id?: string | null
  salon_id?: string
  status?: string
  stripe_invoice_id?: string | null
  stripe_payment_intent_id?: string | null
  subscription_id?: string | null
  updated_at?: string | null
}

export type BillingRelationships = [
  {
    foreignKeyName: "billing_payment_method_id_fkey"
    columns: ["payment_method_id"]
    isOneToOne: false
    referencedRelation: "payment_methods"
    referencedColumns: ["id"]
  },
  {
    foreignKeyName: "billing_salon_id_fkey"
    columns: ["salon_id"]
    isOneToOne: false
    referencedRelation: "salons"
    referencedColumns: ["id"]
  }
]

// Invoice Line Items Types
export interface InvoiceLineItemRow {
  created_at: string | null
  description: string
  discount_percentage: number | null
  id: string
  invoice_id: string
  quantity: number | null
  tax_rate: number | null
  total_price: number
  unit_price: number
}

export interface InvoiceLineItemInsert {
  created_at?: string | null
  description: string
  discount_percentage?: number | null
  id?: string
  invoice_id: string
  quantity?: number | null
  tax_rate?: number | null
  total_price: number
  unit_price: number
}

export interface InvoiceLineItemUpdate {
  created_at?: string | null
  description?: string
  discount_percentage?: number | null
  id?: string
  invoice_id?: string
  quantity?: number | null
  tax_rate?: number | null
  total_price?: number
  unit_price?: number
}

export type InvoiceLineItemRelationships = [
  {
    foreignKeyName: "invoice_line_items_invoice_id_fkey"
    columns: ["invoice_id"]
    isOneToOne: false
    referencedRelation: "invoices"
    referencedColumns: ["id"]
  }
]

// Invoice Types
export interface InvoiceRow {
  amount_due: number
  amount_paid: number | null
  billing_id: string
  created_at: string | null
  discount_amount: number | null
  due_date: string
  id: string
  invoice_number: string
  metadata: Json | null
  paid_at: string | null
  status: string | null
  tax_amount: number | null
  updated_at: string | null
}

export interface InvoiceInsert {
  amount_due: number
  amount_paid?: number | null
  billing_id: string
  created_at?: string | null
  discount_amount?: number | null
  due_date: string
  id?: string
  invoice_number: string
  metadata?: Json | null
  paid_at?: string | null
  status?: string | null
  tax_amount?: number | null
  updated_at?: string | null
}

export interface InvoiceUpdate {
  amount_due?: number
  amount_paid?: number | null
  billing_id?: string
  created_at?: string | null
  discount_amount?: number | null
  due_date?: string
  id?: string
  invoice_number?: string
  metadata?: Json | null
  paid_at?: string | null
  status?: string | null
  tax_amount?: number | null
  updated_at?: string | null
}

export type InvoiceRelationships = [
  {
    foreignKeyName: "invoices_billing_id_fkey"
    columns: ["billing_id"]
    isOneToOne: false
    referencedRelation: "billing"
    referencedColumns: ["id"]
  }
]

// Payment Method Types
export interface PaymentMethodRow {
  brand: string | null
  created_at: string | null
  exp_month: number | null
  exp_year: number | null
  id: string
  is_default: boolean | null
  last_four: string | null
  metadata: Json | null
  stripe_payment_method_id: string | null
  type: string
  updated_at: string | null
  user_id: string
}

export interface PaymentMethodInsert {
  brand?: string | null
  created_at?: string | null
  exp_month?: number | null
  exp_year?: number | null
  id?: string
  is_default?: boolean | null
  last_four?: string | null
  metadata?: Json | null
  stripe_payment_method_id?: string | null
  type: string
  updated_at?: string | null
  user_id: string
}

export interface PaymentMethodUpdate {
  brand?: string | null
  created_at?: string | null
  exp_month?: number | null
  exp_year?: number | null
  id?: string
  is_default?: boolean | null
  last_four?: string | null
  metadata?: Json | null
  stripe_payment_method_id?: string | null
  type?: string
  updated_at?: string | null
  user_id?: string
}

export type PaymentMethodRelationships = []

// Revenue Analytics Types
export interface RevenueAnalyticsRow {
  created_at: string | null
  date: string
  id: string
  one_time_revenue: number | null
  refunded_amount: number | null
  salon_id: string
  subscription_revenue: number | null
  total_revenue: number | null
  transaction_count: number | null
  updated_at: string | null
}

export interface RevenueAnalyticsInsert {
  created_at?: string | null
  date: string
  id?: string
  one_time_revenue?: number | null
  refunded_amount?: number | null
  salon_id: string
  subscription_revenue?: number | null
  total_revenue?: number | null
  transaction_count?: number | null
  updated_at?: string | null
}

export interface RevenueAnalyticsUpdate {
  created_at?: string | null
  date?: string
  id?: string
  one_time_revenue?: number | null
  refunded_amount?: number | null
  salon_id?: string
  subscription_revenue?: number | null
  total_revenue?: number | null
  transaction_count?: number | null
  updated_at?: string | null
}

export type RevenueAnalyticsRelationships = [
  {
    foreignKeyName: "revenue_analytics_salon_id_fkey"
    columns: ["salon_id"]
    isOneToOne: false
    referencedRelation: "salons"
    referencedColumns: ["id"]
  }
]

// Subscription Types
export interface SubscriptionRow {
  cancel_at_period_end: boolean | null
  created_at: string | null
  current_period_end: string
  current_period_start: string
  customer_id: string
  id: string
  metadata: Json | null
  plan_id: string
  salon_id: string
  status: string
  stripe_subscription_id: string | null
  trial_end: string | null
  updated_at: string | null
}

export interface SubscriptionInsert {
  cancel_at_period_end?: boolean | null
  created_at?: string | null
  current_period_end: string
  current_period_start: string
  customer_id: string
  id?: string
  metadata?: Json | null
  plan_id: string
  salon_id: string
  status: string
  stripe_subscription_id?: string | null
  trial_end?: string | null
  updated_at?: string | null
}

export interface SubscriptionUpdate {
  cancel_at_period_end?: boolean | null
  created_at?: string | null
  current_period_end?: string
  current_period_start?: string
  customer_id?: string
  id?: string
  metadata?: Json | null
  plan_id?: string
  salon_id?: string
  status?: string
  stripe_subscription_id?: string | null
  trial_end?: string | null
  updated_at?: string | null
}

export type SubscriptionRelationships = [
  {
    foreignKeyName: "subscriptions_salon_id_fkey"
    columns: ["salon_id"]
    isOneToOne: false
    referencedRelation: "salons"
    referencedColumns: ["id"]
  }
]