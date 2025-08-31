# Database-Frontend Mapping Report
*Generated: 2025-08-31*

## Overview

This document maps all 52 database tables and 8 views to their frontend implementations, identifying gaps and alignment issues.

## Mapping Legend

- ✅ **Full Coverage**: Complete CRUD operations and UI
- ⚠️ **Partial Coverage**: Some operations or views missing
- ❌ **No Coverage**: No frontend implementation
- 🔧 **Backend Only**: Used only in backend/API layer
- 📊 **View/Computed**: Database view or computed table

## Core Business Tables

### 1. `salons` ✅
**Purpose**: Salon business information and settings
**Frontend Coverage**: 
- ✅ Registration: `/register/salon`
- ✅ Dashboard: `/salon-admin/dashboard`
- ✅ List: `/salon-admin/salons`
- ✅ Public Booking: `/book` - NOW CONNECTED TO DATABASE
- ✅ Individual Salon: `/book/[salon-id]` - FULLY FUNCTIONAL
- ❌ Edit: Missing salon profile editor
**Data Access**: `/lib/data-access/salons/index.ts`
**Recent Updates**: Public booking system now fetches real salon data

### 2. `salon_locations` ❌
**Purpose**: Multi-location support for salon chains
**Frontend Coverage**: None
**Missing Pages**: `/salon-admin/locations/*`
**Data Access**: Not implemented

### 3. `customers` ✅
**Purpose**: Customer profiles and information
**Frontend Coverage**:
- ✅ Registration: `/register/customer`
- ✅ Dashboard: `/customer`
- ✅ Profile: `/customer/profile`
- ✅ Admin View: `/salon-admin/customers`
**Data Access**: `/lib/data-access/customers/index.ts`

### 4. `staff_profiles` ⚠️
**Purpose**: Staff member information
**Frontend Coverage**:
- ✅ Registration: `/register/staff`
- ✅ Dashboard: `/staff`
- ✅ List: `/salon-admin/staff`
- ✅ Schedule: `/staff/schedule`
- ❌ Time-off: `/salon-admin/time-off` empty
**Data Access**: `/lib/data-access/staff/index.ts`

### 5. `profiles` ✅
**Purpose**: User authentication profiles
**Frontend Coverage**: Complete across all user types
**Data Access**: `/lib/data-access/users/index.ts`

### 6. `user_roles` ✅
**Purpose**: Role-based access control
**Frontend Coverage**: Used in all authentication flows
**Data Access**: `/lib/data-access/auth/roles.ts`

## Appointment System Tables

### 7. `appointments` ✅
**Purpose**: Core appointment records
**Frontend Coverage**:
- ✅ Admin View: `/salon-admin/appointments`
- ✅ Staff View: `/staff/appointments`
- ✅ Customer View: `/customer/appointments`
- ✅ Public Booking: `/book/*` - NOW CONNECTED WITH createBooking()
- ❌ API Endpoints: `/api/appointments/` empty
**Data Access**: 
- `/lib/data-access/bookings/index.ts`
- `/lib/data-access/bookings/public-booking.ts` (NEW)

### 8. `appointment_services` ⚠️
**Purpose**: Services linked to appointments
**Frontend Coverage**:
- ✅ Display in appointment details
- ❌ Dedicated management view missing
**Data Access**: Part of bookings module

### 9. `appointment_notes` ❌
**Purpose**: Notes and comments on appointments
**Frontend Coverage**: None
**Missing Pages**: `/salon-admin/appointments/notes/`
**Data Access**: Not implemented

### 10. `blocked_times` ⚠️
**Purpose**: Blocked time slots for scheduling
**Frontend Coverage**:
- ⚠️ Basic page exists: `/salon-admin/blocked-times`
- ❌ No actual implementation
**Data Access**: `/lib/data-access/blocked-times/index.ts`

## Service Management Tables

### 11. `services` ✅
**Purpose**: Salon service catalog
**Frontend Coverage**:
- ✅ CRUD: `/salon-admin/services`
- ✅ Selection in booking forms
- ✅ Public Display: Connected in `/book/[salon-id]`
- ✅ Service browsing with real data
**Data Access**: `/lib/data-access/services/index.ts`
**Recent Updates**: Public booking now displays real services

