import { createClient } from "@/lib/supabase/server";
import type {
  CustomerFilters,
  CustomerProfileWithRelations,
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
 * Search customers
 */
export async function searchCustomers(query: string, limit = 10) {
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
 * Get booking by ID for confirmation display
 */
export async function getBookingById(id: string) {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      *,
      salon:salons(*),
      staff:profiles(*),
      appointment_services(*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;

  // Add mock data for missing fields
  return {
    ...data,
    confirmation_code: data.id,
    total_amount: 100,
    deposit_amount: 25
  };
}