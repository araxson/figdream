# Fix All Errors - Parallel Processing Command

## Usage
```
/fix-errors
```

## 📏 FILE SIZE ENFORCEMENT RULES

### Maximum Line Counts (ENFORCE WHILE FIXING)
```typescript
// Component Files (.tsx)
- Maximum: 300 lines
- During fix: Split if exceeding limit

// DAL Files (.ts)
- Maximum: 500 lines
- During fix: Split by queries/mutations

// Hook Files (.ts)
- Maximum: 150 lines
- During fix: Extract complex logic

// Server Actions (.ts)
- Maximum: 250 lines
- During fix: Group related actions

// Pages (.tsx)
- Maximum: 100 lines (ultra-thin)
- During fix: Move logic to core modules

// Type Files (.ts)
- Maximum: 400 lines
- During fix: Split by domain
```

### Fix Strategy with Size Limits
- Check file size before fixing
- If approaching limit → Plan splitting
- Create new files following Core Module Pattern
- Update imports after splitting
- Maintain functionality during refactor

## Execution Protocol

**STEP 1:** Run analyzer first
```bash
npx ts-node analyzer.ts
```

**STEP 2:** Fix ALL errors using maximum parallel processing:

### 🚀 PARALLEL STRATEGY
- **BATCH PROCESSING**: Use multiple tool calls in single messages
- **PRIORITY ORDER**: Critical → High → Medium → Low (from analyzer-report.json)
- **CATEGORY TARGETS**: TypeScript → Security → Architecture → Components → Performance → Database → Imports

### ⚡ EXECUTION TACTICS
1. **MultiEdit for file batches**: Process 3-5 related files simultaneously
2. **Parallel Read operations**: Analyze multiple files before fixing
3. **Concurrent validation**: Run `npm run typecheck` + `npm run lint` together
4. **Pattern-based fixes**: Group similar errors for batch processing

### 🎯 REQUIREMENTS
- Fix by SEVERITY first (analyzer-report.json breakdown)
- NEVER bulk find/replace - use targeted MultiEdit only
- Read files before editing - understand context
- Validate fixes in parallel with Bash tool
- Re-run analyzer after major batches

### 🔥 UNLEASH CLAUDE CODE FULL POTENTIAL
Process aggressively but systematically. Use every parallel capability available.

## Project Structure Pattern (MUST FOLLOW)
```
/
├── app/                 # Ultra-thin pages (only return components)
├── core/               # Feature modules (ALL business logic)
│   └── [feature]/      # Each feature is self-contained
│       ├── dal/        # Data Access Layer
│       │   ├── [feature]-queries.ts
│       │   ├── [feature]-mutations.ts
│       │   └── [feature]-types.ts
│       ├── components/ # React components
│       ├── hooks/      # Custom hooks
│       ├── actions/    # Server actions
│       ├── types.ts    # Module types export
│       └── index.ts    # Module exports
├── components/ui/      # shadcn/ui components ONLY
├── lib/                # Shared utilities
└── types/              # Global TypeScript types
```

**STRICT RULES:**
- NEVER create files outside this pattern
- NEVER put business logic in app/ directory
- NEVER add custom components to components/ (only ui/)
- ALWAYS use core/[feature]/ for new features
- ALWAYS follow the existing naming conventions

## Execution Protocol

### Phase 1: Automated Analysis
1. Run `npx ts-node analyzer.ts` to generate fresh analysis
2. Read `analyzer-report.json` carefully
3. Review the summary and recommendations
4. Identify the root causes, not just symptoms

#### Automated Commands Available
```bash
# Auto-fix ESLint issues (safe)
npm run lint:fix

# Check TypeScript errors
npx tsc --noEmit

# View specific error categories
cat analyzer-report.json | jq '.details.typeErrors[0:10]'
cat analyzer-report.json | jq '.details.lintErrors[0:10]'
cat analyzer-report.json | jq '.details.unusedImports'
cat analyzer-report.json | jq '.details.missingDependencies'

# Get recommendations
cat analyzer-report.json | jq -r '.recommendations[]'
```

### Phase 2: Strategic Fixing (ULTRATHINK Approach)

**THINK before each fix:**
- What is the actual problem, not just the error message?
- Will this fix break other parts of the system?
- Is this following the existing patterns in the codebase?
- Does this match the project tree structure?

**Fix Order (STRICT PRIORITY):**

1. **Critical Errors** (Priority 1)
   - Fix one file at a time
   - Test each fix by running `npm run typecheck`
   - NEVER bulk replace imports or types
   - Maintain exact import paths pattern

2. **Runtime Errors** (Priority 2)
   - Understand the execution context
   - Fix the business logic, not just type annotations
   - Verify with `npm run dev` after each fix

3. **Missing Features** (Priority 3)
   - Use the Core Module Pattern EXACTLY as shown above
   - **🚨 CRITICAL DATABASE ARCHITECTURE:**
     - **Security-first design**: Public schema is intentionally EMPTY for security
     - **View-based access**: ALL data access MUST go through public views that implement RLS
     - **ALWAYS check available views first**: Use `mcp__supabase__execute_sql` with:
       ```sql
       SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'VIEW'
       ```
   - **ALWAYS check database schema with Supabase MCP first** - use `mcp__supabase__list_tables` and SQL queries
   - **NEVER create placeholder types** - use actual database structure
   - **NEVER assume table locations** - check all schemas (organization, catalog, scheduling, engagement, etc.)
   - **If a table doesn't exist as a public view**: Comment out the functionality with a NOTE explaining the missing view
   - Create structure: dal/ → components/ → hooks/ → actions/ → index.ts
   - Follow naming: `[feature]-queries.ts`, `[feature]-mutations.ts`, `[feature]-types.ts`
   - Implement DAL → Components → Hooks → Page

