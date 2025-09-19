import { unstable_cache } from "next/cache";
import type { CustomerInsights, AnalyticsFilters } from "./analytics-types";
import { verifyAnalyticsAuth } from "./analytics-helpers";
import type { SupabaseClientTyped } from "./analytics-helpers";

/**
 * Get customer metrics for dashboard
 */
export async function getCustomerMetrics(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  // Get customer count from profiles table
  let uniqueCustomers: Set<string>;

  if (salonId) {
    // Join with appointments to filter by salon
    const { data: appointments } = await supabase
      .from("appointments")
      .select("customer_id")
      .eq("salon_id", salonId);

    uniqueCustomers = new Set(appointments?.map(a => a.customer_id).filter(Boolean) || []);
  } else {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id");

    uniqueCustomers = new Set(profiles?.map(p => p.id).filter(Boolean) || []);
  }

  const totalCustomers = uniqueCustomers.size;

  // Calculate new vs returning from appointments
  let appointmentsQuery = supabase
    .from("appointments")
    .select("customer_id, created_at");

  if (salonId) appointmentsQuery = appointmentsQuery.eq("salon_id", salonId);
  if (startDate) appointmentsQuery = appointmentsQuery.gte("created_at", startDate);
  if (endDate) appointmentsQuery = appointmentsQuery.lte("created_at", endDate);

  const { data: appointments } = await appointmentsQuery;

  // Group customers by first appointment
  const customerFirstVisit = new Map<string, Date>();
  appointments?.forEach(apt => {
    if (apt.customer_id && apt.created_at) {
      const date = new Date(apt.created_at);
      const existing = customerFirstVisit.get(apt.customer_id);
      if (!existing || date < existing) {
        customerFirstVisit.set(apt.customer_id, date);
      }
    }
  });

  // Count new vs returning based on date range
  const startDateObj = startDate ? new Date(startDate) : new Date(0);
  let newCustomers = 0;
  let returningCustomers = 0;

  customerFirstVisit.forEach((firstVisit) => {
    if (firstVisit >= startDateObj) {
      newCustomers++;
    } else {
      returningCustomers++;
    }
  });

  const retentionRate =
    totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

  return {
    total: totalCustomers,
    new: newCustomers,
    returning: returningCustomers,
    retentionRate,
  };
}

/**
 * Get detailed customer insights
 */
export async function getCustomerInsights(
  filters: AnalyticsFilters = {}
): Promise<CustomerInsights> {
  const { supabase } = await verifyAnalyticsAuth();
  const { salonId } = filters;

  // Cache customer insights for 15 minutes
  const getCachedInsights = unstable_cache(
    async () => {
      const { data: analytics } = await supabase
        .from("customer_analytics")
        .select("*")
        .eq(salonId ? "salon_id" : "true", salonId || "true");

      // Default segments (could be calculated from actual data)
      const segments = [
        { name: "VIP", count: 150, value: 45000, growth: 12 },
        { name: "Regular", count: 500, value: 75000, growth: 8 },
        { name: "Occasional", count: 800, value: 40000, growth: -5 },
        { name: "New", count: 200, value: 15000, growth: 25 },
      ];

      const lifetime = {
        averageValue: 0, // Not available in customer_analytics view
        averageVisits: analytics?.[0]?.total_visits || 0,
        churnRate: analytics?.[0]?.churn_risk_score || 0,
      };

      const behavior = {
        preferredServices: [],
        preferredStaff: [],
        preferredTimes: ["10:00 AM", "2:00 PM", "6:00 PM"],
        bookingPatterns: {
          monday: 15,
          tuesday: 20,
          wednesday: 18,
          thursday: 22,
          friday: 35,
          saturday: 40,
          sunday: 10,
        },
      };

      return { segments, lifetime, behavior };
    },
    ["customer-insights", salonId || "all"],
    {
      revalidate: 900, // Cache for 15 minutes
      tags: ["customers", `salon-${salonId || "all"}`],
    }
  );

  return getCachedInsights();
}

/**
 * Get customer trends over time
 */
