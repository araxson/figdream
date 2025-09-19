/**
 * Staff Queries - Using actual database tables
 *
 * Queries from organization.staff_profiles table
 */

import { createClient } from "@/lib/supabase/server";
import type {
  StaffProfile,
  StaffProfileWithRelations,
  StaffFilters,
  StaffSchedule,
  StaffService,
  StaffPerformance,
  StaffMember,
  BlockedTime
} from "./staff-types";

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
 * Get active staff by salon
 */
export async function getActiveStaffBySalon(
  salonId: string
): Promise<StaffProfile[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch active staff: ${error.message}`);
  }

  return (data || []) as StaffProfile[];
}

/**
 * Get bookable staff by salon
 */
export async function getBookableStaffBySalon(
  salonId: string
): Promise<StaffProfile[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .eq("is_bookable", true)
    .order("title", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch bookable staff: ${error.message}`);
  }

  return (data || []) as StaffProfile[];
}

/**
 * Get featured staff
 */
export async function getFeaturedStaff(
  salonId?: string
): Promise<StaffProfileWithRelations[]> {
  const filters: StaffFilters = { is_featured: true, is_active: true };
  if (salonId) {
    filters.salon_id = salonId;
  }
  return getStaffProfiles(filters);
}

/**
 * Get staff schedules
 */
export async function getStaffSchedules(
  staffId: string
): Promise<StaffSchedule[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("staff_schedules")
    .select("*")
    .eq("staff_id", staffId)
    .eq("is_active", true)
    .order("day_of_week", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch staff schedules: ${error.message}`);
  }

  return (data || []) as StaffSchedule[];
}

/**
 * Get staff services
 */
export async function getStaffServices(
  staffId: string
): Promise<StaffService[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("staff_services")
    .select("*")
    .eq("staff_id", staffId)
    .eq("is_available", true)
    .order("performed_count", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch staff services: ${error.message}`);
  }

  return (data || []) as StaffService[];
}

/**
 * Get staff performance
 */
export async function getStaffPerformance(
  staffId: string,
  periodStart?: string,
  periodEnd?: string
): Promise<StaffPerformance[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  let query = supabase
    .from("staff_performance")
    .select("*")
    .eq("staff_id", staffId)
    .order("period_start", { ascending: false });

  if (periodStart) {
    query = query.gte("period_start", periodStart);
  }

  if (periodEnd) {
    query = query.lte("period_end", periodEnd);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch staff performance: ${error.message}`);
  }

  return (data || []) as StaffPerformance[];
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
 * Get time off requests
 */
export async function getTimeOffRequests(
  filters: { staff_id?: string; salon_id?: string; status?: string } = {}
): Promise<any[]> {
  const supabase = await createClient();

  let query = supabase
    .from("time_off_requests") // This is available as a public view
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.staff_id) {
    query = query.eq("staff_id", filters.staff_id);
  }

  if (filters.salon_id) {
    query = query.eq("salon_id", filters.salon_id);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`Failed to fetch time off requests: ${error.message}`);
    return [];
  }

  return data || [];
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
 * Get blocked times for a staff member
 */
export async function getStaffBlockedTimes(
  staffId: string,
  startDate?: string,
  endDate?: string
): Promise<BlockedTime[]> {
  const supabase = await createClient();

  let query = supabase
    .from("blocked_times")
    .select("*")
    .eq("staff_id", staffId)
    .order("start_time", { ascending: true });

  if (startDate) {
    query = query.gte("start_time", startDate);
  }

  if (endDate) {
    query = query.lte("end_time", endDate);
  }

  const { data, error } = await query;

  if (error) {
    console.warn(`Failed to fetch blocked times: ${error.message}`);
    return [];
  }

  return (data || []) as unknown as BlockedTime[];
}

/**
 * Get available staff for a service
 */
export async function getAvailableStaffForService(
  serviceId: string,
  salonId: string,
  date: string
): Promise<StaffProfile[]> {
  const supabase = await createClient();

  // Get staff who can perform the service
  const { data: staffServices, error: staffServicesError } = await supabase
    .from("staff_services")
    .select("staff_id")
    .eq("service_id", serviceId)
    .eq("is_available", true);

  if (staffServicesError) {
    console.warn(`Failed to fetch staff services: ${staffServicesError.message}`);
    return [];
  }

  const staffIds = staffServices?.map(s => s.staff_id) || [];

  if (staffIds.length === 0) {
    return [];
  }

  // Get active, bookable staff members
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("salon_id", salonId)
    .eq("is_active", true)
    .eq("is_bookable", true)
    .in("id", staffIds);

  if (error) {
    console.warn(`Failed to fetch available staff: ${error.message}`);
    return [];
  }

  return (data || []) as StaffProfile[];
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

/**
 * Get staff schedule (alias for getStaffSchedules with single ID)
 */
export async function getStaffSchedule(staffId: string, salonId: string) {
  return getStaffSchedules(salonId, { staff_id: staffId });
}