4. **Incomplete Modules** (Priority 4)
   - Compare with working modules as reference
   - Check if all required subdirectories exist (dal/, components/, hooks/, actions/)
   - Maintain consistency with existing patterns
   - Add proper auth checks in all DAL functions
   - Ensure index.ts exports everything properly


### Phase 3: Verification
- Run analyzer after each priority level
- Check file structure matches the pattern
- Health score must improve incrementally
- Target: 90+ health score

## Key Principles
- **Quality over speed** - One correct fix is better than ten broken ones
- **Pattern consistency** - Every file must follow the established structure
- **Understand before fixing** - Read surrounding code context
- **Test incrementally** - Verify each change works
- **Follow patterns** - Maintain architectural consistency
- **Preserve functionality** - Never break working features
- **🚨 CRITICAL: Always investigate database structure with MCP tools before making type assumptions**
- **🚨 CRITICAL: Never create placeholder types without checking actual database schemas**
- **🚨 CRITICAL: Public schema is EMPTY by design - only access data through public VIEWS**
- **🚨 CRITICAL: If a required table isn't available as a public view, disable the feature with a clear comment**

## Stop Conditions
- Health score reaches 90+
- All critical/runtime errors resolved
- All required features implemented
- File structure matches the pattern exactly
- Test coverage above 60%

## Example Pattern to Follow
When creating a new feature like "loyalty", structure MUST be:
```
core/
└── loyalty/
    ├── dal/
    │   ├── loyalty-queries.ts
    │   ├── loyalty-mutations.ts
    │   └── loyalty-types.ts
    ├── components/
    │   ├── loyalty-list.tsx
    │   ├── loyalty-form.tsx
    │   └── __tests__/
    ├── hooks/
    │   ├── use-loyalty.ts
    │   └── __tests__/
    ├── actions/
    │   └── loyalty-actions.ts
    ├── types.ts
    └── index.ts
```

Remember: This is production code. Every change matters. Be meticulous and ALWAYS follow the existing tree pattern.

## Analyzer Tool Integration

### How Claude Should Use the Analyzer

1. **Initial Analysis**
   ```bash
   # Always start with a fresh analysis
   npx ts-node analyzer.ts

   # Review the health score
   cat analyzer-report.json | jq '.summary'
   ```

2. **Prioritize Based on Report**
   - Focus on `typeErrors` first (blocks builds)
   - Then `buildErrors` (runtime issues)
   - Then `lintErrors` (code quality)
   - Finally `unusedImports` and `duplicateComponents`

3. **Iterative Fixing Process**
   - Fix one category at a time
   - Re-run analyzer after each batch of fixes
   - Track health score improvements

4. **Safe Auto-fixes**
   ```bash
   # These are generally safe to run
   npm run lint:fix          # Format code
   npm run typecheck          # Verify types
   ```

5. **Manual Review Required For**
   - Type definition changes
   - Import path modifications
   - Component consolidation
   - Dependency additions

### Report Structure Reference

```json
{
  "timestamp": "ISO date",
  "summary": {
    "totalErrors": 0,
    "typeErrors": 0,
    "lintErrors": 0,
    "buildErrors": 0,
    "unusedImports": 0,
    "missingDependencies": 0,
    "duplicateComponents": 0
  },
  "details": {
    "typeErrors": [{"file": "path", "errors": ["error messages"]}],
    "lintErrors": [{"file": "path", "errors": ["rule violations"]}],
    "buildErrors": ["error messages"],
    "unusedImports": [{"file": "path", "imports": ["unused"]}],
    "missingDependencies": ["package names"],
    "duplicateComponents": [{"name": "Component", "locations": ["files"]}],
    "emptyFiles": ["file paths"],
    "largeFiles": [{"file": "path", "size": "KB"}]
  },
  "recommendations": ["actionable suggestions"]
}
```

### Success Metrics
- **Health Score**: (100 - (totalErrors / 10))
- **Target**: 90+ health score
- **Critical**: 0 TypeScript errors
- **Important**: 0 Build errors
- **Nice to have**: 0 ESLint errors

### Workflow Example for Claude

```bash
# 1. Initial state
npx ts-node analyzer.ts
# Health Score: 45 (55 total errors)

# 2. Fix TypeScript errors
# ... apply fixes ...
npx ts-node analyzer.ts
# Health Score: 72 (28 errors remaining)

# 3. Fix build errors
# ... apply fixes ...
npx ts-node analyzer.ts
# Health Score: 85 (15 errors remaining)

# 4. Clean up remaining issues
npx ts-node analyzer.ts
# Health Score: 95 (5 minor issues)
```

## Notes
- The analyzer is idempotent and safe to run multiple times
- Always check `analyzer-report.json` for detailed error information
- Use the recommendations as a guide for fixing priorities
- Keep the report for tracking progress over time