#!/usr/bin/env python3
"""
nextjs_supabase_debug_report.py

Enhanced Debugging Report Generator for Next.js + TypeScript + Supabase projects.

Features:
  - Layered reports with clear sections:
      🔴 Critical Issues | 🟡 Warnings | 🟢 Info/Checks Passed
  - At-a-glance summary with counts of failures, warnings, and successes
  - Step-by-step remediation guidance for each error type
  - Modular ReportBuilder class for structured report generation
  - Preserves original CLI flow but adds developer-friendly output

Artifacts (saved to error_reports/ folder):
  - debug_report.md (comprehensive layered report)
  - typescript_errors.md (with fix suggestions)
  - eslint_errors.md (with fix suggestions)
  - build_errors.md (with fix suggestions)

Usage:
  python nextjs_supabase_debug_report.py --project . --probe-supabase --run-typecheck --run-lint --run-build
"""

import argparse
import datetime
import json
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ------------------------------- Utilities --------------------------------- #

def run(cmd: List[str], cwd: Optional[Path] = None, timeout: int = 300) -> Tuple[int, str, str]:
    """Run a command and capture output."""
    try:
        proc = subprocess.run(cmd, cwd=str(cwd) if cwd else None,
                              stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                              timeout=timeout, text=True, shell=False)
        return proc.returncode, proc.stdout.strip(), proc.stderr.strip()
    except FileNotFoundError:
        return 127, "", f"Command not found: {cmd[0]}"
    except subprocess.TimeoutExpired:
        return 124, "", f"Timed out after {timeout}s: {' '.join(cmd)}"
    except Exception as e:
        return 1, "", f"Error running {' '.join(cmd)}: {e}"

def read_json(path: Path) -> Optional[Dict[str, Any]]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None

# --------------------------- Report Builder -------------------------------- #

class ReportBuilder:
    def __init__(self):
        self.critical: List[str] = []
        self.warnings: List[str] = []
        self.infos: List[str] = []

    def add(self, severity: str, message: str, fix: Optional[str] = None):
        block = f"{message}\n"
        if fix:
            block += f"➡️ How to Fix: {fix}\n"
        if severity == "critical":
            self.critical.append(block)
        elif severity == "warning":
            self.warnings.append(block)
        else:
            self.infos.append(block)

    def build_summary(self) -> str:
        return (
            f"## ✅ Debugging Summary\n\n"
            f"- 🔴 Critical Issues: {len(self.critical)}\n"
            f"- 🟡 Warnings: {len(self.warnings)}\n"
            f"- 🟢 Passed Checks: {len(self.infos)}\n"
        )

    def build_report(self) -> str:
        parts = ["# 📝 Next.js + Supabase Debug Report", ""]

        parts.append(self.build_summary())

        if self.critical:
            parts.append("## 🔴 Critical Issues\n" + "\n".join(self.critical))
        if self.warnings:
            parts.append("## 🟡 Warnings\n" + "\n".join(self.warnings))
        if self.infos:
            parts.append("## 🟢 Info / Checks Passed\n" + "\n".join(self.infos))

        return "\n\n".join(parts)

# ---------------------------- Main Workflow -------------------------------- #

