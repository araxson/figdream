/**
 * Staff Core Queries - Basic staff profile operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  StaffProfile,
  StaffProfileWithRelations,
  StaffFilters,
  StaffMember,
} from "./staff.types";

/**
 * Get staff members with filters (Backward compatibility alias)
 */
export async function getStaffMembers(
  filters: StaffFilters = {}
): Promise<StaffMember[]> {
  return getStaffProfiles(filters);
}

/**
 * Get staff profiles with filters
 */
export async function getStaffProfiles(
  filters: StaffFilters = {}
): Promise<StaffProfileWithRelations[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("staff_profiles") // This queries the public view
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.salon_id) {
    query = query.eq("salon_id", filters.salon_id);
  }

  if (filters.is_active !== undefined) {
    query = query.eq("is_active", filters.is_active);
  }

  if (filters.is_bookable !== undefined) {
    query = query.eq("is_bookable", filters.is_bookable);
  }

  if (filters.is_featured !== undefined) {
    query = query.eq("is_featured", filters.is_featured);
  }

  if (filters.status) {
    query = query.eq("status", filters.status as any);
  }

  if (filters.employment_type) {
    query = query.eq("employment_type", filters.employment_type);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch staff profiles: ${error.message}`);
  }

  return (data || []) as StaffProfileWithRelations[];
}

/**
 * Get staff profile by ID
 */
export async function getStaffProfileById(
  id: string
): Promise<StaffProfileWithRelations | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch staff profile: ${error.message}`);
  }

  return data as StaffProfileWithRelations;
}

/**
 * Get staff profile by user ID
 */
export async function getStaffProfileByUserId(
  userId: string
): Promise<StaffProfileWithRelations | null> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch staff profile: ${error.message}`);
  }

  return data as StaffProfileWithRelations;
}

/**
 * Search staff profiles
 */
export async function searchStaffProfiles(
  searchTerm: string,
  filters: Omit<StaffFilters, "search"> = {}
): Promise<StaffProfileWithRelations[]> {
  const searchFilters: StaffFilters = { ...filters, search: searchTerm };
  return getStaffProfiles(searchFilters);
}

/**
 * Get staff member by ID (alias for getStaffProfileById)
 */
export async function getStaffMemberById(id: string): Promise<StaffProfileWithRelations | null> {
  return getStaffProfileById(id);
}

/**
 * Get staff member by user ID (Backward compatibility alias)
 */
export async function getStaffMemberByUserId(
  userId: string
): Promise<StaffMember | null> {
  return getStaffProfileByUserId(userId);
}

/**
 * Get a single staff member by ID
 */
export async function getStaffById(staffId: string): Promise<StaffProfile | null> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", staffId)
    .single();

  if (error) {
    console.warn(`Failed to fetch staff member: ${error.message}`);
    return null;
  }

  return data as StaffProfile;
}