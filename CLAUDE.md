# Claude Code Instructions

## 🚀 Project Context

This project uses automated tools to help Claude Code understand the codebase structure. 

### Automatic Setup

When you start a new conversation with Claude Code:
1. A hook automatically generates `PROJECT_TREE.md` with current project statistics
2. Claude should **ALWAYS** read `PROJECT_TREE.md` first to understand the project structure

### Key Files to Check

1. **PROJECT_TREE.md** - Contains:
   - Total file and line counts
   - File distribution by extension
   - Largest files in the project
   - Complete directory tree with statistics
   - Generated fresh at the start of each conversation

2. **package.json** - Contains all npm scripts and dependencies

3. **docs/architecture/** - Contains:
   - `rules.md` - Project rules and conventions

### Important Commands

```bash
# Generate project tree manually
python3 generate_project_tree.py

# Run auto-commit watcher (also generates tree)
./scripts/auto-commit.sh

# Type checking - MUST run before committing
npm run typecheck

# Linting - MUST run and fix all errors before committing
npm run lint
npm run lint -- --fix  # Auto-fix when possible

# Development server
npm run dev

# Build
npm run build
```

## 🎯 CRITICAL RULES TO FOLLOW

### 1. File Organization (MANDATORY)
- **CRITICAL:** ALL files MUST be moved to their appropriate locations immediately when identified as misplaced
- **CRITICAL:** Never leave files in incorrect or temporary locations
- **FOLLOW:** Use feature-based directories matching functionality and purpose
- **FOLLOW:** Update ALL import statements immediately after moving any file

### 2. TypeScript & ESLint (ZERO TOLERANCE)
- **CRITICAL:** Fix ALL TypeScript errors before committing - zero tolerance policy
- **CRITICAL:** Fix ALL ESLint errors before committing - zero tolerance policy  
- **CRITICAL:** Run `npm run typecheck` and `npm run lint` before EVERY commit
- **CRITICAL:** NEVER create bulk error fix scripts - these can break the project
- **AVOID:** Using `any` type under any circumstances
- **AVOID:** Using @ts-ignore, @ts-expect-error, or @ts-nocheck
- **AVOID:** Committing code with TypeScript or ESLint errors

### 3. Import Patterns (MANDATORY)
- **CRITICAL:** Use `@` path aliases for ALL cross-directory imports
- **FOLLOW:** Use `@/components/*` for all UI component imports
- **FOLLOW:** Use `@/lib/*` for all library and utility imports
- **FOLLOW:** Use `@/types/*` for all type definition imports
- **FOLLOW:** Use relative imports (`./` or `../`) ONLY within same directory
- **AVOID:** Using deep relative imports (`../../../`) for cross-directory imports

### 4. Server-First Architecture
- **FOLLOW:** Default to Server Components for all pages and layouts
- **FOLLOW:** Use Server Actions for mutations instead of API routes
- **FOLLOW:** Push client components as deep in the tree as possible
- **AVOID:** Using "use client" directive unless absolutely necessary
- **AVOID:** Making client-side API calls when server-side fetching is possible

### 5. Supabase & Security
- **CRITICAL:** Data Access Layer (DAL) is now MANDATORY for authentication (not middleware)
- **CRITICAL:** Never use `user_metadata` in RLS policies - use `raw_app_meta_data` instead
- **FOLLOW:** Always use Row Level Security (RLS) policies
- **FOLLOW:** Validate authentication on every server request using `supabase.auth.getUser()`
- **FOLLOW:** Use `@supabase/ssr` package (auth-helpers are deprecated)
- **AVOID:** Trusting `supabase.auth.getSession()` in Server Components
- **AVOID:** Using middleware as primary authentication mechanism (CVE-2025-29927)

### 6. UI Components (STRICT)
- **FOLLOW:** Use ONLY shadcn/ui components for ALL UI elements
- **FOLLOW:** Never create custom UI components or custom styling
- **FOLLOW:** Use shadcn as the ONLY styling solution
- **AVOID:** Creating custom buttons, cards, inputs, or any other UI elements
- **AVOID:** Modifying shadcn components directly
- **AVOID:** Custom CSS classes or styling approaches

### 7. Data Authenticity (CRITICAL)
- **CRITICAL:** NEVER use mock data, fake data, or hardcoded sample data
- **CRITICAL:** ALL data MUST come from Supabase database or external APIs
- **FOLLOW:** Remove any existing mock data immediately
- **AVOID:** Creating mock data arrays or objects in components
- **AVOID:** Using placeholder data that doesn't come from the database

### 8. Code Quality Standards
- **FOLLOW:** Keep files under 500 lines for maintainability
- **FOLLOW:** Use kebab-case for ALL file and directory names
- **FOLLOW:** Use PascalCase for React components and TypeScript interfaces
- **FOLLOW:** Use camelCase for variables, functions, and props
- **FOLLOW:** Remove all unused imports, variables, and parameters
- **AVOID:** Creating duplicate files with suffixes like "v2", "new", "updated"

### 9. Performance & Caching
- **FOLLOW:** Use static generation with `generateStaticParams` where possible
- **FOLLOW:** Implement Partial Prerendering (PPR) with `ppr: true`
- **FOLLOW:** Use Next.js Image component with proper optimization
- **FOLLOW:** Stream responses using Suspense and loading.tsx
- **AVOID:** Large JavaScript bundles in client components

### 10. Testing Prohibition
- **AVOID:** Adding ANY testing frameworks, libraries, or tools
- **AVOID:** Writing unit tests, integration tests, or e2e tests
- **AVOID:** Creating test files or test configurations

## Project Structure Overview

- **src/** - Main source code
  - **components/** - React components (shadcn/ui only)
  - **lib/** - Utilities and data access layer
  - **types/** - TypeScript type definitions  
  - **app/** - Next.js app router pages

- **docs/** - Documentation and architecture rules
- **public/** - Static assets
- **scripts/** - Build and utility scripts

## Working with This Project

1. **Always start by reading PROJECT_TREE.md** to get current statistics
2. **Check existing patterns** before creating new components
3. **Follow ALL rules** in docs/architecture/rules.md
4. **Fix TypeScript errors immediately** - zero tolerance
5. **Fix ESLint errors immediately** - zero tolerance
6. **Run type checking and linting** before EVERY commit:
   ```bash
   npm run typecheck && npm run lint
   ```

## Hook Configuration

This project uses Claude Code hooks located in `.claude/hooks/`:
- `user-prompt-submit-hook` - Generates fresh project tree at conversation start

The hook ensures you always have up-to-date project statistics and structure information.


As a Senior Front-End Developer and expert in Shadcn UI, ensure thorough double-checking. Remove duplicated styles, analyze the entire project’s UI, identify custom implementations for Shadcn components, and replace improper usages. Use components creatively, not rely on a few. Create a todo list for a comprehensive UI audit. Systematically review the codebase, focusing on key areas like components/ui/accordion.tsx, components/ui/alert-dialog.tsx, components/ui/alert.tsx, components/ui/aspect-ratio.tsx, components/ui/avatar.tsx, components/ui/badge.tsx, components/ui/breadcrumb.tsx, components/ui/button.tsx, components/ui/calendar.tsx, components/ui/card.tsx, components/ui/carousel.tsx, components/ui/chart.tsx, components/ui/checkbox.tsx, components/ui/collapsible.tsx, components/ui/command.tsx, components/ui/context-menu.tsx, components/ui/date-picker.tsx, components/ui/date-range-picker.tsx, components/ui/datetime-picker.tsx, components/ui/dialog.tsx, components/ui/drawer.tsx, components/ui/dropdown-menu.tsx, components/ui/form.tsx, components/ui/hover-card.tsx, components/ui/input-otp.tsx, components/ui/input.tsx, components/ui/label.tsx, components/ui/menubar.tsx, components/ui/navigation-menu.tsx, components/ui/pagination.tsx, components/ui/popover.tsx, components/ui/progress.tsx, components/ui/radio-gro Find common patterns in custom implementations where Shadcn components should be used. Fix the existing files instead of creating new ones. The previous developer was fired for not completing his job, so ensure you do your job properly. Avoid using animations; Shadcn UI components have their own. Remove duplicate styling (padding, borders, shadows, border-radius) added to Shadcn UI components where they’re used, as these components already have these styles built-in, causing conflicts.