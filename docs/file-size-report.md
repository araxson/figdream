# File Size Validation Report

Generated: 2025-09-19T11:43:53.620Z

## Summary

- **Total Files**: 745
- **Compliant Files**: 0 (0.0%)
- **Oversized Files**: 89
- **Critical Files**: 59
- **Average File Size**: 45 lines

## Recommendations

- 🚨 CRITICAL: 59 files are critically oversized. These need immediate refactoring to maintain code quality.
- 🧩 Components: 42 components exceed 300 lines. Split into smaller, focused components for better reusability.
- 🗄️ DAL: 2 DAL files exceed 500 lines. Split by operation type (queries/mutations) or by domain.
- 📊 Overall: Only 0.0% of files meet size limits. Implement a file size policy and regular refactoring.

## File Size Limits

| Type | Ideal | Maximum | Critical |
|------|-------|---------|----------|
| page | 30 | 50 | 100 |
| component | 200 | 300 | 400 |
| dal | 300 | 500 | 600 |
| hook | 100 | 150 | 200 |
| action | 150 | 250 | 300 |
| util | 150 | 200 | 250 |
| other | 200 | 400 | 500 |

## Statistics by File Type

| Type | Count | Avg Size | Max Size |
|------|-------|----------|----------|
| component | 449 | 122 | 619 |
| action | 102 | 138 | 492 |
| dal | 94 | 149 | 532 |
| hook | 53 | 151 | 501 |
| other | 47 | 85 | 478 |

## Oversized Files (Largest First)

### core/salon/components/inventory/product-form.tsx
- **Type**: component
- **Current Size**: 619 lines
- **Max Allowed**: 300 lines
- **Excess**: 319 lines
- **Severity**: critical

**Largest Functions:**
- ProductForm: 556 lines (lines 63-619)
- productSchema: 20 lines (lines 33-53)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: ProductForm

### core/salon/components/dashboard/service-catalog.tsx
- **Type**: component
- **Current Size**: 617 lines
- **Max Allowed**: 300 lines
- **Excess**: 317 lines
- **Severity**: critical

**Largest Functions:**
- ServiceCatalog: 390 lines (lines 227-617)
- ServiceCard: 130 lines (lines 95-225)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: ServiceCatalog, ServiceCard

### core/salon/components/dashboard/location-manager.tsx
- **Type**: component
- **Current Size**: 613 lines
- **Max Allowed**: 300 lines
- **Excess**: 313 lines
- **Severity**: critical

**Largest Functions:**
- LocationManager: 471 lines (lines 142-613)
- LocationCard: 67 lines (lines 73-140)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: LocationManager, LocationCard

### core/salon/components/staff/payroll-manager.tsx
- **Type**: component
- **Current Size**: 602 lines
- **Max Allowed**: 300 lines
- **Excess**: 302 lines
- **Severity**: critical

**Largest Functions:**
- PayrollManager: 553 lines (lines 49-602)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: PayrollManager

### core/platform/components/admin/security-center.tsx
- **Type**: component
- **Current Size**: 598 lines
- **Max Allowed**: 300 lines
- **Excess**: 298 lines
- **Severity**: critical

**Largest Functions:**
- SecurityCenter: 529 lines (lines 69-598)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: SecurityCenter

### core/staff/components/schedule/optimizer.tsx
- **Type**: component
- **Current Size**: 567 lines
- **Max Allowed**: 300 lines
- **Excess**: 267 lines
- **Severity**: critical

**Largest Functions:**
- ScheduleOptimizer: 501 lines (lines 66-567)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: ScheduleOptimizer

### core/staff/components/schedule/availability-manager.tsx
- **Type**: component
- **Current Size**: 554 lines
- **Max Allowed**: 300 lines
- **Excess**: 254 lines
- **Severity**: critical

**Largest Functions:**
- AvailabilityManager: 501 lines (lines 53-554)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: AvailabilityManager

### core/customer/components/booking/confirmation.tsx
- **Type**: component
- **Current Size**: 540 lines
- **Max Allowed**: 300 lines
- **Excess**: 240 lines
- **Severity**: critical

**Largest Functions:**
- BookingConfirmationComponent: 484 lines (lines 52-536)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: BookingConfirmationComponent

### core/platform/dal/users/users.queries.ts
- **Type**: dal
- **Current Size**: 532 lines
- **Max Allowed**: 500 lines
- **Excess**: 32 lines
- **Severity**: low

**Largest Functions:**
- getAvailableRoles: 107 lines (lines 314-421)
- getUserManagementStats: 71 lines (lines 176-247)
- getUsers: 51 lines (lines 19-70)

