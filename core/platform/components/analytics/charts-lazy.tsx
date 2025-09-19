"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/core/shared/ui/components";

// Lazy load the heavy chart component
export const AnalyticsChartsLazy = dynamic(
  () =>
    import("./analytics-charts").then((mod) => ({
      default: mod.AnalyticsCharts,
    })),
  {
    loading: () => <LoadingState />,
    ssr: false, // Disable SSR for charts to reduce initial bundle
  }
);