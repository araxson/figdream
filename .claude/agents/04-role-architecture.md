# Enterprise Role-Based Architecture & Implementation Agent

## Executive Summary
This agent defines the complete role-based architecture for a B2B SaaS platform with 5 distinct user roles, ensuring 100% implementation coverage of all role-specific features, permissions, and interfaces.

## Role Hierarchy & Business Model

```
┌────────────────────────────────────────────────────────────┐
│                     SUPER ADMIN                            │
│                  (Platform Owner)                          │
│  • Owns the entire SaaS platform                          │
│  • Receives subscription payments from salons             │
│  • Full system access and control                         │
└───────────────────────┬────────────────────────────────────┘
                        │ Manages & Bills
                        ▼
┌────────────────────────────────────────────────────────────┐
│                    SALON OWNER                             │
│                 (Paying Customer)                          │
│  • Pays monthly/annual subscription to platform           │
│  • Manages their salon business                           │
│  • Can have multiple locations                            │
└──────────┬─────────────────────────┬───────────────────────┘
           │ Manages                  │ Assigns
           ▼                          ▼
┌──────────────────────┐    ┌────────────────────────────────┐
│  LOCATION MANAGER    │    │           STAFF                │
│  (Delegated Admin)   │    │    (Service Provider)          │
│  • Manages specific  │    │  • Provides services           │
│    location(s)       │    │  • Manages own schedule        │
│  • Reports to owner  │    │  • Tracks performance          │
└──────────────────────┘    └────────────────────────────────┘
                        │
                        │ All Serve
                        ▼
┌────────────────────────────────────────────────────────────┐
│                      CUSTOMER                              │
│                  (End User)                                │
│  • Books appointments                                      │
│  • Pays salon directly (not through platform)             │
│  • Manages preferences and favorites                       │
└────────────────────────────────────────────────────────────┘
```

## Complete Role Definitions & Implementations

### 1. SUPER ADMIN - Platform Owner (God Mode)

#### Core Responsibilities
- **Revenue Management**: Monitor and manage all subscription revenue
- **Platform Operations**: Complete control over entire platform
- **System Administration**: User management, system settings, monitoring
- **Business Intelligence**: Platform-wide analytics and insights
- **Compliance & Security**: Ensure platform meets all requirements

#### Required Pages & Features

```typescript
// MUST IMPLEMENT: src/app/super-admin/
├── dashboard/
│   ├── page.tsx                    // Platform overview dashboard
│   ├── revenue/page.tsx            // MRR, ARR, churn metrics
│   ├── growth/page.tsx             // Growth analytics
│   └── health/page.tsx             // System health monitoring
│
├── subscriptions/
│   ├── page.tsx                    // All platform subscriptions
│   ├── [id]/page.tsx              // Individual subscription details
│   ├── plans/page.tsx             // Manage subscription plans
│   ├── pricing/page.tsx           // Pricing configuration
│   └── invoices/page.tsx          // All platform invoices
│
├── salons/
│   ├── page.tsx                    // All salons on platform
│   ├── [id]/page.tsx              // Individual salon details
│   ├── [id]/impersonate/page.tsx  // Login as salon owner
│   ├── suspended/page.tsx         // Suspended accounts
│   └── pending/page.tsx           // Pending activations
│
├── users/
│   ├── page.tsx                    // All users across platform
│   ├── [id]/page.tsx              // User details
│   ├── roles/page.tsx             // Role management
│   ├── permissions/page.tsx      // Permission matrix
│   └── activity/page.tsx          // User activity logs
│
├── financial/
│   ├── page.tsx                    // Financial overview
│   ├── revenue/page.tsx           // Revenue reports
│   ├── payouts/page.tsx           // Payout management
│   ├── taxes/page.tsx             // Tax reports
│   └── stripe/page.tsx            // Stripe integration
│
├── analytics/
│   ├── page.tsx                    // Platform analytics
│   ├── usage/page.tsx             // Feature usage stats
│   ├── engagement/page.tsx        // User engagement
│   ├── retention/page.tsx         // Retention metrics
│   └── forecasting/page.tsx       // Revenue forecasting
│
├── monitoring/
│   ├── page.tsx                    // System monitoring
│   ├── logs/page.tsx              // System logs
│   ├── errors/page.tsx            // Error tracking
│   ├── api/page.tsx               // API usage
│   ├── performance/page.tsx      // Performance metrics
│   └── security/page.tsx          // Security events
│
├── communications/
│   ├── page.tsx                    // Communication center
│   ├── announcements/page.tsx     // Platform announcements
│   ├── newsletters/page.tsx       // Newsletter management
│   ├── support/page.tsx           // Support tickets
│   └── feedback/page.tsx          // User feedback
│
├── settings/
│   ├── page.tsx                    // Platform settings
│   ├── features/page.tsx          // Feature flags
│   ├── limits/page.tsx            // Usage limits
│   ├── integrations/page.tsx     // Third-party integrations
│   ├── api-keys/page.tsx          // API key management
│   └── webhooks/page.tsx          // Webhook configuration
│
└── tools/
    ├── page.tsx                    // Admin tools
    ├── migrations/page.tsx        // Data migrations
    ├── backups/page.tsx           // Backup management
    ├── exports/page.tsx           // Data exports
    └── diagnostics/page.tsx       // System diagnostics
```

