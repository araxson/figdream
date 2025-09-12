# CLAUDE CODE INSTRUCTIONS

## 🚨 CRITICAL RULES - NEVER VIOLATE

### Rule #1: Database Integrity
- **NEVER EDIT `database.types.ts`** - Auto-generated file
- **NEVER USE MOCK DATA** - Only real Supabase data
- **NEVER USE `any` TYPE** - Use strict TypeScript with proper database types

### Rule #2: UI Components - MANDATORY
- **ALWAYS USE SHADCN MCP** - Use `npx shadcn@latest add [component]` for ALL UI
- **NEVER CREATE CUSTOM UI** - If shadcn doesn't have it, use shadcn blocks/patterns
- **NEVER MODIFY shadcn components** in `src/components/ui/`
- **NEVER USE INLINE STYLES** - Tailwind + shadcn classes ONLY

### Rule #3: Zero Duplicates
- **ONE COMPONENT PER FEATURE** - Use props for role/permission variations
- **CONSOLIDATE IMMEDIATELY** - Merge duplicates on discovery
- **NO DUPLICATE API ENDPOINTS** - Single endpoint with role-based logic

### Rule #4: Security (CVE-2025-29927)
- **DAL AUTHENTICATION MANDATORY** - Use Data Access Layer, not middleware
- **RLS POLICIES REQUIRED** - Always enable Row Level Security
- **USE `raw_app_meta_data`** - Never use `raw_user_meta_data` for auth
- **VALIDATE ALL INPUTS** - Use Zod for validation

### Rule #5: Quality Gates
```bash
npm run typecheck  # MUST pass with 0 errors
npm run lint       # MUST pass with 0 errors  
npm run build      # MUST build successfully
```

### Rule #6: Complete CRUD Coverage
- **SYSTEMATIC IDENTIFICATION** - Analyze ALL database tables for missing interfaces
- **FULL CRUD IMPLEMENTATION** - Every table needs Create, Read, Update, Delete
- **ROLE-BASED ACCESS** - Implement proper permissions for each operation
- **NO ORPHANED TABLES** - Every database table MUST have frontend interface

## 📁 MANDATORY ARCHITECTURE

```
src/
├── app/                    # Route-based access control
│   ├── (admin)/           # Platform administration
│   ├── (management)/      # Salon Owner + Salon Manager routes  
│   ├── (staff)/          # Staff member routes
│   ├── (customer)/       # Customer routes
│   └── (public)/         # Unauthenticated routes
│
├── components/
│   ├── features/         # Business logic (appointments, analytics, etc.)
│   ├── shared/           # Reusable patterns
│   └── ui/              # shadcn/ui ONLY (NEVER MODIFY)
│
├── lib/
│   ├── actions/         # Server Actions
│   ├── api/
│   │   ├── dal/        # Data Access Layer (REQUIRED for auth)
│   │   └── services/   # Business logic
│   └── utils/          # Utilities
│
└── hooks/
    ├── queries/        # Data fetching
    └── mutations/      # Data mutations
```

## 🗂️ FILE ORGANIZATION RULES

### Component Structure Rules
1. **FEATURE-BASED ORGANIZATION**:
   - Group by feature, not by role
   - `components/features/appointments/` NOT separate admin/staff/customer folders
   - Consolidate similar components into one with role props

2. **NAMING CONVENTIONS**:
   - **Folders**: `kebab-case` (e.g., `staff-schedules/`)
   - **Files**: `kebab-case.tsx` (e.g., `appointment-list.tsx`)
   - **Server Components**: `component-name-server.tsx` for clarity
   - **Client Components**: `component-name-client.tsx` when needed
   - **Index files**: Avoid unless truly necessary for public API

3. **FILE PLACEMENT HIERARCHY**:
   ```
   components/features/[feature]/
   ├── index.tsx                    # Main export (if needed)
   ├── [feature]-manager.tsx        # Main management component
   ├── [feature]-list.tsx           # List/table view
   ├── [feature]-form.tsx           # Create/edit form
   ├── [feature]-details.tsx        # Detail view
   ├── [feature]-types.ts           # Feature-specific types
   └── components/                  # Sub-components
       ├── [feature]-card.tsx
       └── [feature]-filters.tsx
   ```

