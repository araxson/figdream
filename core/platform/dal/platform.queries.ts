import { unstable_cache } from "next/cache";
import type { DashboardMetrics, PerformanceMetrics, ChartData, AnalyticsFilters } from "./analytics-types";
import { verifyAnalyticsAuth } from "./analytics-helpers";
import { getRevenueMetrics } from "./revenue-queries";
import { getAppointmentMetrics } from "./appointment-queries";
import { getCustomerMetrics } from "./customer-queries";
import { getServiceMetrics } from "./salon-queries";
import { getStaffMetrics } from "./staff-queries";
import type { TrendData } from "./analytics-helpers";

/**
 * Get comprehensive dashboard metrics
 */
export async function getDashboardMetrics(
  filters: AnalyticsFilters = {}
): Promise<DashboardMetrics> {
  const { supabase } = await verifyAnalyticsAuth();
  const { salonId, startDate, endDate } = filters;

  // Cache dashboard metrics for 5 minutes
  const getCachedMetrics = unstable_cache(
    async () => {
      const [revenue, appointments, customers, services, staff] = await Promise.all(
        [
          getRevenueMetrics(supabase, salonId, startDate, endDate),
          getAppointmentMetrics(supabase, salonId, startDate, endDate),
          getCustomerMetrics(supabase, salonId, startDate, endDate),
          getServiceMetrics(supabase, salonId, startDate, endDate),
          getStaffMetrics(supabase, salonId, startDate, endDate),
        ],
      );

      return {
        revenue,
        appointments,
        customers,
        services,
        staff,
      };
    },
    ["dashboard-metrics", salonId || "all", startDate || "no-start", endDate || "no-end"],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: ["analytics", `salon-${salonId || "all"}`],
    }
  );

  return getCachedMetrics();
}

/**
 * Get performance metrics with KPIs and trends
 */
export async function getPerformanceMetrics(
  filters: AnalyticsFilters = {}
): Promise<PerformanceMetrics> {
  const { supabase } = await verifyAnalyticsAuth();
  const { salonId, startDate, endDate, period = "month" } = filters;

  const kpis = await getKPIs(supabase, salonId, startDate, endDate);
  const trends = await getTrends(supabase, salonId, startDate, endDate, period);
  const comparisons = await getComparisons(
    supabase,
    salonId,
    startDate,
    endDate
  );

  return { kpis, trends, comparisons };
}

/**
 * Get key performance indicators
 */
async function getKPIs(
  supabase: any,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  const metrics = await getDashboardMetrics({ salonId, startDate, endDate });

  return {
    revenue: metrics.revenue.total,
    appointments: metrics.appointments.total,
    customerSatisfaction: 4.5, // Placeholder - could be calculated from reviews
    efficiency: metrics.staff.utilization,
  };
}

/**
 * Get trends for various metrics
 */
async function getTrends(
  supabase: any,
  salonId?: string,
  startDate?: string,
  endDate?: string,
  _period = "daily"
) {
  // Get appointment trends from daily_metrics
  let metricsQuery = supabase
    .from("daily_metrics")
    .select("metric_date, total_appointments, new_customers")
    .order("metric_date");

  if (salonId) metricsQuery = metricsQuery.eq("salon_id", salonId);
  if (startDate) metricsQuery = metricsQuery.gte("metric_date", startDate);
  if (endDate) metricsQuery = metricsQuery.lte("metric_date", endDate);

  const { data: metricsData } = await metricsQuery;

  // Get revenue trends from appointments
  let revenueQuery = supabase
    .from("appointments")
    .select("created_at, total_amount")
    .eq("status", "completed");

  if (salonId) revenueQuery = revenueQuery.eq("salon_id", salonId);
  if (startDate) revenueQuery = revenueQuery.gte("created_at", startDate);
  if (endDate) revenueQuery = revenueQuery.lte("created_at", endDate);

  const { data: revenueData } = await revenueQuery;

  // Group revenue by date
  const revenueByDate: Record<string, number> = {};
  revenueData?.forEach(
    (appt: { created_at?: string | null; total_amount?: number | null }) => {
      const date = appt.created_at?.split("T")[0];
      if (date) {
        revenueByDate[date] =
          (revenueByDate[date] || 0) + (Number(appt.total_amount) || 0);
      }
    }
  );

  return {
    revenue: Object.entries(revenueByDate).map(([date, value]) => ({
      date,
      value,
    })),
    appointments:
      metricsData?.map((d: TrendData) => ({
        date: d.metric_date || "",
        value: d.total_appointments || 0,
      })) || [],
    newCustomers:
      metricsData?.map((d: TrendData) => ({
        date: d.metric_date || "",
        value: d.new_customers || 0,
      })) || [],
  };
}

/**
 * Get period comparisons
 */