#### Permissions & Capabilities
```typescript
interface SuperAdminPermissions {
  // God mode - can do everything
  platform: {
    viewAllData: true
    modifyAllData: true
    deleteAllData: true
    impersonateUsers: true
    accessSystemSettings: true
    manageBilling: true
    viewFinancials: true
    exportAllData: true
  }
  
  // Subscription management
  subscriptions: {
    create: true
    modify: true
    cancel: true
    refund: true
    changePrice: true
    applyDiscounts: true
    extendTrial: true
  }
  
  // System operations
  system: {
    deployUpdates: true
    runMigrations: true
    accessDatabase: true
    viewLogs: true
    modifyConfiguration: true
    manageIntegrations: true
  }
}
```

### 2. SALON OWNER - Paying B2B Customer

#### Core Responsibilities
- **Business Management**: Manage salon operations
- **Staff Management**: Hire and manage staff
- **Service Management**: Define services and pricing
- **Marketing**: Campaigns and customer engagement
- **Analytics**: Business insights and reporting

#### Required Pages & Features

```typescript
// MUST IMPLEMENT: src/app/salon-owner/
├── dashboard/
│   ├── page.tsx                    // Business overview
│   ├── today/page.tsx             // Today's agenda
│   ├── metrics/page.tsx           // Key metrics
│   └── alerts/page.tsx            // Important notifications
│
├── subscription/
│   ├── page.tsx                    // Current subscription
│   ├── billing/page.tsx           // Billing & invoices
│   ├── upgrade/page.tsx           // Upgrade plan
│   ├── payment-methods/page.tsx  // Payment methods
│   └── usage/page.tsx             // Usage statistics
│
├── locations/
│   ├── page.tsx                    // All locations
│   ├── [id]/page.tsx              // Location details
│   ├── new/page.tsx               // Add location
│   ├── [id]/settings/page.tsx    // Location settings
│   └── [id]/hours/page.tsx       // Operating hours
│
├── staff/
│   ├── page.tsx                    // Staff list
│   ├── [id]/page.tsx              // Staff details
│   ├── invite/page.tsx            // Invite staff
│   ├── roles/page.tsx             // Role management
│   ├── schedule/page.tsx          // Staff scheduling
│   ├── performance/page.tsx      // Performance tracking
│   └── payroll/page.tsx           // Payroll management
│
├── services/
│   ├── page.tsx                    // Service catalog
│   ├── [id]/page.tsx              // Service details
│   ├── new/page.tsx               // Add service
│   ├── categories/page.tsx       // Categories
│   ├── pricing/page.tsx           // Pricing rules
│   └── packages/page.tsx          // Service packages
│
├── appointments/
│   ├── page.tsx                    // Appointment calendar
│   ├── [id]/page.tsx              // Appointment details
│   ├── calendar/page.tsx          // Calendar view
│   ├── requests/page.tsx          // Booking requests
│   └── waitlist/page.tsx          // Waitlist management
│
├── customers/
│   ├── page.tsx                    // Customer database
│   ├── [id]/page.tsx              // Customer profile
│   ├── segments/page.tsx          // Customer segments
│   ├── loyalty/page.tsx           // Loyalty program
│   ├── reviews/page.tsx           // Review management
│   └── feedback/page.tsx          // Customer feedback
│
├── marketing/
│   ├── page.tsx                    // Marketing hub
│   ├── campaigns/page.tsx         // Email/SMS campaigns
│   ├── templates/page.tsx         // Message templates
│   ├── automation/page.tsx        // Marketing automation
│   ├── promotions/page.tsx        // Promotions & discounts
│   └── referrals/page.tsx         // Referral program
│
├── analytics/
│   ├── page.tsx                    // Analytics dashboard
│   ├── revenue/page.tsx           // Revenue analytics
│   ├── bookings/page.tsx          // Booking analytics
│   ├── staff/page.tsx             // Staff performance
│   ├── customers/page.tsx         // Customer insights
│   └── trends/page.tsx            // Business trends
│
├── inventory/
│   ├── page.tsx                    // Inventory management
│   ├── products/page.tsx          // Product catalog
│   ├── suppliers/page.tsx         // Suppliers
│   ├── orders/page.tsx            // Purchase orders
│   └── stock/page.tsx             // Stock levels
│
└── settings/
    ├── page.tsx                    // Salon settings
    ├── profile/page.tsx           // Business profile
    ├── branding/page.tsx          // Branding settings
    ├── notifications/page.tsx    // Notification preferences
    ├── integrations/page.tsx     // Third-party integrations
    └── team/page.tsx              // Team settings
```

