/**
 * Services Queries - Using actual database tables
 *
 * Queries from catalog.services table
 */

import { createClient } from "@/lib/supabase/server";
import type { Service, ServiceWithRelations, ServiceFilters, ServiceCategory, CategoryWithServices } from "./services-types";

/**
 * Get public services (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for service discovery and booking
 */
export async function getPublicServices(
  filters: Partial<ServiceFilters> = {}
): Promise<ServiceWithRelations[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for service browsing

  let query = supabase
    .from("services")
    .select("*")
    .eq("is_active", true) // Only show active services publicly
    .eq("is_bookable", true); // Only show bookable services publicly

  // Apply safe public filters
  const salonId = filters.salon_id || filters.salonId;
  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  const isFeatured = filters.is_featured !== undefined ? filters.is_featured : filters.isFeatured;
  if (isFeatured !== undefined) {
    query = query.eq("is_featured", isFeatured);
  }

  const searchTerm = filters.search || filters.searchQuery;
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  // Price filters
  const minPrice = filters.min_price || filters.minPrice;
  if (minPrice !== undefined) {
    query = query.gte("base_price", minPrice);
  }

  const maxPrice = filters.max_price || filters.maxPrice;
  if (maxPrice !== undefined) {
    query = query.lte("base_price", maxPrice);
  }

  // Duration filters
  const minDuration = filters.min_duration || filters.minDuration;
  if (minDuration !== undefined) {
    query = query.gte("duration_minutes", minDuration);
  }

  const maxDuration = filters.max_duration || filters.maxDuration;
  if (maxDuration !== undefined) {
    query = query.lte("duration_minutes", maxDuration);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch public services: ${error.message}`);
  }

  return (data || []) as ServiceWithRelations[];
}

/**
 * Get all services with filters (AUTHENTICATED ACCESS)
 * Requires authentication for detailed service management data
 */
export async function getServices(
  filters: ServiceFilters = {}
): Promise<ServiceWithRelations[]> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for detailed service access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for service data access');
  }

  let query = supabase
    .from("services") // This queries the public view
    .select("*");

  // Handle both new and legacy field names
  const salonId = filters.salon_id || filters.salonId;
  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  if (filters.category_id) {
    query = query.eq("category_id", filters.category_id);
  }

  const isActive = filters.is_active !== undefined ? filters.is_active : filters.isActive;
  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  const isBookable = filters.is_bookable !== undefined ? filters.is_bookable : filters.isBookable;
  if (isBookable !== undefined) {
    query = query.eq("is_bookable", isBookable);
  }

  const isFeatured = filters.is_featured !== undefined ? filters.is_featured : filters.isFeatured;
  if (isFeatured !== undefined) {
    query = query.eq("is_featured", isFeatured);
  }

  const searchTerm = filters.search || filters.searchQuery;
  if (searchTerm) {
    query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }

  // Price filters
  const minPrice = filters.min_price || filters.minPrice;
  if (minPrice !== undefined) {
    query = query.gte("base_price", minPrice);
  }

  const maxPrice = filters.max_price || filters.maxPrice;
  if (maxPrice !== undefined) {
    query = query.lte("base_price", maxPrice);
  }

  // Duration filters
  const minDuration = filters.min_duration || filters.minDuration;
  if (minDuration !== undefined) {
    query = query.gte("duration_minutes", minDuration);
  }

  const maxDuration = filters.max_duration || filters.maxDuration;
  if (maxDuration !== undefined) {
    query = query.lte("duration_minutes", maxDuration);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch services: ${error.message}`);
  }

  return (data || []) as ServiceWithRelations[];
}

/**
 * Get public service by ID (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for service details and booking
 */
export async function getPublicServiceById(
  id: string
): Promise<ServiceWithRelations | null> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for service details

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .eq("is_bookable", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch public service: ${error.message}`);
  }

  return data as ServiceWithRelations;
}

/**
 * Get a single service by ID (AUTHENTICATED ACCESS)
 * Requires authentication for detailed service management data
 */
export async function getServiceById(
  id: string
): Promise<ServiceWithRelations | null> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for detailed service access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for service data access');
  }

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch service: ${error.message}`);
  }

  return data as ServiceWithRelations;
}

/**
 * Get services by category (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for category-based service browsing
 */
export async function getServicesByCategory(
  categoryId: string,
  salonId?: string
): Promise<Service[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for category browsing

  let query = supabase
    .from("services")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .eq("is_bookable", true);

  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch services by category: ${error.message}`);
  }

  return (data || []) as Service[];
}

/**
 * Get featured services (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for featured service discovery
 */
export async function getFeaturedServices(
  salonId?: string
): Promise<ServiceWithRelations[]> {
  const filters: Partial<ServiceFilters> = { is_featured: true };
  if (salonId) {
    filters.salon_id = salonId;
  }
  return getPublicServices(filters);
}

/**
 * Search services (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for service search and discovery
 */
export async function searchServices(
  searchTerm: string,
  salonId?: string
): Promise<ServiceWithRelations[]> {
  const filters: Partial<ServiceFilters> = { search: searchTerm };
  if (salonId) {
    filters.salon_id = salonId;
  }
  return getPublicServices(filters);
}

/**
 * Get all service categories (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for category browsing
 */
export async function getServiceCategories(
  salonId?: string
): Promise<ServiceCategory[]> {
  const supabase = await createClient();
  // NOTE: No auth check - public access for category browsing

  let query = supabase
    .from("service_categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (salonId) {
    query = query.eq("salon_id", salonId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch service categories: ${error.message}`);
  }

  return (data || []) as ServiceCategory[];
}

/**
 * Get categories with their services (PUBLIC ACCESS FOR BROWSING)
 * DOCUMENTED: Public access for complete category and service browsing
 */
export async function getCategoriesWithServices(
  salonId: string
): Promise<CategoryWithServices[]> {
  const categories = await getServiceCategories(salonId);
  const services = await getPublicServices({ salon_id: salonId });

  return categories.map(category => ({
    ...category,
    services: services.filter(service => service.category_id === category.id)
  }));
}

/**
 * Get services for a specific staff member (AUTHENTICATED ACCESS)
 * Requires authentication for staff-service relationship data
 */
export async function getStaffServices(
  staffId: string
): Promise<Service[]> {
  const supabase = await createClient();

  // MANDATORY: Verify authentication for staff service data
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Unauthorized: Authentication required for staff service data access');
  }

  const { data, error } = await supabase
    .from("staff_services")
    .select("*, services(*)")
    .eq("staff_id", staffId)
    .eq("is_available", true);

  if (error) {
    throw new Error(`Failed to fetch staff services: ${error.message}`);
  }

  return (data || []).map((item: any) => item.services).filter(Boolean) as Service[];
}