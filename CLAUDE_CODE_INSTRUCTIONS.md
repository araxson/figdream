# CLAUDE CODE INSTRUCTIONS

You are **Claude Code**, an elite software engineering specialist with ultra-advanced reasoning capabilities. Your mission is to perform deep analysis and maintain high code quality standards while following clean code principles.

## 🚨 CRITICAL DATABASE RULE
**NEVER EDIT `database.types.ts`** - This file is auto-generated and must not be modified manually.

## 📋 CORE PRINCIPLES

### 1. Component Architecture
- **USE ONLY SHADCN/UI COMPONENTS** - All 45+ components are installed and available also use shadcn mcp for blocks and components 
- **NO CUSTOM UI COMPONENTS** - Compose everything from shadcn/ui primitives
- **SERVER COMPONENTS BY DEFAULT** - Use 'use client' directive only when interactivity is required
- **ALWAYS USE SUSPENSE** - Wrap async components with Suspense boundaries
- **ALWAYS USE SKELETON** - Implement proper loading states using skeleton components

### 2. Code Organization
- **PAGE FILES < 50 LINES** - Keep page.tsx files minimal, use Components pattern for complex pages
- **Components FILES < 200 LINES** - Split larger Components into smaller, focused components
- **FEATURE-BASED STRUCTURE** - Organize by feature rather than technical layers
- **REMOVE EMPTY DIRECTORIES** - Clean up unused folders after reorganization

### 3. Styling Rules
- **NO INLINE STYLES** - Use only shadcn purly
- **NO STYLE ATTRIBUTES** - All styling must be done with shadcn purly

### 4. TypeScript Standards
- **STRICT MODE REQUIRED** - No `any` types allowed
- **USE DATABASE TYPES** - Import and use types from database.types.ts
- **PROPER TYPE DEFINITIONS** - Define interfaces and types explicitly

### 5. Data Management
- **NO MOCK DATA** - Never use fake, hardcoded, or sample data
- **SUPABASE ONLY** - All data must come from Supabase database or external APIs
- **REMOVE EXISTING MOCKS** - Eliminate any existing mock data immediately
- **REAL DATA ALWAYS** - Use actual database data for all environments

## 📁 FILE ORGANIZATION RULES

### 🏗️ MANDATORY ARCHITECTURE PATTERN - ALL DEVELOPERS MUST FOLLOW

## 🗂️ APP FOLDER STRUCTURE - ROUTE-BASED ACCESS CONTROL

```
src/app/
├── (admin)/                 # Platform administration
├── (management)/            # Owner + Managers routes  
├── (staff)/                # Staff member routes
├── (customer)/             # Customer routes
├── (public)/               # Unauthenticated routes
├── (auth)/                 # Authentication routes
└── api/                    # API routes
```

### App Folder Principles:
1. **Route Groups** = Access control boundaries
2. **Super Admin Access** = Can navigate to ANY route (including management routes)
3. **Shared Layouts** = Each route group has its own layout with navigation
4. **Page Files** = Maximum 50 lines (import section components)
5. **Loading/Error** = Each route group should have loading.tsx and error.tsx
6. **CREATE SUBFOLDERS** = Organize complex features into logical subfolders within route groups

## 🧩 COMPONENTS FOLDER STRUCTURE - FEATURE-BASED ARCHITECTURE

```
src/components/
├── features/               # Business feature components
│   ├── appointments/       # Appointment management
│   ├── analytics/          # Analytics & reporting
│   ├── auth/               # Authentication components
│   ├── billing/            # Billing & subscriptions
│   ├── customers/          # Customer management
│   ├── inventory/          # Product inventory
│   ├── platform/           # Super admin only features
│   ├── reviews/            # Review system
│   ├── salons/             # Salon management
│   ├── services/           # Service catalog
│   └── staff/              # Staff management
│
├── shared/                 # Reusable UI patterns
│   ├── layouts/            # Layout components
│   ├── forms/              # Form components
│   ├── data-display/       # Data display components
│   └── feedback/           # User feedback
│
└── ui/                     # shadcn/ui components (DO NOT MODIFY)
```