**Split Suggestions:**
- Split by domain (queries.ts, mutations.ts)
- Extract complex queries to separate files
- Create repository pattern classes
- Extract large functions: getAvailableRoles, getUserManagementStats, getUsers

### core/salon/components/staff/dashboard.tsx
- **Type**: component
- **Current Size**: 524 lines
- **Max Allowed**: 300 lines
- **Excess**: 224 lines
- **Severity**: critical

**Largest Functions:**
- StaffDashboard: 407 lines (lines 66-473)
- ServiceAssignmentMatrix: 48 lines (lines 476-524)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: StaffDashboard

### core/salon/components/appointments/calendar.tsx
- **Type**: component
- **Current Size**: 523 lines
- **Max Allowed**: 300 lines
- **Excess**: 223 lines
- **Severity**: critical

**Largest Functions:**
- CalendarEnhanced: 462 lines (lines 61-523)
- timeSlots: 3 lines (lines 56-59)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: CalendarEnhanced

### core/salon/dal/inventory/inventory.queries.ts
- **Type**: dal
- **Current Size**: 516 lines
- **Max Allowed**: 500 lines
- **Excess**: 16 lines
- **Severity**: low

**Largest Functions:**
- getInventoryMetrics: 57 lines (lines 459-516)
- getProducts: 37 lines (lines 19-56)
- getPurchaseOrders: 34 lines (lines 285-319)

**Split Suggestions:**
- Split by domain (queries.ts, mutations.ts)
- Extract complex queries to separate files
- Create repository pattern classes
- Extract large functions: getInventoryMetrics

### core/platform/components/admin/user-management.tsx
- **Type**: component
- **Current Size**: 503 lines
- **Max Allowed**: 300 lines
- **Excess**: 203 lines
- **Severity**: critical

**Largest Functions:**
- UserManagement: 431 lines (lines 72-503)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: UserManagement

### core/customer/hooks/use-bookings.ts
- **Type**: hook
- **Current Size**: 501 lines
- **Max Allowed**: 150 lines
- **Excess**: 351 lines
- **Severity**: critical

**Largest Functions:**
- useUpdateBookingStatus: 49 lines (lines 207-256)
- useBookingConfirmation: 40 lines (lines 461-501)
- useServices: 31 lines (lines 44-75)

**Split Suggestions:**
- Split into multiple specialized hooks
- Extract utility functions to helpers

### core/staff/components/schedule/manager.tsx
- **Type**: component
- **Current Size**: 500 lines
- **Max Allowed**: 300 lines
- **Excess**: 200 lines
- **Severity**: critical

**Largest Functions:**
- StaffScheduleManager: 414 lines (lines 86-500)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: StaffScheduleManager

### core/shared/hooks/use-realtime-sync.ts
- **Type**: hook
- **Current Size**: 494 lines
- **Max Allowed**: 150 lines
- **Excess**: 344 lines
- **Severity**: critical

**Largest Functions:**
- useRealtimeSync: 334 lines (lines 57-391)
- subscriptionManager: 2 lines (lines 468-470)
- reconcileOptimisticUpdate: 2 lines (lines 471-473)

**Split Suggestions:**
- Split into multiple specialized hooks
- Extract utility functions to helpers
- Extract large functions: useRealtimeSync

### core/auth/actions/user/user-management.action.ts
- **Type**: action
- **Current Size**: 492 lines
- **Max Allowed**: 250 lines
- **Excess**: 242 lines
- **Severity**: critical

**Largest Functions:**
- register: 106 lines (lines 52-158)
- updateEmail: 64 lines (lines 379-443)
- updateProfile: 49 lines (lines 257-306)

**Split Suggestions:**
- Group related actions into separate files
- Extract validation to validators/
- Move business logic to core modules
- Extract large functions: register, updateEmail

### core/platform/components/admin/onboarding-flow.tsx
- **Type**: component
- **Current Size**: 489 lines
- **Max Allowed**: 300 lines
- **Excess**: 189 lines
- **Severity**: critical

**Largest Functions:**
- UserOnboardingFlow: 389 lines (lines 100-489)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: UserOnboardingFlow

### core/customer/types/portal.types.ts
- **Type**: other
- **Current Size**: 478 lines
- **Max Allowed**: 400 lines
- **Excess**: 78 lines
- **Severity**: medium

### core/staff/components/dashboard/performance.tsx
- **Type**: component
- **Current Size**: 476 lines
- **Max Allowed**: 300 lines
- **Excess**: 176 lines
- **Severity**: critical

**Largest Functions:**
- PerformanceDashboard: 438 lines (lines 38-476)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: PerformanceDashboard
