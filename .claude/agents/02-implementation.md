# Master Implementation & Architecture Agent

## Executive Summary
This agent orchestrates the complete implementation of a B2B SaaS platform with enterprise-grade architecture, ensuring 100% database coverage, role-based features, and production-ready code that generates revenue from day one.

## Core Mandate: Revenue-First Implementation

### The Business Model
```
PLATFORM OWNER (You) 
    ↓ Subscription Revenue ($299-999/month)
SALON OWNERS (B2B Customers)
    ↓ Service Delivery (Direct Payment)
END CUSTOMERS (Users)
```

## PHASE 1: CRITICAL IMPLEMENTATION COVERAGE

### Database-Driven Development Matrix
Every table in `database.types.ts` MUST have these 5 implementations:

| Database Table | Pages | Components | Actions | DAL | API | Priority |
|----------------|-------|------------|---------|-----|-----|----------|
| **REVENUE CRITICAL** |
| platform_subscriptions | ❌ | ❌ | ❌ | ❌ | ❌ | **P0** |
| platform_plans | ❌ | ❌ | ❌ | ❌ | ❌ | **P0** |
| payment_methods | ❌ | ❌ | ❌ | ❌ | ❌ | **P0** |
| salons | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | **P0** |
| **OPERATIONAL CRITICAL** |
| appointments | ✅ | ✅ | ✅ | ✅ | ❌ | **P1** |
| bookings | ✅ | ⚠️ | ✅ | ✅ | ❌ | **P1** |
| staff | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | **P1** |
| services | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | **P1** |
| locations | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | **P1** |
| **ENGAGEMENT CRITICAL** |
| customers | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | **P2** |
| reviews | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ | **P2** |
| loyalty_points | ❌ | ❌ | ❌ | ❌ | ❌ | **P2** |
| campaigns | ❌ | ❌ | ❌ | ❌ | ❌ | **P2** |
| analytics_patterns | ✅ | ⚠️ | ✅ | ✅ | ❌ | **P2** |

Legend: ✅ Complete | ⚠️ Partial | ❌ Missing

### Missing Implementation Scanner
```typescript
// scripts/scan-missing-implementations.ts
import { Database } from '@/types/database.types'
import * as fs from 'fs'
import * as path from 'path'

type TableName = keyof Database['public']['Tables']
type Role = 'super-admin' | 'salon-owner' | 'location-manager' | 'staff-member' | 'customer'

interface ImplementationReport {
  table: TableName
  role: Role
  missing: {
    pages: string[]
    components: string[]
    actions: string[]
    dal: string[]
    api: string[]
  }
  coverage: number // percentage
}

class ImplementationScanner {
  async scanComplete(): Promise<ImplementationReport[]> {
    const tables = this.getDatabaseTables()
    const roles = this.getSystemRoles()
    const report: ImplementationReport[] = []
    
    for (const table of tables) {
      for (const role of roles) {
        const coverage = await this.checkImplementation(table, role)
        if (coverage.coverage < 100) {
          report.push(coverage)
        }
      }
    }
    
    return report.sort((a, b) => a.coverage - b.coverage)
  }
  
  private async checkImplementation(
    table: TableName, 
    role: Role
  ): Promise<ImplementationReport> {
    const missing = {
      pages: this.getMissingPages(table, role),
      components: this.getMissingComponents(table, role),
      actions: this.getMissingActions(table),
      dal: this.getMissingDAL(table),
      api: this.getMissingAPI(table)
    }
    
    const total = Object.values(missing).flat().length
    const coverage = total === 0 ? 100 : 0
    
    return { table, role, missing, coverage }
  }
  
  private getMissingPages(table: TableName, role: Role): string[] {
    const requiredPages = [
      `src/app/${role}/${table}/page.tsx`,
      `src/app/${role}/${table}/[id]/page.tsx`,
      `src/app/${role}/${table}/new/page.tsx`
    ]
    
    return requiredPages.filter(page => !fs.existsSync(page))
  }
}
```

## PHASE 2: ROLE-BASED IMPLEMENTATION ARCHITECTURE

### Complete Role Implementation Requirements

