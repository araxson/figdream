# Supabase Types Generation

This document explains how to generate and maintain TypeScript types from your Supabase database.

## Quick Start

To generate types from your Supabase database, run:

```bash
npm run types:generate
```

Or use the script directly:

```bash
./scripts/generate-types.sh
```

## What Gets Generated

The script generates two type files:

1. **`src/types/database.types.ts`** - Contains types for the `public` schema only
2. **`src/types/database-with-auth.types.ts`** - Contains types for both `public` and `auth` schemas

## Manual Generation

If you need to generate types manually or for specific schemas:

```bash
# Generate types for public schema only
supabase gen types typescript --project-id hlwlbighcjnmgoulvkog --schema public > src/types/database.types.ts

# Generate types for public + auth schemas
supabase gen types typescript --project-id hlwlbighcjnmgoulvkog --schema public --schema auth > src/types/database-with-auth.types.ts

# Generate types for specific schemas
supabase gen types typescript --project-id hlwlbighcjnmgoulvkog --schema public --schema auth --schema storage
```

## When to Regenerate Types

You should regenerate types whenever you:

- Add new tables or columns
- Modify existing table structures
- Add new enums or composite types
- Make changes to RLS policies that affect type generation

## Using the Types

Import and use the generated types in your code:

```typescript
import { Database } from '@/types/database.types'

// Use the types with your Supabase client
const supabase = createClient<Database>(url, key)

// Type-safe database operations
const { data: users } = await supabase
  .from('users')
  .select('*')
```

## Troubleshooting

### Authentication Issues
If you get authentication errors, make sure you're logged in:

```bash
supabase login
```

### Project Linking Issues
If linking doesn't work, you can still generate types using the project ID directly:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID --schema public
```

### Schema Not Found
Make sure the schema names are correct. Common schemas include:
- `public` - Your main application tables
- `auth` - Authentication and user management
- `storage` - File storage
- `realtime` - Real-time subscriptions

