/**
 * Staff Mutations - Database mutations for staff
 */

import { createClient } from "@/lib/supabase/server";
import type {
  StaffProfileInsert,
  StaffProfileUpdate,
  StaffScheduleInsert,
  StaffScheduleUpdate,
  TimeOffRequestInsert,
  TimeOffRequestUpdate,
  BlockedTimeInsert,
  BlockedTimeUpdate
} from "./staff-types";

/**
 * Create staff profile
 */
export async function createStaffProfile(data: StaffProfileInsert): Promise<string> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: staff, error } = await supabase
    .from("staff_profiles")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create staff profile: ${error.message}`);
  }

  if (!staff?.id) {
    throw new Error("Failed to create staff profile: No ID returned");
  }

  return staff.id;
}

/**
 * Update staff profile
 */
export async function updateStaffProfile(
  id: string,
  data: StaffProfileUpdate
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_profiles")
    .update(data)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update staff profile: ${error.message}`);
  }
}

/**
 * Delete staff profile (soft delete)
 */
export async function deleteStaffProfile(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_profiles")
    .update({
      is_active: false,
      terminated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete staff profile: ${error.message}`);
  }
}

/**
 * Toggle staff bookable status
 */
export async function toggleStaffBookable(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: staff, error: fetchError } = await supabase
    .from("staff_profiles")
    .select("is_bookable")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch staff profile: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from("staff_profiles")
    .update({ is_bookable: !staff.is_bookable })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle staff bookable status: ${error.message}`);
  }
}

/**
 * Create staff schedule
 */
export async function createStaffSchedule(data: StaffScheduleInsert): Promise<string> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: schedule, error } = await supabase
    .from("staff_schedules")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create staff schedule: ${error.message}`);
  }

  if (!schedule?.id) {
    throw new Error("Failed to create staff schedule: No ID returned");
  }

  return schedule.id;
}

/**
 * Update staff schedule
 */
export async function updateStaffSchedule(
  id: string,
  data: StaffScheduleUpdate
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_schedules")
    .update(data)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update staff schedule: ${error.message}`);
  }
}

/**
 * Delete staff schedule
 */
export async function deleteStaffSchedule(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_schedules")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete staff schedule: ${error.message}`);
  }
}

/**
 * Create time off request
 */
export async function createTimeOffRequest(data: TimeOffRequestInsert): Promise<string> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: request, error } = await supabase
    .from("time_off_requests")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create time off request: ${error.message}`);
  }

  if (!request?.id) {
    throw new Error("Failed to create time off request: No ID returned");
  }

  return request.id;
}

/**
 * Update time off request
 */
export async function updateTimeOffRequest(
  id: string,
  data: TimeOffRequestUpdate
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("time_off_requests")
    .update(data)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update time off request: ${error.message}`);
  }
}

/**
 * Approve time off request
 */
export async function approveTimeOffRequest(
  id: string,
  approvedBy: string
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("time_off_requests")
    .update({
      status: "approved",
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to approve time off request: ${error.message}`);
  }
}

/**
 * Reject time off request
 */
export async function rejectTimeOffRequest(
  id: string,
  rejectedBy: string,
  reason?: string
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const updateData: any = {
    status: "rejected",
    approved_by: rejectedBy,
    approved_at: new Date().toISOString()
  };

  if (reason) {
    updateData.reason = reason;
  }

  const { error } = await supabase
    .from("time_off_requests")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to reject time off request: ${error.message}`);
  }
}

/**
 * Toggle staff featured status
 */
export async function toggleStaffFeatured(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: staff, error: fetchError } = await supabase
    .from("staff_profiles")
    .select("is_featured")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch staff profile: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from("staff_profiles")
    .update({ is_featured: !staff.is_featured })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle staff featured status: ${error.message}`);
  }
}

/**
 * Deactivate staff member
 */
export async function deactivateStaffMember(id: string): Promise<void> {
  return deleteStaffProfile(id);
}

/**
 * Cancel time off request
 */
export async function cancelTimeOffRequest(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("time_off_requests")
    .update({ status: "cancelled" })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to cancel time off request: ${error.message}`);
  }
}

/**
 * Create blocked time
 */
export async function createBlockedTime(
  data: BlockedTimeInsert
): Promise<string> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: blockedTime, error } = await supabase
    .from("blocked_times")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create blocked time: ${error.message}`);
  }

  if (!blockedTime?.id) {
    throw new Error("Failed to create blocked time: No ID returned");
  }

  return blockedTime.id;
}

/**
 * Update blocked time
 */
export async function updateBlockedTime(
  id: string,
  data: BlockedTimeUpdate
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("blocked_times")
    .update(data)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update blocked time: ${error.message}`);
  }
}

/**
 * Remove blocked time
 */
export async function removeBlockedTime(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("blocked_times")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to remove blocked time: ${error.message}`);
  }
}

/**
 * Update staff commission rate
 */
export async function updateStaffCommission(
  id: string,
  commissionRate: number
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_profiles")
    .update({ commission_rate: commissionRate })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update staff commission: ${error.message}`);
  }
}

/**
 * Assign a service to a staff member
 */
export async function assignServiceToStaff(
  staffId: string,
  serviceId: string
): Promise<void> {
  const supabase = await createClient();

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("staff_services")
    .insert({
      staff_id: staffId,
      service_id: serviceId
    });

  if (error) {
    // Handle duplicate constraint
    if (error.code === '23505') {
      return; // Already assigned, no error
    }
    throw new Error(`Failed to assign service: ${error.message}`);
  }
}