#### 1. SUPER ADMIN - Platform Owner (God Mode)
```typescript
// Required Implementations
const superAdminRequirements = {
  dashboards: [
    '/super-admin/dashboard',           // Platform KPIs
    '/super-admin/revenue',             // MRR, ARR, Churn
    '/super-admin/subscriptions',       // All subscriptions
    '/super-admin/system-health'        // Monitoring
  ],
  
  management: [
    '/super-admin/salons',              // All salons
    '/super-admin/users',               // All users
    '/super-admin/billing',             // Stripe management
    '/super-admin/features'             // Feature flags
  ],
  
  analytics: [
    '/super-admin/analytics/growth',    // Growth metrics
    '/super-admin/analytics/usage',     // Feature usage
    '/super-admin/analytics/retention'  // Retention analysis
  ],
  
  tools: [
    '/super-admin/impersonate',        // User impersonation
    '/super-admin/migrations',         // Data migrations
    '/super-admin/exports',            // Data exports
    '/super-admin/audit-logs'         // Compliance logs
  ]
}
```

#### 2. SALON OWNER - Paying Customer
```typescript
// Required Implementations  
const salonOwnerRequirements = {
  business: [
    '/salon-owner/dashboard',          // Business overview
    '/salon-owner/locations',          // Multi-location
    '/salon-owner/subscription',       // Billing & plan
    '/salon-owner/settings'           // Business settings
  ],
  
  operations: [
    '/salon-owner/appointments',       // Booking calendar
    '/salon-owner/staff',              // Staff management
    '/salon-owner/services',           // Service catalog
    '/salon-owner/inventory'          // Product tracking
  ],
  
  growth: [
    '/salon-owner/marketing',          // Campaigns
    '/salon-owner/customers',          // CRM
    '/salon-owner/analytics',          // Insights
    '/salon-owner/reviews'            // Reputation
  ]
}
```

#### 3. LOCATION MANAGER - Operations Lead
```typescript
// Required Implementations
const locationManagerRequirements = {
  daily: [
    '/location-manager/dashboard',     // Daily overview
    '/location-manager/schedule',      // Staff schedule
    '/location-manager/appointments',  // Today's bookings
    '/location-manager/walk-ins'      // Walk-in handling
  ],
  
  management: [
    '/location-manager/staff',         // Staff coordination
    '/location-manager/inventory',     // Stock levels
    '/location-manager/reports',       // Daily reports
    '/location-manager/incidents'     // Issue tracking
  ]
}
```

#### 4. STAFF MEMBER - Service Provider
```typescript
// Required Implementations
const staffRequirements = {
  workspace: [
    '/staff-member/dashboard',         // Personal dashboard
    '/staff-member/appointments',      // My bookings
    '/staff-member/schedule',          // My schedule
    '/staff-member/earnings'          // Commission tracking
  ],
  
  professional: [
    '/staff-member/customers',         // Client notes
    '/staff-member/performance',       // Metrics
    '/staff-member/portfolio',         // Work samples
    '/staff-member/certifications'    // Credentials
  ]
}
```

#### 5. CUSTOMER - End User
```typescript
// Required Implementations
const customerRequirements = {
  booking: [
    '/customer/book',                  // Booking wizard
    '/customer/appointments',          // My appointments
    '/customer/favorites',             // Quick booking
    '/customer/salons'                // Discovery
  ],
  
  engagement: [
    '/customer/loyalty',               // Points & rewards
    '/customer/reviews',               // Feedback
    '/customer/profile',               // Preferences
    '/customer/wallet'                // Gift cards
  ]
}
```

## PHASE 3: IMPLEMENTATION TEMPLATES

### Universal Page Template
```typescript
// Template for ALL pages - src/app/[role]/[feature]/page.tsx
import { Metadata } from 'next'
import { validateRole, validatePermission } from '@/lib/auth/guards'
import { get[Feature]Data } from '@/lib/data-access/[feature]'
import { [Feature]Dashboard } from '@/components/[role]/[feature]'
import { Database } from '@/types/database.types'

// Type safety from database
type [Feature]Data = Database['public']['Tables']['[table]']['Row']

// Metadata for SEO
export const metadata: Metadata = {
  title: '[Feature] | [Role] Dashboard',
  description: 'Manage [feature] for your [business]'
}

// Server Component - Data Fetching
export default async function [Feature]Page() {
  // Authentication & Authorization
  const { user, role } = await validateRole(['[role]'])
  await validatePermission(user, '[feature].view')
  
  // Data Access Layer
  const data = await get[Feature]Data(user.id, role)
  
  // Render Role-Specific UI
  return <[Feature]Dashboard data={data} role={role} />
}
```