4. **IMPORT PATH RULES**:
   - Use absolute imports with `@/` prefix
   - Never use relative imports beyond `./` for same folder
   - Update ALL imports when moving files
   - Remove unused imports immediately

5. **COMPONENT CONSOLIDATION**:
   - **Before creating**: Check if similar component exists
   - **Merge duplicates**: Into single component with props
   - **Delete redundant**: Remove immediately after consolidation
   - **Update imports**: Fix all references after moves

### File Movement Checklist
When moving files to correct location:
- [ ] Identify target location based on feature
- [ ] Check for existing similar components
- [ ] Move file to correct location
- [ ] Update ALL import statements
- [ ] Delete old/duplicate files
- [ ] Run `npm run typecheck` to verify
- [ ] Run `npm run lint` to check standards
- [ ] Test affected functionality

### API Route Organization
```
app/api/
├── [feature]/
│   ├── route.ts              # Main CRUD operations
│   ├── [id]/
│   │   └── route.ts          # Single item operations
│   └── [action]/
│       └── route.ts          # Special actions
```

### DAL Organization
```
lib/api/dal/
├── [feature].ts              # Main DAL functions
├── [feature]-queries.ts      # Read operations
├── [feature]-mutations.ts    # Write operations
└── [feature]-types.ts        # Feature types
```

## ⚡ IMMEDIATE ACTIONS BEFORE ANY TASK

1. **CHECK SHADCN MCP** - Ensure shadcn MCP tool is available
2. **SCAN FOR DUPLICATES** - Identify all duplicate components/logic
3. **VERIFY IMPORTS** - Check all import paths are correct
4. **RUN QUALITY CHECKS** - `npm run typecheck && npm run lint`

## 🛠️ IMPLEMENTATION PATTERNS

### Component Pattern (MANDATORY)
```typescript
// ✅ CORRECT - Single component with role props
// components/features/appointments/appointment-list.tsx
export function AppointmentList({ userRole, permissions }) {
  const data = userRole === 'super_admin' 
    ? getAllAppointments() 
    : getSalonAppointments()
  
  return <DataTable data={data} actions={getActionsForRole(userRole)} />
}

// ❌ WRONG - Duplicate components
// components/admin/AdminAppointmentList.tsx
// components/staff/StaffAppointmentList.tsx
// components/customer/CustomerAppointmentList.tsx
```

### Server Component Pattern
```typescript
// ✅ DEFAULT - Server Component
export async function Dashboard() {
  const data = await fetchData() // Direct database call
  return <DashboardContent data={data} />
}

// Use 'use client' ONLY for interactivity
'use client'
export function InteractiveForm() {
  const [state, setState] = useState()
  // Interactive logic only
}
```

### Data Access Layer Pattern (SECURITY)
```typescript
// lib/api/dal/appointments.ts
import { createServerClient } from '@/lib/supabase/server'

export async function getAppointments() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')
  
  // Role-based query with RLS
  return supabase
    .from('appointments')
    .select('*')
    .order('start_time')
}
```

## 🔄 DEVELOPMENT WORKFLOW

### Before Implementation
- [ ] Identify ALL related components
- [ ] Check for existing shadcn components
- [ ] Plan consolidation strategy
- [ ] Verify file locations match architecture

### During Implementation
- [ ] Use shadcn MCP for ALL UI needs
- [ ] Consolidate duplicates immediately
- [ ] Keep Server Components as default
- [ ] Use DAL for all data access
- [ ] Update imports after file moves

### After Implementation
- [ ] Run `npm run typecheck` - 0 errors required
- [ ] Run `npm run lint` - 0 errors required
- [ ] Run `npm run build` - Must succeed
- [ ] Test all affected functionality
- [ ] Verify no duplicates created

## 📋 CODING STANDARDS

### Naming Conventions
- **FILES**: `kebab-case.tsx` (appointment-list.tsx)
- **COMPONENTS**: `PascalCase` (AppointmentList)
- **FUNCTIONS**: `camelCase` (getUserData)
- **CONSTANTS**: `UPPER_SNAKE_CASE` (MAX_RETRIES)

### Import Order
```typescript
// 1. External packages
import { useState } from 'react'
import { format } from 'date-fns'

// 2. Internal aliases
import { Button } from '@/components/ui/button'
import { getAppointments } from '@/lib/api/dal/appointments'

// 3. Relative imports
import { AppointmentCard } from './appointment-card'

// 4. Types
import type { Appointment } from '@/types/database.types'
```

