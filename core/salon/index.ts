/**
 * Salon Module - Public API
 * Complete salon management system following Core Module Pattern
 *
 * Consolidated from 112 nested directories into 5 core folders:
 * - actions/ (server actions for all salon operations)
 * - components/ (UI components for salon management)
 * - dal/ (data access layer with auth checks)
 * - hooks/ (custom React hooks for state management)
 * - types/ (TypeScript definitions)
 */

// Server Actions - All salon management operations
export * from './actions';

// UI Components - Salon management interface
export * from './components';

// Data Access Layer - Database operations with authentication
export * from './dal';

// Custom Hooks - State management and data fetching
export * from './hooks';

// Note: Types are exported from specific submodules to avoid circular dependencies

// NOTE: File size violations detected during consolidation:
// ACTIONS FILES OVER 250 LINES:
// - billing-webhook-handlers.ts (578 lines) - NEEDS SPLITTING
// - billing-invoice-actions.ts (383 lines) - NEEDS SPLITTING
// - inventory-actions.ts (354 lines) - NEEDS SPLITTING
// - billing-actions.ts (319 lines) - NEEDS SPLITTING
// - billing-refund-actions.ts (303 lines) - NEEDS SPLITTING
// - customer-crud-actions.ts (298 lines) - NEEDS SPLITTING

// COMPONENT FILES OVER 300 LINES:
// - inventory-product-form.tsx (618 lines) - NEEDS SPLITTING
// - dashboard-service-catalog.tsx (616 lines) - NEEDS SPLITTING
// - dashboard-location-manager.tsx (612 lines) - NEEDS SPLITTING
// - staff-payroll-manager.tsx (601 lines) - NEEDS SPLITTING
// - customer-list-enhanced.tsx (597 lines) - NEEDS SPLITTING
// - marketing-campaign-settings.tsx (542 lines) - NEEDS SPLITTING
// - marketing-schedule-settings.tsx (523 lines) - NEEDS SPLITTING
// - staff-staff-dashboard.tsx (523 lines) - NEEDS SPLITTING
// - appointment-calendar-enhanced.tsx (522 lines) - NEEDS SPLITTING

// DAL FILES OVER 500 LINES:
// - marketing-campaigns-mutations.ts (552 lines) - NEEDS SPLITTING
// - customer-queries.ts (529 lines) - NEEDS SPLITTING
// - inventory-queries.ts (515 lines) - NEEDS SPLITTING
// - marketing-campaigns-queries.ts (500 lines) - AT LIMIT