### 12. `service_categories` ✅
**Purpose**: Service categorization
**Frontend Coverage**:
- ✅ Management: `/salon-admin/categories`
- ✅ Used in service organization
**Data Access**: `/lib/data-access/categories/index.ts`

### 13. `service_costs` ❌
**Purpose**: Advanced pricing rules
**Frontend Coverage**: None
**Data Access**: Not implemented

### 14. `service_location_availability` ❌
**Purpose**: Service availability per location
**Frontend Coverage**: None (no multi-location support)
**Data Access**: Not implemented

### 15. `staff_services` ⚠️
**Purpose**: Staff-service associations
**Frontend Coverage**:
- ✅ Assignment in service management
- ❌ Staff specialty management missing
**Data Access**: Part of services module

### 16. `staff_specialties` ❌
**Purpose**: Staff expertise areas
**Frontend Coverage**: None
**Data Access**: Not implemented

## Staff Management Tables

### 17. `staff_schedules` ✅
**Purpose**: Staff working hours
**Frontend Coverage**:
- ✅ View/Edit: `/staff/schedule`
- ✅ Admin view in staff management
**Data Access**: Part of staff module

### 18. `staff_time_off` ❌
**Purpose**: Staff time-off records
**Frontend Coverage**: None
**Missing Pages**: `/salon-admin/time-off/*`
**Data Access**: `/lib/data-access/time-off/index.ts` (basic)

### 19. `time_off_requests` ❌
**Purpose**: Time-off request workflow
**Frontend Coverage**: None
**Data Access**: Part of time-off module

### 20. `staff_breaks` ❌
**Purpose**: Break scheduling
**Frontend Coverage**: None
**Data Access**: Not implemented

### 21. `staff_earnings` ⚠️
**Purpose**: Commission and earnings tracking
**Frontend Coverage**:
- ✅ View: `/staff/earnings`
- ❌ Admin management missing
**Data Access**: Part of staff module

### 22. `staff_utilization` ⚠️
**Purpose**: Staff performance metrics
**Frontend Coverage**:
- ⚠️ Dashboard metrics only
- ❌ Detailed reports missing
**Data Access**: Used in analytics

## Customer Engagement Tables

### 23. `reviews` ✅
**Purpose**: Customer reviews and ratings
**Frontend Coverage**:
- ✅ Submit: `/customer/reviews/new`
- ✅ View: `/customer/reviews`
- ✅ Moderation: Components exist
**Data Access**: `/lib/data-access/reviews/reviews.ts`

### 24. `review_requests` ⚠️
**Purpose**: Automated review solicitation
**Frontend Coverage**:
- ⚠️ Backend automation only
- ❌ Management UI missing
**Data Access**: Part of reviews module

### 25. `customer_preferences` ⚠️
**Purpose**: Customer service preferences
**Frontend Coverage**:
- ✅ Edit: `/customer/profile`
- ❌ Admin view missing
**Data Access**: Part of customers module

### 26. `customer_analytics` ⚠️
**Purpose**: Customer behavior tracking
**Frontend Coverage**:
- ⚠️ Dashboard aggregates only
- ❌ Detailed analytics missing
**Data Access**: Used in analytics

## Loyalty & Rewards Tables

### 27. `loyalty_programs` ⚠️
**Purpose**: Loyalty program configuration
**Frontend Coverage**:
- ✅ Customer view: `/customer/loyalty`
- ❌ Admin configuration missing
**Data Access**: `/lib/data-access/loyalty/loyalty-program.ts`

### 28. `loyalty_points_ledger` ⚠️
**Purpose**: Points transaction log
**Frontend Coverage**:
- ✅ Customer view in loyalty dashboard
- ❌ Admin ledger management missing
**Data Access**: Part of loyalty module

### 29. `loyalty_transactions` ⚠️
**Purpose**: Loyalty transaction records
**Frontend Coverage**:
- ✅ Customer transaction history
- ❌ Admin reporting missing
**Data Access**: Part of loyalty module

## Marketing Tables

