"use server";

import { createClient } from "@/lib/supabase/server";

// Financial reporting and analytics functions

// Get revenue analytics for a specific period
export async function getRevenueAnalytics(
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    let query = supabase
      .from("billing")
      .select("*")
      .eq("status", "completed");

    // Filter by salon if provided
    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    // Filter by date range if provided
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data: billings, error } = await query;

    if (error) throw error;

    // Calculate analytics
    const totalRevenue = billings.reduce((sum, billing) => sum + billing.amount, 0);
    const totalTransactions = billings.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Group by currency
    const revenueByCurrency = billings.reduce((acc, billing) => {
      const currency = billing.currency || 'USD';
      acc[currency] = (acc[currency] || 0) + billing.amount;
      return acc;
    }, {} as Record<string, number>);

    // Group by payment method
    const revenueByPaymentMethod = billings.reduce((acc, billing) => {
      const metadata = billing.metadata as any;
      const paymentMethod = metadata?.payment_method || 'unknown';
      acc[paymentMethod] = (acc[paymentMethod] || 0) + billing.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      totals: {
        revenue: totalRevenue,
        transactions: totalTransactions,
        average_transaction_value: averageTransactionValue,
      },
      breakdown: {
        by_currency: revenueByCurrency,
        by_payment_method: revenueByPaymentMethod,
      },
      raw_data: billings,
    };
  } catch (error) {
    console.error("Error getting revenue analytics:", error);
    throw new Error("Failed to get revenue analytics");
  }
}

// Get subscription analytics
export async function getSubscriptionAnalytics(salonId?: string) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    let query = supabase
      .from("billing")
      .select("*");

    // Filter by salon if provided
    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data: billings, error } = await query;

    if (error) throw error;

    // Filter for subscriptions only
    const subscriptions = billings.filter(billing => {
      const metadata = billing.metadata as any;
      return metadata?.subscription_type === 'recurring';
    });

    // Calculate subscription metrics
    const activeSubscriptions = subscriptions.filter(sub => {
      const metadata = sub.metadata as any;
      return metadata?.status === 'active';
    });

    const cancelledSubscriptions = subscriptions.filter(sub => {
      const metadata = sub.metadata as any;
      return metadata?.status === 'canceled';
    });

    const totalMRR = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    // Group by plan
    const subscriptionsByPlan = activeSubscriptions.reduce((acc, sub) => {
      const metadata = sub.metadata as any;
      const planId = metadata?.plan_id || 'unknown';
      acc[planId] = (acc[planId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totals: {
        active_subscriptions: activeSubscriptions.length,
        cancelled_subscriptions: cancelledSubscriptions.length,
        total_subscriptions: subscriptions.length,
        monthly_recurring_revenue: totalMRR,
      },
      breakdown: {
        by_plan: subscriptionsByPlan,
      },
      churn_rate: subscriptions.length > 0 ? (cancelledSubscriptions.length / subscriptions.length) * 100 : 0,
    };
  } catch (error) {
    console.error("Error getting subscription analytics:", error);
    throw new Error("Failed to get subscription analytics");
  }
}

// Get payment method analytics
export async function getPaymentMethodAnalytics(salonId?: string) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    let query = supabase
      .from("billing")
      .select("*")
      .eq("status", "completed");

    // Filter by salon if provided
    if (salonId) {
      query = query.eq("salon_id", salonId);
    }

    const { data: billings, error } = await query;

    if (error) throw error;

    // Analyze payment methods
    const paymentMethodStats = billings.reduce((acc, billing) => {
      const metadata = billing.metadata as any;
      const stripePaymentIntent = metadata?.stripe_payment_intent;
      const paymentMethod = stripePaymentIntent?.payment_method_types?.[0] || 'unknown';

      if (!acc[paymentMethod]) {
        acc[paymentMethod] = {
          count: 0,
          total_amount: 0,
          average_amount: 0,
        };
      }

      acc[paymentMethod].count += 1;
      acc[paymentMethod].total_amount += billing.amount;
      acc[paymentMethod].average_amount = acc[paymentMethod].total_amount / acc[paymentMethod].count;

      return acc;
    }, {} as Record<string, { count: number; total_amount: number; average_amount: number }>);

    return {
      payment_methods: paymentMethodStats,
      total_transactions: billings.length,
    };
  } catch (error) {
    console.error("Error getting payment method analytics:", error);
    throw new Error("Failed to get payment method analytics");
  }
}

// Generate financial report
export async function generateFinancialReport(
  salonId?: string,
  startDate?: string,
  endDate?: string,
  includeRefunds = true
) {
  try {
    const supabase = await createClient();

    // MANDATORY: Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Get all relevant data in parallel
    const [revenueAnalytics, subscriptionAnalytics, paymentMethodAnalytics] = await Promise.all([
      getRevenueAnalytics(salonId, startDate, endDate),
      getSubscriptionAnalytics(salonId),
      getPaymentMethodAnalytics(salonId),
    ]);

    let refundData = null;
    if (includeRefunds) {
      // Get refund data
      let refundQuery = supabase
        .from("billing")
        .select("*")
        .eq("status", "refunded");

      if (salonId) {
        refundQuery = refundQuery.eq("salon_id", salonId);
      }
      if (startDate) {
        refundQuery = refundQuery.gte("created_at", startDate);
      }
      if (endDate) {
        refundQuery = refundQuery.lte("created_at", endDate);
      }

      const { data: refunds, error: refundError } = await refundQuery;

      if (!refundError && refunds) {
        const totalRefunded = refunds.reduce((sum, refund) => sum + refund.amount, 0);
        refundData = {
          total_refunded: totalRefunded,
          refund_count: refunds.length,
          refund_rate: revenueAnalytics.totals.transactions > 0
            ? (refunds.length / revenueAnalytics.totals.transactions) * 100
            : 0,
        };
      }
    }

    return {
      report_generated_at: new Date().toISOString(),
      report_generated_by: user.id,
      period: {
        start_date: startDate,
        end_date: endDate,
      },
      salon_id: salonId,
      revenue: revenueAnalytics,
      subscriptions: subscriptionAnalytics,
      payment_methods: paymentMethodAnalytics,
      refunds: refundData,
      summary: {
        net_revenue: revenueAnalytics.totals.revenue - (refundData?.total_refunded || 0),
        gross_revenue: revenueAnalytics.totals.revenue,
        total_refunded: refundData?.total_refunded || 0,
      },
    };
  } catch (error) {
    console.error("Error generating financial report:", error);
    throw new Error("Failed to generate financial report");
  }
}