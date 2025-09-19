import { unstable_cache } from "next/cache";
import type { HeatmapData, AnalyticsFilters } from "./analytics-types";
import { verifyAnalyticsAuth } from "./analytics-helpers";
import type { SupabaseClientTyped, AppointmentData, TrendData } from "./analytics-helpers";

/**
 * Get appointment metrics for dashboard
 */
export async function getAppointmentMetrics(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase.from("appointments").select("id, status");

  if (salonId) query = query.eq("salon_id", salonId);
  if (startDate) query = query.gte("start_time", startDate);
  if (endDate) query = query.lte("start_time", endDate);

  const { data } = await query;

  return {
    total: data?.length || 0,
    completed:
      data?.filter((a: AppointmentData) => a.status === "completed").length ||
      0,
    cancelled:
      data?.filter((a: AppointmentData) => a.status === "cancelled").length ||
      0,
    noShow:
      data?.filter((a: AppointmentData) => a.status === "no_show").length || 0,
  };
}

/**
 * Get appointment trends over time
 */
export async function getAppointmentTrends(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  // TODO: Implement daily_metrics table
  // For now, return mock data
  return {
    appointments: [],
    newCustomers: [],
  };
}

/**
 * Get booking heatmap showing popular booking times
 */
export async function getBookingHeatmap(
  salonId?: string
): Promise<HeatmapData> {
  const { supabase } = await verifyAnalyticsAuth();

  // Cache heatmap data for 30 minutes
  const getCachedHeatmap = unstable_cache(
    async () => {
      let query = supabase
        .from("appointments")
        .select("start_time")
        .eq("status", "completed");

      if (salonId) query = query.eq("salon_id", salonId);

      const { data: appointments } = await query;

      const heatmap = new Map<string, number>();

      appointments?.forEach((a) => {
        if (a.start_time) {
          const date = new Date(a.start_time);
          const day = date.getDay();
          const hour = date.getHours();
          const key = `${day}-${hour}`;
          heatmap.set(key, (heatmap.get(key) || 0) + 1);
        }
      });

      const data = Array.from(heatmap.entries()).map(([key, value]) => {
        const [day, hour] = key.split("-").map(Number);
        return { day, hour, value };
      });

      const values = data.map((d) => d.value);
      const max = Math.max(...values, 0);
      const min = Math.min(...values, 0);

      return { data, max, min };
    },
    ["booking-heatmap", salonId || "all"],
    {
      revalidate: 1800, // Cache for 30 minutes
      tags: ["heatmap", `salon-${salonId || "all"}`],
    }
  );

  return getCachedHeatmap();
}

/**
 * Get appointment comparisons with previous periods
 */
export async function getAppointmentComparisons(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  if (!startDate || !endDate) return { previousPeriod: 0, yearOverYear: 0 };

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();

  // Previous period
  const prevStart = new Date(start.getTime() - diff);
  const prevEnd = new Date(end.getTime() - diff);

  let prevQuery = supabase
    .from("appointments")
    .select("id", { count: "exact" })
    .gte("start_time", prevStart.toISOString())
    .lte("start_time", prevEnd.toISOString());

  if (salonId) prevQuery = prevQuery.eq("salon_id", salonId);

  const { count: previousPeriod } = await prevQuery;

  // Year over year
  const yearAgoStart = new Date(start);
  yearAgoStart.setFullYear(yearAgoStart.getFullYear() - 1);
  const yearAgoEnd = new Date(end);
  yearAgoEnd.setFullYear(yearAgoEnd.getFullYear() - 1);

  let yoyQuery = supabase
    .from("appointments")
    .select("id", { count: "exact" })
    .gte("start_time", yearAgoStart.toISOString())
    .lte("start_time", yearAgoEnd.toISOString());

  if (salonId) yoyQuery = yoyQuery.eq("salon_id", salonId);

  const { count: yearOverYear } = await yoyQuery;

  return {
    previousPeriod: previousPeriod || 0,
    yearOverYear: yearOverYear || 0,
  };
}

/**
 * Get appointment analytics by status
 */
export async function getAppointmentsByStatus(
  filters: AnalyticsFilters = {}
) {
  const { supabase } = await verifyAnalyticsAuth();
  const { salonId, startDate, endDate } = filters;

  let query = supabase
    .from("appointments")
    .select("status")
    .order("status");

  if (salonId) query = query.eq("salon_id", salonId);
  if (startDate) query = query.gte("start_time", startDate);
  if (endDate) query = query.lte("start_time", endDate);

  const { data } = await query;

  // Count by status
  const statusCounts = data?.reduce((acc, appt) => {
    const status = appt.status || "unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return statusCounts || {};
}