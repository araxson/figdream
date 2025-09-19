/**
 * Staff Services Mutations - Service assignment database operations
 */

import { createClient } from "@/lib/supabase/server";

/**
 * Assign a service to a staff member
 */
export async function assignServiceToStaff(
  staffId: string,
  serviceId: string
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
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