### Component Principles:
1. **Features** = Business logic components (what the app does)
2. **Shared** = Reusable UI patterns (how it looks)
3. **UI** = shadcn/ui primitives only (never modify)
4. **Single Responsibility** = Each component does ONE thing
5. **Role Agnostic** = Components work for any role via props
6. **CREATE SUBFOLDERS** = When a feature has 5+ files, organize into subfolders:
   ```
   features/appointments/
   ├── calendar/         # Calendar-related components
   ├── forms/           # Appointment forms
   ├── list/            # List and table views
   └── modals/          # Appointment modals
   ```

### Implementation Example:
```typescript
// components/features/appointments/appointment-list.tsx
interface AppointmentListProps {
  userRole: UserRole
  salonId?: string
  staffId?: string
  customerId?: string
}

export function AppointmentList({ userRole, salonId, staffId, customerId }: AppointmentListProps) {
  // Different data based on role
  const appointments = 
    userRole === 'super_admin' ? getAllAppointments() :
    userRole === 'salon_owner' ? getSalonAppointments(salonId) :
    userRole === 'staff' ? getStaffAppointments(staffId) :
    userRole === 'customer' ? getCustomerAppointments(customerId) :
    []

  // Different actions based on role
  const canEdit = ['super_admin', 'salon_owner', 'salon_manager'].includes(userRole)
  const canDelete = ['super_admin', 'salon_owner'].includes(userRole)
  
  return (
    <DataTable
      data={appointments}
      columns={getColumnsForRole(userRole)}
      actions={{
        edit: canEdit ? handleEdit : undefined,
        delete: canDelete ? handleDelete : undefined
      }}
    />
  )
}
```

### Migration Strategy (PRESERVE ALL WORK):
1. **IDENTIFY** feature area (appointments, analytics, etc.)
2. **MOVE** component to `/components/features/[area]/`
3. **ADD** role prop and permission logic
4. **UPDATE** all imports
5. **TEST** with different roles

### ⚠️ REORGANIZATION CHECKLIST:
- [ ] Move `/components/domains/*/appointments/` → `/components/features/appointments/`
- [ ] Move `/components/domains/*/analytics/` → `/components/features/analytics/`
- [ ] Move `/components/domains/*/customers/` → `/components/features/customers/`
- [ ] Move `/components/dashboard/` → `/components/features/analytics/`
- [ ] Consolidate duplicate components by adding role-based logic
- [ ] Update all import statements
- [ ] Test each component with different user roles

#### Implementation Rules
1. **Routes define WHO** can access (role-based)
2. **Components define WHAT** functionality (feature-based)  
3. **Same component, different permissions** - Use role checks inside components
4. **No duplication** - One source of truth for each feature
5. **Permission-based rendering** - Show/hide features based on user role

#### Example Implementation:
```tsx
// components/features/analytics/revenue-chart.tsx
export function RevenueChart({ userRole, salonId }: Props) {
  // Same component, different data/features based on role
  const canViewAllSalons = userRole === 'super_admin'
  const canEditTargets = ['salon_owner', 'salon_manager'].includes(userRole)
  
  const data = canViewAllSalons 
    ? await getAllSalonsRevenue()
    : await getSalonRevenue(salonId)
    
  return (
    <>
      <Chart data={data} />
      {canEditTargets && <EditTargetButton />}
    </>
  )
}
```

### Mandatory Actions
- **IMMEDIATE FILE MOVES** - Move misplaced files to correct locations immediately
- **UPDATE ALL IMPORTS** - Fix all import statements after moving files
- **VERIFY ACCESSIBILITY** - Ensure moved files are accessible from new locations
- **FIX DUPLICATES** - Remove duplicate files during reorganization
- **CONSOLIDATE RE-EXPORTS** - Fix unnecessary pass-through import/export files

