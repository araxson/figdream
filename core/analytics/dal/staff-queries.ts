import { unstable_cache } from "next/cache";
import type { StaffMetrics, AnalyticsFilters, StaffPerformance } from "./analytics-types";
import { verifyAnalyticsAuth } from "./analytics-helpers";
import type { SupabaseClientTyped } from "./analytics-helpers";

/**
 * Get staff metrics for dashboard
 */
export async function getStaffMetrics(
  supabase: SupabaseClientTyped,
  salonId?: string,
  _startDate?: string,
  _endDate?: string
) {
  // Get staff performance from staff_performance view
  let performanceQuery = supabase.from("staff_performance").select("*");

  if (salonId) performanceQuery = performanceQuery.eq("salon_id", salonId);

  const { data: performance } = await performanceQuery;

  const { count } = await supabase
    .from("staff_profiles")
    .select("id", { count: "exact" })
    .eq(salonId ? "salon_id" : "true", salonId || "true");

  const utilization = performance?.length
    ? performance.reduce(
        (sum: number, p: any) =>
          sum + (p.utilization_rate || 0),
        0
      ) / performance.length
    : 0;

  // Map to StaffPerformance type
  const topPerformers: StaffPerformance[] = (performance || []).map((p: any) => ({
    id: p.staff_profile_id || p.id || '',
    staff_id: p.staff_id || p.user_id || '',
    staff_profile_id: p.staff_profile_id,
    period: p.period || 'current',
    appointments_count: p.total_appointments || 0,
    revenue_generated: p.total_revenue || 0,
    average_rating: p.average_rating,
    utilization_rate: p.utilization_rate,
    ...p
  }));

  return {
    total: count || 0,
    utilization,
    topPerformers,
  };
}

/**
 * Get individual staff performance metrics
 */
export async function getStaffPerformance(
  staffId: string
): Promise<StaffMetrics> {
  const { supabase } = await verifyAnalyticsAuth();

  // Cache staff performance for 10 minutes
  const getCachedPerformance = unstable_cache(
    async () => {
      const { data: performance } = await supabase
        .from("staff_performance")
        .select("*")
        .eq("staff_id", staffId)
        .single();

      if (!performance) throw new Error("Staff performance not found");

      const { data: profile } = await supabase
        .from("staff_profiles")
        .select("display_name")
        .eq("id", staffId)
        .single();

      const { data: topServices } = await supabase
        .from("appointment_services")
        .select(
          `
          service_id,
          quantity,
          unit_price
        `
        )
        .eq("staff_id", staffId)
        .limit(5);

      const cancellations =
        (performance.cancelled_by_staff || 0) +
        (performance.cancelled_by_customer || 0);
      const cancellationRate =
        performance?.total_appointments && performance.total_appointments > 0
          ? (cancellations / performance.total_appointments) * 100
          : 0;

      // Get service names separately
      const serviceIds =
        topServices?.map((s) => s.service_id).filter(Boolean) || [];
      const { data: services } =
        serviceIds.length > 0
          ? await supabase.from("services").select("id, name").in("id", serviceIds)
          : { data: [] };

      const serviceMap = new Map(services?.map((s) => [s.id, s.name]) || []);

      return {
        id: staffId,
        name: (profile as { display_name?: string })?.display_name || "Unknown",
        revenue: 0, // Staff performance view doesn't have revenue
        appointments: performance.total_appointments || 0,
        rating: performance.average_rating || 0,
        utilization: performance.utilization_rate || 0,
        rebookingRate: performance.rebook_rate || 0,
        cancellationRate,
        topServices:
          topServices?.map((s) => ({
            serviceId: s.service_id || "",
            serviceName: serviceMap.get(s.service_id) || "Unknown",
            count: Number(s.quantity) || 0,
            revenue: (Number(s.unit_price) || 0) * (Number(s.quantity) || 1),
          })) || [],
      };
    },
    ["staff-performance", staffId],
    {
      revalidate: 600, // Cache for 10 minutes
      tags: ["staff", `staff-${staffId}`],
    }
  );

  return getCachedPerformance();
}

/**
 * Get top performing staff members
 */
