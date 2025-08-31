#!/bin/bash

# Script to generate Supabase types
# Usage: ./scripts/generate-types.sh

echo "Generating Supabase types..."

# Generate types for public schema only
echo "Generating public schema types..."
supabase gen types typescript --project-id hlwlbighcjnmgoulvkog --schema public > src/types/database.types.ts

# Generate types for public + auth schemas
echo "Generating public + auth schema types..."
supabase gen types typescript --project-id hlwlbighcjnmgoulvkog --schema public --schema auth > src/types/database-with-auth.types.ts

echo "Types generated successfully!"
echo "- Public schema: src/types/database.types.ts"
echo "- Public + Auth schemas: src/types/database-with-auth.types.ts"