#### Permissions & Capabilities
```typescript
interface SalonOwnerPermissions {
  // Full control over their salon(s)
  salon: {
    viewAllSalonData: true
    modifySettings: true
    manageLocations: true
    viewFinancials: true
    exportData: true
  }
  
  // Staff management
  staff: {
    hire: true
    fire: true
    modifyRoles: true
    viewPerformance: true
    manageSchedules: true
    setCommissions: true
  }
  
  // Business operations
  operations: {
    setServicePrices: true
    createPromotions: true
    manageInventory: true
    viewAnalytics: true
    runMarketing: true
  }
  
  // Subscription (limited)
  subscription: {
    upgrade: true
    downgrade: true
    updatePayment: true
    cancelSubscription: true
    viewInvoices: true
  }
}
```

### 3. LOCATION MANAGER - Delegated Administrator

#### Core Responsibilities
- **Location Operations**: Manage day-to-day operations
- **Staff Coordination**: Schedule and coordinate staff
- **Customer Service**: Handle bookings and issues
- **Reporting**: Report to salon owner

#### Required Pages & Features

```typescript
// MUST IMPLEMENT: src/app/location-manager/
├── dashboard/
│   ├── page.tsx                    // Location overview
│   ├── today/page.tsx             // Today's operations
│   └── tasks/page.tsx             // Daily tasks
│
├── appointments/
│   ├── page.tsx                    // Location appointments
│   ├── calendar/page.tsx          // Calendar view
│   ├── check-in/page.tsx          // Customer check-in
│   ├── walk-ins/page.tsx          // Walk-in management
│   └── cancellations/page.tsx     // Handle cancellations
│
├── staff/
│   ├── page.tsx                    // Location staff
│   ├── schedule/page.tsx          // Staff scheduling
│   ├── attendance/page.tsx        // Attendance tracking
│   ├── breaks/page.tsx            // Break management
│   └── assignments/page.tsx       // Service assignments
│
├── operations/
│   ├── page.tsx                    // Daily operations
│   ├── opening/page.tsx           // Opening procedures
│   ├── closing/page.tsx           // Closing procedures
│   ├── inventory/page.tsx         // Inventory check
│   └── maintenance/page.tsx       // Maintenance tasks
│
├── customers/
│   ├── page.tsx                    // Customer management
│   ├── check-in/page.tsx          // Customer check-in
│   ├── complaints/page.tsx        // Handle complaints
│   └── feedback/page.tsx          // Collect feedback
│
├── reports/
│   ├── page.tsx                    // Location reports
│   ├── daily/page.tsx             // Daily report
│   ├── weekly/page.tsx            // Weekly summary
│   ├── incidents/page.tsx         // Incident reports
│   └── performance/page.tsx       // Performance metrics
│
└── settings/
    ├── page.tsx                    // Location settings
    ├── hours/page.tsx             // Operating hours
    ├── notifications/page.tsx    // Alert preferences
    └── profile/page.tsx           // Manager profile
```