### 30. `email_campaigns` ⚠️
**Purpose**: Email marketing campaigns
**Frontend Coverage**:
- ✅ Create/List: `/salon-admin/marketing`
- ❌ Analytics and reporting missing
**Data Access**: `/lib/data-access/marketing/campaigns.ts`

### 31. `email_campaign_recipients` ⚠️
**Purpose**: Campaign recipient tracking
**Frontend Coverage**:
- ⚠️ Backend only
- ❌ Recipient management UI missing
**Data Access**: Part of marketing module

### 32. `sms_campaigns` ⚠️
**Purpose**: SMS marketing campaigns
**Frontend Coverage**:
- ✅ Create/List: `/salon-admin/marketing`
- ❌ Analytics missing
**Data Access**: Part of marketing module

### 33. `sms_campaign_recipients` ⚠️
**Purpose**: SMS recipient tracking
**Frontend Coverage**:
- ⚠️ Backend only
- ❌ UI missing
**Data Access**: Part of marketing module

### 34. `sms_opt_outs` ✅
**Purpose**: SMS opt-out management
**Frontend Coverage**:
- ✅ Management: `/salon-admin/marketing/sms-opt-outs`
**Data Access**: `/lib/data-access/sms-opt-outs/index.ts`

## Notification Tables

### 35. `notifications` ✅
**Purpose**: User notifications
**Frontend Coverage**:
- ✅ View: `/notifications`
- ✅ Bell component in header
**Data Access**: `/lib/data-access/notifications/index.ts`

### 36. `notification_settings` ✅
**Purpose**: Notification preferences
**Frontend Coverage**:
- ✅ Settings: `/notifications/settings`
- ✅ Profile preferences
**Data Access**: `/lib/data-access/notification-settings/index.ts`

## Platform Administration Tables

### 37. `platform_subscriptions` ⚠️
**Purpose**: SaaS subscription management
**Frontend Coverage**:
- ✅ Super admin: `/super-admin/subscriptions`
- ❌ Salon billing view missing
**Data Access**: `/lib/data-access/subscriptions/index.ts`

### 38. `platform_subscription_plans` ⚠️
**Purpose**: Available subscription tiers
**Frontend Coverage**:
- ✅ Pricing page: `/pricing`
- ⚠️ Admin management limited
**Data Access**: Part of subscriptions module

### 39. `settings` ⚠️
**Purpose**: Application settings
**Frontend Coverage**:
- ⚠️ Basic: `/salon-admin/settings`
- ❌ Advanced configuration missing
**Data Access**: `/lib/data-access/settings/index.ts`

### 40. `system_configuration` 🔧
**Purpose**: System-wide configuration
**Frontend Coverage**: Backend only
**Data Access**: Not exposed to frontend

## Analytics & Monitoring Tables

### 41. `analytics_patterns` ❌
**Purpose**: AI-driven pattern recognition
**Frontend Coverage**: None
**Data Access**: Not implemented

### 42. `analytics_predictions` ❌
**Purpose**: Predictive analytics
**Frontend Coverage**: None
**Data Access**: Not implemented

### 43. `dashboard_metrics` ⚠️
**Purpose**: Pre-computed dashboard data
**Frontend Coverage**:
- ✅ Used in dashboards
- ❌ Direct management missing
**Data Access**: `/lib/data-access/analytics/index.ts`

### 44. `api_usage` ⚠️
**Purpose**: API call tracking
**Frontend Coverage**:
- ⚠️ Super admin dashboard only
- ❌ Detailed reports missing
**Data Access**: Backend only

### 45. `audit_logs` ⚠️
**Purpose**: System audit trail
**Frontend Coverage**:
- ✅ Super admin: `/super-admin/audit`
- ❌ Salon-level audit missing
**Data Access**: `/lib/data-access/audit-logs/index.ts`

### 46. `audit_summary_internal` 🔧
**Purpose**: Audit aggregations
**Frontend Coverage**: Backend only
**Data Access**: Not exposed

### 47. `error_logs` 🔧
**Purpose**: Application error tracking
**Frontend Coverage**: Backend only
**Data Access**: Not exposed

## Security Tables

### 48. `auth_otp_attempts` 🔧
**Purpose**: OTP attempt tracking
**Frontend Coverage**: Backend only
**Data Access**: Auth module internal

