# Claude Agent Analysis Report

Generated: 2025-09-19T11:42:16.767Z

## Project Health

- **Score**: 0/100 (F)
- **Can Build**: ❌ No
- **Ready for Deployment**: ❌ No
- **Priority**: CRITICAL

## Error Summary

- **Total Errors**: 3334
- **TypeScript Errors**: 2250
- **ESLint Errors**: 1083
- **Build Errors**: 1

## Structure Issues

## Agent Instructions

### Steps to Fix (IN ORDER):

4. Fix errors in top 10 files with most errors (one file at a time):
5. Use quality-deployment-ready to fix build errors
6. Run quality-deployment-ready for final validation

### Files to Fix (Top Priority):


#### core/customer/components/booking/manager.tsx (49 errors)
- Line 12: Cannot find module './booking-utils/booking-manager-types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 13: Cannot find module '../types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 14: Cannot find module './booking-sections/booking-actions-toolbar' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 15: Cannot find module './booking-sections/booking-filters-section' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 16: Cannot find module './booking-sections/booking-list-section' or its corresponding type declarations.
  Fix: Add missing import or install missing package

#### core/salon/actions/billing/refund.action.ts (44 errors)
- Line 4: Cannot find module '../dal/billing-types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 31: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 40: Property 'stripe_payment_intent_id' does not exist on type 'never'.
  Fix: Property does not exist - add property or fix typo
- Line 52: Property 'stripe_payment_intent_id' does not exist on type 'never'.
  Fix: Property does not exist - add property or fix typo
- Line 65: Property 'metadata' does not exist on type 'never'.
  Fix: Property does not exist - add property or fix typo

#### core/salon/actions/billing/invoice.action.ts (42 errors)
- Line 4: Cannot find module '../dal/billing-types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 36: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 47: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 49: Property 'billing_id' does not exist on type 'never'.
  Fix: Property does not exist - add property or fix typo
- Line 54: No overload matches this call.
  Fix: Review error and fix accordingly

#### core/staff/components/schedule/manager.tsx (42 errors)
- Line 56: Cannot find module '../actions' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 57: Cannot find module '../dal/staff-types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 58: Cannot find module './schedule-pattern-dialog' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 59: Cannot find module './timeoff-request-dialog' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 3: 'useOptimistic' is defined but never used. Allowed unused vars must match /^_/u.
  Fix: Remove unused variable or add underscore prefix

#### core/customer/hooks/use-bookings.ts (38 errors)
- Line 6: Module '"../types"' has no exported member 'BookingWizardState'.
  Fix: Review error and fix accordingly
- Line 7: Module '"../types"' has no exported member 'BookingListItem'.
  Fix: Review error and fix accordingly
- Line 8: Module '"../types"' has no exported member 'BookingFilters'.
  Fix: Review error and fix accordingly
- Line 9: Module '"../types"' has no exported member 'TimeSlot'.
  Fix: Review error and fix accordingly
- Line 10: Module '"../types"' has no exported member 'Service'.
  Fix: Review error and fix accordingly

#### core/salon/dal/billing/billing.queries.ts (37 errors)
- Line 9: Cannot find module './billing-types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 23: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 80: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 101: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 112: No overload matches this call.
  Fix: Review error and fix accordingly

#### core/salon/components/dashboard/service-catalog.tsx (34 errors)
- Line 103: 'service.sale_price' is possibly 'undefined'.
  Fix: Review error and fix accordingly
- Line 4: 'CardDescription' is defined but never used. Allowed unused vars must match /^_/u.
  Fix: Remove unused variable or add underscore prefix
- Line 8: 'Tabs' is defined but never used. Allowed unused vars must match /^_/u.
  Fix: Remove unused variable or add underscore prefix
- Line 8: 'TabsContent' is defined but never used. Allowed unused vars must match /^_/u.
  Fix: Remove unused variable or add underscore prefix
- Line 8: 'TabsList' is defined but never used. Allowed unused vars must match /^_/u.
  Fix: Remove unused variable or add underscore prefix

#### core/customer/index.ts (32 errors)
- Line 10: Cannot find module './actions/profile-actions' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 19: Cannot find module './actions/booking-actions' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 26: Cannot find module './actions/customer-loyalty-enrollment-actions' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 33: Cannot find module './actions/customer-loyalty-points-actions' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 37: Module '"./hooks"' has no exported member 'useBookings'.
  Fix: Review error and fix accordingly

#### core/salon/dal/inventory/inventory.queries.ts (32 errors)
- Line 15: Cannot find module './types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 27: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 66: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 86: No overload matches this call.
  Fix: Review error and fix accordingly
- Line 109: No overload matches this call.
  Fix: Review error and fix accordingly

#### core/salon/dal/inventory/purchase-order.mutations.ts (31 errors)
- Line 5: Cannot find module './types' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 6: Cannot find module './stock-mutations' or its corresponding type declarations.
  Fix: Add missing import or install missing package
- Line 18: Parameter 'sum' implicitly has an 'any' type.
  Fix: Review error and fix accordingly
- Line 18: Parameter 'item' implicitly has an 'any' type.
  Fix: Review error and fix accordingly
- Line 24: No overload matches this call.
  Fix: Review error and fix accordingly