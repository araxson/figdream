/**
 * Staff Time Off Queries - Time off and blocked time queries
 */

import { createClient } from "@/lib/supabase/server";
import type { BlockedTime } from "./staff.types";

/**
 * Get time off requests
 */
export async function getTimeOffRequests(
  filters: { staff_id?: string; salon_id?: string; status?: string } = {}
): Promise<any[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

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
 * Get blocked times for a staff member
 */
export async function getStaffBlockedTimes(
  staffId: string,
  startDate?: string,
  endDate?: string
): Promise<BlockedTime[]> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

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