# Enterprise SaaS Architecture & Codebase Completeness Agent

## Executive Summary
This agent implements **Enterprise SaaS Architecture** patterns with **Database-First Development** methodology to ensure 100% implementation coverage of all database entities. Special focus on B2B SaaS subscription model where **salon owners pay the platform** (no customer-to-salon payments).

## CRITICAL PRIORITY: Database Type Coverage

### MANDATORY FIRST PHASE: Missing Implementation Detection
**ALL database tables in `database.types.ts` MUST have corresponding:**
1. **Pages** - UI for CRUD operations
2. **Components** - Reusable UI elements
3. **Server Actions** - Data mutations
4. **Data Access Layer** - Type-safe queries
5. **API Routes** - External integrations

### Database Tables Requiring Implementation
```typescript
// From database.types.ts - MUST have full implementation:
Tables: {
  analytics_patterns          // ✓ Analytics module
  analytics_predictions       // ✓ Predictions module
  appointments               // ✓ Booking system
  blocked_times              // ✓ Availability management
  bookings                   // ✓ Core booking
  campaigns                  // ✓ Marketing module
  campaign_audiences         // ✓ Targeting system
  campaign_recipients        // ✓ Recipient management
  categories                 // ✓ Service categorization
  customer_preferences       // ✓ Customer module
  customer_segments          // ✓ Segmentation
  favorites                  // ✓ Customer favorites
  gift_cards                 // ✓ Gift card system
  locations                  // ✓ Multi-location
  loyalty_points             // ✓ Loyalty program
  loyalty_transactions       // ✓ Points tracking
  marketing_segments         // ✓ Marketing segmentation
  notification_logs          // ✓ Notification history
  notification_settings      // ✓ Preferences
  payment_methods            // ✓ SaaS billing methods
  platform_plans             // ✓ SaaS subscription tiers
  platform_subscriptions     // ✓ Salon subscriptions
  reviews                    // ✓ Review system
  review_responses           // ✓ Review management
  rewards                    // ✓ Reward system
  salons                     // ✓ Core entity
  services                   // ✓ Service management
  service_categories         // ✓ Category mapping
  service_costs              // ✓ Cost tracking
  sms_opt_outs              // ✓ Compliance
  staff                      // ✓ Staff management
  staff_breaks               // ✓ Break scheduling
  staff_schedule             // ✓ Scheduling
  staff_services             // ✓ Service assignments
  staff_specialties          // ✓ Expertise tracking
  staff_time_off             // ✓ Time off management
  time_off_requests          // ✓ Request system
  users                      // ✓ Authentication
  waitlist_entries           // ✓ Waitlist system
}
```

## SaaS Architecture Pattern (B2B Platform Model)

### Revenue Flow Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    PLATFORM OWNER                        │
│                  (Your SaaS Business)                    │
└────────────────────┬───────────────────────────────────┘
                     │ Subscription Revenue
                     │ (Monthly/Annual)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    SALON OWNERS                          │
