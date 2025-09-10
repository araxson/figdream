#!/bin/bash

# Complete Supabase Database Export
# Using PostgreSQL 17 client tools

export PGPASSWORD='Aliahmadi-1377'
PG_DUMP='/opt/homebrew/opt/postgresql@17/bin/pg_dump'
PSQL='/opt/homebrew/opt/postgresql@17/bin/psql'
DB_HOST='db.hlwlbighcjnmgoulvkog.supabase.co'
DB_PORT='5432'
DB_NAME='postgres'
DB_USER='postgres'

echo "🚀 Starting complete database export..."
rm -rf database_complete_export
mkdir -p database_complete_export
cd database_complete_export

echo "📦 1. Exporting COMPLETE DATABASE (schema + data)..."
$PG_DUMP -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --verbose \
  --no-owner \
  --no-acl \
  -f 00_COMPLETE_DATABASE.sql

echo "📋 2. Exporting SCHEMA ONLY..."
$PG_DUMP -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --schema-only \
  --no-owner \
  --no-acl \
  -f 01_SCHEMA_ONLY.sql

echo "💾 3. Exporting DATA ONLY..."
$PG_DUMP -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
  --data-only \
  --no-owner \
  -f 02_DATA_ONLY.sql

echo "🔒 4. Exporting ALL RLS POLICIES..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    '-- Policy: ' || policyname || ' on ' || schemaname || '.' || tablename || E'\n' ||
    'CREATE POLICY \"' || policyname || '\" ON ' || schemaname || '.' || tablename ||
    ' AS ' || permissive || 
    ' FOR ' || cmd || 
    ' TO ' || array_to_string(roles, ', ') ||
    CASE WHEN qual IS NOT NULL THEN E'\nUSING (' || qual || ')' ELSE '' END ||
    CASE WHEN with_check IS NOT NULL THEN E'\nWITH CHECK (' || with_check || ')' ELSE '' END || ';' || E'\n'
FROM pg_policies
ORDER BY schemaname, tablename, policyname;" > 03_ALL_POLICIES.sql

echo "🔑 5. Exporting ALL INDEXES..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT indexdef || ';'
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename, indexname;" > 04_ALL_INDEXES.sql

echo "🔗 6. Exporting ALL FOREIGN KEYS..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    'ALTER TABLE ' || tc.table_schema || '.' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name || 
    ' FOREIGN KEY (' || kcu.column_name || ')' ||
    ' REFERENCES ' || ccu.table_schema || '.' || ccu.table_name || 
    ' (' || ccu.column_name || ');'
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_schema, tc.table_name;" > 05_ALL_FOREIGN_KEYS.sql

echo "⚡ 7. Exporting ALL FUNCTIONS..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT pg_get_functiondef(p.oid) || ';'
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'extensions')
ORDER BY n.nspname, p.proname;" > 06_ALL_FUNCTIONS.sql

echo "🎯 8. Exporting ALL TRIGGERS..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    'CREATE TRIGGER ' || trigger_name || 
    ' ' || action_timing || ' ' || event_manipulation || 
    ' ON ' || event_object_schema || '.' || event_object_table ||
    ' FOR EACH ' || action_orientation ||
    ' ' || action_statement || ';'
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY trigger_schema, event_object_table, trigger_name;" > 07_ALL_TRIGGERS.sql

echo "👁️ 9. Exporting ALL VIEWS..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    'CREATE OR REPLACE VIEW ' || table_schema || '.' || table_name || ' AS ' || 
    view_definition || ';'
FROM information_schema.views
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;" > 08_ALL_VIEWS.sql

echo "📊 10. Exporting TABLE INFORMATION..."
$PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "
SELECT 
    table_schema || '.' || table_name || ': ' ||
    COUNT(column_name) || ' columns, ' ||
    'Size: ' || pg_size_pretty(pg_total_relation_size(quote_ident(table_schema)||'.'||quote_ident(table_name)))
FROM information_schema.columns c
JOIN information_schema.tables t USING (table_schema, table_name)
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
AND table_type = 'BASE TABLE'
GROUP BY table_schema, table_name
ORDER BY table_schema, table_name;" > 09_TABLE_INFO.txt

echo "✅ EXPORT COMPLETE!"
echo ""
echo "📁 Files created:"
ls -lah
echo ""
echo "📊 Database statistics:"
wc -l *.sql *.txt
