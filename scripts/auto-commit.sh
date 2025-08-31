#!/bin/bash

# Auto-commit script that watches for file changes
# Usage: ./scripts/auto-commit.sh

# Generate project tree at startup
echo "📊 Generating project tree..."
python3 generate_project_tree.py

echo "🚀 Starting auto-commit watcher..."
echo "📁 Watching for changes in: $(pwd)"
echo "⏰ Auto-committing every 30 seconds if changes detected"
echo "🛑 Press Ctrl+C to stop"

# Function to commit changes
commit_changes() {
    if ! git diff --quiet; then
        echo "📝 Changes detected, committing..."
        git add .
        git commit -m "Auto-save: $(date '+%Y-%m-%d %H:%M:%S') - $(git diff --cached --name-only | head -3 | tr '\n' ' ')"
        echo "✅ Changes committed at $(date)"
    else
        echo "⏳ No changes to commit at $(date)"
    fi
}

# Main loop
while true; do
    commit_changes
    sleep 30
done