│              (Your B2B Customers)                        │
│  • Pay for platform access                               │
│  • Choose subscription tiers                             │
│  • Manage multiple locations                             │
└────────────────────┬───────────────────────────────────┘
                     │ Provides Service
                     │ (No payment through platform)
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    END CUSTOMERS                         │
│           (Salon's Customers)                           │
│  • Book appointments                                     │
│  • Pay salon directly (cash/card at salon)              │
│  • Leave reviews                                         │
└─────────────────────────────────────────────────────────┘
```

## Enterprise Domain Structure

### 1. Core Domain Boundaries
```
src/
├── domains/                     # Domain-Driven Design
│   ├── subscription/           # SaaS Subscription Management
│   │   ├── entities/
│   │   │   ├── subscription.entity.ts
│   │   │   ├── plan.entity.ts
│   │   │   └── billing-cycle.value-object.ts
│   │   ├── use-cases/
│   │   │   ├── create-subscription.use-case.ts
│   │   │   ├── upgrade-plan.use-case.ts
│   │   │   ├── cancel-subscription.use-case.ts
│   │   │   └── process-payment.use-case.ts
│   │   ├── infrastructure/
│   │   │   ├── stripe-gateway.ts
│   │   │   └── subscription-repository.ts
│   │   └── presentation/
│   │       ├── subscription-dashboard.tsx
│   │       ├── billing-settings.tsx
│   │       └── plan-selector.tsx
│   │
│   ├── salon-management/       # Salon Owner Domain
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── booking/                # Booking Domain
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   ├── analytics/              # Analytics Domain
│   │   ├── entities/
│   │   ├── use-cases/
│   │   ├── infrastructure/
│   │   └── presentation/
│   │
│   └── marketing/              # Marketing Domain
│       ├── entities/
│       ├── use-cases/
│       ├── infrastructure/
│       └── presentation/
```

### 2. Implementation Coverage Matrix

| Database Table | Page | Component | Server Action | DAL | API | Status |
|---------------|------|-----------|---------------|-----|-----|--------|
| platform_subscriptions | ❌ | ❌ | ❌ | ❌ | ❌ | **CRITICAL** |
| platform_plans | ❌ | ❌ | ❌ | ❌ | ❌ | **CRITICAL** |
| payment_methods | ❌ | ❌ | ❌ | ❌ | ❌ | **CRITICAL** |
| analytics_patterns | ✅ | ⚠️ | ✅ | ✅ | ❌ | PARTIAL |
| analytics_predictions | ✅ | ⚠️ | ✅ | ✅ | ❌ | PARTIAL |
| appointments | ✅ | ✅ | ✅ | ✅ | ❌ | COMPLETE |
| ... | ... | ... | ... | ... | ... | ... |

## Missing File Detection & Generation

### Phase 1: Automated Detection Script
```typescript
// scripts/detect-missing-implementations.ts
import { Database } from '@/types/database.types'

type TableName = keyof Database['public']['Tables']

interface ImplementationCheck {
  table: TableName
  hasPage: boolean
  hasComponent: boolean
  hasServerAction: boolean
  hasDAL: boolean
  hasAPI: boolean
  missingFiles: string[]
}

async function detectMissingImplementations(): Promise<ImplementationCheck[]> {
  const tables = Object.keys(Database.public.Tables) as TableName[]
  const checks: ImplementationCheck[] = []
  
  for (const table of tables) {
    const check: ImplementationCheck = {
      table,
      hasPage: await checkPageExists(table),
      hasComponent: await checkComponentExists(table),
      hasServerAction: await checkServerActionExists(table),
      hasDAL: await checkDALExists(table),
      hasAPI: await checkAPIExists(table),
      missingFiles: []
    }
    
    // Generate list of missing files
    if (!check.hasPage) {
      check.missingFiles.push(
        `src/app/admin/${table}/page.tsx`,
        `src/app/admin/${table}/[id]/page.tsx`,
        `src/app/admin/${table}/new/page.tsx`
      )
    }
    
    if (!check.hasComponent) {
      check.missingFiles.push(
        `src/components/${table}/${table}-list.tsx`,
        `src/components/${table}/${table}-form.tsx`,
        `src/components/${table}/${table}-card.tsx`
      )
    }
    
    if (!check.hasServerAction) {
      check.missingFiles.push(
        `src/app/_actions/${table}.ts`
      )
    }
    
    if (!check.hasDAL) {
      check.missingFiles.push(
        `src/lib/data-access/${table}/index.ts`
      )
    }
    
    checks.push(check)
  }
  
  return checks
}
```

### Phase 2: File Generation Templates

#### Page Template (MUST CREATE FOR EACH TABLE)
```typescript
// Template: src/app/[role]/[entity]/page.tsx
import { Metadata } from 'next'
import { EntityList } from '@/components/[entity]/[entity]-list'
import { getEntities } from '@/lib/data-access/[entity]'
import { Database } from '@/types/database.types'

type Entity = Database['public']['Tables']['[table_name]']['Row']

export const metadata: Metadata = {
  title: '[Entity] Management',
  description: 'Manage [entities] in your salon'
}

export default async function [Entity]Page() {
  const entities = await getEntities()
  
  return (
    <div className="container mx-auto py-6">
      <EntityList data={entities} />
    </div>
  )
}
```

#### Component Template (MUST CREATE FOR EACH TABLE)
```typescript
// Template: src/components/[entity]/[entity]-list.tsx
'use client'

import { Database } from '@/types/database.types'
import { DataTable } from '@/components/ui/data-table'
import { columns } from './[entity]-columns'

type Entity = Database['public']['Tables']['[table_name]']['Row']

interface EntityListProps {
  data: Entity[]
}

export function EntityList({ data }: EntityListProps) {
  return <DataTable columns={columns} data={data} />
}
```

#### Server Action Template (MUST CREATE FOR EACH TABLE)
```typescript
// Template: src/app/_actions/[entity].ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { revalidatePath } from 'next/cache'

type Entity = Database['public']['Tables']['[table_name]']['Row']
type EntityInsert = Database['public']['Tables']['[table_name]']['Insert']
type EntityUpdate = Database['public']['Tables']['[table_name]']['Update']

export async function createEntity(data: EntityInsert) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('[table_name]')
    .insert(data)
  
  if (error) throw error
  revalidatePath('/[entity]')
}

