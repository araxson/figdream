#!/usr/bin/env python3
"""
Generate a comprehensive project tree with statistics for the codebase.
Creates PROJECT_TREE.md with file counts, line counts, and directory structure.
"""

import os
import sys
from pathlib import Path
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Tuple, Set

# Directories to exclude from scanning
EXCLUDE_DIRS = {
    'node_modules', '.git', '.next', 'dist', 'build', '.cache',
    '.turbo', 'coverage', '.vercel', '.netlify', '__pycache__',
    '.pytest_cache', '.vscode', '.idea', 'out', '.DS_Store'
}

# File extensions to track
TRACKED_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.css', 
    '.scss', '.html', '.yml', '.yaml', '.sh', '.sql', '.py'
}

# Binary and large file extensions to exclude from line counting
BINARY_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.pdf',
    '.zip', '.tar', '.gz', '.rar', '.7z', '.mp4', '.mp3',
    '.woff', '.woff2', '.ttf', '.eot', '.otf'
}

def should_exclude_path(path: Path) -> bool:
    """Check if a path should be excluded from scanning."""
    parts = path.parts
    for part in parts:
        if part.startswith('.') and part != '.':
            if part not in ['.claude', '.github']:
                return True
        if part in EXCLUDE_DIRS:
            return True
    return False

def count_lines(file_path: Path) -> int:
    """Count lines in a file, handling encoding errors gracefully."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return sum(1 for _ in f)
    except (UnicodeDecodeError, FileNotFoundError, PermissionError):
        return 0

def get_file_stats(root_path: Path) -> Tuple[Dict, List, Dict]:
    """Gather statistics about all files in the project."""
    extension_stats = defaultdict(lambda: {'count': 0, 'lines': 0})
    all_files = []
    size_stats = {}
    
    for path in root_path.rglob('*'):
        if path.is_file() and not should_exclude_path(path):
            relative_path = path.relative_to(root_path)
            file_size = path.stat().st_size
            
            # Get extension
            ext = path.suffix.lower()
            if not ext:
                ext = 'no_extension'
            
            # Count lines for non-binary files
            lines = 0
            if ext not in BINARY_EXTENSIONS:
                lines = count_lines(path)
            
            # Update statistics
            extension_stats[ext]['count'] += 1
            extension_stats[ext]['lines'] += lines
            
            # Track all files with their stats
            all_files.append({
                'path': str(relative_path),
                'size': file_size,
                'lines': lines,
                'extension': ext
            })
            
            size_stats[str(relative_path)] = file_size
    
    return dict(extension_stats), all_files, size_stats

def generate_tree_structure(root_path: Path, prefix: str = "", max_depth: int = 5) -> List[str]:
    """Generate a tree structure of the directory."""
    lines = []
    
    def add_directory(path: Path, prefix: str, depth: int = 0):
        if depth > max_depth:
            lines.append(f"{prefix}└── ...")
            return
        
        try:
            items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
        except PermissionError:
            return
        
        # Filter out excluded directories
        items = [item for item in items if not (
            item.is_dir() and item.name in EXCLUDE_DIRS or
            (item.name.startswith('.') and item.name not in ['.claude', '.github'])
        )]
        
        for i, item in enumerate(items):
            is_last = i == len(items) - 1
            current_prefix = "└── " if is_last else "├── "
            next_prefix = "    " if is_last else "│   "
            
            if item.is_dir():
                lines.append(f"{prefix}{current_prefix}{item.name}/")
                add_directory(item, prefix + next_prefix, depth + 1)
            else:
                # Show file with extension
                lines.append(f"{prefix}{current_prefix}{item.name}")
    
    add_directory(root_path, "", 0)
    return lines

def format_size(size: int) -> str:
    """Format file size in human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f} {unit}"
        size /= 1024.0
    return f"{size:.1f} TB"

