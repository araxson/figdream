# 📚 FigDream Application Pages Guide

## Overview
FigDream is a comprehensive salon management platform with 5 distinct user roles, each with their own dedicated portal and features.

---

## 🌐 Public Pages (No Login Required)

### Marketing Pages (`/`)
- **Homepage** `/` - Landing page showcasing the platform
- **About** `/about` - Learn about FigDream and our mission
- **Features** `/features` - Detailed list of platform capabilities
- **Pricing** `/pricing` - Subscription plans and pricing tiers
- **FAQ** `/faq` - Frequently asked questions
- **Contact** `/contact` - Get in touch with support or sales
- **Book** `/book` - Public booking page to find and book salon services

### Authentication Pages
- **Login** `/login` - Main login page with role selection
  - `/login/customer` - Customer-specific login
  - `/login/staff` - Staff member login
  - `/login/salon-owner` - Salon owner login
  - `/login/location-manager` - Location manager login
- **Register** `/register` - New user registration
  - `/register/customer` - Sign up as a customer
  - `/register/salon` - Register a new salon
  - `/register/staff` - Staff member registration
- **Password Recovery** 
  - `/forgot-password` - Request password reset email
  - `/reset-password` - Reset password with token
- **Email Verification** `/verify-email` - Confirm email address
- **Logout** `/logout` - Sign out of the platform
- **OAuth Callback** `/oauth-callback` - Handle social login returns

### Error Pages
- **401 Unauthorized** `/error-401` - When authentication is required
- **403 Forbidden** `/error-403` - When access is denied

---

## 👤 Role 1: Customer Portal (`/customer`)

**Purpose**: For clients who book salon services

### Main Pages
- **Dashboard** `/customer` - Overview of upcoming appointments, loyalty points, and quick actions
- **Appointments** `/customer/appointments` - View, manage, and cancel bookings
  - `/customer/appointments/[id]` - View specific appointment details
- **Loyalty Program** `/customer/loyalty` - Track points, rewards, and tier status
- **Gift Cards** `/customer/gift-cards` - Purchase and manage gift cards
- **Favorites** `/customer/favorites` - Save favorite salons, services, and staff
- **Reviews** `/customer/reviews` - Write and manage reviews for services
  - `/customer/reviews/new` - Write a new review
- **Payment Methods** `/customer/payment-methods` - Manage saved credit cards
- **Payments** `/customer/payments` - View payment history and receipts
- **Profile** `/customer/profile` - Edit personal information and avatar
- **Preferences** `/customer/preferences` - Set booking and service preferences
- **Notifications** `/customer/notifications` - View and manage notifications
  - `/customer/notifications/settings` - Notification preferences
- **Settings** `/customer/settings` - Account settings and privacy

---

## 💇 Role 2: Staff Member Portal (`/staff`)

**Purpose**: For salon employees (stylists, technicians, etc.)

### Main Pages
- **Dashboard** `/staff` - Today's appointments, schedule overview
- **Appointments** `/staff/appointments` - Manage client appointments
  - `/staff/appointments/[id]` - View/edit appointment details
- **Schedule** `/staff/schedule` - View and manage work schedule
- **Earnings** `/staff/earnings` - Track commissions, tips, and payouts
- **Performance** `/staff/performance` - View performance metrics and goals
- **Time Off** `/staff/time-off` - Request and manage time off
- **Profile** `/staff/profile` - Professional profile, certifications, specialties
- **Settings** `/staff/settings` - Personal preferences and app settings

---

## 💼 Role 3: Salon Owner Portal (`/salon`)

**Purpose**: For business owners managing one or more salons

### Main Dashboards
- **Main Dashboard** `/salon/dashboard` - Business overview, key metrics
- **Analytics Dashboard** `/salon/analytics` - Detailed business analytics
  - `/salon/analytics/metrics-overview` - Key performance indicators
  - `/salon/analytics/customer-insights` - Customer behavior analysis
  - `/salon/analytics/patterns` - Booking patterns and trends
- **Predictions** `/salon/dashboard/predictions` - AI-powered forecasting

### Operations Management
- **Appointments** `/salon/appointments` - All salon appointments
  - `/salon/appointments/calendar` - Calendar view
  - `/salon/appointments/notes` - Appointment notes management
- **Customers** `/salon/customers` - Customer database and CRM
- **Staff** `/salon/staff` - Employee management
  - `/salon/staff/schedule` - Staff scheduling
  - `/salon/staff/performance` - Performance tracking
  - `/salon/staff/specialties` - Manage staff specialties
  - `/salon/staff/services` - Assign services to staff
  - `/salon/staff/breaks` - Break patterns configuration
  - `/salon/staff/time-off` - Approve time off requests

### Service & Inventory
- **Services** `/salon/services` - Service menu management
  - `/salon/services/pricing` - Service pricing
  - `/salon/services/costs` - Cost analysis
  - `/salon/services/availability` - Service availability matrix