export async function updateEntity(id: string, data: EntityUpdate) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('[table_name]')
    .update(data)
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/[entity]')
}

export async function deleteEntity(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('[table_name]')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  revalidatePath('/[entity]')
}
```

#### Data Access Layer Template (MUST CREATE FOR EACH TABLE)
```typescript
// Template: src/lib/data-access/[entity]/index.ts
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { cache } from 'react'

type Entity = Database['public']['Tables']['[table_name]']['Row']

export const getEntities = cache(async () => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
})

export const getEntityById = cache(async (id: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('[table_name]')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
})
```

## SaaS-Specific Implementation Requirements

### 1. Subscription Management (CRITICAL - MISSING)
```typescript
// MUST CREATE: src/domains/subscription/
├── pages/
│   ├── salon-owner/billing/page.tsx
│   ├── salon-owner/subscription/page.tsx
│   ├── salon-owner/invoices/page.tsx
│   └── super-admin/subscriptions/page.tsx
├── components/
│   ├── subscription-status-card.tsx
│   ├── plan-comparison-table.tsx
│   ├── billing-history.tsx
│   └── payment-method-form.tsx
├── actions/
│   ├── subscription-actions.ts
│   ├── billing-actions.ts
│   └── stripe-webhook-handler.ts
└── data-access/
    ├── subscription-repository.ts
    ├── plan-repository.ts
    └── invoice-repository.ts
```

### 2. Multi-Tenant Architecture
```typescript
// Row Level Security (RLS) for Multi-Tenancy
interface TenantContext {
  salonId: string
  subscriptionTier: 'basic' | 'professional' | 'enterprise'
  features: FeatureFlags
  limits: UsageLimits
}

interface FeatureFlags {
  analytics: boolean
  marketing: boolean
  multiLocation: boolean
  apiAccess: boolean
  customBranding: boolean
  advancedReporting: boolean
}

interface UsageLimits {
  maxStaff: number
  maxLocations: number
  maxServices: number
  maxMonthlyBookings: number
  dataRetentionDays: number
}
```

## Professional Implementation Standards

### 1. Repository Pattern with Type Safety
```typescript
// Base Repository Interface
interface IRepository<T, TInsert, TUpdate> {
  findAll(filter?: Partial<T>): Promise<T[]>
  findById(id: string): Promise<T | null>
  findOne(filter: Partial<T>): Promise<T | null>
  create(data: TInsert): Promise<T>
  update(id: string, data: TUpdate): Promise<T>
  delete(id: string): Promise<void>
  exists(filter: Partial<T>): Promise<boolean>
  count(filter?: Partial<T>): Promise<number>
}

// Domain-Specific Repository
interface ISalonRepository extends IRepository<
  Salon,
  SalonInsert,
  SalonUpdate
> {
  findByOwnerId(ownerId: string): Promise<Salon[]>
  findWithActiveSubscription(): Promise<Salon[]>
  updateSubscriptionStatus(salonId: string, status: string): Promise<void>
}
```

### 2. Use Case Pattern
```typescript
// Use Case Interface
interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>
}