### Universal Component Template
```typescript
// Template for ALL components - src/components/[role]/[feature]/index.tsx
'use client'

import { Database } from '@/types/database.types'
import { useRole } from '@/hooks/use-role'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'

type [Feature]Data = Database['public']['Tables']['[table]']['Row']

interface [Feature]DashboardProps {
  data: [Feature]Data[]
  role: UserRole
}

export function [Feature]Dashboard({ data, role }: [Feature]DashboardProps) {
  const permissions = useRole(role)
  
  return (
    <div className="container mx-auto py-6">
      <DashboardHeader title="[Feature]" role={role} />
      
      {permissions.canView && (
        <DataTable 
          data={data}
          columns={getColumnsForRole(role)}
          actions={getActionsForRole(role, permissions)}
        />
      )}
      
      {permissions.canCreate && (
        <CreateButton entity="[feature]" />
      )}
    </div>
  )
}
```

### Universal Server Action Template
```typescript
// Template for ALL actions - src/app/_actions/[feature].ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { validateRole, validatePermission } from '@/lib/auth/guards'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Type safety
type [Feature] = Database['public']['Tables']['[table]']['Row']
type [Feature]Insert = Database['public']['Tables']['[table]']['Insert']
type [Feature]Update = Database['public']['Tables']['[table]']['Update']

// Validation schemas
const create[Feature]Schema = z.object({
  // Define based on table structure
})

// CREATE
export async function create[Feature](data: [Feature]Insert) {
  const { user, role } = await validateRole()
  await validatePermission(user, '[feature].create')
  
  // Validate input
  const validated = create[Feature]Schema.parse(data)
  
  // Apply role-based data scoping
  const scoped = applyScopeForRole(validated, role, user)
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('[table]')
    .insert(scoped)
  
  if (error) throw new ActionError(error.message)
  
  // Revalidate all role-specific paths
  revalidatePathsForRoles(['[role]'], '[feature]')
  
  return { success: true }
}

// READ
export async function get[Feature](id: string) {
  const { user, role } = await validateRole()
  await validatePermission(user, '[feature].read')
  
  const supabase = await createClient()
  
  // Apply RLS based on role
  let query = supabase.from('[table]').select('*')
  query = applyRLSForRole(query, role, user)
  
  const { data, error } = await query.eq('id', id).single()
  
  if (error) throw new ActionError(error.message)
  return data
}

// UPDATE
export async function update[Feature](id: string, data: [Feature]Update) {
  const { user, role } = await validateRole()
  await validatePermission(user, '[feature].update')
  
  // Check ownership/permission
  await validateOwnership(id, user, role)
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('[table]')
    .update(data)
    .eq('id', id)
  
  if (error) throw new ActionError(error.message)
  
  revalidatePathsForRoles(getAffectedRoles('[feature]'), '[feature]')
  
  return { success: true }
}

// DELETE
export async function delete[Feature](id: string) {
  const { user, role } = await validateRole()
  await validatePermission(user, '[feature].delete')
  
  await validateOwnership(id, user, role)
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('[table]')
    .delete()
    .eq('id', id)
  
  if (error) throw new ActionError(error.message)
  
  revalidatePathsForRoles(getAffectedRoles('[feature]'), '[feature]')
  
  return { success: true }
}
```

### Universal Data Access Layer Template
```typescript
// Template for ALL DAL - src/lib/data-access/[feature]/index.ts
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { cache } from 'react'
import { UserRole } from '@/types/auth'

type [Feature] = Database['public']['Tables']['[table]']['Row']

// Role-based data fetching
export const get[Feature]ForRole = cache(async (
  userId: string,
  role: UserRole,
  filters?: any
) => {
  const supabase = await createClient()
  
  let query = supabase
    .from('[table]')
    .select(`
      *,
      related_table:related_table_id(*)
    `)
  
  // Apply role-based filtering
  switch (role) {
    case 'super-admin':
      // No filters - access everything
      break
      
    case 'salon-owner':
      query = query.eq('salon_id', userId)
      break
      
    case 'location-manager':
      query = query.eq('location_id', await getUserLocationId(userId))
      break
      
    case 'staff-member':
      query = query.eq('staff_id', userId)
      break
      
    case 'customer':
      query = query.eq('customer_id', userId)
      break
  }
  
  // Apply additional filters
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  const { data, error } = await query
    .order('created_at', { ascending: false })
  
  if (error) throw new DataAccessError(error.message)
  return data
})

// Aggregations for analytics
export const get[Feature]Analytics = cache(async (
  userId: string,
  role: UserRole,
  dateRange: { start: Date; end: Date }
) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .rpc('calculate_[feature]_metrics', {
      user_id: userId,
      user_role: role,
      start_date: dateRange.start,
      end_date: dateRange.end
    })
  
  if (error) throw new DataAccessError(error.message)
  return data
})
```