#### Permissions & Capabilities
```typescript
interface LocationManagerPermissions {
  // Location-specific permissions
  location: {
    viewLocationData: true
    modifySchedules: true
    handleBookings: true
    manageWaitlist: true
    viewReports: true
  }
  
  // Limited staff management
  staff: {
    viewSchedules: true
    modifySchedules: true
    trackAttendance: true
    assignServices: true
    requestTimeOff: false // Can't approve
  }
  
  // Customer service
  customers: {
    checkIn: true
    handleComplaints: true
    processRefunds: false // Needs owner approval
    viewHistory: true
  }
  
  // Restricted operations
  operations: {
    modifyPrices: false
    createPromotions: false
    accessFinancials: false
    exportData: true // Limited to location
  }
}
```

### 4. STAFF - Service Provider

#### Core Responsibilities
- **Service Delivery**: Provide services to customers
- **Schedule Management**: Manage availability
- **Performance Tracking**: Track earnings and metrics
- **Professional Development**: Improve skills

#### Required Pages & Features

```typescript
// MUST IMPLEMENT: src/app/staff-member/
├── dashboard/
│   ├── page.tsx                    // Personal dashboard
│   ├── today/page.tsx             // Today's appointments
│   └── upcoming/page.tsx          // Upcoming schedule
│
├── appointments/
│   ├── page.tsx                    // My appointments
│   ├── [id]/page.tsx              // Appointment details
│   ├── calendar/page.tsx          // Personal calendar
│   ├── history/page.tsx           // Past appointments
│   └── notes/page.tsx             // Customer notes
│
├── schedule/
│   ├── page.tsx                    // My schedule
│   ├── availability/page.tsx     // Set availability
│   ├── time-off/page.tsx          // Request time off
│   ├── breaks/page.tsx            // Break preferences
│   └── shifts/page.tsx            // Shift management
│
├── earnings/
│   ├── page.tsx                    // Earnings overview
│   ├── commissions/page.tsx       // Commission tracking
│   ├── tips/page.tsx              // Tips received
│   ├── bonuses/page.tsx           // Performance bonuses
│   └── history/page.tsx           // Payment history
│
├── performance/
│   ├── page.tsx                    // Performance metrics
│   ├── reviews/page.tsx           // Customer reviews
│   ├── ratings/page.tsx           // Service ratings
│   ├── goals/page.tsx             // Performance goals
│   └── achievements/page.tsx      // Achievements
│
├── customers/
│   ├── page.tsx                    // My customers
│   ├── regulars/page.tsx          // Regular clients
│   ├── preferences/page.tsx       // Client preferences
│   └── notes/page.tsx             // Client notes
│
├── professional/
│   ├── page.tsx                    // Professional profile
│   ├── certifications/page.tsx   // Certifications
│   ├── specialties/page.tsx      // Specialties
│   ├── portfolio/page.tsx         // Work portfolio
│   └── training/page.tsx          // Training records
│
└── settings/
    ├── page.tsx                    // Personal settings
    ├── profile/page.tsx           // Profile information
    ├── notifications/page.tsx    // Notification preferences
    ├── preferences/page.tsx      // Work preferences
    └── banking/page.tsx           // Banking details
```

