# **Next.js 15 App Router + TypeScript + shadcn/ui + Supabase: Professional Development Rules**

**Last Updated: Aug 2025**
**Next.js Version: 15.5**
**UI: SHADCN**
**DATABASE and Auth: SUPABASE**
**React Version: 19 RC (App Router)**

## 🚨 CRITICAL RULES - NEVER VIOLATE

1. **USE ONLY SHADCN/UI COMPONENTS** - All 45+ components are installed. NEVER create custom UI components
2. **NO CUSTOM COMPONENTS** - Compose everything from shadcn primitives
3. **NO INLINE STYLES** - Use only Tailwind CSS classes
4. **TYPESCRIPT STRICT MODE** - No `any` types, use Database types
5. **SERVER COMPONENTS DEFAULT** - Use 'use client' only for interactivity
6. **PAGE FILES < 50 LINES** - Use section pattern for heavy pages
7. **SECTION FILES < 200 LINES** - Split if larger
8. **ALWAYS USE SUSPENSE** - For async components
9. **ALWAYS USE SKELETON** - For loading states

### **0. File Movement & Location Standards (STRICT ENFORCEMENT)**

- **FOLLOW:** ALL files MUST be moved to their appropriate, logical locations immediately when identified as misplaced.
- **FOLLOW:** Files found in incorrect locations MUST be relocated within the same development session - no exceptions.
- **FOLLOW:** Every file operation MUST result in improved project organization and logical structure.
- **FOLLOW:** Move files to directories that match their functionality and purpose.
- **FOLLOW:**  Fix duplicate files in multiple locations during reorganization.
- **FOLLOW:** Move utility functions to the correct utility directories based on their domain.
- **FOLLOW:** Ensure all files are in directories that reflect their actual purpose and usage.
- **FOLLOW:** Update ALL import statements immediately after moving any file.
- **FOLLOW:** Verify that moved files are accessible from their new location before completing the move.
- **FOLLOW:** Use proper file extensions (.tsx for React components, .ts for utilities and types).
- **FOLLOW:** Maintain consistent naming conventions during file moves.
- **AVOID:** Leaving files in incorrect or temporary locations for any reason.
- **AVOID:** Creating new files without placing them in the correct directory structure.
- **AVOID:** Moving files without updating all import statements that reference them.
- **AVOID:** Placing files in generic directories when specific feature directories exist.
- **AVOID:** Postponing file organization tasks - complete them immediately. 


## **Core Architecture Principles**

### **1. Server-First Approach**

- **FOLLOW:** Default to Server Components for all pages and layouts
- **FOLLOW:** Use Server Actions for mutations with unguessable endpoints and automatic removal of unused actions
- **FOLLOW:** Fetch data directly in Server Components using `@supabase/ssr` server client (auth-helpers are deprecated)
- **FOLLOW:** Leverage Next.js 15's stable Partial Prerendering (PPR) for mixed static/dynamic content
- **FOLLOW:** Use the `use cache` directive for expensive computations in Server Components
- **FOLLOW:** Implement HMR optimization to reuse fetch responses from previous renders during development
- **FOLLOW:** Use React 19 RC features in App Router (backwards compatible with React 18 in Pages Router)
- **AVOID:** Making client-side API calls when server-side fetching is possible
- **AVOID:** Using "use client" directive unless absolutely necessary
- **AVOID:** Creating API routes for simple CRUD operations (use Server Actions instead)

### **2. Component Philosophy**

- **FOLLOW:** identify and fix unnecessary re-export files (import/export files that just pass through imports) by either consolidating them into proper barrel exports or removing them entirely and updating imports to reference original sources directly
- **FOLLOW:** Keep Server Components pure and stateless
- **FOLLOW:** Push client components as deep in the tree as possible
- **FOLLOW:** Use composition over prop drilling
- **FOLLOW:** Implement proper Suspense boundaries with loading.tsx files
- **FOLLOW:** Create reusable Server Components for data fetching patterns
- **AVOID:** Mixing server and client logic in the same component
- **AVOID:** Wrapping entire pages in "use client"
- **AVOID:** Passing Server Component functions to Client Components

## **TypeScript Best Practices**

### **3. Type Safety Rules**

- **FOLLOW:** Generate types from Supabase schema using `supabase gen types typescript`
- **FOLLOW:** Use strict mode and enable all strict TypeScript checks
- **FOLLOW:** Define explicit return types for all functions and Server Actions
- **FOLLOW:** Create type-safe wrappers for Supabase queries using Database types
- **FOLLOW:** Use helper types: `Tables<'table_name'>`, `QueryData<typeof query>`
- **FOLLOW:** Implement proper error handling with Result/Either patterns
- **FOLLOW:** Use discriminated unions for complex state management
- **FOLLOW:** Fix ALL TypeScript errors immediately - zero tolerance for type errors
- **FOLLOW:** Run `npm run type-check` before every commit
- **FOLLOW:** Ensure zero TypeScript compilation errors in production builds
- **AVOID:** Using `any` type under any circumstances
- **AVOID:** Type assertions unless absolutely necessary with proper guards
- **AVOID:** Ignoring TypeScript errors with @ts-ignore
- **AVOID:** Loose type definitions that bypass safety checks
- **AVOID:** Committing code with TypeScript errors
- **AVOID:** Using @ts-expect-error or @ts-ignore to suppress type checking
- **AVOID:** Deploying code with unresolved TypeScript issues

### **4. Type Organization & Database Integration**

- **FOLLOW:** Colocate types with their usage when specific to a component
- **FOLLOW:** Export and reuse Database types from generated schema
- **FOLLOW:** Use `QueryResult`, `QueryData`, `QueryError` for typed responses
- **FOLLOW:** Create custom types for Server Actions with proper validation
- **FOLLOW:** Leverage TypeScript's inference with proper generic constraints
- **FOLLOW:** Use `overrideTypes` method when database types need adjustment
- **AVOID:** Creating unnecessary type abstractions
- **AVOID:** Global type declarations unless truly global
- **AVOID:** Duplicating database types manually

### **4.1. TypeScript Error Resolution (MANDATORY)**

- **FOLLOW:** Fix ALL TypeScript errors before committing any code
- **FOLLOW:** Resolve type conflicts immediately when they arise
- **FOLLOW:** Use proper type definitions instead of type assertions
- **FOLLOW:** Ensure all imports have correct type definitions
- **FOLLOW:** Validate that all function parameters and return types are properly typed
- **FOLLOW:** Check that all component props have complete type definitions
- **FOLLOW:** Verify that all database queries return properly typed results
- **FOLLOW:** Ensure all Server Actions have complete input/output type validation
- **AVOID:** Leaving TypeScript errors unresolved for any reason
- **AVOID:** Using type assertions to bypass type checking
- **AVOID:** Creating components or functions without proper type definitions
- **AVOID:** Ignoring TypeScript warnings or errors during development

## **ESLint Rules & Code Quality (CRITICAL - MANDATORY)**

### **5. ESLint Error Resolution (ZERO TOLERANCE)**

