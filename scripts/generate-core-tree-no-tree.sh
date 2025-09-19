#!/bin/bash

# Generate Core Folder Tree without tree command
OUTPUT_FILE="docs/core-structure-review.md"

# Create docs directory if it doesn't exist
mkdir -p docs

# Function to print directory tree
print_tree() {
    local dir="$1"
    local prefix="$2"
    local last="$3"

    # Get all items in directory
    local items=($(ls -1 "$dir" 2>/dev/null | sort))
    local count=${#items[@]}

    for ((i=0; i<$count; i++)); do
        local item="${items[$i]}"
        local path="$dir/$item"
        local is_last=$((i == count - 1))

        # Skip certain files/folders
        if [[ "$item" == "node_modules" || "$item" == "dist" || "$item" == "build" ]]; then
            continue
        fi

        # Print item
        if [ -d "$path" ]; then
            if [ $is_last -eq 1 ]; then
                echo "${prefix}└── $item/" >> "$OUTPUT_FILE"
                print_tree "$path" "${prefix}    " "$is_last"
            else
                echo "${prefix}├── $item/" >> "$OUTPUT_FILE"
                print_tree "$path" "${prefix}│   " "$is_last"
            fi
        else
            if [ $is_last -eq 1 ]; then
                echo "${prefix}└── $item" >> "$OUTPUT_FILE"
            else
                echo "${prefix}├── $item" >> "$OUTPUT_FILE"
            fi
        fi
    done
}

# Generate the tree
echo "# Core Folder Structure Review" > "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "Generated on: $(date)" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
echo "core/" >> "$OUTPUT_FILE"
print_tree "core" "" ""
echo '```' >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

# Add analysis section
echo "## Naming Issues Analysis" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

echo "### Files with Multiple Hyphens (potential verbose naming):" >> "$OUTPUT_FILE"
find core -type f -name "*-*-*-*" 2>/dev/null | while read -r file; do
  basename_only=$(basename "$file")
  echo "- \`$file\` → $basename_only" >> "$OUTPUT_FILE"
done

echo "" >> "$OUTPUT_FILE"
echo "### Files with Redundant Words:" >> "$OUTPUT_FILE"
for pattern in "appointment" "billing" "service" "customer" "staff" "salon" "booking" "dashboard" "admin"; do
  find core -type f -name "*$pattern*$pattern*" 2>/dev/null | while read -r file; do
    echo "- \`$file\`" >> "$OUTPUT_FILE"
  done
done

echo "" >> "$OUTPUT_FILE"
echo "### Oversized Files (needs splitting):" >> "$OUTPUT_FILE"
echo "#### Components (>300 lines):" >> "$OUTPUT_FILE"
find core -path "*/components/*" -name "*.tsx" | while read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 300 ]; then
    echo "- \`$file\` ($lines lines)" >> "$OUTPUT_FILE"
  fi
done

echo "" >> "$OUTPUT_FILE"
echo "#### DAL Files (>500 lines):" >> "$OUTPUT_FILE"
find core -path "*/dal/*" -name "*.ts" | while read -r file; do
  lines=$(wc -l < "$file")
  if [ "$lines" -gt 500 ]; then
    echo "- \`$file\` ($lines lines)" >> "$OUTPUT_FILE"
  fi
done

echo "" >> "$OUTPUT_FILE"
echo "## Module Structure Compliance" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"

for module in core/*/; do
  if [ -d "$module" ]; then
    module_name=$(basename "$module")
    echo "### $module_name" >> "$OUTPUT_FILE"

    missing=""
    for required in "actions" "components" "dal" "hooks" "types" "index.ts"; do
      if [ "$required" = "index.ts" ]; then
        if [ ! -f "$module$required" ]; then
          missing="$missing $required"
        fi
      else
        if [ ! -d "$module$required" ]; then
          missing="$missing $required/"
        fi
      fi
    done

    if [ -z "$missing" ]; then
      echo "✅ All required folders present" >> "$OUTPUT_FILE"
    else
      echo "❌ Missing:$missing" >> "$OUTPUT_FILE"
    fi
    echo "" >> "$OUTPUT_FILE"
  fi
done

echo "" >> "$OUTPUT_FILE"
echo "## Statistics" >> "$OUTPUT_FILE"
echo "- Total files: $(find core -type f | wc -l)" >> "$OUTPUT_FILE"
echo "- Total directories: $(find core -type d | wc -l)" >> "$OUTPUT_FILE"
echo "- TypeScript files: $(find core -name "*.ts" -o -name "*.tsx" | wc -l)" >> "$OUTPUT_FILE"

echo "Report saved to: $OUTPUT_FILE"