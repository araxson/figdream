/**
 * Staff Time Off Mutations - Time off request database operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  TimeOffRequestInsert,
  TimeOffRequestUpdate,
} from "./staff.types";

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