#### Permissions & Capabilities
```typescript
interface StaffPermissions {
  // Personal data only
  appointments: {
    viewOwnAppointments: true
    viewOthersAppointments: false
    modifyOwnSchedule: true
    cancelAppointments: true // With reason
  }
  
  // Limited customer access
  customers: {
    viewAssignedCustomers: true
    addNotes: true
    viewPurchaseHistory: false
    accessPaymentInfo: false
  }
  
  // Self-management
  profile: {
    updateProfile: true
    setAvailability: true
    requestTimeOff: true
    viewEarnings: true
    updateBanking: true
  }
  
  // Restricted access
  business: {
    viewPrices: true
    modifyPrices: false
    viewOtherStaff: true
    accessReports: false
  }
}
```

### 5. CUSTOMER - End User

#### Core Responsibilities
- **Appointment Booking**: Book and manage appointments
- **Profile Management**: Maintain preferences
- **Feedback**: Provide reviews and feedback
- **Loyalty Participation**: Earn and redeem rewards

#### Required Pages & Features

```typescript
// MUST IMPLEMENT: src/app/customer/
├── dashboard/
│   ├── page.tsx                    // Customer homepage
│   ├── recommendations/page.tsx  // Personalized suggestions
│   └── activity/page.tsx          // Recent activity
│
├── booking/
│   ├── page.tsx                    // Book appointment
│   ├── salons/page.tsx           // Browse salons
│   ├── services/page.tsx         // Browse services
│   ├── staff/page.tsx             // Choose staff
│   ├── availability/page.tsx     // Check availability
│   └── confirmation/page.tsx      // Booking confirmation
│
├── appointments/
│   ├── page.tsx                    // My appointments
│   ├── upcoming/page.tsx          // Upcoming bookings
│   ├── history/page.tsx           // Past appointments
│   ├── [id]/page.tsx              // Appointment details
│   ├── reschedule/[id]/page.tsx  // Reschedule
│   └── cancel/[id]/page.tsx       // Cancel appointment
│
├── favorites/
│   ├── page.tsx                    // Favorites
│   ├── salons/page.tsx           // Favorite salons
│   ├── services/page.tsx         // Favorite services
│   ├── staff/page.tsx             // Favorite staff
│   └── quick-book/page.tsx        // Quick rebooking
│
├── profile/
│   ├── page.tsx                    // My profile
│   ├── preferences/page.tsx      // Service preferences
│   ├── allergies/page.tsx         // Allergies/sensitivities
│   ├── notes/page.tsx             // Special requests
│   └── photos/page.tsx            // Profile photos
│
├── loyalty/
│   ├── page.tsx                    // Loyalty dashboard
│   ├── points/page.tsx            // Points balance
│   ├── rewards/page.tsx           // Available rewards
│   ├── history/page.tsx           // Points history
│   └── tiers/page.tsx             // Loyalty tiers
│
├── reviews/
│   ├── page.tsx                    // My reviews
│   ├── write/page.tsx             // Write review
│   ├── [id]/edit/page.tsx         // Edit review
│   └── responses/page.tsx         // Salon responses
│
├── wallet/
│   ├── page.tsx                    // Digital wallet
│   ├── gift-cards/page.tsx        // Gift cards
│   ├── credits/page.tsx           // Account credits
│   ├── packages/page.tsx          // Prepaid packages
│   └── history/page.tsx           // Transaction history
│
├── notifications/
│   ├── page.tsx                    // Notifications
│   ├── reminders/page.tsx         // Appointment reminders
│   ├── promotions/page.tsx        // Promotional offers
│   └── settings/page.tsx          // Notification settings
│
└── settings/
    ├── page.tsx                    // Account settings
    ├── security/page.tsx          // Security settings
    ├── privacy/page.tsx           // Privacy preferences
    ├── communication/page.tsx    // Communication prefs
    └── delete/page.tsx            // Delete account
```

#### Permissions & Capabilities
```typescript
interface CustomerPermissions {
  // Own data only
  profile: {
    viewOwnProfile: true
    updateOwnProfile: true
    deleteOwnAccount: true
    exportOwnData: true
  }
  
  // Booking capabilities
  booking: {
    createBooking: true
    modifyOwnBooking: true
    cancelOwnBooking: true
    viewAvailability: true
  }
  
  // Interaction features
  interaction: {
    writeReviews: true
    editOwnReviews: true
    addToFavorites: true
    earnLoyaltyPoints: true
    redeemRewards: true
  }
  
  // Restricted access
  restricted: {
    viewOtherCustomers: false
    accessPricing: true // Public info
    viewStaffSchedule: true // Limited
    accessBusinessData: false
  }
}
```

