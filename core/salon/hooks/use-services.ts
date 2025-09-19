import { useQuery } from "@tanstack/react-query";
import {
  getServices,
  getServiceById,
  getServicesByCategory,
  getServiceCategories,
  getCategoriesWithServices,
  getFeaturedServices,
  getStaffServices,
  searchServices,
} from "../dal/services-queries";
import type { ServiceFilters } from "../dal/services-types";

/**
 * Hook to fetch services with filters
 */
export function useServices(filters: ServiceFilters = {}) {
  return useQuery({
    queryKey: ["services", filters],
    queryFn: () => getServices(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single service
 */
export function useService(id: string) {
  return useQuery({
    queryKey: ["services", id],
    queryFn: () => getServiceById(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch services by category
 */
export function useServicesByCategory(categoryId: string, salonId?: string) {
  return useQuery({
    queryKey: ["services", "category", categoryId, salonId],
    queryFn: () => getServicesByCategory(categoryId, salonId),
    enabled: !!categoryId,
  });
}

/**
 * Hook to fetch service categories
 */
export function useServiceCategories(salonId?: string) {
  return useQuery({
    queryKey: ["service-categories", salonId],
    queryFn: () => getServiceCategories(salonId),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch categories with their services
 */
export function useCategoriesWithServices(salonId: string) {
  return useQuery({
    queryKey: ["categories-with-services", salonId],
    queryFn: () => getCategoriesWithServices(salonId),
    enabled: !!salonId,
  });
}

/**
 * Hook to fetch featured services
 */
export function useFeaturedServices(salonId?: string) {
  return useQuery({
    queryKey: ["services", "featured", salonId],
    queryFn: () => getFeaturedServices(salonId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch services for a staff member
 */
export function useStaffServices(staffId: string) {
  return useQuery({
    queryKey: ["staff-services", staffId],
    queryFn: () => getStaffServices(staffId),
    enabled: !!staffId,
  });
}

/**
 * Hook to search services
 */
export function useSearchServices(searchTerm: string, salonId?: string) {
  return useQuery({
    queryKey: ["services", "search", searchTerm, salonId],
    queryFn: () => searchServices(searchTerm, salonId),
    enabled: searchTerm.length > 2, // Only search with 3+ characters
  });
}
