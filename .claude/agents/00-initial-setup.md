# Agent 00: Initial Setup & Project Foundation

## Executive Summary
This agent establishes the complete project foundation, environment setup, and initial architecture for the B2B SaaS platform. This is the FIRST agent to run for any new project or major reorganization.

## Core Mandate: Perfect Foundation

### Setup Philosophy
```
STRONG FOUNDATION → SCALABLE ARCHITECTURE → SUCCESSFUL PROJECT
```

## PHASE 1: PROJECT INITIALIZATION

### Environment Setup & Verification
```typescript
class ProjectInitializer {
  async initializeProject(): Promise<InitializationReport> {
    const steps = [
      this.verifyNodeVersion(),        // Node 20+
      this.verifyPackageManager(),     // npm/pnpm/yarn
      this.installDependencies(),       // All packages
      this.setupEnvironmentVariables(), // .env files
      this.verifySupabaseConnection(), // Database connection
      this.setupGitHooks(),            // Husky pre-commit
      this.initializeTypeScript(),     // tsconfig.json
      this.setupESLint(),              // ESLint config
      this.configureTurbopack(),       // Next.js optimization
      this.setupVSCodeSettings()       // Editor config
    ]
    
    const results = await Promise.all(steps)
    return this.generateReport(results)
  }
  
  async verifyEnvironment(): Promise<EnvironmentCheck> {
    return {
      node: process.version,
      npm: await this.getVersion('npm'),
      nextjs: await this.getPackageVersion('next'),
      typescript: await this.getPackageVersion('typescript'),
      supabase: await this.checkSupabaseConnection(),
      required: {
        node: '>=20.0.0',
        npm: '>=10.0.0',
        nextjs: '>=14.2.0',
        typescript: '>=5.3.0'
      }
    }
  }
}
```

### Required Environment Variables
```bash
# .env.local - MUST BE CONFIGURED
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe Configuration (B2B Payments)
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="FigDream"
NEXT_PUBLIC_SUPPORT_EMAIL=support@figdream.com

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MARKETING=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

## PHASE 2: PROJECT STRUCTURE CREATION

### Directory Structure Setup
```typescript
class ProjectStructureCreator {
  async createStructure(): Promise<void> {
    const structure = {
      // Source directories
      'src/app': {
        '(public)': ['(auth)', 'about', 'pricing', 'contact'],
        'super-admin': ['dashboard', 'subscriptions', 'salons', 'monitoring'],
        'salon-owner': ['dashboard', 'staff', 'services', 'analytics'],
        'location-manager': ['dashboard', 'schedule', 'reports'],
        'staff-member': ['dashboard', 'appointments', 'earnings'],
        'customer': ['dashboard', 'booking', 'profile', 'loyalty'],
        '_actions': [], // Server actions
        'api': ['webhooks', 'cron', 'public']
      },
      
      'src/components': {
        'ui': [], // shadcn/ui components only
        'shared': ['navigation', 'layouts', 'forms'],
        'super-admin': [],
        'salon-owner': [],
        'location-manager': [],
        'staff': [],
        'customer': []
      },
      
      'src/lib': {
        'supabase': ['client.ts', 'server.ts', 'types.ts'],
        'auth': ['guards.ts', 'session.ts', 'permissions.ts'],
        'data-access': [], // Repository pattern
        'utils': ['cn.ts', 'format.ts', 'validate.ts'],
        'hooks': [], // Custom React hooks
        'constants': ['routes.ts', 'config.ts']
      },
      
      'src/types': [
        'database.types.ts',  // Supabase generated
        'auth.types.ts',      // Auth types
        'app.types.ts'        // Application types
      ],
      
      'src/domains': {
        'subscription': ['entities', 'use-cases', 'repositories'],
        'salon': ['entities', 'use-cases', 'repositories'],
        'booking': ['entities', 'use-cases', 'repositories'],
        'staff': ['entities', 'use-cases', 'repositories'],
        'customer': ['entities', 'use-cases', 'repositories']
      },
      
      // Configuration files
      'docs': {
        'architecture': ['rules.md', 'decisions.md'],
        'api': ['endpoints.md', 'webhooks.md'],
        'database': ['schema.md', 'migrations.md']
      },
      
      'scripts': [
        'generate-types.ts',
        'seed-database.ts',
        'check-coverage.ts'
      ],
      
      '.claude': {
        'agents': [], // This directory
        'hooks': []   // Claude hooks
      }
    }
    
    await this.createDirectories(structure)
    await this.createConfigFiles()
    await this.createInitialFiles()
  }
}
```

## PHASE 3: CONFIGURATION FILES

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### ESLint Configuration
```javascript
// eslint.config.mjs
import eslint from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsparser from '@typescript-eslint/parser'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import next from '@next/eslint-plugin-next'

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react': react,
      'react-hooks': reactHooks,
      '@next/next': next
    },
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      
      // React
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // General
      'no-console': 'error',
      'no-debugger': 'error',
      
      // Complexity
      'complexity': ['error', 10],
      'max-lines': ['error', 500]
    }
  }
]
```

### Next.js Configuration
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    // Enable Turbopack
    turbo: {
      resolveAlias: {
        '@': './src'
      }
    },
    
    // Partial Prerendering
    ppr: true,
    
    // Server Actions
    serverActions: {
      bodySizeLimit: '2mb',
      allowedOrigins: process.env.NODE_ENV === 'production' 
        ? ['https://yourdomain.com'] 
        : ['http://localhost:3000']
    },
    
    // Optimize packages
    optimizePackageImports: [
      '@supabase/supabase-js',
      '@supabase/ssr',
      'date-fns',
      'zod',
      'react-hook-form'
    ]
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co'
      }
    ]
  },
  
  // Security headers
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        }
      ]
    }
  ]
}

export default nextConfig
```

