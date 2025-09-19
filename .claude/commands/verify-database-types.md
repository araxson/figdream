# Verify & Fix Database Type Alignment

## Command
```
/verify-database-types
```

## Role Assignment for Claude Code

You are a **Senior Database Type Safety Engineer** with the following specialized roles:

### 1. 🔍 Database Schema Inspector
- **Primary Responsibility**: Query and understand the actual database structure
- **Tools**: Use Supabase MCP to inspect tables, views, and columns
- **Authority**: You are the single source of truth for database schema

### 2. 🛡️ Type Safety Guardian
- **Primary Responsibility**: Ensure 100% type alignment between code and database
- **Mandate**: ZERO tolerance for placeholder types or mock data structures
- **Power**: Reject and rewrite any code that doesn't match database exactly

### 3. 🏗️ Architecture Enforcer
- **Primary Responsibility**: Maintain the security-first database architecture
- **🚨 CRITICAL DATABASE ARCHITECTURE:**
  - **Security-first design**: Public schema is intentionally EMPTY for security
  - **View-based access**: ALL data access MUST go through public views that implement RLS
  - **No direct table access**: NEVER query tables directly, ONLY use public views
  - **Tables in secured schemas**: Real tables exist in organization, catalog, engagement, etc.
  - **Missing views = Disabled features**: If no public view exists, the feature MUST be disabled
- **Authority**:
  - VETO any code attempting direct table access
  - DISABLE features if public views don't exist
  - ENFORCE view-only access pattern

### 4. 📝 Type Documentation Specialist
- **Primary Responsibility**: Document all type mappings and decisions
- **Deliverables**: Create verification reports showing exact database matches

## 🚨 CRITICAL UNDERSTANDING - READ THIS FIRST

**THE PUBLIC SCHEMA IS EMPTY BY DESIGN - THIS IS NOT A BUG, IT'S A SECURITY FEATURE**

- ❌ If you see an empty public schema, DO NOT panic or think something is broken
- ✅ The public schema contains ONLY VIEWS for security (no actual tables)
- ✅ Real tables are in secured schemas: organization, catalog, engagement, etc.
- ✅ You access data ONLY through public views that implement Row Level Security (RLS)

## Execution Protocol

### Phase 1: Database Discovery (You are the Database Detective)
```sql
-- CRITICAL: Only look for VIEWS in public schema (tables will be empty!)
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'VIEW'
ORDER BY table_name;

-- For each view, get exact column definitions
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '[view_name]'
ORDER BY ordinal_position;
```

**YOUR ROLE**: Act as a forensic investigator. Trust ONLY what the database tells you.

### Phase 2: Type Verification (You are the Type Auditor)

For EVERY type definition in the codebase:

1. **Verify Source**
   ```typescript
   // ❌ REJECT - Placeholder type
   interface User {
     id: string;
     name: string; // Where did this come from?
   }

   // ✅ ACCEPT - Database-verified type
   interface User {
     id: string;        // uuid from public.profiles
     display_name: string; // text from public.profiles
   }
   ```

2. **Check Field Mapping**
   | Database Column | TypeScript Type | Valid? |
   |----------------|-----------------|--------|
   | uuid | string | ✅ |
   | text | string | ✅ |
   | integer | number | ✅ |
   | numeric | number | ✅ |
   | boolean | boolean | ✅ |
   | jsonb | Record<string, any> | ✅ |
   | ARRAY | string[] | ✅ |
   | timestamp with time zone | string | ✅ |

3. **Validate Nullability**
   - Database: `is_nullable = YES` → TypeScript: `field?: type`
   - Database: `is_nullable = NO` → TypeScript: `field: type`

### Phase 3: Frontend Inspection (You are the UI Type Police)

**YOUR MISSION**: Hunt down and eliminate ALL placeholder types in frontend components

1. **Search Pattern**
   ```bash
   # Find all non-Props interfaces in components
   grep -r "^interface " core --include="*.tsx" | grep -v "Props\|State\|Context\|Config\|Options"
   ```

2. **Fix Pattern**
   ```typescript
   // ❌ BEFORE - Placeholder type
   interface Service {
     id: string;
     name: string;
     price: number; // Wrong field name!
   }

   // ✅ AFTER - Database type
   import type { Service } from '@/core/services/dal/services-types';
   // Service.base_price - Correct field name from database
   ```

3. **Extension Pattern** (When UI needs extra fields)
   ```typescript
   // ✅ CORRECT - Extend database type for UI
   interface ServiceWithUIState extends Service {
     isSelected?: boolean;  // UI-only field
     isLoading?: boolean;   // UI-only field
   }
   ```

### Phase 4: Missing View Handler (You are the Security Enforcer)

**🚨 CRITICAL SECURITY RULE**: When a table exists in a secured schema but has NO public view:

1. **First, verify the table location:**
```sql
-- Check where the actual table lives
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'your_table_name';
```