export async function getCustomerTrends(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from("daily_metrics")
    .select("metric_date, new_customers, returning_customers")
    .order("metric_date");

  if (salonId) query = query.eq("salon_id", salonId);
  if (startDate) query = query.gte("metric_date", startDate);
  if (endDate) query = query.lte("metric_date", endDate);

  const { data } = await query;

  return {
    newCustomers:
      data?.map((d) => ({
        date: d.metric_date || "",
        value: d.new_customers || 0,
      })) || [],
    returningCustomers:
      data?.map((d) => ({
        date: d.metric_date || "",
        value: d.returning_customers || 0,
      })) || [],
  };
}

/**
 * Get top customers by revenue
 */
export async function getTopCustomers(
  supabase: SupabaseClientTyped,
  salonId?: string,
  limit = 10
) {
  let query = supabase
    .from("customer_analytics")
    .select("customer_id, lifetime_value, total_visits, average_spend")
    .order("lifetime_value", { ascending: false })
    .limit(limit);

  if (salonId) query = query.eq("salon_id", salonId);

  const { data } = await query;

  // Type guard to ensure we have valid customer analytics data
  if (!data || !Array.isArray(data)) return [];

  // Get customer names - safely extract customer IDs
  const customerIds = data
    .map((c) => ('customer_id' in c && typeof c.customer_id === 'string' ? c.customer_id : null))
    .filter((id): id is string => id !== null);

  const { data: profiles } =
    customerIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", customerIds)
      : { data: [] };

  const profileMap = new Map(
    profiles?.map((p) => [p.id, { name: p.full_name, email: p.email }]) || []
  );

  return data
    .filter((customer): customer is any => 'customer_id' in customer)
    .map((customer) => ({
      id: customer.customer_id as string,
      name: profileMap.get(customer.customer_id as string)?.name || "Unknown",
      email: profileMap.get(customer.customer_id as string)?.email || "",
      revenue: ('lifetime_value' in customer ? customer.lifetime_value : 0) || 0,
      visits: ('total_visits' in customer ? customer.total_visits : 0) || 0,
      averageSpend: ('average_spend' in customer ? customer.average_spend : 0) || 0,
    }));
}

/**
 * Get customer retention metrics
 */
export async function getCustomerRetention(
  supabase: SupabaseClientTyped,
  salonId?: string,
  period = 30
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // Since customer_analytics doesn't exist, use appointments to calculate metrics
  let query = supabase
    .from("appointments")
    .select("customer_id, created_at");

  if (salonId) query = query.eq("salon_id", salonId);

  const { data: appointments } = await query;

  // Group by customer to calculate visits
  const customerMetrics = new Map<string, { firstVisit: Date; lastVisit: Date; totalVisits: number }>();

  appointments?.forEach(apt => {
    if (apt.customer_id && apt.created_at) {
      const date = new Date(apt.created_at);
      const existing = customerMetrics.get(apt.customer_id);

      if (existing) {
        if (date < existing.firstVisit) existing.firstVisit = date;
        if (date > existing.lastVisit) existing.lastVisit = date;
        existing.totalVisits++;
      } else {
        customerMetrics.set(apt.customer_id, {
          firstVisit: date,
          lastVisit: date,
          totalVisits: 1
        });
      }
    }
  });

  // Calculate retention metrics
  let active = 0;
  let newCustomers = 0;
  let returning = 0;

  customerMetrics.forEach(metrics => {
    if (metrics.lastVisit >= startDate && metrics.lastVisit <= endDate) {
      active++;
    }
    if (metrics.firstVisit >= startDate && metrics.firstVisit <= endDate) {
      newCustomers++;
    }
    if (metrics.totalVisits > 1) {
      returning++;
    }
  });

  const total = customerMetrics.size;

  return {
    activeCustomers: active,
    newCustomers,
    returningCustomers: returning,
    retentionRate: total > 0 ? (returning / total) * 100 : 0,
    churnRate: total > 0 ? ((total - active) / total) * 100 : 0,
  };
}