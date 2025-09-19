# Component Compliance Report

Generated: 2025-09-19T11:43:52.054Z

## Summary

- **Total Components**: 397
- **Compliant**: 97 (24%)
- **Non-Compliant**: 300
- **Custom Components**: 51

## Recommendations

- 🚨 CRITICAL: Less than 50% shadcn/ui compliance. Major refactoring needed to standardize components.
- 🔄 Replace custom components: 51 custom components found. Prioritize replacing high-usage components with shadcn/ui equivalents.
- 📦 Remove non-shadcn libraries: 11 imports from other UI libraries detected. Replace all with shadcn/ui components.
- ✅ Most used shadcn components: card (202), button (169), badge (116), input (66), alert (65)

## Components Needing Attention (Worst First)

### core/auth/components/login/login.tsx
**Compliance Score**: 0%
**Issues**: 16

**Issue Types:**
- custom-css: 16 occurrences

**Example Issues:**
- Line 75: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 89: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 97: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/auth/components/password-reset/reset-password.tsx
**Compliance Score**: 0%
**Issues**: 20

**Issue Types:**
- custom-css: 20 occurrences

**Example Issues:**
- Line 115: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 117: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 132: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/auth/components/register/register.tsx
**Compliance Score**: 0%
**Issues**: 31

**Issue Types:**
- custom-css: 31 occurrences

**Example Issues:**
- Line 122: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 136: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 144: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/customer/components/appointments/history.tsx
**Compliance Score**: 0%
**Issues**: 12

**Issue Types:**
- custom-component: 2 occurrences
- custom-css: 10 occurrences

**Example Issues:**
- Line 34: Custom component AppointmentFilters used
  Suggestion: Consider using shadcn/ui component
- Line 123: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 157: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/customer/components/booking/confirmation.tsx
**Compliance Score**: 0%
**Issues**: 18

**Issue Types:**
- custom-css: 18 occurrences

**Example Issues:**
- Line 183: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 209: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 214: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/customer/components/booking/feed-display.tsx
**Compliance Score**: 0%
**Issues**: 10

**Issue Types:**
- custom-css: 10 occurrences

**Example Issues:**
- Line 88: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 103: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 107: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/customer/components/booking/list.tsx
**Compliance Score**: 0%
**Issues**: 19

**Issue Types:**
- custom-css: 19 occurrences

**Example Issues:**
- Line 66: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 129: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 133: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/customer/components/booking/service-selection.tsx
**Compliance Score**: 0%
**Issues**: 13

**Issue Types:**
- custom-css: 13 occurrences

**Example Issues:**
- Line 83: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 94: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 99: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/customer/components/booking/staff-selection.tsx
**Compliance Score**: 0%
**Issues**: 16

**Issue Types:**
- custom-css: 16 occurrences

**Example Issues:**
- Line 78: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 96: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 140: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/customer/components/booking/time-selection.tsx
**Compliance Score**: 0%
**Issues**: 10

**Issue Types:**
- custom-css: 10 occurrences

**Example Issues:**
- Line 196: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 258: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 262: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

## Custom Components to Replace

### AppointmentStatus
- **Usage Count**: 8
- **First Seen**: core/salon/components/appointments/calendar-appointment-card.tsx

### CustomerProfile
- **Usage Count**: 4
- **First Seen**: core/customer/components/dashboard/dashboard-container.tsx

### AppointmentFilters
- **Usage Count**: 3
- **First Seen**: core/customer/components/appointments/history.tsx

### AppointmentHistoryItem
- **Usage Count**: 2
- **First Seen**: core/customer/components/dashboard/dashboard-container.tsx

### AppointmentWithRelations
- **Usage Count**: 2
- **First Seen**: core/salon/components/appointments/calendar.tsx

### AppointmentsManagement
- **Usage Count**: 2
- **First Seen**: app/(admin)/admin/appointments/page.tsx

### CustomersManagement
- **Usage Count**: 2
- **First Seen**: app/(admin)/admin/customers/page.tsx

### AppointmentCard
- **Usage Count**: 1
- **First Seen**: core/customer/components/appointments/history.tsx

### CustomerFavorite
- **Usage Count**: 1
- **First Seen**: core/customer/components/dashboard/dashboard-container.tsx

### CustomerLoyalty
- **Usage Count**: 1
- **First Seen**: core/customer/components/dashboard/dashboard-container.tsx