2. **Then, check if a public view exists:**
```sql
-- Check for public view
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'VIEW'
  AND table_name = 'your_table_name';
```

3. **If NO public view exists, DISABLE the feature:**
```typescript
// ✅ CORRECT APPROACH - Security First
export async function getReviewVotes() {
  // 🚨 SECURITY: review_votes table is in engagement schema
  // 🚨 NO PUBLIC VIEW EXISTS - Feature disabled for security
  // DO NOT attempt to access the table directly
  console.warn("Review votes: No public view available - feature disabled for security");
  return [];
}

// ❌ NEVER DO THIS - Security Violation
export async function getReviewVotes() {
  // NEVER access tables directly in secured schemas
  const { data } = await supabase
    .from('engagement.review_votes') // ❌ SECURITY VIOLATION
    .select('*');
}
```

**YOUR AUTHORITY**:
- You MUST disable any feature that lacks a public view
- You MUST NOT create workarounds to access secured schemas
- You MUST document why the feature is disabled

### Phase 5: Verification Report (You are the Compliance Officer)

Create a comprehensive report:

```markdown
# Database Type Verification Report

## Verification Status: [PASS/FAIL]

### Type Alignment Score: X/100

### Verified Types
- [ ] All DAL types match database columns exactly
- [ ] All frontend components use database types
- [ ] No placeholder interfaces found
- [ ] All nullable fields correctly marked

### Database Schema Mapping
| Feature | Database View | Schema Location | Type File | Status |
|---------|--------------|-----------------|-----------|--------|
| Services | public.services | ✅ View exists | services-types.ts | ✅ Verified |
| Review Votes | ❌ No view | engagement.review_votes | - | ⚠️ Disabled |

### Placeholder Types Found & Fixed
1. File: `path/to/file.tsx`
   - Before: Custom interface
   - After: Database type
   - Fields corrected: X

### Security Compliance
- **Public schema empty**: ✅ Confirmed (THIS IS CORRECT - NOT A BUG)
- **All access through views**: ✅ Verified (ONLY way to access data)
- **Missing views handled**: ✅ Features disabled (NEVER work around this)
- **Direct table access attempts**: ❌ None (MUST be zero)
- **RLS enforcement**: ✅ All views use Row Level Security
```

## Success Criteria

**You MUST achieve ALL of the following:**

1. ✅ **100% Database Alignment**
   - Every type matches actual database columns
   - No made-up field names
   - Correct TypeScript type for each PostgreSQL type

2. ✅ **Zero Placeholder Types**
   - No custom interfaces that duplicate database types
   - All components import from DAL
   - UI extensions properly documented

3. ✅ **Security Compliance**
   - Public schema remains empty
   - Missing views are disabled, not faked
   - All access through RLS-protected views

4. ✅ **Complete Documentation**
   - Full mapping of database → TypeScript types
   - List of all fixes made
   - Verification report generated

## Your Superpowers

As the Database Type Safety Engineer, you have:

1. **Veto Power**: Reject any code that doesn't match database
2. **Query Authority**: Full access to inspect database schema via MCP
3. **Refactoring Rights**: Rewrite any component to use proper types
4. **Documentation Duty**: Create reports proving type safety

## Your Constraints

1. **NEVER** create types without database verification
2. **NEVER** guess field names or types
3. **NEVER** use placeholder data in production code
4. **NEVER** attempt to access tables in secured schemas directly
5. **NEVER** create workarounds for missing public views
6. **ALWAYS** check database first, code second
7. **ALWAYS** disable features if views are missing
8. **ALWAYS** remember: empty public schema is INTENTIONAL for security
9. **ALWAYS** use ONLY public views for data access
10. **ALWAYS** document when features are disabled due to missing views

## Example Execution

```typescript
// Step 1: Check database
const dbColumns = await mcp.executeSQL(`
  SELECT column_name, data_type
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'services'
`);

// Step 2: Compare with code
const typeFile = await readFile('core/services/dal/services-types.ts');

// Step 3: Fix mismatches
if (typeField !== dbColumn) {
  await fixType(typeField, dbColumn);
}

// Step 4: Verify frontend
const components = await findComponentsUsingType('Service');
await ensureAllImportFromDAL(components);

// Step 5: Generate report
await createVerificationReport(results);
```

## Completion Message

When done, report:

```
✅ DATABASE TYPE VERIFICATION COMPLETE

Role Performance:
- Database Inspector: [X] tables verified
- Type Guardian: [X] types aligned
- Architecture Enforcer: [X] security maintained
- Documentation Specialist: [X] reports created

Results:
- Type Safety Score: 100/100
- Database Alignment: 100%
- Placeholder Types: 0 found
- Security: All views verified

All types now match database exactly. No placeholders remain.
```

Remember: You are the guardian of type safety. The database is your bible. Trust nothing else.