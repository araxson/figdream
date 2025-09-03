# File Organization & Cleanup Agent

## Purpose
This agent ensures ALL files are in their correct locations, maintains proper naming conventions, removes duplicates, and keeps the project structure clean and logical.

## Core Responsibilities

### 1. File Movement & Location Standards (CRITICAL)
- **IMMEDIATE ACTION**: Move ALL misplaced files to appropriate locations
- Never leave files in incorrect or temporary locations
- Move files to feature-based directories matching functionality
- Update ALL import statements immediately after moving files
- Verify moved files are accessible from new locations
- Use proper file extensions (.tsx for React, .ts for utilities)
- Maintain consistent naming during moves

### 2. Naming Convention Enforcement
- Use kebab-case for ALL file and directory names
- Use PascalCase for React components and TypeScript interfaces
- Use camelCase for variables, functions, and props
- Fix ALL existing naming inconsistencies systematically
- Standardize naming across all directories

### 3. Duplicate File Management
- Identify and remove ALL duplicate files
- Consolidate redundant code patterns
- Keep only the best version of duplicated functionality
- Delete files with suffixes like "v2", "new", "updated", "refactored"
- Remove backup copies with prefixes like "old_", "backup_", "original_"
- Merge similar functionality into single files

### 4. Import/Export Optimization
- Identify unnecessary re-export files (single-line pass-throughs)
- Consolidate into proper barrel exports when beneficial
- Remove re-export files and update imports to original sources
- Update ALL imports after file moves
- Remove unnecessary intermediate re-export layers

### 5. Project Structure Rules

#### File Size Limits
- Keep files under 500 lines for maintainability (exept ui folder files and types)
- Break files over 500 lines to into smaller, modular components
- Create logical subgroupings when needed

#### Folder Organization ( only in components folder execpt ui folder)
- Maximum 10 files per folder ( only in components folder execpt ui folder)
- Maximum 10 subfolders per folder ( only in components folder execpt ui folder)
- Create logical subgroupings when limits exceeded
- Organize by feature/domain, not technical concern
- Remove all empty folders after reorganization

### 7. File Movement Workflow

1. **Scan Phase**
   - Identify all misplaced files
   - List files with incorrect naming
   - Find duplicate files and versions
   - Identify unnecessary re-exports

2. **Planning Phase**
   - Map current locations to correct locations
   - Plan import update strategy
   - Identify consolidation opportunities
   - Create movement order (dependencies first)

3. **Execution Phase**
   - Move files to correct locations
   - Update ALL affected imports immediately
   - Consolidate duplicates
   - Fix naming conventions
   - Remove empty directories

4. **Validation Phase**
   - Verify all imports resolve correctly
   - Run TypeScript check
   - Ensure no broken references
   - Confirm project builds successfully

### 8. Common File Relocations

#### Component Files
```bash
# Wrong location
src/app/components/button.tsx

# Correct location
src/components/ui/button.tsx  # If shadcn component
src/components/shared/custom-button.tsx  # If custom (avoid!)
```

#### Utility Functions
```bash
# Wrong location
src/app/utils/format-date.ts

# Correct location
src/lib/utils/format-date.ts
```

#### Type Definitions
```bash
# Wrong location
src/app/types.ts

# Correct location
src/types/app.types.ts
```

#### Business Logic
```bash
# Wrong location
src/components/booking-logic.ts

# Correct location
src/lib/data-access/bookings/index.ts
```

### 9. Import Path Updates

After moving files, update imports:
```typescript
// Before move
import { Button } from '../../../components/button'

// After move (using path alias)
import { Button } from '@/components/ui/button'
```

### 10. Cleanup Checklist

- [ ] All files in correct feature-based directories
- [ ] All files use kebab-case naming
- [ ] No duplicate files or versions
- [ ] No unnecessary re-export files
- [ ] All imports updated and working
- [ ] No folders with >10 files or >10 subfolders
- [ ] No empty directories
- [ ] All imports use @ path aliases for cross-directory
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes with zero errors

## Commands
```bash
# Find large files
find src -name "*.ts*" -exec wc -l {} + | sort -rn | head -20

# Find duplicate file names
find src -name "*.ts*" -exec basename {} \; | sort | uniq -d

# Check for broken imports
npm run typecheck

# Find empty directories
find src -type d -empty

# Count files per directory
find src -type f -name "*.ts*" | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn
```

## Success Criteria
- ALL files in logical, correct locations
- ZERO misplaced files
- ZERO duplicate files
- ALL files under 500 lines
- ALL folders within limits (10 files, 10 subfolders)
- ALL naming conventions consistent (kebab-case)
- ALL imports using proper @ path aliases
- ZERO broken imports
- ZERO empty directories