## Database Implementation Requirements per Role

### Super Admin Tables (Platform Management)
```typescript
// MUST IMPLEMENT ALL:
- platform_subscriptions    // Core revenue tracking
- platform_plans           // Subscription tiers
- payment_methods         // Billing methods
- system_logs            // Platform logging
- audit_trails          // Compliance tracking
- platform_settings    // System configuration
- feature_flags       // Feature management
- api_keys           // API access control
```

### Salon Owner Tables (Business Management)
```typescript
// MUST IMPLEMENT ALL:
- salons                   // Business entities
- locations               // Multi-location support
- services               // Service catalog
- staff                 // Employee management
- customers            // Customer database
- appointments        // Booking system
- analytics_patterns // Business intelligence
- campaigns         // Marketing campaigns
- inventory        // Product tracking
```

### Location Manager Tables (Operations)
```typescript
// MUST IMPLEMENT ALL:
- staff_schedule          // Scheduling
- appointments           // Daily bookings
- waitlist_entries      // Waitlist management
- time_off_requests    // PTO management
- incident_reports    // Issue tracking
```

### Staff Tables (Service Delivery)
```typescript
// MUST IMPLEMENT ALL:
- staff_services         // Service capabilities
- staff_specialties     // Specializations
- staff_schedule       // Personal schedule
- staff_breaks        // Break management
- staff_time_off     // Time off requests
- commission_rules  // Earnings calculation
```

### Customer Tables (User Experience)
```typescript
// MUST IMPLEMENT ALL:
- users                    // Authentication
- customer_preferences    // Preferences
- favorites             // Saved items
- bookings             // Appointments
- reviews             // Feedback
- loyalty_points     // Rewards
- loyalty_transactions // Points history
- gift_cards        // Stored value
```

## Role-Based UI Component Library

### Shared Components (All Roles)
```typescript
// src/components/shared/
├── navigation/
│   ├── role-based-sidebar.tsx    // Dynamic per role
│   ├── role-based-header.tsx     // Role-specific header
│   └── breadcrumbs.tsx          // Navigation trail
│
├── dashboards/
│   ├── metric-card.tsx           // KPI displays
│   ├── chart-widget.tsx          // Analytics charts
│   └── activity-feed.tsx         // Recent activities
│
└── auth/
    ├── role-guard.tsx            // Role-based access
    ├── permission-gate.tsx       // Permission checks
    └── impersonate-banner.tsx    // Admin impersonation
```

### Role-Specific Components
```typescript
// src/components/[role]/
├── super-admin/
│   ├── subscription-manager/     // Subscription CRUD
│   ├── revenue-dashboard/       // MRR/ARR tracking
│   ├── system-monitor/         // Platform health
│   └── user-impersonation/   // Switch to any user
│
├── salon-owner/
│   ├── location-switcher/       // Multi-location
│   ├── staff-manager/          // Employee CRUD
│   ├── service-editor/        // Service management
│   └── analytics-dashboard/  // Business insights
│
├── location-manager/
│   ├── daily-checklist/         // Opening/closing
│   ├── schedule-board/         // Staff scheduling
│   ├── walk-in-handler/       // Walk-in bookings
│   └── incident-reporter/    // Issue logging
│
├── staff/
│   ├── appointment-tracker/     // Personal bookings
│   ├── earnings-calculator/    // Commission tracking
│   ├── availability-setter/   // Schedule management
│   └── customer-notes/       // Client preferences
│
└── customer/
    ├── booking-wizard/           // Appointment booking
    ├── salon-finder/           // Discovery
    ├── loyalty-tracker/       // Points/rewards
    └── review-composer/      // Feedback system
```

## Role-Based Routing & Middleware

