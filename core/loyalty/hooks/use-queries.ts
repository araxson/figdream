/**
 * Loyalty Query Hooks
 * Optimized data fetching with caching and error handling
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  LoyaltyProgram,
  CustomerLoyalty,
  LoyaltyTransaction,
  LoyaltyDashboard
} from "../dal";

/**
 * Hook to fetch loyalty program for a salon
 */
export function useLoyaltyProgram(salonId: string) {
  return useQuery<LoyaltyProgram | null, Error>({
    queryKey: ["loyalty-program", salonId],
    queryFn: async () => {
      const response = await fetch(`/api/loyalty/program?salonId=${salonId}`);
      if (!response.ok) throw new Error('Failed to fetch loyalty program');
      return response.json();
    },
    enabled: !!salonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}

/**
 * Hook to fetch customer loyalty enrollment
 */
export function useCustomerLoyalty(customerId: string, programId: string) {
  return useQuery<CustomerLoyalty | null, Error>({
    queryKey: ["customer-loyalty", customerId, programId],
    queryFn: () => getCustomerLoyalty(customerId, programId),
    enabled: !!customerId && !!programId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
}

/**
 * Hook to fetch program members with pagination
 */
export function useProgramMembers(
  programId: string,
  limit = 50,
  offset = 0
) {
  return useQuery<{ members: CustomerLoyalty[], total: number }, Error>({
    queryKey: ["program-members", programId, limit, offset],
    queryFn: () => getProgramMembers(programId, limit, offset),
    enabled: !!programId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
}

/**
 * Hook to fetch customer transactions
 */
export function useCustomerTransactions(
  customerLoyaltyId: string,
  limit = 50,
  offset = 0
) {
  return useQuery<{ transactions: LoyaltyTransaction[], total: number }, Error>({
    queryKey: ["customer-transactions", customerLoyaltyId, limit, offset],
    queryFn: () => getCustomerTransactions(customerLoyaltyId, limit, offset),
    enabled: !!customerLoyaltyId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 1
  });
}

/**
 * Hook to fetch loyalty dashboard data
 */
export function useLoyaltyDashboard(salonId: string) {
  return useQuery<LoyaltyDashboard, Error>({
    queryKey: ["loyalty-dashboard", salonId],
    queryFn: () => getLoyaltyDashboard(salonId),
    enabled: !!salonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
}

/**
 * Hook to search loyalty members
 */
export function useSearchLoyaltyMembers(
  programId: string,
  searchTerm: string
) {
  return useQuery<CustomerLoyalty[], Error>({
    queryKey: ["search-loyalty-members", programId, searchTerm],
    queryFn: () => searchLoyaltyMembers(programId, searchTerm),
    enabled: !!programId && searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1
  });
}