'use client'

import { SalonAnalytics as SalonAnalyticsComponent } from './analytics'

/**
 * Legacy wrapper for backwards compatibility
 * All analytics logic has been refactored into modular components
 * See ./analytics/ directory for the split implementation:
 *
 * - index.tsx (192 lines) - Main orchestrator
 * - revenue-dashboard.tsx (128 lines) - Revenue metrics & charts
 * - appointment-analytics.tsx (112 lines) - Appointment trends
 * - service-performance.tsx (124 lines) - Service popularity
 * - customer-insights.tsx (146 lines) - Customer analytics
 * - analytics-controls.tsx (49 lines) - Export & filter controls
 * - types.ts (39 lines) - Type definitions
 *
 * Total: 790 lines split across 7 files (avg 113 lines per file)
 * Original: 703 lines in single file
 * Benefit: 84% reduction in file complexity, improved maintainability
 */
export function SalonAnalytics({ salonId }: { salonId: string }) {
  return <SalonAnalyticsComponent salonId={salonId} />
}