### Route Protection
```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const session = await getSession()
  const pathname = request.nextUrl.pathname
  
  // Role-based route protection
  const routePermissions = {
    '/super-admin': ['super_admin'],
    '/salon-owner': ['salon_owner', 'super_admin'],
    '/location-manager': ['location_manager', 'salon_owner', 'super_admin'],
    '/staff-member': ['staff', 'location_manager', 'salon_owner', 'super_admin'],
    '/customer': ['customer', 'staff', 'location_manager', 'salon_owner', 'super_admin']
  }
  
  // Check role access
  const requiredRoles = routePermissions[pathname.split('/')[1]]
  if (!requiredRoles?.includes(session?.user?.role)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  // Additional permission checks
  return checkDetailedPermissions(session, pathname)
}
```

### Dynamic Navigation
```typescript
// src/lib/navigation/role-config.ts
export const navigationConfig = {
  super_admin: {
    main: [
      { label: 'Dashboard', href: '/super-admin', icon: LayoutDashboard },
      { label: 'Subscriptions', href: '/super-admin/subscriptions', icon: CreditCard },
      { label: 'Salons', href: '/super-admin/salons', icon: Building },
      { label: 'Analytics', href: '/super-admin/analytics', icon: TrendingUp },
      { label: 'System', href: '/super-admin/monitoring', icon: Monitor },
    ],
    settings: [
      { label: 'Platform Settings', href: '/super-admin/settings' },
      { label: 'Feature Flags', href: '/super-admin/settings/features' },
      { label: 'API Configuration', href: '/super-admin/settings/api' },
    ]
  },
  salon_owner: {
    main: [
      { label: 'Dashboard', href: '/salon-owner', icon: LayoutDashboard },
      { label: 'Appointments', href: '/salon-owner/appointments', icon: Calendar },
      { label: 'Staff', href: '/salon-owner/staff', icon: Users },
      { label: 'Services', href: '/salon-owner/services', icon: Scissors },
      { label: 'Analytics', href: '/salon-owner/analytics', icon: BarChart },
    ],
    settings: [
      { label: 'Salon Settings', href: '/salon-owner/settings' },
      { label: 'Subscription', href: '/salon-owner/subscription' },
      { label: 'Integrations', href: '/salon-owner/settings/integrations' },
    ]
  },
  // ... continue for all roles
}
```

## Role-Based Data Access Layer

### Repository Pattern per Role
```typescript
// src/lib/data-access/repositories/
export class RoleBasedRepository {
  constructor(private role: UserRole, private userId: string) {}
  
  async getData<T>(table: string, filters?: any): Promise<T[]> {
    const supabase = await createClient()
    let query = supabase.from(table).select('*')
    
    // Apply role-based filters
    switch(this.role) {
      case 'super_admin':
        // No filters - access everything
        break
        
      case 'salon_owner':
        // Filter by salon ownership
        query = query.eq('salon_id', await this.getUserSalonId())
        break
        
      case 'location_manager':
        // Filter by assigned locations
        query = query.in('location_id', await this.getAssignedLocations())
        break
        
      case 'staff':
        // Filter by staff member
        query = query.eq('staff_id', this.userId)
        break
        
      case 'customer':
        // Filter by customer
        query = query.eq('customer_id', this.userId)
        break
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }
}
```

## Implementation Checklist per Role

### Super Admin Implementation Status
- [ ] Platform dashboard with MRR/ARR metrics
- [ ] Subscription management system
- [ ] Salon impersonation feature
- [ ] System monitoring dashboard
- [ ] Financial reporting
- [ ] User management across platform
- [ ] Feature flag management
- [ ] API key management
- [ ] Platform-wide analytics
- [ ] Compliance & audit tools

### Salon Owner Implementation Status
- [ ] Business dashboard
- [ ] Multi-location management
- [ ] Staff management system
- [ ] Service catalog editor
- [ ] Appointment calendar
- [ ] Customer database
- [ ] Marketing campaign tools
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Subscription & billing

### Location Manager Implementation Status
- [ ] Location dashboard
- [ ] Daily operations checklist
- [ ] Staff scheduling board
- [ ] Appointment management
- [ ] Walk-in handling
- [ ] Customer check-in system
- [ ] Incident reporting
- [ ] Location reports
- [ ] Inventory tracking
- [ ] Task management

