# Actor-Centric Architecture Documentation

## Overview

This project uses an **Actor-Centric Architecture** where all business logic is organized by user type (actor) rather than by technical concerns. Each actor module contains complete feature domains specific to that user's responsibilities and capabilities.

## Architecture Principles

### 1. Actor-First Organization
- Features are grouped by **who uses them** rather than **what they do**
- Each actor has complete ownership of their domain
- Reduces coupling between user types while maximizing cohesion within actor domains

### 2. Core Module Pattern
```
core/
├── [actor]/           # Actor-specific business logic
│   ├── [subdomain]/   # Feature subdomains within actor
│   │   ├── components/    # UI components
│   │   ├── actions/      # Server Actions
│   │   ├── dal/          # Data Access Layer
│   │   ├── hooks/        # Custom React hooks
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Public API exports
│   └── index.ts       # Actor-level exports
└── index.ts           # Core-level exports
```

### 3. Ultra-Thin Pages
Pages in `/app` are routing-only and contain minimal logic:
```typescript
// app/(actor)/actor/feature/page.tsx
import { FeatureComponent } from '@/core/actor/feature';

export default function FeaturePage() {
  return <FeatureComponent />;
}
```

## Actor Modules

### 🏢 Platform (`core/platform/`)
**Purpose**: Platform administration and system-level management
**Users**: Platform administrators
**Responsibilities**:
- User management across all salons
- System health monitoring and analytics
- Audit logging and compliance
- Platform-wide settings and configuration
- Administrative tools and reports

**Key Subdomains**:
- `admin/` - Administrative functionality
- `analytics/` - Platform-wide analytics
- `audit-logs/` - Compliance and audit trails
- `monitoring/` - System health and performance
- `settings/` - Platform configuration

### 💼 Salon (`core/salon/`)
**Purpose**: Business operations and management
**Users**: Salon owners and managers
**Responsibilities**:
- Staff management and scheduling
- Service catalog and pricing
- Customer relationship management
- Billing and revenue tracking
- Inventory and resource management
- Marketing campaigns and promotions

**Key Subdomains**:
- `dashboard/` - Overview and key metrics
- `staff/` - Employee management
- `services/` - Service catalog management
- `appointments/` - Booking management
- `customers/` - Customer relationships
- `billing/` - Revenue and subscriptions
- `inventory/` - Stock and resource tracking
- `marketing/` - Campaigns and promotions
- `settings/` - Salon configuration

### 👥 Staff (`core/staff/`)
**Purpose**: Employee workspace and schedule management
**Users**: Salon staff members
**Responsibilities**:
- Personal schedule and availability
- Appointment management from staff perspective
- Client relationships and service history
- Earnings tracking (tips, commissions)
- Professional profile and portfolio
- Time-off requests and management

**Key Subdomains**:
- `portal/` - Staff dashboard
- `schedule/` - Personal scheduling
- `appointments/` - Staff view of appointments
- `customers/` - Client relationships
- `earnings/` - Financial tracking
- `profile/` - Professional profile

### 🛍️ Customer (`core/customer/`)
**Purpose**: Customer-facing booking and account management
**Users**: Salon customers
**Responsibilities**:
- Service discovery and booking
- Appointment history and management
- Favorite salons, services, and staff
- Loyalty program participation
- Reviews and feedback
- Personal preferences and notifications

**Key Subdomains**:
- `booking/` - Service booking system
- `profile/` - Account management
- `appointments/` - Booking history
- `favorites/` - Saved preferences
- `loyalty/` - Rewards program
- `reviews/` - Feedback system
- `notifications/` - Communication preferences

### 🔐 Auth (`core/auth/`)
**Purpose**: Authentication and authorization
**Users**: All system users
**Responsibilities**:
- User authentication (login, registration)
- Session management and security
- Role-based access control
- Password management and recovery
- Security auditing and compliance

**Key Subdomains**:
- `components/` - Auth UI components
- `actions/` - Authentication server actions
- `types/` - Auth-related types

### 🌐 Public (`core/public/`)
**Purpose**: Public-facing marketing and information
**Users**: Anonymous visitors
**Responsibilities**:
- Landing pages and marketing content
- Service information and pricing
- Contact and about pages
- Public API for non-authenticated features

**Key Subdomains**:
- `components/` - Public UI components
- `dal/` - Public data queries