def generate_report(root_path: Path) -> str:
    """Generate the complete PROJECT_TREE.md report."""
    report = []
    
    # Header
    report.append("# 📊 Project Tree and Statistics")
    report.append(f"\n*Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n")
    
    # Gather statistics
    extension_stats, all_files, size_stats = get_file_stats(root_path)
    
    # Summary statistics
    total_files = sum(stats['count'] for stats in extension_stats.values())
    total_lines = sum(stats['lines'] for stats in extension_stats.values())
    
    report.append("## 📈 Summary Statistics\n")
    report.append(f"- **Total Files**: {total_files:,}")
    report.append(f"- **Total Lines**: {total_lines:,}")
    report.append(f"- **File Types**: {len(extension_stats)}\n")
    
    # File distribution by extension
    report.append("## 📁 File Distribution by Extension\n")
    report.append("| Extension | Files | Lines | Avg Lines/File |")
    report.append("|-----------|-------|-------|----------------|")
    
    # Sort by file count
    sorted_extensions = sorted(extension_stats.items(), 
                              key=lambda x: x[1]['count'], 
                              reverse=True)
    
    for ext, stats in sorted_extensions[:20]:  # Top 20 extensions
        if stats['count'] > 0:
            avg_lines = stats['lines'] / stats['count']
            ext_display = ext if ext != 'no_extension' else 'no ext'
            report.append(f"| {ext_display} | {stats['count']:,} | {stats['lines']:,} | {avg_lines:.0f} |")
    
    report.append("")
    
    # Largest files
    report.append("## 📏 Largest Files (by lines)\n")
    report.append("| File | Lines | Size |")
    report.append("|------|-------|------|")
    
    # Sort files by line count
    sorted_files = sorted(all_files, key=lambda x: x['lines'], reverse=True)
    for file in sorted_files[:15]:  # Top 15 files
        if file['lines'] > 0:
            report.append(f"| {file['path']} | {file['lines']:,} | {format_size(file['size'])} |")
    
    report.append("")
    
    # TypeScript/JavaScript specific stats
    ts_tsx_files = [f for f in all_files if f['extension'] in ['.ts', '.tsx']]
    js_jsx_files = [f for f in all_files if f['extension'] in ['.js', '.jsx']]
    
    if ts_tsx_files or js_jsx_files:
        report.append("## 🚀 TypeScript/JavaScript Statistics\n")
        
        if ts_tsx_files:
            ts_lines = sum(f['lines'] for f in ts_tsx_files)
            report.append(f"- **TypeScript Files**: {len(ts_tsx_files):,} files, {ts_lines:,} lines")
        
        if js_jsx_files:
            js_lines = sum(f['lines'] for f in js_jsx_files)
            report.append(f"- **JavaScript Files**: {len(js_jsx_files):,} files, {js_lines:,} lines")
        
        report.append("")
    
    # Component statistics (for React projects)
    component_files = [f for f in all_files if 'components' in f['path'] and f['extension'] in ['.tsx', '.jsx']]
    if component_files:
        report.append("## 🎨 Component Statistics\n")
        report.append(f"- **Total Components**: {len(component_files):,}")
        report.append(f"- **Total Component Lines**: {sum(f['lines'] for f in component_files):,}")
        report.append(f"- **Average Lines per Component**: {sum(f['lines'] for f in component_files) // len(component_files) if component_files else 0:,}\n")
    
    # Directory tree
    report.append("## 🌳 Directory Structure\n")
    report.append("```")
    report.append(root_path.name + "/")
    tree_lines = generate_tree_structure(root_path)
    report.extend(tree_lines)
    report.append("```\n")
    
    # Key directories with file counts
    report.append("## 📦 Key Directories\n")
    
    key_dirs = ['src', 'app', 'components', 'lib', 'pages', 'public', 'styles']
    dir_stats = defaultdict(lambda: {'files': 0, 'lines': 0})
    
    for file in all_files:
        for key_dir in key_dirs:
            if file['path'].startswith(key_dir + '/') or '/' + key_dir + '/' in file['path']:
                dir_stats[key_dir]['files'] += 1
                dir_stats[key_dir]['lines'] += file['lines']
    
    if dir_stats:
        report.append("| Directory | Files | Lines |")
        report.append("|-----------|-------|-------|")
        for dir_name, stats in sorted(dir_stats.items()):
            if stats['files'] > 0:
                report.append(f"| {dir_name}/ | {stats['files']:,} | {stats['lines']:,} |")
    
    report.append("\n---")
    report.append("\n*This file is auto-generated. Do not edit manually.*")
    
    return "\n".join(report)

def main():
    """Main function to generate the project tree."""
    # Get the root path (current directory or provided path)
    if len(sys.argv) > 1:
        root_path = Path(sys.argv[1])
    else:
        root_path = Path.cwd()
    
    if not root_path.exists():
        print(f"Error: Path {root_path} does not exist")
        sys.exit(1)
    
    print(f"🔍 Scanning project at: {root_path}")
    
    # Generate the report
    report = generate_report(root_path)
    
    # Write to PROJECT_TREE.md
    output_file = root_path / "PROJECT_TREE.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"✅ Generated PROJECT_TREE.md successfully!")
    print(f"📄 Output saved to: {output_file}")

if __name__ == "__main__":
    main()