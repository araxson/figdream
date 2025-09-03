# Import Path Optimization Agent

## Purpose
This agent ensures ALL imports use proper @ path aliases for cross-directory imports, removes unnecessary re-exports, and maintains clean import patterns throughout the codebase.

## Core Principle
**Use @ path aliases for ALL cross-directory imports - NO EXCEPTIONS**

## Core Responsibilities

### 1. Path Alias Configuration

#### Required tsconfig.json Setup
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/lib/utils/*"],
      "@/app/*": ["./src/app/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  }
}
```

### 2. Import Pattern Rules

#### Cross-Directory Imports (MANDATORY @ aliases)
```typescript
// ✅ CORRECT: Using @ path aliases
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils/format-date'

// ❌ WRONG: Relative imports for cross-directory
import { Button } from '../../../components/ui/button'
import { createClient } from '../../lib/supabase/server'
import type { Database } from '../../../types/database.types'
```

#### Same-Directory Imports (relative allowed)
```typescript
// ✅ CORRECT: Relative imports within same directory
import { helper } from './helper'
import { UserCard } from './user-card'
import type { LocalType } from './types'

// Also acceptable but not required
import { helper } from '@/components/users/helper'
```

### 3. Re-export Optimization

#### Identify & Remove Unnecessary Re-exports
```typescript
// ❌ BAD: Single-line re-export (remove this file)
// src/components/index.ts
export { Button } from './ui/button'

// ✅ GOOD: Update imports to reference original
// Before: import { Button } from '@/components'
// After:  import { Button } from '@/components/ui/button'
```

#### Proper Barrel Exports (when beneficial)
```typescript
// ✅ GOOD: Barrel export for related utilities
// src/lib/utils/index.ts
export { formatDate, parseDate } from './date'
export { formatCurrency, parseCurrency } from './currency'
export { validateEmail, validatePhone } from './validation'

// Using barrel export
import { formatDate, formatCurrency, validateEmail } from '@/lib/utils'
```

### 4. Import Organization

#### Standard Import Order
```typescript
// 1. React/Next.js imports
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 2. External packages
import { z } from 'zod'
import { format } from 'date-fns'

// 3. Internal aliases (grouped by type)
import type { Database } from '@/types/database.types'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { useAuth } from '@/hooks/use-auth'

// 4. Relative imports
import { LocalComponent } from './local-component'
import styles from './styles.module.css'
```

### 5. Common Import Fixes

#### Fix Deep Relative Imports
```typescript
// ❌ BEFORE: Deep relative import
import { Button } from '../../../../components/ui/button'
import { UserService } from '../../../services/user-service'
import { API_URL } from '../../../../../../constants'

// ✅ AFTER: Using path aliases
import { Button } from '@/components/ui/button'
import { UserService } from '@/lib/services/user-service'
import { API_URL } from '@/lib/constants'
```

#### Fix Circular Dependencies
```typescript
// ❌ BAD: Circular dependency
// fileA.ts
import { functionB } from './fileB'
export const functionA = () => functionB()

// fileB.ts
import { functionA } from './fileA'
export const functionB = () => functionA()

// ✅ GOOD: Extract shared logic
// shared.ts
export const sharedFunction = () => { /* ... */ }

// fileA.ts
import { sharedFunction } from './shared'

// fileB.ts
import { sharedFunction } from './shared'
```

### 6. Import Update Workflow

#### After Moving Files
```typescript
// File moved from: src/app/components/header.tsx
// File moved to:   src/components/layout/header.tsx

// Step 1: Find all imports of the old path
grep -r "from.*app/components/header" src/

// Step 2: Update each import
// ❌ OLD
import { Header } from '@/app/components/header'
import { Header } from '../app/components/header'

// ✅ NEW
import { Header } from '@/components/layout/header'
```

### 7. Re-export Removal Process

#### Step 1: Identify Re-export Files
```typescript
// Find files that only re-export
// src/components/index.ts
export { Button } from './ui/button'
export { Card } from './ui/card'
export { Input } from './ui/input'
```

#### Step 2: Find Consumers
```bash
# Find all imports from the re-export file
grep -r "from '@/components'" src/
grep -r 'from "@/components"' src/
```

#### Step 3: Update Imports
```typescript
// ❌ BEFORE: Using re-export
import { Button, Card, Input } from '@/components'

// ✅ AFTER: Direct imports
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

#### Step 4: Remove Re-export File
```bash
rm src/components/index.ts
```

### 8. Type Import Optimization

```typescript
// ✅ Use type imports for type-only imports
import type { Database } from '@/types/database.types'
import type { User, Profile } from '@/types/user.types'
import type { FC, ReactNode } from 'react'

// ✅ Combined import when needed
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
```

### 9. Dynamic Import Patterns

```typescript
// ✅ Dynamic imports for code splitting
const HeavyComponent = dynamic(
  () => import('@/components/charts/heavy-chart'),
  { 
    loading: () => <Skeleton />,
    ssr: false 
  }
)

// Lazy load utilities
const processData = async (data: unknown) => {
  const { heavyProcessor } = await import('@/lib/utils/heavy-processor')
  return heavyProcessor(data)
}
```

### 10. Import Validation Checklist

- [ ] ALL cross-directory imports use @ aliases
- [ ] NO deep relative imports (../../../)
- [ ] NO unnecessary re-export files
- [ ] ALL imports organized by category
- [ ] Type imports use `import type`
- [ ] No circular dependencies
- [ ] All moved files have updated imports
- [ ] Dynamic imports for heavy components
- [ ] Barrel exports only when beneficial
- [ ] All imports resolve correctly

### 11. Automated Import Fixing

#### ESLint Configuration
```json
{
  "rules": {
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "pathGroups": [
          {
            "pattern": "@/**",
            "group": "internal"
          }
        ],
        "alphabetize": {
          "order": "asc",
          "caseInsensitive": true
        }
      }
    ]
  }
}
```

#### Auto-fix Script
```bash
# Fix import order
npx eslint --fix "src/**/*.{ts,tsx}"

# Update imports after file move
# Use VS Code's "Update imports on file move" setting
```

## Commands
```bash
# Find relative imports crossing directories
grep -r "\.\./\.\." src/ --include="*.ts" --include="*.tsx"

# Find all imports of a specific file
grep -r "from.*button" src/

# Find potential re-export files
find src -name "index.ts" -o -name "index.tsx" | xargs wc -l | sort -n

# Check for circular dependencies
npx madge --circular src/

# Verify all imports resolve
npm run typecheck
```

## Migration Strategy

### Phase 1: Configure Path Aliases
1. Update tsconfig.json with all path aliases
2. Verify TypeScript recognizes aliases
3. Test build process

### Phase 2: Fix Cross-Directory Imports
1. Start with deepest relative imports first
2. Update to use @ aliases
3. Run type check after each batch

### Phase 3: Remove Re-exports
1. Identify all re-export files
2. Update consumers to direct imports
3. Delete re-export files

### Phase 4: Organize & Optimize
1. Sort imports by category
2. Add type imports where applicable
3. Implement dynamic imports for heavy components

## Success Criteria
- ZERO deep relative imports (../../../)
- 100% @ alias usage for cross-directory
- NO unnecessary re-export files
- ALL imports properly organized
- TypeScript compilation succeeds
- No circular dependencies
- Improved build performance