- **FOLLOW:** Fix ALL ESLint errors before committing any code - zero tolerance policy
- **FOLLOW:** Run `npm run lint` before every commit and fix ALL errors
- **FOLLOW:** Never commit code with ESLint errors or warnings
- **FOLLOW:** ESLint errors block all deployments and merges
- **FOLLOW:** Address ESLint errors immediately when they arise during development
- **FOLLOW:** Use ESLint auto-fix when possible: `npm run lint -- --fix`
- **FOLLOW:** Manually fix errors that cannot be auto-fixed
- **FOLLOW:** Review and fix all warnings to maintain code quality
- **AVOID:** Suppressing ESLint rules with comments unless absolutely necessary
- **AVOID:** Ignoring ESLint errors during development
- **AVOID:** Committing code with unresolved linting issues

### **6. Type Safety & ESLint Integration**

- **FOLLOW:** Use `@typescript-eslint/no-explicit-any` rule to prevent `any` type usage
- **FOLLOW:** Replace all `any` types with proper TypeScript types
- **FOLLOW:** Use `@typescript-eslint/no-unused-vars` to identify and remove unused variables
- **FOLLOW:** Use `@typescript-eslint/no-unsafe-function-type` to prevent unsafe function types
- **FOLLOW:** Use `@typescript-eslint/ban-ts-comment` to prevent `@ts-nocheck` usage
- **FOLLOW:** Use `@typescript-eslint/no-require-imports` to enforce ES6 import syntax
- **FOLLOW:** Use `prefer-const` to enforce const usage for immutable variables
- **FOLLOW:** Use `react/display-name` to ensure React components have display names
- **FOLLOW:** Use `react-hooks/exhaustive-deps` to ensure proper hook dependencies
- **FOLLOW:** Use `import/no-anonymous-default-export` to prevent anonymous exports
- **AVOID:** Using `any` type anywhere in the codebase
- **AVOID:** Creating unused variables or parameters
- **AVOID:** Using `@ts-nocheck` or similar TypeScript suppression comments
- **AVOID:** Using `require()` statements instead of ES6 imports
- **AVOID:** Using `let` when `const` is appropriate
- **AVOID:** Creating React components without display names
- **AVOID:** Missing dependencies in React hooks
- **AVOID:** Anonymous default exports

### **7. Code Quality & Best Practices**

- **FOLLOW:** Remove all unused imports, variables, and parameters
- **FOLLOW:** Use descriptive variable names that clearly indicate purpose
- **FOLLOW:** Implement proper error handling for all async operations
- **FOLLOW:** Use proper TypeScript generics instead of `any` types
- **FOLLOW:** Create proper type definitions for all function parameters and return values
- **FOLLOW:** Use proper error types and result patterns
- **FOLLOW:** Implement proper validation for all user inputs
- **FOLLOW:** Use proper database types from generated schema
- **FOLLOW:** Create proper interfaces for all data structures
- **FOLLOW:** Use proper enum types instead of string literals
- **AVOID:** Creating variables without using them
- **AVOID:** Using generic error types without proper context
- **AVOID:** Creating functions with unclear parameter types
- **AVOID:** Using loose typing that bypasses TypeScript safety
- **AVOID:** Creating complex functions without proper type definitions

### **8. Specific ESLint Rule Enforcement**

#### **8.1. TypeScript ESLint Rules**

- **FOLLOW:** `@typescript-eslint/no-explicit-any` - Replace all `any` types with proper types
- **FOLLOW:** `@typescript-eslint/no-unused-vars` - Remove all unused variables and parameters
- **FOLLOW:** `@typescript-eslint/no-unsafe-function-type` - Use proper function type definitions
- **FOLLOW:** `@typescript-eslint/ban-ts-comment` - Never use `@ts-nocheck` or similar
- **FOLLOW:** `@typescript-eslint/no-require-imports` - Use ES6 import syntax only

#### **8.2. React ESLint Rules**

- **FOLLOW:** `react/display-name` - All React components must have display names
- **FOLLOW:** `react-hooks/exhaustive-deps` - All hook dependencies must be properly declared
- **FOLLOW:** `react-hooks/rules-of-hooks` - Follow React hooks rules strictly

#### **8.3. General ESLint Rules**

- **FOLLOW:** `prefer-const` - Use `const` for immutable variables
- **FOLLOW:** `import/no-anonymous-default-export` - Name all default exports
- **FOLLOW:** `no-unused-expressions` - FIX expressions without side effects

### **9. ESLint Error Categories & Fixes**

#### **9.1. Type Safety Issues (HIGH PRIORITY)**

- **FOLLOW:** Replace all `any` types with proper TypeScript types
- **FOLLOW:** Remove all `@ts-nocheck` comments and fix underlying issues
- **FOLLOW:** Fix all `@typescript-eslint/no-unsafe-function-type` errors
- **FOLLOW:** Ensure all function parameters and return types are properly typed

#### **9.2. Unused Code Issues (MEDIUM PRIORITY)**

- **FOLLOW:** Remove all unused variables, parameters, and imports
- **FOLLOW:** Clean up unused function parameters in tRPC routers
- **FOLLOW:** Remove unused imports from business service files
- **FOLLOW:** Clean up unused variables in utility functions

#### **9.3. Code Quality Issues (MEDIUM PRIORITY)**

- **FOLLOW:** Fix all `prefer-const` violations
- **FOLLOW:** Add proper display names to React components
- **FOLLOW:** Fix React hooks dependency arrays
- **FOLLOW:** Replace `require()` statements with ES6 imports

#### **9.4. Import/Export Issues (LOW PRIORITY)**

- **FOLLOW:** Fix anonymous default exports
- **FOLLOW:** Ensure proper named exports for all modules
- **FOLLOW:** Use proper import/export syntax throughout

### **10. ESLint Workflow & Enforcement**

#### **10.1. Pre-commit Process**

- **FOLLOW:** Run `npm run lint` before every commit
- **FOLLOW:** Fix ALL ESLint errors before committing
- **FOLLOW:** Fix ALL ESLint warnings before committing
- **FOLLOW:** Use `npm run lint -- --fix` to auto-fix issues when possible
- **FOLLOW:** Manually fix issues that cannot be auto-fixed

#### **10.2. Development Workflow**

- **FOLLOW:** Address ESLint errors immediately when they appear
- **FOLLOW:** Use ESLint in your IDE for real-time error detection
- **FOLLOW:** Fix linting issues before moving to new features
- **FOLLOW:** Review ESLint output regularly during development

#### **10.3. CI/CD Integration**

- **FOLLOW:** ESLint errors must block all deployments
- **FOLLOW:** ESLint errors must block all pull request merges
- **FOLLOW:** Maintain zero ESLint errors in production code
- **FOLLOW:** Regular ESLint audits of the entire codebase

### **11. Common ESLint Error Fixes**

#### **11.1. Fixing `any` Type Issues**

```typescript
// ❌ FIX
function processData(data: any) { ... }

// ✅ FOLLOW
function processData(data: ProcessableData) { ... }
interface ProcessableData { id: string; name: string; }
```

#### **11.2. Fixing Unused Variables**

```typescript
// ❌ FIX
function processUser(user: User, ctx: Context, input: Input) {
  // ctx and input are unused
  return user.name;
}

// ✅ FOLLOW
function processUser(user: User) {
  return user.name;
}
```

#### **11.3. Fixing Function Type Issues**

