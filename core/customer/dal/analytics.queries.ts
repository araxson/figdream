import { createClient } from "@/lib/supabase/server";
import type { CustomerMetrics, CustomerInsights } from "./customers-types";

/**
 * Get customer metrics for a salon
 */
export async function getCustomerMetrics(
  salonId?: string,
): Promise<CustomerMetrics> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get total customers
  let customersQuery = supabase
    .from("appointments")
    .select("customer_id", { count: "exact", head: true });

  if (salonId) {
    customersQuery = customersQuery.eq("salon_id", salonId);
  }

  const { count: totalCustomers } = await customersQuery;

  // Get new customers this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newCustomersQuery = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  const { count: newCustomers } = await newCustomersQuery;

  // Get returning customers (simplified - customers with more than 1 appointment)
  // This would need a more complex query in production
  const returningCustomers = Math.floor((totalCustomers || 0) * 0.7); // Mock calculation

  // Get top spenders (simplified)
  const { data: topSpenders } = await supabase
    .from("profiles")
    .select("*")
    .limit(5);

  // Get most loyal customers (simplified)
  const { data: mostLoyal } = await supabase
    .from("profiles")
    .select("*")
    .limit(5);

  return {
    total_customers: totalCustomers || 0,
    new_customers_this_month: newCustomers || 0,
    returning_customers: returningCustomers,
    average_lifetime_value: 450, // Mock value
    top_spenders: topSpenders || [],
    most_loyal: mostLoyal || [],
  };
}

/**
 * Get customer insights
 */
export async function getCustomerInsights(
  customerId: string,
): Promise<CustomerInsights> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Get customer appointments to analyze patterns
  const { data: appointments } = await supabase
    .from("appointments")
    .select(
      `
      *,
      service:services(name),
      staff:staff_profiles(
        user:profiles!staff_profiles_user_id_fkey(display_name)
      )
    `,
    )
    .eq("customer_id", customerId)
    .eq("status", "completed")
    .order("start_time", { ascending: false });

  if (!appointments || appointments.length === 0) {
    return {
      customer_id: customerId,
      preferred_services: [],
      preferred_staff: [],
      preferred_times: [],
      average_spend: 0,
      visit_frequency: 0,
      last_visit: new Date().toISOString(),
      churn_risk: "low",
    };
  }

  // Analyze patterns
  const serviceFrequency: Record<string, number> = {};
  const staffFrequency: Record<string, number> = {};
  const timeFrequency: Record<string, number> = {};
  let totalSpend = 0;

  appointments.forEach((apt) => {
    // Track services - simplified without relationships
    // In production, you'd join with services table
    const serviceId = (apt as unknown as { service_id?: string }).service_id;
    if (serviceId) {
      serviceFrequency[serviceId] = (serviceFrequency[serviceId] || 0) + 1;
    }

    // Track staff - simplified without relationships
    // In production, you'd join with staff_profiles table
    const staffId = (apt as unknown as { staff_id?: string }).staff_id;
    if (staffId) {
      staffFrequency[staffId] = (staffFrequency[staffId] || 0) + 1;
    }

    // Track preferred times
    if (apt.start_time) {
      const hour = new Date(apt.start_time).getHours();
      const timeSlot =
        hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
      timeFrequency[timeSlot] = (timeFrequency[timeSlot] || 0) + 1;
    }

    // Calculate spend
    totalSpend += Number(apt.total_amount) || 0;
  });

  // Sort and get top preferences
  const topServices = Object.entries(serviceFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([service]) => service);

  const topStaff = Object.entries(staffFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([staff]) => staff);

  const topTimes = Object.entries(timeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([time]) => time);

  // Calculate churn risk based on last visit
  let churnRisk: "low" | "medium" | "high" = "low";
  let lastVisitStr = new Date().toISOString();

  if (appointments.length > 0 && appointments[0].start_time) {
    const lastVisit = new Date(appointments[0].start_time);
    const daysSinceLastVisit = Math.floor(
      (Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24),
    );
    churnRisk =
      daysSinceLastVisit > 90
        ? "high"
        : daysSinceLastVisit > 60
          ? "medium"
          : "low";
    lastVisitStr = appointments[0].start_time;
  }

  return {
    customer_id: customerId,
    preferred_services: topServices,
    preferred_staff: topStaff,
    preferred_times: topTimes,
    average_spend:
      appointments.length > 0 ? totalSpend / appointments.length : 0,
    visit_frequency: appointments.length,
    last_visit: lastVisitStr,
    churn_risk: churnRisk,
  };
}