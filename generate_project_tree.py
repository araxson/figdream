#!/usr/bin/env python3
"""
Project Tree Generator

A Python script to generate a comprehensive project tree structure similar to PROJECT_TREE.md.
This script analyzes a directory and creates a detailed report with file statistics, 
extension breakdown, largest files, and a visual tree structure.

Usage:
    python generate_project_tree.py [directory_path] [output_file]

If no directory is specified, it will analyze the current directory.
If no output file is specified, it will print to stdout.
"""

import os
import sys
import argparse
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime
from typing import Dict, List, Tuple, Optional


class ProjectTreeGenerator:
    """Main class for generating project tree structure and statistics."""
    
    # Common file extensions to count as code files
    CODE_EXTENSIONS = {
        '.tsx', '.ts', '.jsx', '.js', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
        '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r',
        '.m', '.mm', '.vue', '.svelte', '.astro', '.html', '.css', '.scss',
        '.sass', '.less', '.styl', '.json', '.xml', '.yaml', '.yml', '.toml',
        '.ini', '.cfg', '.conf', '.sh', '.bash', '.zsh', '.fish', '.ps1',
        '.bat', '.cmd', '.sql', '.md', '.rst', '.tex', '.dart', '.elm',
        '.clj', '.hs', '.ml', '.fs', '.ex', '.exs', '.erl', '.lua', '.pl',
        '.pm', '.tcl', '.vim', '.vimrc', '.gitignore', '.dockerfile'
    }
    
    # Directories to ignore
    IGNORE_DIRS = {
        'node_modules', '.git', '.svn', '.hg', '.bzr', '__pycache__', '.pytest_cache',
        '.mypy_cache', '.coverage', 'dist', 'build', '.next', '.nuxt', '.vuepress',
        'target', 'bin', 'obj', '.vs', '.vscode', '.idea', '.settings', 'venv',
        'env', '.env', 'coverage', '.nyc_output', 'logs', 'tmp', 'temp',
        '.DS_Store', 'Thumbs.db', '.cache', '.parcel-cache', '.turbo'
    }
    
    # Files to ignore
    IGNORE_FILES = {
        '.DS_Store', 'Thumbs.db', '.gitignore', '.gitattributes', '.editorconfig',
        'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.lock',
        'Pipfile.lock', 'poetry.lock', 'Gemfile.lock', 'Cargo.lock'
    }
    
    def __init__(self, root_path: str = "."):
        """Initialize the generator with a root path."""
        self.root_path = Path(root_path).resolve()
        self.file_stats = defaultdict(lambda: {'count': 0, 'lines': 0})
        self.extension_stats = defaultdict(lambda: {'count': 0, 'lines': 0})
        self.largest_files = []
        self.total_files = 0
        self.total_lines = 0
        
    def should_ignore(self, path: Path) -> bool:
        """Check if a path should be ignored."""
        # Check if any part of the path is in ignore directories
        for part in path.parts:
            if part in self.IGNORE_DIRS:
                return True
        
        # Check if file is in ignore list
        if path.name in self.IGNORE_FILES:
            return True
            
        # Check if it's a hidden file/directory (starts with .)
        if path.name.startswith('.') and path.name not in {'.gitignore', '.gitattributes', '.editorconfig'}:
            return True
            
        return False
    
    def count_lines(self, file_path: Path) -> int:
        """Count lines in a file, handling different encodings."""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return sum(1 for _ in f)
        except (UnicodeDecodeError, PermissionError, OSError):
            # Try with different encoding or skip binary files
            try:
                with open(file_path, 'r', encoding='latin-1', errors='ignore') as f:
                    return sum(1 for _ in f)
            except (PermissionError, OSError):
                return 0
    
    def get_file_extension(self, file_path: Path) -> str:
        """Get file extension, handling special cases."""
        suffix = file_path.suffix.lower()
        if not suffix:
            # Handle files without extensions
            if file_path.name in {'.gitignore', '.gitattributes', '.editorconfig', 'Dockerfile', 'Makefile'}:
                return f'.{file_path.name}'
            return '.no-extension'
        return suffix
    
    def analyze_directory(self, path: Path, max_depth: int = 5, current_depth: int = 0) -> Dict:
        """Recursively analyze directory structure and collect statistics."""
        if current_depth > max_depth or self.should_ignore(path):
            return {'files': 0, 'lines': 0, 'children': {}}
        
        result = {'files': 0, 'lines': 0, 'children': {}}
        
        try:
            items = sorted(path.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))
            
            for item in items:
                if self.should_ignore(item):
                    continue
                    
                if item.is_file():
                    lines = self.count_lines(item)
                    extension = self.get_file_extension(item)
                    
                    # Update statistics
                    self.total_files += 1
                    self.total_lines += lines
                    self.file_stats[str(item)]['count'] = 1
                    self.file_stats[str(item)]['lines'] = lines
                    self.extension_stats[extension]['count'] += 1
                    self.extension_stats[extension]['lines'] += lines
                    
                    # Track largest files
                    self.largest_files.append((str(item), lines))
                    
                    result['files'] += 1
                    result['lines'] += lines
                    
                elif item.is_dir():
                    child_result = self.analyze_directory(item, max_depth, current_depth + 1)
                    if child_result['files'] > 0:  # Only include non-empty directories
                        result['children'][item.name] = child_result
                        result['files'] += child_result['files']
                        result['lines'] += child_result['lines']
                        
        except (PermissionError, OSError):
            pass
            
        return result
    
    def generate_tree_string(self, data: Dict, prefix: str = "", is_last: bool = True, root_name: str = None) -> List[str]:
        """Generate the tree structure string."""
        lines = []
        
        if root_name:
            # Root directory
            lines.append(f"{root_name}/ ({data['files']} files, {data['lines']:,} lines)")
        else:
            # Regular directory
            connector = "└── " if is_last else "├── "
            lines.append(f"{prefix}{connector}{root_name}/ ({data['files']} files, {data['lines']:,} lines)")
        
        # Sort children: directories first, then files
        children = data.get('children', {})
        child_names = sorted(children.keys())
        
        for i, child_name in enumerate(child_names):
            child_data = children[child_name]
            is_last_child = (i == len(child_names) - 1)
            
            if root_name is None:  # Not the root
                child_prefix = prefix + ("    " if is_last else "│   ")
            else:  # Root directory
                child_prefix = ""
            
            child_lines = self.generate_tree_string(
                child_data, 
                child_prefix, 
                is_last_child, 
                child_name
            )
            lines.extend(child_lines)
        
        return lines
    
    def get_extension_table(self) -> str:
        """Generate the file extension statistics table."""
        if not self.extension_stats:
            return "| Extension | Files | Lines |\n|-----------|-------|-------|\n"
        
        # Sort by line count descending
        sorted_extensions = sorted(
            self.extension_stats.items(), 
            key=lambda x: x[1]['lines'], 
            reverse=True
        )
        
        lines = ["| Extension | Files | Lines |", "|-----------|-------|-------|"]
        
        for ext, stats in sorted_extensions:
            lines.append(f"| `{ext}` | {stats['count']} | {stats['lines']:,} |")
        
        return "\n".join(lines)
    
    def get_largest_files_table(self, limit: int = 10) -> str:
        """Generate the largest files table."""
        if not self.largest_files:
            return "| File | Lines |\n|------|-------|\n"
        
        # Sort by line count descending and take top N
        sorted_files = sorted(self.largest_files, key=lambda x: x[1], reverse=True)[:limit]
        
        lines = ["| File | Lines |", "|------|-------|"]
        
        for file_path, line_count in sorted_files:
            # Make path relative to root
            try:
                rel_path = Path(file_path).relative_to(self.root_path)
                lines.append(f"| `{rel_path}` | {line_count:,} |")
            except ValueError:
                lines.append(f"| `{file_path}` | {line_count:,} |")
        
        return "\n".join(lines)
    
    def generate_report(self) -> str:
        """Generate the complete project tree report."""
        # Analyze the directory
        print(f"Analyzing directory: {self.root_path}", file=sys.stderr)
        data = self.analyze_directory(self.root_path)
        
        # Sort largest files
        self.largest_files.sort(key=lambda x: x[1], reverse=True)
        
        # Generate timestamp
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Generate report
        report_lines = [
            "# Project Tree and Statistics",
            "",
            f"*Generated: {timestamp}*",
            "",
            "## 📊 Project Summary",
            "",
            f"- **Total Files**: {self.total_files:,}",
            f"- **Total Lines of Code**: {self.total_lines:,}",
            "",
            "### Files by Extension",
            "",
            self.get_extension_table(),
            "",
            "### Top 10 Largest Files",
            "",
            self.get_largest_files_table(10),
            "",
            "## 📁 Project Structure",
            "",
            "```",
        ]
        
        # Generate tree structure
        tree_lines = self.generate_tree_string(data, root_name=self.root_path.name)
        report_lines.extend(tree_lines)
        report_lines.append("```")
        report_lines.append("")
        report_lines.append("---")
        report_lines.append("")
        report_lines.append("## 📝 Instructions for Claude Code")
        report_lines.append("")
        report_lines.append("**IMPORTANT**: Always read this `PROJECT_TREE.md` file at the start of each conversation to understand the project structure and codebase statistics. This file is automatically regenerated at the beginning of each session.")
        report_lines.append("")
        report_lines.append("### Key Information:")
        report_lines.append("- File counts include all files (not just code files)")
        report_lines.append("- Line counts only include recognized code file extensions")
        report_lines.append("- Common build/dependency directories are excluded (node_modules, .git, etc.)")
        report_lines.append("- Tree depth is limited to 5 levels for readability")
        
        return "\n".join(report_lines)