```typescript
// ❌ FIX
type Handler = Function;

// ✅ FOLLOW
type Handler = (req: Request, res: Response) => void;
```

#### **11.4. Fixing React Hooks Issues**

```typescript
// ❌ FIX
useEffect(() => {
  // Missing dependencies
}, []);

// ✅ FOLLOW
useEffect(() => {
  // All dependencies included
}, [dependency1, dependency2]);
```

### **12. ESLint Configuration & Rules**

#### **12.1. Required ESLint Rules**

```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/no-unsafe-function-type": "error",
  "@typescript-eslint/ban-ts-comment": "error",
  "@typescript-eslint/no-require-imports": "error",
  "prefer-const": "error",
  "react/display-name": "error",
  "react-hooks/exhaustive-deps": "error",
  "import/no-anonymous-default-export": "error"
}
```

#### **12.2. ESLint Scripts**

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "lint:strict": "next lint --max-warnings 0"
  }
}
```

## **Supabase Integration Rules**

### **5. Authentication & Security**

- **FOLLOW:** Always use Row Level Security (RLS) policies with proper performance optimization
- **FOLLOW:** Validate authentication on every server request using `supabase.auth.getUser()`
- **FOLLOW:** Use the `@supabase/ssr` package for proper cookie-based auth (auth-helpers are now deprecated)
- **FOLLOW:** Do NOT rely on middleware for authentication (CVE-2025-29927) - use Data Access Layer instead
- **FOLLOW:** Use middleware only for session updates with `updateSession`, not for authorization checks
- **FOLLOW:** Call functions with `select` in RLS policies: `(select auth.uid()) = user_id`
- **FOLLOW:** Add indexes on columns used in RLS policies for performance
- **FOLLOW:** Specify roles in RLS policies using `TO authenticated/anon`
- **FOLLOW:** Add filters to every query to optimize RLS performance
- **FOLLOW:** Use security definer functions for complex RLS logic
- **AVOID:** Never trust `supabase.auth.getSession()` in Server Components
- **AVOID:** Exposing service role key in any client code
- **AVOID:** Using `raw_app_meta_data` in RLS policies (use `raw_app_meta_data` instead)
- **AVOID:** Creating security definer functions in exposed schemas
- **AVOID:** Direct database access without RLS enabled

### **6. Data Fetching & RLS Performance**

- **FOLLOW:** Enable RLS on all public schema tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY`
- **FOLLOW:** RLS is enabled by default on tables created with the Table Editor in Supabase dashboard
- **FOLLOW:** Create efficient RLS policies with proper role targeting
- **FOLLOW:** Use `(select auth.uid())` wrapped in parentheses for initPlan optimization (100x+ improvement)
- **FOLLOW:** Wrap functions in SELECT for caching: `(select auth.uid()) = user_id` instead of `auth.uid() = user_id`
- **FOLLOW:** Reorganize queries to use IN/ANY operations instead of joins for better performance
- **FOLLOW:** Prefer `team_id in (select team_id from team_user where user_id = auth.uid())` over join-based policies
- **FOLLOW:** Add database indexes on columns used in RLS policies (e.g., `create index on table using btree (user_id)`)
- **FOLLOW:** Always add explicit filters even when RLS policies exist
- **FOLLOW:** Use React Suspense boundaries for loading states
- **FOLLOW:** Implement proper error boundaries with error.tsx files
- **FOLLOW:** Leverage Next.js 15's caching with `cacheLife` and `cacheTag`
- **FOLLOW:** Use Supabase Realtime selectively for critical real-time features
- **FOLLOW:** Create security definer functions in private schemas for complex RLS logic
- **FOLLOW:** Use `security invoker` by default, only use `security definer` with empty search_path
- **AVOID:** Overfetching data (select only needed columns)
- **AVOID:** N+1 query problems in RLS policies
- **AVOID:** Creating RLS policies without performance considerations
- **AVOID:** Using complex joins in RLS policies without security definer functions
- **AVOID:** Creating security definer functions in exposed schemas (use private schema)
- **AVOID:** Using `security definer` without setting `search_path = ''`

## **Next.js 15 Specific Rules**

### **7. Routing & Navigation**

- **FOLLOW:** Use parallel routes (@folder) for complex layouts and concurrent loading
- **FOLLOW:** Implement route groups ((folder)) for organization without URL impact
- **FOLLOW:** Use intercepting routes ((.)) for modals and overlays
- **FOLLOW:** Leverage loading.tsx, error.tsx, not-found.tsx, forbidden.tsx, and unauthorized.tsx files
- **FOLLOW:** Use the new `connection()` function for handling network conditions
- **FOLLOW:** Implement proper metadata generation with `generateMetadata`
- **FOLLOW:** Use typed routes for better developer experience
- **FOLLOW:** Use enhanced forms (next/form) for client-side navigation with progressive enhancement
- **AVOID:** Client-side routing when server navigation works
- **AVOID:** Unnecessary route nesting without clear benefits
- **AVOID:** Dynamic routes when static routes suffice

### **8. Performance & Caching**

- **FOLLOW:** Use static generation with `generateStaticParams` where possible
- **FOLLOW:** Implement Partial Prerendering (PPR) with `ppr: true` in next.config.js (now stable)
- **FOLLOW:** Use the `use cache` directive for expensive server computations
- **FOLLOW:** Leverage `cacheLife` and `cacheTag` for granular cache control
- **FOLLOW:** Implement HMR optimization to reuse fetch responses from previous renders in development
- **FOLLOW:** Use Turbopack Dev (now stable) for improved performance
- **FOLLOW:** Stream responses using Suspense and loading.tsx
- **FOLLOW:** Use Next.js Image component with proper optimization settings
- **FOLLOW:** Implement proper `revalidateTag` and `revalidatePath` strategies
- **FOLLOW:** Use `unstable_cache` for server-side caching when needed
- **FOLLOW:** Keep JavaScript client bundles minimal (React Server Components reduce client JS significantly)
- **AVOID:** Blocking data fetches in layouts without streaming
- **AVOID:** Large JavaScript bundles in client components
- **AVOID:** Runtime CSS-in-JS libraries (prefer static CSS solutions)

## **shadcn/ui Implementation**

### **9. Component Usage**

- **FOLLOW:** Use ONLY shadcn/ui components for all UI elements and styling
- **FOLLOW:** Install only needed shadcn components
- **FOLLOW:** Customize through CSS variables from globals.css
- **FOLLOW:** Maintain consistent theming using hsl(var(--\*)) syntax
- **FOLLOW:** Use compound component patterns
- **AVOID:** Creating custom UI components or custom styling
- **AVOID:** Modifying shadcn components directly
- **AVOID:** Overriding with important CSS rules
- **AVOID:** Mixing UI libraries
- **AVOID:** Building custom buttons, cards, inputs, or any other UI elements

### **10. Styling Philosophy**

- **FOLLOW:** Use shadcn/ui as the ONLY styling solution for all UI elements
- **FOLLOW:** Use shadcn as primary styling and tailwind method
- **FOLLOW:** Create semantic color tokens using CSS custom properties from globals.css
- **FOLLOW:** Always use hsl(var(--\*)) format for colors to ensure consistent theming
- **FOLLOW:** Use chart colors (--chart-1 through --chart-5) for data visualizations
- **AVOID:** Hardcoded color values (hex, rgb, named colors)
- **AVOID:** Inline styles except for dynamic values
- **AVOID:** Deep CSS nesting
- **AVOID:** Non-responsive designs
- **AVOID:** Custom CSS classes or custom styling approaches
- **AVOID:** Building custom UI components outside of shadcn/ui

