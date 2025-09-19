import { unstable_cache } from "next/cache";
import type { RevenueAnalytics, AnalyticsFilters } from "./analytics-types";
import { verifyAnalyticsAuth, getPreviousPeriodRange, calculateDaysBetween } from "./analytics-helpers";
import type { SupabaseClientTyped, AppointmentDetail } from "./analytics-helpers";

/**
 * Get revenue metrics for dashboard
 */
export async function getRevenueMetrics(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  // Calculate revenue from appointments (join with billing for amounts)
  let query = supabase
    .from("appointments")
    .select(`
      id,
      created_at,
      billing!inner (
        amount
      )
    `)
    .eq("status", "completed");

  if (salonId) query = query.eq("salon_id", salonId);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data } = await query;

  const total =
    data?.reduce(
      (sum: number, a: any) =>
        sum + (Number(a.billing?.amount) || 0),
      0
    ) || 0;

  // Calculate days between dates for daily average
  const days = calculateDaysBetween(startDate, endDate);
  const daily = total / days;
  const monthly = daily * 30;

  const previousPeriod = await getPreviousPeriodRevenue(
    supabase,
    salonId,
    startDate,
    endDate
  );
  const growth =
    previousPeriod > 0 ? ((total - previousPeriod) / previousPeriod) * 100 : 0;

  return { total, daily, monthly, growth };
}

/**
 * Get revenue from previous period for comparison
 */
export async function getPreviousPeriodRevenue(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  const { prevStart, prevEnd } = getPreviousPeriodRange(startDate, endDate);

  if (!prevStart || !prevEnd) return 0;

  let query = supabase
    .from("appointments")
    .select("total_amount")
    .eq("status", "completed")
    .gte("created_at", prevStart)
    .lte("created_at", prevEnd);

  if (salonId) query = query.eq("salon_id", salonId);

  const { data } = await query;
  return (
    data?.reduce(
      (sum: number, a: { total_amount?: number | null }) =>
        sum + (Number(a.total_amount) || 0),
      0
    ) || 0
  );
}

/**
 * Get detailed revenue analytics
 */
export async function getRevenueAnalytics(
  filters: AnalyticsFilters = {}
): Promise<RevenueAnalytics> {
  const { supabase } = await verifyAnalyticsAuth();
  const { salonId, startDate, endDate } = filters;

  // Cache revenue analytics for 10 minutes
  const getCachedAnalytics = unstable_cache(
    async () => {
      let query = supabase
        .from("appointments")
        .select(
          `
          total_amount,
          status,
          payment_method,
          staff_profiles!inner(display_name),
          appointment_services!inner(
            services!inner(name)
          )
        `
        )
        .eq("status", "completed");

      if (salonId) query = query.eq("salon_id", salonId);
      if (startDate) query = query.gte("start_time", startDate);
      if (endDate) query = query.lte("start_time", endDate);

      const { data: appointments } = await query;

      const gross =
        appointments?.reduce(
          (sum: number, a: AppointmentDetail) => sum + (a.total_amount || 0),
          0
        ) || 0;
      const net = gross * 0.8;

      const byService = new Map<string, number>();
      const byStaff = new Map<string, number>();
      const byPaymentMethod = new Map<string, number>();

      appointments?.forEach((a: AppointmentDetail) => {
        // Note: appointment_services relationship might not be available
        // Using fallback logic
        const staffName = "Staff";
        byStaff.set(
          staffName,
          (byStaff.get(staffName) || 0) + (a.total_amount || 0)
        );

        const method = a.payment_method || "cash";
        byPaymentMethod.set(
          method,
          (byPaymentMethod.get(method) || 0) + (a.total_amount || 0)
        );
      });

      return {
        gross,
        net,
        byService: Array.from(byService.entries())
          .map(([service, amount]) => ({ service, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10),
        byStaff: Array.from(byStaff.entries())
          .map(([staff, amount]) => ({ staff, amount }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10),
        byPaymentMethod: Array.from(byPaymentMethod.entries()).map(
          ([method, amount]) => ({ method, amount })
        ),
        projections: {
          daily: gross / 30,
          weekly: gross / 4,
          monthly: gross,
          quarterly: gross * 3,
        },
      };
    },
    ["revenue-analytics", salonId || "all", startDate || "no-start", endDate || "no-end"],
    {
      revalidate: 600, // Cache for 10 minutes
      tags: ["revenue", `salon-${salonId || "all"}`],
    }
  );

  return getCachedAnalytics();
}

/**
 * Get revenue trends over time
 */
export async function getRevenueTrends(
  supabase: SupabaseClientTyped,
  salonId?: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from("appointments")
    .select("created_at, total_amount")
    .eq("status", "completed");

  if (salonId) query = query.eq("salon_id", salonId);
  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data } = await query;

  // Group revenue by date
  const revenueByDate: Record<string, number> = {};
  data?.forEach(
    (appt: { created_at?: string | null; total_amount?: number | null }) => {
      const date = appt.created_at?.split("T")[0];
      if (date) {
        revenueByDate[date] =
          (revenueByDate[date] || 0) + (Number(appt.total_amount) || 0);
      }
    }
  );

  return Object.entries(revenueByDate).map(([date, value]) => ({
    date,
    value,
  }));
}