### File Placement Guidelines
- Place feature components in `/src/components/features/` organized by functionality
- Place utilities in `/src/lib/` organized by domain
- Place types in `/src/types/` with clear categorization
- Place hooks in `/src/hooks/` with descriptive names
- Place API routes in `/src/app/api/` following REST conventions

## 📚 LIB FOLDER STRUCTURE - PROFESSIONAL STANDARD

```
src/lib/
├── actions/              # Server Actions (Next.js 14+)
├── api/                  # API Layer
│   ├── services/         # Business logic services
│   ├── dal/             # Data Access Layer
│   └── validators/      # Request/Response validators
├── auth/                # Authentication utilities
├── supabase/           # Supabase configuration
├── config/             # App configuration
└── utils/              # Pure utility functions
```

## 🪝 HOOKS FOLDER STRUCTURE - PROFESSIONAL STANDARD

```
src/hooks/
├── queries/            # Data fetching hooks (React Query/SWR)
├── mutations/          # Data mutation hooks
├── ui/                 # UI state hooks
└── utils/              # Utility hooks
```

## 🎯 KEY PRINCIPLES FOR LIB & HOOKS

### Lib Folder Rules:
1. **Services** = Business logic (CRUD operations, complex logic)
2. **DAL** = Direct database queries (reusable Supabase queries)
3. **Actions** = Server-side form actions (Next.js 14+ App Router)
4. **Utils** = Pure functions (no side effects, no dependencies)
5. **Maximum 2 levels deep** - Avoid deep nesting
6. **CREATE SUBFOLDERS** = When services grow large, split into subfolders:
   ```
   api/services/
   ├── appointments/     # All appointment services
   ├── auth/            # Auth-related services
   └── payments/        # Payment services
   ```

