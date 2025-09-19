"use server";

import {
  getDashboardMetrics,
  getPerformanceMetrics,
  getStaffPerformance,
  getCustomerInsights,
  getRevenueAnalytics,
  getBookingHeatmap,
  getChartData,
} from "../dal";
import type { AnalyticsFilters } from "../dal";

export async function getDashboardMetricsAction(
  filters: AnalyticsFilters = {},
) {
  return await getDashboardMetrics(filters);
}

export async function getPerformanceMetricsAction(
  filters: AnalyticsFilters = {},
) {
  return await getPerformanceMetrics(filters);
}

export async function getStaffPerformanceAction(staffId: string) {
  return await getStaffPerformance(staffId);
}

export async function getCustomerInsightsAction(
  filters: AnalyticsFilters = {},
) {
  return await getCustomerInsights(filters);
}

export async function getRevenueAnalyticsAction(
  filters: AnalyticsFilters = {},
) {
  return await getRevenueAnalytics(filters);
}

export async function getBookingHeatmapAction(salonId?: string) {
  return await getBookingHeatmap(salonId);
}

export async function getChartDataAction(
  chartType: "revenue" | "appointments" | "customers",
  filters: AnalyticsFilters = {},
) {
  return await getChartData(chartType, filters);
}
