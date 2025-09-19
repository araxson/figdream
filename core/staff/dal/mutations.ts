/**
 * Staff Profile Mutations - Core staff profile database operations
 */

import { createClient } from "@/lib/supabase/server";
import type {
  StaffProfileInsert,
  StaffProfileUpdate,
} from "./staff.types";

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