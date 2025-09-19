import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ErrorDetail {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
  severity: 'error' | 'warning';
  fixInstructions?: string;
}

interface ClaudeAgentReport {
  timestamp: string;
  projectHealth: {
    score: number;
    grade: string;
    canBuild: boolean;
    readyForDeployment: boolean;
  };
  structureIssues: {
    forbidden: string[];
    missing: string[];
    misplaced: string[];
  };
  criticalErrors: {
    total: number;
    typeScript: ErrorDetail[];
    eslint: ErrorDetail[];
    build: string[];
  };
  agentInstructions: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    stepsToFix: string[];
    filesToFix: Array<{
      path: string;
      errorCount: number;
      errors: ErrorDetail[];
    }>;
  };
}

class ClaudeAnalyzer {
  private report: ClaudeAgentReport;

  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      projectHealth: {
        score: 100,
        grade: 'A+',
        canBuild: true,
        readyForDeployment: false
      },
      structureIssues: {
        forbidden: [],
        missing: [],
        misplaced: []
      },
      criticalErrors: {
        total: 0,
        typeScript: [],
        eslint: [],
        build: []
      },
      agentInstructions: {
        priority: 'low',
        stepsToFix: [],
        filesToFix: []
      }
    };
  }

  async analyze(): Promise<void> {
    console.log('🤖 Claude-Optimized Project Analysis Starting...\n');

    await this.analyzeStructure();
    await this.analyzeTypeScript();
    await this.analyzeESLint();
    await this.analyzeBuild();

    this.calculateHealth();
    this.generateAgentInstructions();
    this.saveReports();
    this.displayResults();
  }

  private async analyzeStructure(): Promise<void> {
    console.log('📁 Analyzing Project Structure...');

    // Check forbidden directories
    const forbidden = ['src', 'components/features', 'app/(management)'];
    forbidden.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.report.structureIssues.forbidden.push(dir);
      }
    });

    // Check required directories
    const required = [
      'app/(auth)',
      'app/(admin)',
      'app/(dashboard)',
      'app/(staff)',
      'app/(customer)',
      'app/(public)',
      'core',
      'components/ui'
    ];

    required.forEach(dir => {
      if (!fs.existsSync(dir)) {
        this.report.structureIssues.missing.push(dir);
      }
    });

    // Check for misplaced files
    if (fs.existsSync('components')) {
      this.checkMisplacedComponents('components');
    }

    console.log(`   ✓ Found ${this.report.structureIssues.forbidden.length} forbidden directories`);
    console.log(`   ✓ Found ${this.report.structureIssues.missing.length} missing directories`);
    console.log(`   ✓ Found ${this.report.structureIssues.misplaced.length} misplaced files`);
  }

  private checkMisplacedComponents(dir: string, base: string = ''): void {
    const items = fs.readdirSync(dir);

    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const relativePath = path.join(base, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        if (item !== 'ui' && base === '') {
          // Non-ui directory directly under components
          this.report.structureIssues.misplaced.push(`components/${item}/`);
        }
        this.checkMisplacedComponents(itemPath, relativePath);
      } else if (stats.isFile() && !relativePath.includes('ui/')) {
        // File not under ui directory
        if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          this.report.structureIssues.misplaced.push(`components/${relativePath}`);
        }
      }
    });
  }

  private async analyzeTypeScript(): Promise<void> {
    console.log('📘 Analyzing TypeScript Errors...');

    try {
      const { stdout, stderr } = await execAsync('npx tsc --noEmit --pretty false 2>&1', {
        maxBuffer: 20 * 1024 * 1024
      });

      const output = stdout || stderr || '';
      const lines = output.split('\n').filter(line => line.trim());

      const errorRegex = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/;

      for (const line of lines) {
        const match = line.match(errorRegex);
        if (match) {
          const filePath = match[1].replace(process.cwd() + '/', '');

          // Skip errors from files we don't need to analyze
          if (filePath.includes('components/ui/') ||
              filePath.includes('.test.') ||
              filePath.includes('.spec.') ||
              filePath.startsWith('scripts/') ||
              filePath.endsWith('.d.ts') ||
              filePath === 'types/database.types.ts' ||
              filePath.includes('.next/') ||
              filePath.includes('node_modules/')) {
            continue;
          }

          const error: ErrorDetail = {
            file: filePath,
            line: parseInt(match[2]),
            column: parseInt(match[3]),
            severity: match[4] as 'error' | 'warning',
            code: match[5],
            message: match[6],
            fixInstructions: this.getFixInstructions(match[5], match[6])
          };

          if (error.severity === 'error') {
            this.report.criticalErrors.typeScript.push(error);
          }
        }
      }

      console.log(`   ✓ Found ${this.report.criticalErrors.typeScript.length} TypeScript errors`);

    } catch (error: any) {
      // TypeScript errors are expected
      if (error.stdout || error.stderr) {
        const output = error.stdout || error.stderr || '';
        const lines = output.split('\n').filter((line: string) => line.trim());

        const errorRegex = /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s+(.+)$/;

        for (const line of lines) {
          const match = line.match(errorRegex);
          if (match) {
            const tsError: ErrorDetail = {
              file: match[1].replace(process.cwd() + '/', ''),
              line: parseInt(match[2]),
              column: parseInt(match[3]),
              severity: match[4] as 'error' | 'warning',
              code: match[5],
              message: match[6],
              fixInstructions: this.getFixInstructions(match[5], match[6])
            };

            if (tsError.severity === 'error') {
              this.report.criticalErrors.typeScript.push(tsError);
            }
          }
        }

        console.log(`   ✓ Found ${this.report.criticalErrors.typeScript.length} TypeScript errors`);
      }
    }
  }

  private async analyzeESLint(): Promise<void> {
    console.log('🎨 Analyzing ESLint Errors...');

    try {
      const { stdout } = await execAsync('npx eslint . --ext .ts,.tsx --format json', {
        maxBuffer: 20 * 1024 * 1024
      });

      const results = JSON.parse(stdout || '[]');

      for (const file of results) {
        if (file.messages && file.messages.length > 0) {
          const relativeFile = file.filePath.replace(process.cwd() + '/', '');

          for (const message of file.messages) {
            if (message.severity === 2) { // Only errors, not warnings
              const error: ErrorDetail = {
                file: relativeFile,
                line: message.line || 0,
                column: message.column || 0,
                message: message.message,
                code: message.ruleId || 'unknown',
                severity: 'error',
                fixInstructions: this.getESLintFixInstructions(message.ruleId)
              };

              this.report.criticalErrors.eslint.push(error);
            }
          }
        }
      }

      console.log(`   ✓ Found ${this.report.criticalErrors.eslint.length} ESLint errors`);

    } catch (error: any) {
      // ESLint exits with error when issues found
      if (error.stdout) {
        try {
          const results = JSON.parse(error.stdout);

          for (const file of results) {
            if (file.messages && file.messages.length > 0) {
              const relativeFile = file.filePath.replace(process.cwd() + '/', '');

              for (const message of file.messages) {
                if (message.severity === 2) {
                  const eslintError: ErrorDetail = {
                    file: relativeFile,
                    line: message.line || 0,
                    column: message.column || 0,
                    message: message.message,
                    code: message.ruleId || 'unknown',
                    severity: 'error',
                    fixInstructions: this.getESLintFixInstructions(message.ruleId)
                  };

                  this.report.criticalErrors.eslint.push(eslintError);
                }
              }
            }
          }

          console.log(`   ✓ Found ${this.report.criticalErrors.eslint.length} ESLint errors`);
        } catch (parseError) {
          console.log('   ⚠ Could not parse ESLint output');
        }
      }
    }
  }

  private async analyzeBuild(): Promise<void> {
    console.log('🏗️  Testing Build Process...');

    try {
      const { stdout, stderr } = await execAsync('npm run build 2>&1', {
        maxBuffer: 50 * 1024 * 1024,
        timeout: 120000
      });

      const output = stdout + stderr;

      // Look for build errors
      const errorPatterns = [
        /Error: (.+)/g,
        /Failed to compile/g,
        /Module not found: (.+)/g,
        /Cannot find module '(.+)'/g
      ];

      for (const pattern of errorPatterns) {
        const matches = output.matchAll(pattern);
        for (const match of matches) {
          this.report.criticalErrors.build.push(match[1] || match[0]);
        }
      }

      if (this.report.criticalErrors.build.length === 0) {
        console.log('   ✓ Build successful!');
        this.report.projectHealth.canBuild = true;
      } else {
        console.log(`   ✗ Build failed with ${this.report.criticalErrors.build.length} errors`);
        this.report.projectHealth.canBuild = false;
      }

    } catch (error: any) {
      this.report.projectHealth.canBuild = false;
      const output = (error.stdout || '') + (error.stderr || '');
      const lines = output.split('\n').filter((line: string) => line.trim());

      for (const line of lines) {
        if (line.includes('Error:') || line.includes('Failed')) {
          this.report.criticalErrors.build.push(line.trim());
          if (this.report.criticalErrors.build.length >= 10) break; // Limit to 10 errors
        }
      }

      console.log(`   ✗ Build failed with ${this.report.criticalErrors.build.length} errors`);
    }
  }

  private calculateHealth(): void {
    let score = 100;

    // Structure issues
    score -= this.report.structureIssues.forbidden.length * 10;
    score -= this.report.structureIssues.missing.length * 5;
    score -= this.report.structureIssues.misplaced.length * 2;

    // Error counts
    score -= this.report.criticalErrors.typeScript.length * 2;
    score -= this.report.criticalErrors.eslint.length * 1;
    score -= this.report.criticalErrors.build.length * 5;

    this.report.projectHealth.score = Math.max(0, Math.round(score));
    this.report.projectHealth.grade = this.getGrade(this.report.projectHealth.score);

    // Calculate total errors
    this.report.criticalErrors.total =
      this.report.criticalErrors.typeScript.length +
      this.report.criticalErrors.eslint.length +
      this.report.criticalErrors.build.length;

    // Determine if ready for deployment
    this.report.projectHealth.readyForDeployment =
      this.report.projectHealth.canBuild &&
      this.report.criticalErrors.total === 0 &&
      this.report.structureIssues.forbidden.length === 0;

    // Set priority
    if (!this.report.projectHealth.canBuild) {
      this.report.agentInstructions.priority = 'critical';
    } else if (this.report.criticalErrors.total > 50) {
      this.report.agentInstructions.priority = 'high';
    } else if (this.report.criticalErrors.total > 10) {
      this.report.agentInstructions.priority = 'medium';
    } else {
      this.report.agentInstructions.priority = 'low';
    }
  }

  private generateAgentInstructions(): void {
    const steps: string[] = [];
    const filesToFix = new Map<string, { errorCount: number; errors: ErrorDetail[] }>();

    // Step 1: Fix structure issues
    if (this.report.structureIssues.forbidden.length > 0) {
      steps.push('1. Use structure-guardian to remove forbidden directories: ' +
        this.report.structureIssues.forbidden.join(', '));
    }

    if (this.report.structureIssues.missing.length > 0) {
      steps.push('2. Use structure-guardian to create missing directories: ' +
        this.report.structureIssues.missing.join(', '));
    }

    if (this.report.structureIssues.misplaced.length > 0) {
      steps.push('3. Use structure-guardian to move misplaced files from components/ to core/[feature]/components/');
    }

    // Collect files with errors
    [...this.report.criticalErrors.typeScript, ...this.report.criticalErrors.eslint].forEach(error => {
      if (!filesToFix.has(error.file)) {
        filesToFix.set(error.file, { errorCount: 0, errors: [] });
      }
      const fileData = filesToFix.get(error.file)!;
      fileData.errorCount++;
      fileData.errors.push(error);
    });

    // Sort files by error count (fix worst files first)
    const sortedFiles = Array.from(filesToFix.entries())
      .sort((a, b) => b[1].errorCount - a[1].errorCount)
      .slice(0, 10); // Top 10 files

    // Add file-specific fixes
    if (sortedFiles.length > 0) {
      steps.push(`4. Fix errors in top ${sortedFiles.length} files with most errors (one file at a time):`);

      sortedFiles.forEach(([file, data]) => {
        this.report.agentInstructions.filesToFix.push({
          path: file,
          errorCount: data.errorCount,
          errors: data.errors.slice(0, 5) // First 5 errors per file
        });
      });
    }

    // Add build fixes
    if (this.report.criticalErrors.build.length > 0) {
      steps.push('5. Use quality-deployment-ready to fix build errors');
    }

    // Final step
    steps.push('6. Run quality-deployment-ready for final validation');

    this.report.agentInstructions.stepsToFix = steps;
  }

  private getFixInstructions(code: string, message: string): string {
    const fixes: Record<string, string> = {
      'TS2307': 'Add missing import or install missing package',
      'TS2322': 'Fix type mismatch - ensure assigned value matches expected type',
      'TS2345': 'Fix argument type - check function parameter types',
      'TS2339': 'Property does not exist - add property or fix typo',
      'TS2304': 'Cannot find name - import or declare the identifier',
      'TS2532': 'Add null check or use optional chaining (?.)',
      'TS7053': 'Add explicit type annotation instead of any'
    };

    return fixes[code] || 'Review error and fix accordingly';
  }

  private getESLintFixInstructions(rule: string): string {
    const fixes: Record<string, string> = {
      'react-hooks/exhaustive-deps': 'Add missing dependencies to useEffect/useCallback',
      'react/prop-types': 'Add TypeScript types for props',
      '@typescript-eslint/no-unused-vars': 'Remove unused variable or add underscore prefix',
      '@typescript-eslint/no-explicit-any': 'Replace any with specific type',
      'no-console': 'Remove console.log statements',
      'import/order': 'Reorder imports according to convention'
    };

    return fixes[rule] || 'Fix according to ESLint rule';
  }

  private getGrade(score: number): string {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  private saveReports(): void {
    // Save JSON report for agents
    fs.writeFileSync('docs/claude-analysis.json', JSON.stringify(this.report, null, 2));

    // Save markdown report for humans
    const markdown = this.generateMarkdownReport();
    fs.writeFileSync('docs/claude-analysis.md', markdown);

    console.log('\n📊 Reports saved:');
    console.log('   - docs/claude-analysis.json (for agents)');
    console.log('   - docs/claude-analysis.md (for humans)');
  }

  private generateMarkdownReport(): string {
    const md: string[] = [];

    md.push('# Claude Agent Analysis Report\n');
    md.push(`Generated: ${this.report.timestamp}\n`);

    md.push('## Project Health\n');
    md.push(`- **Score**: ${this.report.projectHealth.score}/100 (${this.report.projectHealth.grade})`);
    md.push(`- **Can Build**: ${this.report.projectHealth.canBuild ? '✅ Yes' : '❌ No'}`);
    md.push(`- **Ready for Deployment**: ${this.report.projectHealth.readyForDeployment ? '✅ Yes' : '❌ No'}`);
    md.push(`- **Priority**: ${this.report.agentInstructions.priority.toUpperCase()}\n`);

    md.push('## Error Summary\n');
    md.push(`- **Total Errors**: ${this.report.criticalErrors.total}`);
    md.push(`- **TypeScript Errors**: ${this.report.criticalErrors.typeScript.length}`);
    md.push(`- **ESLint Errors**: ${this.report.criticalErrors.eslint.length}`);
    md.push(`- **Build Errors**: ${this.report.criticalErrors.build.length}\n`);

    md.push('## Structure Issues\n');
    if (this.report.structureIssues.forbidden.length > 0) {
      md.push('### ❌ Forbidden Directories (MUST REMOVE)\n');
      this.report.structureIssues.forbidden.forEach(dir => {
        md.push(`- ${dir}`);
      });
      md.push('');
    }

    if (this.report.structureIssues.missing.length > 0) {
      md.push('### ⚠️ Missing Directories\n');
      this.report.structureIssues.missing.forEach(dir => {
        md.push(`- ${dir}`);
      });
      md.push('');
    }

    md.push('## Agent Instructions\n');
    md.push('### Steps to Fix (IN ORDER):\n');
    this.report.agentInstructions.stepsToFix.forEach(step => {
      md.push(step);
    });
    md.push('');

    if (this.report.agentInstructions.filesToFix.length > 0) {
      md.push('### Files to Fix (Top Priority):\n');
      this.report.agentInstructions.filesToFix.forEach(file => {
        md.push(`\n#### ${file.path} (${file.errorCount} errors)`);
        file.errors.forEach(error => {
          md.push(`- Line ${error.line}: ${error.message}`);
          md.push(`  Fix: ${error.fixInstructions}`);
        });
      });
    }

    return md.join('\n');
  }

  private displayResults(): void {
    const { projectHealth, criticalErrors, agentInstructions } = this.report;

    console.log('\n' + '='.repeat(60));
    console.log('🤖 CLAUDE AGENT ANALYSIS COMPLETE');
    console.log('='.repeat(60));

    console.log(`\nHealth Score: ${projectHealth.score}/100 (${projectHealth.grade})`);
    console.log(`Priority: ${agentInstructions.priority.toUpperCase()}`);
    console.log(`Total Errors: ${criticalErrors.total}`);

    if (!projectHealth.canBuild) {
      console.log('\n🔴 CRITICAL: Project cannot build!');
    }

    console.log('\n📋 Agent Chain to Run:');
    console.log('1. structure-guardian');
    console.log('2. database-security-master');
    console.log('3. ui-standardizer');
    console.log('4. quality-deployment-ready');

    console.log('\n✅ Analysis complete! Check reports for details.');
    console.log('='.repeat(60));
  }
}

// Run the analyzer
const analyzer = new ClaudeAnalyzer();
analyzer.analyze().catch(console.error);