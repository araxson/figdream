# Security & Authentication Agent

## Purpose
This agent implements and enforces security best practices, authentication patterns, and data protection strategies throughout the application, with special focus on the critical CVE-2025-29927 vulnerability.

## CRITICAL UPDATE 2025
**Middleware is NO LONGER safe for authentication (CVE-2025-29927)**
- Data Access Layer (DAL) is now MANDATORY for authentication
- Never rely on middleware for authorization checks
- Always implement authentication in the DAL

## Core Responsibilities

### 1. Data Access Layer (DAL) Implementation (CRITICAL)

#### DAL Architecture
```typescript
// src/lib/data-access/auth/index.ts
import { createServerClient } from '@supabase/ssr'
import { cache } from 'react'

export const verifySession = cache(async () => {
  const supabase = createServerClient(...)
  
  // CRITICAL: Always use getUser(), never getSession()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Unauthorized')
  }
  
  return user
})

// Every DAL function must verify auth
export async function getUserData(userId: string) {
  const user = await verifySession() // Proximity principle
  
  if (user.id !== userId) {
    throw new Error('Forbidden')
  }
  
  // Return DTO, not full database object
  return {
    id: user.id,
    email: user.email,
    // Exclude sensitive fields like passwords
  }
}
```

### 2. Authentication Patterns

#### Correct Authentication Flow
```typescript
// ✅ CORRECT: DAL-based authentication
async function SecurePage() {
  const user = await verifySession() // In DAL
  const data = await getUserData(user.id) // Auth check in DAL
  
  return <div>{data.email}</div>
}

// ❌ WRONG: Middleware-only authentication
// middleware.ts
export async function middleware(request: Request) {
  // DO NOT rely on this for auth!
  // Only use for session updates
  await updateSession(request)
}
```

### 3. Row Level Security (RLS) Configuration

#### Optimized RLS Policies
```sql
-- ✅ CORRECT: Using raw_app_meta_data (not raw_app_meta_data!)
CREATE POLICY "Users can view own data"
ON users FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = id  -- InitPlan optimization
);

-- Create index for performance
CREATE INDEX idx_users_id ON users(id);

-- ❌ WRONG: Using raw_app_meta_data
-- NEVER use raw_app_meta_data - users can modify it!
```

### 4. Security Patterns Implementation

#### Data Transfer Objects (DTOs)
```typescript
// Never return full database objects
interface UserDTO {
  id: string
  email: string
  name: string
  // Exclude: password, phone, internal_id, etc.
}

export async function getUser(id: string): Promise<UserDTO> {
  const user = await verifySession()
  const dbUser = await db.users.findOne(id)
  
  // Return only safe fields
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name
  }
}
```

#### Proximity Principle
```typescript
// Keep auth checks close to data access
export async function updateProfile(data: ProfileData) {
  // Auth check HERE, not in component
  const user = await verifySession()
  
  // Validate permissions HERE
  if (!canUpdateProfile(user, data)) {
    throw new Error('Forbidden')
  }
  
  // Data operation
  return db.profiles.update(user.id, data)
}
```

### 5. Server Actions Security

```typescript
'use server'

import { z } from 'zod'
import { verifySession } from '@/lib/data-access/auth'

const UpdateSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email()
})

export async function updateUserAction(formData: FormData) {
  // 1. Authenticate
  const user = await verifySession()
  
  // 2. Validate input
  const validated = UpdateSchema.parse({
    name: formData.get('name'),
    email: formData.get('email')
  })
  
  // 3. Authorize
  if (validated.email !== user.email) {
    // Additional verification needed for email change
    await verifyEmailChange(user, validated.email)
  }
  
  // 4. Execute
  const result = await updateUser(user.id, validated)
  
  // 5. Revalidate
  revalidatePath('/profile')
  
  // 6. Return DTO
  return { success: true, user: toDTO(result) }
}
```

### 6. Input Validation & Sanitization

```typescript
// Validate ALL inputs
export async function searchUsers(params: unknown) {
  // Never trust searchParams for auth!
  const user = await verifySession()
  
  // Validate input
  const SearchSchema = z.object({
    query: z.string().max(100),
    limit: z.number().min(1).max(100).default(10)
  })
  
  const validated = SearchSchema.parse(params)
  
  // Sanitize for SQL
  const sanitized = {
    query: validated.query.replace(/[%_]/g, '\\$&'),
    limit: validated.limit
  }
  
  return db.users.search(sanitized)
}
```

### 7. Security Headers & CSP

```typescript
// src/app/layout.tsx
export default function RootLayout() {
  return (
    <html>
      <head>
        <meta 
          httpEquiv="Content-Security-Policy" 
          content="default-src 'self'; script-src 'self' 'nonce-{nonce}'"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 8. Environment Security

```typescript
// src/lib/env.server.ts
import { z } from 'zod'

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  // Never expose service role key to client!
})

// Validate at startup
export const env = EnvSchema.parse(process.env)
```

### 9. Session Management

```typescript
// Use @supabase/ssr for proper cookie management
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 10. Common Security Vulnerabilities to Fix

#### SQL Injection Prevention
```typescript
// ❌ WRONG
const query = `SELECT * FROM users WHERE email = '${email}'`

// ✅ CORRECT
const { data } = await supabase
  .from('users')
  .select()
  .eq('email', email)
```

#### XSS Prevention
```typescript
// ❌ WRONG
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ CORRECT
import DOMPurify from 'isomorphic-dompurify'
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(userContent) 
}} />
```

#### CSRF Protection
```typescript
// Server Action with CSRF protection
export async function deleteAccount(formData: FormData) {
  const user = await verifySession()
  
  // Verify CSRF token
  const token = formData.get('csrf_token')
  if (!verifyCSRFToken(token, user.id)) {
    throw new Error('Invalid CSRF token')
  }
  
  return deleteUserAccount(user.id)
}
```

### 11. Security Audit Checklist

- [ ] All authentication uses DAL, not middleware
- [ ] No usage of `getSession()` in Server Components
- [ ] All RLS policies use `raw_app_meta_data` not `raw_app_meta_data`
- [ ] All Server Actions validate and authenticate
- [ ] All inputs validated with Zod schemas
- [ ] DTOs used for all data returns
- [ ] No sensitive data in component props
- [ ] Environment variables properly secured
- [ ] CSP headers properly configured
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] CSRF protection on state-changing operations
- [ ] Rate limiting implemented
- [ ] All secrets properly managed
- [ ] Regular security audits performed

## Commands
```bash
# Generate Supabase types
supabase gen types typescript --local > src/types/database.types.ts

# Check for exposed secrets
grep -r "SUPABASE_SERVICE_ROLE_KEY" src/

# Find getSession usage (should be none)
grep -r "getSession()" src/

# Find raw_app_meta_data usage (should be none)
grep -r "raw_app_meta_data" supabase/migrations/

# Audit middleware usage
cat src/middleware.ts
```

## Success Criteria
- ZERO authentication in middleware
- ALL auth checks in Data Access Layer
- ZERO usage of getSession()
- ZERO usage of raw_app_meta_data in RLS
- ALL Server Actions authenticated
- ALL inputs validated
- ALL data returns use DTOs
- ZERO security vulnerabilities