def main():
    parser = argparse.ArgumentParser(description="Generate debugging reports for Next.js + Supabase.")
    parser.add_argument("--project", type=str, default=".", help="Path to project root")
    parser.add_argument("--probe-supabase", action="store_true", help="Check Supabase connection")
    parser.add_argument("--run-typecheck", action="store_true", help="Run TypeScript typecheck")
    parser.add_argument("--run-lint", action="store_true", help="Run ESLint")
    parser.add_argument("--run-build", action="store_true", help="Run Next.js build")
    args = parser.parse_args()

    project_root = Path(args.project).resolve()
    report_dir = project_root / "error_reports"
    report_dir.mkdir(exist_ok=True)

    report = ReportBuilder()

    # ---------------- Dependency Check ----------------
    print("Checking dependencies...")
    package_json = read_json(project_root / "package.json")
    if package_json:
        dependencies = package_json.get("dependencies", {})
        dev_dependencies = package_json.get("devDependencies", {})
        
        # Check for critical missing dependencies
        missing_deps = []
        required_deps = ["resend", "twilio", "@supabase/supabase-js"]
        for dep in required_deps:
            if dep not in dependencies and dep not in dev_dependencies:
                missing_deps.append(dep)
        
        if missing_deps:
            report.add("critical", f"Missing critical dependencies: {', '.join(missing_deps)}",
                       fix=f"Install missing packages: npm install {' '.join(missing_deps)}")
        else:
            report.add("info", "All critical dependencies are installed ✅.")
    else:
        report.add("warning", "Could not read package.json", 
                   fix="Ensure package.json exists in project root")

    # ---------------- Database Schema Analysis ----------------
    print("Analyzing database schema...")
    db_types_file = project_root / "src/types/database.types.ts"
    if db_types_file.exists():
        db_content = db_types_file.read_text(encoding="utf-8")
        # Extract table names from the database types
        import re
        table_matches = re.findall(r'^\s+([a-zA-Z_]+):\s*\{$', db_content, re.MULTILINE)
        existing_tables = [t for t in table_matches if not t.startswith(('Row', 'Insert', 'Update', 'Relationships'))]
        
        # Check for common missing tables that the code expects
        expected_tables = [
            'marketing_campaigns', 'email_events', 'campaign_metrics', 
            'sms_events', 'transactional_sms_log', 'email_templates'
        ]
        missing_tables = [t for t in expected_tables if t not in existing_tables]
        
        if missing_tables:
            report.add("warning", f"Code expects tables that don't exist in database: {', '.join(missing_tables)}",
                       fix="Either create these tables in the database or update the code to use existing tables")
        else:
            report.add("info", f"Database schema analysis complete. Found {len(existing_tables)} tables ✅.")
    else:
        report.add("warning", "Database types file not found", 
                   fix="Run 'npx supabase gen types typescript' to generate database types")

    # ---------------- Supabase Probe ----------------
    if args.probe_supabase:
        code, out, err = run(["supabase", "status"], cwd=project_root)
        if code == 0:
            report.add("info", "Supabase connection successful.")
        else:
            report.add("critical", f"Supabase connection failed: {err or out}",
                       fix="Check your .env.local for SUPABASE_URL and SUPABASE_ANON_KEY. Run 'supabase start' if local.")

    # ---------------- TypeScript ----------------
    if args.run_typecheck:
        print("Running TypeScript typecheck...")
        code, out, err = run(["npx", "tsc", "--noEmit", "--maxNodeModuleJsDepth", "0"], cwd=project_root)
        ts_report = (report_dir / "typescript_errors.md")
        if code != 0:
            error_output = err or out
            ts_report.write_text(f"# TypeScript Errors\n\nGenerated: {datetime.datetime.now().isoformat()}\n\n{error_output}")
            
            # Count errors for summary
            error_count = error_output.count("error TS")
            
            # Analyze error patterns
            missing_table_errors = error_output.count("is not assignable to parameter of type")
            import_errors = error_output.count("Cannot find module")
            type_errors = error_output.count("Property") + error_output.count("does not exist on type")
            
            analysis = []
            if missing_table_errors > 0:
                analysis.append(f"Database schema mismatches: {missing_table_errors} errors")
            if import_errors > 0:
                analysis.append(f"Missing imports: {import_errors} errors")
            if type_errors > 0:
                analysis.append(f"Type mismatches: {type_errors} errors")
            
            analysis_text = f" ({', '.join(analysis)})" if analysis else ""
            
            report.add("critical", f"TypeScript errors found ({error_count} errors){analysis_text}. See {ts_report.name}",
                       fix="1. Install missing dependencies: npm install resend twilio\n2. Generate database types: npx supabase gen types typescript\n3. Fix variable redeclarations and schema mismatches\n4. Check database schema vs code expectations\n5. Run 'npx tsc --noEmit' locally for detailed errors")
        else:
            report.add("info", "TypeScript typecheck passed ✅.")

    # ---------------- ESLint ----------------
    if args.run_lint:
        print("Running ESLint...")
        code, out, err = run(["npx", "eslint", ".", "--max-warnings", "0"], cwd=project_root)
        eslint_report = (report_dir / "eslint_errors.md")
        if code != 0:
            error_output = err or out
            eslint_report.write_text(f"# ESLint Errors\n\nGenerated: {datetime.datetime.now().isoformat()}\n\n{error_output}")
            
            # Count issues for summary
            warning_count = error_output.count("warning")
            error_count = error_output.count("error")
            report.add("warning", f"Lint issues found ({error_count} errors, {warning_count} warnings). See {eslint_report.name}",
                       fix="Run 'npx eslint . --fix' to auto-fix issues. Check eslint.config.mjs for configuration.")
        else:
            report.add("info", "ESLint check passed ✅.")

    # ---------------- Build ----------------
    if args.run_build:
        code, out, err = run(["npx", "next", "build"], cwd=project_root)
        build_report = (report_dir / "build_errors.md")
        if code != 0:
            build_report.write_text("# Next.js Build Errors\n\n" + (err or out))
            report.add("critical", f"Build failed. See {build_report.name}",
                       fix="Clear .next/, reinstall deps (rm -rf node_modules && npm install), and retry.")
        else:
            report.add("info", "Next.js build succeeded ✅.")

    # ---------------- Save Main Report ----------------
    debug_report = report_dir / "debug_report.md"
    debug_report.write_text(report.build_report())

    print(f"Debug report generated at: {debug_report}")

if __name__ == "__main__":
    main()
