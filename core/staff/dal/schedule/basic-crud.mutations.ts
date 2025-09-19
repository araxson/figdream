import { createClient } from "@/lib/supabase/server";
import type {
  schedulesData,
  StaffScheduleInsert,
  StaffScheduleUpdate,
  BlockedTimeInsert,
  BlockedTimeUpdate,
  TimeOffRequestInsert,
  TimeOffRequestUpdate
} from "./schedules-types";

/**
 * Basic Schedule CRUD Operations - Simple database operations
 */

/**
 * Create staff schedule
 */
export async function createStaffSchedule(data: StaffScheduleInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from("staff_schedules")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Update staff schedule
 */
export async function updateStaffSchedule(id: string, data: StaffScheduleUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from("staff_schedules")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Create blocked time
 */
export async function createBlockedTime(data: BlockedTimeInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: blockedTime, error } = await supabase
    .from("blocked_times")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return blockedTime;
}

/**
 * Update blocked time
 */
export async function updateBlockedTime(id: string, data: BlockedTimeUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: blockedTime, error } = await supabase
    .from("blocked_times")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return blockedTime;
}

/**
 * Create time off request
 */
export async function createTimeOffRequest(data: TimeOffRequestInsert) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: timeOff, error } = await supabase
    .from("time_off_requests")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return timeOff;
}

/**
 * Update time off request
 */
export async function updateTimeOffRequest(id: string, data: TimeOffRequestUpdate) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: timeOff, error } = await supabase
    .from("time_off_requests")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return timeOff;
}

/**
 * Create schedules
 */
export async function createschedules(data: Partial<schedulesData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from("schedules")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Update schedules
 */
export async function updateschedules(id: string, data: Partial<schedulesData>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: schedule, error } = await supabase
    .from("schedules")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return schedule;
}

/**
 * Delete schedules
 */
export async function deleteschedules(_id: string) {
  // Implementation would go here
  throw new Error("Delete schedule not implemented");
}