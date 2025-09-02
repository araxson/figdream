#!/usr/bin/env python3
"""
Generate project tree with file counts and lines of code.
This script creates a PROJECT_TREE.md file in the root directory.
"""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# Directories to ignore
IGNORE_DIRS = {
    '.git', 'node_modules', '__pycache__', '.next', 'dist', 'build',
    '.cache', '.vscode', '.idea', 'venv', 'env', '.env', 'coverage',
    '.pytest_cache', '.mypy_cache', 'target', 'out', 'bin', 'obj'
}

# File extensions to count lines for
CODE_EXTENSIONS = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.c', '.cpp', '.h',
    '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala',
    '.html', '.css', '.scss', '.sass', '.less', '.vue', '.svelte',
    '.json', '.xml', '.yaml', '.yml', '.toml', '.md', '.sql', '.sh',
    '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd'
}

def count_lines(file_path: Path) -> int:
    """Count lines in a file, handling encoding errors."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return sum(1 for _ in f)
    except (UnicodeDecodeError, PermissionError, OSError):
        try:
            with open(file_path, 'r', encoding='latin-1') as f:
                return sum(1 for _ in f)
        except:
            return 0

def should_ignore(path: Path) -> bool:
    """Check if path should be ignored."""
    parts = path.parts
    for part in parts:
        if part.startswith('.') and part != '.':
            return True
        if part in IGNORE_DIRS:
            return True
    return False

def get_file_stats(path: Path) -> Tuple[int, int]:
    """Get file count and total lines of code for a directory."""
    file_count = 0
    total_lines = 0
    
    try:
        for item in path.iterdir():
            if should_ignore(item):
                continue
                
            if item.is_file():
                file_count += 1
                if item.suffix in CODE_EXTENSIONS:
                    total_lines += count_lines(item)
            elif item.is_dir():
                sub_files, sub_lines = get_file_stats(item)
                file_count += sub_files
                total_lines += sub_lines
    except PermissionError:
        pass
    
    return file_count, total_lines

def generate_tree(path: Path, prefix: str = "", is_last: bool = True, depth: int = 0, max_depth: int = 10) -> List[str]:
    """Generate tree structure with stats."""
    if depth > max_depth:
        return []
    
    lines = []
    
    # Format current item
    connector = "└── " if is_last else "├── "
    
    if path.is_dir():
        # Get stats for directory
        file_count, line_count = get_file_stats(path)
        name = f"📁 **{path.name}/** ({file_count} files, {line_count:,} lines)"
    else:
        if path.suffix in CODE_EXTENSIONS:
            lines_in_file = count_lines(path)
            name = f"📄 {path.name} ({lines_in_file:,} lines)"
        else:
            name = f"📄 {path.name}"
    
    if depth > 0:  # Don't show connector for root
        lines.append(f"{prefix}{connector}{name}")
    else:
        lines.append(f"**{name}**")
    
    # Process children if directory
    if path.is_dir():
        try:
            items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
            items = [item for item in items if not should_ignore(item)]
            
            for i, item in enumerate(items):
                is_last_item = (i == len(items) - 1)
                extension = "    " if is_last else "│   "
                new_prefix = prefix + extension if depth > 0 else ""
                
                child_lines = generate_tree(item, new_prefix, is_last_item, depth + 1, max_depth)
                lines.extend(child_lines)
        except PermissionError:
            pass
    
    return lines

def generate_summary(root_path: Path) -> Dict:
    """Generate project summary statistics."""
    stats = {
        'total_files': 0,
        'total_lines': 0,
        'by_extension': {},
        'largest_files': []
    }
    
    file_sizes = []
    
    for root, dirs, files in os.walk(root_path):
        # Remove ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]
        
        root_path_obj = Path(root)
        if should_ignore(root_path_obj):
            continue
        
        for file in files:
            if file.startswith('.'):
                continue
                
            file_path = Path(root) / file
            stats['total_files'] += 1
            
            if file_path.suffix in CODE_EXTENSIONS:
                lines = count_lines(file_path)
                stats['total_lines'] += lines
                
                # Track by extension
                ext = file_path.suffix
                if ext not in stats['by_extension']:
                    stats['by_extension'][ext] = {'files': 0, 'lines': 0}
                stats['by_extension'][ext]['files'] += 1
                stats['by_extension'][ext]['lines'] += lines
                
                # Track largest files
                file_sizes.append((file_path.relative_to(root_path), lines))
    
    # Get top 10 largest files
    file_sizes.sort(key=lambda x: x[1], reverse=True)
    stats['largest_files'] = file_sizes[:10]
    
    return stats

def main():
    """Main function to generate project tree."""
    root_path = Path.cwd()
    output_file = root_path / "PROJECT_TREE.md"
    
    print(f"Generating project tree for: {root_path}")
    
    # Generate summary
    print("Calculating project statistics...")
    summary = generate_summary(root_path)
    
    # Generate tree
    print("Building tree structure...")
    tree_lines = generate_tree(root_path, max_depth=5)
    
    # Create output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Project Tree and Statistics\n\n")
        f.write(f"*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
        
        # Summary section
        f.write("## 📊 Project Summary\n\n")
        f.write(f"- **Total Files**: {summary['total_files']:,}\n")
        f.write(f"- **Total Lines of Code**: {summary['total_lines']:,}\n\n")
        
        # By extension
        if summary['by_extension']:
            f.write("### Files by Extension\n\n")
            f.write("| Extension | Files | Lines |\n")
            f.write("|-----------|-------|-------|\n")
            for ext, data in sorted(summary['by_extension'].items(), 
                                   key=lambda x: x[1]['lines'], reverse=True):
                f.write(f"| `{ext}` | {data['files']:,} | {data['lines']:,} |\n")
            f.write("\n")
        
        # Largest files
        if summary['largest_files']:
            f.write("### Top 10 Largest Files\n\n")
            f.write("| File | Lines |\n")
            f.write("|------|-------|\n")
            for file_path, lines in summary['largest_files']:
                f.write(f"| `{file_path}` | {lines:,} |\n")
            f.write("\n")
        
        # Tree structure
        f.write("## 📁 Project Structure\n\n")
        f.write("```\n")
        for line in tree_lines:
            # Remove markdown formatting for tree view
            clean_line = line.replace('**', '').replace('📁 ', '').replace('📄 ', '')
            f.write(clean_line + "\n")
        f.write("```\n\n")
        
        # Instructions for Claude
        f.write("---\n\n")
        f.write("## 📝 Instructions for Claude Code\n\n")
        f.write("**IMPORTANT**: Always read this `PROJECT_TREE.md` file at the start of each conversation ")
        f.write("to understand the project structure and codebase statistics. This file is automatically ")
        f.write("regenerated at the beginning of each session.\n\n")
        f.write("### Key Information:\n")
        f.write("- File counts include all files (not just code files)\n")
        f.write("- Line counts only include recognized code file extensions\n")
        f.write("- Common build/dependency directories are excluded (node_modules, .git, etc.)\n")
        f.write("- Tree depth is limited to 5 levels for readability\n")
    
    print(f"✅ Project tree saved to: {output_file}")
    print(f"   Total files: {summary['total_files']:,}")
    print(f"   Total lines of code: {summary['total_lines']:,}")

if __name__ == "__main__":
    main()