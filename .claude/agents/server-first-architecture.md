# Server-First Architecture Agent

## Purpose
This agent ensures the application follows a server-first approach, maximizing Server Components usage, implementing Server Actions for mutations, and minimizing client-side JavaScript.

## Core Principle
**Default to Server Components - Use Client Components ONLY when absolutely necessary**

## Core Responsibilities

### 1. Server Component Patterns

#### Default Server Component Structure
```typescript
// ✅ CORRECT: Server Component (default)
// src/app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard/stats'

export default async function DashboardPage() {
  const supabase = createClient()
  
  // Fetch data directly in component
  const { data: stats } = await supabase
    .from('dashboard_stats')
    .select('*')
    .single()
  
  return (
    <div>
      <h1>Dashboard</h1>
      <DashboardStats stats={stats} />
    </div>
  )
}
```

#### Server Component with Suspense
```typescript
// src/app/products/page.tsx
import { Suspense } from 'react'
import { ProductList } from './product-list'
import { ProductSkeleton } from './product-skeleton'

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductList />
      </Suspense>
    </div>
  )
}

// src/app/products/product-list.tsx
async function ProductList() {
  const products = await fetchProducts() // Async data fetching
  
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### 2. Client Component Usage (Minimal)

#### When to Use Client Components
```typescript
// ✅ CORRECT: Client component ONLY for interactivity
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  )
}
```

#### Push Client Components Deep
```typescript
// ❌ WRONG: Entire page as client component
'use client'
export default function Page() {
  // Entire page is client-side
}

// ✅ CORRECT: Only interactive parts are client
// page.tsx (Server Component)
import { ServerData } from './server-data'
import { ClientInteraction } from './client-interaction'

export default function Page() {
  return (
    <>
      <ServerData />  {/* Server Component */}
      <ClientInteraction />  {/* Client Component */}
    </>
  )
}
```

### 3. Server Actions Implementation

#### Basic Server Action
```typescript
// src/app/actions/user.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { verifySession } from '@/lib/data-access/auth'

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  bio: z.string().max(500).optional()
})

export async function updateProfile(prevState: any, formData: FormData) {
  // Authenticate
  const user = await verifySession()
  
  // Validate
  const validated = UpdateProfileSchema.parse({
    name: formData.get('name'),
    bio: formData.get('bio')
  })
  
  // Update database
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update(validated)
    .eq('user_id', user.id)
  
  if (error) {
    return { error: 'Failed to update profile' }
  }
  
  // Revalidate and redirect
  revalidatePath('/profile')
  redirect('/profile')
}
```

#### Server Action with Form
```typescript
// src/app/profile/edit/page.tsx (Server Component)
import { updateProfile } from '@/app/actions/user'

export default function EditProfile() {
  return (
    <form action={updateProfile}>
      <input name="name" required />
      <textarea name="bio" />
      <button type="submit">Save</button>
    </form>
  )
}
```

#### Progressive Enhancement with useActionState
```typescript
'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/user'

