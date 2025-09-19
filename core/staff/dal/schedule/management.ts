import { createClient } from "@/lib/supabase/server";
import type {
  StaffScheduleInsert,
  StaffScheduleUpdate,
  BlockedTimeInsert,
  BlockedTimeUpdate,
  TimeOffRequestInsert,
  TimeOffRequestUpdate
} from "./schedules-types";

/**
 * Create a new staff schedule
 */
export async function createStaffSchedule(data: StaffScheduleInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from('staff_schedules')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Update an existing staff schedule
 */
export async function updateStaffSchedule(id: string, data: StaffScheduleUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from('staff_schedules')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Delete a staff schedule
 */
export async function deleteStaffSchedule(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('staff_schedules')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

/**
 * Create a blocked time period
 */
export async function createBlockedTime(data: BlockedTimeInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: blockedTime, error } = await supabase
    .from('blocked_times')
    .insert({ ...data, created_by: user.id })
    .select()
    .single();

  if (error) throw error;
  return blockedTime;
}

/**
 * Update a blocked time period
 */
export async function updateBlockedTime(id: string, data: BlockedTimeUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: blockedTime, error } = await supabase
    .from('blocked_times')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return blockedTime;
}

/**
 * Delete a blocked time period
 */
export async function deleteBlockedTime(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('blocked_times')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { success: true };
}

/**
 * Create a time off request
 */
export async function createTimeOffRequest(data: TimeOffRequestInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: request, error } = await supabase
    .from('time_off_requests')
    .insert({ ...data, staff_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return request;
}

/**
 * Update a time off request
 */
export async function updateTimeOffRequest(id: string, data: TimeOffRequestUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: request, error } = await supabase
    .from('time_off_requests')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return request;
}

/**
 * Approve a time off request
 */
export async function approveTimeOffRequest(id: string, approvedBy: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: request, error } = await supabase
    .from('time_off_requests')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Create blocked time for approved request
  if (request) {
    await createBlockedTime({
      staff_id: request.staff_id,
      start_time: request.start_date,
      end_time: request.end_date,
      reason: 'time_off',
      description: request.reason
    });
  }

  return request;
}

/**
 * Reject a time off request
 */
export async function rejectTimeOffRequest(id: string, rejectedBy: string, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: request, error } = await supabase
    .from('time_off_requests')
    .update({
      status: 'rejected',
      approved_by: rejectedBy,
      approved_at: new Date().toISOString(),
      notes: reason
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return request;
}

/**
 * Cancel a time off request
 */
export async function cancelTimeOffRequest(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: request, error } = await supabase
    .from('time_off_requests')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return request;
}