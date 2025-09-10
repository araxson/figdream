# FigDream Project Structure

Generated: 2025-09-09T18:22:47.244359

## 📊 Statistics

- **Total Files**: 552
- **Total Directories**: 154
- **Total Size**: 3.09 MB
- **Total Lines of Code**: 85,100
- **Deepest Nesting**: 7 levels

### Files by Extension

- `.tsx`: 407 files
- `.ts`: 123 files
- `.json`: 5 files
- `.md`: 4 files
- `.sh`: 3 files
- `.sql`: 3 files
- `.mjs`: 2 files
- `.py`: 1 files
- `.css`: 1 files
- ``: 1 files

## 📁 Directory Structure

```
├── 📁 public
├── 📁 scripts
│   ├── 📄 export_all_database.sh
│   ├── 📄 export_database.sh
│   ├── 📄 generate_project_tree.py
│   └── 📄 run_all_inspections.sh
├── 📁 src
│   ├── 📁 app
│   │   ├── 📁 (admin)
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📁 alerts
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 analytics
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 audit-logs
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 faq
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 salons
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 settings
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 subscriptions
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 users
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 error.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   ├── 📁 (auth)
│   │   │   ├── 📁 forgot-password
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 login
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 login-otp
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 register
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 reset-password
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 verify-otp
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   ├── 📁 (customer)
│   │   │   ├── 📁 customer
│   │   │   │   ├── 📁 appointments
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 book
│   │   │   │   │   ├── 📁 [salonSlug]
│   │   │   │   │   │   ├── 📁 confirm
│   │   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   │   ├── 📁 datetime
│   │   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   │   ├── 📁 staff
│   │   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 preferences
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 profile
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   ├── 📁 (management)
│   │   │   ├── 📁 dashboard
│   │   │   │   ├── 📁 analytics
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 appointments
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 campaigns
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 customers
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 locations
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 reports
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 revenue
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 reviews
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 services
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 settings
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 staff
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 error.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   ├── 📁 (public)
│   │   │   ├── 📁 about
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 contact
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 faq
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 pricing
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 privacy
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 services
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 terms
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📄 layout.tsx
│   │   ├── 📁 (staff)
│   │   │   ├── 📁 staff
│   │   │   │   ├── 📁 appointments
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 customers
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 profile
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 schedule
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 tips
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📄 layout.tsx
│   │   │   └── 📄 loading.tsx
│   │   ├── 📁 api
│   │   │   ├── 📁 appointments
│   │   │   │   └── 📁 availability
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 auth
│   │   │   │   └── 📁 callback
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 campaigns
│   │   │   │   └── 📁 send
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 error-report
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 errors
│   │   │   │   └── 📁 report
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 exports
│   │   │   │   └── 📁 generate
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 fix-demo-auth
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 notifications
│   │   │   │   ├── 📁 email
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📁 sms
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 reports
│   │   │   │   └── 📁 generate
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 reviews
│   │   │   │   └── 📄 route.ts
│   │   │   └── 📁 webhooks
│   │   │       └── 📁 stripe
│   │   │           └── 📄 route.ts
│   │   ├── 📁 logout
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 notifications
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 unauthorized
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 error.tsx
│   │   ├── 📄 globals.css
│   │   ├── 📄 layout.tsx
│   │   ├── 📄 loading.tsx
│   │   ├── 📄 manifest.ts
│   │   ├── 📄 not-found.tsx
│   │   ├── 📄 page.tsx
│   │   ├── 📄 robots.ts
│   │   └── 📄 sitemap.ts
│   ├── 📁 components
│   │   ├── 📁 features
│   │   │   ├── 📁 analytics
│   │   │   │   ├── 📁 charts
│   │   │   │   │   ├── 📄 chart-area-interactive.tsx
│   │   │   │   │   ├── 📄 chart-bar-interactive.tsx
│   │   │   │   │   ├── 📄 revenue-api.ts
│   │   │   │   │   ├── 📄 revenue-area-chart.tsx
│   │   │   │   │   ├── 📄 revenue-bar-chart.tsx
│   │   │   │   │   ├── 📄 revenue-chart-manager.tsx
│   │   │   │   │   ├── 📄 revenue-line-chart.tsx
│   │   │   │   │   ├── 📄 revenue-stats.tsx
│   │   │   │   │   └── 📄 revenue-types.ts
│   │   │   │   ├── 📁 dashboard
│   │   │   │   │   ├── 📄 active-users.tsx
│   │   │   │   │   ├── 📄 admin-dashboard-header.tsx
│   │   │   │   │   ├── 📄 admin-dashboard.tsx
│   │   │   │   │   ├── 📄 admin-stats.tsx
│   │   │   │   │   ├── 📄 appointments-services.tsx
│   │   │   │   │   ├── 📄 customer-dashboard.tsx
│   │   │   │   │   ├── 📄 dashboard-header.tsx
│   │   │   │   │   ├── 📄 dashboard-performance.tsx
│   │   │   │   │   ├── 📄 dashboard-quick-actions.tsx
│   │   │   │   │   ├── 📄 dashboard-reviews.tsx
│   │   │   │   │   ├── 📄 dashboard-schedule.tsx
│   │   │   │   │   ├── 📄 dashboard-stats.tsx
│   │   │   │   │   ├── 📄 dashboard-types.ts
│   │   │   │   │   ├── 📄 earnings-overview.tsx
│   │   │   │   │   ├── 📄 index.tsx
│   │   │   │   │   ├── 📄 monthly-overview.tsx
│   │   │   │   │   ├── 📄 owner-dashboard.tsx
│   │   │   │   │   ├── 📄 platform-stats.tsx
│   │   │   │   │   ├── 📄 queries.ts
│   │   │   │   │   ├── 📄 quick-actions.tsx
│   │   │   │   │   ├── 📄 recent-activity.tsx
│   │   │   │   │   ├── 📄 recent-appointments.tsx
│   │   │   │   │   ├── 📄 recent-reviews.tsx
│   │   │   │   │   ├── 📄 salon-overview.tsx
│   │   │   │   │   ├── 📄 staff-dashboard-header.tsx
│   │   │   │   │   ├── 📄 staff-dashboard.tsx
│   │   │   │   │   ├── 📄 staff-performance.tsx
│   │   │   │   │   ├── 📄 stats-cards.tsx
│   │   │   │   │   ├── 📄 stats.tsx
│   │   │   │   │   ├── 📄 system-health.tsx
│   │   │   │   │   ├── 📄 system-stats.tsx
│   │   │   │   │   ├── 📄 today-appointments.tsx
│   │   │   │   │   ├── 📄 today-schedule.tsx
│   │   │   │   │   ├── 📄 top-services.tsx
│   │   │   │   │   └── 📄 upcoming-appointments.tsx
│   │   │   │   ├── 📁 queries
│   │   │   │   │   └── 📄 queries.ts
│   │   │   │   ├── 📁 reports
│   │   │   │   │   ├── 📄 appointments-report.tsx
│   │   │   │   │   ├── 📄 booking-chart-report.tsx
│   │   │   │   │   ├── 📄 customers-report.tsx
│   │   │   │   │   ├── 📄 index.tsx
│   │   │   │   │   ├── 📄 reports-header.tsx
│   │   │   │   │   ├── 📄 revenue-chart-report.tsx
│   │   │   │   │   ├── 📄 revenue-report.tsx
│   │   │   │   │   ├── 📄 staff-report.tsx
│   │   │   │   │   └── 📄 top-services-report.tsx
│   │   │   │   ├── 📄 analytics-header.tsx
│   │   │   │   ├── 📄 audit-logs.tsx
│   │   │   │   ├── 📄 growth.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 interactive-chart.tsx
│   │   │   │   ├── 📄 performers.tsx
│   │   │   │   ├── 📄 platform-metrics.tsx
│   │   │   │   ├── 📄 revenue-analytics.tsx
│   │   │   │   ├── 📄 revenue.tsx
│   │   │   │   ├── 📄 system-analytics-metrics.tsx
│   │   │   │   └── 📄 usage-analytics.tsx
│   │   │   ├── 📁 appointments
│   │   │   │   ├── 📁 calendar
│   │   │   │   │   ├── 📄 appointment-calendar.tsx
│   │   │   │   │   ├── 📄 calendar-16.tsx
│   │   │   │   │   └── 📄 calendar.tsx
│   │   │   │   ├── 📁 filters
│   │   │   │   │   ├── 📄 appointment-filters.tsx
│   │   │   │   │   └── 📄 filters.tsx
│   │   │   │   ├── 📁 forms
│   │   │   │   │   └── 📄 collect-payment-form.tsx
│   │   │   │   ├── 📁 headers
│   │   │   │   │   ├── 📄 appointments-header.tsx
│   │   │   │   │   ├── 📄 customer-appointments-header.tsx
│   │   │   │   │   ├── 📄 dashboard-appointments-header.tsx
│   │   │   │   │   └── 📄 staff-appointments-header.tsx
│   │   │   │   ├── 📁 history
│   │   │   │   │   ├── 📄 appointment-history.tsx
│   │   │   │   │   ├── 📄 booking-history.tsx
│   │   │   │   │   ├── 📄 history.tsx
│   │   │   │   │   └── 📄 past.tsx
│   │   │   │   ├── 📁 list
│   │   │   │   │   ├── 📄 customer-appointments-list.tsx
│   │   │   │   │   ├── 📄 customer-appointments-upcoming.tsx
│   │   │   │   │   ├── 📄 dashboard-appointments-list.tsx
│   │   │   │   │   ├── 📄 list.tsx
│   │   │   │   │   ├── 📄 my-appointments.tsx
│   │   │   │   │   ├── 📄 requests.tsx
│   │   │   │   │   ├── 📄 staff-appointments-upcoming.tsx
│   │   │   │   │   └── 📄 today.tsx
│   │   │   │   ├── 📁 walk-in
│   │   │   │   │   ├── 📄 walk-in-form-fields.tsx
│   │   │   │   │   ├── 📄 walk-in-form.tsx
│   │   │   │   │   ├── 📄 walk-in-service.ts
│   │   │   │   │   └── 📄 walk-in-types.ts
│   │   │   │   ├── 📄 actions.tsx
│   │   │   │   ├── 📄 appointments-tabs.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 queries.ts
│   │   │   │   └── 📄 staff-calendar.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📁 register
│   │   │   │   │   ├── 📄 register-form-fields.tsx
│   │   │   │   │   ├── 📄 register-form.tsx
│   │   │   │   │   ├── 📄 register-schema.ts
│   │   │   │   │   └── 📄 register-service.ts
│   │   │   │   ├── 📄 forgot-password-form.tsx
│   │   │   │   ├── 📄 login-form.tsx
│   │   │   │   ├── 📄 login-otp-form.tsx
│   │   │   │   ├── 📄 reset-password-form.tsx
│   │   │   │   └── 📄 verify-otp-form.tsx
│   │   │   ├── 📁 billing
│   │   │   │   ├── 📄 appointments-revenue-table.tsx
│   │   │   │   ├── 📄 revenue-cards.tsx
│   │   │   │   └── 📄 revenue-management.tsx
│   │   │   ├── 📁 campaigns
│   │   │   │   ├── 📄 builder.tsx
│   │   │   │   ├── 📄 campaigns-header.tsx
│   │   │   │   ├── 📄 campaigns-list.tsx
│   │   │   │   ├── 📄 campaigns-metrics.tsx
│   │   │   │   └── 📄 index.tsx
│   │   │   ├── 📁 customers
│   │   │   │   ├── 📁 booking
│   │   │   │   │   ├── 📄 booking-header.tsx
│   │   │   │   │   ├── 📄 salon-search.tsx
│   │   │   │   │   ├── 📄 service-selection.tsx
│   │   │   │   │   ├── 📄 staff-selection.tsx
│   │   │   │   │   └── 📄 time-selection.tsx
│   │   │   │   ├── 📁 list
│   │   │   │   │   ├── 📄 customers-header.tsx
│   │   │   │   │   └── 📄 customers-metrics.tsx
│   │   │   │   ├── 📁 profile
│   │   │   │   │   ├── 📄 customer-profile-header.tsx
│   │   │   │   │   ├── 📄 customer-profile-personal.tsx
│   │   │   │   │   └── 📄 profile-payment.tsx
│   │   │   │   ├── 📄 confirmation.tsx
│   │   │   │   ├── 📄 favorites-manager.tsx
│   │   │   │   ├── 📄 favorites-service.ts
│   │   │   │   ├── 📄 favorites-types.ts
│   │   │   │   ├── 📄 history.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 info.tsx
│   │   │   │   ├── 📄 loyalty.tsx
│   │   │   │   ├── 📄 notifications.tsx
│   │   │   │   ├── 📄 preferences.tsx
│   │   │   │   ├── 📄 salon-favorites.tsx
│   │   │   │   ├── 📄 salon-selection.tsx
│   │   │   │   ├── 📄 service-favorites.tsx
│   │   │   │   └── 📄 staff-favorites.tsx
│   │   │   ├── 📁 faq
│   │   │   │   └── 📄 faq-form.tsx
│   │   │   ├── 📁 landing
│   │   │   │   ├── 📄 cta-section.tsx
│   │   │   │   ├── 📄 cta.tsx
│   │   │   │   ├── 📄 features-grid.tsx
│   │   │   │   ├── 📄 features.tsx
│   │   │   │   ├── 📄 hero-section.tsx
│   │   │   │   ├── 📄 hero.tsx
│   │   │   │   ├── 📄 how-it-works.tsx
│   │   │   │   ├── 📄 pricing-cards.tsx
│   │   │   │   ├── 📄 privacy-content.tsx
│   │   │   │   ├── 📄 stats.tsx
│   │   │   │   ├── 📄 terms-content.tsx
│   │   │   │   ├── 📄 testimonials-carousel.tsx
│   │   │   │   └── 📄 testimonials.tsx
│   │   │   ├── 📁 notifications
│   │   │   │   ├── 📁 preferences
│   │   │   │   │   ├── 📄 notification-category-item.tsx
│   │   │   │   │   └── 📄 quiet-hours-settings.tsx
│   │   │   │   ├── 📄 email-notification-settings.tsx
│   │   │   │   ├── 📄 filters.tsx
│   │   │   │   ├── 📄 notification-item.tsx
│   │   │   │   ├── 📄 notifications-center.tsx
│   │   │   │   ├── 📄 notifications-header.tsx
│   │   │   │   ├── 📄 notifications-history.tsx
│   │   │   │   ├── 📄 notifications-list.tsx
│   │   │   │   ├── 📄 notifications-preferences.tsx
│   │   │   │   ├── 📄 notifications-settings.tsx
│   │   │   │   └── 📄 sms-notification-settings.tsx
│   │   │   ├── 📁 platform
│   │   │   │   ├── 📁 alerts
│   │   │   │   │   ├── 📄 alert-configuration-form.tsx
│   │   │   │   │   └── 📄 alert-history-list.tsx
│   │   │   │   ├── 📁 api-monitoring
│   │   │   │   │   ├── 📄 api-usage-endpoints.tsx
│   │   │   │   │   ├── 📄 api-usage-hourly.tsx
│   │   │   │   │   ├── 📄 api-usage-monitor.tsx
│   │   │   │   │   ├── 📄 api-usage-service.ts
│   │   │   │   │   ├── 📄 api-usage-stats.tsx
│   │   │   │   │   └── 📄 api-usage-types.ts
│   │   │   │   ├── 📁 user-growth
│   │   │   │   │   ├── 📄 user-growth-details.tsx
│   │   │   │   │   ├── 📄 user-growth-service.ts
│   │   │   │   │   ├── 📄 user-growth-stats.tsx
│   │   │   │   │   ├── 📄 user-growth-types.ts
│   │   │   │   │   └── 📄 user-growth.tsx
│   │   │   │   ├── 📄 activity.tsx
│   │   │   │   ├── 📄 audit-log-filters.tsx
│   │   │   │   ├── 📄 audit-log-table.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 list.tsx
│   │   │   │   ├── 📄 permissions.tsx
│   │   │   │   ├── 📄 users-header.tsx
│   │   │   │   └── 📄 users-table.tsx
│   │   │   ├── 📁 reviews
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 reviews-header.tsx
│   │   │   │   ├── 📄 reviews-list.tsx
│   │   │   │   ├── 📄 reviews-metrics.tsx
│   │   │   │   ├── 📄 reviews-responses.tsx
│   │   │   │   └── 📄 reviews-stats.tsx
│   │   │   ├── 📁 salons
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 list.tsx
│   │   │   │   ├── 📄 metrics.tsx
│   │   │   │   ├── 📄 salon-list.tsx
│   │   │   │   ├── 📄 salon-metrics.tsx
│   │   │   │   ├── 📄 salon-table.tsx
│   │   │   │   ├── 📄 salons-header.tsx
│   │   │   │   └── 📄 verification.tsx
│   │   │   ├── 📁 services
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 service-categories.tsx
│   │   │   │   ├── 📄 service-pricing.tsx
│   │   │   │   ├── 📄 services-header.tsx
│   │   │   │   ├── 📄 services-list.tsx
│   │   │   │   └── 📄 services-table.tsx
│   │   │   ├── 📁 settings
│   │   │   │   ├── 📁 business
│   │   │   │   │   ├── 📄 business-hours-settings.tsx
│   │   │   │   │   ├── 📄 integrations.tsx
│   │   │   │   │   └── 📄 payment-settings.tsx
│   │   │   │   ├── 📁 notifications
│   │   │   │   │   └── 📄 salon-notifications-settings.tsx
│   │   │   │   ├── 📁 security
│   │   │   │   │   └── 📄 security-settings.tsx
│   │   │   │   ├── 📄 booking-settings.tsx
│   │   │   │   ├── 📄 email.tsx
│   │   │   │   ├── 📄 general.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 integrations-settings.tsx
│   │   │   │   ├── 📄 payment.tsx
│   │   │   │   ├── 📄 salon-settings.tsx
│   │   │   │   ├── 📄 security.tsx
│   │   │   │   ├── 📄 settings-header.tsx
│   │   │   │   └── 📄 settings-page.tsx
│   │   │   └── 📁 staff
│   │   │       ├── 📁 earnings
│   │   │       │   ├── 📄 earnings-dashboard.tsx
│   │   │       │   ├── 📄 earnings-performance.tsx
│   │   │       │   ├── 📄 earnings-service.ts
│   │   │       │   ├── 📄 earnings-stats.tsx
│   │   │       │   ├── 📄 earnings-table.tsx
│   │   │       │   ├── 📄 earnings-types.ts
│   │   │       │   ├── 📄 tips-header.tsx
│   │   │       │   ├── 📄 tips-history.tsx
│   │   │       │   └── 📄 tips-settings.tsx
│   │   │       ├── 📁 invitations
│   │   │       │   ├── 📄 invitation-dialogs.tsx
│   │   │       │   ├── 📄 invitation-form.tsx
│   │   │       │   ├── 📄 invitation-list.tsx
│   │   │       │   ├── 📄 invitations-manager.tsx
│   │   │       │   ├── 📄 invite-form.tsx
│   │   │       │   └── 📄 staff-invitations.tsx
│   │   │       ├── 📁 management
│   │   │       │   ├── 📄 management-header.tsx
│   │   │       │   └── 📄 staff-list.tsx
│   │   │       ├── 📁 profile
│   │   │       │   ├── 📄 portfolio.tsx
│   │   │       │   ├── 📄 staff-profile-header.tsx
│   │   │       │   └── 📄 staff-profile-personal.tsx
│   │   │       ├── 📁 schedule
│   │   │       │   ├── 📄 availability.tsx
│   │   │       │   ├── 📄 break-form.tsx
│   │   │       │   ├── 📄 schedule-api.ts
│   │   │       │   ├── 📄 schedule-calendar.tsx
│   │   │       │   ├── 📄 schedule-display.tsx
│   │   │       │   ├── 📄 schedule-form.tsx
│   │   │       │   ├── 📄 schedule-header.tsx
│   │   │       │   ├── 📄 schedule-settings.tsx
│   │   │       │   ├── 📄 schedule-time-off.tsx
│   │   │       │   └── 📄 schedule-types.ts
│   │   │       ├── 📄 analytics.tsx
│   │   │       ├── 📄 form.tsx
│   │   │       ├── 📄 overview.tsx
│   │   │       ├── 📄 skills.tsx
│   │   │       ├── 📄 specialties.tsx
│   │   │       ├── 📄 staff-card-header.tsx
│   │   │       ├── 📄 staff-card-stats.tsx
│   │   │       ├── 📄 staff-card.tsx
│   │   │       ├── 📄 staff-delete-dialog.tsx
│   │   │       ├── 📄 staff-edit-dialog.tsx
│   │   │       ├── 📄 staff-grid.tsx
│   │   │       ├── 📄 staff-performance.tsx
│   │   │       ├── 📄 staff-schedule.tsx
│   │   │       ├── 📄 summary.tsx
│   │   │       ├── 📄 swap-requests.tsx
│   │   │       ├── 📄 time-off-api.ts
│   │   │       ├── 📄 time-off-form.tsx
│   │   │       ├── 📄 time-off-list.tsx
│   │   │       ├── 📄 time-off-manager.tsx
│   │   │       ├── 📄 time-off-stats.tsx
│   │   │       ├── 📄 time-off-status.tsx
│   │   │       ├── 📄 time-off-types.ts
│   │   │       ├── 📄 weekly.tsx
│   │   │       └── 📄 work.tsx
│   │   ├── 📁 shared
│   │   │   ├── 📁 data-display
│   │   │   │   └── 📁 data-table
│   │   │   │       ├── 📄 columns.tsx
│   │   │   │       ├── 📄 drag-handle.tsx
│   │   │   │       ├── 📄 index.tsx
│   │   │   │       ├── 📄 sortable-row.tsx
│   │   │   │       ├── 📄 table-cell-viewer.tsx
│   │   │   │       └── 📄 table-pagination.tsx
│   │   │   ├── 📁 feedback
│   │   │   │   └── 📄 error-boundary.tsx
│   │   │   ├── 📁 forms
│   │   │   ├── 📁 layouts
│   │   │   │   ├── 📄 admin-header.tsx
│   │   │   │   ├── 📄 admin-navigation.tsx
│   │   │   │   ├── 📄 admin-sidebar.tsx
│   │   │   │   ├── 📄 app-breadcrumb.tsx
│   │   │   │   ├── 📄 app-sidebar.tsx
│   │   │   │   ├── 📄 base-breadcrumb.tsx
│   │   │   │   ├── 📄 base-header.tsx
│   │   │   │   ├── 📄 base-sidebar.tsx
│   │   │   │   ├── 📄 customer-header.tsx
│   │   │   │   ├── 📄 customer-navigation.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 nav-main.tsx
│   │   │   │   ├── 📄 nav-secondary.tsx
│   │   │   │   ├── 📄 nav-user.tsx
│   │   │   │   ├── 📄 owner-header.tsx
│   │   │   │   ├── 📄 owner-navigation.tsx
│   │   │   │   ├── 📄 owner-sidebar.tsx
│   │   │   │   ├── 📄 public-footer.tsx
│   │   │   │   ├── 📄 public-header.tsx
│   │   │   │   ├── 📄 site-header.tsx
│   │   │   │   ├── 📄 staff-header.tsx
│   │   │   │   ├── 📄 staff-navigation.tsx
│   │   │   │   └── 📄 staff-sidebar.tsx
│   │   │   ├── 📁 providers
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 theme-provider.tsx
│   │   │   │   ├── 📄 theme-toggle.tsx
│   │   │   │   └── 📄 toast-provider.tsx
│   │   │   ├── 📄 command-palette.tsx
│   │   │   └── 📄 index.ts
│   │   └── 📁 ui
│   │       ├── 📄 accordion.tsx
│   │       ├── 📄 alert-dialog.tsx
│   │       ├── 📄 alert.tsx
│   │       ├── 📄 aspect-ratio.tsx
│   │       ├── 📄 avatar.tsx
│   │       ├── 📄 badge.tsx
│   │       ├── 📄 breadcrumb.tsx
│   │       ├── 📄 button.tsx
│   │       ├── 📄 calendar.tsx
│   │       ├── 📄 card.tsx
│   │       ├── 📄 carousel.tsx
│   │       ├── 📄 chart.tsx
│   │       ├── 📄 checkbox.tsx
│   │       ├── 📄 collapsible.tsx
│   │       ├── 📄 command.tsx
│   │       ├── 📄 context-menu.tsx
│   │       ├── 📄 dialog.tsx
│   │       ├── 📄 drawer.tsx
│   │       ├── 📄 dropdown-menu.tsx
│   │       ├── 📄 form.tsx
│   │       ├── 📄 hover-card.tsx
│   │       ├── 📄 input-otp.tsx
│   │       ├── 📄 input.tsx
│   │       ├── 📄 label.tsx
│   │       ├── 📄 menubar.tsx
│   │       ├── 📄 navigation-menu.tsx
│   │       ├── 📄 pagination.tsx
│   │       ├── 📄 popover.tsx
│   │       ├── 📄 progress.tsx
│   │       ├── 📄 radio-group.tsx
│   │       ├── 📄 resizable.tsx
│   │       ├── 📄 scroll-area.tsx
│   │       ├── 📄 select.tsx
│   │       ├── 📄 separator.tsx
│   │       ├── 📄 sheet.tsx
│   │       ├── 📄 sidebar.tsx
│   │       ├── 📄 skeleton-variants.tsx
│   │       ├── 📄 skeleton.tsx
│   │       ├── 📄 slider.tsx
│   │       ├── 📄 sonner.tsx
│   │       ├── 📄 switch.tsx
│   │       ├── 📄 table.tsx
│   │       ├── 📄 tabs.tsx
│   │       ├── 📄 textarea.tsx
│   │       ├── 📄 toggle-group.tsx
│   │       ├── 📄 toggle.tsx
│   │       ├── 📄 tooltip.tsx
│   │       └── 📄 use-toast.ts
│   ├── 📁 hooks
│   │   ├── 📁 queries
│   │   │   ├── 📄 use-appointments.ts
│   │   │   ├── 📄 use-data-fetch.ts
│   │   │   ├── 📄 use-salon.ts
│   │   │   └── 📄 use-services.ts
│   │   ├── 📁 ui
│   │   │   ├── 📄 use-mobile.ts
│   │   │   ├── 📄 use-skeleton.ts
│   │   │   └── 📄 use-toast.ts
│   │   ├── 📁 utils
│   │   │   ├── 📄 use-async.ts
│   │   │   ├── 📄 use-auth.ts
│   │   │   └── 📄 use-debounce.ts
│   │   └── 📄 index.ts
│   ├── 📁 lib
│   │   ├── 📁 actions
│   │   │   └── 📄 README.md
│   │   ├── 📁 api
│   │   │   ├── 📁 dal
│   │   │   │   ├── 📄 analytics.ts
│   │   │   │   ├── 📄 appointment-services.ts
│   │   │   │   ├── 📄 appointments.ts
│   │   │   │   ├── 📄 audit-logs.ts
│   │   │   │   ├── 📄 auth.ts
│   │   │   │   ├── 📄 blocked-times.ts
│   │   │   │   ├── 📄 campaigns.ts
│   │   │   │   ├── 📄 customer-favorites.ts
│   │   │   │   ├── 📄 customers.ts
│   │   │   │   ├── 📄 email-campaigns.ts
│   │   │   │   ├── 📄 error-logs.ts
│   │   │   │   ├── 📄 exports.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 notifications.ts
│   │   │   │   ├── 📄 password-reset-tokens.ts
│   │   │   │   ├── 📄 platform-subscriptions.ts
│   │   │   │   ├── 📄 profiles.ts
│   │   │   │   ├── 📄 reviews.ts
│   │   │   │   ├── 📄 salon-locations.ts
│   │   │   │   ├── 📄 salons.ts
│   │   │   │   ├── 📄 service-categories.ts
│   │   │   │   ├── 📄 services.ts
│   │   │   │   ├── 📄 settings.ts
│   │   │   │   ├── 📄 staff-invitations.ts
│   │   │   │   ├── 📄 staff-profiles.ts
│   │   │   │   ├── 📄 staff-schedules.ts
│   │   │   │   ├── 📄 staff.ts
│   │   │   │   └── 📄 user-roles.ts
│   │   │   ├── 📁 services
│   │   │   │   ├── 📁 staff
│   │   │   │   │   ├── 📄 staff-analytics.service.ts
│   │   │   │   │   ├── 📄 staff-schedule.service.ts
│   │   │   │   │   └── 📄 staff-types.ts
│   │   │   │   ├── 📄 analytics.service.ts
│   │   │   │   ├── 📄 appointment.service.ts
│   │   │   │   ├── 📄 base.service.ts
│   │   │   │   ├── 📄 customer.service.ts
│   │   │   │   ├── 📄 email.service.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 notification.service.ts
│   │   │   │   ├── 📄 payment.service.ts
│   │   │   │   ├── 📄 review.service.ts
│   │   │   │   ├── 📄 salon.service.ts
│   │   │   │   ├── 📄 service-catalog.service.ts
│   │   │   │   ├── 📄 sms.service.ts
│   │   │   │   └── 📄 staff.service.ts
│   │   │   ├── 📁 validators
│   │   │   │   ├── 📄 appointment.ts
│   │   │   │   ├── 📄 auth.ts
│   │   │   │   ├── 📄 customer.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 service.ts
│   │   │   └── 📄 index.ts
│   │   ├── 📁 auth
│   │   │   ├── 📄 constants.ts
│   │   │   └── 📄 helpers.ts
│   │   ├── 📁 config
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 messages.ts
│   │   │   ├── 📄 roles.ts
│   │   │   └── 📄 routes.ts
│   │   ├── 📁 supabase
│   │   │   ├── 📄 client.ts
│   │   │   ├── 📄 middleware.ts
│   │   │   └── 📄 server.ts
│   │   └── 📁 utils
│   │       ├── 📄 cn.ts
│   │       ├── 📄 date.ts
│   │       ├── 📄 error-reporter.ts
│   │       ├── 📄 format.ts
│   │       ├── 📄 index.ts
│   │       └── 📄 styles.ts
│   ├── 📁 types
│   │   ├── 📄 database.types.ts
│   │   ├── 📄 index.ts
│   │   └── 📄 lib-types.ts
│   └── 📄 middleware.ts
├── 📁 supabase
│   └── 📁 migrations
│       ├── 📄 $(date +%Y%m%d%H%M%S)_fix_all_remaining_auth_uid_policies.sql
│       ├── 📄 20240101000000_create_manual_revenue_entries.sql
│       └── 📄 20250906165500_fix_all_auth_uid_comprehensive.sql
├── 📄 .env
├── 📄 CLAUDE_CODE_INSTRUCTIONS.md
├── 📄 components.json
├── 📄 eslint.config.js
├── 📄 eslint.config.mjs
├── 📄 next-env.d.ts
├── 📄 next.config.ts
├── 📄 package-lock.json
├── 📄 package.json
├── 📄 postcss.config.mjs
├── 📄 project_tree.md
├── 📄 project_tree_analysis.json
├── 📄 rules.md
├── 📄 tsconfig.json
└── 📄 tsconfig.tsbuildinfo
```

## 💡 Recommendations


🔴 **Consolidate all source code under /src directory**
   - Maintains clear separation between source code and configuration

🔴 **Implement strict DAL pattern in /src/lib/dal**
   - Required by project architecture (CLAUDE.md)

🟡 **Organize components by feature in /src/components/features**
   - Improves maintainability and discoverability

🟡 **Create /public directory for static assets**
   - Standard Next.js structure for optimized asset serving

🔵 **Move scripts to /scripts directory**
   - Separates build/utility scripts from source code