## **State Management & Server Actions**

### **11. State Architecture**

- **FOLLOW:** URL state for shareable/bookmarkable state using `useSearchParams`
- **FOLLOW:** Server state through Server Actions with proper revalidation
- **FOLLOW:** React state for ephemeral UI state in Client Components
- **FOLLOW:** Form libraries (react-hook-form) for complex form state
- **FOLLOW:** Use `revalidatePath` and `revalidateTag` after mutations
- **FOLLOW:** Implement optimistic updates with `useOptimistic` when appropriate
- **FOLLOW:** Use Server Actions with proper error handling and validation
- **AVOID:** Global client-side state management libraries initially
- **AVOID:** Duplicating server state in client state
- **AVOID:** Complex state synchronization patterns between client/server

### **12. Server Actions Best Practices**

- **FOLLOW:** Use `use server` directive for Server Actions
- **FOLLOW:** Validate all inputs using Zod or similar in Server Actions
- **FOLLOW:** Return properly typed results from Server Actions
- **FOLLOW:** Handle errors gracefully with proper error boundaries
- **FOLLOW:** Use `redirect()` for navigation after successful mutations
- **FOLLOW:** Call `revalidatePath` or `revalidateTag` after data mutations
- **FOLLOW:** Implement proper authentication checks in Server Actions
- **AVOID:** Exposing sensitive operations without proper validation
- **AVOID:** Returning sensitive data from Server Actions
- **AVOID:** Complex business logic without proper error handling

## **Error Handling & Validation**

### **13. Error Management**

- **FOLLOW:** Use Zod for runtime validation in Server Actions and API endpoints
- **FOLLOW:** Implement error boundaries with error.tsx files for each route segment
- **FOLLOW:** Use Next.js 15's `forbidden.tsx` and `unauthorized.tsx` for auth errors
- **FOLLOW:** Log errors to monitoring service with proper context
- **FOLLOW:** Show user-friendly error messages with actionable feedback
- **FOLLOW:** Use `unstable_rethrow` for proper error propagation in Server Components
- **FOLLOW:** Implement proper error types and result patterns for Server Actions
- **FOLLOW:** Use Result/Either patterns for comprehensive error handling
- **FOLLOW:** Implement anti-CSRF tokens with every state-changing request
- **AVOID:** Exposing internal error details to users
- **AVOID:** Silent failures without proper error tracking
- **AVOID:** Generic error messages without context

### **14. Form Validation & Data Mutation**

- **FOLLOW:** Validate on both client and server with consistent schemas
- **FOLLOW:** Use progressive enhancement with proper fallbacks
- **FOLLOW:** Implement Server Actions with comprehensive input validation
- **FOLLOW:** Use `useActionState` (formerly `useFormState`) for form state management
- **FOLLOW:** Provide immediate feedback for user actions
- **FOLLOW:** Handle network failures gracefully with retry mechanisms
- **AVOID:** Client-only validation for critical data
- **AVOID:** Server Actions without proper input sanitization
- **AVOID:** Form submissions without loading states or feedback

## **Development Workflow**

### **15. Code Quality**

- **FOLLOW:** Implement pre-commit hooks with Husky for automated checks
- **FOLLOW:** Use ESLint with Next.js 15 recommended and strict TypeScript rules
- **FOLLOW:** Format with Prettier consistently across the team
- **FOLLOW:** Implement proper type checking in CI/CD pipeline
- **FOLLOW:** Run TypeScript compiler check before every commit
- **FOLLOW:** Ensure zero TypeScript errors in all builds and deployments
- **AVOID:** Committing code without running type checker and linters
- **AVOID:** Large, unfocused commits without proper descriptions
- **AVOID:** Commented-out code in production
- **AVOID:** Adding any testing frameworks, testing libraries, or testing tools
- **AVOID:** Writing unit tests, integration tests, or end-to-end tests
- **AVOID:** Committing code with ANY TypeScript errors or warnings
- **AVOID:** Deploying applications with unresolved type issues

### **15.1. Import Patterns & Path Aliases (MANDATORY)**

- **FOLLOW:** Configure and maintain comprehensive path aliases in `tsconfig.json` for consistent imports
- **FOLLOW:** Use `@/components/*` for all UI component imports
- **FOLLOW:** Use `@/lib/*` for all library and utility imports
- **FOLLOW:** Use `@/types/*` for all type definition imports
- **FOLLOW:** Use `@/hooks/*` for all custom hook imports
- **FOLLOW:** Use `@/services/*` for all business service imports
- **FOLLOW:** Use `@/utils/*` for all utility function imports
- **FOLLOW:** Use `@/auth/*` for all authentication-related imports
- **FOLLOW:** Use `@/database/*` for all database-related imports
- **FOLLOW:** Use `@/infrastructure/*` for all infrastructure-related imports
- **FOLLOW:** Use `@/app/*` for all app-specific imports
- **FOLLOW:** Use relative imports (`./` or `../`) ONLY for imports within the same directory or simple parent-child relationships
- **FOLLOW:** Update all import statements immediately when moving files to maintain path alias consistency
- **FOLLOW:** Ensure all path aliases point to valid, existing directories
- **AVOID:** Using relative imports (`../../../`) for cross-directory imports
- **AVOID:** Creating deep relative import chains that are hard to maintain
- **AVOID:** Mixing path aliases and relative imports inconsistently
- **AVOID:** Using relative imports when path aliases are available
- **AVOID:** Creating new files without updating import statements to use appropriate path aliases
- **AVOID:** Using relative imports for components that should use `@/components/*` aliases

### **16. File Organization & Naming**

- **FOLLOW:** Use consistent naming conventions across the codebase
- **FOLLOW:** Fix all existing naming inconsistencies systematically
- **FOLLOW:** Use kebab-case for ALL file and directory names
- **FOLLOW:** Use camelCase for variables, functions, and component props
- **FOLLOW:** Use PascalCase for React components and TypeScript interfaces/types
- **FOLLOW:** Organize by feature/domain rather than by technical concern
- **FOLLOW:** Use proper file extensions: .tsx for React, .ts for utilities
- **AVOID:** Introducing new naming inconsistencies
- **AVOID:** Mixing naming conventions within the same context
- **AVOID:** Overly long or unnecessarily descriptive file names

## **Security Best Practices**

### **17. Security Rules**

- **FOLLOW:** Sanitize all user inputs in Server Actions with proper validation
- **FOLLOW:** Use CSRF protection with proper origin validation
- **FOLLOW:** Implement rate limiting at multiple levels (middleware, API, database)
- **FOLLOW:** Keep dependencies updated with automated security scanning
- **FOLLOW:** Use Content Security Policy (CSP) headers appropriately
- **FOLLOW:** Validate and sanitize data before database operations
- **FOLLOW:** Use proper authentication patterns with `supabase.auth.getUser()`
- **FOLLOW:** Implement proper session management with secure cookies
- **FOLLOW:** Use React Taint APIs to prevent accidental exposure of private data
- **FOLLOW:** Always run Next.js in production mode for production workloads
- **FOLLOW:** Conduct regular penetration testing and vulnerability scanning
- **FOLLOW:** Implement multi-factor authentication for sensitive operations
- **AVOID:** Storing sensitive data in localStorage or client-side storage
- **AVOID:** Trusting client-side validation alone
- **AVOID:** Exposing API keys, secrets, or service role keys
- **AVOID:** Using `eval()` or similar dynamic code execution
- **AVOID:** Running development mode in production (lacks security optimizations)