## PHASE 4: DOMAIN-DRIVEN ARCHITECTURE

### Domain Structure
```
src/
├── domains/                    # Business domains
│   ├── subscription/          # Revenue engine
│   │   ├── entities/         # Business objects
│   │   ├── use-cases/       # Business operations
│   │   ├── repositories/    # Data interfaces
│   │   └── services/        # Domain services
│   │
│   ├── salon-management/     # Core business
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── repositories/
│   │   └── services/
│   │
│   ├── booking/              # Appointment system
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── repositories/
│   │   └── services/
│   │
│   └── analytics/            # Intelligence
│       ├── entities/
│       ├── use-cases/
│       ├── repositories/
│       └── services/
```

### Repository Pattern Implementation
```typescript
// Base Repository
interface IRepository<T, TInsert, TUpdate> {
  // Queries
  findAll(filters?: Partial<T>): Promise<T[]>
  findById(id: string): Promise<T | null>
  findOne(filters: Partial<T>): Promise<T | null>
  exists(filters: Partial<T>): Promise<boolean>
  count(filters?: Partial<T>): Promise<number>
  
  // Mutations
  create(data: TInsert): Promise<T>
  createMany(data: TInsert[]): Promise<T[]>
  update(id: string, data: TUpdate): Promise<T>
  updateMany(filters: Partial<T>, data: TUpdate): Promise<T[]>
  delete(id: string): Promise<void>
  deleteMany(filters: Partial<T>): Promise<number>
  
  // Transactions
  transaction<R>(callback: (repo: this) => Promise<R>): Promise<R>
}

// Domain-specific repository
class SalonRepository implements ISalonRepository {
  constructor(private db: SupabaseClient) {}
  
  async findByOwner(ownerId: string): Promise<Salon[]> {
    const { data, error } = await this.db
      .from('salons')
      .select('*, subscription:platform_subscriptions(*)')
      .eq('owner_id', ownerId)
    
    if (error) throw new RepositoryError(error)
    return data.map(this.toDomain)
  }
  
  async findWithActiveSubscription(): Promise<Salon[]> {
    const { data, error } = await this.db
      .from('salons')
      .select('*, subscription:platform_subscriptions(*)')
      .eq('subscription.status', 'active')
    
    if (error) throw new RepositoryError(error)
    return data.map(this.toDomain)
  }
  
  private toDomain(raw: any): Salon {
    return new Salon({
      id: raw.id,
      name: raw.name,
      subscription: raw.subscription
      // ... map all fields
    })
  }
}
```

### Use Case Pattern Implementation
```typescript
// Use Case Interface
interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>
}

// Business Use Case
class CreateSubscriptionUseCase implements IUseCase<
  CreateSubscriptionInput,
  Subscription
> {
  constructor(
    private salonRepo: ISalonRepository,
    private subscriptionRepo: ISubscriptionRepository,
    private stripeService: IStripeService,
    private emailService: IEmailService,
    private eventBus: IEventBus
  ) {}
  
  async execute(input: CreateSubscriptionInput): Promise<Subscription> {
    // 1. Business validation
    const salon = await this.salonRepo.findById(input.salonId)
    if (!salon) {
      throw new SalonNotFoundError(input.salonId)
    }
    
    if (salon.hasActiveSubscription()) {
      throw new SubscriptionAlreadyActiveError()
    }
    
    // 2. Process payment
    const payment = await this.stripeService.createSubscription({
      customerId: salon.stripeCustomerId,
      priceId: input.planId,
      trialDays: input.trialDays
    })
    
    // 3. Create subscription
    const subscription = new Subscription({
      salonId: salon.id,
      planId: input.planId,
      stripeSubscriptionId: payment.id,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: payment.currentPeriodEnd
    })
    
    // 4. Persist
    const saved = await this.subscriptionRepo.create(subscription)
    
    // 5. Side effects
    await this.emailService.sendSubscriptionWelcome(salon, subscription)
    await this.eventBus.publish(new SubscriptionCreatedEvent(subscription))
    
    return saved
  }
}
```

