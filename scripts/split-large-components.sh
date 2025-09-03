#!/bin/bash

# Script to split large components into modular files
# This script creates organized subdirectories and generates modular component files

echo "Starting component splitting process..."

# Function to create a modular component structure
create_modular_structure() {
    local dir=$1
    local base_name=$2
    
    echo "Creating modular structure for $base_name in $dir"
    
    # Create the subdirectory
    mkdir -p "$dir/$base_name"
    
    # Create types file
    cat > "$dir/$base_name/$base_name.types.ts" << 'EOF'
// Types will be extracted from the main component
export interface ComponentProps {
  // To be filled with actual props
}
EOF
    
    # Create constants file
    cat > "$dir/$base_name/$base_name.constants.ts" << 'EOF'
// Constants will be extracted from the main component
export const CONSTANTS = {}
EOF
    
    # Create utils file
    cat > "$dir/$base_name/$base_name.utils.ts" << 'EOF'
// Utility functions will be extracted from the main component
export function utilityFunction() {}
EOF
    
    # Create index file
    cat > "$dir/$base_name/index.ts" << 'EOF'
// Export main component and types
export { Component } from './$base_name'
export type { ComponentProps } from './$base_name.types'
EOF
}

# Review components
echo "Processing review components..."
REVIEW_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/customer/reviews"

# Process each review component
for component in "review-form" "review-moderation" "review-card" "review-stats" "review-list"; do
    if [ ! -d "$REVIEW_DIR/$component" ]; then
        create_modular_structure "$REVIEW_DIR" "$component"
    fi
done

# Marketing components  
echo "Processing marketing components..."
MARKETING_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/salon-owner/marketing"

for component in "campaign-creator" "template-editor" "audience-selector"; do
    if [ ! -d "$MARKETING_DIR/$component" ]; then
        create_modular_structure "$MARKETING_DIR" "$component"
    fi
done

# Analytics components
echo "Processing analytics components..."
ANALYTICS_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/salon-owner/analytics"

for component in "service-popularity-matrix"; do
    if [ ! -d "$ANALYTICS_DIR/$component" ]; then
        create_modular_structure "$ANALYTICS_DIR" "$component"
    fi
done

LOCATION_ANALYTICS_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/location-manager/analytics"

for component in "comparative-analysis" "location-performance-dashboard"; do
    if [ ! -d "$LOCATION_ANALYTICS_DIR/$component" ]; then
        create_modular_structure "$LOCATION_ANALYTICS_DIR" "$component"
    fi
done

SHARED_ANALYTICS_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/shared/analytics"

for component in "analytics-dashboard"; do
    if [ ! -d "$SHARED_ANALYTICS_DIR/$component" ]; then
        create_modular_structure "$SHARED_ANALYTICS_DIR" "$component"
    fi
done

# Booking components
echo "Processing booking components..."
BOOKING_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/customer/booking"

for component in "service-selector" "staff-selector"; do
    if [ ! -d "$BOOKING_DIR/$component" ]; then
        create_modular_structure "$BOOKING_DIR" "$component"
    fi
done

# Staff components
echo "Processing staff components..."
STAFF_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/staff/profile"

for component in "staff-profile-form"; do
    if [ ! -d "$STAFF_DIR/$component" ]; then
        create_modular_structure "$STAFF_DIR" "$component"
    fi
done

# Super admin components
echo "Processing super admin components..."
SYSTEM_DIR="/Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components/super-admin/system"

for component in "alert-configurator"; do
    if [ ! -d "$SYSTEM_DIR/$component" ]; then
        create_modular_structure "$SYSTEM_DIR" "$component"
    fi
done

echo "Component structure creation complete!"
echo ""
echo "Next steps:"
echo "1. Manually extract code from each large component file"
echo "2. Split into the created modular files"
echo "3. Update imports in all affected files"
echo "4. Run 'npm run typecheck' and 'npm run lint' to verify"
echo ""
echo "Created directories for:"
find /Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/src/components -type d -name "*-*" -mmin -5 2>/dev/null | head -20