export async function getTopPerformers(
  supabase: SupabaseClientTyped,
  salonId?: string,
  metric: "revenue" | "appointments" | "rating" | "utilization" = "revenue",
  limit = 10
) {
  let query = supabase
    .from("staff_performance")
    .select("*")
    .limit(limit);

  if (salonId) query = query.eq("salon_id", salonId);

  // Order by appropriate metric
  switch (metric) {
    case "appointments":
      query = query.order("total_appointments", { ascending: false });
      break;
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    case "utilization":
      query = query.order("utilization_rate", { ascending: false });
      break;
    default:
      // For revenue, we'll need to calculate it separately
      query = query.order("total_appointments", { ascending: false });
  }

  const { data } = await query;

  // Get staff names from staff_profiles joined with profiles
  const staffIds = data?.map((s) => s.staff_id).filter(Boolean) || [];
  const { data: staffProfiles } =
    staffIds.length > 0
      ? await supabase
          .from("staff_profiles")
          .select(`
            id,
            user_id,
            title,
            profiles:user_id (
              display_name,
              full_name,
              email
            )
          `)
          .in("id", staffIds)
      : { data: [] };

  const profileMap = new Map(
    staffProfiles?.map((sp: any) => [
      sp.id,
      {
        name: sp.profiles?.display_name || sp.profiles?.full_name || sp.title || "Unknown",
        email: sp.profiles?.email || ""
      }
    ]) || []
  );

  return (
    data?.map((staff) => ({
      id: staff.staff_id,
      name: profileMap.get(staff.staff_id)?.name || "Unknown",
      email: profileMap.get(staff.staff_id)?.email || "",
      appointments: staff.total_appointments || 0,
      rating: staff.average_rating || 0,
      utilization: staff.utilization_rate || 0,
      rebookRate: staff.rebook_rate || 0,
      cancelled: (staff.cancelled_by_staff || 0) + (staff.cancelled_by_customer || 0),
    })) || []
  );
}

/**
 * Get staff utilization over time
 */
export async function getStaffUtilization(
  filters: AnalyticsFilters = {}
) {
  const { supabase } = await verifyAnalyticsAuth();
  const { salonId, staffId, startDate, endDate } = filters;

  let query = supabase
    .from("appointments")
    .select("staff_id, start_time, end_time, status");

  if (salonId) query = query.eq("salon_id", salonId);
  if (staffId) query = query.eq("staff_id", staffId);
  if (startDate) query = query.gte("start_time", startDate);
  if (endDate) query = query.lte("start_time", endDate);

  query = query.eq("status", "completed");

  const { data } = await query;

  // Calculate utilization by staff
  const utilizationByStaff = new Map<string, { booked: number; available: number }>();

  data?.forEach((appt) => {
    if (!appt.staff_id || !appt.start_time || !appt.end_time) return;

    const duration =
      (new Date(appt.end_time).getTime() - new Date(appt.start_time).getTime()) /
      (1000 * 60); // Duration in minutes

    const current = utilizationByStaff.get(appt.staff_id) || { booked: 0, available: 480 }; // 8 hours default
    current.booked += duration;
    utilizationByStaff.set(appt.staff_id, current);
  });

  // Convert to utilization percentages
  const utilization = Array.from(utilizationByStaff.entries()).map(([staffId, data]) => ({
    staffId,
    utilization: (data.booked / data.available) * 100,
    bookedMinutes: data.booked,
    availableMinutes: data.available,
  }));

  return utilization;
}

/**
 * Get staff earnings/revenue
 */
export async function getStaffRevenue(
  supabase: SupabaseClientTyped,
  staffId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from("appointments")
    .select("total_amount, created_at")
    .eq("staff_id", staffId)
    .eq("status", "completed");

  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data } = await query;

  const revenue =
    data?.reduce(
      (sum, a) => sum + (Number(a.total_amount) || 0),
      0
    ) || 0;

  // Tips field doesn't exist in appointments table
  const tips = 0;

  return {
    totalRevenue: revenue,
    tips,
    serviceRevenue: revenue - tips,
    appointmentCount: data?.length || 0,
    averageTicket: data?.length ? revenue / data.length : 0,
  };
}