## PHASE 5: AUTOMATED GENERATION & VERIFICATION

### Missing Implementation Generator
```typescript
// scripts/generate-missing-implementations.ts
import { ImplementationScanner } from './scanner'
import { TemplateGenerator } from './generator'

async function generateMissingImplementations() {
  const scanner = new ImplementationScanner()
  const generator = new TemplateGenerator()
  
  // 1. Scan for missing implementations
  const missing = await scanner.scanComplete()
  
  console.log(`Found ${missing.length} missing implementations`)
  
  // 2. Generate missing files
  for (const item of missing) {
    // Generate pages
    for (const page of item.missing.pages) {
      await generator.generatePage(page, item.table, item.role)
      console.log(`✅ Generated: ${page}`)
    }
    
    // Generate components
    for (const component of item.missing.components) {
      await generator.generateComponent(component, item.table, item.role)
      console.log(`✅ Generated: ${component}`)
    }
    
    // Generate server actions
    for (const action of item.missing.actions) {
      await generator.generateAction(action, item.table)
      console.log(`✅ Generated: ${action}`)
    }
    
    // Generate DAL
    for (const dal of item.missing.dal) {
      await generator.generateDAL(dal, item.table)
      console.log(`✅ Generated: ${dal}`)
    }
  }
  
  // 3. Update imports and exports
  await generator.updateBarrelExports()
  
  // 4. Run type checking
  await runTypeCheck()
  
  console.log('✅ All implementations generated successfully!')
}
```

### Continuous Verification
```yaml
# .github/workflows/implementation-coverage.yml
name: Implementation Coverage Check

on: [push, pull_request]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Check implementation coverage
        run: |
          npm run scan:implementations
          coverage=$(cat coverage.json | jq '.percentage')
          
          if [ "$coverage" -lt 100 ]; then
            echo "❌ Implementation coverage is only $coverage%"
            echo "Missing implementations:"
            cat coverage.json | jq '.missing'
            exit 1
          fi
          
          echo "✅ 100% implementation coverage achieved!"
      
      - name: Check role coverage
        run: |
          npm run scan:roles
          for role in super-admin salon-owner location-manager staff-member customer; do
            coverage=$(cat coverage-$role.json | jq '.percentage')
            if [ "$coverage" -lt 100 ]; then
              echo "❌ $role coverage is only $coverage%"
              exit 1
            fi
          done
      
      - name: Type check
        run: npm run typecheck
      
      - name: Lint check
        run: npm run lint
```

## PHASE 6: QUALITY GATES & METRICS

### Implementation Quality Metrics
```typescript
const QUALITY_GATES = {
  // Coverage Requirements
  databaseCoverage: 100,        // Every table must be implemented
  roleCoverage: 100,            // Every role must have full features
  typeSafety: 100,              // No 'any' types
  
  // Code Quality
  duplicateCode: 3,             // Max 3% duplication
  cyclomaticComplexity: 10,     // Max complexity
  fileSize: 500,                // Max lines per file
  
  // Performance
  bundleSize: 300,              // KB for initial load
  routeSize: 50,                // KB per route
  apiResponse: 100,             // ms p95
  
  // Business Metrics
  subscriptionFlow: 100,        // % completion rate
  bookingFlow: 95,              // % success rate
  userActivation: 60,           // % within 7 days
}
```

## SUCCESS CRITERIA

### Technical Excellence
- ✅ 100% database table coverage
- ✅ 100% role implementation
- ✅ Zero TypeScript errors
- ✅ Zero ESLint errors
- ✅ All tests passing

### Business Impact
- ✅ Subscription flow complete
- ✅ All 5 roles fully functional
- ✅ Analytics tracking active
- ✅ Payment processing live
- ✅ Multi-tenant isolation working

### Code Quality
- ✅ Clean Architecture implemented
- ✅ Repository pattern used
- ✅ Use cases defined
- ✅ Type safety enforced
- ✅ Error handling complete

## COMMANDS

```bash
# Scan for missing implementations
npm run scan:implementations

# Generate missing files
npm run generate:missing

# Check role coverage
npm run check:roles

# Verify type safety
npm run typecheck

# Fix all issues
npm run fix:all

# Deploy to production
npm run deploy:production
```

## Remember: Implementation = Revenue

Every missing implementation is lost revenue. Every completed feature enables more subscriptions.

**"Ship complete features, not partial solutions."** - Implementation Excellence Principle