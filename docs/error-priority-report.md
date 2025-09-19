# Error Priority Report

Generated: 2025-09-19T02:01:11.660Z

## Summary

- **Total Errors**: 3632
- **Error Groups**: 7
- **Quick Wins Available**: 715 errors
- **Complex Issues**: 969 errors

## Recommended Fix Order

1. Fix console.log statements (quick win - improves ESLint score)
2. Remove unused imports and variables (quick win - cleans codebase)
3. Fix missing properties on types (high impact - fixes TypeScript errors)
4. Resolve type mismatches (high impact - ensures type safety)
5. Add missing return types (medium impact - improves type inference)
6. Fix unknown types with assertions (medium impact - removes any usage)
7. Address uncategorized errors (requires manual review)

## Error Groups (Sorted by Priority)

### Missing properties on types (798 errors)

- **Pattern**: `missing-property`
- **Impact**: high
- **Fix Strategy**: Add missing properties to type definitions or fix property names
- **Files Affected**: 118

**Top Files:**

- `core/inventory/dal/queries.ts` (41 errors)
- `core/appointments/components/appointment-details-modal.tsx` (38 errors)
- `core/booking/components/booking-sections/booking-list-section.tsx` (31 errors)
- `core/campaigns/dal/campaigns-mutations.ts` (27 errors)
- `core/users/components/users-dashboard.tsx` (27 errors)

**Examples:**

- Line 37: Property 'role' does not exist on type 'SelectQueryError<"column 'role' does not exist on 'profiles'.">'.
- Line 425: Property 'logo_url' does not exist on type 'PlatformSalon'.
- Line 504: Property 'payload' does not exist on type 'never'.

### Type mismatches (146 errors)

- **Pattern**: `type-mismatch`
- **Impact**: high
- **Fix Strategy**: Fix type assignments or add type guards
- **Files Affected**: 53

**Top Files:**

- `core/loyalty/dal/loyalty.ts` (48 errors)
- `core/inventory/components/products/product-form.tsx` (20 errors)
- `core/booking/components/booking-wizard-optimized.tsx` (6 errors)
- `core/auth/actions/session-actions.ts` (5 errors)
- `core/monitoring/lib/cache-manager.ts` (4 errors)

**Examples:**

- Line 31: Type '{ confirmationCode: string; appointment: ExtendedAppointment; services: any[]; staff: any; salon: { id: string; name: string; address?: string; } | undefined; totalAmount: number; depositAmount: number | undefined; cancellationPolicy: string; }' is not assignable to type 'BookingConfirmation'.
- Line 48: Type 'string | null' is not assignable to type 'string'.
- Line 15: Type 'RevenueReport | null | undefined' is not assignable to type 'RevenueReport | null'.

### Missing modules or type declarations (25 errors)

- **Pattern**: `missing-module`
- **Impact**: high
- **Fix Strategy**: Install missing packages or add type declarations
- **Files Affected**: 16

**Top Files:**

- `core/shared/components/lazy-component.tsx` (6 errors)
- `core/staff/components/staff-batch-optimistic.tsx` (5 errors)
- `app/(dashboard)/layout.tsx` (1 errors)
- `core/analytics/dal/analytics-types.ts` (1 errors)
- `core/appointments/dal/appointments-types.ts` (1 errors)

**Examples:**

- Line 8: Cannot find module '@/types/extended.types' or its corresponding type declarations.
- Line 2: Cannot find module '@/types/extended.types' or its corresponding type declarations.
- Line 2: Cannot find module '@/types/extended.types' or its corresponding type declarations.

### Uncategorized errors (1913 errors)

- **Pattern**: `uncategorized`
- **Impact**: medium
- **Fix Strategy**: Manual review required
- **Files Affected**: 368

**Top Files:**

- `core/campaigns/dal/campaigns-queries.ts` (52 errors)
- `core/loyalty/dal/mutations.ts` (36 errors)
- `core/billing/dal/billing-queries.ts` (31 errors)
- `core/loyalty/dal/queries.ts` (31 errors)
- `core/billing/actions/invoice-actions.ts` (28 errors)

**Examples:**

- Line 469: No overload matches this call.
- Line 206: Export declaration conflicts with exported declaration of 'Tables'.
- Line 207: Export declaration conflicts with exported declaration of 'Enums'.

### Unknown types needing assertion (25 errors)

- **Pattern**: `unknown-type`
- **Impact**: medium
- **Fix Strategy**: Add proper type assertions or type guards
- **Files Affected**: 3

**Top Files:**

- `core/security/dal/secure-dal-patterns.ts` (22 errors)
- `core/schedules/dal/schedules-queries.ts` (2 errors)
- `core/shared/tools/architecture-orchestrator.ts` (1 errors)

**Examples:**

- Line 282: 'timeOff.start_date' is of type 'unknown'.
- Line 282: 'timeOff.end_date' is of type 'unknown'.
- Line 163: 'data' is of type 'unknown'.

### Unused imports (715 errors)

- **Pattern**: `unused-import`
- **Impact**: low
- **Fix Strategy**: Remove unused imports
- **Files Affected**: 240

**Top Files:**

- `core/salons/components/service-catalog.tsx` (30 errors)
- `core/staff/components/staff-schedule-manager.tsx` (21 errors)
- `core/gift-cards/dal/gift-cards-mutations.ts` (20 errors)
- `core/appointments/components/appointments-page-client.tsx` (18 errors)
- `core/salons/components/location-manager.tsx` (16 errors)

**Examples:**

- Line 4: 'useRouter' is defined but never used. Allowed unused vars must match /^_/u.
- Line 3: 'Search' is defined but never used. Allowed unused vars must match /^_/u.
- Line 3: 'useEffect' is defined but never used. Allowed unused vars must match /^_/u.

### Console.log statements (10 errors)

- **Pattern**: `console-log`
- **Impact**: low
- **Fix Strategy**: Remove console.log or replace with proper logging
- **Files Affected**: 7

**Top Files:**

- `core/integration/components/performance-monitor.tsx` (3 errors)
- `core/performance/providers/performance-provider.tsx` (2 errors)
- `core/dashboard/components/dashboard-optimized.tsx` (1 errors)
- `core/monitoring/actions/error-actions.ts` (1 errors)
- `core/performance/utils/metrics.ts` (1 errors)

**Examples:**

- Line 58: Unexpected console statement. Only these console methods are allowed: warn, error, info.
- Line 108: Unexpected console statement. Only these console methods are allowed: warn, error, info.
- Line 144: Unexpected console statement. Only these console methods are allowed: warn, error, info.

## Files with Most Errors

### core/loyalty/dal/loyalty.ts (76 errors)
Error types: uncategorized

### core/inventory/dal/queries.ts (64 errors)
Error types: uncategorized

### core/campaigns/dal/campaigns-queries.ts (60 errors)
Error types: 

### core/billing/dal/index.ts (48 errors)
Error types: uncategorized

### core/customer/dal/bookings.ts (47 errors)
Error types: uncategorized

### core/loyalty/dal/mutations.ts (47 errors)
Error types: uncategorized

### core/appointments/components/appointment-details-modal.tsx (44 errors)
Error types: 

### core/billing/actions/refund-actions.ts (44 errors)
Error types: uncategorized

### core/security/dal/secure-dal-patterns.ts (44 errors)
Error types: unknown-type

### core/billing/actions/invoice-actions.ts (40 errors)
Error types: uncategorized
