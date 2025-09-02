#!/usr/bin/env python3
"""
Simple script to run the comprehensive Next.js + Supabase debug report
and output results to the error_reports directory.
"""

import subprocess
import sys
from pathlib import Path

def main():
    """Run the comprehensive debug report with all checks enabled."""
    
    # Ensure error_reports directory exists
    error_reports_dir = Path("error_reports")
    error_reports_dir.mkdir(exist_ok=True)
    
    # Command to run
    cmd = [
        "python3",  # Use python3 instead of python
        "nextjs_supabase_debug_report.py",
        "--project", ".",
        "--probe-supabase",
        "--run-typecheck", 
        "--run-lint",
        "--run-build",
        "--out-dir", "error_reports"
    ]
    
    print("🔍 Running comprehensive Next.js + Supabase debug report...")
    print(f"📁 Output directory: {error_reports_dir.absolute()}")
    print("⏳ This may take a few minutes...")
    print()
    
    try:
        # Run the command
        result = subprocess.run(cmd, check=True, capture_output=True, text=True)
        
        print("✅ Debug report completed successfully!")
        print()
        print("📄 Generated markdown reports:")
        print(f"  - {error_reports_dir / 'debug_report.md'} (comprehensive report)")
        print(f"  - {error_reports_dir / 'typescript_errors.md'}")
        print(f"  - {error_reports_dir / 'eslint_errors.md'}")
        print(f"  - {error_reports_dir / 'build_errors.md'}")
        print()
        print("📖 View the main report:")
        print(f"  cat {error_reports_dir / 'debug_report.md'}")
        
    except subprocess.CalledProcessError as e:
        print("❌ Debug report failed!")
        print(f"Exit code: {e.returncode}")
        if e.stdout:
            print("STDOUT:", e.stdout)
        if e.stderr:
            print("STDERR:", e.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("❌ Error: nextjs_supabase_debug_report.py not found!")
        print("Make sure you're running this from the project root directory.")
        sys.exit(1)

if __name__ == "__main__":
    main()
