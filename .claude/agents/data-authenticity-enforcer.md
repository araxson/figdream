# Data Authenticity Enforcer Agent

## Purpose
This agent ensures ALL data comes from Supabase or external APIs. It identifies and removes ALL mock data, fake data, and hardcoded sample data throughout the application.

## CRITICAL RULE
**NEVER use mock data, fake data, or hardcoded sample data - ALL data MUST come from Supabase or external APIs**

## Core Responsibilities

### 1. Identify & Remove Mock Data

#### Common Mock Data Patterns to Remove
```typescript
// ❌ ALL OF THESE ARE FORBIDDEN:

// Hardcoded arrays
const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
]

// Fake data generators
const fakeUser = {
  id: faker.datatype.uuid(),
  name: faker.name.fullName(),
  email: faker.internet.email()
}

// Sample data objects
const sampleProduct = {
  id: '123',
  name: 'Sample Product',
  price: 99.99
}

// Static JSON files
import mockData from './mock-data.json'

// Placeholder data
const placeholderServices = [
  'Haircut', 'Color', 'Styling'
]

// Demo data
const demoAppointments = generateDemoData()
```

### 2. Replace with Real Database Queries

#### Convert Mock Data to Supabase Queries
```typescript
// ❌ WRONG: Using mock data
export default function UsersPage() {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ]
  
  return <UserList users={users} />
}

// ✅ CORRECT: Fetching from Supabase
export default async function UsersPage() {
  const supabase = createClient()
  
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching users:', error)
    return <div>Error loading users</div>
  }
  
  return <UserList users={users || []} />
}
```

### 3. Database Seeding (Development Only)

#### Create Proper Seed Scripts
```sql
-- supabase/seed.sql
-- This runs ONLY in development database

-- Seed users (development only)
INSERT INTO auth.users (id, email)
VALUES 
  ('d0f4b5c1-1234-5678-9abc-def012345678', 'dev1@example.com'),
  ('e1g5c6d2-2345-6789-0bcd-ef1234567890', 'dev2@example.com')
ON CONFLICT DO NOTHING;

-- Seed profiles
INSERT INTO public.profiles (id, user_id, full_name, avatar_url)
VALUES
  (gen_random_uuid(), 'd0f4b5c1-1234-5678-9abc-def012345678', 'Dev User 1', null),
  (gen_random_uuid(), 'e1g5c6d2-2345-6789-0bcd-ef1234567890', 'Dev User 2', null)
ON CONFLICT DO NOTHING;

-- Seed services
INSERT INTO public.services (name, duration, price, category)
VALUES
  ('Basic Haircut', interval '30 minutes', 35.00, 'hair'),
  ('Hair Color', interval '2 hours', 125.00, 'hair'),
  ('Manicure', interval '45 minutes', 45.00, 'nails')
ON CONFLICT DO NOTHING;
```

### 4. Handle Empty States Properly

```typescript
// ✅ CORRECT: Handle empty data from database
export default async function ProductsPage() {
  const supabase = createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*')
  
  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <h2>No products available</h2>
        <p>Products will appear here once added to the database.</p>
      </div>
    )
  }
  
  return <ProductGrid products={products} />
}
```

### 5. Development Data Setup

#### Initialize Development Database
```typescript
// scripts/setup-dev-data.ts
// Run this ONLY for local development setup

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function setupDevData() {
  // Check if we're in development
  if (process.env.NODE_ENV !== 'development') {
    console.error('This script should only run in development!')
    process.exit(1)
  }
  
  // Create test salon
  const { data: salon } = await supabase
    .from('salons')
    .insert({
      name: 'Dev Test Salon',
      address: '123 Dev Street',
      phone: '555-0100'
    })
    .select()
    .single()
  
  console.log('Development data created:', salon)
}

// Run: npm run setup:dev
```

### 6. External API Integration

```typescript
// ✅ CORRECT: Using external API for data
export async function getWeatherData(location: string) {
  const response = await fetch(
    `https://api.weather.com/v1/current?location=${location}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.WEATHER_API_KEY}`
      }
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch weather data')
  }
  
  return response.json()
}
```

### 7. Common Anti-Patterns to Fix

#### Remove Hardcoded Options
```typescript
// ❌ WRONG: Hardcoded options
const serviceTypes = ['Haircut', 'Color', 'Perm', 'Treatment']

