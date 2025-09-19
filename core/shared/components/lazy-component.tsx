"use client";

import { lazy, Suspense, ComponentType } from "react";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "./error-boundary";

interface LazyComponentOptions {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  featureName?: string;
}

/**
 * Create a lazily loaded component with error boundary and loading state
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
) {
  const LazyComponent = lazy(importFunc);

  const defaultFallback = (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <ErrorBoundary fallback={options.errorFallback}>
        <Suspense fallback={options.fallback || defaultFallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

/**
 * Loading skeleton for lazy components
 */
export function ComponentSkeleton({
  height = 400,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-muted rounded-lg ${className}`}
      style={{ minHeight: `${height}px` }}
    >
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/50" />
      </div>
    </div>
  );
}

/**
 * Optimized lazy loading for feature modules
 */
export const LazyFeatures = {
  // Analytics components
  RevenueChart: createLazyComponent(
    () => import("@/core/analytics/components/revenue-chart"),
    { featureName: "Revenue Chart" }
  ),

  PerformanceDashboard: createLazyComponent(
    () => import("@/core/analytics/components/performance-dashboard"),
    { featureName: "Performance Dashboard" }
  ),

  // Appointment components
  AppointmentCalendar: createLazyComponent(
    () => import("@/core/appointments/components/appointment-calendar"),
    { featureName: "Appointment Calendar" }
  ),

  // Staff components
  StaffScheduler: createLazyComponent(
    () => import("@/core/staff/components/staff-scheduler"),
    { featureName: "Staff Scheduler" }
  ),

  // Customer components
  CustomerPortal: createLazyComponent(
    () => import("@/core/customers/components/portal/customer-portal"),
    { featureName: "Customer Portal" }
  ),

  // Reports components
  ReportsGenerator: createLazyComponent(
    () => import("@/core/reports/components/reports-generator"),
    { featureName: "Reports Generator" }
  ),
};

/**
 * Preload a lazy component
 */
export function preloadComponent(
  componentName: keyof typeof LazyFeatures
): void {
  const component = LazyFeatures[componentName];
  if (component) {
    // Trigger the import without rendering
    (component as any)._payload._init();
  }
}