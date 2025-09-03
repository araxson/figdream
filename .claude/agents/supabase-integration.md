# Supabase Integration Agent

## Purpose
This agent ensures proper Supabase integration, optimizes database operations, implements RLS policies correctly, and manages all database-related functionality with maximum performance and security.

## Core Responsibilities

### 1. Supabase Client Configuration

#### Server Client (@supabase/ssr)
```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export function createClient() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

#### Browser Client
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

### 2. Type Generation & Usage

#### Generate Types
```bash
# Generate types from local database
supabase gen types typescript --local > src/types/database.types.ts

# Generate types from remote database  
supabase gen types typescript --project-id your-project-id > src/types/database.types.ts
```

#### Type-Safe Queries
```typescript
import type { Database } from '@/types/database.types'

// Table types
type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

// Query result types
const query = supabase.from('users').select('*')
type QueryResult = QueryData<typeof query>

// Function return types
type ProfileData = Database['public']['Functions']['get_profile']['Returns']
```

### 3. Row Level Security (RLS) Optimization

#### High-Performance RLS Policies
```sql
-- ✅ OPTIMIZED: Using InitPlan optimization
CREATE POLICY "Users can view own data"
ON users FOR SELECT
TO authenticated
USING (
  (SELECT auth.uid()) = user_id  -- 100x+ performance improvement
);

-- Create supporting index
CREATE INDEX idx_users_user_id ON users(user_id);

-- ❌ SLOW: Without optimization
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = user_id);  -- Called for every row
```

#### Team-Based RLS
```sql
-- ✅ OPTIMIZED: Using IN/ANY operations
CREATE POLICY "Team members can view team data"
ON team_data FOR SELECT
TO authenticated
USING (
  team_id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Create indexes for performance
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_data_team_id ON team_data(team_id);
```

#### Security Definer Functions for Complex RLS
```sql
-- Create in private schema for security
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.check_team_access(
  p_team_id uuid,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.team_members 
    WHERE team_id = p_team_id 
    AND user_id = p_user_id
    AND status = 'active'
  );
END;
$$;

-- Use in RLS policy
CREATE POLICY "Team access"
ON team_resources FOR ALL
TO authenticated
USING (private.check_team_access(team_id));
```

### 4. Database Functions & Triggers

#### Business Logic Functions
```sql
-- Appointment booking function with validation
CREATE OR REPLACE FUNCTION book_appointment(
  p_service_id uuid,
  p_staff_id uuid,
  p_start_time timestamptz,
  p_customer_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  v_appointment_id uuid;
  v_duration interval;
  v_end_time timestamptz;
BEGIN
  -- Validate user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Get service duration
  SELECT duration INTO v_duration
  FROM services
  WHERE id = p_service_id;
  
  IF v_duration IS NULL THEN
    RAISE EXCEPTION 'Service not found';
  END IF;
  
  v_end_time := p_start_time + v_duration;
  
  -- Check for conflicts
  IF EXISTS (
    SELECT 1 FROM appointments
    WHERE staff_id = p_staff_id
    AND status != 'cancelled'
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, v_end_time)
    )
  ) THEN
    RAISE EXCEPTION 'Time slot not available';
  END IF;
  
  -- Create appointment
  INSERT INTO appointments (
    customer_id, service_id, staff_id, 
    start_time, end_time, customer_notes
  ) VALUES (
    auth.uid(), p_service_id, p_staff_id,
    p_start_time, v_end_time, p_customer_notes
  )
  RETURNING id INTO v_appointment_id;
  
  -- Log the booking
  RAISE LOG 'Appointment % booked for user %', v_appointment_id, auth.uid();
  
  RETURN v_appointment_id;
END;
$$;
```

#### Audit Triggers
```sql
-- Audit trail trigger
CREATE OR REPLACE FUNCTION audit_trail()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_log (
    table_name,
    operation,
    user_id,
    record_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    auth.uid(),
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply to tables
CREATE TRIGGER audit_appointments
AFTER INSERT OR UPDATE OR DELETE ON appointments
FOR EACH ROW EXECUTE FUNCTION audit_trail();
```

### 5. Realtime Subscriptions

#### Efficient Realtime Usage
```typescript
// Subscribe to specific changes only
const subscription = supabase
  .channel('appointments')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'appointments',
      filter: `customer_id=eq.${userId}` // Filter on server
    },
    (payload) => {
      console.log('New appointment:', payload.new)
    }
  )
  .subscribe()

