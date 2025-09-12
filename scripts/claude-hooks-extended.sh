#!/bin/bash

# Extended Claude Code Hooks Script
# Additional commands that Claude Code hooks don't natively support

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[HOOK]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Generate project tree
generate_tree() {
    print_status "Generating project tree..."
    python3 scripts/generate_project_tree.py
    print_status "✓ Project tree updated"
}

# Update README with section
update_readme_section() {
    SECTION=$1
    CHANGES=$2
    print_status "Updating README section: $SECTION"
    echo -e "\n## Update Log\n- **Section:** $SECTION\n- **Changes:** $CHANGES\n- **Timestamp:** $(date +'%Y-%m-%d %H:%M:%S')" >> README.md
    print_status "✓ README section updated"
}

# Add activity summary to README
readme_summary() {
    print_status "Adding activity summary to README..."
    FILES_MODIFIED=$(git status --porcelain | wc -l)
    TYPE_STATUS=$(npm run type-check 2>&1 | tail -1)
    
    echo -e "\n## Recent Activity Summary\n- **Date:** $(date +'%Y-%m-%d')" >> README.md
    echo "- **Files Modified:** $FILES_MODIFIED" >> README.md
    echo "- **TypeScript Status:** $TYPE_STATUS" >> README.md
    
    print_status "✓ Activity summary added"
}

# Post-Install Hook
post_install() {
    print_status "Running post-install tasks..."
    
    # Verify types after dependency changes
    print_status "Verifying types after dependency changes..."
    npm run type-check || print_warning "Type check failed after install (non-critical)"
}

# Post-Migration Hook
post_migration() {
    print_status "Running post-migration tasks..."
    
    # Update project tree
    generate_tree
    
    # Log migration to README
    echo -e "\n## Database Migration\n- **Date:** $(date +'%Y-%m-%d %H:%M:%S')\n- **Status:** Migration completed" >> README.md
    
    # Generate TypeScript types from database
    print_status "Generating TypeScript types from Supabase..."
    npm run generate:types
    
    # Run type checking
    print_status "Verifying types after database changes..."
    npm run type-check
}

# Post-Component-Add Hook (for shadcn components)
post_component_add() {
    COMPONENT_NAME=$1
    print_status "Added shadcn component: $COMPONENT_NAME"
    
    # Log to README
    echo -e "\n## Component Added\n- **Component:** $COMPONENT_NAME\n- **Date:** $(date +'%Y-%m-%d %H:%M:%S')" >> README.md
    
    # Run linting on new component
    print_status "Checking new component meets standards..."
    npm run lint
}

# Check for Duplicate Components
check_duplicates() {
    print_status "Checking for duplicate components..."
    
    DUPLICATES=$(find src/components -name '*.tsx' -exec basename {} \; | sort | uniq -d)
    
    if [ -z "$DUPLICATES" ]; then
        print_status "✓ No duplicate component names found"
    else
        print_error "Found duplicate component names:"
        echo "$DUPLICATES"
        return 1
    fi
}

# Validate shadcn UI components haven't been modified
validate_shadcn() {
    print_status "Checking shadcn UI components..."
    
    # Check if any files in src/components/ui/ have been modified
    MODIFIED=$(git status --porcelain src/components/ui/ 2>/dev/null)
    
    if [ -n "$MODIFIED" ]; then
        print_warning "UI components have been modified (should use shadcn directly):"
        echo "$MODIFIED"
    else
        print_status "✓ UI components unchanged"
    fi
}

# Check all imports are correct after file moves
check_imports() {
    print_status "Verifying all imports are correct..."
    npm run type-check
}

# Periodic type check (can be run via cron)
periodic_check() {
    print_info "Running periodic quality check..."
    npm run type-check || print_warning "Periodic type check failed (non-critical)"
}

# Main command handler
case "$1" in
    "generate-tree")
        generate_tree
        ;;
    "update-readme-section")
        update_readme_section "$2" "$3"
        ;;
    "readme-summary")
        readme_summary
        ;;
    "post-install")
        post_install
        ;;
    "post-migration")
        post_migration
        ;;
    "post-component-add")
        post_component_add "$2"
        ;;
    "check-duplicates")
        check_duplicates
        ;;
    "validate-shadcn")
        validate_shadcn
        ;;
    "check-imports")
        check_imports
        ;;
    "periodic-check")
        periodic_check
        ;;
    "all-checks")
        print_status "Running all checks..."
        generate_tree
        check_duplicates
        validate_shadcn
        check_imports
        ;;
    *)
        echo "Usage: $0 {generate-tree|update-readme-section|readme-summary|post-install|post-migration|post-component-add|check-duplicates|validate-shadcn|check-imports|periodic-check|all-checks}"
        echo ""
        echo "Commands:"
        echo "  generate-tree         - Generate project tree"
        echo "  update-readme-section - Update specific README section"
        echo "  readme-summary        - Add activity summary to README"
        echo "  post-install          - Run after installing packages"
        echo "  post-migration        - Generate types and check after DB migration"
        echo "  post-component-add    - Lint after adding shadcn component"
        echo "  check-duplicates      - Find duplicate component names"
        echo "  validate-shadcn       - Check UI components haven't been modified"
        echo "  check-imports         - Verify imports after file moves"
        echo "  periodic-check        - Run periodic type check"
        echo "  all-checks            - Run all validation checks"
        exit 1
        ;;
esac

exit $?