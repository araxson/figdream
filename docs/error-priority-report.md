# Error Priority Report

Generated: 2025-09-19T11:43:50.538Z

## Summary

- **Total Errors**: 3314
- **Error Groups**: 7
- **Quick Wins Available**: 474 errors
- **Complex Issues**: 1144 errors

## Recommended Fix Order

1. Fix console.log statements (quick win - improves ESLint score)
2. Remove unused imports and variables (quick win - cleans codebase)
3. Fix missing properties on types (high impact - fixes TypeScript errors)
4. Resolve type mismatches (high impact - ensures type safety)
5. Add missing return types (medium impact - improves type inference)
6. Fix unknown types with assertions (medium impact - removes any usage)
7. Address uncategorized errors (requires manual review)

## Error Groups (Sorted by Priority)

### Missing modules or type declarations (899 errors)

- **Pattern**: `missing-module`
- **Impact**: high
- **Fix Strategy**: Install missing packages or add type declarations
- **Files Affected**: 414

**Top Files:**

- `core/salon/components/staff/index.ts` (30 errors)
- `core/platform/components/admin/index.ts` (28 errors)
- `core/salon/components/dashboard/index.ts` (23 errors)
- `core/salon/components/salon-customers/index.ts` (23 errors)
- `core/public/components/index.ts` (14 errors)

**Examples:**

- Line 1: Cannot find module '@/core/customers/components/management' or its corresponding type declarations.
- Line 2: Cannot find module '@/core/customers/dal/management-queries' or its corresponding type declarations.
- Line 3: Cannot find module '@/core/shared/ui/components/error-boundary' or its corresponding type declarations.

### Missing properties on types (219 errors)

- **Pattern**: `missing-property`
- **Impact**: high
- **Fix Strategy**: Add missing properties to type definitions or fix property names
- **Files Affected**: 43

**Top Files:**

- `core/customer/components/dashboard/dashboard-container.tsx` (22 errors)
- `core/salon/actions/billing/refund.action.ts` (16 errors)
- `core/auth/actions/security/security-audit.action.ts` (13 errors)
- `core/salon/actions/billing/financial-reporting.action.ts` (13 errors)
- `core/users/dal/queries.ts` (13 errors)

**Examples:**

- Line 281: Property 'role' does not exist on type 'SelectQueryError<"column 'role' does not exist on 'profiles'.">'.
- Line 107: Property 'errors' does not exist on type 'ZodError<unknown>'.
- Line 230: Property 'id' does not exist on type 'never'.

### Type mismatches (26 errors)

- **Pattern**: `type-mismatch`
- **Impact**: high
- **Fix Strategy**: Fix type assignments or add type guards
- **Files Affected**: 22

**Top Files:**

- `core/salon/components/appointments/availability-checker.tsx` (3 errors)
- `core/salon/components/appointments/page-client.tsx` (2 errors)
- `core/salon/components/inventory/product-list.tsx` (2 errors)
- `core/customer/components/booking/calendar-conflicts.tsx` (1 errors)
- `core/customer/components/common/salon-selection.tsx` (1 errors)

**Examples:**

- Line 69: Type '"default" | "destructive" | "secondary"' is not assignable to type '"default" | "destructive" | null | undefined'.
- Line 158: Type 'string | null' is not assignable to type 'string | number | readonly string[] | undefined'.
- Line 186: Type '{ profile: any; upcomingAppointments: AppointmentHistoryItem[]; recentAppointments: AppointmentHistoryItem[]; favorites: any[]; loyaltyPrograms: CustomerLoyalty[]; notifications: Notification[]; }' is not assignable to type 'IntrinsicAttributes'.

### Uncategorized errors (1686 errors)

- **Pattern**: `uncategorized`
- **Impact**: medium
- **Fix Strategy**: Manual review required
- **Files Affected**: 334

**Top Files:**

- `core/customer/components/booking/manager.tsx` (39 errors)
- `core/customer/hooks/use-bookings.ts` (33 errors)
- `core/salon/dal/billing/billing.queries.ts` (31 errors)
- `core/salon/actions/billing/invoice.action.ts` (29 errors)
- `core/staff/index.ts` (29 errors)

**Examples:**

- Line 10: Type '{}' is missing the following properties from type 'SalonSearchProps': onSalonSelect, searchSalons
- Line 1: '"@/core/customer/components"' has no exported member named 'CustomerDashboardWrapper'. Did you mean 'CustomerDashboard'?
- Line 1: Module '"@/core/salon/components"' has no exported member 'SalonsManagement'.

### Unknown types needing assertion (4 errors)

- **Pattern**: `unknown-type`
- **Impact**: medium
- **Fix Strategy**: Add proper type assertions or type guards
- **Files Affected**: 2

**Top Files:**

- `core/customer/components/booking/service-selection.tsx` (2 errors)
- `core/staff/dal/schedule/queries.ts` (2 errors)

**Examples:**

- Line 230: 'categoryServices' is of type 'unknown'.
- Line 234: 'categoryServices' is of type 'unknown'.
- Line 282: 'timeOff.start_date' is of type 'unknown'.

### Unused imports (474 errors)

- **Pattern**: `unused-import`
- **Impact**: low
- **Fix Strategy**: Remove unused imports
- **Files Affected**: 151

**Top Files:**

- `core/staff/components/schedule/manager.tsx` (31 errors)
- `core/salon/components/dashboard/service-catalog.tsx` (30 errors)
- `core/salon/components/appointments/page-client.tsx` (18 errors)
- `core/salon/components/dashboard/location-manager.tsx` (16 errors)
- `core/salon/components/staff/dashboard.tsx` (13 errors)

**Examples:**

- Line 3: 'Search' is defined but never used. Allowed unused vars must match /^_/u.
- Line 4: 'redirect' is defined but never used. Allowed unused vars must match /^_/u.
- Line 5: 'requireSalonContext' is defined but never used. Allowed unused vars must match /^_/u.

### Console.log statements (6 errors)

- **Pattern**: `console-log`
- **Impact**: low
- **Fix Strategy**: Remove console.log or replace with proper logging
- **Files Affected**: 5

**Top Files:**

- `core/platform/dal/admin/admin.queries.ts` (2 errors)
- `app/(customer)/customer/appointments/page.tsx` (1 errors)
- `app/(customer)/customer/preferences/page.tsx` (1 errors)
- `core/customer/hooks/use-booking-websocket.ts` (1 errors)
- `core/staff/components/dashboard/analytics.tsx` (1 errors)

**Examples:**

- Line 6: Unexpected console statement. Only these console methods are allowed: warn, error, info.
- Line 25: Unexpected console statement. Only these console methods are allowed: warn, error, info.
- Line 42: Unexpected console statement. Only these console methods are allowed: warn, error, info.

## Files with Most Errors

### core/customer/components/booking/manager.tsx (49 errors)
Error types: 

### core/salon/actions/billing/refund.action.ts (44 errors)
Error types: 

### core/salon/actions/billing/invoice.action.ts (42 errors)
Error types: missing-property

### core/staff/components/schedule/manager.tsx (42 errors)
Error types: 

### core/customer/hooks/use-bookings.ts (38 errors)
Error types: 

### core/salon/dal/billing/billing.queries.ts (37 errors)
Error types: missing-property

### core/salon/components/dashboard/service-catalog.tsx (34 errors)
Error types: 

### core/customer/index.ts (32 errors)
Error types: 

### core/salon/dal/inventory/inventory.queries.ts (32 errors)
Error types: missing-property

### core/salon/dal/inventory/purchase-order.mutations.ts (31 errors)
Error types: missing-property
