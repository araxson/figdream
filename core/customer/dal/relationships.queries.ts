import { createClient } from "@/lib/supabase/server";
import type {
  CustomerWithAppointments,
  CustomerPreferenceFilters,
  CustomerFavoriteFilters,
  CustomerFavoriteWithDetails,
} from "./customers-types";

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