## PHASE 4: DATABASE SETUP

### Generate TypeScript Types from Supabase
```bash
#!/bin/bash
# scripts/generate-types.sh

# Generate database types
npx supabase gen types typescript \
  --project-id "$SUPABASE_PROJECT_ID" \
  --schema public \
  > src/types/database.types.ts

# Generate auth types
npx supabase gen types typescript \
  --project-id "$SUPABASE_PROJECT_ID" \
  --schema auth \
  > src/types/auth.types.ts

echo "✅ Types generated successfully"
```

### Initial Database Seed
```typescript
// scripts/seed-database.ts
import { createClient } from '@supabase/supabase-js'

async function seedDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Create platform plans
  const plans = [
    {
      name: 'Basic',
      price: 29,
      features: {
        staff: 5,
        locations: 1,
        appointments: 500
      }
    },
    {
      name: 'Professional',
      price: 59,
      features: {
        staff: 20,
        locations: 3,
        appointments: 2000
      }
    },
    {
      name: 'Enterprise',
      price: 99,
      features: {
        staff: 100,
        locations: 10,
        appointments: 10000
      }
    }
  ]
  
  for (const plan of plans) {
    await supabase.from('platform_plans').insert(plan)
  }
  
  console.log('✅ Database seeded successfully')
}

seedDatabase()
```

## PHASE 5: INITIAL COMPONENTS

### Root Layout Setup
```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FigDream - Salon Management Platform',
  description: 'Enterprise B2B SaaS for salon management'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
```

### Supabase Client Setup
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export async function createClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        }
      }
    }
  )
}
```

## PHASE 6: GIT & VERSION CONTROL

### Git Hooks Setup
```json
// package.json additions
{
  "scripts": {
    "prepare": "husky install",
    "pre-commit": "npm run typecheck && npm run lint",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix"
  }
}
```

### Husky Pre-commit Hook
```bash
#!/usr/bin/env sh
# .husky/pre-commit

npm run typecheck
npm run lint
```

## PHASE 7: VALIDATION & VERIFICATION

### Setup Validation Script
```typescript
// scripts/validate-setup.ts
class SetupValidator {
  async validate(): Promise<ValidationReport> {
    const checks = [
      this.checkNodeVersion(),
      this.checkDependencies(),
      this.checkEnvironmentVariables(),
      this.checkDatabaseConnection(),
      this.checkTypeScriptConfig(),
      this.checkESLintConfig(),
      this.checkDirectoryStructure(),
      this.checkGitHooks()
    ]
    
    const results = await Promise.all(checks)
    const passed = results.every(r => r.passed)
    
    if (!passed) {
      console.error('❌ Setup validation failed')
      results.forEach(r => {
        if (!r.passed) {
          console.error(`  - ${r.name}: ${r.error}`)
        }
      })
      process.exit(1)
    }
    
    console.log('✅ All setup validations passed!')
    return { passed, results }
  }
}
```

## SUCCESS CRITERIA

### Environment Ready
- ✅ Node.js 20+ installed
- ✅ All dependencies installed
- ✅ Environment variables configured
- ✅ Supabase connection verified
- ✅ TypeScript configured

### Structure Created
- ✅ All directories created
- ✅ Configuration files in place
- ✅ Initial components setup
- ✅ Database types generated
- ✅ Git hooks configured

### Quality Gates
- ✅ TypeScript strict mode enabled
- ✅ ESLint configured with zero tolerance
- ✅ Pre-commit hooks active
- ✅ Turbopack enabled
- ✅ Security headers configured

## COMMANDS

```bash
# Initialize project
npm install

# Generate types
npm run generate:types

# Seed database
npm run seed:database

# Validate setup
npm run validate:setup

# Start development
npm run dev
```

## Remember: Foundation Determines Success

A strong foundation prevents technical debt and enables rapid, confident development.

**"Well begun is half done."** - Aristotle