- **Categories** `/salon/categories` - Service categories

### Business Features
- **Locations** `/salon/locations` - Multi-location management
  - `/salon/locations/new` - Add new location
- **Loyalty Program** `/salon/loyalty` - Customer loyalty management
  - `/salon/loyalty/rewards` - Reward configuration
  - `/salon/loyalty/transactions` - Points transactions
  - `/salon/loyalty/ledger` - Points ledger
- **Marketing** `/salon/marketing` - Marketing campaigns
  - `/salon/marketing/analytics` - Campaign performance
  - `/salon/marketing/recipients` - Audience management
  - `/salon/marketing/sms-opt-outs` - SMS preference management

### Additional Features
- **Time Management**
  - `/salon/time-off` - Staff time off overview
  - `/salon/blocked-times` - Block schedule times
- **Business Tools**
  - `/salon/data-export` - Export business data
  - `/salon/waitlist` - Waitlist management
  - `/salon/reviews` - Review management
  - `/salon/notifications/templates` - Notification templates
- **Settings** `/salon/settings` - Business settings
  - `/salon/settings/export` - Data export settings
  - `/salon/settings/notifications` - Notification settings

---

## 📍 Role 4: Location Manager Portal (`/location-manager`)

**Purpose**: For managers overseeing specific salon locations

### Main Pages
- **Dashboard** `/location-manager` - Location overview and metrics
- **Appointments** `/location-manager/appointments` - Location appointments
- **Staff** `/location-manager/staff` - Location staff management
- **Schedule** `/location-manager/schedule` - Location scheduling
- **Reports** `/location-manager/reports` - Performance reports
- **Settings** `/location-manager/settings` - Location-specific settings

---

## 🛡️ Role 5: Super Admin Portal (`/admin`)

**Purpose**: For platform administrators managing the entire system

### Main Dashboards
- **Dashboard** `/admin` - Platform-wide overview
- **Analytics** `/admin/analytics` - System-wide analytics
- **System Health** `/admin/system-health` - Server and performance monitoring

### User & Access Management
- **Users** `/admin/users` - User management
  - `/admin/users/roles` - Role assignments and permissions
- **Salons** `/admin/salons` - All salon management

### Platform Management
- **Subscriptions** `/admin/subscriptions` - Subscription plans and billing
- **Billing** `/admin/billing` - Platform billing and invoices
- **Audit Logs** `/admin/audit` - Security and activity logs

### System Monitoring
- **Monitoring** `/admin/monitoring` - System monitoring
  - `/admin/monitoring/api-usage` - API usage tracking
  - `/admin/monitoring/error-logs` - Error log viewer
  - `/admin/monitoring/rate-limits` - Rate limiting dashboard

### Configuration
- **System Configuration** `/admin/system/configuration` - System settings
- **Email Templates** `/admin/email-templates` - Email template management
- **Settings** `/admin/settings` - Platform settings

---

## 🔌 API Routes (`/api`)

### Core APIs
- `/api/auth/*` - Authentication endpoints
- `/api/stripe/*` - Payment processing
  - `/api/stripe/webhook` - Stripe webhooks
  - `/api/stripe/create-payment-intent` - Payment initiation
  - `/api/stripe/create-subscription` - Subscription creation
- `/api/notifications/*` - Notification system
- `/api/upload` - File uploads
- `/api/export` - Data export
- `/api/webhooks` - External webhooks
- `/api/cron` - Scheduled tasks

---

## 📱 Key Features by Role

### Customers Can:
- Book appointments online
- Track loyalty points and rewards
- Save favorite salons and stylists
- Leave reviews and ratings
- Manage payment methods
- View appointment history

### Staff Can:
- View their daily schedule
- Track earnings and commissions
- Request time off
- See performance metrics
- Manage their professional profile

### Salon Owners Can:
- Monitor business performance
- Manage staff and services
- Run marketing campaigns
- Configure loyalty programs
- Analyze customer data
- Handle multi-location operations

### Location Managers Can:
- Oversee location operations
- Manage local staff schedules
- Generate location reports
- Handle day-to-day operations

### Super Admins Can:
- Monitor platform health
- Manage all users and permissions
- Configure system settings
- Track API usage and errors
- Handle billing and subscriptions
- Audit system activity

---

## 🚀 Getting Started

1. **Public Users**: Start at the homepage (`/`) and explore features
2. **New Customers**: Register at `/register/customer`
3. **Salon Owners**: Register your salon at `/register/salon`
4. **Staff Members**: Get invited by your salon or register at `/register/staff`
5. **Returning Users**: Login at `/login` with your credentials

---

## 📞 Support

- For technical issues: Visit `/contact`
- For account help: Check `/faq` first
- For billing questions: Salon owners can check `/salon/settings`

---

*Last Updated: September 2025*