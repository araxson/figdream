#!/bin/bash

echo "Fixing remaining naming issues..."

# Fix marketing components
cd /Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/core/salon/components/marketing
for file in marketing-*.tsx; do
  if [ -f "$file" ]; then
    newname="${file#marketing-}"
    mv "$file" "$newname"
    echo "Renamed: $file -> $newname"
  fi
done

# Fix billing components
cd /Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/core/salon/components/billing
for file in billing-*.tsx; do
  if [ -f "$file" ]; then
    newname="${file#billing-}"
    mv "$file" "$newname"
    echo "Renamed: $file -> $newname"
  fi
done

# Fix audit components
cd /Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/core/platform/components/audit
if [ -f "audit-logs-list-basic.tsx" ]; then
  mv "audit-logs-list-basic.tsx" "list-basic.tsx"
  echo "Renamed: audit-logs-list-basic.tsx -> list-basic.tsx"
fi

# Fix DAL files
cd /Users/afshin/Desktop/zss/clients/009-figdream/03-website-development/figdream/core/salon/dal
if [ -f "inventory-purchase-order-mutations.ts" ]; then
  mv "inventory-purchase-order-mutations.ts" "purchase-order-mutations.ts"
  echo "Renamed: inventory-purchase-order-mutations.ts -> purchase-order-mutations.ts"
fi

echo "Done!"