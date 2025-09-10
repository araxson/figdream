#!/bin/bash

# Export complete Supabase database using pg_dump directly
# Using the direct connection URL

PGPASSWORD='Aliahmadi-1377'
DB_HOST='db.hlwlbighcjnmgoulvkog.supabase.co'
DB_PORT='5432'
DB_NAME='postgres'
DB_USER='postgres'

export PGPASSWORD

echo "Starting database export..."
mkdir -p database_complete_export

# Export complete schema (all schemas, not just public)
echo "1. Exporting complete schema..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --schema='*' \
  --no-owner \
  --no-acl \
  --verbose \
  -f database_complete_export/01_complete_schema.sql 2>&1

# Export only data
echo "2. Exporting data..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --data-only \
  --no-owner \
  -f database_complete_export/02_data_only.sql 2>&1

# Export specific components
echo "3. Exporting RLS policies..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    'CREATE POLICY \"' || policyname || '\" ON ' || schemaname || '.' || tablename ||
    ' AS ' || permissive || 
    ' FOR ' || cmd || 
    ' TO ' || array_to_string(roles, ', ') ||
    CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
    CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END || ';'
FROM pg_policies
ORDER BY schemaname, tablename, policyname;" > database_complete_export/03_policies.sql 2>&1

echo "Export complete!"
ls -la database_complete_export/