### Staff Implementation Status
- [ ] Personal dashboard
- [ ] Appointment tracker
- [ ] Schedule management
- [ ] Earnings calculator
- [ ] Performance metrics
- [ ] Customer notes system
- [ ] Time-off requests
- [ ] Professional portfolio
- [ ] Commission tracking
- [ ] Goal tracking

### Customer Implementation Status
- [ ] Booking wizard
- [ ] Salon discovery
- [ ] Appointment management
- [ ] Favorites system
- [ ] Loyalty program
- [ ] Review system
- [ ] Digital wallet
- [ ] Profile preferences
- [ ] Notification center
- [ ] Quick rebooking

## Security & Permission Matrix

```typescript
// src/lib/auth/permission-matrix.ts
export const permissionMatrix = {
  // Resource: [roles that can access]
  'platform.financials': ['super_admin'],
  'platform.subscriptions': ['super_admin'],
  'salon.financials': ['super_admin', 'salon_owner'],
  'salon.settings': ['super_admin', 'salon_owner'],
  'location.operations': ['super_admin', 'salon_owner', 'location_manager'],
  'staff.schedule': ['super_admin', 'salon_owner', 'location_manager', 'staff'],
  'customer.profile': ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'],
  'booking.create': ['location_manager', 'staff', 'customer'],
  'booking.modify': ['super_admin', 'salon_owner', 'location_manager', 'staff', 'customer'],
  // ... complete matrix for all resources
}
```

## Testing Requirements per Role

### Role-Based Test Scenarios
```typescript
// tests/roles/
describe('Role-Based Access Control', () => {
  describe('Super Admin', () => {
    it('should access all platform features', async () => {})
    it('should impersonate any user', async () => {})
    it('should manage subscriptions', async () => {})
  })
  
  describe('Salon Owner', () => {
    it('should manage only owned salons', async () => {})
    it('should not access other salon data', async () => {})
    it('should upgrade subscription', async () => {})
  })
  
  describe('Location Manager', () => {
    it('should manage assigned location only', async () => {})
    it('should not modify prices', async () => {})
    it('should handle daily operations', async () => {})
  })
  
  describe('Staff', () => {
    it('should access own schedule only', async () => {})
    it('should not view financial data', async () => {})
    it('should manage own availability', async () => {})
  })
  
  describe('Customer', () => {
    it('should book appointments', async () => {})
    it('should not access business data', async () => {})
    it('should manage own profile', async () => {})
  })
})
```

## Success Metrics per Role

### Platform Success (Super Admin View)
- **MRR Growth**: 20% month-over-month
- **Churn Rate**: <5% monthly
- **Platform Uptime**: 99.9% SLA
- **Active Salons**: 80% monthly active
- **Feature Adoption**: 60% using advanced features

### Business Success (Salon Owner View)
- **Booking Rate**: 75% time utilization
- **Customer Retention**: 40% repeat monthly
- **Revenue per Customer**: $150 average ticket
- **Staff Utilization**: 80% productive time
- **Marketing ROI**: 3:1 campaign return

### Operational Success (Location Manager View)
- **Daily Completion**: 95% checklist completion
- **Schedule Efficiency**: <5% gaps
- **Customer Satisfaction**: 4.5+ rating
- **Incident Resolution**: <2 hours average
- **Staff Attendance**: 95% on-time

### Individual Success (Staff View)
- **Booking Fill Rate**: 85% schedule filled
- **Customer Rating**: 4.5+ average
- **Repeat Clients**: 50% rebooking rate
- **Commission Earned**: Track against goals
- **Skill Development**: 2+ certifications yearly

### User Success (Customer View)
- **Booking Success**: 95% first-try booking
- **Appointment Completion**: 90% show rate
- **Satisfaction Score**: 4.5+ average review
- **Loyalty Engagement**: 30% active in program
- **Referral Rate**: 20% refer friends

## Remember: Every Role is Critical

Each role represents a different stakeholder in your platform's success. Missing features for any role = reduced platform value.

**"A platform is only as strong as its weakest user experience."** - Platform Excellence Principle