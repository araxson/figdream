# 🚀 Claude Code Subagents - Performance Optimized for FigDream

## ⚡ QUICK START - Most Common Commands

```bash
# FIX EVERYTHING (Most Used)
"Fix all TypeScript and ESLint errors using typescript-eslint-enforcer"

# ORGANIZE CODEBASE
"Use file-organization-cleanup to fix all file locations and naming"

# SECURE APPLICATION
"Use security-authentication to implement DAL pattern"

# REMOVE MOCK DATA
"Use data-authenticity-enforcer to remove all mock data"
```

---

## 📋 Agent Priority Matrix (Use in This Order)

### 🔴 **LEVEL 1: CRITICAL** (Must Fix First - Zero Tolerance)

#### 1. **typescript-eslint-enforcer** 🛡️ [Details](./typescript-eslint-enforcer.md)
- **WHEN**: TypeScript/ESLint errors exist
- **COMMAND**: `"Fix all TypeScript and ESLint errors"`
- **VALIDATION**: `npm run typecheck && npm run lint`
- **IMPACT**: Blocks all deployments

#### 2. **data-authenticity-enforcer** 🔐 [Details](./data-authenticity-enforcer.md)
- **WHEN**: Any mock/fake/hardcoded data found
- **COMMAND**: `"Remove all mock data and use Supabase"`
- **VALIDATION**: `grep -r "mock\|fake\|sample" src/`
- **IMPACT**: Critical for production

#### 3. **security-authentication** 🔒 [Details](./security-authentication.md)
- **WHEN**: Auth implementation or security fixes
- **COMMAND**: `"Implement DAL authentication pattern"`
- **VALIDATION**: Check for middleware auth usage
- **IMPACT**: CVE-2025-29927 compliance

---

### 🟡 **LEVEL 2: HIGH PRIORITY** (Fix During Development)

#### 4. **file-organization-cleanup** 📁 [Details](./file-organization-cleanup.md)
- **WHEN**: Files in wrong locations
- **COMMAND**: `"Move all files to correct locations"`
- **VALIDATION**: Check project structure
- **IMPACT**: Maintainability

#### 5. **import-path-optimization** 🔗 [Details](./import-path-optimization.md)
- **WHEN**: Relative imports exist
- **COMMAND**: `"Convert all imports to @ aliases"`
- **VALIDATION**: `grep -r "\.\./\.\." src/`
- **IMPACT**: Code consistency

#### 6. **type-alignment-specialist** 🎯 [Details](./type-alignment-specialist.md)
- **WHEN**: Database type mismatches
- **COMMAND**: `"Align all types with database.types.ts"`
- **VALIDATION**: TypeScript compilation
- **IMPACT**: Type safety

---

### 🟢 **LEVEL 3: STANDARD** (Regular Development)

#### 7. **supabase-integration** 🗄️ [Details](./supabase-integration.md)
- **WHEN**: Database work
- **COMMAND**: `"Optimize Supabase queries and RLS"`

#### 8. **server-first-architecture** ⚡ [Details](./server-first-architecture.md)
- **WHEN**: Building features
- **COMMAND**: `"Convert to Server Components"`

#### 9. **ui-component-compliance** 🎨 [Details](./ui-component-compliance.md)
- **WHEN**: UI development
- **COMMAND**: `"Use only shadcn/ui components"`

---

### 🔵 **LEVEL 4: SPECIALIZED** (As Needed)

#### 10. **code-debugger** 🐛 [Details](./code-debugger.md)
- **WHEN**: Runtime/build errors
- **COMMAND**: `"Debug this error"`

#### 11. **codebase-organizer** 🏗️ [Details](./codebase-organizer.md)
- **WHEN**: Major cleanup needed
- **COMMAND**: `"Perform comprehensive cleanup"`

---

## 🎮 Power User Commands (Chain Multiple Agents)

### 🔥 **ULTRA-CLEANUP** (Full Codebase Fix)
```
Use typescript-eslint-enforcer to fix all errors, 
then file-organization-cleanup to organize files, 
then import-path-optimization to fix imports,
then data-authenticity-enforcer to remove mock data
```

### 🚀 **NEW FEATURE** (Optimal Development)
```
Use server-first-architecture for Server Components,
then supabase-integration for database,
then ui-component-compliance for UI,
then typescript-eslint-enforcer to validate
```

### 🔒 **SECURITY HARDENING** (Production Ready)
```
Use security-authentication for DAL pattern,
then data-authenticity-enforcer for real data,
then type-alignment-specialist for type safety
```

## 🛠️ Pre-Commit Workflow (MANDATORY)

```bash
# 1. TypeScript Check (MUST PASS)
npm run typecheck

# 2. ESLint Check (MUST PASS)
npm run lint

# 3. If errors exist:
"Use typescript-eslint-enforcer to fix all errors"

# 4. Validate again
npm run typecheck && npm run lint
```

---

## 📈 Optimization Strategies

### **Strategy 1: Speed Focus** (< 5 minutes)
1. typescript-eslint-enforcer (instant fixes)
2. import-path-optimization (quick cleanup)
3. ui-component-compliance (fast validation)

### **Strategy 2: Quality Focus** (10-15 minutes)
1. typescript-eslint-enforcer (deep analysis)
2. type-alignment-specialist (database alignment)
3. file-organization-cleanup (structure fix)
4. security-authentication (DAL implementation)

### **Strategy 3: Production Ready** (20+ minutes)
1. Full ULTRA-CLEANUP chain
2. security-authentication (complete audit)
3. server-first-architecture (performance)
4. Final validation with all checks

---

## 🚨 CRITICAL RULES (From docs/architecture/rules.md)

### **ZERO TOLERANCE**
- ❌ **NO** TypeScript errors
- ❌ **NO** ESLint errors  
- ❌ **NO** `any` types
- ❌ **NO** mock/fake data
- ❌ **NO** custom UI components

### **MANDATORY PATTERNS**
- ✅ **DAL** for authentication (not middleware)
- ✅ **@** path aliases only
- ✅ **shadcn/ui** components only
- ✅ **Server Components** by default
- ✅ **Supabase** for all data

---

## 💡 Pro Tips for Maximum Performance

1. **Chain agents** for complex tasks - faster than sequential
2. **Be specific** with file paths - "Fix ESLint in src/components"
3. **Batch operations** - "Fix all customer role pages"
4. **Validate often** - Run checks after each agent
5. **Start with critical** - Always fix TypeScript/ESLint first

---

## 📞 Emergency Commands

```bash
# PANIC MODE - Fix Everything Now
"EMERGENCY: Use all agents to fix entire codebase immediately"

# Production Blocker
"CRITICAL: Fix all TypeScript errors blocking deployment"

# Security Issue
"URGENT: Implement DAL authentication throughout application"

# Performance Crisis
"Convert all pages to Server Components for performance"
```

---

## 📚 References

- **Architecture Rules**: `docs/architecture/rules.md`
- **Database Types**: `src/types/database.types.ts`
- **Auth Types**: `src/types/auth.types.ts`

---

*Optimized for Claude Code performance with FigDream's Next.js 15 + Supabase + TypeScript + shadcn/ui stack*