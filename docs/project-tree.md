# Project Structure

Generated: 2025-09-19T01:59:29.767Z

```
figdream/
├── app/
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx
│   │   │   ├── roles/
│   │   │   │   └── page.tsx
│   │   │   ├── salons/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── staff/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── [id]/
│   │   │   │   ├── management/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── (auth)/
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   ├── verify-otp/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── (customer)/
│   │   ├── booking/
│   │   │   ├── confirmation/
│   │   │   │   └── [id]/
│   │   │   ├── demo/
│   │   │   │   └── page.tsx
│   │   │   ├── manage/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── customer/
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── book/
│   │   │   │   ├── [salonSlug]/
│   │   │   │   └── page.tsx
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── preferences/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── loading.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── billing/
│   │   │   │   ├── invoices/
│   │   │   │   └── revenue/
│   │   │   ├── campaigns/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   └── page.tsx
│   │   │   ├── inventory/
│   │   │   │   └── page.tsx
│   │   │   ├── loyalty/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── reviews/
│   │   │   │   └── page.tsx
│   │   │   ├── salon/
│   │   │   │   └── page.tsx
│   │   │   ├── salons/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── staff/
│   │   │   │   ├── [id]/
│   │   │   │   ├── attendance/
│   │   │   │   ├── payroll/
│   │   │   │   ├── performance/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── loading.tsx
│   ├── (public)/
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── reviews/
│   │   │   └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── (staff)/
│   │   ├── staff/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── appointments/
│   │   │   │   └── page.tsx
│   │   │   ├── customers/
│   │   │   │   └── page.tsx
│   │   │   ├── messages/
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   ├── services/
│   │   │   │   └── page.tsx
│   │   │   ├── time-off/
│   │   │   │   └── page.tsx
│   │   │   ├── time-tracking/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── loading.tsx
│   ├── api/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   │   ├── health/
│   │   │   │   └── stats/
│   │   │   ├── salons/
│   │   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   ├── users/
│   │   │   │   ├── [id]/
│   │   │   │   └── route.ts
│   │   │   └── auth-check.ts
│   │   └── security/
│   │       └── log-error/
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── globals.css
│   ├── layout-integrated.tsx
│   ├── layout.tsx
│   └── not-found.tsx
├── components/
│   └── ui/
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── collapsible.tsx
│       ├── command.tsx
│       ├── context-menu.tsx
│       ├── drawer.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── hover-card.tsx
│       ├── input-otp.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── menubar.tsx
│       ├── navigation-menu.tsx
│       ├── pagination.tsx
│       ├── popover.tsx
│       ├── progress.tsx
│       ├── radio-group.tsx
│       ├── resizable.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── sidebar.tsx
│       ├── skeleton.tsx
│       ├── slider.tsx
│       ├── sonner.tsx
│       ├── switch.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       ├── toggle-group.tsx
│       ├── toggle.tsx
│       └── tooltip.tsx
├── core/
│   ├── admin/
│   │   ├── actions/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── admin-dashboard.tsx
│   │   │   ├── index.ts
│   │   │   ├── salon-management.tsx
│   │   │   └── user-management.tsx
│   │   ├── dal/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   │   ├── admin.types.ts
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── analytics/
│   │   ├── actions/
│   │   │   └── analytics-actions.ts
│   │   ├── components/
│   │   │   ├── analytics-charts-lazy.tsx
│   │   │   ├── analytics-charts.tsx
│   │   │   ├── analytics-header.tsx
│   │   │   ├── analytics-insights.tsx
│   │   │   ├── analytics-metrics.tsx
│   │   │   ├── analytics.tsx
│   │   │   ├── index.ts
│   │   │   └── metric-card.tsx
│   │   ├── dal/
│   │   │   ├── analytics-adapter.ts
│   │   │   ├── analytics-helpers.ts
│   │   │   ├── analytics-mutations.ts
│   │   │   ├── analytics-types.ts
│   │   │   ├── appointment-queries.ts
│   │   │   ├── customer-queries.ts
│   │   │   ├── index.ts
│   │   │   ├── platform-queries.ts
│   │   │   ├── revenue-queries.ts
│   │   │   ├── salon-queries.ts
│   │   │   └── staff-queries.ts
│   │   ├── hooks/
│   │   │   ├── use-analytics-mutations.ts
│   │   │   └── use-analytics.ts
│   │   ├── types/
│   │   │   ├── customer-analytics.types.ts
│   │   │   └── metrics-analytics.types.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── appointments/
│   │   ├── actions/
│   │   │   ├── appointments-actions.ts
│   │   │   ├── availability.ts
│   │   │   ├── crud.ts
│   │   │   ├── form-handlers.ts
│   │   │   ├── index.ts
│   │   │   ├── services.ts
│   │   │   └── status.ts
│   │   ├── components/
│   │   │   ├── appointment-details-modal.tsx
│   │   │   ├── appointment-form.tsx
│   │   │   ├── appointment-list-enhanced.tsx
│   │   │   ├── appointment-list-optimistic.tsx
│   │   │   ├── appointments-page-client.tsx
│   │   │   ├── appointments-page-server.tsx
│   │   │   ├── appointments.tsx
│   │   │   ├── availability-checker.tsx
│   │   │   ├── calendar-enhanced.tsx
│   │   │   ├── calendar-view.tsx
│   │   │   ├── customer-selection.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── filters.tsx
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── list.tsx
│   │   │   ├── payment-details.tsx
│   │   │   ├── schedule-selection.tsx
│   │   │   ├── service-selection.tsx
│   │   │   └── stats.tsx
│   │   ├── dal/
│   │   │   ├── appointments-mutations.ts
│   │   │   ├── appointments-queries.ts
│   │   │   ├── appointments-types.ts
│   │   │   └── appointments.ts
│   │   ├── hooks/
│   │   │   ├── use-appointments-mutations.ts
│   │   │   └── use-appointments.ts
│   │   ├── types/
│   │   │   └── appointments.types.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── audit/
│   │   ├── actions/
│   │   │   └── audit-actions.ts
│   │   ├── components/
│   │   │   └── audit-filters.tsx
│   │   ├── dal/
│   │   │   ├── audit-commands.ts
│   │   │   ├── audit-queries.ts
│   │   │   └── audit-types.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   └── use-audit.ts
│   │   └── types/
│   │       └── index.ts
│   ├── auth/
│   │   ├── actions/
│   │   │   ├── auth-helpers.ts
│   │   │   ├── authentication.ts
│   │   │   ├── authorization.ts
│   │   │   ├── index.ts
│   │   │   ├── security-audit.ts
│   │   │   ├── session-actions.ts
│   │   │   └── user-management.ts
│   │   ├── components/
│   │   │   ├── auth-layout.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── index.ts
│   │   │   ├── login.tsx
│   │   │   ├── password-strength.tsx
│   │   │   ├── register.tsx
│   │   │   ├── reset-password.tsx
│   │   │   └── verify-otp.tsx
│   │   ├── dal/
│   │   ├── hooks/
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── billing/
│   │   ├── actions/
│   │   │   ├── billing-actions.ts
│   │   │   ├── financial-reporting.ts
│   │   │   ├── index.ts
│   │   │   ├── invoice-actions.ts
│   │   │   ├── payment-processing.ts
│   │   │   ├── refund-actions.ts
│   │   │   └── webhook-handlers.ts
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   │   └── revenue-analytics.tsx
│   │   │   ├── billing-list.tsx
│   │   │   ├── billing-stats.tsx
│   │   │   ├── index.ts
│   │   │   ├── invoice-list.tsx
│   │   │   ├── payment-form.tsx
│   │   │   ├── payment-methods.tsx
│   │   │   ├── revenue-analytics.tsx
│   │   │   └── subscription-dashboard.tsx
│   │   ├── dal/
│   │   │   ├── billing-mutations.ts
│   │   │   ├── billing-queries.ts
│   │   │   ├── billing-types.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── use-billing.ts
│   │   ├── types/
│   │   │   ├── billing.types.ts
│   │   │   └── index.ts
│   │   ├── utils/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── booking/
│   │   ├── actions/
│   │   │   ├── actions.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── booking-sections/
│   │   │   │   ├── booking-actions-toolbar.tsx
│   │   │   │   ├── booking-details-modal.tsx
│   │   │   │   ├── booking-filters-section.tsx
│   │   │   │   └── booking-list-section.tsx
│   │   │   ├── booking-utils/
│   │   │   │   ├── booking-manager-helpers.ts
│   │   │   │   └── booking-manager-types.ts
│   │   │   ├── wizard-steps/
│   │   │   │   ├── addons-step.tsx
│   │   │   │   ├── confirmation-step.tsx
│   │   │   │   ├── customer-info-step.tsx
│   │   │   │   ├── datetime-selection-step.tsx
│   │   │   │   ├── payment-step.tsx
│   │   │   │   ├── service-selection-step.tsx
│   │   │   │   └── staff-selection-step.tsx
│   │   │   ├── wizard-utils/
│   │   │   │   ├── mock-data.ts
│   │   │   │   ├── wizard-helpers.ts
│   │   │   │   ├── wizard-state.ts
│   │   │   │   └── wizard-types.ts
│   │   │   ├── availability-calendar.tsx
│   │   │   ├── booking-confirmation.tsx
│   │   │   ├── booking-live-feed.tsx
│   │   │   ├── booking-manager.tsx
│   │   │   ├── booking-stepper.tsx
│   │   │   ├── booking-summary.tsx
│   │   │   ├── booking-wizard-optimized.tsx
│   │   │   ├── booking-wizard-refactored.tsx
│   │   │   ├── booking-wizard.tsx
│   │   │   ├── calendar-conflicts.tsx
│   │   │   ├── calendar-header.tsx
│   │   │   ├── index.ts
│   │   │   ├── service-selector.tsx
│   │   │   ├── staff-availability-display.tsx
│   │   │   ├── time-slot-grid.tsx
│   │   │   └── time-slot-picker.tsx
│   │   ├── dal/
│   │   │   ├── index.ts
│   │   │   ├── mutations.ts
│   │   │   └── queries.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   └── use-bookings.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── types.ts
│   ├── campaigns/
│   │   ├── actions/
│   │   │   ├── campaign-crud.ts
│   │   │   ├── campaign-operations.ts
│   │   │   ├── campaign-queries.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── steps/
│   │   │   │   ├── audience-selector.tsx
│   │   │   │   ├── basic-info.tsx
│   │   │   │   ├── campaign-content.tsx
│   │   │   │   ├── campaign-settings.tsx
│   │   │   │   ├── review-send.tsx
│   │   │   │   └── schedule-settings.tsx
│   │   │   ├── campaign-analytics.tsx
│   │   │   ├── campaign-builder.tsx
│   │   │   ├── campaigns-list.tsx
│   │   │   ├── campaigns-page.tsx
│   │   │   ├── index.ts
│   │   │   └── template-selector.tsx
│   │   ├── dal/
│   │   │   ├── campaigns-mutations.ts
│   │   │   ├── campaigns-queries.ts
│   │   │   ├── campaigns-types.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── use-campaigns.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── customer/
│   │   ├── actions/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── appointments/
│   │   │   │   └── appointment-history.tsx
│   │   │   ├── booking/
│   │   │   │   ├── booking-confirmation.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── salon-search.tsx
│   │   │   │   ├── service-selection.tsx
│   │   │   │   ├── staff-selection.tsx
│   │   │   │   └── time-selection.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── customer-dashboard-wrapper.tsx
│   │   │   │   └── customer-dashboard.tsx
│   │   │   ├── preferences/
│   │   │   │   └── customer-preferences.tsx
│   │   │   ├── profile/
│   │   │   │   ├── customer-profile.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── personal-info-form.tsx
│   │   │   │   ├── preferences-form.tsx
│   │   │   │   └── profile-header.tsx
│   │   │   ├── customer-dashboard.tsx
│   │   │   └── salon-selection.tsx
│   │   ├── dal/
│   │   │   ├── appointments.ts
│   │   │   ├── bookings.ts
│   │   │   ├── favorites.ts
│   │   │   ├── index.ts
│   │   │   ├── loyalty.ts
│   │   │   ├── notifications.ts
│   │   │   ├── profile.ts
│   │   │   └── reviews.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── customers/
│   │   ├── actions/
│   │   │   ├── customer-analytics-actions.ts
│   │   │   ├── customer-crud-actions.ts
│   │   │   ├── customer-preferences-actions.ts
│   │   │   ├── customer-profile-actions.ts
│   │   │   ├── customer-schemas.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── customer-create-form.tsx
│   │   │   ├── customer-filters.tsx
│   │   │   ├── customer-metrics.tsx
│   │   │   ├── customer-notes.tsx
│   │   │   ├── customer-overview.tsx
│   │   │   ├── customer-pagination.tsx
│   │   │   ├── customer-personal-info.tsx
│   │   │   ├── customer-profile-header.tsx
│   │   │   ├── customer-profile-tabs.tsx
│   │   │   ├── customer-profile.tsx
│   │   │   ├── customer-segments.tsx
│   │   │   ├── customer-table.tsx
│   │   │   ├── customers-dashboard.tsx
│   │   │   ├── customers.tsx
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── list-enhanced.tsx
│   │   │   ├── list-virtualized.tsx
│   │   │   ├── list.tsx
│   │   │   └── stats.tsx
│   │   ├── dal/
│   │   │   ├── customers-mutations.ts
│   │   │   ├── customers-queries.ts
│   │   │   └── customers-types.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-customer-management.ts
│   │   │   ├── use-customers-mutations.ts
│   │   │   ├── use-customers-optimistic.ts
│   │   │   └── use-customers.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── dashboard/
│   │   ├── actions/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── dashboard-optimized.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── index.ts
│   │   │   ├── metrics-cards.tsx
│   │   │   ├── quick-actions.tsx
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── staff-performance.tsx
│   │   │   └── today-appointments.tsx
│   │   ├── dal/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   └── types.ts
│   ├── database/
│   │   ├── actions/
│   │   ├── adapters/
│   │   │   └── index.ts
│   │   ├── components/
│   │   ├── dal/
│   │   ├── hooks/
│   │   └── types/
│   ├── favorites/
│   │   ├── actions/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── favorites-list.tsx
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── favorites-mutations.ts
│   │   │   ├── favorites-queries.ts
│   │   │   └── favorites-types.ts
│   │   ├── hooks/
│   │   │   ├── use-favorites-mutations.ts
│   │   │   └── use-favorites.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── gift-cards/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── gift-card-form.tsx
│   │   │   └── gift-card-list.tsx
│   │   ├── dal/
│   │   │   ├── gift-cards-mutations.ts
│   │   │   ├── gift-cards-queries.ts
│   │   │   └── gift-cards-types.ts
│   │   ├── hooks/
│   │   │   └── use-gift-cards.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── integration/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── app-shell.tsx
│   │   │   ├── context-orchestrator.tsx
│   │   │   ├── global-error-boundary.tsx
│   │   │   ├── index.ts
│   │   │   ├── navigation-manager.tsx
│   │   │   ├── notification-center.tsx
│   │   │   └── performance-monitor.tsx
│   │   ├── dal/
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-app-navigation.ts
│   │   │   └── use-global-state.ts
│   │   ├── lib/
│   │   │   ├── feature-registry.ts
│   │   │   └── route-guards.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── index.ts
│   │   └── README.md
│   ├── inventory/
│   │   ├── actions/
│   │   │   ├── actions.ts
│   │   │   ├── index.ts
│   │   │   └── inventory.ts
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   ├── categories/
│   │   │   ├── products/
│   │   │   │   ├── product-form.tsx
│   │   │   │   └── product-list.tsx
│   │   │   ├── purchase-orders/
│   │   │   ├── shared/
│   │   │   │   ├── inventory-empty.tsx
│   │   │   │   ├── inventory-error.tsx
│   │   │   │   └── inventory-loading.tsx
│   │   │   ├── stock/
│   │   │   ├── suppliers/
│   │   │   ├── index.ts
│   │   │   ├── inventory-dashboard.tsx
│   │   │   ├── inventory-form.tsx
│   │   │   ├── inventory-list.tsx
│   │   │   └── inventory-page-server.tsx
│   │   ├── dal/
│   │   │   ├── index.ts
│   │   │   ├── inventory-mutations.ts
│   │   │   ├── inventory-queries.ts
│   │   │   ├── inventory-types.ts
│   │   │   ├── product-mutations.ts
│   │   │   ├── purchase-order-mutations.ts
│   │   │   ├── queries.ts
│   │   │   ├── stock-mutations.ts
│   │   │   ├── supplier-mutations.ts
│   │   │   └── types.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   └── use-inventory.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── layouts/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── mobile-nav.tsx
│   │   │   └── sidebar.tsx
│   │   ├── config/
│   │   │   ├── navigation/
│   │   │   │   ├── customer.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── salon-manager.ts
│   │   │   │   ├── salon-owner.ts
│   │   │   │   ├── staff.ts
│   │   │   │   ├── super-admin.ts
│   │   │   │   └── types.ts
│   │   │   └── permissions.ts
│   │   ├── dal/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── locations/
│   │   ├── actions/
│   │   ├── components/
│   │   │   └── locations-list.tsx
│   │   ├── dal/
│   │   │   ├── locations-mutations.ts
│   │   │   ├── locations-queries.ts
│   │   │   └── locations-types.ts
│   │   ├── hooks/
│   │   │   └── use-locations.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── loyalty/
│   │   ├── actions/
│   │   │   ├── customer-loyalty-actions.ts
│   │   │   ├── index.ts
│   │   │   ├── loyalty-actions.ts
│   │   │   ├── loyalty-helpers.ts
│   │   │   ├── loyalty-schemas.ts
│   │   │   ├── points-actions.ts
│   │   │   ├── program-actions.ts
│   │   │   ├── redemption-actions.ts
│   │   │   └── tier-actions.ts
│   │   ├── components/
│   │   │   ├── analytics.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── index.ts
│   │   │   ├── loading.tsx
│   │   │   ├── main.tsx
│   │   │   ├── members-list.tsx
│   │   │   ├── settings.tsx
│   │   │   └── transactions-list.tsx
│   │   ├── dal/
│   │   │   ├── index.ts
│   │   │   ├── loyalty-types.ts
│   │   │   ├── loyalty.ts
│   │   │   ├── mutations.ts
│   │   │   └── queries.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-mutations.ts
│   │   │   └── use-queries.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── messages/
│   │   ├── actions/
│   │   │   └── messages-actions.ts
│   │   ├── components/
│   │   │   ├── compose-message.tsx
│   │   │   ├── index.ts
│   │   │   ├── message-detail.tsx
│   │   │   ├── messages-management.tsx
│   │   │   ├── messages-view.tsx
│   │   │   ├── messages.tsx
│   │   │   └── thread-list.tsx
│   │   ├── dal/
│   │   │   ├── messages-types.ts
│   │   │   └── messages.ts
│   │   ├── hooks/
│   │   │   ├── use-message-notifications.ts
│   │   │   └── use-messages.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── monitoring/
│   │   ├── actions/
│   │   │   └── error-actions.ts
│   │   ├── components/
│   │   ├── dal/
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── batch-processor.ts
│   │   │   ├── cache-manager.ts
│   │   │   ├── connection-pool.ts
│   │   │   ├── performance-tracker.ts
│   │   │   ├── query-optimizer.ts
│   │   │   └── streaming-utils.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   ├── PERFORMANCE_OPTIMIZATION_GUIDE.md
│   │   ├── performance-monitor.tsx
│   │   └── types.ts
│   ├── notifications/
│   │   ├── actions/
│   │   │   ├── delete-notification.ts
│   │   │   ├── index.ts
│   │   │   ├── notification-actions.ts
│   │   │   ├── notification-preferences.ts
│   │   │   ├── notification-queries.ts
│   │   │   ├── notification-types.ts
│   │   │   ├── send-notification.ts
│   │   │   └── update-notification.ts
│   │   ├── components/
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── list.tsx
│   │   │   ├── notifications.tsx
│   │   │   ├── notifications.tsx.bak
│   │   │   └── stats.tsx
│   │   ├── dal/
│   │   │   ├── notifications-mutations.ts
│   │   │   ├── notifications-queries.ts
│   │   │   ├── notifications-types.ts
│   │   │   └── notifications.ts
│   │   ├── hooks/
│   │   │   ├── use-notifications-mutations.ts
│   │   │   └── use-notifications.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── packages/
│   │   ├── actions/
│   │   ├── components/
│   │   │   └── packages-list.tsx
│   │   ├── dal/
│   │   │   ├── packages-mutations.ts
│   │   │   ├── packages-queries.ts
│   │   │   └── packages-types.ts
│   │   ├── hooks/
│   │   │   └── use-packages.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── performance/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── optimized-image.tsx
│   │   │   ├── suspense-boundaries.tsx
│   │   │   └── virtual-list.tsx
│   │   ├── dal/
│   │   ├── hooks/
│   │   ├── providers/
│   │   │   └── performance-provider.tsx
│   │   ├── types/
│   │   ├── utils/
│   │   │   ├── cache.ts
│   │   │   └── metrics.ts
│   │   ├── index.ts
│   │   └── PERFORMANCE_OPTIMIZATIONS.md
│   ├── profiles/
│   │   ├── actions/
│   │   ├── components/
│   │   │   └── profile-form.tsx
│   │   ├── dal/
│   │   │   ├── profiles-mutations.ts
│   │   │   ├── profiles-queries.ts
│   │   │   └── profiles-types.ts
│   │   ├── hooks/
│   │   │   └── use-profiles.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── providers/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   └── root-provider.tsx
│   │   ├── dal/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── public/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── about-page.tsx
│   │   │   ├── contact-info.tsx
│   │   │   ├── contact-page.tsx
│   │   │   ├── cta-section.tsx
│   │   │   ├── faq-accordion.tsx
│   │   │   ├── features-grid.tsx
│   │   │   ├── hero-section.tsx
│   │   │   ├── index.ts
│   │   │   ├── landing-page.tsx
│   │   │   ├── pricing-cards.tsx
│   │   │   ├── pricing-page.tsx
│   │   │   ├── services-list.tsx
│   │   │   ├── services-page.tsx
│   │   │   ├── team-grid.tsx
│   │   │   └── testimonials-carousel.tsx
│   │   ├── dal/
│   │   │   ├── public-queries.ts
│   │   │   └── public-types.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── referrals/
│   │   ├── actions/
│   │   ├── components/
│   │   │   └── referrals-list.tsx
│   │   ├── dal/
│   │   │   ├── referrals-mutations.ts
│   │   │   ├── referrals-queries.ts
│   │   │   └── referrals-types.ts
│   │   ├── hooks/
│   │   │   └── use-referrals.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── reviews/
│   │   ├── actions/
│   │   │   ├── index.ts
│   │   │   ├── review-analytics-actions.ts
│   │   │   ├── review-crud-actions.ts
│   │   │   ├── review-helpers.ts
│   │   │   ├── review-moderation-actions.ts
│   │   │   ├── review-response-actions.ts
│   │   │   └── review-schemas.ts
│   │   ├── components/
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── list.tsx
│   │   │   ├── pending.tsx
│   │   │   ├── public-reviews.tsx
│   │   │   ├── reviews.tsx
│   │   │   └── stats.tsx
│   │   ├── dal/
│   │   │   ├── reviews-mutations.ts
│   │   │   ├── reviews-queries.ts
│   │   │   └── reviews-types.ts
│   │   ├── hooks/
│   │   │   ├── use-reviews-mutations.ts
│   │   │   └── use-reviews.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── roles/
│   │   ├── actions/
│   │   ├── components/
│   │   │   └── roles-list.tsx
│   │   ├── dal/
│   │   │   ├── roles-mutations.ts
│   │   │   ├── roles-queries.ts
│   │   │   └── roles-types.ts
│   │   ├── hooks/
│   │   │   └── use-roles.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── salon-chains/
│   │   ├── actions/
│   │   ├── components/
│   │   │   └── salon-chains-list.tsx
│   │   ├── dal/
│   │   │   ├── salon-chains-mutations.ts
│   │   │   ├── salon-chains-queries.ts
│   │   │   └── salon-chains-types.ts
│   │   ├── hooks/
│   │   │   └── use-salon-chains.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── salons/
│   │   ├── actions/
│   │   │   ├── business-hours.ts
│   │   │   ├── create.ts
│   │   │   ├── crud.ts
│   │   │   ├── index.ts
│   │   │   ├── queries.ts
│   │   │   ├── salons-actions.ts
│   │   │   └── settings.ts
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   │   ├── analytics-controls.tsx
│   │   │   │   ├── appointment-analytics.tsx
│   │   │   │   ├── customer-insights.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── revenue-dashboard.tsx
│   │   │   │   ├── service-performance.tsx
│   │   │   │   └── types.ts
│   │   │   ├── booking-configuration.tsx
│   │   │   ├── business-hours-settings.tsx
│   │   │   ├── business-settings.tsx
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── list.tsx
│   │   │   ├── location-manager.tsx
│   │   │   ├── map.tsx
│   │   │   ├── notification-preferences.tsx
│   │   │   ├── payment-configuration.tsx
│   │   │   ├── salon-analytics.tsx
│   │   │   ├── salon-card.tsx
│   │   │   ├── salon-dashboard.tsx
│   │   │   ├── salons.tsx
│   │   │   ├── salons.tsx.bak
│   │   │   └── stats.tsx
│   │   ├── dal/
│   │   │   ├── salons-mutations.ts
│   │   │   ├── salons-queries.ts
│   │   │   ├── salons-types.ts
│   │   │   └── salons.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   └── use-salon-data.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── schedules/
│   │   ├── actions/
│   │   │   └── scheduling-actions.ts
│   │   ├── components/
│   │   │   ├── availability-manager.tsx
│   │   │   ├── conflict-resolver.tsx
│   │   │   ├── index.ts
│   │   │   ├── schedule-calendar.tsx
│   │   │   ├── schedule-optimizer.tsx
│   │   │   └── schedules-list.tsx
│   │   ├── dal/
│   │   │   ├── schedules-mutations.ts
│   │   │   ├── schedules-queries.ts
│   │   │   └── schedules-types.ts
│   │   ├── hooks/
│   │   │   ├── use-conflict-detection.ts
│   │   │   ├── use-optimization.ts
│   │   │   ├── use-schedule-sync.ts
│   │   │   └── use-schedules.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── security/
│   │   ├── actions/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── auth-verification.ts
│   │   │   └── secure-dal-patterns.ts
│   │   ├── dtos/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── rate-limiter.ts
│   │   ├── validation/
│   │   │   └── schemas.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── actions/
│   │   │   ├── create.ts
│   │   │   ├── crud.ts
│   │   │   ├── form-handlers.ts
│   │   │   ├── index.ts
│   │   │   ├── management.ts
│   │   │   ├── services-actions.ts
│   │   │   └── staff-assignment.ts
│   │   ├── components/
│   │   │   ├── categories.tsx
│   │   │   ├── filters.tsx
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── list.tsx
│   │   │   ├── services.tsx
│   │   │   ├── services.tsx.bak
│   │   │   └── stats.tsx
│   │   ├── dal/
│   │   │   ├── services-mutations.ts
│   │   │   ├── services-queries.ts
│   │   │   ├── services-types.ts
│   │   │   └── services.ts
│   │   ├── hooks/
│   │   │   ├── use-services-mutations.ts
│   │   │   └── use-services.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── settings/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   ├── settings-form-optimistic.tsx
│   │   │   └── settings-layout.tsx
│   │   ├── dal/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── index.ts
│   ├── shared/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── loading/
│   │   │   │   ├── appointments-skeleton.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── staff-detail-skeleton.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── error-recovery.tsx
│   │   │   ├── lazy-component.tsx
│   │   │   └── optimized-loading.tsx
│   │   ├── dal/
│   │   │   └── database-adapters.ts
│   │   ├── hooks/
│   │   │   ├── optimistic/
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-optimistic-batch.ts
│   │   │   │   ├── use-optimistic-crud.ts
│   │   │   │   ├── use-optimistic-form.ts
│   │   │   │   ├── use-optimistic-list.ts
│   │   │   │   └── use-optimistic-toggle.ts
│   │   │   ├── use-optimistic-updates.ts
│   │   │   └── use-realtime-sync.ts
│   │   ├── layouts/
│   │   │   └── optimized-layout.tsx
│   │   ├── tools/
│   │   │   ├── architecture-orchestrator.ts
│   │   │   ├── dependency-analyzer.ts
│   │   │   ├── dev-experience-optimizer.ts
│   │   │   ├── index.ts
│   │   │   ├── performance-optimizer.ts
│   │   │   └── security-analyzer.ts
│   │   ├── types/
│   │   │   ├── base.types.ts
│   │   │   └── enums.types.ts
│   │   ├── utils/
│   │   │   ├── dynamic-imports.tsx
│   │   │   ├── error-handling.ts
│   │   │   └── index.ts
│   │   ├── empty-states.tsx
│   │   ├── index.ts
│   │   └── loading-states.tsx
│   ├── staff/
│   │   ├── actions/
│   │   │   ├── index.ts
│   │   │   ├── staff-action-schemas.ts
│   │   │   ├── staff-action-types.ts
│   │   │   ├── staff-bulk-actions.ts
│   │   │   ├── staff-crud-actions.ts
│   │   │   ├── staff-schedule-actions.ts
│   │   │   ├── staff-service-actions.ts
│   │   │   └── types.ts
│   │   ├── components/
│   │   │   ├── analytics/
│   │   │   │   ├── index.ts
│   │   │   │   ├── performance-metrics.tsx
│   │   │   │   ├── staff-analytics-comparison.tsx
│   │   │   │   ├── staff-analytics-header.tsx
│   │   │   │   ├── staff-analytics-insights.tsx
│   │   │   │   ├── staff-analytics-metrics.tsx
│   │   │   │   ├── staff-analytics-refactored.tsx
│   │   │   │   ├── staff-analytics-trends.tsx
│   │   │   │   ├── staff-performance-table.tsx
│   │   │   │   ├── staff-top-performers.tsx
│   │   │   │   └── types.ts
│   │   │   ├── onboarding/
│   │   │   │   ├── access-step.tsx
│   │   │   │   ├── compensation-step.tsx
│   │   │   │   ├── documents-step.tsx
│   │   │   │   ├── index.tsx
│   │   │   │   ├── personal-info-step.tsx
│   │   │   │   ├── professional-step.tsx
│   │   │   │   ├── review-step.tsx
│   │   │   │   ├── schedule-step.tsx
│   │   │   │   ├── services-step.tsx
│   │   │   │   ├── skills-step.tsx
│   │   │   │   └── types.ts
│   │   │   ├── profile-view-sections/
│   │   │   │   ├── profile-earnings-section.tsx
│   │   │   │   ├── profile-header-section.tsx
│   │   │   │   ├── profile-info-section.tsx
│   │   │   │   ├── profile-performance-section.tsx
│   │   │   │   ├── profile-schedule-section.tsx
│   │   │   │   └── profile-services-section.tsx
│   │   │   ├── profile-view-utils/
│   │   │   │   ├── profile-view-helpers.ts
│   │   │   │   └── profile-view-types.ts
│   │   │   ├── filters.tsx
│   │   │   ├── grid.tsx
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── list.tsx
│   │   │   ├── payroll-manager.tsx
│   │   │   ├── performance-dashboard.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── schedule-manager.tsx
│   │   │   ├── schedule.tsx
│   │   │   ├── staff-analytics.tsx
│   │   │   ├── staff-basic-info.tsx
│   │   │   ├── staff-batch-optimistic.tsx
│   │   │   ├── staff-customers.tsx
│   │   │   ├── staff-dashboard.tsx
│   │   │   ├── staff-detail-page.tsx
│   │   │   ├── staff-management-list.tsx
│   │   │   ├── staff-onboarding.tsx
│   │   │   ├── staff-performance-metrics.tsx
│   │   │   ├── staff-professional-info.tsx
│   │   │   ├── staff-profile-card.tsx
│   │   │   ├── staff-profile-header.tsx
│   │   │   ├── staff-profile-view.tsx
│   │   │   ├── staff-reviews.tsx
│   │   │   ├── staff-schedule-manager.tsx
│   │   │   ├── staff.tsx
│   │   │   ├── stats.tsx
│   │   │   ├── time-attendance-tracker.tsx
│   │   │   └── time-off.tsx
│   │   ├── dal/
│   │   │   ├── index.ts
│   │   │   ├── staff-mutations.ts
│   │   │   ├── staff-queries.ts
│   │   │   ├── staff-types.ts
│   │   │   └── staff.ts
│   │   ├── hooks/
│   │   │   ├── use-staff-mutations.ts
│   │   │   └── use-staff.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── subscriptions/
│   │   ├── actions/
│   │   │   ├── billing-actions.ts
│   │   │   ├── create-actions.ts
│   │   │   ├── delete-actions.ts
│   │   │   ├── index.ts
│   │   │   ├── read-actions.ts
│   │   │   ├── subscription-helpers.ts
│   │   │   ├── subscription-types.ts
│   │   │   └── update-actions.ts
│   │   ├── components/
│   │   │   └── subscriptions-list.tsx
│   │   ├── dal/
│   │   │   ├── subscriptions-mutations.ts
│   │   │   ├── subscriptions-queries.ts
│   │   │   └── subscriptions-types.ts
│   │   ├── hooks/
│   │   │   └── use-subscriptions.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── time-off/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── index.ts
│   │   │   └── time-off-list.tsx
│   │   ├── dal/
│   │   │   ├── time-off-mutations.ts
│   │   │   ├── time-off-queries.ts
│   │   │   └── time-off-types.ts
│   │   ├── hooks/
│   │   │   └── use-time-off.ts
│   │   ├── types/
│   │   ├── index.ts
│   │   └── types.ts
│   ├── types/
│   │   ├── actions/
│   │   ├── components/
│   │   ├── dal/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── database.ts
│   │   └── index.ts
│   ├── ui/
│   │   ├── actions/
│   │   ├── components/
│   │   │   ├── breadcrumbs.tsx
│   │   │   ├── dashboard-widgets.tsx
│   │   │   ├── data-table.tsx
│   │   │   ├── empty-state.tsx
│   │   │   ├── empty-states-library.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── form-feedback.tsx
│   │   │   ├── index.ts
│   │   │   ├── list-skeleton.tsx
│   │   │   ├── loading-state.tsx
│   │   │   ├── mobile-responsive.tsx
│   │   │   ├── notifications.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── production-polish.tsx
│   │   │   ├── search-filter.tsx
│   │   │   ├── skeleton-patterns.tsx
│   │   │   ├── status-indicators.tsx
│   │   │   └── ux-patterns-example.tsx
│   │   ├── dal/
│   │   ├── helpers/
│   │   │   └── feedback.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   └── use-mobile.ts
│   │   ├── types/
│   │   └── index.ts
│   └── users/
│       ├── actions/
│       │   ├── index.ts
│       │   ├── user-analytics-actions.ts
│       │   ├── user-bulk-actions.ts
│       │   ├── user-crud-actions.ts
│       │   ├── user-helpers.ts
│       │   ├── user-management-actions.ts
│       │   ├── user-read-actions.ts
│       │   ├── user-schemas.ts
│       │   └── user-security-actions.ts
│       ├── components/
│       │   ├── profile-sections/
│       │   │   ├── activity-section.tsx
│       │   │   ├── index.ts
│       │   │   ├── notification-settings-section.tsx
│       │   │   ├── personal-info-section.tsx
│       │   │   ├── profile-header.tsx
│       │   │   ├── role-permissions-section.tsx
│       │   │   └── security-section.tsx
│       │   ├── profile-utils/
│       │   │   ├── index.ts
│       │   │   ├── profile-helpers.ts
│       │   │   ├── profile-types.ts
│       │   │   └── profile-validation.ts
│       │   ├── index.ts
│       │   ├── role-manager.tsx
│       │   ├── security-center.tsx
│       │   ├── user-form.tsx
│       │   ├── user-onboarding-flow.tsx
│       │   ├── user-profile-editor.tsx
│       │   ├── users-dashboard.tsx
│       │   ├── users-list.tsx
│       │   └── users-management.tsx
│       ├── dal/
│       │   ├── users-mutations.ts
│       │   ├── users-queries.ts
│       │   └── users-types.ts
│       ├── hooks/
│       ├── types/
│       ├── index.ts
│       └── types.ts
├── docs/
│   ├── agent-action-plan.md
│   ├── claude-analysis.json
│   ├── claude-analysis.md
│   ├── component-compliance-report.md
│   ├── component-compliance.json
│   ├── dal-security-report.json
│   ├── dal-security-report.md
│   ├── database-type-issues.json
│   ├── database-type-report.md
│   ├── error-priority-queue.json
│   ├── error-priority-report.md
│   ├── file-size-report.md
│   ├── oversized-files.json
│   ├── project-tree.md
│   └── rules.md
├── hooks/
│   └── use-mobile.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── providers.tsx
│   └── utils.ts
├── scripts/
│   ├── agent-workflow.ts
│   ├── analyzer-claude.ts
│   ├── claude-health-check.ts
│   ├── component-compliance-checker.ts
│   ├── dal-security-scanner.ts
│   ├── database-type-validator.ts
│   ├── error-prioritizer.ts
│   ├── file-size-validator.ts
│   └── project-tree-generator.ts
├── supabase/
│   └── migrations/
├── types/
│   └── database.types.ts (80.6KB)
├── CLAUDE.md
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json (2.4KB)
├── PAYMENT-ARCHITECTURE.md
├── postcss.config.mjs
├── README.md
├── supabase-security-audit-report.md
├── tsconfig.json (842B)
└── tsconfig.tsbuildinfo
```

