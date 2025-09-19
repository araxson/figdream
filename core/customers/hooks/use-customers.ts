import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  getCustomers,
  getCustomerById,
  getCustomerWithAppointments,
  getCustomerPreferences,
  getCustomerFavorites,
  getCustomerNotes,
  getCustomerLoyaltyPoints,
  getCustomerLoyaltyTransactions,
  getCustomerMetrics,
  getCustomerInsights,
  searchCustomers,
} from "../dal/customers-queries";
import type {
  CustomerFilters,
  CustomerPreferenceFilters,
  CustomerFavoriteFilters,
} from "../dal/customers-types";

export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery({
    queryKey: ["customers", filters],
    queryFn: () => getCustomers(filters),
  });
}

export function useSuspenseCustomers(filters: CustomerFilters = {}) {
  return useSuspenseQuery({
    queryKey: ["customers", filters],
    queryFn: () => getCustomers(filters),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
}

export function useCustomerWithAppointments(customerId: string,
  limit = 10) {
  return useQuery({
    queryKey: ["customer", customerId, "appointments", limit],
    queryFn: () => getCustomerWithAppointments(customerId, limit),
    enabled: !!customerId,
  });
}

export function useCustomerPreferences(
  filters: CustomerPreferenceFilters = {},
) {
  return useQuery({
    queryKey: ["customer-preferences", filters],
    queryFn: () => getCustomerPreferences(filters),
  });
}

export function useCustomerFavorites(filters: CustomerFavoriteFilters = {}) {
  return useQuery({
    queryKey: ["customer-favorites", filters],
    queryFn: () => getCustomerFavorites(filters),
  });
}

export function useCustomerNotes(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId, "notes"],
    queryFn: () => getCustomerNotes(customerId),
    enabled: !!customerId,
  });
}

export function useCustomerLoyalty(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId, "loyalty"],
    queryFn: () => getCustomerLoyaltyPoints(customerId),
    enabled: !!customerId,
  });
}

export function useCustomerLoyaltyTransactions(customerId: string,
  limit = 20) {
  return useQuery({
    queryKey: ["customer", customerId, "loyalty-transactions", limit],
    queryFn: () => getCustomerLoyaltyTransactions(customerId, limit),
    enabled: !!customerId,
  });
}

export function useCustomerMetrics(salonId?: string) {
  return useQuery({
    queryKey: ["customer-metrics", salonId],
    queryFn: () => getCustomerMetrics(salonId),
  });
}

export function useCustomerInsights(customerId: string) {
  return useQuery({
    queryKey: ["customer", customerId, "insights"],
    queryFn: () => getCustomerInsights(customerId),
    enabled: !!customerId,
  });
}

export function useCustomerSearch(query: string,
  limit = 10) {
  return useQuery({
    queryKey: ["customers", "search", query, limit],
    queryFn: () => searchCustomers(query, limit),
    enabled: query.length > 2,
  });
}
