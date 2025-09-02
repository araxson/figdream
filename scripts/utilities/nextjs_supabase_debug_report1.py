#!/usr/bin/env python3
"""
nextjs_supabase_debug_report.py

Generates a layered, professional debugging report for a Next.js project
(using TypeScript) that integrates with Supabase. The report includes a
clear "at-a-glance" summary, prioritized issues, detailed diagnostics,
and step-by-step remediation guidance.

Usage (from your project root or with --project):
  python nextjs_supabase_debug_report.py --project . --probe-supabase --run-typecheck --run-lint --run-build

Artifacts (saved to error_reports/ folder):
  - debug_report.md (comprehensive report)
  - typescript_errors.md (TypeScript errors)
  - eslint_errors.md (ESLint errors)
  - build_errors.md (Build errors)

Requirements:
  - Python 3.8+
  - Optional: node, npm, tsc, eslint, next, supabase CLI (if you use related flags)
"""

import argparse
import base64
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import textwrap
from dataclasses import dataclass, field
from html import escape
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


# ------------------------------- Utilities --------------------------------- #

def run(cmd: List[str], cwd: Optional[Path] = None, timeout: int = 90) -> Tuple[int, str, str]:
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


def safe_read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        return ""


def detect_pkg_manager(root: Path) -> str:
    if (root / "package-lock.json").exists():
        return "npm"
    if (root / "yarn.lock").exists():
        return "yarn"
    if (root / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (root / "bun.lockb").exists():
        return "bun"
    return "unknown"


def find_files(root: Path, patterns: List[str], max_files: int = 5000) -> List[Path]:
    matches: List[Path] = []
    for pattern in patterns:
        for p in root.rglob(pattern):
            # skip node_modules/.next/.git by default
            parts = set(p.parts)
            if "node_modules" in parts or ".next" in parts or ".git" in parts:
                continue
            matches.append(p)
            if len(matches) >= max_files:
                return matches
    return matches


def decode_jwt_without_verify(token: str) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
    try:
        parts = token.split(".")
        if len(parts) < 2:
            return None, None
        def b64url_decode(s: str) -> bytes:
            s += "=" * (-len(s) % 4)
            return base64.urlsafe_b64decode(s.encode("utf-8"))
        header = json.loads(b64url_decode(parts[0]).decode("utf-8"))
        payload = json.loads(b64url_decode(parts[1]).decode("utf-8"))
        return header, payload
    except Exception:
        return None, None


# ------------------------------- Data Model -------------------------------- #

@dataclass
class Finding:
    severity: str  # "critical", "warning", "info"
    title: str
    message: str
    recommendation: str
    evidence: Optional[str] = None
    steps: List[str] = field(default_factory=list)


@dataclass
class Section:
    title: str
    findings: List[Finding] = field(default_factory=list)
    notes: List[str] = field(default_factory=list)


@dataclass
class Report:
    generated_at: str
    project_root: str
    overview: Section
    env: Section
    structure: Section
    dependencies: Section
    typescript: Section
    nextjs_config: Section
    supabase: Section
    tooling: Section
    run_results: Section
    all_sections: List[Section] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        def finding_to_dict(f: Finding) -> Dict[str, Any]:
            return {
                "severity": f.severity,
                "title": f.title,
                "message": f.message,
                "recommendation": f.recommendation,
                "evidence": f.evidence,
                "steps": f.steps,
            }
        def section_to_dict(s: Section) -> Dict[str, Any]:
            return {
                "title": s.title,
                "findings": [finding_to_dict(f) for f in s.findings],
                "notes": s.notes,
            }
        return {
            "generated_at": self.generated_at,
            "project_root": self.project_root,
            "sections": [section_to_dict(s) for s in self.all_sections],
        }

    def to_markdown(self) -> str:
        def badge(sev: str) -> str:
            colors = {"critical": "🔴", "warning": "🟠", "info": "🔵"}
            return colors.get(sev, "🔵")
        lines: List[str] = []
        lines.append(f"# Next.js + TypeScript + Supabase Debug Report")
        lines.append(f"_Generated: {self.generated_at}_")
        lines.append(f"_Project: {self.project_root}_")
        lines.append("")
        for section in self.all_sections:
            lines.append(f"## {section.title}")
            for f in section.findings:
                lines.append(f"**{badge(f.severity)} {f.title}**")
                lines.append("")
                lines.append(f"- **Summary:** {f.message}")
                lines.append(f"- **Recommendation:** {f.recommendation}")
                if f.evidence:
                    lines.append(f"- **Evidence:** `{f.evidence}`")
                if f.steps:
                    lines.append(f"- **Step-by-step:**")
                    for i, s in enumerate(f.steps, 1):
                        lines.append(f"  {i}. {s}")
                lines.append("")
            if section.notes:
                lines.append("**Notes:**")
                for n in section.notes:
                    lines.append(f"- {n}")
            lines.append("")
        return "\n".join(lines)

    def to_typescript_errors_markdown(self) -> str:
        """Generate TypeScript errors markdown report"""
        lines: List[str] = []
        lines.append("# TypeScript Errors Report")
        lines.append(f"_Generated: {self.generated_at}_")
        lines.append("")
        
        typescript_section = self.typescript
        if typescript_section and typescript_section.findings:
            lines.append("## TypeScript Configuration Issues")
            for f in typescript_section.findings:
                badge = {"critical": "🔴", "warning": "🟠", "info": "🔵"}.get(f.severity, "🔵")
                lines.append(f"**{badge} {f.title}**")
                lines.append(f"- {f.message}")
                if f.recommendation:
                    lines.append(f"- **Fix:** {f.recommendation}")
                lines.append("")
        
        # Add tooling results for TypeScript
        tooling_section = self.tooling
        if tooling_section:
            ts_findings = [f for f in tooling_section.findings if "typecheck" in f.title.lower()]
            if ts_findings:
                lines.append("## TypeScript Compilation Errors")
                for f in ts_findings:
                    lines.append(f"### {f.title}")
                    lines.append("```")
                    lines.append(f.message)
                    lines.append("```")
                    lines.append("")
        
        return "\n".join(lines)
    
    def to_eslint_errors_markdown(self) -> str:
        """Generate ESLint errors markdown report"""
        lines: List[str] = []
        lines.append("# ESLint Errors Report")
        lines.append(f"_Generated: {self.generated_at}_")
        lines.append("")
        
        # Add tooling results for ESLint
        tooling_section = self.tooling
        if tooling_section:
            eslint_findings = [f for f in tooling_section.findings if "eslint" in f.title.lower() or "lint" in f.title.lower()]
            if eslint_findings:
                lines.append("## ESLint Errors")
                for f in eslint_findings:
                    lines.append(f"### {f.title}")
                    lines.append("```")
                    lines.append(f.message)
                    lines.append("```")
                    lines.append("")
        
        return "\n".join(lines)
    
    def to_build_errors_markdown(self) -> str:
        """Generate build errors markdown report"""
        lines: List[str] = []
        lines.append("# Build Errors Report")
        lines.append(f"_Generated: {self.generated_at}_")
        lines.append("")
        
        # Add tooling results for build
        tooling_section = self.tooling
        if tooling_section:
            build_findings = [f for f in tooling_section.findings if "build" in f.title.lower()]
            if build_findings:
                lines.append("## Build Errors")
                for f in build_findings:
                    lines.append(f"### {f.title}")
                    lines.append("```")
                    lines.append(f.message)
                    lines.append("```")
                    if f.recommendation:
                        lines.append(f"**Recommendation:** {f.recommendation}")
                    lines.append("")
        
        return "\n".join(lines)


# ------------------------------- Checkers ---------------------------------- #

def check_environment(root: Path) -> Section:
    findings: List[Finding] = []
    notes: List[str] = []

    # Node & package manager
    code, out, err = run(["node", "-v"], cwd=root)
    if code == 0:
        findings.append(Finding(
            severity="info",
            title="Node.js detected",
            message=f"Node version: {out}",
            recommendation="Ensure Node.js version meets Next.js requirements (typically LTS).",
            evidence=out,
        ))
    else:
        findings.append(Finding(
            severity="critical",
            title="Node.js missing",
            message="Node.js is not available in PATH.",
            recommendation="Install Node.js (use LTS) and re-run the report.",
            evidence=err or "node not found",
            steps=["Visit https://nodejs.org and install the latest LTS.",
                   "Confirm with `node -v`."]
        ))

    pkg_mgr = detect_pkg_manager(root)
    notes.append(f"Detected package manager: {pkg_mgr}")
    if pkg_mgr == "unknown":
        findings.append(Finding(
            severity="warning",
            title="No lockfile detected",
            message="Could not detect npm/yarn/pnpm/bun lockfile.",
            recommendation="Use a single package manager and commit its lockfile to avoid version drift.",
            steps=["Use npm as the primary package manager for this project.",
                   "Remove other lockfiles if present and reinstall dependencies with npm."]
        ))

    # Supabase CLI (optional)
    code, out, _ = run(["supabase", "--version"], cwd=root)
    if code == 0:
        findings.append(Finding(
            severity="info",
            title="Supabase CLI detected",
            message=f"Supabase CLI version: {out}",
            recommendation="Keep Supabase CLI up to date for local dev and migrations.",
            evidence=out
        ))
    else:
        notes.append("Supabase CLI not found (only required for local dev/migrations).")

    # Git
    code, out, _ = run(["git", "rev-parse", "--is-inside-work-tree"], cwd=root)
    if code == 0 and out == "true":
        findings.append(Finding(
            severity="info",
            title="Git repository detected",
            message="Project is inside a Git repository.",
            recommendation="Use branches and conventional commits to track changes.",
        ))
    else:
        findings.append(Finding(
            severity="warning",
            title="Not a Git repository",
            message="Version control not detected.",
            recommendation="Initialize Git to track configuration and code changes.",
            steps=["Run `git init`", "Create a .gitignore (include .next, node_modules, .env*)."]
        ))

    return Section(title="Environment", findings=findings, notes=notes)


def check_structure(root: Path) -> Section:
    findings: List[Finding] = []
    notes: List[str] = []

    app_dir = (root / "app").exists()
    pages_dir = (root / "pages").exists()
    src_app_dir = (root / "src" / "app").exists()
    src_pages_dir = (root / "src" / "pages").exists()

    structure_summary = f"app/: {app_dir or src_app_dir}, pages/: {pages_dir or src_pages_dir}"
    notes.append(f"Routing dirs — {structure_summary}")

    if (app_dir or src_app_dir) and (pages_dir or src_pages_dir):
        findings.append(Finding(
            severity="warning",
            title="Both app/ and pages/ detected",
            message="Using both routers can be valid, but raises complexity.",
            recommendation="Prefer the App Router for new code; migrate legacy Pages incrementally.",
            steps=["Plan a migration path for pages/ to app/ where feasible."]
        ))
    elif not any([app_dir, src_app_dir, pages_dir, src_pages_dir]):
        findings.append(Finding(
            severity="critical",
            title="No routing directory found",
            message="Neither app/ nor pages/ directories were found.",
            recommendation="Create an `app/` directory for the App Router or a `pages/` for the Pages Router.",
            steps=["Create `app/page.tsx` as your entry route."]
        ))

    # API routes
    api_routes = find_files(root, ["app/**/route.ts", "app/**/route.tsx", "pages/api/**/*.ts", "src/pages/api/**/*.ts"])
    notes.append(f"API routes found: {len(api_routes)}")

    # Middleware
    if (root / "middleware.ts").exists() or (root / "src" / "middleware.ts").exists():
        findings.append(Finding(
            severity="info",
            title="middleware.ts present",
            message="Middleware detected.",
            recommendation="Ensure auth and rewrites are intentional and tested."
        ))

    # ESLint/Prettier presence
    eslint_files = ["eslint.config.mjs", ".eslintrc.js", ".eslintrc.cjs", ".eslintrc.json", ".eslintrc"]
    if not any((root / f).exists() for f in eslint_files):
        findings.append(Finding(
            severity="warning",
            title="ESLint config missing",
            message="No ESLint configuration found.",
            recommendation="Add ESLint with Next.js defaults for consistent code quality.",
            steps=["Run `npx eslint --init` to add ESLint configuration."]
        ))
    prettier = any((root / f).exists() for f in ["prettier.config.js", ".prettierrc", ".prettierrc.json", ".prettierrc.js"])
    if not prettier:
        findings.append(Finding(
            severity="info",
            title="Prettier config not found",
            message="Prettier isn't configured (optional but recommended).",
            recommendation="Add Prettier for formatting consistency."
        ))

    return Section(title="Project Structure", findings=findings, notes=notes)


def check_dependencies(root: Path) -> Section:
    findings: List[Finding] = []
    notes: List[str] = []
    pkg = read_json(root / "package.json")
    if not pkg:
        return Section(
            title="Dependencies",
            findings=[Finding(
                severity="critical",
                title="package.json missing or unreadable",
                message="Cannot read package.json; dependency health unknown.",
                recommendation="Ensure you're running the tool at the project root and package.json exists."
            )],
            notes=notes
        )

    deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
    has_next = "next" in deps
    has_ts = "typescript" in deps
    has_supabase = "@supabase/supabase-js" in deps

    if not has_next:
        findings.append(Finding(
            severity="critical", title="Next.js not found",
            message="`next` is not listed in dependencies.",
            recommendation="Install Next.js and ensure it's in package.json.",
            steps=["Run `npm install next` to install Next.js."]
        ))
    else:
        notes.append(f"next version: {deps.get('next')}")

    if not has_ts:
        findings.append(Finding(
            severity="warning", title="TypeScript not found",
            message="`typescript` is not listed; project may not be using TS.",
            recommendation="Install TypeScript and configure tsconfig.json.",
            steps=["Run `npm install -D typescript @types/react @types/node` to add TypeScript support."]
        ))
    else:
        notes.append(f"typescript version: {deps.get('typescript')}")

    if not has_supabase:
        findings.append(Finding(
            severity="warning", title="Supabase client not found",
            message="`@supabase/supabase-js` is missing; required for client/server usage.",
            recommendation="Install Supabase JS client.",
            steps=["Run `npm install @supabase/supabase-js` to add Supabase client library."]
        ))
    else:
        notes.append(f"@supabase/supabase-js version: {deps.get('@supabase/supabase-js')}")

    # Scripts
    scripts = pkg.get("scripts", {})
    for key in ["dev", "build", "start", "lint", "typecheck"]:
        if key not in scripts:
            findings.append(Finding(
                severity="info",
                title=f"`{key}` script missing",
                message=f"No `{key}` script in package.json.",
                recommendation=f"Add a `{key}` script for consistent workflows."
            ))

    return Section(title="Dependency Health", findings=findings, notes=notes)


def check_typescript(root: Path) -> Section:
    findings: List[Finding] = []
    notes: List[str] = []

    tsconfig_paths = [root / "tsconfig.json", root / "tsconfig.app.json", root / "tsconfig.base.json"]
    tsconfig = None
    for p in tsconfig_paths:
        if p.exists():
            tsconfig = read_json(p)
            if tsconfig:
                notes.append(f"Using {p.name}")
                break

    if not tsconfig:
        findings.append(Finding(
            severity="warning",
            title="tsconfig.json not found",
            message="TypeScript config missing or unreadable.",
            recommendation="Initialize TypeScript with a tsconfig tuned for Next.js.",
            steps=["Run `npx tsc --init` then adapt to Next.js recommendations."]
        ))
        return Section(title="TypeScript Configuration", findings=findings, notes=notes)

    co = tsconfig.get("compilerOptions", {})
    strict = co.get("strict", False)
    jsx = co.get("jsx", "")
    baseUrl = co.get("baseUrl", None)
    paths = co.get("paths", None)

    if not strict:
        findings.append(Finding(
            severity="info",
            title="TypeScript not in strict mode",
            message="`compilerOptions.strict` is disabled.",
            recommendation="Enable strict mode for better type safety in production.",
            steps=["Set `strict: true` in tsconfig.json."]
        ))
    if "react-jsx" not in str(jsx):
        findings.append(Finding(
            severity="info",
            title="jsx setting not optimized",
            message=f"`compilerOptions.jsx` is `{jsx}`.",
            recommendation="Use `react-jsx` for modern JSX transform."
        ))
    if not baseUrl and not paths:
        findings.append(Finding(
            severity="info",
            title="No path aliases",
            message="Path aliases not configured.",
            recommendation="Add `baseUrl: 'src'` and `paths` aliases to simplify imports."
        ))

    return Section(title="TypeScript Configuration", findings=findings, notes=notes)


def check_next_config(root: Path) -> Section:
    findings: List[Finding] = []
    notes: List[str] = []

    # next.config.(js|mjs|cjs|ts)
    next_configs = [p for p in [root / "next.config.js", root / "next.config.mjs", root / "next.config.cjs", root / "next.config.ts"] if p.exists()]
    if not next_configs:
        findings.append(Finding(
            severity="info",
            title="next.config not found",
            message="Project may rely on Next.js defaults.",
            recommendation="Add a next.config with only needed settings to keep config explicit."
        ))
        return Section(title="Next.js Configuration", findings=findings, notes=notes)

    cfg_path = next_configs[0]
    content = safe_read_text(cfg_path)
    notes.append(f"Using {cfg_path.name}")

    # Light heuristics
    if "images" in content and "domains" in content and re.search(r"images\s*:\s*{[^}]*domains", content):
        notes.append("Images domain configuration detected.")
    if "experimental" in content:
        notes.append("Experimental flags detected; validate compatibility.")
    if "output" in content and "standalone" in content:
        notes.append("Standalone output detected (good for Docker).")

    return Section(title="Next.js Configuration", findings=findings, notes=notes)


def check_supabase(root: Path, probe_http: bool) -> Section:
    findings: List[Finding] = []
    notes: List[str] = []

    # ENV
    env_files = [f for f in [".env", ".env.local", ".env.development", ".env.production"] if (root / f).exists()]
    notes.append(f"Env files present: {', '.join(env_files) if env_files else 'none'}")

    # Pull envs from current environment as well as .env* (shallow parse)
    # We'll do a lightweight parse of .env-like files (no external dotenv dep).
    env_map: Dict[str, str] = {}
    for f in env_files:
        for line in safe_read_text(root / f).splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            m = re.match(r"([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)", line)
            if m:
                key, val = m.group(1), m.group(2)
                # Remove surrounding quotes if present
                if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                    val = val[1:-1]
                env_map.setdefault(key, val)

    # Overlay with actual environment at runtime
    for k in ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"]:
        if os.getenv(k):
            env_map[k] = os.getenv(k)  # runtime overrides

    supabase_url = env_map.get("NEXT_PUBLIC_SUPABASE_URL", "")
    anon_key = env_map.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    service_key = env_map.get("SUPABASE_SERVICE_ROLE_KEY", "")

    if not supabase_url or not anon_key:
        findings.append(Finding(
            severity="critical",
            title="Supabase env vars missing",
            message="`NEXT_PUBLIC_SUPABASE_URL` and/or `NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing.",
            recommendation="Set required Supabase environment variables.",
            steps=[
                "In .env.local, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
                "Never expose SERVICE_ROLE_KEY to the client."
            ]
        ))
    else:
        if not supabase_url.startswith("https://") or ".supabase.co" not in supabase_url:
            findings.append(Finding(
                severity="warning",
                title="Suspicious Supabase URL",
                message=f"URL looks unusual: {supabase_url}",
                recommendation="Verify your project URL from the Supabase dashboard."
            ))
        # JWT decode
        header, payload = decode_jwt_without_verify(anon_key)
        if not header or not payload:
            findings.append(Finding(
                severity="warning",
                title="Anon key not a valid JWT",
                message="Could not decode anon key as JWT.",
                recommendation="Double-check the anon key."
            ))
        else:
            exp = payload.get("exp")
            if exp:
                exp_dt = datetime.datetime.utcfromtimestamp(int(exp))
                notes.append(f"Anon key exp: {exp_dt.isoformat()}Z")
                if exp_dt < datetime.datetime.utcnow():
                    findings.append(Finding(
                        severity="critical",
                        title="Anon key expired",
                        message=f"Anon key expires at {exp_dt} UTC.",
                        recommendation="Rotate the anon key in Supabase settings."
                    ))
            roles = payload.get("role") or payload.get("roles")
            if roles and ("service_role" in str(roles)):
                findings.append(Finding(
                    severity="critical",
                    title="Service role leaked to client",
                    message="Anon key seems to contain service privileges!",
                    recommendation="Never expose service role keys to browsers.",
                    steps=["Generate a new anon key; revoke any leaked service keys."]
                ))

    # Probe HTTP (lightweight): we won't know table names, so just HEAD/GET base path.
    if probe_http and supabase_url:
        import urllib.request
        import urllib.error
        try:
            req = urllib.request.Request(supabase_url.rstrip("/") + "/rest/v1/", method="GET",
                                         headers={"apikey": anon_key or "anon"})
            with urllib.request.urlopen(req, timeout=10) as resp:
                code = resp.getcode()
                notes.append(f"REST probe status: {code}")
        except urllib.error.HTTPError as e:
            notes.append(f"REST probe HTTPError: {e.code}")
            # 404/401/403 are normal responses if we hit base without table.
        except urllib.error.URLError as e:
            findings.append(Finding(
                severity="critical",
                title="Supabase REST unreachable",
                message=f"Network error reaching Supabase: {e.reason}",
                recommendation="Check network connectivity, URL correctness, and project health."
            ))

    # Source scan for supabase-js usage
    supabase_usages = []
    for p in find_files(root, ["**/*.ts", "**/*.tsx"]):
        txt = safe_read_text(p)
        if "@supabase/supabase-js" in txt or "createClient(" in txt:
            supabase_usages.append(p)
    notes.append(f"Files referencing supabase-js: {len(supabase_usages)}")

    return Section(title="Supabase Integration", findings=findings, notes=notes)


def check_tooling_and_scripts(root: Path, run_typecheck: bool, run_lint: bool, run_build: bool) -> Section:
    findings: List[Finding] = []
    notes: List[str] = []

    pkg = read_json(root / "package.json") or {}
    scripts = pkg.get("scripts", {})

    def maybe_run(script: str, cmd: List[str], label: str):
        code, out, err = run(cmd, cwd=root, timeout=600)
        if code == 0:
            notes.append(f"{label}: OK")
        else:
            findings.append(Finding(
                severity="warning" if code not in (124, 127) else "info",
                title=f"{label} failed",
                message=(err or out)[:500],
                recommendation=f"Investigate {label} output for errors."
            ))

    if run_typecheck:
        if scripts.get("typecheck"):
            # Prefer script
            maybe_run("typecheck", ["npm", "run", "typecheck"], "TypeScript typecheck")
        else:
            # fallback to tsc --noEmit
            code, tsc_path = run(["which", "tsc"], cwd=root)
            if code != 0:
                findings.append(Finding(
                    severity="info",
                    title="tsc not found",
                    message="TypeScript CLI not available; skipping direct typecheck.",
                    recommendation="Add a `typecheck` script and ensure tsc is installed."
                ))
            else:
                maybe_run("typecheck", ["tsc", "--noEmit"], "TypeScript typecheck")

    if run_lint and scripts.get("lint"):
        maybe_run("lint", ["npm", "run", "lint"], "ESLint")

    if run_build and scripts.get("build"):
        maybe_run("build", ["npm", "run", "build"], "Next.js build")

    return Section(title="Tooling Run Results", findings=findings, notes=notes)


def check_overview(env: Section, deps: Section, supa: Section, structure: Section) -> Section:
    findings: List[Finding] = []

    # Prioritize key risks
    def has_critical(section: Section) -> bool:
        return any(f.severity == "critical" for f in section.findings)

    if has_critical(env) or has_critical(deps) or has_critical(supa) or has_critical(structure):
        findings.append(Finding(
            severity="critical",
            title="Critical blockers detected",
            message="One or more critical issues prevent a healthy dev/build/runtime.",
            recommendation="Resolve the Critical items below before proceeding.",
            steps=["Check 'Supabase env vars', 'Node.js missing', 'Routing directory missing', etc."]
        ))
    else:
        findings.append(Finding(
            severity="info",
            title="No critical blockers",
            message="No critical issues found in high-level checks.",
            recommendation="Address warnings and infos to improve robustness."
        ))

    return Section(title="Executive Summary", findings=findings, notes=[])


# ------------------------------- Main -------------------------------------- #

def generate_report(project_root: Path, probe_supabase: bool, run_typecheck: bool, run_lint: bool, run_build: bool) -> Report:
    env = check_environment(project_root)
    structure = check_structure(project_root)
    deps = check_dependencies(project_root)
    ts = check_typescript(project_root)
    nextcfg = check_next_config(project_root)
    supa = check_supabase(project_root, probe_supabase)
    tooling = check_tooling_and_scripts(project_root, run_typecheck, run_lint, run_build)
    overview = check_overview(env, deps, supa, structure)

    all_sections = [overview, env, structure, deps, ts, nextcfg, supa, tooling]
    report = Report(
        generated_at=datetime.datetime.now().isoformat(),
        project_root=str(project_root),
        overview=overview,
        env=env,
        structure=structure,
        dependencies=deps,
        typescript=ts,
        nextjs_config=nextcfg,
        supabase=supa,
        tooling=tooling,
        run_results=tooling,
        all_sections=all_sections
    )
    return report


def write_artifacts(report: Report, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    # Main comprehensive report
    (out_dir / "debug_report.md").write_text(report.to_markdown(), encoding="utf-8")
    # Specific error reports
    (out_dir / "typescript_errors.md").write_text(report.to_typescript_errors_markdown(), encoding="utf-8")
    (out_dir / "eslint_errors.md").write_text(report.to_eslint_errors_markdown(), encoding="utf-8")
    (out_dir / "build_errors.md").write_text(report.to_build_errors_markdown(), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(description="Next.js + TypeScript + Supabase Debug Report Generator")
    parser.add_argument("--project", type=str, default=".", help="Path to project root")
    parser.add_argument("--probe-supabase", action="store_true", help="Probe Supabase REST endpoint with anon key (GET /rest/v1/)")
    parser.add_argument("--run-typecheck", action="store_true", help="Run `npm run typecheck` or `tsc --noEmit`")
    parser.add_argument("--run-lint", action="store_true", help="Run `npm run lint` if available")
    parser.add_argument("--run-build", action="store_true", help="Run `npm run build`")
    parser.add_argument("--out-dir", type=str, default="error_reports", help="Directory to write report artifacts")
    args = parser.parse_args()

    project_root = Path(args.project).resolve()
    if not (project_root / "package.json").exists():
        print(f"[!] package.json not found under: {project_root}", file=sys.stderr)

    report = generate_report(
        project_root=project_root,
        probe_supabase=args.probe_supabase,
        run_typecheck=args.run_typecheck,
        run_lint=args.run_lint,
        run_build=args.run_build
    )

    out_dir = Path(args.out_dir).resolve()
    write_artifacts(report, out_dir)
    print(f"Reports written to:")
    print(f"  - {out_dir / 'debug_report.md'} (main report)")
    print(f"  - {out_dir / 'typescript_errors.md'}")
    print(f"  - {out_dir / 'eslint_errors.md'}")
    print(f"  - {out_dir / 'build_errors.md'}")


if __name__ == "__main__":
    main()