// Subscription Use Case
class CreateSubscriptionUseCase implements IUseCase<
  CreateSubscriptionDTO,
  Subscription
> {
  constructor(
    private salonRepo: ISalonRepository,
    private subscriptionRepo: ISubscriptionRepository,
    private paymentGateway: IPaymentGateway,
    private emailService: IEmailService
  ) {}
  
  async execute(input: CreateSubscriptionDTO): Promise<Subscription> {
    // 1. Validate salon exists
    const salon = await this.salonRepo.findById(input.salonId)
    if (!salon) throw new SalonNotFoundError(input.salonId)
    
    // 2. Check for existing subscription
    const existing = await this.subscriptionRepo.findActiveBySalonId(input.salonId)
    if (existing) throw new SubscriptionAlreadyExistsError()
    
    // 3. Process payment
    const payment = await this.paymentGateway.createSubscription({
      customerId: salon.stripeCustomerId,
      priceId: input.stripePriceId
    })
    
    // 4. Create subscription record
    const subscription = await this.subscriptionRepo.create({
      salonId: input.salonId,
      planId: input.planId,
      stripeSubscriptionId: payment.subscriptionId,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: addMonths(new Date(), 1)
    })
    
    // 5. Send confirmation email
    await this.emailService.sendSubscriptionConfirmation(salon, subscription)
    
    return subscription
  }
}
```

### 3. Event-Driven Architecture
```typescript
// Domain Events
interface DomainEvent {
  aggregateId: string
  eventType: string
  eventData: unknown
  occurredAt: Date
  userId: string
}

class SubscriptionCreatedEvent implements DomainEvent {
  eventType = 'subscription.created'
  
  constructor(
    public aggregateId: string,
    public eventData: SubscriptionCreatedData,
    public occurredAt: Date,
    public userId: string
  ) {}
}

// Event Handler
class SubscriptionEventHandler {
  async handle(event: SubscriptionCreatedEvent) {
    // Update analytics
    await this.analytics.trackSubscription(event)
    
    // Enable features
    await this.featureService.enableForSalon(event.aggregateId)
    
    // Notify team
    await this.slack.notifyNewSubscription(event)
  }
}
```

## Automated Completeness Verification

### Continuous Integration Checks
```yaml
# .github/workflows/completeness-check.yml
name: Database Implementation Coverage

on: [push, pull_request]

jobs:
  check-coverage:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check Implementation Coverage
        run: |
          npm run check:coverage
          
      - name: Generate Coverage Report
        run: |
          npm run generate:coverage-report
          
      - name: Fail if Coverage < 100%
        run: |
          coverage=$(cat coverage.json | jq '.percentage')
          if [ "$coverage" -lt 100 ]; then
            echo "❌ Implementation coverage is only $coverage%"
            echo "Missing implementations:"
            cat coverage.json | jq '.missing[]'
            exit 1
          fi
```

### NPM Scripts for Verification
```json
{
  "scripts": {
    "check:coverage": "ts-node scripts/check-implementation-coverage.ts",
    "generate:missing": "ts-node scripts/generate-missing-files.ts",
    "validate:types": "ts-node scripts/validate-type-usage.ts",
    "audit:architecture": "madge --circular --extensions ts,tsx src/",
    "report:completeness": "ts-node scripts/completeness-report.ts"
  }
}
```

## Commands for Missing Implementation Detection

```bash
# Find tables without pages
for table in $(grep "Tables:" src/types/database.types.ts -A 1000 | grep "Row:" | cut -d: -f1 | tr -d ' '); do
  if ! find src/app -name "*.tsx" -exec grep -l "$table" {} \; | grep -q .; then
    echo "❌ Missing page for: $table"
  fi
done

# Find tables without components
for table in $(grep "Tables:" src/types/database.types.ts -A 1000 | grep "Row:" | cut -d: -f1 | tr -d ' '); do
  if [ ! -d "src/components/$table" ]; then
    echo "❌ Missing component directory for: $table"
  fi
done

