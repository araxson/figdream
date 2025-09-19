# Component Compliance Report

Generated: 2025-09-19T02:01:13.324Z

## Summary

- **Total Components**: 432
- **Compliant**: 74 (17%)
- **Non-Compliant**: 358
- **Custom Components**: 45

## Recommendations

- 🚨 CRITICAL: Less than 50% shadcn/ui compliance. Major refactoring needed to standardize components.
- 🔄 Replace custom components: 45 custom components found. Prioritize replacing high-usage components with shadcn/ui equivalents.
- 🎨 Remove inline styles: 24 inline styles found. Convert all inline styles to Tailwind utility classes.
- 🔧 Add cn() utility: 7332 className attributes without cn(). Use cn() for proper class merging and composition.
- 📦 Remove non-shadcn libraries: 11 imports from other UI libraries detected. Replace all with shadcn/ui components.
- ✅ Most used shadcn components: card (240), button (198), badge (146), alert (80), input (80)

## Components Needing Attention (Worst First)

### core/admin/components/admin-dashboard.tsx
**Compliance Score**: 0%
**Issues**: 94

**Issue Types:**
- missing-cn: 81 occurrences
- custom-css: 13 occurrences

**Example Issues:**
- Line 85: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 87: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 89: className without cn() utility
  Suggestion: Use cn() for className composition

### core/admin/components/salon-management.tsx
**Compliance Score**: 0%
**Issues**: 78

**Issue Types:**
- missing-cn: 61 occurrences
- custom-css: 17 occurrences

**Example Issues:**
- Line 212: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 213: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 220: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/admin/components/user-management.tsx
**Compliance Score**: 0%
**Issues**: 53

**Issue Types:**
- missing-cn: 41 occurrences
- custom-css: 12 occurrences

**Example Issues:**
- Line 180: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 181: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 188: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/analytics/components/analytics-charts.tsx
**Compliance Score**: 0%
**Issues**: 35

**Issue Types:**
- missing-cn: 32 occurrences
- custom-css: 3 occurrences

**Example Issues:**
- Line 47: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 53: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 62: className without cn() utility
  Suggestion: Use cn() for className composition

### core/analytics/components/analytics-header.tsx
**Compliance Score**: 0%
**Issues**: 10

**Issue Types:**
- missing-cn: 8 occurrences
- custom-css: 2 occurrences

**Example Issues:**
- Line 31: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 33: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 34: className without cn() utility
  Suggestion: Use cn() for className composition

### core/analytics/components/analytics-insights.tsx
**Compliance Score**: 0%
**Issues**: 58

**Issue Types:**
- missing-cn: 52 occurrences
- custom-css: 6 occurrences

**Example Issues:**
- Line 43: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 44: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 47: className without cn() utility
  Suggestion: Use cn() for className composition

### core/analytics/components/analytics-metrics.tsx
**Compliance Score**: 0%
**Issues**: 10

**Issue Types:**
- missing-cn: 7 occurrences
- custom-css: 3 occurrences

**Example Issues:**
- Line 61: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 64: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 65: className without cn() utility
  Suggestion: Use cn() for className composition

### core/analytics/components/metric-card.tsx
**Compliance Score**: 0%
**Issues**: 23

**Issue Types:**
- custom-css: 2 occurrences
- missing-cn: 21 occurrences

**Example Issues:**
- Line 90: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes
- Line 96: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 104: Custom CSS class used instead of Tailwind
  Suggestion: Replace with Tailwind utility classes

### core/appointments/components/appointment-details-modal.tsx
**Compliance Score**: 0%
**Issues**: 123

**Issue Types:**
- custom-component: 1 occurrences
- missing-cn: 91 occurrences
- custom-css: 31 occurrences

**Example Issues:**
- Line 85: Custom component AppointmentStatus used
  Suggestion: Consider using shadcn/ui component
- Line 86: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 87: className without cn() utility
  Suggestion: Use cn() for className composition

### core/appointments/components/appointment-form.tsx
**Compliance Score**: 0%
**Issues**: 13

**Issue Types:**
- non-shadcn: 1 occurrences
- missing-cn: 10 occurrences
- custom-component: 1 occurrences
- custom-css: 1 occurrences

**Example Issues:**
- Line 6: Non-shadcn UI library detected
  Suggestion: Replace with shadcn/ui components
- Line 186: className without cn() utility
  Suggestion: Use cn() for className composition
- Line 187: className without cn() utility
  Suggestion: Use cn() for className composition

## Custom Components to Replace

### AppointmentStatus
- **Usage Count**: 5
- **First Seen**: core/appointments/components/appointment-details-modal.tsx

### CustomerProfile
- **Usage Count**: 4
- **First Seen**: core/customer/components/dashboard/customer-dashboard-wrapper.tsx

### AppointmentsManagement
- **Usage Count**: 3
- **First Seen**: app/(admin)/admin/appointments/page.tsx

### AppointmentWithRelations
- **Usage Count**: 2
- **First Seen**: core/appointments/components/appointments-page-client.tsx

### AppointmentFilters
- **Usage Count**: 2
- **First Seen**: core/appointments/components/appointments.tsx

### AppointmentHistoryItem
- **Usage Count**: 2
- **First Seen**: core/customer/components/dashboard/customer-dashboard-wrapper.tsx

### AppContext
- **Usage Count**: 2
- **First Seen**: core/integration/components/context-orchestrator.tsx

### CustomersManagement
- **Usage Count**: 2
- **First Seen**: app/(admin)/admin/customers/page.tsx

### CustomerSelection
- **Usage Count**: 1
- **First Seen**: core/appointments/components/appointment-form.tsx

### AppointmentWithDetails
- **Usage Count**: 1
- **First Seen**: core/appointments/components/appointment-list-optimistic.tsx
