# Project Structure

Generated: 2025-09-19T11:42:15.834Z

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
│       ├── sidebar-core.tsx
│       ├── sidebar-group.tsx
│       ├── sidebar-index.ts
│       ├── sidebar-layout.tsx
│       ├── sidebar-menu.tsx
│       ├── sidebar-provider.tsx
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
│       ├── tooltip.tsx
│       └── typography.tsx
├── core/
│   ├── auth/
│   │   ├── actions/
│   │   │   ├── auth/
│   │   │   │   ├── auth-helpers.action.ts
│   │   │   │   ├── authentication.action.ts
│   │   │   │   ├── authorization.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── session.action.ts
│   │   │   ├── security/
│   │   │   │   ├── index.ts
│   │   │   │   └── security-audit.action.ts
│   │   │   ├── user/
│   │   │   │   ├── index.ts
│   │   │   │   └── user-management.action.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── login/
│   │   │   │   ├── index.ts
│   │   │   │   └── login.tsx
│   │   │   ├── password-reset/
│   │   │   │   ├── forgot-password.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── reset-password.tsx
│   │   │   ├── register/
│   │   │   │   ├── index.ts
│   │   │   │   └── register.tsx
│   │   │   ├── security/
│   │   │   │   ├── index.ts
│   │   │   │   ├── password-strength.tsx
│   │   │   │   └── verify-otp.tsx
│   │   │   ├── auth-layout.tsx
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── index.ts
│   │   │   ├── mutations.ts
│   │   │   └── queries.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-auth.ts
│   │   │   └── use-session.ts
│   │   ├── types/
│   │   │   ├── entities/
│   │   │   │   └── index.ts
│   │   │   ├── forms/
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── customer/
│   │   ├── actions/
│   │   │   ├── booking/
│   │   │   │   ├── booking.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── special.action.ts
│   │   │   ├── loyalty/
│   │   │   │   ├── enrollment.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── loyalty-helpers.ts
│   │   │   │   ├── loyalty-schemas.ts
│   │   │   │   ├── loyalty.action.ts
│   │   │   │   ├── points.action.ts
│   │   │   │   ├── program.action.ts
│   │   │   │   ├── redemption.action.ts
│   │   │   │   └── tier.action.ts
│   │   │   ├── profile/
│   │   │   │   ├── index.ts
│   │   │   │   ├── portal.action.ts
│   │   │   │   └── profile.action.ts
│   │   │   ├── reviews/
│   │   │   │   ├── analytics.action.ts
│   │   │   │   ├── crud.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── moderation.action.ts
│   │   │   │   ├── response.action.ts
│   │   │   │   ├── review-helpers.ts
│   │   │   │   └── review-schemas.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── appointments/
│   │   │   │   ├── history.tsx
│   │   │   │   └── index.ts
│   │   │   ├── booking/
│   │   │   │   ├── addons-step.tsx
│   │   │   │   ├── availability-calendar.tsx
│   │   │   │   ├── calendar-conflicts.tsx
│   │   │   │   ├── calendar-header.tsx
│   │   │   │   ├── confirmation-step.tsx
│   │   │   │   ├── confirmation.tsx
│   │   │   │   ├── datetime-selection-step.tsx
│   │   │   │   ├── details-modal.tsx
│   │   │   │   ├── feed-display.tsx
│   │   │   │   ├── feed-header.tsx
│   │   │   │   ├── feed-stats.tsx
│   │   │   │   ├── filters.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── info-step.tsx
│   │   │   │   ├── list.tsx
│   │   │   │   ├── live-feed.tsx
│   │   │   │   ├── manager.tsx
│   │   │   │   ├── payment-step.tsx
│   │   │   │   ├── service-selection-step.tsx
│   │   │   │   ├── service-selection.tsx
│   │   │   │   ├── service-selector.tsx
│   │   │   │   ├── staff-availability-display.tsx
│   │   │   │   ├── staff-selection-step.tsx
│   │   │   │   ├── staff-selection.tsx
│   │   │   │   ├── stats-display.tsx
│   │   │   │   ├── stepper.tsx
│   │   │   │   ├── summary.tsx
│   │   │   │   ├── time-selection.tsx
│   │   │   │   ├── time-slot-grid.tsx
│   │   │   │   ├── time-slot-picker.tsx
│   │   │   │   ├── toolbar.tsx
│   │   │   │   └── wizard.tsx
│   │   │   ├── common/
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── error-boundary.tsx
│   │   │   │   ├── favorites-list.tsx
│   │   │   │   ├── gift-card-form.tsx
│   │   │   │   ├── gift-card-list.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── list.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   ├── packages-list.tsx
│   │   │   │   ├── pending.tsx
│   │   │   │   ├── public-reviews.tsx
│   │   │   │   ├── reviews.tsx
│   │   │   │   ├── salon-search.tsx
│   │   │   │   ├── salon-selection.tsx
│   │   │   │   ├── settings.tsx
│   │   │   │   └── stats.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard-container.tsx
│   │   │   │   └── index.tsx
│   │   │   ├── forms/
│   │   │   │   └── index.ts
│   │   │   ├── loyalty/
│   │   │   │   ├── analytics.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── loyalty-dashboard.tsx
│   │   │   │   ├── members-list.tsx
│   │   │   │   └── transactions-list.tsx
│   │   │   ├── modals/
│   │   │   │   └── index.ts
│   │   │   ├── profile/
│   │   │   │   ├── header.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── main.tsx
│   │   │   │   ├── personal-info-form.tsx
│   │   │   │   ├── preferences-form.tsx
│   │   │   │   └── preferences.tsx
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── analytics.queries.ts
│   │   │   ├── index.ts
│   │   │   ├── mutations.ts
│   │   │   ├── queries.ts
│   │   │   └── relationships.queries.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-booking-feed.ts
│   │   │   ├── use-booking-websocket.ts
│   │   │   ├── use-bookings.ts
│   │   │   ├── use-favorites-mutations.ts
│   │   │   ├── use-favorites.ts
│   │   │   ├── use-gift-cards.ts
│   │   │   ├── use-mutations.ts
│   │   │   ├── use-packages.ts
│   │   │   ├── use-queries.ts
│   │   │   ├── use-reviews-mutations.ts
│   │   │   └── use-reviews.ts
│   │   ├── reviews/
│   │   │   └── components/
│   │   │       └── index.ts
│   │   ├── types/
│   │   │   ├── booking-manager.types.ts
│   │   │   ├── favorites.types.ts
│   │   │   ├── gift-cards.types.ts
│   │   │   ├── index.ts
│   │   │   ├── loyalty.types.ts
│   │   │   ├── packages.types.ts
│   │   │   ├── portal.types.ts
│   │   │   ├── reviews.types.ts
│   │   │   └── wizard.types.ts
│   │   └── index.ts
│   ├── customers/
│   │   └── components/
│   │       └── index.ts
│   ├── messages/
│   │   └── components/
│   │       ├── index.ts
│   │       └── messages.tsx
│   ├── notifications/
│   │   └── components/
│   │       ├── index.ts
│   │       └── notifications-management.tsx
│   ├── platform/
│   │   ├── actions/
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.action.ts
│   │   │   │   └── index.ts
│   │   │   ├── users/
│   │   │   │   ├── index.ts
│   │   │   │   ├── user-action-handlers.action.ts
│   │   │   │   ├── user-analytics-actions.action.ts
│   │   │   │   ├── user-bulk-actions.action.ts
│   │   │   │   ├── user-crud-actions.action.ts
│   │   │   │   ├── user-helpers.ts
│   │   │   │   ├── user-management-actions.action.ts
│   │   │   │   ├── user-read-actions.action.ts
│   │   │   │   ├── user-schemas.ts
│   │   │   │   └── user-security-actions.action.ts
│   │   │   └── index.ts
│   │   ├── analytics/
│   │   │   └── components/
│   │   │       └── index.ts
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── activity-section.tsx
│   │   │   │   ├── bulk-actions.tsx
│   │   │   │   ├── dashboard-bulk-actions.tsx
│   │   │   │   ├── dashboard-filters.tsx
│   │   │   │   ├── dashboard-main.tsx
│   │   │   │   ├── dashboard-stats.tsx
│   │   │   │   ├── dashboard-table.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── notification-settings.tsx
│   │   │   │   ├── onboarding-flow.tsx
│   │   │   │   ├── personal-info.tsx
│   │   │   │   ├── profile-editor.tsx
│   │   │   │   ├── profile-header.tsx
│   │   │   │   ├── role-manager.tsx
│   │   │   │   ├── role-permissions.tsx
│   │   │   │   ├── roles-list.tsx
│   │   │   │   ├── salon-dropdown.tsx
│   │   │   │   ├── salon-filters.tsx
│   │   │   │   ├── salon-management.tsx
│   │   │   │   ├── salon-table-row.tsx
│   │   │   │   ├── salon-utils.tsx
│   │   │   │   ├── security-center.tsx
│   │   │   │   ├── security-section.tsx
│   │   │   │   ├── stats-cards.tsx
│   │   │   │   ├── table-row.tsx
│   │   │   │   ├── toolbar.tsx
│   │   │   │   ├── user-form.tsx
│   │   │   │   ├── user-management.tsx
│   │   │   │   ├── users-list.tsx
│   │   │   │   ├── users-management.tsx
│   │   │   │   └── users-table.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.tsx
│   │   │   │   ├── charts-lazy.tsx
│   │   │   │   ├── charts.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── management.tsx
│   │   │   │   ├── metric-card.tsx
│   │   │   │   ├── metrics.tsx
│   │   │   │   └── revenue-chart.tsx
│   │   │   ├── settings/
│   │   │   │   ├── form.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── layout.tsx
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── admin/
│   │   │   │   ├── admin.mutations.ts
│   │   │   │   ├── admin.queries.ts
│   │   │   │   └── index.ts
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.adapter.ts
│   │   │   │   ├── analytics.helpers.ts
│   │   │   │   ├── analytics.mutations.ts
│   │   │   │   ├── appointment.queries.ts
│   │   │   │   ├── customer.queries.ts
│   │   │   │   ├── dashboard.queries.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── revenue.queries.ts
│   │   │   │   ├── salon.queries.ts
│   │   │   │   └── staff.queries.ts
│   │   │   ├── roles/
│   │   │   │   ├── index.ts
│   │   │   │   ├── roles.mutations.ts
│   │   │   │   └── roles.queries.ts
│   │   │   ├── users/
│   │   │   │   ├── index.ts
│   │   │   │   ├── users.mutations.ts
│   │   │   │   └── users.queries.ts
│   │   │   ├── index.ts
│   │   │   ├── mutations.ts
│   │   │   ├── platform.queries.ts
│   │   │   ├── platform.types.ts
│   │   │   └── queries.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-analytics-mutations.ts
│   │   │   ├── use-analytics.ts
│   │   │   ├── use-roles.ts
│   │   │   ├── use-user-selection.ts
│   │   │   └── use-users-data.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── public/
│   │   ├── actions/
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── about/
│   │   │   │   ├── about-page.tsx
│   │   │   │   ├── faq-accordion.tsx
│   │   │   │   └── team-grid.tsx
│   │   │   ├── contact/
│   │   │   │   ├── contact-info.tsx
│   │   │   │   └── contact-page.tsx
│   │   │   ├── landing/
│   │   │   │   ├── cta-section.tsx
│   │   │   │   ├── features-grid.tsx
│   │   │   │   ├── hero-section.tsx
│   │   │   │   ├── landing-page.tsx
│   │   │   │   └── testimonials-carousel.tsx
│   │   │   ├── pricing/
│   │   │   │   ├── pricing-cards.tsx
│   │   │   │   └── pricing-page.tsx
│   │   │   ├── services/
│   │   │   │   ├── services-list.tsx
│   │   │   │   └── services-page.tsx
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── index.ts
│   │   │   ├── mutations.ts
│   │   │   └── queries.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── salon/
│   │   ├── actions/
│   │   │   ├── appointments/
│   │   │   │   ├── availability.action.ts
│   │   │   │   ├── crud.action.ts
│   │   │   │   ├── forms.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── services.action.ts
│   │   │   │   └── status.action.ts
│   │   │   ├── auth/
│   │   │   │   └── index.ts
│   │   │   ├── billing/
│   │   │   │   ├── billing.action.ts
│   │   │   │   ├── financial-reporting.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── invoice.action.ts
│   │   │   │   ├── payment.action.ts
│   │   │   │   ├── refund.action.ts
│   │   │   │   ├── webhook-handlers.ts
│   │   │   │   ├── webhook-types.ts
│   │   │   │   └── webhooks.action.ts
│   │   │   ├── customers/
│   │   │   │   ├── analytics.action.ts
│   │   │   │   ├── crud.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── preferences.action.ts
│   │   │   │   └── profile.action.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── business-hours.action.ts
│   │   │   │   ├── chain-management.action.ts
│   │   │   │   ├── create.action.ts
│   │   │   │   ├── crud.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── location-management.action.ts
│   │   │   │   ├── queries.action.ts
│   │   │   │   └── settings.action.ts
│   │   │   ├── inventory/
│   │   │   │   ├── index.ts
│   │   │   │   ├── inventory.action.ts
│   │   │   │   └── management.action.ts
│   │   │   ├── mutations/
│   │   │   │   └── index.ts
│   │   │   ├── queries/
│   │   │   │   └── index.ts
│   │   │   ├── services/
│   │   │   │   ├── create.action.ts
│   │   │   │   ├── crud.action.ts
│   │   │   │   ├── forms.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── management.action.ts
│   │   │   │   └── staff-assignment.action.ts
│   │   │   └── index.ts
│   │   ├── appointments/
│   │   │   └── components/
│   │   │       └── index.ts
│   │   ├── components/
│   │   │   ├── appointments/
│   │   │   │   ├── availability-checker.tsx
│   │   │   │   ├── bulk-actions.tsx
│   │   │   │   ├── calendar-appointment-card.tsx
│   │   │   │   ├── calendar-day-view.tsx
│   │   │   │   ├── calendar-view.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── customer-selection.tsx
│   │   │   │   ├── details-header.tsx
│   │   │   │   ├── details-modal.tsx
│   │   │   │   ├── details-tab.tsx
│   │   │   │   ├── empty-state.tsx
│   │   │   │   ├── filters.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── history-tab.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── index.tsx
│   │   │   │   ├── list.tsx
│   │   │   │   ├── modal-header.tsx
│   │   │   │   ├── page-client.tsx
│   │   │   │   ├── page-server.tsx
│   │   │   │   ├── payment-details.tsx
│   │   │   │   ├── payment-tab.tsx
│   │   │   │   ├── row-expansion.tsx
│   │   │   │   ├── schedule-selection.tsx
│   │   │   │   ├── service-selection.tsx
│   │   │   │   ├── services-tab.tsx
│   │   │   │   ├── stats.tsx
│   │   │   │   ├── table-header.tsx
│   │   │   │   └── table-row.tsx
│   │   │   ├── billing/
│   │   │   │   ├── index.ts
│   │   │   │   ├── invoice-list.tsx
│   │   │   │   ├── list.tsx
│   │   │   │   ├── payment-form.tsx
│   │   │   │   ├── payment-methods.tsx
│   │   │   │   ├── revenue-analytics.tsx
│   │   │   │   ├── stats.tsx
│   │   │   │   └── subscription-dashboard.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── analytics-controls.tsx
│   │   │   │   ├── appointment-analytics.tsx
│   │   │   │   ├── booking-configuration.tsx
│   │   │   │   ├── business-hours.tsx
│   │   │   │   ├── business-settings.tsx
│   │   │   │   ├── chains-list.tsx
│   │   │   │   ├── customer-insights.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── index.tsx
│   │   │   │   ├── list.tsx
│   │   │   │   ├── location-manager.tsx
│   │   │   │   ├── locations-list.tsx
│   │   │   │   ├── map.tsx
│   │   │   │   ├── notification-preferences.tsx
│   │   │   │   ├── payment-configuration.tsx
│   │   │   │   ├── revenue-dashboard.tsx
│   │   │   │   ├── salon-analytics.tsx
│   │   │   │   ├── salon-card.tsx
│   │   │   │   ├── salon-dashboard.tsx
│   │   │   │   ├── salons.tsx
│   │   │   │   ├── service-performance.tsx
│   │   │   │   └── stats.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── inventory-inventory-empty.tsx
│   │   │   │   ├── inventory-inventory-error.tsx
│   │   │   │   ├── inventory-inventory-loading.tsx
│   │   │   │   ├── list.tsx
│   │   │   │   ├── page-server.tsx
│   │   │   │   ├── product-form.tsx
│   │   │   │   └── product-list.tsx
│   │   │   ├── salon-customers/
│   │   │   │   ├── basic-info-step.tsx
│   │   │   │   ├── contact-details-step.tsx
│   │   │   │   ├── create-form.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── filters.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── index.tsx
│   │   │   │   ├── list-virtualized.tsx
│   │   │   │   ├── list.tsx
│   │   │   │   ├── metrics.tsx
│   │   │   │   ├── notes.tsx
│   │   │   │   ├── overview.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── personal-info.tsx
│   │   │   │   ├── preferences-step.tsx
│   │   │   │   ├── profile-header.tsx
│   │   │   │   ├── profile-tabs.tsx
│   │   │   │   ├── profile.tsx
│   │   │   │   ├── review-step.tsx
│   │   │   │   ├── segments.tsx
│   │   │   │   ├── stats.tsx
│   │   │   │   └── table.tsx
│   │   │   ├── services/
│   │   │   │   ├── index.ts
│   │   │   │   ├── list.tsx
│   │   │   │   ├── service-categories.tsx
│   │   │   │   ├── service-filters.tsx
│   │   │   │   ├── service-header.tsx
│   │   │   │   ├── service-stats.tsx
│   │   │   │   └── services.tsx
│   │   │   ├── staff/
│   │   │   │   ├── basic-info.tsx
│   │   │   │   ├── batch-operations.tsx
│   │   │   │   ├── bulk-actions.tsx
│   │   │   │   ├── customers.tsx
│   │   │   │   ├── dashboard.tsx
│   │   │   │   ├── detail-page.tsx
│   │   │   │   ├── filters.tsx
│   │   │   │   ├── grid-view.tsx
│   │   │   │   ├── grid.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── index.tsx
│   │   │   │   ├── list.tsx
│   │   │   │   ├── management-list.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── payroll-manager.tsx
│   │   │   │   ├── professional-info.tsx
│   │   │   │   ├── profile-card.tsx
│   │   │   │   ├── profile-earnings-section.tsx
│   │   │   │   ├── profile-header-section.tsx
│   │   │   │   ├── profile-header.tsx
│   │   │   │   ├── profile-info-section.tsx
│   │   │   │   ├── profile-performance-section.tsx
│   │   │   │   ├── profile-schedule-section.tsx
│   │   │   │   ├── profile-services-section.tsx
│   │   │   │   ├── profile-view.tsx
│   │   │   │   ├── profile.tsx
│   │   │   │   ├── reviews.tsx
│   │   │   │   ├── stats.tsx
│   │   │   │   └── table-view.tsx
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── appointments/
│   │   │   │   ├── appointments.mutations.ts
│   │   │   │   ├── appointments.queries.ts
│   │   │   │   ├── appointments.ts
│   │   │   │   └── index.ts
│   │   │   ├── billing/
│   │   │   │   ├── billing.mutations.ts
│   │   │   │   ├── billing.queries.ts
│   │   │   │   └── index.ts
│   │   │   ├── inventory/
│   │   │   │   ├── index.ts
│   │   │   │   ├── inventory.mutations.ts
│   │   │   │   ├── inventory.queries.main.ts
│   │   │   │   ├── inventory.queries.ts
│   │   │   │   ├── product.mutations.ts
│   │   │   │   ├── purchase-order.mutations.ts
│   │   │   │   ├── stock.mutations.ts
│   │   │   │   └── supplier.mutations.ts
│   │   │   ├── locations/
│   │   │   │   ├── chains.mutations.ts
│   │   │   │   ├── chains.queries.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── locations.mutations.ts
│   │   │   │   └── locations.queries.ts
│   │   │   ├── services/
│   │   │   │   ├── index.ts
│   │   │   │   ├── services.mutations.ts
│   │   │   │   ├── services.queries.ts
│   │   │   │   └── services.ts
│   │   │   ├── index.ts
│   │   │   ├── salon.types.ts
│   │   │   ├── salons.mutations.ts
│   │   │   ├── salons.queries.ts
│   │   │   └── salons.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-appointment-list.ts
│   │   │   ├── use-appointments-mutations.ts
│   │   │   ├── use-appointments.ts
│   │   │   ├── use-billing.ts
│   │   │   ├── use-customer-management.ts
│   │   │   ├── use-inventory.ts
│   │   │   ├── use-locations.ts
│   │   │   ├── use-referrals.ts
│   │   │   ├── use-salon-chains.ts
│   │   │   ├── use-salon-data.ts
│   │   │   ├── use-services-mutations.ts
│   │   │   └── use-services.ts
│   │   ├── services/
│   │   │   └── components/
│   │   │       └── index.ts
│   │   ├── types/
│   │   │   ├── appointments.types.ts
│   │   │   ├── index.ts
│   │   │   └── services.types.ts
│   │   ├── validators/
│   │   │   ├── inventory/
│   │   │   │   ├── index.ts
│   │   │   │   └── product.schemas.ts
│   │   │   ├── customer.schemas.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── services/
│   │   └── components/
│   │       └── index.ts
│   ├── shared/
│   │   ├── actions/
│   │   │   ├── common.action.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── loading/
│   │   │   │   ├── appointments-skeleton.tsx
│   │   │   │   ├── content-placeholder.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── lazy-load.tsx
│   │   │   │   ├── prefetch-link.tsx
│   │   │   │   ├── prefetch-manager.ts
│   │   │   │   ├── progressive-image.tsx
│   │   │   │   ├── progressive-list.tsx
│   │   │   │   ├── skeleton-loader.tsx
│   │   │   │   ├── staff-detail-skeleton.tsx
│   │   │   │   └── use-background-refresh.ts
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── error-boundary.tsx
│   │   │   ├── error-recovery.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── header.tsx
│   │   │   ├── index.ts
│   │   │   ├── lazy-component.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── states.tsx
│   │   ├── dal/
│   │   │   ├── auth-verification.ts
│   │   │   ├── database-adapters.ts
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── optimistic/
│   │   │   │   ├── index.ts
│   │   │   │   ├── use-optimistic-batch.ts
│   │   │   │   ├── use-optimistic-crud.ts
│   │   │   │   ├── use-optimistic-form.ts
│   │   │   │   ├── use-optimistic-list.ts
│   │   │   │   └── use-optimistic-toggle.ts
│   │   │   ├── index.ts
│   │   │   ├── use-optimistic-updates.ts
│   │   │   └── use-realtime-sync.ts
│   │   ├── providers/
│   │   │   └── components/
│   │   │       ├── index.ts
│   │   │       └── root-provider.tsx
│   │   ├── types/
│   │   │   ├── customer.types.ts
│   │   │   ├── index.ts
│   │   │   ├── navigation.types.ts
│   │   │   ├── permissions.types.ts
│   │   │   ├── salon-manager.types.ts
│   │   │   ├── salon-owner.types.ts
│   │   │   ├── staff.types.ts
│   │   │   └── super-admin.types.ts
│   │   ├── index.ts
│   │   └── utils.ts
│   ├── staff/
│   │   ├── actions/
│   │   │   ├── bulk/
│   │   │   │   ├── bulk.action.ts
│   │   │   │   └── index.ts
│   │   │   ├── crud/
│   │   │   │   ├── crud.action.ts
│   │   │   │   ├── index.ts
│   │   │   │   └── staff.action.ts
│   │   │   ├── scheduling/
│   │   │   │   ├── index.ts
│   │   │   │   ├── schedule.action.ts
│   │   │   │   ├── scheduling.action.ts
│   │   │   │   └── services.action.ts
│   │   │   ├── schemas/
│   │   │   │   ├── action-schemas.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── components/
│   │   │   ├── appointments/
│   │   │   │   └── index.ts
│   │   │   ├── common/
│   │   │   │   └── index.ts
│   │   │   ├── customers/
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── analytics-comparison.tsx
│   │   │   │   ├── analytics-header.tsx
│   │   │   │   ├── analytics-insights.tsx
│   │   │   │   ├── analytics-metrics.tsx
│   │   │   │   ├── analytics-trends.tsx
│   │   │   │   ├── analytics.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── performance-metrics.tsx
│   │   │   │   ├── performance-table.tsx
│   │   │   │   ├── performance.tsx
│   │   │   │   └── top-performers.tsx
│   │   │   ├── earnings/
│   │   │   │   ├── attendance-history.tsx
│   │   │   │   ├── attendance-reports.tsx
│   │   │   │   ├── attendance-schedule.tsx
│   │   │   │   ├── attendance-stats-cards.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── time-attendance-tracker.tsx
│   │   │   │   ├── time-clock.tsx
│   │   │   │   ├── time-off-list.tsx
│   │   │   │   └── time-off.tsx
│   │   │   ├── forms/
│   │   │   │   ├── access-step.tsx
│   │   │   │   ├── compensation-step.tsx
│   │   │   │   ├── documents-step.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── onboarding-wizard.tsx
│   │   │   │   ├── onboarding.tsx
│   │   │   │   ├── personal-info-step.tsx
│   │   │   │   ├── professional-step.tsx
│   │   │   │   ├── review-step.tsx
│   │   │   │   ├── services-step.tsx
│   │   │   │   └── skills-step.tsx
│   │   │   ├── modals/
│   │   │   │   └── index.ts
│   │   │   ├── profile/
│   │   │   │   └── index.ts
│   │   │   ├── schedule/
│   │   │   │   ├── availability-manager.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── conflict-resolver.tsx
│   │   │   │   ├── index.ts
│   │   │   │   ├── list.tsx
│   │   │   │   ├── main.tsx
│   │   │   │   ├── manager.tsx
│   │   │   │   ├── optimizer.tsx
│   │   │   │   └── step.tsx
│   │   │   └── index.ts
│   │   ├── dal/
│   │   │   ├── schedule/
│   │   │   │   ├── auto-assignment.mutations.ts
│   │   │   │   ├── basic-crud.mutations.ts
│   │   │   │   ├── conflict-resolution.mutations.ts
│   │   │   │   ├── conflicts.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── management.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   ├── optimization.mutations.ts
│   │   │   │   ├── optimization.ts
│   │   │   │   └── queries.ts
│   │   │   ├── timeoff/
│   │   │   │   ├── index.ts
│   │   │   │   ├── mutations.ts
│   │   │   │   └── queries.ts
│   │   │   ├── blocked-time.mutations.ts
│   │   │   ├── index.ts
│   │   │   ├── mutations.ts
│   │   │   ├── queries.ts
│   │   │   ├── salon.queries.ts
│   │   │   ├── services.mutations.ts
│   │   │   ├── staff.ts
│   │   │   ├── staff.types.ts
│   │   │   ├── timeoff.mutations.ts
│   │   │   └── timeoff.queries.ts
│   │   ├── hooks/
│   │   │   ├── index.ts
│   │   │   ├── use-conflict-detection.ts
│   │   │   ├── use-optimization.ts
│   │   │   ├── use-schedule-sync.ts
│   │   │   ├── use-schedules.ts
│   │   │   ├── use-staff-data.ts
│   │   │   ├── use-staff-mutations.ts
│   │   │   └── use-time-off.ts
│   │   ├── types/
│   │   │   ├── analytics.types.ts
│   │   │   ├── component-props.types.ts
│   │   │   ├── index.ts
│   │   │   ├── portal.types.ts
│   │   │   ├── schedule.types.ts
│   │   │   └── time-off.types.ts
│   │   └── index.ts
│   ├── users/
│   │   ├── components/
│   │   │   └── index.ts
│   │   └── dal/
│   │       ├── index.ts
│   │       ├── mutations.ts
│   │       ├── queries.ts
│   │       └── types.ts
│   └── index.ts
├── docs/
│   ├── action-files-standardization-final.md
│   ├── actions-standardization-report.md
│   ├── ACTOR-CENTRIC-ARCHITECTURE.md
│   ├── agent-action-plan.md
│   ├── barrel-exports-standardization.md
│   ├── claude-analysis.json
│   ├── claude-analysis.md
│   ├── cleanup-summary-report.md
│   ├── component-compliance-report.md
│   ├── component-compliance.json
│   ├── core-structure-review.md
│   ├── dal-organization-summary.md
│   ├── dal-security-report.json
│   ├── dal-security-report.md
│   ├── database-alignment-report.md
│   ├── database-type-issues.json
│   ├── database-type-report.md
│   ├── error-priority-queue.json
│   ├── error-priority-report.md
│   ├── file-size-report.md
│   ├── naming-cleanup-summary.md
│   ├── oversized-files.json
│   ├── project-tree.md
│   ├── rules.md
│   ├── type-fixes-summary.md
│   ├── type-naming-standardization.md
│   └── type-standardization-report.md
├── hooks/
│   └── use-mobile.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── providers.tsx
│   └── utils.ts
├── public/
│   └── logo.svg
├── scripts/
│   ├── agent-workflow.ts
│   ├── analyzer-claude.ts
│   ├── claude-health-check.ts
│   ├── component-compliance-checker.ts
│   ├── dal-security-scanner.ts
│   ├── database-type-validator.ts
│   ├── error-prioritizer.ts
│   ├── file-size-validator.ts
│   ├── fix-remaining-names.sh
│   ├── generate-core-tree-no-tree.sh
│   ├── generate-core-tree.sh
│   └── project-tree-generator.ts
├── supabase/
├── types/
│   └── database.types.ts (80.6KB)
├── analyzer-report.json
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
├── tsconfig.json (842B)
└── tsconfig.tsbuildinfo
```

## Statistics

- **Total Folders**: 226
- **Total Files**: 832
- **Total Items**: 1058

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

### core/auth/
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
  - ❌ Missing dal/
  - ✅ components/
  - ❌ Missing hooks/
  - ❌ Missing actions/
  - ❌ Missing types/

### core/messages/
  - ❌ Missing dal/
  - ✅ components/
  - ❌ Missing hooks/
  - ❌ Missing actions/
  - ❌ Missing types/

### core/notifications/
  - ❌ Missing dal/
  - ✅ components/
  - ❌ Missing hooks/
  - ❌ Missing actions/
  - ❌ Missing types/

### core/platform/
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

### core/salon/
  - ✅ dal/
  - ✅ components/
  - ✅ hooks/
  - ✅ actions/
  - ✅ types/

### core/services/
  - ❌ Missing dal/
  - ✅ components/
  - ❌ Missing hooks/
  - ❌ Missing actions/
  - ❌ Missing types/

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

### core/users/
  - ✅ dal/
  - ✅ components/
  - ❌ Missing hooks/
  - ❌ Missing actions/
  - ❌ Missing types/

## Potential Issues

- ⚠️ Component too large: core/auth/components/register/register.tsx (457 lines, max 300)
- ⚠️ Component too large: core/customer/components/appointments/history.tsx (387 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/confirmation.tsx (540 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/list.tsx (325 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/staff-selection.tsx (303 lines, max 300)
- ⚠️ Component too large: core/customer/components/booking/time-selection.tsx (398 lines, max 300)
- ⚠️ Component too large: core/customer/components/common/gift-card-form.tsx (327 lines, max 300)
- ⚠️ Component too large: core/customer/components/common/salon-search.tsx (386 lines, max 300)
- ⚠️ Component too large: core/customer/components/profile/personal-info-form.tsx (318 lines, max 300)
- ⚠️ Component too large: core/customer/components/profile/preferences-form.tsx (360 lines, max 300)
- ⚠️ Component too large: core/platform/components/admin/dashboard.tsx (359 lines, max 300)
- ⚠️ Component too large: core/platform/components/admin/onboarding-flow.tsx (489 lines, max 300)
- ⚠️ Component too large: core/platform/components/admin/role-manager.tsx (469 lines, max 300)
- ⚠️ Component too large: core/platform/components/admin/security-center.tsx (598 lines, max 300)
- ⚠️ Component too large: core/platform/components/admin/user-management.tsx (503 lines, max 300)
- ⚠️ Component too large: core/platform/components/settings/form.tsx (423 lines, max 300)
- ⚠️ DAL file too large: core/platform/dal/users/users.queries.ts (532 lines, max 500)
- ⚠️ Component too large: core/salon/components/appointments/availability-checker.tsx (414 lines, max 300)
- ⚠️ Component too large: core/salon/components/appointments/calendar.tsx (523 lines, max 300)
- ⚠️ Component too large: core/salon/components/appointments/page-client.tsx (420 lines, max 300)
- ⚠️ Component too large: core/salon/components/appointments/schedule-selection.tsx (325 lines, max 300)
- ⚠️ Component too large: core/salon/components/billing/payment-form.tsx (314 lines, max 300)
- ⚠️ Component too large: core/salon/components/billing/revenue-analytics.tsx (392 lines, max 300)
- ⚠️ Component too large: core/salon/components/billing/subscription-dashboard.tsx (467 lines, max 300)
- ⚠️ Component too large: core/salon/components/dashboard/location-manager.tsx (613 lines, max 300)
- ⚠️ Component too large: core/salon/components/dashboard/salon-dashboard.tsx (471 lines, max 300)
- ⚠️ Component too large: core/salon/components/dashboard/service-catalog.tsx (617 lines, max 300)
- ⚠️ Component too large: core/salon/components/inventory/product-form.tsx (619 lines, max 300)
- ⚠️ Component too large: core/salon/components/inventory/product-list.tsx (469 lines, max 300)
- ⚠️ Component too large: core/salon/components/salon-customers/create-form.tsx (313 lines, max 300)
- ⚠️ Component too large: core/salon/components/salon-customers/list.tsx (307 lines, max 300)
- ⚠️ Component too large: core/salon/components/salon-customers/segments.tsx (466 lines, max 300)
- ⚠️ Component too large: core/salon/components/staff/batch-operations.tsx (452 lines, max 300)
- ⚠️ Component too large: core/salon/components/staff/dashboard.tsx (524 lines, max 300)
- ⚠️ Component too large: core/salon/components/staff/payroll-manager.tsx (602 lines, max 300)
- ⚠️ DAL file too large: core/salon/dal/inventory/inventory.queries.ts (516 lines, max 500)
- ⚠️ Component too large: core/shared/components/error-recovery.tsx (435 lines, max 300)
- ⚠️ Component too large: core/shared/components/states.tsx (409 lines, max 300)
- ⚠️ Component too large: core/staff/components/dashboard/performance.tsx (476 lines, max 300)
- ⚠️ Component too large: core/staff/components/schedule/availability-manager.tsx (554 lines, max 300)
- ⚠️ Component too large: core/staff/components/schedule/calendar.tsx (446 lines, max 300)
- ⚠️ Component too large: core/staff/components/schedule/conflict-resolver.tsx (460 lines, max 300)
- ⚠️ Component too large: core/staff/components/schedule/manager.tsx (500 lines, max 300)
- ⚠️ Component too large: core/staff/components/schedule/optimizer.tsx (567 lines, max 300)
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
- ⚠️ Component outside ui/: components/ui/sidebar-core.tsx
- ⚠️ Component outside ui/: components/ui/sidebar-group.tsx
- ⚠️ Component outside ui/: components/ui/sidebar-index.ts
- ⚠️ Component outside ui/: components/ui/sidebar-layout.tsx
- ⚠️ Component outside ui/: components/ui/sidebar-menu.tsx
- ⚠️ Component outside ui/: components/ui/sidebar-provider.tsx
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
- ⚠️ Component outside ui/: components/ui/typography.tsx