### 49. `auth_otp_config` 🔧
**Purpose**: OTP configuration
**Frontend Coverage**: Backend only
**Data Access**: Auth module internal

### 50. `csrf_tokens` 🔧
**Purpose**: CSRF protection
**Frontend Coverage**: Backend only
**Data Access**: Security layer

### 51. `rate_limits` 🔧
**Purpose**: Rate limiting
**Frontend Coverage**: Backend only
**Data Access**: Security layer

## Export/Import Tables

### 52. `export_configurations` ❌
**Purpose**: Data export settings
**Frontend Coverage**: None
**Missing Pages**: `/salon-admin/settings/export/`
**Data Access**: Not implemented

### 53. `export_history` ❌
**Purpose**: Export audit trail
**Frontend Coverage**: None
**Data Access**: Not implemented

## Database Views

### 54. `customer_lifetime_value` 📊
**Purpose**: CLV calculations
**Frontend Coverage**: Dashboard metrics only

### 55. `customer_loyalty_summary` 📊
**Purpose**: Loyalty overview
**Frontend Coverage**: Customer loyalty page

### 56. `dashboard_realtime` 📊
**Purpose**: Real-time metrics
**Frontend Coverage**: Admin dashboards

### 57. `mv_active_user_roles` 📊
**Purpose**: Materialized role view
**Frontend Coverage**: Authentication layer

### 58. `optimization_summary` 📊
**Purpose**: Performance metrics
**Frontend Coverage**: Backend only

### 59. `service_profitability` 📊
**Purpose**: Service ROI analysis
**Frontend Coverage**: Dashboard aggregates

### 60. `staff_earnings_summary` 📊
**Purpose**: Earnings overview
**Frontend Coverage**: Staff earnings page

### 61. `staff_performance_dashboard` 📊
**Purpose**: Performance KPIs
**Frontend Coverage**: Dashboard metrics

## Summary Statistics

### Coverage by Category

| Category | Tables | Full ✅ | Partial ⚠️ | None ❌ | Backend 🔧 |
|----------|--------|---------|------------|---------|------------|
| Core Business | 6 | 3 | 2 | 1 | 0 |
| Appointments | 4 | 0 | 2 | 2 | 0 |
| Services | 6 | 2 | 1 | 3 | 0 |
| Staff | 6 | 1 | 2 | 3 | 0 |
| Customer | 4 | 1 | 3 | 0 | 0 |
| Loyalty | 3 | 0 | 3 | 0 | 0 |
| Marketing | 5 | 1 | 4 | 0 | 0 |
| Notifications | 2 | 2 | 0 | 0 | 0 |
| Platform | 4 | 0 | 2 | 0 | 2 |
| Analytics | 7 | 0 | 2 | 2 | 3 |
| Security | 4 | 0 | 0 | 0 | 4 |
| Export | 2 | 0 | 0 | 2 | 0 |
| **TOTAL** | **53** | **10 (19%)** | **21 (40%)** | **13 (24%)** | **9 (17%)** |

### Critical Gaps

1. **Zero Frontend Coverage (13 tables)**:
   - Multi-location support
   - Advanced pricing
   - Staff specialties/breaks
   - Time-off management
   - Predictive analytics
   - Export functionality

2. **Partial Coverage Needing Completion (21 tables)**:
   - Public booking system
   - Appointment notes
   - Loyalty administration
   - Marketing analytics
   - Staff performance

3. **Full Coverage (10 tables)**:
   - Core authentication
   - Basic customer features
   - Service categories
   - Notifications
   - SMS opt-outs

## Recommendations

### Priority 1: Connect Existing UI to Database
- Public booking pages (`/book/*`)
- Blocked times management
- Time-off requests

### Priority 2: Build Missing Admin Features
- Multi-location management
- Loyalty program administration
- Export/import functionality
- Advanced analytics dashboards

### Priority 3: Complete Partial Implementations
- Appointment notes
- Staff specialties
- Marketing analytics
- Service pricing rules

### Priority 4: Advanced Features
- Predictive analytics UI
- System configuration interface
- Comprehensive audit trails