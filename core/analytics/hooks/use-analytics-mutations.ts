import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  refreshDailyMetrics,
  refreshMonthlyMetrics,
  updateStaffPerformance,
  updateCustomerAnalytics,
  updateServiceAnalytics,
  generateAnalyticsReport,
  exportAnalyticsData,
} from "../dal/analytics-mutations";
import type { AnalyticsFilters } from "../dal/analytics-types";

export function useRefreshDailyMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, salonId }: { date: string; salonId?: string }) =>
      refreshDailyMetrics(date, salonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["performance-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["chart-data"] });
      toast.success("Daily metrics refreshed");
    },
    onError: (error) => {
      toast.error("Failed to refresh daily metrics");
      console.error(error);
    },
  });
}

export function useRefreshMonthlyMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ month, salonId }: { month: string; salonId?: string }) =>
      refreshMonthlyMetrics(month, salonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["performance-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["chart-data"] });
      toast.success("Monthly metrics refreshed");
    },
    onError: (error) => {
      toast.error("Failed to refresh monthly metrics");
      console.error(error);
    },
  });
}

export function useUpdateStaffPerformance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => updateStaffPerformance(staffId),
    onSuccess: (_, staffId) => {
      queryClient.invalidateQueries({
        queryKey: ["staff-performance", staffId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Staff performance updated");
    },
    onError: (error) => {
      toast.error("Failed to update staff performance");
      console.error(error);
    },
  });
}

export function useUpdateCustomerAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: string) => updateCustomerAnalytics(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-insights"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Customer analytics updated");
    },
    onError: (error) => {
      toast.error("Failed to update customer analytics");
      console.error(error);
    },
  });
}

export function useUpdateServiceAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: string) => updateServiceAnalytics(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      toast.success("Service analytics updated");
    },
    onError: (error) => {
      toast.error("Failed to update service analytics");
      console.error(error);
    },
  });
}

export function useGenerateAnalyticsReport() {
  return useMutation({
    mutationFn: (filters: AnalyticsFilters) => generateAnalyticsReport(filters),
    onSuccess: () => {
      toast.success("Report generated successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate report");
      console.error(error);
    },
  });
}

export function useExportAnalyticsData() {
  return useMutation({
    mutationFn: ({
      filters,
      format,
    }: {
      filters: AnalyticsFilters;
      format: "csv" | "excel" | "pdf";
    }) => exportAnalyticsData(filters, format),
    onSuccess: (_, variables) => {
      toast.success(`Data exported as ${variables.format.toUpperCase()}`);
    },
    onError: (error) => {
      toast.error("Failed to export data");
      console.error(error);
    },
  });
}