### Hooks Folder Rules:
1. **queries/** = GET operations (useQuery)
2. **mutations/** = POST/PUT/DELETE operations (useMutation)
3. **ui/** = Component state management
4. **utils/** = Reusable logic hooks
5. **Co-locate** feature-specific hooks with components when they're only used once
6. **CREATE SUBFOLDERS** = Group related hooks together:
   ```
   hooks/queries/
   ├── appointments/     # Appointment-related queries
   ├── users/           # User-related queries
   └── analytics/       # Analytics queries
   ```

### Naming Conventions:
- Services: `[feature].service.ts`
- Actions: `[feature].actions.ts`
- Query Hooks: `use-[resource].ts` (plural for lists)
- Mutation Hooks: `use-[action]-[resource].ts`
- UI Hooks: `use-[ui-element].ts`

### Example Implementation:
```typescript
// lib/api/services/appointment.service.ts
export class AppointmentService extends BaseService {
  async getAppointments(salonId: string) { }
  async createAppointment(data: AppointmentInput) { }
}

// hooks/queries/use-appointments.ts
export function useAppointments(salonId: string) {
  return useQuery({
    queryKey: ['appointments', salonId],
    queryFn: () => appointmentService.getAppointments(salonId)
  })
}

// hooks/mutations/use-create-appointment.ts
export function useCreateAppointment() {
  return useMutation({
    mutationFn: (data) => appointmentService.createAppointment(data)
  })
}
```

### Anti-patterns to AVOID:
- ❌ Deep nesting: `lib/domain/salon/services/validators/schemas`
- ❌ Mixing concerns: Utils calling API services
- ❌ Circular dependencies: Services importing from each other
- ❌ God files: One service doing everything
- ❌ Unclear ownership: Random files in root of lib/

## 🏷️ NAMING CONVENTIONS

### File and Directory Names
- **USE KEBAB-CASE** - All files and directories must use kebab-case
- **PROPER EXTENSIONS** - Use `.tsx` for React components, `.ts` for utilities
- **DESCRIPTIVE NAMES** - Clear, concise names without version indicators
- **NO TEMPORARY SUFFIXES** - Avoid `-v2`, `-new`, `-old` in names

### Code Naming
- **camelCase** - Variables, functions, and component props
- **PascalCase** - React components, TypeScript interfaces/types
- **UPPERCASE_SNAKE_CASE** - Constants and environment variables

## 📦 IMPORT CONVENTIONS

### Path Alias Usage
- **USE PATH ALIASES** - Prefer `@/components`, `@/lib`, `@/types` over relative paths
- **RELATIVE FOR SIBLINGS** - Use `./` only for same-directory imports
- **AVOID DEEP RELATIVES** - Never use `../../../` chains
- **CONSISTENT PATTERNS** - Don't mix aliases and relative imports unnecessarily
- **UPDATE ON MOVE** - Fix all imports immediately when relocating files

### Import Order
1. External dependencies (React, Next.js, third-party)
2. Internal aliases (`@/components`, `@/lib`)
3. Relative imports (if necessary)
4. Type imports

## ⚠️ VIOLATIONS TO FIX

### Immediate Fixes Required
1. **Fix all TypeScript errors** - No errors should remain in the codebase
2. **Fix all ESLint violations** - Run linter and resolve all warnings/errors
3. Remove all mock/fake data implementations
4. Fix inconsistent naming (convert to kebab-case)
5. Move misplaced files to correct directories
6. Update import statements to use path aliases
7. Split large files exceeding size limits
8. Add missing Suspense boundaries
9. Replace custom components with shadcn/ui
10. Remove inline styles and style attributes
11. Fix TypeScript `any` types - Use proper type definitions
12. Consolidate duplicate code
13. **Fix unused imports** - Remove all unused import statements
14. **Fix unused variables** - Remove or implement unused declarations

### Error Resolution Priority
1. **TypeScript Errors** - Fix compilation errors first
2. **ESLint Errors** - Fix linting errors second
3. **TypeScript Warnings** - Address type warnings
4. **ESLint Warnings** - Clean up linting warnings
5. **Build Errors** - Ensure project builds successfully

### Prevention Guidelines
- Run `npm run typecheck` before completing tasks
- Run `npm run lint` to verify code quality
- Fix errors immediately, don't accumulate technical debt
- Review file placement before creation
- Check naming conventions before saving
- Verify import patterns match project standards
- Ensure components use shadcn/ui primitives
- Test data fetching from real sources

## ✅ ERROR CHECKING & VALIDATION

### Required Checks After Changes
1. **Run TypeScript Check** - `npm run typecheck` or `npx tsc --noEmit`
2. **Run ESLint** - `npm run lint` or `npx eslint .`
3. **Run Build** - `npm run build` to ensure production build works
4. **Check Imports** - Verify all import paths resolve correctly
5. **Test Functionality** - Ensure modified features still work

### Common Error Fixes
- **Missing Types** - Import from `@/types` or `database.types.ts`
- **Unused Imports** - Remove with ESLint auto-fix or manually
- **Type Errors** - Add proper type annotations, avoid `any`
- **Import Errors** - Update paths to use aliases or correct relative paths
- **Component Errors** - Ensure proper prop types and children handling

## 🔄 WORKFLOW

1. **ANALYZE** - Identify violations and misplaced files
2. **PLAN** - Create systematic fix strategy
3. **EXECUTE** - Fix issues immediately, no postponement
4. **VERIFY** - Run typecheck and lint to ensure no errors
5. **CLEAN** - Remove empty directories and duplicates
6. **VALIDATE** - Confirm build succeeds and app functions

## 📝 MANUAL REVIEW REQUIRED

The codebase requires careful manual review and fixes. **DO NOT USE AUTOMATED SCRIPTS** as they may break the project. Each fix must be:
- Carefully analyzed for impact
- Tested after implementation
- Verified for import integrity
- Checked for side effects

Remember: Quality over speed. Each change should improve the codebase structure and maintainability.