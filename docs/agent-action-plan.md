# Agent Action Plan

Generated: 2025-09-19T02:01:15.340Z

## 🎯 Execution Order for Agents

Follow this exact sequence for optimal results:

### Phase 1: Critical Issues (MUST FIX FIRST)

1. **Structure Guardian** - Fix project structure
   ```bash
   Task: "Use structure-guardian to fix forbidden directories and misplaced files"
   Read: docs/project-tree.md
   ```

2. **Database Security Master** - Fix critical security issues
   ```bash
   Task: "Use database-security-master to fix critical auth issues"
   Read: docs/dal-security-report.md
   Critical Issues: 90
   ```

### Phase 2: Error Resolution

3. **Quality Deployment Ready** - Fix top priority errors
   ```bash
   Task: "Use quality-deployment-ready to fix console.log and unused imports"
   Read: docs/error-priority-report.md
   Quick Wins: 715 errors
   ```

4. **Database Security Master** - Fix database type issues
   ```bash
   Task: "Fix missing properties on database types"
   Read: docs/database-type-report.md
   Type Issues: 117
   ```

### Phase 3: UI Standardization

5. **UI Standardizer** - Convert to shadcn/ui
   ```bash
   Task: "Use ui-standardizer to replace custom components with shadcn/ui"
   Read: docs/component-compliance-report.md
   Compliance: 17%
   ```

### Phase 4: Architecture Optimization

6. **Core Feature Builder** - Split oversized files
   ```bash
   Task: "Split critically oversized files into smaller modules"
   Read: docs/file-size-report.md
   Critical Files: 105
   ```

### Phase 5: Final Validation

7. **Quality Deployment Ready** - Final checks
   ```bash
   Task: "Use quality-deployment-ready to validate all fixes"
   Re-run: npx tsx scripts/agent-workflow.ts
   Target: Health score > 90, Build success
   ```

## 📊 Current Status

- **Health Score**: 0/100
- **Total Errors**: 3638
- **Security Score**: 95/100
- **UI Compliance**: 17%
- **Can Build**: ❌

## 🔥 Priority Files (Most Errors)

- `core/loyalty/dal/loyalty.ts`: 76 errors
- `core/inventory/dal/queries.ts`: 64 errors
- `core/campaigns/dal/campaigns-queries.ts`: 60 errors
- `core/billing/dal/index.ts`: 48 errors
- `core/customer/dal/bookings.ts`: 47 errors
- `core/loyalty/dal/mutations.ts`: 47 errors
- `core/appointments/components/appointment-details-modal.tsx`: 44 errors
- `core/billing/actions/refund-actions.ts`: 44 errors
- `core/security/dal/secure-dal-patterns.ts`: 44 errors
- `core/billing/actions/invoice-actions.ts`: 40 errors

## 💡 Key Recommendations

- 4. Fix errors in top 10 files with most errors (one file at a time):
- 5. Use quality-deployment-ready to fix build errors
- 6. Run quality-deployment-ready for final validation
- 🚨 CRITICAL: 90 critical security issues found. Fix these immediately to prevent data breaches.
- 🔐 Authentication: 14 functions lack auth checks. Add getCurrentUser() checks to all write operations.
- 🛡️ Row Level Security: 34 functions bypass RLS. Add appropriate filters to ensure users only access their data.
- 💉 SQL Injection: 76 potential SQL injection vulnerabilities. Never use string interpolation in queries. Use parameterized queries.
- ✅ Validation: 98 functions lack input validation. Implement Zod schemas for all data inputs.
- ⚠️ Error Handling: 57 functions lack proper error handling. Wrap all database operations in try-catch blocks.
- 🚨 CRITICAL: Less than 50% shadcn/ui compliance. Major refactoring needed to standardize components.

## 🚀 Quick Start

```bash
# Run the complete agent chain
Task: "Execute the agent action plan from docs/agent-action-plan.md"
```

## ⚠️ Important Rules

- **NEVER** create auto-fix scripts
- **NEVER** use sed/awk/perl for mass replacements
- **NEVER** create SQL files for database changes
- **ALWAYS** fix files ONE BY ONE using Edit/MultiEdit
- **ALWAYS** read files before editing
- **Maximum** 5 fixes per response