### 🔧 Shared (`core/shared/`)
**Purpose**: Cross-cutting concerns and utilities
**Users**: All actors (internal use)
**Responsibilities**:
- Common UI patterns and components
- Database utilities and types
- Error handling and validation
- Performance monitoring
- Infrastructure services

**Key Subdomains**:
- `components/` - Reusable UI components
- `database/` - Database utilities
- `infrastructure/` - System services
- `ui/` - UI utilities and patterns
- `utils/` - Helper functions

## Module Responsibility Matrix

| Actor | Primary Concern | Data Ownership | UI Patterns | Business Logic |
|-------|----------------|----------------|-------------|----------------|
| **Platform** | System Administration | All users/salons | Admin dashboards | Platform policies |
| **Salon** | Business Operations | Salon data | Management interfaces | Business rules |
| **Staff** | Work Management | Personal schedules | Task-oriented UI | Work processes |
| **Customer** | Service Consumption | Personal data | Consumer-friendly | Booking flows |
| **Auth** | Security | User credentials | Login forms | Access control |
| **Public** | Marketing | Public content | Landing pages | Lead generation |
| **Shared** | Infrastructure | Common utilities | Design system | Cross-cutting |

## Import Path Guidelines

### Standard Import Patterns
```typescript
// Actor-level imports (preferred)
import { BookingForm } from '@/core/customer/booking';
import { StaffSchedule } from '@/core/staff/schedule';
import { AdminDashboard } from '@/core/platform/admin';

// Subdomain-specific imports
import { AppointmentCalendar } from '@/core/salon/appointments/components';
import { StaffList } from '@/core/salon/staff/components';

// Shared utilities
import { Button } from '@/components/ui/button';
import { useAuth } from '@/core/shared/hooks';
import { formatCurrency } from '@/core/shared/utils';

// Types
import type { SalonSettings } from '@/core/salon/settings/types';
import type { CustomerProfile } from '@/core/customer/profile/types';
```

### Anti-Patterns (Avoid)
```typescript
// ❌ Direct file imports (bypasses public API)
import { BookingForm } from '@/core/customer/booking/components/booking-form';

// ❌ Cross-actor business logic dependencies
import { SalonDashboard } from '@/core/salon/dashboard';
// Used in: core/customer/... (customers shouldn't import salon logic)

// ❌ Shared importing from actors
import { CustomerData } from '@/core/customer/profile';
// Used in: core/shared/... (shared should be dependency-free)
```

## Export Pattern Standards

### 1. Barrel Exports (index.ts)
Every module and subdomain must have an `index.ts` file that serves as the public API:

```typescript
// core/[actor]/[subdomain]/index.ts
export * from './components';
export * from './actions';
export * from './hooks';
export * from './types';
// Note: DAL is typically not exported (server-side only)
```

### 2. Actor-Level Exports
```typescript
// core/[actor]/index.ts
/**
 * [Actor] Module - [Description]
 * For [user type] [primary responsibility]
 */

// [Subdomain description]
export * from './subdomain1';
export * from './subdomain2';

// Types (if consolidated)
export type {
  PrimaryType,
  SecondaryType,
} from './types';
```

### 3. Core-Level Exports
```typescript
// core/index.ts
/**
 * Core Module Exports - Actor-Centric Architecture
 * All business logic organized by actor/user type
 */

// [Actor description]
export * from './actor1';
export * from './actor2';
```

## Public API Design Principles

### 1. Encapsulation
- **Public**: Components, hooks, actions, types
- **Private**: Internal utilities, implementation details
- **Server-only**: DAL functions (not exported in index.ts)

### 2. Consistency
- All modules follow the same export pattern
- Naming conventions are uniform across actors
- Documentation follows the same format

### 3. Developer Experience
```typescript
// Good: Clear, predictable imports
import { BookingForm, useBookingData } from '@/core/customer/booking';

// Bad: Unclear, inconsistent imports
import { BookingComponent } from '@/core/customer/booking/components/forms/booking-form';
import { booking_data_hook } from '@/core/customer/booking/hooks/useBookingData';
```

## Usage Patterns and Examples