async function getComparisons(
  supabase: any,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  if (!startDate || !endDate) {
    return {
      previousPeriod: { revenue: 0, appointments: 0, customers: 0 },
      yearOverYear: { revenue: 0, appointments: 0, customers: 0 },
    };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  // Previous period
  const prevStart = new Date(start.getTime() - diff);
  const prevEnd = new Date(end.getTime() - diff);

  // Get previous period metrics
  const { revenue: prevRevenue } = await getRevenueMetrics(
    supabase,
    salonId,
    prevStart.toISOString(),
    prevEnd.toISOString()
  );

  const { total: prevAppointments } = await getAppointmentMetrics(
    supabase,
    salonId,
    prevStart.toISOString(),
    prevEnd.toISOString()
  );

  const { total: prevCustomers } = await getCustomerMetrics(
    supabase,
    salonId,
    prevStart.toISOString(),
    prevEnd.toISOString()
  );

  // Year over year (simplified - just returning zeros for now)
  const yearOverYear = {
    revenue: 0,
    appointments: 0,
    customers: 0,
  };

  return {
    previousPeriod: {
      revenue: prevRevenue.total,
      appointments: prevAppointments,
      customers: prevCustomers,
    },
    yearOverYear,
  };
}

/**
 * Get chart data for various metrics
 */
export async function getChartData(
  type: "revenue" | "appointments" | "customers",
  filters: AnalyticsFilters = {}
): Promise<ChartData> {
  const { supabase } = await verifyAnalyticsAuth();
  const { salonId, startDate, endDate, period = "day" } = filters;

  // Use the correct view names
  const tableName = period === "month" ? "monthly_metrics" : "daily_metrics";

  let query = supabase
    .from(tableName as "daily_metrics" | "monthly_metrics")
    .select("*")
    .order("metric_date" as const);

  if (salonId) query = query.eq("salon_id", salonId);
  if (startDate) query = query.gte("date", startDate);
  if (endDate) query = query.lte("date", endDate);

  const { data } = await query;

  const labels = data?.map((d) => (d as TrendData).metric_date || "") || [];

  let datasets = [];

  switch (type) {
    case "revenue":
      // Revenue needs to be calculated from appointments as daily_metrics doesn't have it
      datasets = [
        {
          label: "Revenue",
          data: [], // Will need separate query to get revenue data
          backgroundColor: "rgba(59, 130, 246, 0.5)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 2,
        },
      ];
      break;
    case "appointments":
      datasets = [
        {
          label: "Appointments",
          data:
            data?.map((d) => (d as TrendData).total_appointments || 0) || [],
          backgroundColor: "rgba(34, 197, 94, 0.5)",
          borderColor: "rgb(34, 197, 94)",
          borderWidth: 2,
        },
      ];
      break;
    case "customers":
      datasets = [
        {
          label: "New Customers",
          data: data?.map((d) => (d as TrendData).new_customers || 0) || [],
          backgroundColor: "rgba(168, 85, 247, 0.5)",
          borderColor: "rgb(168, 85, 247)",
          borderWidth: 2,
        },
        {
          label: "Returning Customers",
          data:
            data?.map((d) => (d as TrendData).returning_customers || 0) || [],
          backgroundColor: "rgba(251, 146, 60, 0.5)",
          borderColor: "rgb(251, 146, 60)",
          borderWidth: 2,
        },
      ];
      break;
  }

  return { labels, datasets };
}

/**
 * Get platform-wide statistics (admin only)
 */
export async function getPlatformStatistics() {
  const { supabase } = await verifyAnalyticsAuth();

  // Cache platform stats for 15 minutes
  const getCachedStats = unstable_cache(
    async () => {
      // Get total counts
      const [
        { count: totalSalons },
        { count: totalUsers },
        { count: totalAppointments },
        { count: totalStaff },
      ] = await Promise.all([
        supabase.from("salons").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("appointments").select("id", { count: "exact" }),
        supabase.from("staff_profiles").select("id", { count: "exact" }),
      ]);

      // Get revenue total
      const { data: appointments } = await supabase
        .from("appointments")
        .select("total_amount")
        .eq("status", "completed");

      const totalRevenue =
        appointments?.reduce(
          (sum, a) => sum + (Number(a.total_amount) || 0),
          0
        ) || 0;

      // Get active salons (had appointments in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeSalonData } = await supabase
        .from("appointments")
        .select("salon_id")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const activeSalons = new Set(activeSalonData?.map((a) => a.salon_id)).size;

      return {
        totals: {
          salons: totalSalons || 0,
          users: totalUsers || 0,
          appointments: totalAppointments || 0,
          staff: totalStaff || 0,
          revenue: totalRevenue,
        },
        activity: {
          activeSalons,
          activeRate: totalSalons ? (activeSalons / totalSalons) * 100 : 0,
        },
      };
    },
    ["platform-statistics"],
    {
      revalidate: 900, // Cache for 15 minutes
      tags: ["platform"],
    }
  );

  return getCachedStats();
}