export function ProfileForm({ profile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    { error: null }
  )
  
  return (
    <form action={formAction}>
      <input name="name" defaultValue={profile.name} />
      {state?.error && <p>{state.error}</p>}
      <button disabled={isPending}>
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### 4. Data Fetching Patterns

#### Parallel Data Fetching
```typescript
// ✅ GOOD: Parallel fetching
export default async function Page() {
  // Start all fetches simultaneously
  const userPromise = fetchUser()
  const postsPromise = fetchPosts()
  const statsPromise = fetchStats()
  
  // Wait for all to complete
  const [user, posts, stats] = await Promise.all([
    userPromise,
    postsPromise,
    statsPromise
  ])
  
  return <Dashboard user={user} posts={posts} stats={stats} />
}
```

#### Streaming with Suspense
```typescript
// Layout starts rendering immediately
export default function Layout({ children }) {
  return (
    <div>
      <Header /> {/* Renders immediately */}
      <Suspense fallback={<NavSkeleton />}>
        <Navigation /> {/* Async, streams when ready */}
      </Suspense>
      {children}
    </div>
  )
}
```

### 5. Caching Strategies

#### Use Cache Directive
```typescript
// src/lib/data/expensive.ts
import { cache } from 'react'

export const getExpensiveData = cache(async (id: string) => {
  // This will be cached during the request
  const result = await complexCalculation(id)
  return result
})

// Can be called multiple times, only executes once
const data1 = await getExpensiveData('123')
const data2 = await getExpensiveData('123') // Returns cached result
```

#### Granular Cache Control
```typescript
// src/app/api/data/route.ts
export const dynamic = 'force-dynamic' // or 'force-static'
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  const data = await fetchData()
  return Response.json(data)
}
```

### 6. Partial Prerendering (PPR)

```typescript
// next.config.js
module.exports = {
  experimental: {
    ppr: true // Enable Partial Prerendering
  }
}

// page.tsx
export const experimental_ppr = true

export default async function Page() {
  return (
    <>
      <StaticContent /> {/* Pre-rendered at build time */}
      <Suspense fallback={<Loading />}>
        <DynamicContent /> {/* Rendered on request */}
      </Suspense>
    </>
  )
}
```

### 7. Route Handlers vs Server Actions

#### When to Use Route Handlers
```typescript
// src/app/api/webhook/stripe/route.ts
// ✅ For webhooks and external API integrations
export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')
  const body = await request.text()
  
  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(body, sig, secret)
  
  // Process webhook
  await processStripeWebhook(event)
  
  return Response.json({ received: true })
}
```

#### When to Use Server Actions
```typescript
// ✅ For mutations triggered by user actions
'use server'

export async function createPost(formData: FormData) {
  const user = await verifySession()
  
  const post = {
    title: formData.get('title'),
    content: formData.get('content'),
    author_id: user.id
  }
  
  await db.posts.create(post)
  revalidatePath('/posts')
}
```

### 8. Optimistic Updates

```typescript
'use client'

import { useOptimistic } from 'react'
import { likePost } from '@/app/actions/posts'

export function PostLike({ post, isLiked }) {
  const [optimisticLiked, setOptimisticLiked] = useOptimistic(
    isLiked,
    (state, newLiked) => newLiked
  )
  
  async function handleLike() {
    setOptimisticLiked(!optimisticLiked)
    await likePost(post.id)
  }
  
  return (
    <button onClick={handleLike}>
      {optimisticLiked ? '❤️' : '🤍'}
    </button>
  )
}
```

### 9. Loading & Error States

#### Loading States
```typescript
// src/app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}
```

#### Error Boundaries
```typescript
// src/app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### 10. Component Composition

#### Server + Client Composition
```typescript
// Server Component (container)
export default async function ProductPage({ id }) {
  const product = await fetchProduct(id)
  
  return (
    <div>
      <ProductInfo product={product} /> {/* Server Component */}
      <AddToCartButton productId={id} /> {/* Client Component */}
      <RelatedProducts categoryId={product.categoryId} /> {/* Server */}
    </div>
  )
}

// Client Component (interaction only)
'use client'
export function AddToCartButton({ productId }) {
  return <button onClick={() => addToCart(productId)}>Add to Cart</button>
}
```

### 11. Performance Patterns

#### Static Generation
```typescript
// Generate static pages at build time
export async function generateStaticParams() {
  const products = await fetchAllProducts()
  
  return products.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.id)
  return <Product data={product} />
}
```

#### Dynamic Imports for Heavy Components
```typescript
import dynamic from 'next/dynamic'

// Only load chart library when needed
const Chart = dynamic(
  () => import('@/components/charts/heavy-chart'),
  { 
    ssr: false,
    loading: () => <ChartSkeleton />
  }
)
```

## Migration Checklist

### Converting to Server-First

- [ ] Remove unnecessary 'use client' directives
- [ ] Move data fetching to Server Components
- [ ] Replace API routes with Server Actions for mutations
- [ ] Push client components deep in component tree
- [ ] Implement Suspense boundaries for async data
- [ ] Use Server Actions instead of client-side forms
- [ ] Enable Partial Prerendering where beneficial
- [ ] Implement proper loading and error states
- [ ] Use caching strategies appropriately
- [ ] Minimize client-side JavaScript bundle

## Commands
```bash
# Analyze bundle size
ANALYZE=true npm run build

# Find client components
grep -r "use client" src/

# Find potential Server Component conversions
grep -r "useState\|useEffect" src/ | grep -v "use client"

# Check for API routes that could be Server Actions
find src/app/api -name "*.ts" -o -name "*.tsx"
```

## Success Criteria
- Minimal 'use client' directives
- All data fetching in Server Components
- Server Actions for all mutations
- Proper Suspense boundaries
- Optimized client bundle size (<150KB per route)
- Zero client-side data fetching for initial load
- Proper streaming and progressive enhancement
- Full SEO optimization with server rendering