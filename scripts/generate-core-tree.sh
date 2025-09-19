#!/bin/bash

# Generate Core Folder Tree and Save to MD
# This script creates a clean tree structure of the core folder

OUTPUT_FILE="docs/core-structure-review.md"

# Create docs directory if it doesn't exist
mkdir -p docs

# Generate the tree with specific exclusions
echo "# Core Folder Structure Review" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

# Use tree command with better formatting
tree core \
  -I 'node_modules|*.map|*.test.*|*.spec.*|__tests__|dist|build' \
  --dirsfirst \
  -F \
  >> "$OUTPUT_FILE"

echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Add analysis section
echo "## Naming Issues to Check" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "### Potential Issues Found:" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Check for redundant patterns
echo "#### Files with Redundant Naming Patterns:" >> "$OUTPUT_FILE"
find core -type f \( \
  -name "*-*-*" -o \
  -name "*appointment*appointment*" -o \
  -name "*billing*billing*" -o \
  -name "*service*service*" -o \
  -name "*customer*customer*" -o \
  -name "*staff*staff*" -o \
  -name "*salon*salon*" \
\) 2>/dev/null | while read -r file; do
  echo "- $file" >> "$OUTPUT_FILE"
done

echo "" >> "$OUTPUT_FILE"
echo "#### Files with -dal-, -components-, -types- patterns:" >> "$OUTPUT_FILE"
find core -type f \( \
  -name "*-dal-*" -o \
  -name "*-components-*" -o \
  -name "*-types-*" -o \
  -name "*-actions-*" \
\) 2>/dev/null | while read -r file; do
  echo "- $file" >> "$OUTPUT_FILE"
done

echo "" >> "$OUTPUT_FILE"
echo "#### Oversized Files (>500 lines):" >> "$OUTPUT_FILE"
find core -name "*.ts" -o -name "*.tsx" | while read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 500 ]; then
    echo "- $file ($lines lines)" >> "$OUTPUT_FILE"
  fi
done

echo "" >> "$OUTPUT_FILE"
echo "## Structure Compliance Check" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Check each core module for required structure
echo "### Required Folders per Module:" >> "$OUTPUT_FILE"
echo "- ✅ = Present" >> "$OUTPUT_FILE"
echo "- ❌ = Missing" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for module in core/*/; do
  if [ -d "$module" ]; then
    module_name=$(basename "$module")
    echo "#### $module_name:" >> "$OUTPUT_FILE"

    # Check for required folders
    for folder in "actions" "components" "dal" "hooks" "types"; do
      if [ -d "$module$folder" ]; then
        echo "  - ✅ $folder/" >> "$OUTPUT_FILE"
      else
        echo "  - ❌ $folder/ (MISSING)" >> "$OUTPUT_FILE"
      fi
    done

    # Check for index.ts
    if [ -f "$module/index.ts" ]; then
      echo "  - ✅ index.ts" >> "$OUTPUT_FILE"
    else
      echo "  - ❌ index.ts (MISSING)" >> "$OUTPUT_FILE"
    fi
    echo "" >> "$OUTPUT_FILE"
  fi
done

echo "Tree structure saved to: $OUTPUT_FILE"
echo "Total files in core: $(find core -type f | wc -l)"
echo "Total directories in core: $(find core -type d | wc -l)"