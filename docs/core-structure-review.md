# Core Folder Structure Review

Generated on: Fri 19 Sep 2025 03:11:21 MDT

```
core/
├── auth/
│   ├── actions/
│   │   ├── auth/
│   │   │   ├── auth-helpers.ts
│   │   │   ├── authentication.ts
│   │   │   ├── authorization.ts
│   │   │   ├── index.ts
│   │   │   └── session-actions.ts
```

## Naming Issues Analysis

### Files with Multiple Hyphens (potential verbose naming):

### Files with Redundant Words:

### Oversized Files (needs splitting):
#### Components (>300 lines):
- `core/salon/components/customers/create-form.tsx` (     312 lines)
- `core/salon/components/customers/list.tsx` (     306 lines)
- `core/salon/components/customers/segments.tsx` (     465 lines)
- `core/salon/components/appointments/availability-checker.tsx` (     413 lines)
- `core/salon/components/appointments/calendar.tsx` (     522 lines)
- `core/salon/components/appointments/schedule-selection.tsx` (     324 lines)
- `core/salon/components/appointments/page-client.tsx` (     419 lines)
- `core/salon/components/dashboard/location-manager.tsx` (     612 lines)
- `core/salon/components/dashboard/salon-dashboard.tsx` (     470 lines)
- `core/salon/components/dashboard/service-catalog.tsx` (     616 lines)
- `core/salon/components/inventory/product-list.tsx` (     468 lines)
- `core/salon/components/inventory/product-form.tsx` (     618 lines)
- `core/salon/components/marketing/schedule-settings.tsx` (     523 lines)
- `core/salon/components/marketing/review-send.tsx` (     429 lines)
- `core/salon/components/marketing/campaigns-page.tsx` (     502 lines)
- `core/salon/components/marketing/campaign-content.tsx` (     338 lines)
- `core/salon/components/marketing/campaign-analytics.tsx` (     475 lines)
- `core/salon/components/marketing/campaign-settings.tsx` (     542 lines)
- `core/salon/components/marketing/template-selector.tsx` (     457 lines)
- `core/salon/components/marketing/campaigns-list.tsx` (     440 lines)
- `core/salon/components/staff/dashboard.tsx` (     523 lines)
- `core/salon/components/staff/payroll-manager.tsx` (     601 lines)
- `core/salon/components/staff/batch-operations.tsx` (     451 lines)
- `core/salon/components/billing/subscription-dashboard.tsx` (     466 lines)
- `core/salon/components/billing/payment-form.tsx` (     313 lines)
- `core/salon/components/billing/revenue-analytics.tsx` (     391 lines)
- `core/auth/components/register/register.tsx` (     456 lines)
- `core/platform/components/settings/form.tsx` (     422 lines)
- `core/platform/components/admin/security-center.tsx` (     597 lines)
- `core/platform/components/admin/dashboard.tsx` (     358 lines)
- `core/platform/components/admin/onboarding-flow.tsx` (     488 lines)
- `core/platform/components/admin/role-manager.tsx` (     468 lines)
- `core/platform/components/admin/user-management.tsx` (     502 lines)
- `core/shared/components/states.tsx` (     408 lines)
- `core/shared/components/optimized-loading.tsx` (     446 lines)
- `core/shared/components/error-recovery.tsx` (     434 lines)
- `core/staff/components/schedule/calendar.tsx` (     445 lines)
- `core/staff/components/schedule/manager.tsx` (     499 lines)
- `core/staff/components/schedule/conflict-resolver.tsx` (     459 lines)
- `core/staff/components/schedule/availability-manager.tsx` (     553 lines)
- `core/staff/components/schedule/optimizer.tsx` (     566 lines)
- `core/staff/components/dashboard/performance.tsx` (     475 lines)
- `core/customer/components/appointments/history.tsx` (     386 lines)
- `core/customer/components/booking/confirmation.tsx` (     535 lines)
- `core/customer/components/booking/list.tsx` (     324 lines)
- `core/customer/components/booking/staff-selection.tsx` (     302 lines)
- `core/customer/components/booking/time-selection.tsx` (     397 lines)
- `core/customer/components/common/gift-card-form.tsx` (     326 lines)
- `core/customer/components/common/salon-search.tsx` (     385 lines)
- `core/customer/components/profile/preferences-form.tsx` (     359 lines)
- `core/customer/components/profile/personal-info-form.tsx` (     317 lines)

#### DAL Files (>500 lines):
- `core/salon/dal/campaigns-mutations.ts` (     552 lines)
- `core/salon/dal/inventory-queries.ts` (     515 lines)
- `core/salon/dal/customer-queries.ts` (     529 lines)
- `core/platform/dal/users-queries.ts` (     531 lines)
- `core/staff/dal/schedule-mutations.ts` (     569 lines)
- `core/staff/dal/staff-mutations.ts` (     513 lines)

## Module Structure Compliance

### auth
✅ All required folders present

### customer
✅ All required folders present

### platform
✅ All required folders present

### public
✅ All required folders present

### salon
✅ All required folders present

### shared
✅ All required folders present

### staff
✅ All required folders present


## Statistics
- Total files:      678
- Total directories:      113
- TypeScript files:      678