## Statistics

- **Total Folders**: 404
- **Total Files**: 959
- **Total Items**: 1363

## Structure Validation

### Required Directories

- ✅ app
- ✅ app/(auth)
- ✅ app/(admin)
- ✅ app/(dashboard)
- ✅ app/(staff)
- ✅ app/(customer)
- ✅ app/(public)
- ✅ core
- ✅ components/ui
- ✅ lib
- ✅ types

### Forbidden Directories

- ✅ Not present src
- ✅ Not present components/features
- ✅ Not present app/(management)

## Core Feature Modules

### core/admin/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/analytics/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/appointments/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/audit/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/audit-logs/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ❌ Missing types/

### core/auth/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/billing/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/booking/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/campaigns/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/customer/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/customers/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/dashboard/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/database/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/favorites/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/gift-cards/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/integration/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/inventory/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/layouts/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/locations/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/loyalty/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/messages/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/monitoring/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/notifications/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/packages/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/performance/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/profiles/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/providers/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/public/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/referrals/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/reviews/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/roles/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/salon-chains/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/salons/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/schedules/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/security/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/services/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/settings/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/shared/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/staff/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/subscriptions/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/time-off/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/types/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/ui/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/users/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

## Potential Issues

- ⚠️ Component too large: core/admin/components/admin-dashboard.tsx (359 lines, max 300)
- ⚠️ Component too large: core/admin/components/salon-management.tsx (642 lines, max 300)
- ⚠️ Component too large: core/admin/components/user-management.tsx (503 lines, max 300)
- ⚠️ DAL file too large: core/admin/dal/index.ts (652 lines, max 500)
- ⚠️ Component too large: core/appointments/components/appointment-details-modal.tsx (668 lines, max 300)
- ⚠️ Component too large: core/appointments/components/appointment-list-enhanced.tsx (683 lines, max 300)
- ⚠️ Component too large: core/appointments/components/appointment-list-optimistic.tsx (386 lines, max 300)
- ⚠️ Component too large: core/appointments/components/appointments-page-client.tsx (420 lines, max 300)
- ⚠️ Component too large: core/appointments/components/availability-checker.tsx (414 lines, max 300)
- ⚠️ Component too large: core/appointments/components/calendar-enhanced.tsx (523 lines, max 300)
- ⚠️ Component too large: core/appointments/components/list.tsx (345 lines, max 300)
- ⚠️ Component too large: core/appointments/components/schedule-selection.tsx (325 lines, max 300)
- ⚠️ Component too large: core/audit/components/audit-filters.tsx (358 lines, max 300)
- ⚠️ Component too large: core/audit/components/audit-log-viewer.tsx (444 lines, max 300)
- ⚠️ Component too large: core/auth/components/register.tsx (457 lines, max 300)
- ⚠️ Component too large: core/billing/components/analytics/revenue-analytics.tsx (392 lines, max 300)
- ⚠️ Component too large: core/billing/components/payment-form.tsx (314 lines, max 300)
- ⚠️ Component too large: core/billing/components/revenue-analytics.tsx (412 lines, max 300)
- ⚠️ Component too large: core/billing/components/subscription-dashboard.tsx (467 lines, max 300)
- ⚠️ Component too large: core/booking/components/booking-confirmation.tsx (536 lines, max 300)
- ⚠️ Component too large: core/booking/components/booking-live-feed.tsx (662 lines, max 300)
- ⚠️ Component too large: core/booking/components/booking-sections/booking-list-section.tsx (325 lines, max 300)
- ⚠️ DAL file too large: core/booking/dal/queries.ts (576 lines, max 500)
- ⚠️ Component too large: core/campaigns/components/campaign-analytics.tsx (476 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/campaigns-list.tsx (441 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/campaigns-page.tsx (503 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/steps/audience-selector.tsx (674 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/steps/campaign-content.tsx (339 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/steps/campaign-settings.tsx (543 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/steps/review-send.tsx (430 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/steps/schedule-settings.tsx (524 lines, max 300)
- ⚠️ Component too large: core/campaigns/components/template-selector.tsx (458 lines, max 300)
- ⚠️ DAL file too large: core/campaigns/dal/campaigns-mutations.ts (553 lines, max 500)
- ⚠️ DAL file too large: core/campaigns/dal/campaigns-queries.ts (501 lines, max 500)
- ⚠️ Component too large: core/customer/components/appointments/appointment-history.tsx (387 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/booking-confirmation.tsx (379 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/salon-search.tsx (386 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/staff-selection.tsx (303 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/time-selection.tsx (398 lines, max 300)
- ⚠️ Component too large: core/customer/components/profile/personal-info-form.tsx (318 lines, max 300)
- ⚠️ Component too large: core/customer/components/profile/preferences-form.tsx (360 lines, max 300)
- ⚠️ DAL file too large: core/customer/dal/bookings.ts (512 lines, max 500)
- ⚠️ DAL file too large: core/customer/dal/reviews.ts (599 lines, max 500)
- ⚠️ Component too large: core/customers/components/customer-create-form.tsx (701 lines, max 300)
- ⚠️ Component too large: core/customers/components/customer-segments.tsx (466 lines, max 300)
- ⚠️ Component too large: core/customers/components/list-enhanced.tsx (598 lines, max 300)
- ⚠️ Component too large: core/customers/components/list.tsx (307 lines, max 300)
- ⚠️ DAL file too large: core/customers/dal/customers-queries.ts (530 lines, max 500)
- ⚠️ Component too large: core/gift-cards/components/gift-card-form.tsx (327 lines, max 300)
- ⚠️ Component too large: core/integration/components/context-orchestrator.tsx (339 lines, max 300)
- ⚠️ Component too large: core/inventory/components/products/product-form.tsx (619 lines, max 300)
- ⚠️ Component too large: core/inventory/components/products/product-list.tsx (469 lines, max 300)
- ⚠️ DAL file too large: core/inventory/dal/queries.ts (516 lines, max 500)
- ⚠️ DAL file too large: core/loyalty/dal/mutations.ts (555 lines, max 500)
- ⚠️ DAL file too large: core/loyalty/dal/queries.ts (591 lines, max 500)
- ⚠️ Component too large: core/salons/components/location-manager.tsx (613 lines, max 300)
- ⚠️ Component too large: core/salons/components/salon-dashboard.tsx (471 lines, max 300)
- ⚠️ Component too large: core/salons/components/service-catalog.tsx (617 lines, max 300)
- ⚠️ Component too large: core/schedules/components/availability-manager.tsx (554 lines, max 300)
- ⚠️ Component too large: core/schedules/components/conflict-resolver.tsx (460 lines, max 300)
- ⚠️ Component too large: core/schedules/components/schedule-calendar.tsx (446 lines, max 300)
- ⚠️ Component too large: core/schedules/components/schedule-optimizer.tsx (567 lines, max 300)
- ⚠️ DAL file too large: core/schedules/dal/schedules-mutations.ts (570 lines, max 500)
- ⚠️ DAL file too large: core/security/dal/auth-verification.ts (548 lines, max 500)
- ⚠️ Component too large: core/settings/components/settings-form-optimistic.tsx (423 lines, max 300)
- ⚠️ Component too large: core/shared/components/error-recovery.tsx (435 lines, max 300)
- ⚠️ Component too large: core/shared/components/optimized-loading.tsx (447 lines, max 300)
- ⚠️ Component too large: core/staff/components/payroll-manager.tsx (600 lines, max 300)
- ⚠️ Component too large: core/staff/components/performance-dashboard.tsx (476 lines, max 300)
- ⚠️ Component too large: core/staff/components/schedule-manager.tsx (597 lines, max 300)
- ⚠️ Component too large: core/staff/components/staff-analytics.tsx (727 lines, max 300)
- ⚠️ Component too large: core/staff/components/staff-batch-optimistic.tsx (452 lines, max 300)
- ⚠️ Component too large: core/staff/components/staff-dashboard.tsx (524 lines, max 300)
- ⚠️ Component too large: core/staff/components/staff-management-list.tsx (769 lines, max 300)
- ⚠️ Component too large: core/staff/components/staff-schedule-manager.tsx (646 lines, max 300)
- ⚠️ Component too large: core/staff/components/time-attendance-tracker.tsx (644 lines, max 300)
- ⚠️ DAL file too large: core/staff/dal/index.ts (527 lines, max 500)
- ⚠️ DAL file too large: core/staff/dal/staff-mutations.ts (514 lines, max 500)
- ⚠️ Component too large: core/ui/components/dashboard-widgets.tsx (414 lines, max 300)
- ⚠️ Component too large: core/ui/components/data-table.tsx (306 lines, max 300)
- ⚠️ Component too large: core/ui/components/empty-state.tsx (410 lines, max 300)
- ⚠️ Component too large: core/ui/components/empty-states-library.tsx (364 lines, max 300)
- ⚠️ Component too large: core/ui/components/notifications.tsx (353 lines, max 300)
- ⚠️ Component too large: core/ui/components/skeleton-patterns.tsx (354 lines, max 300)
- ⚠️ Component too large: core/ui/components/status-indicators.tsx (416 lines, max 300)
- ⚠️ Component too large: core/ui/components/ux-patterns-example.tsx (370 lines, max 300)
- ⚠️ Component too large: core/users/components/role-manager.tsx (469 lines, max 300)
- ⚠️ Component too large: core/users/components/security-center.tsx (598 lines, max 300)
- ⚠️ Component too large: core/users/components/user-onboarding-flow.tsx (489 lines, max 300)
- ⚠️ Component too large: core/users/components/users-dashboard.tsx (648 lines, max 300)
- ⚠️ DAL file too large: core/users/dal/users-queries.ts (549 lines, max 500)
- ⚠️ Component outside ui/: components/ui/accordion.tsx
- ⚠️ Component outside ui/: components/ui/alert-dialog.tsx
- ⚠️ Component outside ui/: components/ui/alert.tsx
- ⚠️ Component outside ui/: components/ui/aspect-ratio.tsx
- ⚠️ Component outside ui/: components/ui/avatar.tsx
- ⚠️ Component outside ui/: components/ui/badge.tsx
- ⚠️ Component outside ui/: components/ui/breadcrumb.tsx
- ⚠️ Component outside ui/: components/ui/button.tsx
- ⚠️ Component outside ui/: components/ui/calendar.tsx
- ⚠️ Component outside ui/: components/ui/card.tsx
- ⚠️ Component outside ui/: components/ui/carousel.tsx
- ⚠️ Component outside ui/: components/ui/chart.tsx
- ⚠️ Component outside ui/: components/ui/checkbox.tsx
- ⚠️ Component outside ui/: components/ui/collapsible.tsx
- ⚠️ Component outside ui/: components/ui/command.tsx
- ⚠️ Component outside ui/: components/ui/context-menu.tsx
- ⚠️ Component outside ui/: components/ui/dialog.tsx
- ⚠️ Component outside ui/: components/ui/drawer.tsx
- ⚠️ Component outside ui/: components/ui/dropdown-menu.tsx
- ⚠️ Component outside ui/: components/ui/form.tsx
- ⚠️ Component outside ui/: components/ui/hover-card.tsx
- ⚠️ Component outside ui/: components/ui/input-otp.tsx
- ⚠️ Component outside ui/: components/ui/input.tsx
- ⚠️ Component outside ui/: components/ui/label.tsx
- ⚠️ Component outside ui/: components/ui/menubar.tsx
- ⚠️ Component outside ui/: components/ui/navigation-menu.tsx
- ⚠️ Component outside ui/: components/ui/pagination.tsx
- ⚠️ Component outside ui/: components/ui/popover.tsx
- ⚠️ Component outside ui/: components/ui/progress.tsx
- ⚠️ Component outside ui/: components/ui/radio-group.tsx
- ⚠️ Component outside ui/: components/ui/resizable.tsx
- ⚠️ Component outside ui/: components/ui/scroll-area.tsx
- ⚠️ Component outside ui/: components/ui/select.tsx
- ⚠️ Component outside ui/: components/ui/separator.tsx
- ⚠️ Component outside ui/: components/ui/sheet.tsx
- ⚠️ Component outside ui/: components/ui/sidebar.tsx
- ⚠️ Component outside ui/: components/ui/skeleton.tsx
- ⚠️ Component outside ui/: components/ui/slider.tsx
- ⚠️ Component outside ui/: components/ui/sonner.tsx
- ⚠️ Component outside ui/: components/ui/switch.tsx
- ⚠️ Component outside ui/: components/ui/table.tsx
- ⚠️ Component outside ui/: components/ui/tabs.tsx
- ⚠️ Component outside ui/: components/ui/textarea.tsx
- ⚠️ Component outside ui/: components/ui/toggle-group.tsx
- ⚠️ Component outside ui/: components/ui/toggle.tsx
- ⚠️ Component outside ui/: components/ui/tooltip.tsx