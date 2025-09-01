#!/bin/bash

# Script to generate Supabase types
# Usage: ./scripts/generate-types.sh

echo "Generating Supabase types..."

# Generate types for public schema only (database types)
echo "Generating database types..."
supabase gen types typescript --project-id hlwlbighcjnmgoulvkog --schema public > src/types/database.types.ts

# Generate types for auth schema only
echo "Generating auth types..."
supabase gen types typescript --project-id hlwlbighcjnmgoulvkog --schema auth > src/types/auth.types.ts

echo "Types generated successfully!"
echo "- Database types: src/types/database.types.ts"
echo "- Auth types: src/types/auth.types.ts"