# Find tables without server actions
for table in $(grep "Tables:" src/types/database.types.ts -A 1000 | grep "Row:" | cut -d: -f1 | tr -d ' '); do
  if [ ! -f "src/app/_actions/${table}.ts" ]; then
    echo "❌ Missing server action for: $table"
  fi
done

# Find tables without DAL
for table in $(grep "Tables:" src/types/database.types.ts -A 1000 | grep "Row:" | cut -d: -f1 | tr -d ' '); do
  if [ ! -d "src/lib/data-access/$table" ]; then
    echo "❌ Missing DAL for: $table"
  fi
done

# Generate comprehensive report
npm run report:completeness
```

## Success Metrics for Enterprise SaaS

### Technical Excellence
- **Type Coverage**: 100% - Every database table has typed implementation
- **Code Coverage**: >90% for business logic
- **Bundle Size**: <300KB initial, <50KB per route
- **Performance**: <100ms p95 response time
- **Availability**: 99.9% uptime SLA

### Business Metrics
- **MRR Growth**: Track monthly recurring revenue
- **Churn Rate**: <5% monthly
- **CAC:LTV Ratio**: 1:3 minimum
- **Feature Adoption**: >60% using advanced features
- **Support Tickets**: <2% of active users

### Code Quality Gates
```typescript
// Quality Thresholds
const QUALITY_GATES = {
  typesCoverage: 100,        // All database types implemented
  duplicateCode: 3,          // Max 3% duplication
  cyclomaticComplexity: 8,   // Max complexity per function
  cognitiveComplexity: 15,   // Max cognitive load
  maintainabilityIndex: 75,  // Minimum maintainability
  technicalDebtRatio: 5,     // Max 5% tech debt
  testCoverage: 90,          // Min test coverage
  documentationCoverage: 80  // Min documentation
}
```

## Continuous Monitoring & Alerting

```typescript
// Real-time Implementation Monitoring
class ImplementationMonitor {
  async checkCompleteness(): Promise<CompletionReport> {
    const tables = await this.getDatabaseTables()
    const implementations = await this.scanImplementations()
    
    const missing = tables.filter(table => 
      !implementations.pages.includes(table) ||
      !implementations.components.includes(table) ||
      !implementations.actions.includes(table) ||
      !implementations.dal.includes(table)
    )
    
    if (missing.length > 0) {
      await this.alertTeam({
        level: 'CRITICAL',
        message: `Missing implementations for ${missing.length} tables`,
        tables: missing,
        suggestedAction: 'Run: npm run generate:missing'
      })
    }
    
    return {
      total: tables.length,
      implemented: tables.length - missing.length,
      missing: missing,
      coverage: ((tables.length - missing.length) / tables.length) * 100
    }
  }
}
```

## Final Checklist: Enterprise SaaS Readiness

### Database Implementation (MUST BE 100%)
- [ ] All tables have corresponding pages
- [ ] All tables have typed components
- [ ] All tables have server actions
- [ ] All tables have DAL implementations
- [ ] All relationships are properly mapped

### SaaS Infrastructure (CRITICAL)
- [ ] Subscription management fully implemented
- [ ] Stripe webhook handlers configured
- [ ] Multi-tenant RLS policies active
- [ ] Usage limits enforced per plan
- [ ] Billing dashboard for salon owners

### Enterprise Architecture
- [ ] Clean Architecture layers enforced
- [ ] Domain boundaries clearly defined
- [ ] Repository pattern implemented
- [ ] Use cases for all business operations
- [ ] Event-driven architecture for scalability

### Performance & Scalability
- [ ] Database queries optimized with indexes
- [ ] Caching strategy implemented
- [ ] Background jobs for heavy operations
- [ ] Rate limiting per subscription tier
- [ ] CDN configured for static assets

### Security & Compliance
- [ ] Row-level security on all tables
- [ ] API rate limiting implemented
- [ ] GDPR compliance (data export/deletion)
- [ ] PCI compliance for payments
- [ ] Regular security audits scheduled

## Remember: Database Types Drive Everything

Every table in `database.types.ts` represents a business capability that MUST be fully implemented. Missing implementations = Missing revenue opportunities.

**"If it's in the database, it must be in the code. No exceptions."** - Enterprise Architecture Principle #1