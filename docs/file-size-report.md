# File Size Validation Report

Generated: 2025-09-19T02:01:15.241Z

## Summary

- **Total Files**: 892
- **Compliant Files**: 0 (0.0%)
- **Oversized Files**: 159
- **Critical Files**: 105
- **Average File Size**: 75 lines

## Recommendations

- 🚨 CRITICAL: 105 files are critically oversized. These need immediate refactoring to maintain code quality.
- 🧩 Components: 69 components exceed 300 lines. Split into smaller, focused components for better reusability.
- 🗄️ DAL: 15 DAL files exceed 500 lines. Split by operation type (queries/mutations) or by domain.
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
| component | 464 | 153 | 769 |
| other | 118 | 86 | 628 |
| action | 110 | 181 | 579 |
| dal | 125 | 226 | 652 |
| hook | 62 | 144 | 501 |
| util | 13 | 260 | 420 |

## Oversized Files (Largest First)

### core/staff/components/staff-management-list.tsx
- **Type**: component
- **Current Size**: 769 lines
- **Max Allowed**: 300 lines
- **Excess**: 469 lines
- **Severity**: critical

**Largest Functions:**
- StaffManagementList: 686 lines (lines 83-769)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: StaffManagementList

### core/staff/components/staff-analytics.tsx
- **Type**: component
- **Current Size**: 727 lines
- **Max Allowed**: 300 lines
- **Excess**: 427 lines
- **Severity**: critical

**Largest Functions:**
- StaffAnalytics: 649 lines (lines 78-727)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: StaffAnalytics

### core/customers/components/customer-create-form.tsx
- **Type**: component
- **Current Size**: 701 lines
- **Max Allowed**: 300 lines
- **Excess**: 401 lines
- **Severity**: critical

**Largest Functions:**
- CustomerCreateForm: 591 lines (lines 110-701)
- FORM_STEPS: 2 lines (lines 67-69)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: CustomerCreateForm

### core/appointments/components/appointment-list-enhanced.tsx
- **Type**: component
- **Current Size**: 683 lines
- **Max Allowed**: 300 lines
- **Excess**: 383 lines
- **Severity**: critical

**Largest Functions:**
- AppointmentListEnhanced: 585 lines (lines 98-683)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: AppointmentListEnhanced

### core/campaigns/components/steps/audience-selector.tsx
- **Type**: component
- **Current Size**: 674 lines
- **Max Allowed**: 300 lines
- **Excess**: 374 lines
- **Severity**: critical

**Largest Functions:**
- AudienceSelector: 595 lines (lines 76-671)
- PREDEFINED_SEGMENTS: 7 lines (lines 38-45)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: AudienceSelector

### core/appointments/components/appointment-details-modal.tsx
- **Type**: component
- **Current Size**: 668 lines
- **Max Allowed**: 300 lines
- **Excess**: 368 lines
- **Severity**: critical

**Largest Functions:**
- AppointmentDetailsModal: 561 lines (lines 107-668)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: AppointmentDetailsModal

### core/booking/components/booking-live-feed.tsx
- **Type**: component
- **Current Size**: 662 lines
- **Max Allowed**: 300 lines
- **Excess**: 362 lines
- **Severity**: critical

**Largest Functions:**
- BookingLiveFeed: 602 lines (lines 60-662)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: BookingLiveFeed

### core/admin/dal/index.ts
- **Type**: dal
- **Current Size**: 652 lines
- **Max Allowed**: 500 lines
- **Excess**: 152 lines
- **Severity**: critical

**Largest Functions:**
- getPlatformSalons: 126 lines (lines 301-427)
- getPlatformUsers: 111 lines (lines 185-296)
- getAdminDashboardStats: 95 lines (lines 85-180)

**Split Suggestions:**
- Split by domain (queries.ts, mutations.ts)
- Extract complex queries to separate files
- Create repository pattern classes
- Extract large functions: getPlatformSalons, getPlatformUsers, getAdminDashboardStats

### core/users/components/users-dashboard.tsx
- **Type**: component
- **Current Size**: 648 lines
- **Max Allowed**: 300 lines
- **Excess**: 348 lines
- **Severity**: critical

**Largest Functions:**
- UsersDashboard: 568 lines (lines 80-648)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: UsersDashboard

### core/staff/components/staff-schedule-manager.tsx
- **Type**: component
- **Current Size**: 646 lines
- **Max Allowed**: 300 lines
- **Excess**: 346 lines
- **Severity**: critical

**Largest Functions:**
- StaffScheduleManager: 562 lines (lines 84-646)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: StaffScheduleManager

### core/staff/components/time-attendance-tracker.tsx
- **Type**: component
- **Current Size**: 644 lines
- **Max Allowed**: 300 lines
- **Excess**: 344 lines
- **Severity**: critical

**Largest Functions:**
- TimeAttendanceTracker: 588 lines (lines 56-644)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: TimeAttendanceTracker

### core/admin/components/salon-management.tsx
- **Type**: component
- **Current Size**: 642 lines
- **Max Allowed**: 300 lines
- **Excess**: 342 lines
- **Severity**: critical

**Largest Functions:**
- SalonManagement: 565 lines (lines 77-642)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: SalonManagement

### core/shared/tools/dev-experience-optimizer.ts
- **Type**: other
- **Current Size**: 628 lines
- **Max Allowed**: 400 lines
- **Excess**: 228 lines
- **Severity**: critical

**Largest Functions:**
- createDevExperienceOptimizer: 2 lines (lines 626-628)

### core/inventory/components/products/product-form.tsx
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

### core/salons/components/service-catalog.tsx
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

### core/salons/components/location-manager.tsx
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

### core/staff/components/payroll-manager.tsx
- **Type**: component
- **Current Size**: 600 lines
- **Max Allowed**: 300 lines
- **Excess**: 300 lines
- **Severity**: critical

**Largest Functions:**
- PayrollManager: 552 lines (lines 48-600)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: PayrollManager

### core/customer/dal/reviews.ts
- **Type**: dal
- **Current Size**: 599 lines
- **Max Allowed**: 500 lines
- **Excess**: 99 lines
- **Severity**: medium

**Largest Functions:**
- getPendingReviews: 70 lines (lines 529-599)
- getCustomerReviews: 2 lines (lines 4-6)
- submitReview: 2 lines (lines 140-142)

**Split Suggestions:**
- Split by domain (queries.ts, mutations.ts)
- Extract complex queries to separate files
- Create repository pattern classes
- Extract large functions: getPendingReviews

### core/customers/components/list-enhanced.tsx
- **Type**: component
- **Current Size**: 598 lines
- **Max Allowed**: 300 lines
- **Excess**: 298 lines
- **Severity**: critical

**Largest Functions:**
- CustomersListEnhanced: 473 lines (lines 125-598)
- CustomerTableSkeleton: 59 lines (lines 64-123)

**Split Suggestions:**
- Extract large functions to custom hooks
- Consider component composition pattern
- Extract large functions: CustomersListEnhanced, CustomerTableSkeleton

### core/users/components/security-center.tsx
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
