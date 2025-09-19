import type { Database } from '@/types/database.types';
import type { InvoiceRow, InvoiceLineItemRow } from './billing.types';

// Database types with fallbacks for missing tables
export type Billing = Database['public']['Tables']['billing'] extends never
  ? any
  : Database['public']['Tables']['billing']['Row'];

export type Invoice = InvoiceRow; // Use local type definition
export type InvoiceLineItem = InvoiceLineItemRow; // Use local type definition

export type PaymentMethod = Database['public']['Tables']['payment_methods'] extends never
  ? any
  : Database['public']['Tables']['payment_methods']['Row'];

export type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export type RevenueAnalytics = Database['public']['Tables']['revenue_analytics'] extends never
  ? any
  : Database['public']['Tables']['revenue_analytics']['Row'];

// Invoice with relations
export interface InvoiceWithDetails extends Invoice {
  billing?: Billing;
  line_items?: InvoiceLineItem[];
  customer?: {
    id: string;
    email: string;
    full_name: string;
  };
  salon?: {
    id: string;
    name: string;
    address?: string;
  };
}

// Payment types
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partial';
export type PaymentMethodType = 'cash' | 'card' | 'bank_transfer' | 'paypal' | 'other';

export interface PaymentRecord {
  id?: string;
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  status: PaymentStatus;
  created_by?: string;
}

// Revenue report types
export interface RevenueReport {
  period: {
    start: string;
    end: string;
    type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  };
  totals: {
    gross_revenue: number;
    net_revenue: number;
    tax_collected: number;
    discounts_given: number;
    refunds_issued: number;
    tips_collected: number;
  };
  breakdown: {
    by_service: ServiceRevenue[];
    by_staff: StaffRevenue[];
    by_payment_method: PaymentMethodRevenue[];
    by_day: DailyRevenue[];
  };
  transactions: {
    count: number;
    average_value: number;
    highest_value: number;
    lowest_value: number;
  };
}

export interface ServiceRevenue {
  service_id: string;
  service_name: string;
  quantity_sold: number;
  total_revenue: number;
  average_price: number;
  percentage_of_total: number;
}

export interface StaffRevenue {
  staff_id: string;
  staff_name: string;
  services_performed: number;
  gross_revenue: number;
  commission_earned: number;
  tips_received: number;
  total_earnings: number;
}

export interface PaymentMethodRevenue {
  method: PaymentMethodType;
  transaction_count: number;
  total_amount: number;
  percentage: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
  services: number;
}

// Package and subscription types
export interface ServicePackage {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  validity_days: number;
  services: PackageService[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackageService {
  service_id: string;
  service_name: string;
  quantity: number;
  value: number;
}

export interface CustomerPackage {
  id: string;
  customer_id: string;
  package_id: string;
  package_name: string;
  purchase_date: string;
  expiry_date: string;
  remaining_services: PackageService[];
  status: 'active' | 'expired' | 'cancelled' | 'used';
  total_value: number;
  used_value: number;
}

// Financial summary types
export interface FinancialSummary {
  period: string;
  revenue: {
    appointments: number;
    packages: number;
    products: number;
    subscriptions: number;
    total: number;
  };
  expenses: {
    salaries: number;
    rent: number;
    supplies: number;
    utilities: number;
    marketing: number;
    other: number;
    total: number;
  };
  profit: {
    gross: number;
    net: number;
    margin_percentage: number;
  };
  outstanding: {
    receivables: number;
    payables: number;
  };
}

// Commission calculation
export interface CommissionCalculation {
  staff_id: string;
  period: {
    start: string;
    end: string;
  };
  base_amount: number;
  commission_rate: number;
  commission_amount: number;
  tips: number;
  deductions: number;
  total_earnings: number;
  services: CommissionService[];
}

export interface CommissionService {
  appointment_id: string;
  service_name: string;
  service_date: string;
  service_amount: number;
  commission_rate: number;
  commission_earned: number;
}

// Tax report types
export interface TaxReport {
  period: {
    start: string;
    end: string;
  };
  tax_collected: {
    sales_tax: number;
    service_tax: number;
    vat: number;
    total: number;
  };
  taxable_sales: number;
  exempt_sales: number;
  total_sales: number;
  transactions: TaxTransaction[];
}

export interface TaxTransaction {
  invoice_id: string;
  date: string;
  customer_name: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}

// Analytics types
export interface RevenueAnalysis {
  trends: {
    current_period: number;
    previous_period: number;
    growth_rate: number;
    projection_next_period: number;
  };
  peak_times: {
    best_day: string;
    best_hour: number;
    worst_day: string;
    worst_hour: number;
  };
  customer_metrics: {
    average_spend: number;
    lifetime_value: number;
    retention_rate: number;
    new_vs_returning: {
      new_percentage: number;
      returning_percentage: number;
    };
  };
  service_performance: {
    most_profitable: string;
    least_profitable: string;
    highest_demand: string;
    lowest_demand: string;
  };
}

// Form schemas
export interface CreateInvoiceInput {
  customer_id: string;
  salon_id: string;
  due_date: string;
  line_items: {
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate?: number;
    discount_percentage?: number;
  }[];
  notes?: string;
  send_email?: boolean;
}

export interface RecordPaymentInput {
  invoice_id: string;
  amount: number;
  payment_method: PaymentMethodType;
  payment_date: string;
  reference_number?: string;
  notes?: string;
}

export interface CreatePackageInput {
  name: string;
  description?: string;
  price: number;
  validity_days: number;
  services: {
    service_id: string;
    quantity: number;
  }[];
}

// Filter types
export interface InvoiceFilters {
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  customer_id?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
}

export interface RevenueFilters {
  salon_id?: string;
  date_from: string;
  date_to: string;
  group_by?: 'day' | 'week' | 'month' | 'year';
  include_refunds?: boolean;
}