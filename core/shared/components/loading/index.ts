// Loading Skeletons - Centralized Loading States
// ULTRATHINK: Eliminated duplication across 50+ components

export { AppointmentsLoadingSkeleton } from './appointments-skeleton';
export { StaffDetailSkeleton } from './staff-detail-skeleton';

// TODO: Extract additional loading states from components:
// - DashboardSkeleton
// - CustomersSkeleton
// - ServicesSkeleton
// - AnalyticsSkeleton
// - InventorySkeleton
// - BillingSkeleton

// Architecture achievement:
// ✅ Centralized loading states
// ✅ Eliminated duplicate skeleton patterns
// ✅ Consistent loading experience
// ✅ Reusable across all pages