### File Size Limits
- **PAGE FILES**: < 50 lines (use components)
- **COMPONENT FILES**: < 200-300 lines (split if larger)
- **SINGLE RESPONSIBILITY**: Each file does ONE thing

## 🎯 CRUD OPERATIONS STRATEGY

### Systematic Analysis Process
1. **Database Schema Scan**:
   - Use `mcp__supabase__list_tables` to identify ALL tables
   - Check table relationships and foreign keys
   - Identify empty vs populated tables
   - Document column types and constraints

2. **Codebase Analysis**:
   - Scan `/src/app/api/` for existing API routes
   - Review `/src/lib/api/dal/` for DAL implementations
   - Check components for existing CRUD interfaces
   - Map which tables have complete/partial/no implementations

3. **Priority Classification**:
   - **HIGH**: Core business tables (users, appointments, services, staff)
   - **MEDIUM**: Supporting tables (notifications, reviews, settings)
   - **LOW**: Analytics and logging tables

### For Each Database Table
1. **API Layer**:
   - [ ] DAL functions in `/lib/api/dal/`
   - [ ] Proper authentication checks
   - [ ] Role-based permissions
   - [ ] Input validation with Zod

2. **UI Layer**:
   - [ ] List/Table component (shadcn DataTable)
   - [ ] Create form (shadcn Form)
   - [ ] Edit form (reuse Create with props)
   - [ ] Delete confirmation (shadcn AlertDialog)

3. **Features**:
   - [ ] Pagination (shadcn Pagination)
   - [ ] Search/Filter (shadcn Input + Select)
   - [ ] Loading states (shadcn Skeleton)
   - [ ] Error handling (shadcn Toast)

4. **Verification**:
   - [ ] Test CREATE operation with valid/invalid data
   - [ ] Test READ with pagination and filters
   - [ ] Test UPDATE with partial and full updates
   - [ ] Test DELETE with cascade handling
   - [ ] Verify role-based access control

## 🚀 NEXT.JS 15 + SUPABASE BEST PRACTICES

### Server-First Architecture
- **DEFAULT**: Server Components (no 'use client')
- **SERVER ACTIONS**: For mutations with CSRF protection
- **SUSPENSE BOUNDARIES**: Wrap async components
- **PARTIAL PRERENDERING**: For mixed static/dynamic

### Performance Optimizations
- **RLS OPTIMIZATION**: Use `(select auth.uid())` for 100x+ performance
- **INDEX RLS COLUMNS**: Add indexes on policy columns
- **TURBOPACK**: Use for development
- **LAZY LOADING**: Dynamic imports for heavy components

### Supabase Patterns
```typescript
// ✅ CORRECT - SSR pattern
import { createServerClient } from '@/lib/supabase/server'

// ❌ WRONG - Deprecated pattern
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
```

## 🗑️ FILES TO DELETE IMMEDIATELY

### Custom UI to Remove
- `skeleton-variants.tsx` → Use standard shadcn skeleton
- `use-toast.ts` → Use shadcn toast hook
- Custom charts → Use shadcn chart component
- Custom forms → Use shadcn form with props

### Duplicates to Consolidate
- Multiple dashboard components → ONE with role props
- Multiple list/table components → ONE with filters
- Multiple form variations → ONE with conditional fields
- Re-export index files → Direct imports


## ✅ FINAL VERIFICATION

### Quality Checklist
- [ ] **ZERO Custom UI** - All from shadcn MCP
- [ ] **ZERO Duplicates** - One component per feature
- [ ] **ZERO TypeScript Errors** - Clean typecheck
- [ ] **ZERO ESLint Errors** - Clean lint
- [ ] **ZERO Mock Data** - Real Supabase only
- [ ] **ZERO Inline Styles** - Tailwind only

### Success Criteria
```bash
# All must pass before any commit
npm run typecheck  # ✅ 0 errors
npm run lint       # ✅ 0 errors
npm run build      # ✅ Builds successfully
```

---

**REMEMBER: SHADCN MCP ONLY | ZERO DUPLICATES | DAL FOR AUTH | QUALITY FIRST**