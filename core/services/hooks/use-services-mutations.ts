import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createService,
  updateService,
  deleteService,
  toggleServiceFeatured,
  createServiceCategory,
  deleteServiceCategory,
  assignServiceToStaff,
  updateStaffService,
  removeServiceFromStaff,
  bulkUpdateServicePrices,
} from "../dal/services-mutations";
import type {
  ServiceInsert,
  ServiceUpdate,
  ServiceCategoryInsert,
  ServiceCategoryUpdate,
  StaffServiceInsert,
  StaffServiceUpdate,
} from "../dal/services-types";

/**
 * Hook to create a new service
 */
export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (service: ServiceInsert) => createService(service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

/**
 * Hook to update a service
 */
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: ServiceUpdate }) =>
      updateService(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", id] });
    },
  });
}

/**
 * Hook to delete a service
 */
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

/**
 * Hook to toggle service featured status
 */
export function useToggleServiceFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleServiceFeatured(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["services", id] });
      queryClient.invalidateQueries({ queryKey: ["services", "featured"] });
    },
  });
}

/**
 * Hook to create a service category
 */
export function useCreateServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: ServiceCategoryInsert) =>
      createServiceCategory(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-services"] });
    },
  });
}

/**
 * Hook to update a service category
 */
// Note: updateServiceCategory only updates service category assignment
// For updating category details, create a separate function in mutations

/**
 * Hook to delete a service category
 */
export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteServiceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories-with-services"] });
    },
  });
}

/**
 * Hook to assign a service to a staff member
 */
export function useAssignServiceToStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, serviceId, overrides }: { staffId: string; serviceId: string; overrides?: { price?: number; duration?: number } }) =>
      assignServiceToStaff(staffId, serviceId, overrides),
    onSuccess: (_, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: ["staff-services", staffId] });
    },
  });
}

/**
 * Hook to update staff service assignment
 */
export function useUpdateStaffService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      staffId,
      serviceId,
      updates,
    }: {
      staffId: string;
      serviceId: string;
      updates: { price_override?: number; duration_override?: number; is_available?: boolean };
    }) => updateStaffService(staffId, serviceId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-services"] });
    },
  });
}

/**
 * Hook to remove service from staff member
 */
export function useRemoveServiceFromStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      staffId,
      serviceId,
    }: {
      staffId: string;
      serviceId: string;
    }) => removeServiceFromStaff(staffId, serviceId),
    onSuccess: (_, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: ["staff-services", staffId] });
    },
  });
}

/**
 * Hook to bulk update service prices
 */
export function useBulkUpdateServicePrices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priceUpdates: Array<{ id: string; price: number }>) => bulkUpdateServicePrices(priceUpdates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
    },
  });
}
