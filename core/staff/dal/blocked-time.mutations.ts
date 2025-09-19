/**
 * Staff Blocked Time Mutations - Blocked time database operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  BlockedTimeInsert,
  BlockedTimeUpdate,
} from "./staff.types";

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