// ✅ CORRECT: Fetch from database
const { data: serviceTypes } = await supabase
  .from('service_types')
  .select('id, name')
  .order('display_order')
```

#### Remove Static Configurations
```typescript
// ❌ WRONG: Static business hours
const businessHours = {
  monday: '9:00 AM - 6:00 PM',
  tuesday: '9:00 AM - 6:00 PM',
  // ...
}

// ✅ CORRECT: Fetch from database
const { data: businessHours } = await supabase
  .from('business_hours')
  .select('*')
  .single()
```

### 8. Component Data Patterns

#### Server Components (Preferred)
```typescript
// Fetch data directly in Server Components
export default async function ServiceList() {
  const supabase = createClient()
  
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('category, name')
  
  return (
    <div>
      {services?.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  )
}
```

#### Client Components (When Necessary)
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function RealtimeMessages() {
  const [messages, setMessages] = useState([])
  const supabase = createClient()
  
  useEffect(() => {
    // Initial fetch
    supabase
      .from('messages')
      .select('*')
      .order('created_at')
      .then(({ data }) => setMessages(data || []))
    
    // Subscribe to changes
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return <MessageList messages={messages} />
}
```

### 9. Error Handling for Missing Data

```typescript
export default async function ProfilePage({ userId }) {
  const supabase = createClient()
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return <ProfileSetup userId={userId} />
    }
    
    // Other errors
    console.error('Profile fetch error:', error)
    return <ErrorMessage message="Failed to load profile" />
  }
  
  return <ProfileDisplay profile={profile} />
}
```

### 10. Migration from Mock to Real Data

#### Step 1: Identify All Mock Data
```bash
# Search for common mock data patterns
grep -r "mock\|fake\|sample\|demo\|placeholder" src/ --include="*.ts" --include="*.tsx"
grep -r "\[.*{.*id.*:.*['\"]" src/ # Hardcoded arrays
grep -r "const.*=.*\[" src/ | grep -E "users|products|services"
```

#### Step 2: Create Database Schema
```sql
-- Create tables for the mock data
CREATE TABLE IF NOT EXISTS services (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  duration interval NOT NULL,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

#### Step 3: Migrate Data to Database
```sql
-- Insert the data that was previously mocked
INSERT INTO services (name, description, duration, price, category)
SELECT * FROM (VALUES
  ('Basic Haircut', 'Professional haircut service', interval '30 minutes', 35.00, 'hair'),
  ('Hair Color', 'Full color treatment', interval '2 hours', 125.00, 'hair')
) AS t(name, description, duration, price, category);
```

#### Step 4: Update Components
Replace all mock data references with database queries.

### 11. Validation Checklist

- [ ] NO hardcoded data arrays in components
- [ ] NO mock/fake data generators
- [ ] NO static JSON data files
- [ ] NO placeholder or demo data
- [ ] ALL data fetched from Supabase or APIs
- [ ] Proper error handling for missing data
- [ ] Empty states handled correctly
- [ ] Development seed scripts in place
- [ ] All static configs moved to database
- [ ] No hardcoded business logic values

## Commands
```bash
# Find mock data patterns
grep -r "mock\|Mock\|MOCK" src/
grep -r "fake\|Fake\|FAKE" src/
grep -r "sample\|Sample\|SAMPLE" src/
grep -r "demo\|Demo\|DEMO" src/
grep -r "placeholder" src/
grep -r "hardcoded" src/

# Find hardcoded arrays
grep -r "const.*=.*\[.*{" src/

# Find JSON imports
grep -r "import.*\.json" src/

# Check for faker library
grep -r "faker" src/
grep -r "@faker-js" package.json

# Run development seed
npm run db:seed
```

## Success Criteria
- ZERO mock data in production code
- ZERO hardcoded data arrays
- ZERO static JSON data files
- ALL data from Supabase or external APIs
- Proper database seeding for development
- All components fetch real data
- Proper error handling for data operations
- No faker or mock libraries in dependencies