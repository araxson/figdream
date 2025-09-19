import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import {
  getDashboardMetricsAction,
  getPerformanceMetricsAction,
  getStaffPerformanceAction,
  getCustomerInsightsAction,
  getRevenueAnalyticsAction,
  getBookingHeatmapAction,
  getChartDataAction,
} from "../actions/analytics-actions";
import type { AnalyticsFilters } from "../dal/analytics-types";

export function useDashboardMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["dashboard-metrics", filters],
    queryFn: () => getDashboardMetricsAction(filters),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useSuspenseDashboardMetrics(filters: AnalyticsFilters = {}) {
  return useSuspenseQuery({
    queryKey: ["dashboard-metrics", filters],
    queryFn: () => getDashboardMetricsAction(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePerformanceMetrics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["performance-metrics", filters],
    queryFn: () => getPerformanceMetricsAction(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useStaffPerformance(staffId: string) {
  return useQuery({
    queryKey: ["staff-performance", staffId],
    queryFn: () => getStaffPerformanceAction(staffId),
    enabled: !!staffId,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });
}

export function useCustomerInsights(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["customer-insights", filters],
    queryFn: () => getCustomerInsightsAction(filters),
    staleTime: 1000 * 60 * 15, // Cache for 15 minutes
  });
}

export function useRevenueAnalytics(filters: AnalyticsFilters = {}) {
  return useQuery({
    queryKey: ["revenue-analytics", filters],
    queryFn: () => getRevenueAnalyticsAction(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBookingHeatmap(salonId?: string) {
  return useQuery({
    queryKey: ["booking-heatmap", salonId],
    queryFn: () => getBookingHeatmapAction(salonId),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

export function useChartData(
  type: "revenue" | "appointments" | "customers",
  filters: AnalyticsFilters = {},
) {
  return useQuery({
    queryKey: ["chart-data", type, filters],
    queryFn: () => getChartDataAction(type, filters),
    staleTime: 1000 * 60 * 5,
  });
}