// Clean up subscription
onCleanup(() => {
  subscription.unsubscribe()
})
```

### 6. Storage Management

#### File Upload with RLS
```typescript
// Upload with proper metadata
export async function uploadAvatar(file: File, userId: string) {
  const supabase = createClient()
  
  // Generate unique path
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${fileExt}`
  
  // Upload with content type
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false // Don't overwrite
    })
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  return publicUrl
}
```

#### Storage RLS Policies
```sql
-- Allow users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

### 7. Edge Functions Integration

#### Webhook Processing
```typescript
// supabase/functions/process-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { payment_intent } = await req.json()
  
  // Update appointment status
  const { error } = await supabase
    .from('appointments')
    .update({ payment_status: 'paid' })
    .eq('payment_intent_id', payment_intent.id)
  
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
})
```

### 8. Data Access Layer Patterns

```typescript
// src/lib/data-access/appointments/index.ts
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/data-access/auth'
import type { Database } from '@/types/database.types'

type Appointment = Database['public']['Tables']['appointments']['Row']

export async function getUserAppointments(): Promise<Appointment[]> {
  const user = await verifySession()
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      service:services(name, duration, price),
      staff:staff_members(name, avatar_url)
    `)
    .eq('customer_id', user.id)
    .order('start_time', { ascending: true })
  
  if (error) {
    console.error('Error fetching appointments:', error)
    throw new Error('Failed to fetch appointments')
  }
  
  return data || []
}

export async function createAppointment(input: {
  serviceId: string
  staffId: string
  startTime: string
  notes?: string
}) {
  const user = await verifySession()
  const supabase = createClient()
  
  // Call database function for complex logic
  const { data, error } = await supabase
    .rpc('book_appointment', {
      p_service_id: input.serviceId,
      p_staff_id: input.staffId,
      p_start_time: input.startTime,
      p_customer_notes: input.notes
    })
  
  if (error) {
    if (error.message.includes('Time slot not available')) {
      throw new Error('This time slot is no longer available')
    }
    throw new Error('Failed to book appointment')
  }
  
  return data
}
```

### 9. Performance Optimization

#### Query Optimization
```typescript
// ❌ BAD: Multiple queries
const user = await supabase.from('users').select().single()
const profile = await supabase.from('profiles').select().eq('user_id', user.id)
const settings = await supabase.from('settings').select().eq('user_id', user.id)

// ✅ GOOD: Single query with joins
const { data } = await supabase
  .from('users')
  .select(`
    *,
    profile:profiles(*),
    settings:user_settings(*)
  `)
  .single()
```

#### Connection Pooling
```typescript
// Use connection pooling in Edge Functions
import { Pool } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const pool = new Pool({
  database: 'postgres',
  hostname: Deno.env.get('DB_HOSTNAME'),
  password: Deno.env.get('DB_PASSWORD'),
  port: 5432,
  user: 'postgres',
  tls: { enabled: false },
}, 3) // Pool size

// Use pool for queries
const connection = await pool.connect()
try {
  const result = await connection.queryObject`
    SELECT * FROM appointments WHERE start_time > NOW()
  `
} finally {
  connection.release()
}
```

### 10. Migration Management

```sql
-- supabase/migrations/20240101000000_create_appointments.sql

-- Create appointments table
CREATE TABLE appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id),
  staff_id uuid REFERENCES staff_members(id),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_start_time ON appointments(start_time);

-- Create RLS policies
CREATE POLICY "Users can view own appointments"
ON appointments FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = customer_id);

-- Create updated_at trigger
CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Commands
```bash
# Generate types
supabase gen types typescript --local > src/types/database.types.ts

# Create migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database
supabase db reset

# Start local development
supabase start

# Stop local development
supabase stop
```

## Success Criteria
- ALL database operations use typed Supabase client
- ALL tables have proper RLS policies with indexes
- ALL queries optimized with InitPlan pattern
- ZERO usage of raw_app_meta_data in RLS
- ALL complex logic in database functions
- Proper error handling for all operations
- Efficient use of Realtime subscriptions
- Proper storage configuration with RLS
- All migrations versioned and documented