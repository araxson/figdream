#!/bin/bash

# ========================================
# Supabase Types Update Script
# ========================================
# Updates both database.types.ts and auth.types.ts from your Supabase project
# Run this after making database changes via MCP or Supabase Dashboard

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔄 Supabase Types Update Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    if [ ! -f .env.local ]; then
        echo -e "${RED}❌ Error: No .env or .env.local file found${NC}"
        echo -e "${YELLOW}Create a .env file with SUPABASE_PROJECT_ID=your-project-id${NC}"
        exit 1
    fi
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
elif [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check for SUPABASE_PROJECT_ID or SUPABASE_PROJECT_REF
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    # Try SUPABASE_PROJECT_REF as fallback
    SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_REF}
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  SUPABASE_PROJECT_ID not found in .env${NC}"
    echo -e "${YELLOW}Enter your Supabase project ID (from dashboard URL):${NC}"
    read -p "Project ID: " SUPABASE_PROJECT_ID
    
    # Optionally save to .env
    read -p "Save to .env file? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID" >> .env
        echo -e "${GREEN}✅ Saved to .env${NC}"
    fi
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found${NC}"
    echo -e "${YELLOW}Installing via npm...${NC}"
    npm install -g supabase
fi

# Check if logged in using the access token
echo -e "${BLUE}🔐 Checking Supabase authentication...${NC}"
if SUPABASE_ACCESS_TOKEN=$SUPABASE_ACCESS_TOKEN supabase projects list &> /dev/null 2>&1; then
    echo -e "${GREEN}✅ Authenticated with Supabase${NC}"
else
    echo -e "${YELLOW}📝 Authentication check failed. Attempting to proceed...${NC}"
fi

# Create backup of existing types
echo -e "${BLUE}💾 Creating backup of existing types...${NC}"
BACKUP_DIR="src/types/backups"
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

if [ -f src/types/database.types.ts ]; then
    cp src/types/database.types.ts "$BACKUP_DIR/database.types.${TIMESTAMP}.ts"
    echo -e "${GREEN}✅ Backed up database.types.ts${NC}"
fi

if [ -f src/types/auth.types.ts ]; then
    cp src/types/auth.types.ts "$BACKUP_DIR/auth.types.${TIMESTAMP}.ts"
    echo -e "${GREEN}✅ Backed up auth.types.ts${NC}"
fi

# Generate database types
echo -e "${BLUE}🔄 Generating database.types.ts...${NC}"
npx supabase gen types typescript \
    --project-id "$SUPABASE_PROJECT_ID" \
    --schema public \
    > src/types/database.types.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Generated database.types.ts${NC}"
    
    # Count lines and tables
    LINES=$(wc -l < src/types/database.types.ts | tr -d ' ')
    TABLES=$(grep -c "Tables: {" src/types/database.types.ts || echo "0")
    echo -e "${BLUE}   📊 Size: ${LINES} lines, ~${TABLES} table definitions${NC}"
else
    echo -e "${RED}❌ Failed to generate database.types.ts${NC}"
    exit 1
fi

# Generate auth types (auth schema)
echo -e "${BLUE}🔄 Generating auth.types.ts...${NC}"
npx supabase gen types typescript \
    --project-id "$SUPABASE_PROJECT_ID" \
    --schema auth \
    > src/types/auth.types.ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Generated auth.types.ts${NC}"
    
    # Count lines
    AUTH_LINES=$(wc -l < src/types/auth.types.ts | tr -d ' ')
    echo -e "${BLUE}   📊 Size: ${AUTH_LINES} lines${NC}"
else
    echo -e "${RED}❌ Failed to generate auth.types.ts${NC}"
    exit 1
fi

# Check for TypeScript errors
echo -e "${BLUE}🔍 Checking for TypeScript errors...${NC}"
npm run typecheck --silent 2>/dev/null || {
    echo -e "${YELLOW}⚠️  TypeScript errors detected. Run 'npm run typecheck' to see details${NC}"
}

# Clean old backups (keep last 5)
echo -e "${BLUE}🧹 Cleaning old backups...${NC}"
ls -t "$BACKUP_DIR"/database.types.*.ts 2>/dev/null | tail -n +6 | xargs -r rm
ls -t "$BACKUP_DIR"/auth.types.*.ts 2>/dev/null | tail -n +6 | xargs -r rm
echo -e "${GREEN}✅ Kept last 5 backups${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✨ Types Updated Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📁 Files updated:${NC}"
echo "   • src/types/database.types.ts (${LINES} lines)"
echo "   • src/types/auth.types.ts (${AUTH_LINES} lines)"
echo ""
echo -e "${BLUE}💾 Backups saved to:${NC}"
echo "   • ${BACKUP_DIR}/"
echo ""
echo -e "${YELLOW}💡 Next steps:${NC}"
echo "   1. Check for TypeScript errors: npm run typecheck"
echo "   2. Restart dev server if running: npm run dev"
echo "   3. Commit the updated types to git"
echo ""