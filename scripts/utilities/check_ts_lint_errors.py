#!/usr/bin/env python3
"""
TypeScript and ESLint Error Checker
Generates 3 markdown files with organized error reports
"""

import subprocess
import os
import json
import datetime
from pathlib import Path
import re
from collections import defaultdict

class TSLintErrorChecker:
    def __init__(self):
        self.timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.date_str = datetime.datetime.now().strftime("%Y%m%d")
        self.typescript_errors = []
        self.eslint_errors = []
        self.summary_data = {}
        
    def run_typescript_check(self):
        """Run TypeScript checking and collect errors"""
        print("🔍 Running TypeScript check...")
        
        try:
            # Run TypeScript compiler directly
            result = subprocess.run(
                ["npx", "tsc", "--noEmit"],
                capture_output=True,
                text=True,
                cwd=os.getcwd()
            )
            
            output = result.stdout + result.stderr
            
            # Parse TypeScript errors
            errors_by_file = defaultdict(list)
            current_file = None
            
            for line in output.split('\n'):
                # Match TypeScript error format: path(line,col): error TS####: message
                match = re.match(r'^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$', line)
                if match:
                    file_path = match.group(1)
                    line_num = match.group(2)
                    col_num = match.group(3)
                    error_code = match.group(4)
                    message = match.group(5)
                    
                    errors_by_file[file_path].append({
                        'line': line_num,
                        'column': col_num,
                        'code': error_code,
                        'message': message
                    })
            
            # Convert to list format
            for file_path, errors in errors_by_file.items():
                self.typescript_errors.append({
                    'file': file_path,
                    'errors': errors,
                    'count': len(errors)
                })
            
            total_errors = sum(item['count'] for item in self.typescript_errors)
            print(f"  Found {total_errors} TypeScript errors in {len(self.typescript_errors)} files")
            
            return total_errors
            
        except Exception as e:
            print(f"  ❌ Error running TypeScript check: {e}")
            return 0
    
    def run_eslint_check(self):
        """Run ESLint checking and collect errors"""
        print("🔍 Running ESLint check...")
        
        try:
            # Run ESLint with JSON formatter
            result = subprocess.run(
                ["npx", "eslint", ".", "--format", "json"],
                capture_output=True,
                text=True,
                cwd=os.getcwd()
            )
            
            if result.stdout:
                try:
                    eslint_results = json.loads(result.stdout)
                    
                    for file_result in eslint_results:
                        if file_result.get('errorCount', 0) > 0 or file_result.get('warningCount', 0) > 0:
                            file_path = file_result.get('filePath', '').replace(os.getcwd() + '/', '')
                            
                            errors = []
                            warnings = []
                            
                            for message in file_result.get('messages', []):
                                msg_data = {
                                    'line': message.get('line', 0),
                                    'column': message.get('column', 0),
                                    'rule': message.get('ruleId', 'unknown'),
                                    'message': message.get('message', ''),
                                    'severity': message.get('severity', 1)
                                }
                                
                                if message.get('severity') == 2:
                                    errors.append(msg_data)
                                else:
                                    warnings.append(msg_data)
                            
                            if errors or warnings:
                                self.eslint_errors.append({
                                    'file': file_path,
                                    'errors': errors,
                                    'warnings': warnings,
                                    'errorCount': len(errors),
                                    'warningCount': len(warnings)
                                })
                    
                    total_errors = sum(item['errorCount'] for item in self.eslint_errors)
                    total_warnings = sum(item['warningCount'] for item in self.eslint_errors)
                    print(f"  Found {total_errors} ESLint errors and {total_warnings} warnings in {len(self.eslint_errors)} files")
                    
                    return total_errors, total_warnings
                    
                except json.JSONDecodeError:
                    print("  ⚠️ Could not parse ESLint JSON output")
                    return 0, 0
            else:
                print("  ✅ No ESLint errors found")
                return 0, 0
                
        except Exception as e:
            print(f"  ❌ Error running ESLint check: {e}")
            return 0, 0
    
    def generate_summary_markdown(self):
        """Generate summary markdown file"""
        content = f"""# Error Check Summary
Generated: {self.timestamp}

## Overview

| Check | Files with Errors | Total Errors | Status |
|-------|-------------------|--------------|--------|
| TypeScript | {len(self.typescript_errors)} | {sum(item['count'] for item in self.typescript_errors)} | {'❌ Failed' if self.typescript_errors else '✅ Passed'} |
| ESLint | {len(self.eslint_errors)} | {sum(item['errorCount'] for item in self.eslint_errors)} | {'❌ Failed' if any(item['errorCount'] > 0 for item in self.eslint_errors) else '✅ Passed'} |

## Quick Stats

- **Total Files with Issues**: {len(self.typescript_errors) + len(self.eslint_errors)}
- **Total TypeScript Errors**: {sum(item['count'] for item in self.typescript_errors)}
- **Total ESLint Errors**: {sum(item['errorCount'] for item in self.eslint_errors)}
- **Total ESLint Warnings**: {sum(item['warningCount'] for item in self.eslint_errors)}

## Top Files with Most Errors

### TypeScript
"""
        
        # Top TypeScript error files
        ts_sorted = sorted(self.typescript_errors, key=lambda x: x['count'], reverse=True)[:10]
        if ts_sorted:
            content += "\n| File | Error Count |\n|------|-------------|\n"
            for item in ts_sorted:
                file_name = item['file'].split('/')[-1] if '/' in item['file'] else item['file']
                content += f"| `{file_name}` | {item['count']} |\n"
        else:
            content += "\nNo TypeScript errors found! ✅\n"
        
        content += "\n### ESLint\n"
        
        # Top ESLint error files
        eslint_sorted = sorted(self.eslint_errors, key=lambda x: x['errorCount'], reverse=True)[:10]
        if eslint_sorted:
            content += "\n| File | Errors | Warnings |\n|------|--------|----------|\n"
            for item in eslint_sorted:
                file_name = item['file'].split('/')[-1] if '/' in item['file'] else item['file']
                content += f"| `{file_name}` | {item['errorCount']} | {item['warningCount']} |\n"
        else:
            content += "\nNo ESLint errors found! ✅\n"
        
        content += f"""

## Action Items

1. **Fix TypeScript Errors First** - These are blocking compilation
2. **Address ESLint Errors** - These affect code quality
3. **Review ESLint Warnings** - Consider fixing for better code standards

## Commands to Run

```bash
# Fix TypeScript errors
npm run typecheck

# Fix ESLint errors (auto-fix what's possible)
npm run lint -- --fix

# Check specific file
npx tsc --noEmit path/to/file.ts
npx eslint path/to/file.ts
```

---
*Report generated on {self.timestamp}*
"""
        
        return content
    
    def generate_typescript_markdown(self):
        """Generate detailed TypeScript errors markdown"""
        content = f"""# TypeScript Error Report
Generated: {self.timestamp}

## Summary
- **Total Files with Errors**: {len(self.typescript_errors)}
- **Total Errors**: {sum(item['count'] for item in self.typescript_errors)}

## Errors by File
"""
        
        if not self.typescript_errors:
            content += "\n✅ **No TypeScript errors found!**\n"
            return content
        
        # Group errors by error code
        error_types = defaultdict(int)
        
        for file_item in sorted(self.typescript_errors, key=lambda x: x['count'], reverse=True):
            content += f"\n### 📁 `{file_item['file']}`\n"
            content += f"**Errors: {file_item['count']}**\n\n"
            
            for error in file_item['errors'][:20]:  # Limit to first 20 errors per file
                content += f"- **Line {error['line']}:{error['column']}** - `{error['code']}`: {error['message']}\n"
                error_types[error['code']] += 1
            
            if len(file_item['errors']) > 20:
                content += f"\n*... and {len(file_item['errors']) - 20} more errors in this file*\n"
            
            content += "\n---\n"
        
        # Add error type summary
        content += "\n## Error Types Summary\n\n"
        content += "| Error Code | Count | Description |\n"
        content += "|------------|-------|-------------|\n"
        
        common_errors = {
            'TS2307': 'Cannot find module',
            'TS2339': 'Property does not exist',
            'TS2345': 'Argument type mismatch',
            'TS2322': 'Type assignment error',
            'TS2304': 'Cannot find name',
            'TS7006': 'Parameter implicitly has "any" type',
            'TS2571': 'Object is of type "unknown"'
        }
        
        for error_code, count in sorted(error_types.items(), key=lambda x: x[1], reverse=True):
            desc = common_errors.get(error_code, 'Other error')
            content += f"| `{error_code}` | {count} | {desc} |\n"
        
        content += f"""

## How to Fix

1. **Start with import errors** (`TS2307`) - Fix missing modules first
2. **Fix type definitions** (`TS7006`) - Add proper types to parameters
3. **Property errors** (`TS2339`) - Check object interfaces
4. **Type mismatches** (`TS2322`, `TS2345`) - Align types properly

---
*Generated on {self.timestamp}*
"""
        
        return content
    
    def generate_eslint_markdown(self):
        """Generate detailed ESLint errors markdown"""
        content = f"""# ESLint Error Report
Generated: {self.timestamp}

## Summary
- **Total Files with Issues**: {len(self.eslint_errors)}
- **Total Errors**: {sum(item['errorCount'] for item in self.eslint_errors)}
- **Total Warnings**: {sum(item['warningCount'] for item in self.eslint_errors)}

## Errors and Warnings by File
"""
        
        if not self.eslint_errors:
            content += "\n✅ **No ESLint errors found!**\n"
            return content
        
        # Group by rule
        rule_counts = defaultdict(lambda: {'errors': 0, 'warnings': 0})
        
        # Files with errors first
        files_with_errors = [f for f in self.eslint_errors if f['errorCount'] > 0]
        files_with_warnings_only = [f for f in self.eslint_errors if f['errorCount'] == 0 and f['warningCount'] > 0]
        
        if files_with_errors:
            content += "\n## 🔴 Files with Errors\n"
            
            for file_item in sorted(files_with_errors, key=lambda x: x['errorCount'], reverse=True):
                content += f"\n### 📁 `{file_item['file']}`\n"
                content += f"**Errors: {file_item['errorCount']} | Warnings: {file_item['warningCount']}**\n\n"
                
                if file_item['errors']:
                    content += "#### Errors:\n"
                    for error in file_item['errors'][:15]:  # Limit to first 15
                        content += f"- **Line {error['line']}:{error['column']}** - `{error['rule']}`: {error['message']}\n"
                        rule_counts[error['rule']]['errors'] += 1
                    
                    if len(file_item['errors']) > 15:
                        content += f"\n*... and {len(file_item['errors']) - 15} more errors*\n"
                
                if file_item['warnings']:
                    content += "\n#### Warnings:\n"
                    for warning in file_item['warnings'][:10]:  # Limit to first 10
                        content += f"- **Line {warning['line']}:{warning['column']}** - `{warning['rule']}`: {warning['message']}\n"
                        rule_counts[warning['rule']]['warnings'] += 1
                    
                    if len(file_item['warnings']) > 10:
                        content += f"\n*... and {len(file_item['warnings']) - 10} more warnings*\n"
                
                content += "\n---\n"
        
        if files_with_warnings_only:
            content += "\n## 🟡 Files with Warnings Only\n"
            content += "\n| File | Warnings |\n|------|----------|\n"
            for file_item in sorted(files_with_warnings_only, key=lambda x: x['warningCount'], reverse=True)[:20]:
                file_name = file_item['file'].split('/')[-1] if '/' in file_item['file'] else file_item['file']
                content += f"| `{file_name}` | {file_item['warningCount']} |\n"
        
        # Add rule summary
        content += "\n## Rule Violations Summary\n\n"
        content += "| Rule | Errors | Warnings | Total |\n"
        content += "|------|--------|----------|-------|\n"
        
        for rule, counts in sorted(rule_counts.items(), key=lambda x: x[1]['errors'] + x[1]['warnings'], reverse=True)[:20]:
            total = counts['errors'] + counts['warnings']
            content += f"| `{rule}` | {counts['errors']} | {counts['warnings']} | {total} |\n"
        
        content += f"""

## How to Fix

### Auto-fix Available
```bash
# Auto-fix all possible errors
npm run lint -- --fix

# Fix specific file
npx eslint path/to/file.ts --fix
```

### Manual Fixes Required
1. Review each error that can't be auto-fixed
2. Update code to comply with ESLint rules
3. If a rule is too strict, consider updating `.eslintrc.json`

---
*Generated on {self.timestamp}*
"""
        
        return content
    
    def save_reports(self):
        """Save all three markdown reports"""
        # Create reports directory
        reports_dir = Path("error_reports")
        reports_dir.mkdir(exist_ok=True)
        
        # Generate file names with date
        summary_file = reports_dir / f"ERROR_SUMMARY_{self.date_str}.md"
        typescript_file = reports_dir / f"TYPESCRIPT_ERRORS_{self.date_str}.md"
        eslint_file = reports_dir / f"ESLINT_ERRORS_{self.date_str}.md"
        
        # Generate and save reports
        print("\n📝 Generating reports...")
        
        summary_content = self.generate_summary_markdown()
        summary_file.write_text(summary_content)
        print(f"  ✅ Saved: {summary_file}")
        
        typescript_content = self.generate_typescript_markdown()
        typescript_file.write_text(typescript_content)
        print(f"  ✅ Saved: {typescript_file}")
        
        eslint_content = self.generate_eslint_markdown()
        eslint_file.write_text(eslint_content)
        print(f"  ✅ Saved: {eslint_file}")
        
        return summary_file, typescript_file, eslint_file
    
    def run(self):
        """Run all checks and generate reports"""
        print("="*60)
        print("🚀 TypeScript & ESLint Error Checker")
        print("="*60)
        
        # Run checks
        ts_errors = self.run_typescript_check()
        eslint_errors, eslint_warnings = self.run_eslint_check()
        
        # Save reports
        summary_file, ts_file, eslint_file = self.save_reports()
        
        # Print summary
        print("\n" + "="*60)
        print("📊 SUMMARY")
        print("="*60)
        print(f"TypeScript Errors: {ts_errors}")
        print(f"ESLint Errors: {eslint_errors}")
        print(f"ESLint Warnings: {eslint_warnings}")
        
        print("\n📁 Reports saved:")
        print(f"  1. {summary_file}")
        print(f"  2. {ts_file}")
        print(f"  3. {eslint_file}")
        
        if ts_errors > 0 or eslint_errors > 0:
            print("\n⚠️  Errors found! Please review the reports.")
            return 1
        else:
            print("\n✅ No errors found!")
            return 0

def main():
    checker = TSLintErrorChecker()
    exit_code = checker.run()
    exit(exit_code)

if __name__ == "__main__":
    main()