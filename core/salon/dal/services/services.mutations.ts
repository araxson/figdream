/**
 * Services Mutations - Database mutations for services
 */

import { createClient } from "@/lib/supabase/server";
import type { ServiceInsert, ServiceUpdate, ServiceCategory } from "./services-types";

/**
 * Create a new service
 */
export async function createService(data: ServiceInsert): Promise<string> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: service, error } = await supabase
    .from("services")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }

  if (!service?.id) {
    throw new Error("Failed to create service: No ID returned");
  }

  return service.id;
}

/**
 * Update service
 */
export async function updateService(id: string, data: ServiceUpdate): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("services")
    .update(data)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update service: ${error.message}`);
  }
}

/**
 * Delete service
 */
export async function deleteService(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("services")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete service: ${error.message}`);
  }
}

/**
 * Toggle service featured status
 */
export async function toggleServiceFeatured(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: service, error: fetchError } = await supabase
    .from("services")
    .select("is_featured")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch service: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from("services")
    .update({ is_featured: !service.is_featured })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle service featured status: ${error.message}`);
  }
}

/**
 * Toggle service bookable status
 */
export async function toggleServiceBookable(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: service, error: fetchError } = await supabase
    .from("services")
    .select("is_bookable")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch service: ${fetchError.message}`);
  }

  const { error } = await supabase
    .from("services")
    .update({ is_bookable: !service.is_bookable })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to toggle service bookable status: ${error.message}`);
  }
}

/**
 * Bulk update service prices
 */
export async function bulkUpdateServicePrices(
  updates: Array<{ id: string; price: number }>
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("services")
      .update({ base_price: update.price })
      .eq("id", update.id);

    if (error) {
      throw new Error(`Failed to update service price: ${error.message}`);
    }
  }
}

/**
 * Update service category
 */
export async function updateServiceCategory(
  serviceId: string,
  categoryId: string
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("services")
    .update({ category_id: categoryId })
    .eq("id", serviceId);

  if (error) {
    throw new Error(`Failed to update service category: ${error.message}`);
  }
}

/**
 * Duplicate a service
 */
export async function duplicateService(id: string): Promise<string> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  // First, get the service to duplicate
  const { data: service, error: fetchError } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch service: ${fetchError.message}`);
  }

  // Remove id and timestamps, add "Copy" to name
  const { id: _, created_at, updated_at, ...serviceData } = service;
  const newService = {
    ...serviceData,
    name: `${serviceData.name} (Copy)`,
    slug: `${serviceData.slug}-copy-${Date.now()}`,
    duration_minutes: serviceData.duration_minutes || 30, // Ensure non-null value
    includes: serviceData.includes || undefined, // Convert null to undefined
    benefits: serviceData.benefits || undefined, // Convert null to undefined
  } as ServiceInsert;

  return createService(newService);
}

/**
 * Bulk update multiple services
 */
export async function bulkUpdateServices(
  updates: Array<{ id: string; data: ServiceUpdate }>
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  for (const update of updates) {
    await updateService(update.id, update.data);
  }
}

/**
 * Bulk delete multiple services
 */
export async function bulkDeleteServices(ids: string[]): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  for (const id of ids) {
    await deleteService(id);
  }
}

/**
 * Create service category
 */
export async function createServiceCategory(
  data: Omit<ServiceCategory, "id" | "created_at" | "updated_at">
): Promise<string> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { data: category, error } = await supabase
    .from("service_categories")
    .insert(data)
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to create service category: ${error.message}`);
  }

  if (!category?.id) {
    throw new Error("Failed to create service category: No ID returned");
  }

  return category.id;
}

/**
 * Delete service category
 */
export async function deleteServiceCategory(id: string): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("service_categories")
    .update({ is_active: false })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete service category: ${error.message}`);
  }
}

/**
 * Assign service to staff
 */
export async function assignServiceToStaff(
  staffId: string,
  serviceId: string,
  overrides?: { price?: number; duration?: number }
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_services")
    .insert({
      staff_id: staffId,
      service_id: serviceId,
      price_override: overrides?.price,
      duration_override: overrides?.duration,
      is_available: true,
    });

  if (error) {
    throw new Error(`Failed to assign service to staff: ${error.message}`);
  }
}

/**
 * Update staff service assignment
 */
export async function updateStaffService(
  staffId: string,
  serviceId: string,
  data: { price_override?: number; duration_override?: number; is_available?: boolean }
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_services")
    .update(data)
    .eq("staff_id", staffId)
    .eq("service_id", serviceId);

  if (error) {
    throw new Error(`Failed to update staff service: ${error.message}`);
  }
}

/**
 * Remove service from staff
 */
export async function removeServiceFromStaff(
  staffId: string,
  serviceId: string
): Promise<void> {
  const supabase = await createClient();

  // MANDATORY: Verify auth in DAL
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Unauthorized: Authentication required");
  }

  const { error } = await supabase
    .from("staff_services")
    .delete()
    .eq("staff_id", staffId)
    .eq("service_id", serviceId);

  if (error) {
    throw new Error(`Failed to remove service from staff: ${error.message}`);
  }
}