### **18. RLS Policy Security Patterns**

- **FOLLOW:** Create comprehensive RLS policies for all CRUD operations
- **FOLLOW:** Review RLS policies thoroughly with different user roles
- **FOLLOW:** Use `raw_app_meta_data` for authorization data (cannot be modified by users)
- **FOLLOW:** Never use `raw_app_meta_data` in RLS policies - it can be modified by authenticated users
- **FOLLOW:** Implement proper role-based access control (RBAC) patterns
- **FOLLOW:** Use MFA verification in sensitive RLS policies when needed
- **FOLLOW:** Audit RLS policies regularly for security gaps
- **FOLLOW:** Use views with `security_invoker = true` in Postgres 15+ for RLS compliance
- **FOLLOW:** Wrap views in proper RLS policies or put in unexposed schemas
- **FOLLOW:** Use assert statements for value checking in database functions
- **FOLLOW:** Implement proper error handling with raise exception in database functions
- **FOLLOW:** Create triggers for automated data validation and logging
- **AVOID:** Bypassing RLS without proper security review
- **AVOID:** Using user-modifiable data (`raw_app_meta_data`) in security-critical policies
- **AVOID:** Creating overly permissive policies without proper justification
- **AVOID:** Creating views without considering RLS bypass (use security_invoker)
- **AVOID:** Database functions without proper input validation and error handling

## **Advanced Security Patterns**

### **49. Data Transfer Objects (DTOs) Pattern**

- **FOLLOW:** Return only necessary data fields from DAL functions, not entire database objects
- **FOLLOW:** Create DTOs to expose safe-to-transfer objects for the client
- **FOLLOW:** Strip sensitive fields like passwords, phone numbers, and internal IDs before returning data
- **FOLLOW:** Define explicit DTO types for all data returned from the DAL
- **FOLLOW:** Use TypeScript's `Pick`, `Omit`, and `Partial` utilities to create DTOs from database types
- **AVOID:** Returning entire user objects that might contain passwords or sensitive data
- **AVOID:** Exposing internal database structure through API responses
- **AVOID:** Passing complete database records between layers

### **50. Proximity Principle for Security**

- **FOLLOW:** Keep authentication checks as close as possible to where sensitive data is accessed
- **FOLLOW:** Implement auth checks directly in DAL functions, not just in components
- **FOLLOW:** Verify permissions at the data layer, not the presentation layer
- **FOLLOW:** Re-verify authentication for each data operation, not once per request
- **FOLLOW:** Place authorization logic where the data is fetched, not where it's displayed
- **AVOID:** Relying on distant authentication checks (e.g., only in middleware or layouts)
- **AVOID:** Assuming authentication state persists across function calls
- **AVOID:** Separating authorization logic from data access logic

### **51. Enhanced RLS Performance Patterns**

- **FOLLOW:** Use initPlan optimization by wrapping functions in SELECT: `(select auth.uid())`
- **FOLLOW:** Create indexes on all columns used in RLS policies for 100x+ performance gains
- **FOLLOW:** Reorganize queries to get values into arrays first, then use IN/ANY operations
- **FOLLOW:** Use `raw_app_meta_data` instead of `raw_app_meta_data` for authorization data
- **FOLLOW:** Cache function results that don't change based on row data using wrapped SELECTs
- **FOLLOW:** Monitor RLS policy performance using EXPLAIN ANALYZE
- **AVOID:** Using `raw_app_meta_data` in RLS policies (can be modified by users)
- **AVOID:** Complex joins in RLS policies without proper optimization
- **AVOID:** Calling functions on each row without initPlan optimization

## **Database Functions & Triggers**

### **19. Database Function Best Practices**

- **FOLLOW:** Use database functions for data-intensive operations close to the data
- **FOLLOW:** Prefer `security invoker` functions by default for proper RLS enforcement
- **FOLLOW:** Use `security definer` functions only when necessary with empty search_path
- **FOLLOW:** Create functions with proper parameter validation and error handling
- **FOLLOW:** Use `raise log/warning/exception` for proper debugging and error messages
- **FOLLOW:** Implement proper error handling with exception blocks when needed
- **FOLLOW:** Use `assert` statements for quick value validation in functions
- **FOLLOW:** Call database functions using the RPC API for better performance
- **FOLLOW:** Create logging functions for debugging with proper severity levels
- **AVOID:** Creating functions without proper security considerations
- **AVOID:** Using functions for simple operations that can be done with queries
- **AVOID:** Exposing sensitive functions to public schema without proper access control
- **AVOID:** Database functions without proper input sanitization

### **20. Triggers & Webhooks**

- **FOLLOW:** Use database triggers for automatic data validation and logging
- **FOLLOW:** Create webhooks using pg_net extension for external system integration
- **FOLLOW:** Use BEFORE triggers for data validation, AFTER triggers for side effects
- **FOLLOW:** Implement proper trigger function error handling and logging
- **FOLLOW:** Use webhooks for asynchronous operations to FIX blocking database
- **FOLLOW:** Monitor webhook execution using the `net` schema logs
- **FOLLOW:** Use `host.docker.internal` for local webhook development
- **AVOID:** Creating triggers that significantly impact database performance
- **AVOID:** Using triggers for complex business logic (use Server Actions instead)
- **AVOID:** Webhook URLs pointing to localhost in production
- **AVOID:** Triggering webhooks without proper error handling and retry logic

## **Storage & File Management**

### **21. Supabase Storage Best Practices**

- **FOLLOW:** Use standard uploads for files under 6MB, resumable uploads for larger files
- **FOLLOW:** Set proper `contentType` during upload for better CDN caching
- **FOLLOW:** Use public buckets for better CDN cache hit rates when possible
- **FOLLOW:** Implement proper RLS policies on storage.objects table
- **FOLLOW:** Use image transformations for responsive images and optimization
- **FOLLOW:** Leverage CDN caching by FIXing file overwrites (use new paths instead)
- **FOLLOW:** Set proper cache control headers for optimal CDN performance
- **FOLLOW:** Use unique file names/paths to FIX cache invalidation issues
- **FOLLOW:** Implement proper file size limits and type validation
- **AVOID:** Overwriting files frequently due to CDN propagation delays
- **AVOID:** Using private buckets unnecessarily (impacts CDN cache efficiency)
- **AVOID:** Large file uploads without progress indicators and error handling
- **AVOID:** File uploads without proper virus scanning and content validation

### **22. Edge Functions Integration**

