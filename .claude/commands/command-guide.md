# 📋 Claude Code Command Guide - When to Use Each Specialized Command

## 🎯 COMMAND OVERVIEW



## 🛡️ `/db-security-guard`
**Use When**: Database security, type safety, or DAL issues need attention

### Perfect For:
- ✅ Verifying database types match actual schema
- ✅ Ensuring all DAL functions have auth checks
- ✅ Fixing placeholder types and mock data
- ✅ Auditing public views vs secured schema access
- ✅ Implementing security-first data access patterns
- ✅ Resolving type mismatches with database

### Example Usage:
```
/db-security-guard
I need to verify that all my staff-related types match the actual database schema and ensure proper authentication is implemented.
```

## 🎨 `/shadcn-ui-master`
**Use When**: UI components need transformation to pure shadcn/ui

### Perfect For:
- ✅ Converting custom components to shadcn/ui
- ✅ Eliminating custom CSS and inline styles
- ✅ Creating missing UX components (loading, empty states, etc.)
- ✅ Optimizing component composition patterns
- ✅ Installing and configuring missing shadcn components
- ✅ Ensuring consistent design system

### Example Usage:
```
/shadcn-ui-master
Transform my custom dashboard components to use pure shadcn/ui and add proper loading states and empty state handling.
```

## 🏗️ `/core-module-architect`
**Use When**: Architecture needs to follow Core Module Pattern

### Perfect For:
- ✅ Reorganizing features into core/[feature]/ structure
- ✅ Converting thick pages to ultra-thin routing
- ✅ Fixing file extensions (.ts vs .tsx)
- ✅ Implementing proper import paths
- ✅ Eliminating business logic from pages
- ✅ Creating proper feature module organization

### Example Usage:
```
/core-module-architect
Reorganize my appointment management code to follow the Core Module Pattern and fix the file extension issues.
```

## 🎯 `/quality-enforcer`
**Use When**: Code quality issues need systematic manual fixing

### Perfect For:
- ✅ Fixing TypeScript errors one by one
- ✅ Resolving ESLint violations manually
- ✅ Eliminating code duplication
- ✅ Improving error handling patterns
- ✅ Optimizing performance issues
- ✅ Ensuring build success

### Example Usage:
```
/quality-enforcer
Fix the top 5 TypeScript errors in my staff management module and eliminate the duplicate code patterns I've been seeing.
```

## 🚀 `/feature-builder`
**Use When**: Creating complete new features from scratch

### Perfect For:
- ✅ Building end-to-end feature implementations
- ✅ Creating complete DAL with security
- ✅ Implementing full UI with shadcn/ui
- ✅ Adding all UX states (loading, error, empty)
- ✅ Setting up proper data management hooks
- ✅ Creating ultra-thin pages for new features

### Example Usage:
```
/feature-builder
Create a complete inventory management feature with CRUD operations, proper authentication, and full UI using shadcn/ui components.
```

## 🎯 COMMAND SELECTION STRATEGY

### For Database & Security Issues:
```
Database types wrong? → /db-security-guard
Missing auth checks? → /db-security-guard
Placeholder types? → /db-security-guard
```

### For UI & Design Issues:
```
Custom CSS to remove? → /shadcn-ui-master
Missing loading states? → /shadcn-ui-master
Inconsistent design? → /shadcn-ui-master
```

### For Architecture Issues:
```
Business logic in pages? → /core-module-architect
Wrong file extensions? → /core-module-architect
Poor code organization? → /core-module-architect
```

### For Code Quality Issues:
```
TypeScript errors? → /quality-enforcer
ESLint violations? → /quality-enforcer
Duplicate code? → /quality-enforcer
```

### For New Feature Development:
```
Need complete new feature? → /feature-builder
Want end-to-end implementation? → /feature-builder
Need security-first development? → /feature-builder
```

## 🔄 PROGRESSIVE ENHANCEMENT WORKFLOW

### For Complex Tasks, Use Commands in Sequence:

#### Complete Feature Overhaul:
1. `/db-security-guard` - Fix database and security issues
2. `/core-module-architect` - Reorganize to Core Module Pattern
3. `/shadcn-ui-master` - Transform UI to pure shadcn/ui
4. `/quality-enforcer` - Fix remaining quality issues

#### New Feature Development:
1. `/db-security-guard` - Verify database schema first
2. `/feature-builder` - Create complete feature
3. `/quality-enforcer` - Polish and optimize

#### Legacy Code Modernization:
1. `/core-module-architect` - Fix architecture first
2. `/shadcn-ui-master` - Modernize UI
3. `/db-security-guard` - Ensure security compliance
4. `/quality-enforcer` - Final quality pass

## 🎯 QUICK REFERENCE

| Need | Command | Focus |
|------|---------|-------|
| **Database/Security** | `/db-security-guard` | Types, Auth, RLS |
| **UI/Design** | `/shadcn-ui-master` | Pure shadcn/ui |
| **Architecture** | `/core-module-architect` | Core Module Pattern |
| **Code Quality** | `/quality-enforcer` | Manual fixes |
| **New Features** | `/feature-builder` | End-to-end creation |

## 🚀 BENEFITS OF SPECIALIZED COMMANDS

### ✅ Focused Expertise
- Each command is a specialist in their domain
- Better context understanding
- More targeted solutions

### ✅ Clearer Intent
- User knows exactly what each command does
- Easier to choose the right tool
- Better communication of needs

### ✅ Progressive Enhancement
- Use commands in sequence for complex tasks
- Build quality incrementally
- Systematic improvement approach

### ✅ Maintainable Instructions
- Update individual commands as needed
- Easier to modify specific expertise
- Clear separation of concerns

---

*Use these specialized commands to get maximum value from Claude Code with focused, expert-level assistance for every aspect of your Next.js 15 salon booking platform.*