def main():
    """Main function to handle command line arguments and generate the report."""
    parser = argparse.ArgumentParser(
        description="Generate a comprehensive project tree structure report",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python generate_project_tree.py                    # Analyze current directory
  python generate_project_tree.py /path/to/project   # Analyze specific directory
  python generate_project_tree.py . PROJECT_TREE.md  # Save to file
        """
    )
    
    parser.add_argument(
        'directory', 
        nargs='?', 
        default='.', 
        help='Directory to analyze (default: current directory)'
    )
    
    parser.add_argument(
        'output', 
        nargs='?', 
        help='Output file (default: print to stdout)'
    )
    
    parser.add_argument(
        '--max-depth', 
        type=int, 
        default=5, 
        help='Maximum tree depth (default: 5)'
    )
    
    args = parser.parse_args()
    
    # Validate directory
    if not os.path.exists(args.directory):
        print(f"Error: Directory '{args.directory}' does not exist.", file=sys.stderr)
        sys.exit(1)
    
    if not os.path.isdir(args.directory):
        print(f"Error: '{args.directory}' is not a directory.", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Generate the report
        generator = ProjectTreeGenerator(args.directory)
        report = generator.generate_report()
        
        # Output the report
        if args.output:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(report)
            print(f"Report saved to: {args.output}", file=sys.stderr)
        else:
            print(report)
            
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error generating report: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
