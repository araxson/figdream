# FigDream Project Structure

Generated: 2025-09-12T01:53:46.609043

## 📊 Statistics

- **Total Files**: 821
- **Total Directories**: 343
- **Total Size**: 5.84 MB
- **Total Lines of Code**: 155,874
- **Deepest Nesting**: 8 levels

### Files by Extension

- `.tsx`: 511 files
- `.ts`: 278 files
- `.mjs`: 10 files
- `.md`: 5 files
- `.json`: 5 files
- `.sh`: 4 files
- `.sql`: 3 files
- `.py`: 1 files
- `.css`: 1 files
- ``: 1 files

## 📁 Directory Structure

```
├── 📁 scripts
│   ├── 📄 claude-hooks-extended.sh
│   ├── 📄 create-sample-data.mjs
│   ├── 📄 create-super-admin.mjs
│   ├── 📄 create-test-admin.mjs
│   ├── 📄 export_all_database.sh
│   ├── 📄 export_database.sh
│   ├── 📄 fix-admin-dashboard-data.mjs
│   ├── 📄 generate_project_tree.py
│   ├── 📄 reset-admin-password.mjs
│   ├── 📄 run_all_inspections.sh
│   ├── 📄 setup-admin-user.mjs
│   ├── 📄 test-auth.mjs
│   └── 📄 test-dashboards.mjs
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
│   │   │   │   ├── 📁 campaigns
│   │   │   │   │   ├── 📁 email
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   ├── 📁 sms
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 categories
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 error-logs
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 faq
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 pricing
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 salons
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 settings
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 subscriptions
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 system-health
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 team
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 users
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📁 edit
│   │   │   │   │   │       └── 📄 page.tsx
│   │   │   │   │   ├── 📁 new
│   │   │   │   │   │   └── 📄 page.tsx
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
│   │   │   │   ├── 📁 favorites
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
│   │   │   │   ├── 📁 alerts
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 analytics
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 api-usage
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 appointment-notes
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 appointments
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 audit-logs
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 blocked-times
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 campaigns
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 contracts
│   │   │   │   ├── 📁 customer-favorites
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 customer-preferences
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 customers
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 discounts
│   │   │   │   ├── 📁 email-campaigns
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 email-templates
│   │   │   │   ├── 📁 error-logs
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 export-configurations
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 faq
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 gift-cards
│   │   │   │   ├── 📁 inventory
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 locations
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 loyalty
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 memberships
│   │   │   │   ├── 📁 notification-settings
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 otp-config
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 password-audit
│   │   │   │   ├── 📁 pricing-plans
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 rate-limits
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 referral-programs
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 reports
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 revenue
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 review-requests
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 reviews
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 salon-locations
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 service-categories
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 service-costs
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 services
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 settings
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 sms-campaigns
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 sms-optouts
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 staff
│   │   │   │   │   ├── 📁 schedules
│   │   │   │   │   │   └── 📄 page.tsx
│   │   │   │   │   ├── 📄 client.tsx
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 staff-earnings
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 staff-schedules
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 staff-services
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 staff-specialties
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 suppliers
│   │   │   │   ├── 📁 system-health
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 tax-config
│   │   │   │   ├── 📁 team-members
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 time-off
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 user-roles
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 waitlist
│   │   │   │   ├── 📁 walk-ins
│   │   │   │   │   └── 📄 page.tsx
│   │   │   │   ├── 📁 webhooks
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
│   │   │   ├── 📁 reviews
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
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📁 alerts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 appointments
│   │   │   │   │   └── 📁 [id]
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 audit-logs
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 campaigns
│   │   │   │   │   ├── 📁 email
│   │   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   │   ├── 📁 duplicate
│   │   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   │   ├── 📁 send
│   │   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📁 sms
│   │   │   │   │       ├── 📁 [id]
│   │   │   │   │       │   ├── 📁 duplicate
│   │   │   │   │       │   │   └── 📄 route.ts
│   │   │   │   │       │   ├── 📁 send
│   │   │   │   │       │   │   └── 📄 route.ts
│   │   │   │   │       │   └── 📄 route.ts
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 categories
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   ├── 📁 reorder
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   ├── 📁 toggle-status
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 dashboard
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 faq
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 platform
│   │   │   │   │   ├── 📁 activity
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📁 users
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 pricing
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   ├── 📁 toggle-featured
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   ├── 📁 toggle-status
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 reviews
│   │   │   │   │   └── 📁 [id]
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 salon-context
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 salons
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   ├── 📁 toggle-status
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   ├── 📁 bulk-delete
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 services
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 staff
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📁 schedules
│   │   │   │   │       ├── 📁 [id]
│   │   │   │   │       │   └── 📄 route.ts
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   ├── 📁 subscriptions
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   ├── 📁 cancel
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   ├── 📁 invoice
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   ├── 📁 reactivate
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   ├── 📁 refund
│   │   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 system-health
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📁 users
│   │   │   │       ├── 📁 [id]
│   │   │   │       │   ├── 📁 reset-password
│   │   │   │       │   │   └── 📄 route.ts
│   │   │   │       │   ├── 📁 toggle-status
│   │   │   │       │   │   └── 📄 route.ts
│   │   │   │       │   ├── 📁 verify-email
│   │   │   │       │   │   └── 📄 route.ts
│   │   │   │       │   └── 📄 route.ts
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 analytics
│   │   │   │   ├── 📁 platform
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📁 revenue
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 appointments
│   │   │   │   ├── 📁 actions
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 availability
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 by-date
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 create
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 filter-options
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 list
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 payment
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📁 callback
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 logout
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 otp
│   │   │   │   │   ├── 📁 send
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📁 verify
│   │   │   │   │       └── 📄 route.ts
│   │   │   │   └── 📁 password
│   │   │   │       ├── 📁 reset
│   │   │   │       │   └── 📄 route.ts
│   │   │   │       └── 📁 update
│   │   │   │           └── 📄 route.ts
│   │   │   ├── 📁 billing
│   │   │   │   ├── 📁 revenue
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 booking
│   │   │   │   ├── 📁 availability
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 details
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 campaigns
│   │   │   │   ├── 📁 send
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 customers
│   │   │   │   ├── 📁 data
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 metrics
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 preferences
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 dashboard
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 error-report
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 errors
│   │   │   │   └── 📁 report
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 exports
│   │   │   │   └── 📁 generate
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 notifications
│   │   │   │   ├── 📁 dismiss
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 email
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 mark-all-read
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 mark-read
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 settings
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 sms
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 pricing
│   │   │   │   └── 📁 plans
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 reports
│   │   │   │   └── 📁 generate
│   │   │   │       └── 📄 route.ts
│   │   │   ├── 📁 reviews
│   │   │   │   ├── 📁 respond
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 salons
│   │   │   │   ├── 📁 list
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 management
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 metrics
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 settings
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 verification
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 services
│   │   │   │   ├── 📁 categories
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   └── 📄 route.ts
│   │   │   ├── 📁 staff
│   │   │   │   ├── 📁 analytics
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 breaks
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 earnings
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 grid
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 invitations
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 list
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 overview
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 performance
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 schedule
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 schedules
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 services
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
│   │   │   │   ├── 📁 time-off
│   │   │   │   │   ├── 📁 [id]
│   │   │   │   │   │   └── 📄 route.ts
│   │   │   │   │   └── 📄 route.ts
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
│   │   │   ├── 📁 access
│   │   │   │   └── 📄 user-roles-manager.tsx
│   │   │   ├── 📁 admin
│   │   │   │   ├── 📄 admin-salon-banner.tsx
│   │   │   │   ├── 📄 error-logs-viewer.tsx
│   │   │   │   ├── 📄 salon-management-dashboard.tsx
│   │   │   │   ├── 📄 system-configuration-manager.tsx
│   │   │   │   └── 📄 system-health-dashboard.tsx
│   │   │   ├── 📁 analytics
│   │   │   │   ├── 📁 charts
│   │   │   │   │   ├── 📄 revenue-area-chart.tsx
│   │   │   │   │   ├── 📄 revenue-bar-chart.tsx
│   │   │   │   │   ├── 📄 revenue-chart-manager.tsx
│   │   │   │   │   ├── 📄 revenue-line-chart.tsx
│   │   │   │   │   ├── 📄 revenue-stats.tsx
│   │   │   │   │   └── 📄 revenue-types.ts
│   │   │   │   ├── 📁 dashboard
│   │   │   │   │   ├── 📄 admin-dashboard-server.tsx
│   │   │   │   │   ├── 📄 appointments-services.tsx
│   │   │   │   │   ├── 📄 customer-appointments.tsx
│   │   │   │   │   ├── 📄 dashboard-header.tsx
│   │   │   │   │   ├── 📄 dashboard-performance.tsx
│   │   │   │   │   ├── 📄 dashboard-quick-actions.tsx
│   │   │   │   │   ├── 📄 dashboard-reviews.tsx
│   │   │   │   │   ├── 📄 dashboard-schedule.tsx
│   │   │   │   │   ├── 📄 dashboard-stats.tsx
│   │   │   │   │   ├── 📄 dashboard.tsx
│   │   │   │   │   ├── 📄 earnings-overview.tsx
│   │   │   │   │   ├── 📄 index.tsx
│   │   │   │   │   ├── 📄 queries.ts
│   │   │   │   │   ├── 📄 recent-appointments.tsx
│   │   │   │   │   ├── 📄 recent-reviews.tsx
│   │   │   │   │   ├── 📄 salon-overview.tsx
│   │   │   │   │   ├── 📄 system-health.tsx
│   │   │   │   │   ├── 📄 today-appointments.tsx
│   │   │   │   │   ├── 📄 today-schedule.tsx
│   │   │   │   │   ├── 📄 top-services.tsx
│   │   │   │   │   └── 📄 upcoming-appointments.tsx
│   │   │   │   ├── 📁 metrics
│   │   │   │   │   └── 📄 system-health-card.tsx
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
│   │   │   │   ├── 📄 analytics-page-content.tsx
│   │   │   │   ├── 📄 api-usage-dashboard.tsx
│   │   │   │   ├── 📄 audit-logs.tsx
│   │   │   │   ├── 📄 growth.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 interactive-chart.tsx
│   │   │   │   ├── 📄 performers.tsx
│   │   │   │   ├── 📄 platform-analytics-client.tsx
│   │   │   │   ├── 📄 platform-analytics-server.tsx
│   │   │   │   ├── 📄 platform-metrics.tsx
│   │   │   │   ├── 📄 revenue-analytics.tsx
│   │   │   │   ├── 📄 revenue-chart.tsx
│   │   │   │   ├── 📄 revenue.tsx
│   │   │   │   ├── 📄 staff-utilization-manager.tsx
│   │   │   │   ├── 📄 system-analytics-metrics.tsx
│   │   │   │   └── 📄 usage-analytics.tsx
│   │   │   ├── 📁 appointments
│   │   │   │   ├── 📁 calendar
│   │   │   │   │   └── 📄 calendar-16.tsx
│   │   │   │   ├── 📁 forms
│   │   │   │   │   └── 📄 collect-payment-form.tsx
│   │   │   │   ├── 📁 list
│   │   │   │   │   └── 📄 appointment-constants.ts
│   │   │   │   ├── 📁 walk-in
│   │   │   │   │   ├── 📄 walk-in-form-fields.tsx
│   │   │   │   │   └── 📄 walk-in-form.tsx
│   │   │   │   ├── 📄 actions.tsx
│   │   │   │   ├── 📄 appointment-calendar.tsx
│   │   │   │   ├── 📄 appointment-header.tsx
│   │   │   │   ├── 📄 appointment-list.tsx
│   │   │   │   ├── 📄 appointment-notes-manager.tsx
│   │   │   │   ├── 📄 appointments-management-client.tsx
│   │   │   │   ├── 📄 appointments-management-server.tsx
│   │   │   │   ├── 📄 appointments-page-content.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 queries.ts
│   │   │   │   └── 📄 walk-in-manager.tsx
│   │   │   ├── 📁 auth
│   │   │   │   ├── 📁 components
│   │   │   │   │   ├── 📄 password-input.tsx
│   │   │   │   │   └── 📄 social-login-buttons.tsx
│   │   │   │   ├── 📁 register
│   │   │   │   │   ├── 📄 register-form-fields.tsx
│   │   │   │   │   ├── 📄 register-form.tsx
│   │   │   │   │   ├── 📄 register-schema.ts
│   │   │   │   │   └── 📄 register-service.ts
│   │   │   │   ├── 📄 forgot-password-form.tsx
│   │   │   │   ├── 📄 login-form.tsx
│   │   │   │   ├── 📄 login-info.tsx
│   │   │   │   ├── 📄 login-otp-form.tsx
│   │   │   │   ├── 📄 otp-configuration-manager.tsx
│   │   │   │   ├── 📄 register-info.tsx
│   │   │   │   ├── 📄 reset-password-form.tsx
│   │   │   │   └── 📄 verify-otp-form.tsx
│   │   │   ├── 📁 billing
│   │   │   │   ├── 📄 appointments-revenue-table.tsx
│   │   │   │   ├── 📄 pricing-plans-manager.tsx
│   │   │   │   ├── 📄 revenue-cards.tsx
│   │   │   │   └── 📄 revenue-management.tsx
│   │   │   ├── 📁 blocked-times
│   │   │   │   └── 📄 blocked-times-manager.tsx
│   │   │   ├── 📁 campaigns
│   │   │   │   ├── 📄 builder.tsx
│   │   │   │   ├── 📄 campaigns-client.tsx
│   │   │   │   ├── 📄 campaigns-header.tsx
│   │   │   │   ├── 📄 campaigns-list.tsx
│   │   │   │   ├── 📄 campaigns-metrics.tsx
│   │   │   │   ├── 📄 campaigns-server.tsx
│   │   │   │   ├── 📄 email-campaign-builder.tsx
│   │   │   │   ├── 📄 email-campaigns-client.tsx
│   │   │   │   ├── 📄 email-campaigns-manager.tsx
│   │   │   │   ├── 📄 email-campaigns-server.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 sms-campaign-builder.tsx
│   │   │   │   ├── 📄 sms-campaigns-client.tsx
│   │   │   │   ├── 📄 sms-campaigns-manager.tsx
│   │   │   │   ├── 📄 sms-campaigns-server.tsx
│   │   │   │   └── 📄 sms-optouts-manager.tsx
│   │   │   ├── 📁 categories
│   │   │   │   ├── 📄 categories-client.tsx
│   │   │   │   ├── 📄 categories-server.tsx
│   │   │   │   ├── 📄 service-categories-client.tsx
│   │   │   │   └── 📄 service-categories-server.tsx
│   │   │   ├── 📁 communications
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
│   │   │   │   ├── 📄 customer-booking-history.tsx
│   │   │   │   ├── 📄 customer-favorites-manager.tsx
│   │   │   │   ├── 📄 customer-preferences-manager.tsx
│   │   │   │   ├── 📄 customers-management-client.tsx
│   │   │   │   ├── 📄 customers-management-server.tsx
│   │   │   │   ├── 📄 customers-table.tsx
│   │   │   │   ├── 📄 favorites-manager.tsx
│   │   │   │   ├── 📄 history.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 info.tsx
│   │   │   │   ├── 📄 loyalty.tsx
│   │   │   │   ├── 📄 notifications.tsx
│   │   │   │   ├── 📄 preferences.tsx
│   │   │   │   ├── 📄 profile-info.tsx
│   │   │   │   ├── 📄 salon-favorites.tsx
│   │   │   │   ├── 📄 salon-selection.tsx
│   │   │   │   ├── 📄 service-favorites.tsx
│   │   │   │   └── 📄 staff-favorites.tsx
│   │   │   ├── 📁 faq
│   │   │   │   └── 📄 faq-form.tsx
│   │   │   ├── 📁 finance
│   │   │   │   └── 📄 service-costs-manager.tsx
│   │   │   ├── 📁 integrations
│   │   │   ├── 📁 inventory
│   │   │   │   └── 📄 product-inventory-manager.tsx
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
│   │   │   │   └── 📄 testimonials.tsx
│   │   │   ├── 📁 legal
│   │   │   ├── 📁 loyalty
│   │   │   │   └── 📄 loyalty-programs-manager.tsx
│   │   │   ├── 📁 marketing
│   │   │   │   └── 📄 referral-programs-manager.tsx
│   │   │   ├── 📁 monitoring
│   │   │   │   ├── 📄 alert-configuration-manager.tsx
│   │   │   │   ├── 📄 error-logs-viewer.tsx
│   │   │   │   ├── 📄 rate-limits-manager.tsx
│   │   │   │   └── 📄 system-health-dashboard.tsx
│   │   │   ├── 📁 notifications
│   │   │   │   ├── 📁 preferences
│   │   │   │   │   ├── 📄 notification-category-item.tsx
│   │   │   │   │   └── 📄 quiet-hours-settings.tsx
│   │   │   │   ├── 📄 email-notification-settings.tsx
│   │   │   │   ├── 📄 notification-item.tsx
│   │   │   │   ├── 📄 notification-settings-manager.tsx
│   │   │   │   ├── 📄 notifications-center.tsx
│   │   │   │   ├── 📄 notifications-filters.tsx
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
│   │   │   │   │   └── 📄 api-usage-stats.tsx
│   │   │   │   ├── 📁 user-growth
│   │   │   │   │   ├── 📄 user-growth-details.tsx
│   │   │   │   │   ├── 📄 user-growth-stats.tsx
│   │   │   │   │   └── 📄 user-growth.tsx
│   │   │   │   ├── 📁 users
│   │   │   │   │   ├── 📄 create-user-form.tsx
│   │   │   │   │   └── 📄 edit-user-form.tsx
│   │   │   │   ├── 📄 activity.tsx
│   │   │   │   ├── 📄 audit-log-filters.tsx
│   │   │   │   ├── 📄 audit-log-table.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 permissions-manager.tsx
│   │   │   │   ├── 📄 permissions.tsx
│   │   │   │   ├── 📄 users-client.tsx
│   │   │   │   ├── 📄 users-header.tsx
│   │   │   │   ├── 📄 users-management-client.tsx
│   │   │   │   ├── 📄 users-management-server.tsx
│   │   │   │   ├── 📄 users-server.tsx
│   │   │   │   ├── 📄 users-table-actions.tsx
│   │   │   │   ├── 📄 users-table-header.tsx
│   │   │   │   ├── 📄 users-table-pagination.tsx
│   │   │   │   ├── 📄 users-table-row.tsx
│   │   │   │   ├── 📄 users-table-utils.ts
│   │   │   │   └── 📄 users-table.tsx
│   │   │   ├── 📁 pricing
│   │   │   │   ├── 📄 pricing-plans-client.tsx
│   │   │   │   ├── 📄 pricing-plans-manager.tsx
│   │   │   │   └── 📄 pricing-plans-server.tsx
│   │   │   ├── 📁 reports
│   │   │   │   └── 📄 export-configurations-manager.tsx
│   │   │   ├── 📁 reviews
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 review-requests-manager.tsx
│   │   │   │   ├── 📄 reviews-header.tsx
│   │   │   │   ├── 📄 reviews-list.tsx
│   │   │   │   ├── 📄 reviews-management-client.tsx
│   │   │   │   ├── 📄 reviews-management-server.tsx
│   │   │   │   ├── 📄 reviews-manager.tsx
│   │   │   │   ├── 📄 reviews-metrics.tsx
│   │   │   │   ├── 📄 reviews-responses.tsx
│   │   │   │   └── 📄 reviews-stats.tsx
│   │   │   ├── 📁 salons
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 metrics.tsx
│   │   │   │   ├── 📄 salon-list.tsx
│   │   │   │   ├── 📄 salon-locations-manager.tsx
│   │   │   │   ├── 📄 salon-metrics.tsx
│   │   │   │   ├── 📄 salon-table.tsx
│   │   │   │   ├── 📄 salons-client.tsx
│   │   │   │   ├── 📄 salons-header.tsx
│   │   │   │   ├── 📄 salons-server.tsx
│   │   │   │   └── 📄 verification.tsx
│   │   │   ├── 📁 scheduling
│   │   │   │   └── 📄 blocked-times-manager.tsx
│   │   │   ├── 📁 security
│   │   │   │   └── 📄 audit-logs-viewer.tsx
│   │   │   ├── 📁 services
│   │   │   │   ├── 📄 create-service-form.tsx
│   │   │   │   ├── 📄 edit-service-form.tsx
│   │   │   │   ├── 📄 index.tsx
│   │   │   │   ├── 📄 service-categories-manager.tsx
│   │   │   │   ├── 📄 service-categories.tsx
│   │   │   │   ├── 📄 service-form-dialog.tsx
│   │   │   │   ├── 📄 service-pricing.tsx
│   │   │   │   ├── 📄 services-data-table.tsx
│   │   │   │   ├── 📄 services-header.tsx
│   │   │   │   ├── 📄 services-list.tsx
│   │   │   │   ├── 📄 services-management-client.tsx
│   │   │   │   ├── 📄 services-management-server.tsx
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
│   │   │   │   ├── 📄 salon-settings.tsx
│   │   │   │   ├── 📄 settings-content.tsx
│   │   │   │   ├── 📄 settings-header.tsx
│   │   │   │   └── 📄 settings-manager.tsx
│   │   │   ├── 📁 shared
│   │   │   │   ├── 📄 stats-card.tsx
│   │   │   │   └── 📄 stats-grid.tsx
│   │   │   ├── 📁 staff
│   │   │   │   ├── 📁 breaks
│   │   │   │   │   └── 📄 staff-breaks-list.tsx
│   │   │   │   ├── 📁 earnings
│   │   │   │   │   ├── 📄 earnings-dashboard.tsx
│   │   │   │   │   ├── 📄 earnings-performance.tsx
│   │   │   │   │   ├── 📄 earnings-stats.tsx
│   │   │   │   │   ├── 📄 earnings-table.tsx
│   │   │   │   │   ├── 📄 tips-header.tsx
│   │   │   │   │   ├── 📄 tips-history.tsx
│   │   │   │   │   └── 📄 tips-settings.tsx
│   │   │   │   ├── 📁 invitations
│   │   │   │   │   ├── 📄 invitation-dialogs.tsx
│   │   │   │   │   ├── 📄 invitation-form.tsx
│   │   │   │   │   ├── 📄 invitation-list.tsx
│   │   │   │   │   ├── 📄 invitations-manager.tsx
│   │   │   │   │   ├── 📄 invite-form.tsx
│   │   │   │   │   └── 📄 staff-invitations.tsx
│   │   │   │   ├── 📁 management
│   │   │   │   │   ├── 📄 management-header.tsx
│   │   │   │   │   └── 📄 staff-list.tsx
│   │   │   │   ├── 📁 profile
│   │   │   │   │   ├── 📄 portfolio.tsx
│   │   │   │   │   ├── 📄 staff-profile-header.tsx
│   │   │   │   │   └── 📄 staff-profile-personal.tsx
│   │   │   │   ├── 📁 schedule
│   │   │   │   │   ├── 📄 availability.tsx
│   │   │   │   │   ├── 📄 break-form.tsx
│   │   │   │   │   ├── 📄 schedule-calendar.tsx
│   │   │   │   │   ├── 📄 schedule-display.tsx
│   │   │   │   │   ├── 📄 schedule-form.tsx
│   │   │   │   │   ├── 📄 schedule-header.tsx
│   │   │   │   │   ├── 📄 schedule-settings.tsx
│   │   │   │   │   └── 📄 schedule-time-off.tsx
│   │   │   │   ├── 📁 service-assignment
│   │   │   │   │   └── 📄 service-assignment-matrix.tsx
│   │   │   │   ├── 📁 time-off
│   │   │   │   │   ├── 📄 time-off-list.tsx
│   │   │   │   │   └── 📄 time-off-request-form.tsx
│   │   │   │   ├── 📄 schedules-client.tsx
│   │   │   │   ├── 📄 schedules-server.tsx
│   │   │   │   ├── 📄 staff-card.tsx
│   │   │   │   ├── 📄 staff-delete-dialog.tsx
│   │   │   │   ├── 📄 staff-earnings-manager.tsx
│   │   │   │   ├── 📄 staff-edit-dialog.tsx
│   │   │   │   ├── 📄 staff-form.tsx
│   │   │   │   ├── 📄 staff-grid.tsx
│   │   │   │   ├── 📄 staff-management-client.tsx
│   │   │   │   ├── 📄 staff-management-server.tsx
│   │   │   │   ├── 📄 staff-management-wrapper.tsx
│   │   │   │   ├── 📄 staff-performance-consolidated.tsx
│   │   │   │   ├── 📄 staff-performance-metrics.tsx
│   │   │   │   ├── 📄 staff-schedule.tsx
│   │   │   │   ├── 📄 staff-schedules-manager.tsx
│   │   │   │   ├── 📄 staff-services-management.tsx
│   │   │   │   ├── 📄 staff-services-manager.tsx
│   │   │   │   ├── 📄 staff-specialties-manager.tsx
│   │   │   │   ├── 📄 swap-requests.tsx
│   │   │   │   ├── 📄 time-off-form.tsx
│   │   │   │   ├── 📄 time-off-manager.tsx
│   │   │   │   ├── 📄 time-off-requests-manager.tsx
│   │   │   │   ├── 📄 time-off-stats.tsx
│   │   │   │   └── 📄 time-off-status.tsx
│   │   │   ├── 📁 subscriptions
│   │   │   │   ├── 📄 subscriptions-client.tsx
│   │   │   │   └── 📄 subscriptions-server.tsx
│   │   │   ├── 📁 support
│   │   │   │   └── 📄 faq-manager.tsx
│   │   │   └── 📁 team
│   │   │       ├── 📄 team-management.tsx
│   │   │       ├── 📄 team-member-delete-dialog.tsx
│   │   │       ├── 📄 team-member-dialog.tsx
│   │   │       └── 📄 team-members-manager.tsx
│   │   ├── 📁 providers
│   │   │   └── 📄 salon-context-provider.tsx
│   │   ├── 📁 shared
│   │   │   ├── 📁 feedback
│   │   │   │   └── 📄 error-boundary.tsx
│   │   │   ├── 📁 layouts
│   │   │   │   ├── 📄 admin-nav-items.ts
│   │   │   │   ├── 📄 app-breadcrumb.tsx
│   │   │   │   ├── 📄 app-sidebar.tsx
│   │   │   │   ├── 📄 base-header.tsx
│   │   │   │   ├── 📄 footer.tsx
│   │   │   │   ├── 📄 header-desktop-nav.tsx
│   │   │   │   ├── 📄 header-mobile-menu.tsx
│   │   │   │   ├── 📄 header-navigation.ts
│   │   │   │   ├── 📄 header-notifications.tsx
│   │   │   │   ├── 📄 header-provider.tsx
│   │   │   │   ├── 📄 header-search.tsx
│   │   │   │   ├── 📄 header-user-menu.tsx
│   │   │   │   ├── 📄 header.tsx
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 owner-nav-items.ts
│   │   │   │   ├── 📄 salon-selector.tsx
│   │   │   │   ├── 📄 sidebar-base.tsx
│   │   │   │   ├── 📄 sidebar-user-menu.tsx
│   │   │   │   └── 📄 staff-nav-items.ts
│   │   │   ├── 📁 modals
│   │   │   │   └── 📄 confirmation-modal.tsx
│   │   │   ├── 📁 navigation
│   │   │   │   └── 📄 role-based-sidebar.tsx
│   │   │   ├── 📁 providers
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 theme-provider.tsx
│   │   │   │   ├── 📄 theme-toggle.tsx
│   │   │   │   └── 📄 toast-provider.tsx
│   │   │   ├── 📁 ui-helpers
│   │   │   │   ├── 📄 empty-states.tsx
│   │   │   │   ├── 📄 form-section.tsx
│   │   │   │   ├── 📄 generic-empty-state.tsx
│   │   │   │   ├── 📄 loading-states.tsx
│   │   │   │   ├── 📄 section-header.tsx
│   │   │   │   └── 📄 skeleton-patterns.tsx
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
│   │       ├── 📄 skeleton.tsx
│   │       ├── 📄 slider.tsx
│   │       ├── 📄 sonner.tsx
│   │       ├── 📄 switch.tsx
│   │       ├── 📄 table.tsx
│   │       ├── 📄 tabs.tsx
│   │       ├── 📄 textarea.tsx
│   │       ├── 📄 toggle-group.tsx
│   │       ├── 📄 toggle.tsx
│   │       └── 📄 tooltip.tsx
│   ├── 📁 hooks
│   │   ├── 📁 queries
│   │   │   ├── 📄 use-appointments.ts
│   │   │   ├── 📄 use-data-fetch.ts
│   │   │   ├── 📄 use-salon.ts
│   │   │   └── 📄 use-services.ts
│   │   ├── 📁 utils
│   │   │   ├── 📄 use-async.ts
│   │   │   ├── 📄 use-auth.ts
│   │   │   └── 📄 use-debounce.ts
│   │   ├── 📄 index.ts
│   │   ├── 📄 use-api.ts
│   │   ├── 📄 use-error-handler.ts
│   │   ├── 📄 use-filter-state.ts
│   │   ├── 📄 use-form-handler.ts
│   │   ├── 📄 use-mobile.ts
│   │   ├── 📄 use-notifications.ts
│   │   ├── 📄 use-pagination-state.ts
│   │   ├── 📄 use-supabase-query.ts
│   │   └── 📄 use-toast.ts
│   ├── 📁 lib
│   │   ├── 📁 actions
│   │   │   ├── 📄 README.md
│   │   │   ├── 📄 audit-logs.ts
│   │   │   ├── 📄 auth.ts
│   │   │   ├── 📄 notifications.ts
│   │   │   ├── 📄 permissions.ts
│   │   │   └── 📄 team-members.ts
│   │   ├── 📁 api
│   │   │   ├── 📁 dal
│   │   │   │   ├── 📄 admin-dashboard.ts
│   │   │   │   ├── 📄 alerts.ts
│   │   │   │   ├── 📄 analytics.ts
│   │   │   │   ├── 📄 appointment-services.ts
│   │   │   │   ├── 📄 appointments-mutations.ts
│   │   │   │   ├── 📄 appointments-queries.ts
│   │   │   │   ├── 📄 appointments-role-queries.ts
│   │   │   │   ├── 📄 appointments-types.ts
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
│   │   │   │   ├── 📄 faq.ts
│   │   │   │   ├── 📄 favorites.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 notification-settings.ts
│   │   │   │   ├── 📄 notifications.ts
│   │   │   │   ├── 📄 password-reset-tokens.ts
│   │   │   │   ├── 📄 permissions.ts
│   │   │   │   ├── 📄 platform-subscriptions.ts
│   │   │   │   ├── 📄 profiles.ts
│   │   │   │   ├── 📄 reviews.ts
│   │   │   │   ├── 📄 role-utils.ts
│   │   │   │   ├── 📄 salon-locations.ts
│   │   │   │   ├── 📄 salons.ts
│   │   │   │   ├── 📄 service-categories.ts
│   │   │   │   ├── 📄 services.ts
│   │   │   │   ├── 📄 settings.ts
│   │   │   │   ├── 📄 staff-breaks.ts
│   │   │   │   ├── 📄 staff-invitations.ts
│   │   │   │   ├── 📄 staff-profiles.ts
│   │   │   │   ├── 📄 staff-schedules.ts
│   │   │   │   ├── 📄 staff-services.ts
│   │   │   │   ├── 📄 staff.ts
│   │   │   │   ├── 📄 team-members.ts
│   │   │   │   ├── 📄 time-off.ts
│   │   │   │   ├── 📄 user-roles.ts
│   │   │   │   └── 📄 users.ts
│   │   │   ├── 📁 queries
│   │   │   │   ├── 📄 analytics.ts
│   │   │   │   └── 📄 dashboard.ts
│   │   │   ├── 📁 services
│   │   │   │   ├── 📁 staff
│   │   │   │   │   ├── 📄 staff-analytics.service.ts
│   │   │   │   │   ├── 📄 staff-schedule.service.ts
│   │   │   │   │   └── 📄 staff-types.ts
│   │   │   │   ├── 📄 analytics.service.ts
│   │   │   │   ├── 📄 api-usage-service.ts
│   │   │   │   ├── 📄 api-usage.service.ts
│   │   │   │   ├── 📄 appointment.service.ts
│   │   │   │   ├── 📄 base.service.ts
│   │   │   │   ├── 📄 customer.service.ts
│   │   │   │   ├── 📄 earnings-service.ts
│   │   │   │   ├── 📄 earnings.service.ts
│   │   │   │   ├── 📄 email.service.ts
│   │   │   │   ├── 📄 favorites-service.ts
│   │   │   │   ├── 📄 favorites.service.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   ├── 📄 notification.service.ts
│   │   │   │   ├── 📄 payment.service.ts
│   │   │   │   ├── 📄 register-schema.ts
│   │   │   │   ├── 📄 register-service.ts
│   │   │   │   ├── 📄 register.service.ts
│   │   │   │   ├── 📄 revenue-api.ts
│   │   │   │   ├── 📄 revenue.service.ts
│   │   │   │   ├── 📄 review.service.ts
│   │   │   │   ├── 📄 salon.service.ts
│   │   │   │   ├── 📄 schedule-api.ts
│   │   │   │   ├── 📄 schedule.service.ts
│   │   │   │   ├── 📄 service-catalog.service.ts
│   │   │   │   ├── 📄 sms.service.ts
│   │   │   │   ├── 📄 staff.service.ts
│   │   │   │   ├── 📄 time-off-api.ts
│   │   │   │   ├── 📄 time-off.service.ts
│   │   │   │   ├── 📄 user-growth-service.ts
│   │   │   │   ├── 📄 user-growth.service.ts
│   │   │   │   ├── 📄 walk-in-service.ts
│   │   │   │   └── 📄 walk-in.service.ts
│   │   │   ├── 📁 validators
│   │   │   │   ├── 📄 appointment.ts
│   │   │   │   ├── 📄 auth.ts
│   │   │   │   ├── 📄 customer.ts
│   │   │   │   ├── 📄 index.ts
│   │   │   │   └── 📄 service.ts
│   │   │   ├── 📄 auth-utils.ts
│   │   │   ├── 📄 crud-utils.ts
│   │   │   ├── 📄 index.ts
│   │   │   └── 📄 salon-context.ts
│   │   ├── 📁 auth
│   │   │   ├── 📄 constants.ts
│   │   │   ├── 📄 helpers.ts
│   │   │   └── 📄 server.ts
│   │   ├── 📁 config
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 messages.ts
│   │   │   ├── 📄 roles.ts
│   │   │   └── 📄 routes.ts
│   │   ├── 📁 constants
│   │   │   └── 📄 roles.ts
│   │   ├── 📁 contexts
│   │   │   └── 📄 salon-context.tsx
│   │   ├── 📁 supabase
│   │   │   ├── 📄 client.ts
│   │   │   ├── 📄 middleware.ts
│   │   │   ├── 📄 server.ts
│   │   │   └── 📄 service.ts
│   │   ├── 📁 utils
│   │   │   ├── 📄 cn.ts
│   │   │   ├── 📄 date.ts
│   │   │   ├── 📄 error-reporter.ts
│   │   │   ├── 📄 format.ts
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 permissions.ts
│   │   │   └── 📄 styles.ts
│   │   ├── 📄 date-utils.ts
│   │   └── 📄 utils.ts
│   ├── 📁 types
│   │   ├── 📁 features
│   │   │   ├── 📄 api-usage-types.ts
│   │   │   ├── 📄 appointment-types.ts
│   │   │   ├── 📄 dashboard-types.ts
│   │   │   ├── 📄 earnings-types.ts
│   │   │   ├── 📄 favorites-types.ts
│   │   │   ├── 📄 revenue-types.ts
│   │   │   ├── 📄 schedule-types.ts
│   │   │   ├── 📄 time-off-types.ts
│   │   │   ├── 📄 user-growth-types.ts
│   │   │   ├── 📄 users-table-types.ts
│   │   │   └── 📄 walk-in-types.ts
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
├── 📄 CLAUDE.md
├── 📄 README.md
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

## ⚠️ Issues Found


🟡 **Missing /public directory for static assets**
   - Create /public directory for images, fonts, and static files

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