#!/bin/bash

# Run all Supabase inspection commands
DB_URL="postgresql://postgres:Aliahmadi-1377@db.hlwlbighcjnmgoulvkog.supabase.co:5432/postgres"

echo "🔍 Running Complete Database Inspection..."
echo "========================================="
echo ""

echo "📊 1. Database Statistics:"
supabase inspect db db-stats --db-url "$DB_URL" 2>/dev/null
echo ""

echo "💾 2. Table Sizes:"
supabase inspect db table-sizes --db-url "$DB_URL" 2>/dev/null | head -20
echo ""

echo "🎯 3. Index Usage:"
supabase inspect db index-usage --db-url "$DB_URL" 2>/dev/null | head -20
echo ""

echo "🚫 4. Unused Indexes:"
supabase inspect db unused-indexes --db-url "$DB_URL" 2>/dev/null | head -20
echo ""

echo "📈 5. Sequential Scans:"
supabase inspect db seq-scans --db-url "$DB_URL" 2>/dev/null | head -20
echo ""

echo "⏱️ 6. Long Running Queries:"
supabase inspect db long-running-queries --db-url "$DB_URL" 2>/dev/null
echo ""

echo "🔒 7. Locks:"
supabase inspect db locks --db-url "$DB_URL" 2>/dev/null
echo ""

echo "🗑️ 8. Bloat:"
supabase inspect db bloat --db-url "$DB_URL" 2>/dev/null | head -20
echo ""

echo "🔄 9. Vacuum Stats:"
supabase inspect db vacuum-stats --db-url "$DB_URL" 2>/dev/null | head -20
echo ""

echo "⚠️ 10. Outlier Queries:"
supabase inspect db outliers --db-url "$DB_URL" 2>/dev/null | head -20
echo ""

echo "👥 11. Role Connections:"
supabase inspect db role-connections --db-url "$DB_URL" 2>/dev/null
echo ""

echo "✅ Inspection Complete!"
