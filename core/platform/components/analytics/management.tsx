import { Suspense } from "react";
import {
  getDashboardMetrics,
  getPerformanceMetrics,
} from "../../dal";
import type { AnalyticsFilters } from "../../dal";
import { AnalyticsHeader } from "../shared/analytics-header";
import { AnalyticsMetrics } from "../shared/analytics-metrics";
import { AnalyticsChartsLazy } from "../charts/analytics-charts-lazy";
import { AnalyticsInsights } from "../reports/analytics-insights";
import { LoadingState } from "@/core/shared/ui/components";

interface AnalyticsManagementProps {
  role: "admin" | "owner" | "staff";
  filters?: AnalyticsFilters;
}

export async function AnalyticsManagement({
  role,
  filters = {},
}: AnalyticsManagementProps) {
  const [dashboardMetrics, performanceMetrics] = await Promise.all([
    getDashboardMetrics(filters),
    getPerformanceMetrics(filters),
  ]);

  return (
    <div className="space-y-6">
      <AnalyticsHeader role={role} />

      <Suspense fallback={<LoadingState />}>
        <AnalyticsMetrics metrics={dashboardMetrics} role={role} />
      </Suspense>

      <Suspense fallback={<LoadingState />}>
        <AnalyticsChartsLazy
          metrics={performanceMetrics}
          _filters={filters}
          role={role}
        />
      </Suspense>

      {role !== "staff" && (
        <Suspense fallback={<LoadingState />}>
          <AnalyticsInsights filters={filters} />
        </Suspense>
      )}
    </div>
  );
}