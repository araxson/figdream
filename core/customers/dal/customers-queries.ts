import { createClient } from "@/lib/supabase/server";
import type {
  CustomerFilters,
  CustomerProfileWithRelations,
  CustomerPreferenceFilters,
  CustomerFavoriteFilters,
  CustomerFavoriteWithDetails,
  CustomerMetrics,
  CustomerInsights,
  CustomerWithAppointments,
} from "./customers-types";

/**
 * Get all customers with filters
 */
export async function getCustomers(filters: CustomerFilters = {}) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_preferences, customer_favorites, customer_notes, loyalty_points tables need to be added to database
  let query = supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Apply filters
  if (filters.search) {
    query = query.or(
      `display_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
    );
  }
  if (filters.created_after) {
    query = query.gte("created_at", filters.created_after);
  }
  if (filters.created_before) {
    query = query.lte("created_at", filters.created_before);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Mock the related data until tables are available
  const profilesWithRelations = (data || []).map((profile) => ({
    ...profile,
    customer_preferences: [],
    customer_favorites: [],
    customer_notes: [],
    loyalty_points: undefined,
  }));

  return profilesWithRelations as CustomerProfileWithRelations[];
}

/**
 * Get a single customer by ID
 */
export async function getCustomerById(id: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_preferences, customer_favorites, customer_notes, loyalty_points tables need to be added to database
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  // Mock the related data until tables are available
  const profileWithRelations = {
    ...data,
    customer_preferences: [],
    customer_favorites: [],
    customer_notes: [],
    loyalty_points: undefined,
  };

  return profileWithRelations as CustomerProfileWithRelations;
}

/**
 * Get customer with appointments
 */
export async function getCustomerWithAppointments(
  customerId: string,
  limit = 10,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: customer, error: customerError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", customerId)
    .single();

  if (customerError) throw customerError;

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select("*")
    .eq("customer_id", customerId)
    .order("start_time", { ascending: false })
    .limit(limit);

  if (appointmentsError) throw appointmentsError;

  // For now, return simplified data without relationships
  const simplifiedAppointments = (appointments || []).map((apt) => ({
    id: apt.id,
    start_time: apt.start_time,
    end_time: apt.end_time,
    status: apt.status,
    total_amount: apt.total_amount || 0,
  }));

  return {
    ...customer,
    appointments: simplifiedAppointments,
  } as CustomerWithAppointments;
}

/**
 * Get customer preferences
 */
export async function getCustomerPreferences(
  filters: CustomerPreferenceFilters = {},
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_preferences table needs to be added to database
  // Return mock data for now
  return [];
}

/**
 * Get customer favorites
 */
export async function getCustomerFavorites(
  filters: CustomerFavoriteFilters = {},
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("customer_favorites")
    .select(`
      *,
      salon:salon_id (id, name, slug, rating_average),
      staff:staff_id (id, display_name, profile_image_url),
      service:service_id (id, name, duration_minutes, price)
    `)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (filters.salon_id) {
    query = query.eq("salon_id", filters.salon_id);
  }

  if (filters.staff_id) {
    query = query.eq("staff_id", filters.staff_id);
  }

  if (filters.service_id) {
    query = query.eq("service_id", filters.service_id);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`Failed to fetch customer favorites: ${error.message}`);
    return [];
  }

  return data || [];
}

/**
 * Get customer notes
 */
export async function getCustomerNotes(customerId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: customer_notes table needs to be added to database
  // Return mock data for now
  return [];
}

/**
 * Get customer loyalty points
 */
export async function getCustomerLoyaltyPoints(customerId: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: loyalty_points table needs to be added to database
  // Return mock data for now
  return null;
}

/**
 * Get customer loyalty transactions
 */
export async function getCustomerLoyaltyTransactions(
  customerId: string,
  limit = 20,
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // TODO: loyalty_transactions table needs to be added to database
  // Return mock data for now
  return [];
}

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

/**
 * Search customers
 */
export async function searchCustomers(query: string,
  limit = 10) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .or(
      `display_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`,
    )
    .limit(limit);

  if (error) throw error;
  return data;
}

/**
 * Get customer by email
 */
export async function getCustomerByEmail(email: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Get customer appointments
 */
export async function getCustomerAppointments(
  customerId: string,
  filters?: {
    status?: string[];
    limit?: number;
  }
) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("appointments")
    .select("*")
    .eq("customer_id", customerId)
    .order("start_time", { ascending: false });

  if (filters?.status) {
    query = query.in("status", filters.status);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
