import { unstable_cache } from "next/cache";
import type { AnalyticsFilters } from "./analytics-types";
import { verifyAnalyticsAuth } from "./analytics-helpers";
import type { SupabaseClientTyped } from "./analytics-helpers";

/**
 * Get service metrics for a salon
 */
export async function getServiceMetrics(
  supabase: SupabaseClientTyped,
  salonId?: string,
  _startDate?: string,
  _endDate?: string
) {
  // Get total services count
  let servicesQuery = supabase
    .from("services")
    .select("id", { count: "exact" });

  if (salonId) servicesQuery = servicesQuery.eq("salon_id", salonId);

  const { count: totalServices } = await servicesQuery;

  // Get popular services with their analytics
  let popularQuery = supabase.from("services").select("*").limit(5);

  if (salonId) popularQuery = popularQuery.eq("salon_id", salonId);

  const { data: popularServices } = await popularQuery;

  // Get service usage from appointment_services
  const appointmentServicesQuery = supabase
    .from("appointment_services")
    .select("service_id, quantity, unit_price");

  const { data: appointmentServices } = await appointmentServicesQuery;

  // Calculate revenue from appointment services
  const revenue =
    appointmentServices?.reduce(
      (
        sum: number,
        s: { unit_price?: number | null; quantity?: number | null }
      ) => sum + (Number(s.unit_price) || 0) * (Number(s.quantity) || 1),
      0
    ) || 0;

  return {
    total: totalServices || 0,
    popular: popularServices || [],
    revenue,
  };
}

/**
 * Get salon-specific analytics
 */
export async function getSalonAnalytics(
  salonId: string,
  filters: AnalyticsFilters = {}
) {
  const { supabase } = await verifyAnalyticsAuth();
  const { startDate, endDate } = filters;

  // Cache salon analytics for 10 minutes
  const getCachedAnalytics = unstable_cache(
    async () => {
      // Get salon details
      const { data: salon } = await supabase
        .from("salons")
        .select("*")
        .eq("id", salonId)
        .single();

      if (!salon) throw new Error("Salon not found");

      // Get appointment stats
      let appointmentsQuery = supabase
        .from("appointments")
        .select("id, status, total_amount")
        .eq("salon_id", salonId);

      if (startDate) appointmentsQuery = appointmentsQuery.gte("start_time", startDate);
      if (endDate) appointmentsQuery = appointmentsQuery.lte("start_time", endDate);

      const { data: appointments } = await appointmentsQuery;

      // Get staff count
      const { count: staffCount } = await supabase
        .from("staff_profiles")
        .select("id", { count: "exact" })
        .eq("salon_id", salonId);

      // Get service count
      const { count: serviceCount } = await supabase
        .from("services")
        .select("id", { count: "exact" })
        .eq("salon_id", salonId);

      // Get customer data from appointments
      const { data: customerData } = await supabase
        .from("appointments")
        .select("customer_id")
        .eq("salon_id", salonId);

      const uniqueCustomers = new Set(customerData?.map(a => a.customer_id).filter(Boolean));
      const customerAnalytics = Array.from(uniqueCustomers).map(id => ({ customer_id: id }));

      // Calculate metrics
      const totalRevenue =
        appointments?.reduce(
          (sum, a) => sum + (Number(a.total_amount) || 0),
          0
        ) || 0;

      const completedAppointments =
        appointments?.filter((a) => a.status === "completed").length || 0;

      const cancelledAppointments =
        appointments?.filter((a) => a.status === "cancelled").length || 0;

      const totalAppointments = appointments?.length || 0;
      const completionRate =
        totalAppointments > 0
          ? (completedAppointments / totalAppointments) * 100
          : 0;

      return {
        salon: {
          id: salon.id,
          name: salon.business_name,
          status: salon.is_active ? "active" : "inactive",
        },
        metrics: {
          revenue: totalRevenue,
          appointments: totalAppointments,
          completedAppointments,
          cancelledAppointments,
          completionRate,
          staffCount: staffCount || 0,
          serviceCount: serviceCount || 0,
          customerCount: customerAnalytics?.length || 0,
        },
      };
    },
    ["salon-analytics", salonId, startDate || "no-start", endDate || "no-end"],
    {
      revalidate: 600, // Cache for 10 minutes
      tags: ["salon", `salon-${salonId}`],
    }
  );

  return getCachedAnalytics();
}

/**
 * Compare salon performance across multiple salons
 */
