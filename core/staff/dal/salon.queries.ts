/**
 * Staff Salon Queries - Salon-specific staff operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  StaffProfile,
  StaffProfileWithRelations,
  StaffFilters,
} from "./staff.types";
import { getStaffProfiles } from "./queries";

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
 * Get available staff for a service
 */
export async function getAvailableStaffForService(
  serviceId: string,
  salonId: string,
  date: string
): Promise<StaffProfile[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

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