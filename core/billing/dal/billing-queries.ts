import { createClient } from "@/lib/supabase/server";
import type {
  Billing,
  BillingFilters,
  Invoice,
  PaymentMethod,
  BillingStats,
  Subscription,
} from "./billing-types";

export async function getBillings(
  filters: BillingFilters = {},
): Promise<Billing[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("billing")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.salon_id) {
    query = query.eq("salon_id", filters.salon_id);
  }

  if (filters.customer_id) {
    query = query.eq("customer_id", filters.customer_id);
  }

  if (filters.subscription_id) {
    query = query.eq("subscription_id", filters.subscription_id);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.from_date) {
    query = query.gte("created_at", filters.from_date);
  }

  if (filters.to_date) {
    query = query.lte("created_at", filters.to_date);
  }

  if (filters.search) {
    query = query.or(`description.ilike.%${filters.search}%,stripe_payment_intent_id.ilike.%${filters.search}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as unknown as Billing[];
}

export async function getBillingById(id: string): Promise<Billing | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("billing")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as Billing;
}

export async function getInvoicesByBilling(
  billingId: string,
): Promise<Invoice[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("billing_id", billingId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Fetch line items separately for each invoice
  const invoicesWithLineItems = await Promise.all(
    (data || []).map(async (invoice) => {
      const { data: lineItems } = await supabase
        .from("invoice_line_items")
        .select("*")
        .eq("invoice_id", invoice.id);
      return { ...invoice, line_items: lineItems || [] };
    })
  );

  return invoicesWithLineItems as unknown as Invoice[];
}

export async function getPaymentMethods(
  customerId: string,
): Promise<PaymentMethod[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as PaymentMethod[];
}

export async function getDefaultPaymentMethod(
  customerId: string,
): Promise<PaymentMethod | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("user_id", customerId)
    .eq("is_default", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as unknown as PaymentMethod;
}

export async function getBillingStats(salonId: string): Promise<BillingStats> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get total revenue
  const { data: totalRevenueData } = await supabase
    .from("billing")
    .select("amount")
    .eq("salon_id", salonId)
    .eq("status", "completed");

  const totalRevenue = totalRevenueData?.reduce((sum, billing) => sum + Number(billing.amount), 0) || 0;

  // Get monthly revenue (current month)
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: monthlyRevenueData } = await supabase
    .from("billing")
    .select("amount")
    .eq("salon_id", salonId)
    .eq("status", "completed")
    .gte("created_at", startOfMonth.toISOString());

  const monthlyRevenue = monthlyRevenueData?.reduce((sum, billing) => sum + Number(billing.amount), 0) || 0;

  // Get pending payments count
  const { count: pendingPayments } = await supabase
    .from("billing")
    .select("*", { count: "exact", head: true })
    .eq("salon_id", salonId)
    .eq("status", "pending");

  // Get failed payments count
  const { count: failedPayments } = await supabase
    .from("billing")
    .select("*", { count: "exact", head: true })
    .eq("salon_id", salonId)
    .eq("status", "failed");

  // Get active subscriptions count
  const { count: activeSubscriptions } = await (supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("salon_id", salonId)
    .eq("status", "active") as any);

  // Calculate churn rate (simplified - cancelled in last 30 days / active at start of period)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { count: cancelledSubscriptions } = await (supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("salon_id", salonId)
    .eq("status", "cancelled")
    .gte("updated_at", thirtyDaysAgo.toISOString()) as any);

  const churnRate = activeSubscriptions && activeSubscriptions > 0
    ? (cancelledSubscriptions || 0) / (activeSubscriptions + (cancelledSubscriptions || 0))
    : 0;

  return {
    total_revenue: totalRevenue,
    monthly_revenue: monthlyRevenue,
    pending_payments: pendingPayments || 0,
    failed_payments: failedPayments || 0,
    active_subscriptions: activeSubscriptions || 0,
    churn_rate: churnRate,
  };
}

export async function getUnpaidInvoices(
  customerId: string,
): Promise<Invoice[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // First get billing records for the customer
  const { data: billingRecords } = await supabase
    .from("billing")
    .select("id")
    .eq("customer_id", customerId);

  const billingIds = (billingRecords || []).map(b => b.id);

  if (billingIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .in("billing_id", billingIds)
    .in("status", ["pending", "overdue"])
    .order("due_date", { ascending: true });

  if (error) throw error;

  // Fetch line items separately
  const invoicesWithLineItems = await Promise.all(
    (data || []).map(async (invoice) => {
      const { data: lineItems } = await supabase
        .from("invoice_line_items")
        .select("*")
        .eq("invoice_id", invoice.id);
      return { ...invoice, line_items: lineItems || [] };
    })
  );

  return invoicesWithLineItems as unknown as Invoice[];
}

export async function getRevenueByDateRange(
  salonId: string,
  startDate: string,
  endDate: string,
): Promise<{ date: string; revenue: number }[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await (supabase
    .from("revenue_analytics")
    .select("date, total_revenue")
    .eq("salon_id", salonId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true }) as any);

  if (error) throw error;

  return (data || []).map((item: any) => ({
    date: item.date as string,
    revenue: Number(item.total_revenue) || 0,
  }));
}

// Additional query functions for comprehensive billing management

export async function getSubscriptionsByCustomer(
  customerId: string,
): Promise<Subscription[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await (supabase
    .from("subscriptions")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false }) as any);

  if (error) throw error;
  return (data || []) as unknown as Subscription[];
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice) throw error || new Error("Invoice not found");

  // Fetch line items separately
  const { data: lineItems } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", invoiceId);

  const data = { ...invoice, line_items: lineItems || [] };

  return data as unknown as Invoice;
}

export async function getMonthlyRecurringRevenue(
  salonId: string,
): Promise<number> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await (supabase
    .from("subscriptions")
    .select("metadata")
    .eq("salon_id", salonId)
    .eq("status", "active") as any);

  if (error) throw error;

  // Calculate MRR from subscription metadata (assuming monthly billing amounts are stored)
  return (data || []).reduce((total: number, subscription: any) => {
    const metadata = subscription.metadata as any;
    const monthlyAmount = metadata?.monthly_amount || 0;
    return total + Number(monthlyAmount);
  }, 0);
}
