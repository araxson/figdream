/**
 * Salon Mutations - Database mutations for salons
 */

import { createClient } from "@/lib/supabase/server";
import type { SalonInsert, SalonUpdate } from "./salons-types";

/**
 * Create a new salon
 */
export async function createSalon(data: SalonInsert): Promise<string> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const { data: salon, error } = await supabase
    .from("salons")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create salon: ${error.message}`);
  }

  if (!salon?.id) {
    throw new Error("Failed to create salon: No ID returned");
  }

  return salon.id;
}

/**
 * Update salon
 */
export async function updateSalon(id: string, data: SalonUpdate): Promise<void> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Verify user has permission to update this salon
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role, salon_id')
    .eq('user_id', user.id)
    .eq('salon_id', id)
    .single();

  if (roleError || !userRole || !['owner', 'manager'].includes(userRole.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  const { error } = await supabase
    .from("salons")
    .update(data)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update salon: ${error.message}`);
  }
}

/**
 * Delete salon
 */
export async function deleteSalon(id: string): Promise<void> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Verify user has permission to delete this salon
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role, salon_id')
    .eq('user_id', user.id)
    .eq('salon_id', id)
    .single();

  if (roleError || !userRole || userRole.role !== 'owner') {
    throw new Error('Unauthorized: Only salon owners can delete salons');
  }

  const { error } = await supabase
    .from("salons")
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete salon: ${error.message}`);
  }
}

/**
 * Toggle salon featured status
 */
export async function toggleSalonFeatured(id: string): Promise<void> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Verify user has admin permissions (only admins can feature salons)
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || !userRole || !['super_admin', 'admin'].includes(userRole.role)) {
    throw new Error('Unauthorized: Admin permissions required');
  }

  const { data: salon, error: fetchError } = await supabase
    .from("salons")
    .select("is_featured")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch salon: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from("salons")
    .update({ is_featured: !salon.is_featured })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle salon featured status: ${error.message}`);
  }
}

/**
 * Toggle salon booking acceptance
 */
export async function toggleSalonBookingAcceptance(id: string): Promise<void> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Verify user has permission to manage this salon
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role, salon_id')
    .eq('user_id', user.id)
    .eq('salon_id', id)
    .single();

  if (roleError || !userRole || !['owner', 'manager'].includes(userRole.role)) {
    throw new Error('Unauthorized: Insufficient permissions');
  }

  const { data: salon, error: fetchError } = await supabase
    .from("salons")
    .select("is_accepting_bookings")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch salon: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from("salons")
    .update({ is_accepting_bookings: !salon.is_accepting_bookings })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle salon booking acceptance: ${error.message}`);
  }
}

/**
 * Verify salon
 */
export async function verifySalon(id: string): Promise<void> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Verify user has admin permissions (only admins can verify salons)
  const { data: userRole, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleError || !userRole || !['super_admin', 'admin'].includes(userRole.role)) {
    throw new Error('Unauthorized: Admin permissions required');
  }

  const { error } = await supabase
    .from("salons")
    .update({
      is_verified: true,
      verified_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to verify salon: ${error.message}`);
  }
}

/**
 * Update salon operating hours
 */
export async function updateSalonOperatingHours(
  salonId: string,
  hours: Array<{
    day_of_week: number;
    open_time: string;
    close_time: string;
    is_closed: boolean;
  }>
): Promise<void> {
  // NOTE: operating_hours table is in organization schema, not accessible via public views
  // This functionality is temporarily disabled until a public view is created
  console.warn("Operating hours update is not yet implemented - operating_hours view not available");
  return Promise.resolve();
}

/**
 * Update salon settings
 */
export async function updateSalonSettings(
  salonId: string,
  settings: any
): Promise<void> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  const { error } = await supabase
    .from("salons")
    .update({ settings })
    .eq("id", salonId);

  if (error) {
    throw new Error(`Failed to update salon settings: ${error.message}`);
  }
}

/**
 * Update business hours (stored in settings JSON)
 */
export async function updateBusinessHours(
  salonId: string,
  hours: any
): Promise<void> {
  const supabase = await createClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required');
  }

  // Get current settings
  const { data: salon, error: fetchError } = await supabase
    .from("salons")
    .select("settings")
    .eq("id", salonId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch salon: ${fetchError.message}`);
  }

  const updatedSettings = {
    ...(salon.settings || {}),
    business_hours: hours
  };

  const { error } = await supabase
    .from("salons")
    .update({ settings: updatedSettings })
    .eq("id", salonId);

  if (error) {
    throw new Error(`Failed to update business hours: ${error.message}`);
  }
}