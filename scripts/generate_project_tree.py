#!/usr/bin/env python3
"""
Project Tree Generator for FigDream
Generates a detailed project structure tree with file statistics
"""

import os
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Set

class ProjectTreeGenerator:
    def __init__(self, root_path: str):
        self.root_path = Path(root_path)
        self.tree_data = {
            'root': str(self.root_path),
            'generated_at': datetime.now().isoformat(),
            'statistics': {},
            'structure': {},
            'issues': [],
            'duplicates': {},
            'file_types': {}
        }
        
        # Directories to ignore
        self.ignore_dirs = {
            'node_modules', '.next', '.git', '__pycache__', 
            '.vscode', '.idea', 'dist', 'build', '.turbo',
            '.vercel', '.cache', 'coverage', '.pytest_cache'
        }
        
        # File extensions to track
        self.track_extensions = {
            '.ts', '.tsx', '.js', '.jsx', '.json', '.md', 
            '.css', '.scss', '.html', '.yml', '.yaml', '.env',
            '.sql', '.sh', '.py', '.txt', '.mjs', '.cjs'
        }
        
    def generate_tree(self) -> Dict:
        """Generate complete project tree with analysis"""
        print("🔍 Scanning project structure...")
        self.structure = self._scan_directory(self.root_path)
        self.tree_data['structure'] = self.structure
        
        print("📊 Analyzing statistics...")
        self._calculate_statistics()
        
        print("🔎 Finding duplicates and issues...")
        self._find_duplicates()
        self._identify_issues()
        
        print("📝 Generating recommendations...")
        self._generate_recommendations()
        
        return self.tree_data
    
    def _scan_directory(self, path: Path, level: int = 0) -> Dict:
        """Recursively scan directory structure"""
        result = {
            'name': path.name,
            'type': 'directory' if path.is_dir() else 'file',
            'path': str(path.relative_to(self.root_path)),
            'level': level,
            'children': []
        }
        
        if path.is_file():
            result['size'] = path.stat().st_size
            result['extension'] = path.suffix
            result['lines'] = self._count_lines(path) if path.suffix in self.track_extensions else 0
        
        if path.is_dir() and path.name not in self.ignore_dirs:
            try:
                items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name))
                for item in items:
                    if item.name.startswith('.') and item.name not in ['.env', '.env.local']:
                        continue
                    if item.is_dir() and item.name in self.ignore_dirs:
                        continue
                    child = self._scan_directory(item, level + 1)
                    result['children'].append(child)
            except PermissionError:
                pass
        
        return result
    
    def _count_lines(self, file_path: Path) -> int:
        """Count lines in a text file"""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return sum(1 for _ in f)
        except:
            return 0
    
    def _calculate_statistics(self):
        """Calculate project statistics"""
        stats = {
            'total_files': 0,
            'total_directories': 0,
            'total_size': 0,
            'total_lines': 0,
            'files_by_extension': {},
            'largest_files': [],
            'deepest_nesting': 0
        }
        
        def traverse(node: Dict, depth: int = 0):
            if node['type'] == 'file':
                stats['total_files'] += 1
                stats['total_size'] += node.get('size', 0)
                stats['total_lines'] += node.get('lines', 0)
                
                ext = node.get('extension', 'no_extension')
                stats['files_by_extension'][ext] = stats['files_by_extension'].get(ext, 0) + 1
                
                # Track largest files
                if node.get('size', 0) > 0:
                    stats['largest_files'].append({
                        'path': node['path'],
                        'size': node['size'],
                        'size_mb': round(node['size'] / 1024 / 1024, 2)
                    })
            else:
                stats['total_directories'] += 1
                stats['deepest_nesting'] = max(stats['deepest_nesting'], depth)
                
                for child in node.get('children', []):
                    traverse(child, depth + 1)
        
        traverse(self.structure)
        
        # Sort largest files
        stats['largest_files'] = sorted(
            stats['largest_files'], 
            key=lambda x: x['size'], 
            reverse=True
        )[:20]
        
        # Convert size to MB
        stats['total_size_mb'] = round(stats['total_size'] / 1024 / 1024, 2)
        
        self.tree_data['statistics'] = stats
    
    def _find_duplicates(self):
        """Find duplicate files and folders"""
        duplicates = {
            'duplicate_names': {},
            'similar_folders': [],
            'redundant_configs': []
        }
        
        name_map = {}
        
        def traverse(node: Dict):
            name = node['name'].lower()
            
            # Skip common files
            if name in ['index.ts', 'index.tsx', 'index.js', 'page.tsx', 'layout.tsx']:
                return
                
            if name in name_map:
                if name not in duplicates['duplicate_names']:
                    duplicates['duplicate_names'][name] = [name_map[name]]
                duplicates['duplicate_names'][name].append(node['path'])
            else:
                name_map[name] = node['path']
            
            for child in node.get('children', []):
                traverse(child)
        
        traverse(self.structure)
        
        # Find similar folder names
        folders = self._get_all_folders()
        for i, folder1 in enumerate(folders):
            for folder2 in folders[i+1:]:
                if self._similar_names(folder1, folder2):
                    duplicates['similar_folders'].append([folder1, folder2])
        
        # Find redundant config files
        config_patterns = ['config', 'settings', 'options']
        for pattern in config_patterns:
            configs = [name for name in name_map.keys() if pattern in name]
            if len(configs) > 1:
                duplicates['redundant_configs'].extend(configs)
        
        self.tree_data['duplicates'] = duplicates
    
    def _get_all_folders(self) -> List[str]:
        """Get all folder names in the project"""
        folders = []
        
        def traverse(node: Dict):
            if node['type'] == 'directory':
                folders.append(node['name'])
            for child in node.get('children', []):
                traverse(child)
        
        traverse(self.structure)
        return folders
    
    def _similar_names(self, name1: str, name2: str) -> bool:
        """Check if two names are similar"""
        # Remove common suffixes
        for suffix in ['s', 'es', '-', '_']:
            if name1.endswith(suffix):
                name1 = name1[:-len(suffix)]
            if name2.endswith(suffix):
                name2 = name2[:-len(suffix)]
        
        return name1 == name2 and name1 != name2
    
    def _identify_issues(self):
        """Identify structural issues"""
        issues = []
        
        # Check for duplicate app/src structure
        if self._path_exists('app') and self._path_exists('src/app'):
            issues.append({
                'type': 'critical',
                'message': 'Duplicate app directories found: /app and /src/app',
                'recommendation': 'Consolidate all app router files under /src/app'
            })
        
        # Check for duplicate lib folders
        if self._path_exists('lib') and self._path_exists('src/lib'):
            issues.append({
                'type': 'critical',
                'message': 'Duplicate lib directories found: /lib and /src/lib',
                'recommendation': 'Consolidate all library files under /src/lib'
            })
        
        # Check for missing public folder
        if not self._path_exists('public'):
            issues.append({
                'type': 'warning',
                'message': 'Missing /public directory for static assets',
                'recommendation': 'Create /public directory for images, fonts, and static files'
            })
        
        # Check for multiple config files
        configs = ['next.config.js', 'next.config.ts', 'next.config.mjs']
        found_configs = [c for c in configs if self._path_exists(c)]
        if len(found_configs) > 1:
            issues.append({
                'type': 'critical',
                'message': f'Multiple Next.js config files found: {", ".join(found_configs)}',
                'recommendation': 'Keep only next.config.ts and remove others'
            })
        
        # Check for scattered test files
        if self._path_exists('__tests__') and (self._path_exists('tests') or self._path_exists('test')):
            issues.append({
                'type': 'warning',
                'message': 'Test files scattered in multiple directories',
                'recommendation': 'Consolidate all tests under /tests directory'
            })
        
        # Check for mixed file types
        if self._path_exists('requirements.txt') or self._has_python_files():
            issues.append({
                'type': 'info',
                'message': 'Python files found in TypeScript project',
                'recommendation': 'Move Python scripts to /scripts directory or remove if not needed'
            })
        
        # Check for duplicate type definitions
        if self._path_exists('types') and self._path_exists('src/types'):
            issues.append({
                'type': 'warning',
                'message': 'Duplicate type directories found',
                'recommendation': 'Consolidate all TypeScript types under /src/types'
            })
        
        # Check component organization
        component_dirs = self._find_component_directories()
        if len(component_dirs) > 2:
            issues.append({
                'type': 'warning',
                'message': f'Components scattered across {len(component_dirs)} directories',
                'recommendation': 'Consolidate components under /src/components with proper categorization'
            })
        
        self.tree_data['issues'] = issues
    
    def _path_exists(self, relative_path: str) -> bool:
        """Check if a path exists relative to root"""
        return (self.root_path / relative_path).exists()
    
    def _has_python_files(self) -> bool:
        """Check if project has Python files"""
        return any(self.root_path.glob('*.py'))
    
    def _find_component_directories(self) -> List[str]:
        """Find all directories containing components"""
        component_dirs = []
        
        def traverse(node: Dict, current_path: str = ''):
            path = f"{current_path}/{node['name']}" if current_path else node['name']
            
            if 'component' in node['name'].lower():
                component_dirs.append(path)
            
            for child in node.get('children', []):
                if child['type'] == 'directory':
                    traverse(child, path)
        
        traverse(self.structure)
        return component_dirs
    
    def _generate_recommendations(self):
        """Generate structure recommendations"""
        recommendations = [
            {
                'priority': 'high',
                'action': 'Consolidate all source code under /src directory',
                'reason': 'Maintains clear separation between source code and configuration'
            },
            {
                'priority': 'high',
                'action': 'Implement strict DAL pattern in /src/lib/dal',
                'reason': 'Required by project architecture (CLAUDE.md)'
            },
            {
                'priority': 'medium',
                'action': 'Organize components by feature in /src/components/features',
                'reason': 'Improves maintainability and discoverability'
            },
            {
                'priority': 'medium',
                'action': 'Create /public directory for static assets',
                'reason': 'Standard Next.js structure for optimized asset serving'
            },
            {
                'priority': 'low',
                'action': 'Move scripts to /scripts directory',
                'reason': 'Separates build/utility scripts from source code'
            }
        ]
        
        self.tree_data['recommendations'] = recommendations
    
    def save_tree(self, output_path: str = 'project_tree_analysis.json'):
        """Save tree data to JSON file"""
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(self.tree_data, f, indent=2, ensure_ascii=False)
        print(f"✅ Project tree saved to {output_path}")
    
    def generate_markdown_tree(self, output_path: str = 'project_tree.md'):
        """Generate a markdown representation of the tree"""
        lines = [
            "# FigDream Project Structure",
            f"\nGenerated: {self.tree_data['generated_at']}",
            "\n## 📊 Statistics\n"
        ]
        
        stats = self.tree_data['statistics']
        lines.extend([
            f"- **Total Files**: {stats['total_files']}",
            f"- **Total Directories**: {stats['total_directories']}",
            f"- **Total Size**: {stats['total_size_mb']} MB",
            f"- **Total Lines of Code**: {stats['total_lines']:,}",
            f"- **Deepest Nesting**: {stats['deepest_nesting']} levels",
            "\n### Files by Extension\n"
        ])
        
        for ext, count in sorted(stats['files_by_extension'].items(), key=lambda x: x[1], reverse=True)[:10]:
            lines.append(f"- `{ext}`: {count} files")
        
        lines.append("\n## 📁 Directory Structure\n")
        lines.append("```")
        
        def add_tree_lines(node: Dict, prefix: str = "", is_last: bool = True):
            connector = "└── " if is_last else "├── "
            icon = "📁 " if node['type'] == 'directory' else "📄 "
            
            if node['name'] != 'figdream':  # Skip root
                lines.append(f"{prefix}{connector}{icon}{node['name']}")
            
            if node['type'] == 'directory' and node.get('children'):
                extension = "    " if is_last else "│   "
                new_prefix = prefix + extension if node['name'] != 'figdream' else ""
                
                children = node['children']
                for i, child in enumerate(children):
                    add_tree_lines(child, new_prefix, i == len(children) - 1)
        
        add_tree_lines(self.structure)
        lines.append("```")
        
        # Add issues section
        if self.tree_data['issues']:
            lines.append("\n## ⚠️ Issues Found\n")
            for issue in self.tree_data['issues']:
                emoji = "🔴" if issue['type'] == 'critical' else "🟡" if issue['type'] == 'warning' else "🔵"
                lines.append(f"\n{emoji} **{issue['message']}**")
                lines.append(f"   - {issue['recommendation']}")
        
        # Add recommendations
        lines.append("\n## 💡 Recommendations\n")
        for rec in self.tree_data['recommendations']:
            priority_emoji = "🔴" if rec['priority'] == 'high' else "🟡" if rec['priority'] == 'medium' else "🔵"
            lines.append(f"\n{priority_emoji} **{rec['action']}**")
            lines.append(f"   - {rec['reason']}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"✅ Markdown tree saved to {output_path}")

def main():
    # Get the current directory
    project_root = os.getcwd()
    
    print(f"🚀 Analyzing project at: {project_root}")
    print("=" * 50)
    
    # Generate tree
    generator = ProjectTreeGenerator(project_root)
    tree_data = generator.generate_tree()
    
    # Save outputs
    generator.save_tree('project_tree_analysis.json')
    generator.generate_markdown_tree('project_tree.md')
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 Summary:")
    stats = tree_data['statistics']
    print(f"  - Files: {stats['total_files']}")
    print(f"  - Directories: {stats['total_directories']}")
    print(f"  - Total Size: {stats['total_size_mb']} MB")
    print(f"  - Lines of Code: {stats['total_lines']:,}")
    
    if tree_data['issues']:
        print(f"\n⚠️  Found {len(tree_data['issues'])} issues")
        critical = [i for i in tree_data['issues'] if i['type'] == 'critical']
        if critical:
            print(f"  - {len(critical)} critical issues require immediate attention")
    
    print("\n✅ Analysis complete! Check the generated files for details.")

if __name__ == "__main__":
    main()