### 1. Creating a New Feature
```bash
# 1. Identify the actor
# 2. Create subdomain structure
mkdir -p core/[actor]/[feature]/{components,actions,hooks,types,dal}

# 3. Create index.ts files
touch core/[actor]/[feature]/index.ts
touch core/[actor]/[feature]/components/index.ts
touch core/[actor]/[feature]/actions/index.ts
# ... etc

# 4. Export from actor-level index.ts
echo "export * from './[feature]';" >> core/[actor]/index.ts
```

### 2. Cross-Actor Communication
```typescript
// ✅ Through shared utilities
import { createNotification } from '@/core/shared/notifications';

// ✅ Through props/context
<StaffSchedule onAppointmentSelect={handleAppointmentSelect} />

// ❌ Direct actor imports
import { SalonSettings } from '@/core/salon/settings'; // in customer module
```

### 3. Data Flow Patterns
```typescript
// Server Action → DAL → Database
// core/[actor]/[feature]/actions/feature-actions.ts
'use server';
import { getFeatureData } from '../dal/feature-queries';

export async function loadFeatureData() {
  return await getFeatureData();
}

// Component → Hook → Action
// core/[actor]/[feature]/components/feature-component.tsx
import { useFeatureData } from '../hooks/use-feature-data';

export function FeatureComponent() {
  const { data, loading } = useFeatureData();
  // ...
}
```

## Quality Metrics

### Export Completeness
- ✅ **100%** of actor modules have index.ts files
- ⚠️  **65%** of subdomains have complete barrel exports
- ❌ **35%** of directories missing index.ts files

### Documentation Quality
- ✅ **Excellent**: staff, shared modules (detailed docs + examples)
- ✅ **Good**: platform, salon modules (clear descriptions)
- ⚠️  **Fair**: customer, public modules (basic descriptions)
- ❌ **Poor**: auth module (minimal documentation)

### API Design Consistency
- ✅ **Consistent**: Actor-level export patterns
- ⚠️  **Mixed**: Subdomain export patterns (some use barrel, some named)
- ❌ **Inconsistent**: Type export strategies vary by module

## Recommendations

### 1. Complete Missing Barrel Exports
Priority directories missing index.ts files:
- `core/auth/actions/` (should be exported from auth module)
- Component directories across multiple actors
- Hook and DAL directories in various subdomains

### 2. Standardize Export Patterns
- Establish consistent barrel export strategy
- Document when to use `export *` vs named exports
- Create templates for index.ts files

### 3. Improve Documentation
- Add detailed JSDoc comments to all actor modules
- Include usage examples in module documentation
- Document cross-actor communication patterns

### 4. API Design Improvements
- Audit public vs private API boundaries
- Ensure no business logic leaks between actors
- Standardize type export patterns

## Migration Guide

### From Technical to Actor-Centric

1. **Identify Actor Ownership**
   ```bash
   # Old: src/components/appointments/
   # New: core/salon/appointments/components/ (salon management view)
   #  OR: core/staff/appointments/components/ (staff personal view)
   #  OR: core/customer/appointments/components/ (customer booking view)
   ```

2. **Co-locate Related Features**
   ```bash
   # Old: Scattered across technical directories
   src/components/staff-schedule.tsx
   src/hooks/use-staff-schedule.ts
   src/api/staff-schedule.ts

   # New: Co-located in actor domain
   core/staff/schedule/components/staff-schedule.tsx
   core/staff/schedule/hooks/use-staff-schedule.ts
   core/staff/schedule/actions/schedule-actions.ts
   ```

3. **Update Import Paths**
   ```typescript
   // Old
   import { StaffSchedule } from '@/components/staff-schedule';
   import { useStaffSchedule } from '@/hooks/use-staff-schedule';

   // New
   import { StaffSchedule, useStaffSchedule } from '@/core/staff/schedule';
   ```

## Team Ownership Mapping

| Actor Module | Primary Team | Secondary Teams |
|-------------|-------------|-----------------|
| **platform** | DevOps/Platform | Backend, Security |
| **salon** | Backend/Business | Frontend, Product |
| **staff** | Frontend/UX | Backend, Product |
| **customer** | Frontend/UX | Backend, Marketing |
| **auth** | Security/Backend | Frontend, DevOps |
| **public** | Marketing/Frontend | Design, SEO |
| **shared** | Platform/Backend | All teams |

---

*This architecture supports scalable development by organizing code around user intent rather than technical implementation, making it easier for teams to understand, maintain, and extend the system.*