- **FOLLOW:** Use Edge Functions for low-latency operations and external API integrations
- **FOLLOW:** Leverage Edge Functions for webhook processing and third-party integrations
- **FOLLOW:** Use database functions for data-intensive operations, Edge Functions for I/O
- **FOLLOW:** Implement proper CORS headers when invoking from browser
- **FOLLOW:** Use Edge Functions for image processing and file transformations
- **FOLLOW:** Integrate with Supabase Auth properly in Edge Functions
- **FOLLOW:** Use proper environment variable management for secrets
- **AVOID:** Using Edge Functions for simple database operations
- **AVOID:** Complex business logic in Edge Functions without proper error handling
- **AVOID:** Edge Functions without proper monitoring and logging

## **Data Access Layer & Security Patterns**

### **41. Data Access Layer (DAL) Architecture (CRITICAL UPDATE 2025)**

- **FOLLOW:** Data Access Layer is now the PRIMARY recommended approach for authentication (middleware is no longer safe)
- **FOLLOW:** Implement an isolated Data Access Layer (DAL) for all database operations and authentication
- **FOLLOW:** Create a `verifySession()` function in your DAL that validates authentication for every data request
- **FOLLOW:** Use React's `cache()` API to memoize session verification during a render pass
- **FOLLOW:** Keep database packages and environment variables isolated within the DAL
- **FOLLOW:** Never import database packages or environment variables outside the DAL
- **FOLLOW:** Use the DAL pattern for new projects (mandatory for secure authentication post-CVE-2025-29927)
- **FOLLOW:** Implement proper authentication checks within the DAL using `supabase.auth.getUser()`
- **FOLLOW:** Apply the Proximity Principle - keep auth checks as close as possible to data access
- **FOLLOW:** Return Data Transfer Objects (DTOs) with only necessary fields, not entire database objects
- **FOLLOW:** Compare session ID with database for secure checks, using React's cache to FIX duplicates
- **FOLLOW:** Validate user authorization at the data access level, not just at the component level
- **AVOID:** Using middleware as the primary authentication mechanism (vulnerable to CVE-2025-29927)
- **AVOID:** Mixing different data handling approaches (HTTP APIs, DAL, Component Level) in the same project
- **AVOID:** Performing authentication checks only in layouts that don't re-render on navigation
- **AVOID:** Returning entire user objects that might contain sensitive data like passwords
- **AVOID:** Returning `null` in layouts for unauthorized users (doesn't prevent nested route access)

### **42. Partial Prerendering (PPR) & Layout Security**

- **FOLLOW:** Be cautious with authentication checks in layouts due to Partial Prerendering
- **FOLLOW:** Fetch user data in layouts but perform actual auth checks in the DAL (proximity principle)
- **FOLLOW:** Perform auth checks close to data sources or conditionally rendered components
- **FOLLOW:** Use `getUser()` in layouts but implement actual auth checks in the DAL
- **FOLLOW:** Implement proper Suspense boundaries for dynamic content that requires auth
- **FOLLOW:** Use `cache()` for user data fetching to prevent redundant auth calls
- **FOLLOW:** For static routes, use middleware to protect routes (since data is fetched at build time)
- **AVOID:** Relying on layout-level auth checks to prevent access to nested route segments
- **AVOID:** Using `return null` pattern in layouts for unauthorized users
- **AVOID:** Performing heavy auth operations in layouts that don't re-render on navigation
- **AVOID:** Forgetting that static routes share data between users (fetched at build time)

### **43. Enhanced Input Validation & Security**

- **FOLLOW:** Always validate client input from forms, URL parameters, headers, and searchParams
- **FOLLOW:** Never trust client-side data for authorization decisions
- **FOLLOW:** Re-verify authentication on every request, not just once per session
- **FOLLOW:** Re-read access control and cookies() whenever reading data - don't pass as props or params
- **FOLLOW:** Validate dynamic route parameters (`/[param]/`) as they are user input
- **FOLLOW:** Implement proper input sanitization using libraries like DOMPurify for HTML content
- **FOLLOW:** Use Zod schemas for comprehensive input validation in Server Actions
- **FOLLOW:** Validate and sanitize all data before database operations
- **FOLLOW:** Use React Taint APIs (`experimental_taintObjectReference`, `experimental_taintUniqueValue`) to prevent accidental data exposure
- **FOLLOW:** SearchParams should never be used for authorization (e.g., never trust `?isAdmin=true`)
- **AVOID:** Using client-provided data directly for security decisions
- **AVOID:** Trusting searchParams, headers, or URL parameters without validation
- **AVOID:** Performing authorization checks based on unvalidated client input
- **AVOID:** Passing authorization data through props or params instead of re-verifying

### **44. Server Actions Security & Validation**

- **FOLLOW:** Server Actions now have unguessable endpoints and automatic removal of unused actions (Next.js 15)
- **FOLLOW:** Validate all Server Action arguments using Zod or similar validation libraries
- **FOLLOW:** Re-authorize users inside every Server Action as they are entry points to your application
- **FOLLOW:** Always authenticate in Server Actions before performing any operations
- **FOLLOW:** Implement proper error handling with custom error types for Server Actions
- **FOLLOW:** Use `revalidatePath` and `revalidateTag` after successful mutations
- **FOLLOW:** Implement proper CSRF protection for all Server Actions
- **FOLLOW:** Validate user permissions before performing any database operations
- **FOLLOW:** Use proper error boundaries and user-friendly error messages
- **FOLLOW:** Use `unstable_rethrow` for proper error propagation in Server Components
- **AVOID:** Exposing sensitive operations without proper input validation
- **AVOID:** Returning sensitive data from Server Actions
- **AVOID:** Performing authorization checks only at the component level
- **AVOID:** Trusting that Server Actions are secure without explicit authentication

### **45. Middleware & Route Security (CRITICAL UPDATE 2025)**

- **FOLLOW:** Middleware is NO LONGER safe for authentication (CVE-2025-29927)
- **FOLLOW:** Use middleware ONLY for session updates with `updateSession`, not for authorization
- **FOLLOW:** Use middleware to protect static routes (since static data is fetched at build time)
- **FOLLOW:** Implement all authentication checks in the Data Access Layer instead of middleware
- **FOLLOW:** Audit middleware.ts and route.ts files thoroughly as they have significant power
- **FOLLOW:** Implement proper tenant resolution in middleware for multi-tenant applications
- **FOLLOW:** Validate all dynamic route parameters in middleware when possible
- **FOLLOW:** Implement proper rate limiting at the middleware level
- **FOLLOW:** Use Content Security Policy (CSP) headers with proper nonces for scripts
- **FOLLOW:** Perform regular penetration testing and vulnerability scanning
- **AVOID:** Using middleware as primary authentication mechanism (use DAL instead)
- **AVOID:** Creating overly permissive middleware rules
- **AVOID:** Relying on middleware for authorization checks (vulnerable to CVE-2025-29927)
- **AVOID:** Exposing sensitive information in middleware error responses

### **46. Component Props & Type Safety**

- **FOLLOW:** Ensure Component props don't expect private or sensitive data
- **FOLLOW:** Use narrow, specific type signatures for component props
- **FOLLOW:** Implement proper prop validation for all client components
- **FOLLOW:** Use discriminated unions for complex state management in components
- **FOLLOW:** Implement proper error boundaries for all route segments
- **AVOID:** Using overly broad type signatures that could accept sensitive data
- **AVOID:** Passing sensitive data through component props
- **AVOID:** Creating components that expect private user data as props

### **47. Environment & Configuration Security**

- **FOLLOW:** Validate environment configuration at startup using Zod schemas
- **FOLLOW:** Use proper environment variable prefixes (`NEXT_PUBLIC_` for client, none for server)
- **FOLLOW:** Document all required environment variables in `.env.example`
- **FOLLOW:** Implement proper secret management for production deployments
- **FOLLOW:** Use runtime configuration validation for critical environment variables
- **AVOID:** Exposing server secrets to the client through `NEXT_PUBLIC_` prefix
- **AVOID:** Hardcoding configuration values in the application code
- **AVOID:** Accessing non-public environment variables in client components

### **48. Performance & Security Balance**

- **FOLLOW:** Implement proper caching strategies while maintaining security
- **FOLLOW:** Use `unstable_cache` for server-side caching when needed
- **FOLLOW:** Implement proper cache invalidation strategies
- **FOLLOW:** Use React Suspense boundaries for loading states
- **FOLLOW:** Implement proper error boundaries for all route segments
- **AVOID:** Caching sensitive or user-specific data inappropriately
- **AVOID:** Sacrificing security for performance optimizations
- **AVOID:** Using client-side caching for sensitive authentication data

## **Asset Management & Naming**

### **23. Images, Fonts, and Scripts**

- **FOLLOW:** Use Next.js `Image` with explicit `width`, `height`, and `sizes`; prefer `webp`/`avif` formats.
- **FOLLOW:** Define `remotePatterns` in Next config for any external images; FIX wildcards and keep the allowlist minimal.
- **FOLLOW:** Use `next/font/local` or `next/font/google` with subsets; self-host fonts where possible. FIX `<link>` to third-party font CDNs in production.
- **FOLLOW:** Load scripts with `next/script` and the correct `strategy` (`afterInteractive`, `lazyOnload`, `beforeInteractive` only when strictly necessary).
- **FOLLOW:** Attach CSP nonces to `next/script` and any inline scripts where unFIXable. Prefer external files over inline scripts.
- **FOLLOW:** Provide descriptive `alt` text for images; mark decorative images with empty `alt` and `aria-hidden` as appropriate.
- **AVOID:** Client-heavy carousels without deferring or virtualization; prefer light-weight solutions and intersection observers.
- **AVOID:** Unbounded third-party scripts; each script must have an owner, purpose, and removal plan.

## **Metadata & SEO**

### **24. Metadata & Structured Data**

- **FOLLOW:** Use `generateMetadata` at route-level; set `metadataBase` in the root layout.
- **FOLLOW:** Provide `openGraph`, `twitter`, `alternates.canonical`, and `robots` configs where applicable.
- **FOLLOW:** Add JSON-LD via `<script type="application/ld+json">` using a CSP nonce; keep payload minimal and accurate.
- **FOLLOW:** Use the `viewport` export or `generateViewport` for device scaling and `theme-color`.
- **AVOID:** Hard-coding meta tags in page bodies; rely on the Metadata API.

## **Accessibility (A11y)**

### **25. Accessibility Standards**

- **FOLLOW:** Meet WCAG 2.1 AA; ensure color contrast and robust focus styles (`:focus-visible`).
- **FOLLOW:** Use semantic HTML; pair form inputs with labels; only use `aria-*` when necessary.
- **FOLLOW:** Ensure keyboard accessibility for all interactive elements and visible focus rings.
- **FOLLOW:** Provide skip links and a logical heading hierarchy per route segment.
- **FOLLOW:** Use `aria-live` for async UI feedback (toasts, form errors, optimistic updates).
- **AVOID:** Non-semantic interactive elements (`div` as buttons/links) and tabindex hacks.

## **Environment & Secrets**

### **26. Environment Variables**

- **FOLLOW:** Prefix public variables with `NEXT_PUBLIC_`; never expose server secrets to the client.
- **FOLLOW:** Validate env config at startup using a Zod schema in server-only modules.
- **FOLLOW:** Document required variables in `.env.example`; do not commit real secrets.
- **FOLLOW:** Access `process.env` only in server code; FIX bundling secrets into client components.
- **AVOID:** Access to non-`NEXT_PUBLIC_` env in client components or shared client bundles.

## **Security Headers & CSP**

### **27. HTTP Security**

- **FOLLOW:** Enforce CSP with nonces for scripts and strict `default-src 'self'`. Keep allowlists tight (match `src/server/security/headers.ts`).
- **FOLLOW:** In production, do not allow `'unsafe-inline'` or `'unsafe-eval'` in `script-src`; use nonces for any required inline scripts. Allow `'unsafe-eval'` only in development for HMR.
- **FOLLOW:** Include HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and remove server identification headers.
- **FOLLOW:** Sanitize any HTML before `dangerouslySetInnerHTML` using server-side DOMPurify.
- **FOLLOW:** Use `updateSession` in middleware for Supabase SSR auth; validate users server-side via `supabase.auth.getUser()`.
- **AVOID:** Inline event handlers and string-to-HTML conversions; FIX `supabase.auth.getSession()` in Server Components.

## **Observability & Logging**

### **28. Monitoring & Debugging**

- **FOLLOW:** Implement structured logging with proper context and severity levels
- **FOLLOW:** Use database logging functions with `raise log/warning/exception`
- **FOLLOW:** Monitor webhook execution using the `net` schema logs in Supabase
- **FOLLOW:** Track Server Action performance and error rates
- **FOLLOW:** Implement proper error tracking with services like Sentry or LogRocket
- **FOLLOW:** Use React DevTools Profiler for performance monitoring in development
- **AVOID:** Console logging sensitive information in production
- **AVOID:** Excessive logging that impacts performance

## **Performance Budgets & Bundle Hygiene**

### **29. Bundling**

- **FOLLOW:** Use dynamic imports for heavy client components and charts; split by route/feature.
- **FOLLOW:** Keep client bundles small; target < 150KB gzip per route. Periodically run bundle analysis (`ANALYZE=true`).
- **FOLLOW:** Remove unused dependencies promptly; FIX re-exporting large server utilities to client bundles.

## **Build & Deployment**

### **30. Turbopack & Tooling**

- **FOLLOW:** Use Turbopack Dev (now stable in Next.js 15) for improved performance.
- **FOLLOW:** Use Turbopack for dev and build (`next dev --turbo`, `next build --turbo`).
- **FOLLOW:** Run `npm run validate` (type-check, lint, format) before production builds.
- **FOLLOW:** Use npm only for dependency management.
- **FOLLOW:** Leverage HMR improvements that reuse fetch responses from previous renders.
- **AVOID:** Adding `swcMinify` to Next config (not permitted).
- **AVOID:** Webpack-specific plugins/configuration; the project uses Turbopack.

## **2025 Critical Updates Summary**

### **52. Major Security Changes**

- **FOLLOW:** Middleware is no longer safe for authentication (CVE-2025-29927)
- **FOLLOW:** Data Access Layer (DAL) is now the mandatory approach for authentication
- **FOLLOW:** Always use `raw_app_meta_data` instead of `raw_app_meta_data` in RLS policies
- **FOLLOW:** SearchParams must never be used for authorization decisions
- **FOLLOW:** Implement the Proximity Principle - auth checks closest to data access
- **FOLLOW:** Use Data Transfer Objects (DTOs) to prevent data leakage
- **FOLLOW:** React 19 RC is now used in App Router (stable with Next.js 15)
- **FOLLOW:** @supabase/ssr replaces deprecated auth-helpers

### **53. Performance & Developer Experience Updates**

- **FOLLOW:** Turbopack Dev is now stable - use for all development
- **FOLLOW:** Server Actions have unguessable endpoints and automatic tree-shaking
- **FOLLOW:** Partial Prerendering (PPR) is now stable
- **FOLLOW:** Enhanced forms (next/form) provide better client-side navigation
- **FOLLOW:** HMR now reuses fetch responses from previous renders
- **FOLLOW:** Use initPlan optimization for 100x+ RLS performance gains
- **FOLLOW:** React Taint APIs prevent accidental data exposure
- **FOLLOW:** Always run production mode for production workloads

## **Third-Party & Analytics**

### **31. External Integrations**

- **FOLLOW:** For each third-party script/integration, document the owner, purpose, data captured, and removal criteria.
- **FOLLOW:** Load third-party scripts via `next/script` with CSP nonces; defer or lazy-load when possible.
- **AVOID:** Adding analytics/AB testing or any testing frameworks.

## **Multi-Tenancy & RLS Context**

### **32. Tenant Isolation**

- **FOLLOW:** Resolve tenant in middleware; set RLS context per request before data access.
- **FOLLOW:** Propagate tenant headers (`x-tenant-id`, `x-tenant-slug`, `x-tenant-status`) downstream as needed.services`.
- **AVOID:** Cross-tenant data leakage via caches; disable client segment cache when necessary.

## **Runtime Selection**

### **33. Edge vs Node**

- **FOLLOW:** Default to Node.js runtime; opt-in to Edge only for latency-sensitive I/O without Node APIs.
- **FOLLOW:** Explicitly declare `export const runtime = 'edge' | 'nodejs'` when deviating from defaults.
- **AVOID:** Using Node-only dependencies in Edge runtime code paths.

### **35. Testing Prohibition**

- **AVOID:** Adding any testing frameworks, testing libraries, or testing tools to the project.
- **AVOID:** Writing unit tests, integration tests, or end-to-end tests.
- **AVOID:** Using Jest, Vitest, React Testing Library, or any other testing utilities.
- **AVOID:** Setting up test databases or test environments.
- **AVOID:** Creating test files, test configurations, or test-related dependencies.
- **FOLLOW:** Focus on production-ready code without testing overhead.
- **FOLLOW:** Use manual testing and code review for quality assurance.

### **36. Data Authenticity & Supabase Integration (CRITICAL)**

- **FOLLOW:** NEVER use mock data, fake data, or hardcoded sample data anywhere in the application
- **FOLLOW:** ALL data MUST come from Supabase database or external APIs - no exceptions
- **FOLLOW:** Remove any existing mock data, fake data, or hardcoded sample data immediately
- **FOLLOW:** Use real Supabase data for all development, testing, and production scenarios
- **FOLLOW:** Create proper database schemas and seed data in Supabase for development
- **FOLLOW:** Use Supabase's built-in data management tools for creating test data
- **FOLLOW:** Implement proper data seeding scripts that populate Supabase with realistic data
- **FOLLOW:** Use Supabase's Row Level Security (RLS) policies for data access control
- **FOLLOW:** Create proper database functions and triggers for data validation and business logic
- **FOLLOW:** Use Supabase's real-time features for live data updates
- **FOLLOW:** Implement proper error handling for when Supabase data is unavailable
- **AVOID:** Creating mock data arrays or objects in components
- **AVOID:** Using hardcoded sample data for development or demonstration
- **AVOID:** Creating fake user data, fake service data, or fake business data
- **AVOID:** Using placeholder data that doesn't come from the database
- **AVOID:** Creating data mocks in test files or development utilities
- **AVOID:** Using static JSON files with fake data
- **AVOID:** Creating mock API responses or fake database results
- **AVOID:** Using any data that doesn't originate from Supabase or external APIs

## **Project-Specific Enforcements**

### **37. Conventions & Restrictions**

- **FOLLOW:** Use ONLY shadcn/ui components for all UI elements; do not create custom UI components.
- **FOLLOW:** Keep shadcn default UI components unchanged; do not modify files in `src/components/ui`.
- **FOLLOW:** Tailwind v4 is in use; do not add a `tailwind.config.ts`.
- **FOLLOW:** Use component-level styles and CSS variables. Do not modify `src/app/globals.css`.
- **FOLLOW:** Use npm only; do not use yarn or pnpm for dependency management.
- **AVOID:** Page transitions/route transition animations across pages.
- **AVOID:** Shadow/scale hover effects and grid background patterns; separate cards with simple lines and borders.
- **AVOID:** Adding `swcMinify` to `next.config.ts`.
- **AVOID:** Creating custom buttons, inputs, cards, or any other UI components outside of shadcn/ui.
- **AVOID:** Using custom CSS classes or custom styling approaches.

## **Project Structure & Organization**

### **38. File Organization & Structure**

- **FOLLOW:** Keep files under 200 lines for maintainability; break down large files into smaller, modular components.
- **FOLLOW:** Use kebab-case for ALL file and directory names consistently throughout the project.
- **FOLLOW:** Organize by feature/domain rather than by technical concern.
- **FOLLOW:** Create logical subgroupings when folder limits are exceeded.
- **FOLLOW:** Use proper file extensions: .tsx for React components, .ts for utilities and types.
- **FOLLOW:** Ensure logical separation of concerns between folders.
- **FOLLOW:** Group related files into cohesive modules.
- **AVOID:** Mixing naming conventions within the same context.
- **AVOID:** Overly long or unnecessarily descriptive file names.


### **40. Duplicate File Management & Consolidation**

- **FOLLOW:** Remove all duplicate files and consolidate redundant code patterns by merging similar functionality.
- **FOLLOW:** Identify files with duplicate functionality and keep only the best version.
- **FOLLOW:** Delete redundant copies after consolidating functionality into single files.
- **FOLLOW:** Modify existing files to include merged functionality rather than creating new files.
- **FOLLOW:** Ensure every file operation results in a cleaner project structure.
- **AVOID:** Creating duplicate files with suffixes like "refactored", "new", "updated", "v2", "fixed".
- **AVOID:** Creating backup copies with prefixes like "old*", "backup*", "original\_".
- **AVOID:** Maintaining multiple versions of the same functionality across different files.

### **41. Folder Structure & Naming Consistency**

- **FOLLOW:** Fix all inconsistent naming conventions throughout the project to use kebab-case.
- **FOLLOW:** Standardize naming conventions across all directories and files.
- **FOLLOW:** Create proper groupings with logical folder hierarchies.
- **FOLLOW:** Fix inconsistent folder structures and ensure logical organization.
- **FOLLOW:** Remove all empty folders and directories that serve no purpose after file reorganization.
- **FOLLOW:** Use descriptive, clean names without version indicators or temporary suffixes.
- **AVOID:** Using any naming convention other than kebab-case for files/directories.
- **AVOID:** Introducing new naming inconsistencies during reorganization.
- **AVOID:** Creating temporary or versioned folder names during file operations.

