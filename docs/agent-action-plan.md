# Agent Action Plan

Generated: 2025-09-19T11:43:53.730Z

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
   Critical Issues: 16
   ```

### Phase 2: Error Resolution

3. **Quality Deployment Ready** - Fix top priority errors
   ```bash
   Task: "Use quality-deployment-ready to fix console.log and unused imports"
   Read: docs/error-priority-report.md
   Quick Wins: 474 errors
   ```

4. **Database Security Master** - Fix database type issues
   ```bash
   Task: "Fix missing properties on database types"
   Read: docs/database-type-report.md
   Type Issues: 16
   ```

### Phase 3: UI Standardization

5. **UI Standardizer** - Convert to shadcn/ui
   ```bash
   Task: "Use ui-standardizer to replace custom components with shadcn/ui"
   Read: docs/component-compliance-report.md
   Compliance: 24%
   ```

### Phase 4: Architecture Optimization

6. **Core Feature Builder** - Split oversized files
   ```bash
   Task: "Split critically oversized files into smaller modules"
   Read: docs/file-size-report.md
   Critical Files: 59
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
- **Total Errors**: 3334
- **Security Score**: 95/100
- **UI Compliance**: 24%
- **Can Build**: ❌

## 🔥 Priority Files (Most Errors)

- `core/customer/components/booking/manager.tsx`: 49 errors
- `core/salon/actions/billing/refund.action.ts`: 44 errors
- `core/salon/actions/billing/invoice.action.ts`: 42 errors
- `core/staff/components/schedule/manager.tsx`: 42 errors
- `core/customer/hooks/use-bookings.ts`: 38 errors
- `core/salon/dal/billing/billing.queries.ts`: 37 errors
- `core/salon/components/dashboard/service-catalog.tsx`: 34 errors
- `core/customer/index.ts`: 32 errors
- `core/salon/dal/inventory/inventory.queries.ts`: 32 errors
- `core/salon/dal/inventory/purchase-order.mutations.ts`: 31 errors

## 💡 Key Recommendations

- 4. Fix errors in top 10 files with most errors (one file at a time):
- 5. Use quality-deployment-ready to fix build errors
- 6. Run quality-deployment-ready for final validation
- 🚨 CRITICAL: 16 critical security issues found. Fix these immediately to prevent data breaches.
- 🛡️ Row Level Security: 10 functions bypass RLS. Add appropriate filters to ensure users only access their data.
- 💉 SQL Injection: 16 potential SQL injection vulnerabilities. Never use string interpolation in queries. Use parameterized queries.
- ✅ Validation: 22 functions lack input validation. Implement Zod schemas for all data inputs.
- ⚠️ Error Handling: 11 functions lack proper error handling. Wrap all database operations in try-catch blocks.
- 🚨 CRITICAL: Less than 50% shadcn/ui compliance. Major refactoring needed to standardize components.
- 🔄 Replace custom components: 51 custom components found. Prioritize replacing high-usage components with shadcn/ui equivalents.

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