export async function compareSalons(
  salonIds: string[],
  filters: AnalyticsFilters = {}
) {
  const { supabase } = await verifyAnalyticsAuth();
  const { startDate, endDate } = filters;

  const comparisons = await Promise.all(
    salonIds.map(async (salonId) => {
      // Get appointment stats
      let query = supabase
        .from("appointments")
        .select("total_amount, status")
        .eq("salon_id", salonId)
        .eq("status", "completed");

      if (startDate) query = query.gte("start_time", startDate);
      if (endDate) query = query.lte("start_time", endDate);

      const { data: appointments } = await query;

      const revenue =
        appointments?.reduce(
          (sum, a) => sum + (Number(a.total_amount) || 0),
          0
        ) || 0;

      // Get salon name
      const { data: salon } = await supabase
        .from("salons")
        .select("business_name")
        .eq("id", salonId)
        .single();

      return {
        salonId,
        salonName: salon?.business_name || "Unknown",
        revenue,
        appointments: appointments?.length || 0,
        averageTicket: appointments?.length ? revenue / appointments.length : 0,
      };
    })
  );

  // Sort by revenue
  comparisons.sort((a, b) => b.revenue - a.revenue);

  return comparisons;
}

/**
 * Get salon occupancy/capacity metrics
 */
export async function getSalonOccupancy(
  salonId: string,
  date?: string
) {
  const { supabase } = await verifyAnalyticsAuth();

  const targetDate = date || new Date().toISOString().split("T")[0];

  // Get all appointments for the day
  const { data: appointments } = await supabase
    .from("appointments")
    .select("start_time, end_time, staff_id")
    .eq("salon_id", salonId)
    .gte("start_time", `${targetDate}T00:00:00`)
    .lte("start_time", `${targetDate}T23:59:59`)
    .in("status", ["confirmed", "in_progress", "completed"]);

  // Get staff count for capacity calculation
  const { count: staffCount } = await supabase
    .from("staff_profiles")
    .select("id", { count: "exact" })
    .eq("salon_id", salonId)
    .eq("is_active", true);

  // Calculate total booked minutes
  let totalBookedMinutes = 0;
  appointments?.forEach((appt) => {
    if (appt.start_time && appt.end_time) {
      const duration =
        (new Date(appt.end_time).getTime() - new Date(appt.start_time).getTime()) /
        (1000 * 60);
      totalBookedMinutes += duration;
    }
  });

  // Calculate capacity (8 hours per staff member)
  const totalCapacityMinutes = (staffCount || 1) * 8 * 60;
  const occupancyRate = (totalBookedMinutes / totalCapacityMinutes) * 100;

  return {
    date: targetDate,
    occupancyRate: Math.min(100, occupancyRate),
    bookedMinutes: totalBookedMinutes,
    capacityMinutes: totalCapacityMinutes,
    staffCount: staffCount || 0,
    appointmentCount: appointments?.length || 0,
  };
}

/**
 * Get salon growth metrics
 */
export async function getSalonGrowth(
  salonId: string,
  period = 30
) {
  const { supabase } = await verifyAnalyticsAuth();

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // Get appointment metrics for the period
  const { data: appointmentData } = await supabase
    .from("appointments")
    .select("created_at, customer_id, status")
    .eq("salon_id", salonId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at");

  // Group by date to create daily metrics
  const dailyMetrics = new Map<string, any>();
  appointmentData?.forEach(apt => {
    const date = apt.created_at.split('T')[0];
    if (!dailyMetrics.has(date)) {
      dailyMetrics.set(date, {
        metric_date: date,
        total_appointments: 0,
        new_customers: new Set(),
        completed: 0
      });
    }
    const metric = dailyMetrics.get(date);
    metric.total_appointments++;
    if (apt.customer_id) metric.new_customers.add(apt.customer_id);
    if (apt.status === 'completed') metric.completed++;
  });

  const metrics = Array.from(dailyMetrics.values()).map(m => ({
    ...m,
    new_customers: m.new_customers.size
  }));

  // Calculate growth trends
  const appointments = metrics?.map((m) => m.total_appointments || 0) || [];
  const newCustomers = metrics?.map((m) => m.new_customers || 0) || [];

  // Simple linear regression for trend
  const calculateTrend = (values: number[]) => {
    if (values.length < 2) return 0;
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    return ((secondAvg - firstAvg) / firstAvg) * 100;
  };

  return {
    appointmentGrowth: calculateTrend(appointments),
    customerGrowth: calculateTrend(newCustomers),
    totalAppointments: appointments.reduce((a, b) => a + b, 0),
    totalNewCustomers: newCustomers.reduce((a, b) => a + b, 0),
    dailyAverage: {
      appointments: appointments.length ? appointments.reduce((a, b) => a + b, 0) / appointments.length : 0,
      newCustomers: newCustomers.length ? newCustomers.reduce((a, b) => a + b, 0) / newCustomers.length : 0,
    },
  };
}