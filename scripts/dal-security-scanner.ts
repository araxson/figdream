#!/usr/bin/env npx tsx

/**
 * DAL Security Scanner
 *
 * Scans all Data Access Layer files for security vulnerabilities
 * Checks for missing auth, RLS compliance, SQL injection risks
 * Helps database-security-master agent secure the data layer
 *
 * Usage: npx tsx scripts/dal-security-scanner.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface SecurityIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'missing-auth' | 'no-rls-check' | 'sql-injection' | 'data-exposure' | 'missing-validation' | 'no-error-handling';
  description: string;
  snippet: string;
  fix: string;
}

interface DalFunction {
  name: string;
  file: string;
  startLine: number;
  hasAuthCheck: boolean;
  hasRlsCheck: boolean;
  hasErrorHandling: boolean;
  hasValidation: boolean;
  operations: string[];
  issues: SecurityIssue[];
}

interface SecurityReport {
  timestamp: string;
  totalFunctions: number;
  securedFunctions: number;
  vulnerableFunctions: number;
  criticalIssues: number;
  highIssues: number;
  functions: DalFunction[];
  issuesByType: Map<string, number>;
  recommendations: string[];
  securityScore: number;
}

class DalSecurityScanner {
  private report: SecurityReport = {
    timestamp: new Date().toISOString(),
    totalFunctions: 0,
    securedFunctions: 0,
    vulnerableFunctions: 0,
    criticalIssues: 0,
    highIssues: 0,
    functions: [],
    issuesByType: new Map(),
    recommendations: [],
    securityScore: 100
  };

  async scan(): Promise<void> {
    console.log('🔒 DAL Security Scanner Starting...\n');

    // Find all DAL files
    const dalFiles = await this.findDalFiles();

    // Analyze each file
    for (const file of dalFiles) {
      await this.analyzeFile(file);
    }

    // Calculate security score
    this.calculateSecurityScore();

    // Generate recommendations
    this.generateRecommendations();

    // Save reports
    this.saveReports();

    // Display summary
    this.displaySummary();
  }

  private async findDalFiles(): Promise<string[]> {
    console.log('📁 Finding all DAL files...');

    const allFiles: string[] = [];

    // Search in core/*/dal directories
    const corePath = 'core';
    if (fs.existsSync(corePath)) {
      const features = fs.readdirSync(corePath);

      for (const feature of features) {
        const dalPath = path.join(corePath, feature, 'dal');
        if (fs.existsSync(dalPath) && fs.statSync(dalPath).isDirectory()) {
          const dalFiles = fs.readdirSync(dalPath);
          for (const file of dalFiles) {
            if (file.endsWith('.ts')) {
              allFiles.push(path.join(dalPath, file));
            }
          }
        }
      }
    }

    // Also check lib/api/dal if it exists
    const libDalPath = 'lib/api/dal';
    if (fs.existsSync(libDalPath)) {
      const libDalFiles = fs.readdirSync(libDalPath);
      for (const file of libDalFiles) {
        if (file.endsWith('.ts')) {
          allFiles.push(path.join(libDalPath, file));
        }
      }
    }

    // Filter out test and type-only files
    const files = allFiles.filter(file => {
      // Exclude test files
      if (file.includes('.test.') || file.includes('.spec.')) return false;

      // Exclude mock files
      if (file.includes('.mock.') || file.includes('/mocks/')) return false;

      // Exclude type-only files
      if (file.endsWith('.types.ts') || file.endsWith('.d.ts')) return false;

      // Exclude example files
      if (file.includes('.example.') || file.includes('/examples/')) return false;

      return true;
    });

    console.log(`   Found ${files.length} DAL files to scan (excluded ${allFiles.length - files.length} test/type files)\n`);
    return files;
  }

  private async analyzeFile(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Find all functions in the file
    const functions = this.extractFunctions(content, filePath, lines);

    for (const func of functions) {
      // Check for auth
      func.hasAuthCheck = this.hasAuthCheck(func, lines);

      // Check for RLS
      func.hasRlsCheck = this.hasRlsCheck(func, lines);

      // Check for error handling
      func.hasErrorHandling = this.hasErrorHandling(func, lines);

      // Check for validation
      func.hasValidation = this.hasValidation(func, lines);

      // Identify operations
      func.operations = this.identifyOperations(func, lines);

      // Find security issues
      this.findSecurityIssues(func, lines);

      // Update report
      this.report.totalFunctions++;
      if (func.issues.length === 0) {
        this.report.securedFunctions++;
      } else {
        this.report.vulnerableFunctions++;

        // Count critical and high issues
        for (const issue of func.issues) {
          if (issue.severity === 'critical') this.report.criticalIssues++;
          if (issue.severity === 'high') this.report.highIssues++;

          // Track issue types
          const count = this.report.issuesByType.get(issue.type) || 0;
          this.report.issuesByType.set(issue.type, count + 1);
        }
      }

      this.report.functions.push(func);
    }
  }

  private extractFunctions(content: string, filePath: string, lines: string[]): DalFunction[] {
    const functions: DalFunction[] = [];

    // Match async functions and regular functions
    const funcRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[^=])\s*=>/gm;

    let match;
    while ((match = funcRegex.exec(content)) !== null) {
      const funcName = match[1] || match[2];
      const lineNumber = content.substring(0, match.index).split('\n').length;

      functions.push({
        name: funcName,
        file: filePath,
        startLine: lineNumber,
        hasAuthCheck: false,
        hasRlsCheck: false,
        hasErrorHandling: false,
        hasValidation: false,
        operations: [],
        issues: []
      });
    }

    return functions;
  }

  private hasAuthCheck(func: DalFunction, lines: string[]): boolean {
    // Check for auth patterns near function
    const checkLines = lines.slice(func.startLine - 1, func.startLine + 30);
    const authPatterns = [
      /getUser|getCurrentUser|requireAuth/i,
      /session\.user/,
      /userId|user_id|ownerId|owner_id/,
      /auth\(\)/,
      /checkAuth|verifyAuth|ensureAuth/i,
      /if\s*\(!user\)/,
      /throw.*[Uu]nauthorized/
    ];

    return authPatterns.some(pattern =>
      checkLines.some(line => pattern.test(line))
    );
  }

  private hasRlsCheck(func: DalFunction, lines: string[]): boolean {
    // Check for RLS patterns
    const checkLines = lines.slice(func.startLine - 1, func.startLine + 30);
    const rlsPatterns = [
      /\.eq\(['"](?:user_id|owner_id|salon_id|staff_id)/,
      /\.filter\(/,
      /WHERE.*user_id/i,
      /rls\(/i,
      /policy/i,
      /checkPermission/i
    ];

    return rlsPatterns.some(pattern =>
      checkLines.some(line => pattern.test(line))
    );
  }

  private hasErrorHandling(func: DalFunction, lines: string[]): boolean {
    const checkLines = lines.slice(func.startLine - 1, func.startLine + 50);
    const errorPatterns = [
      /try\s*\{/,
      /catch\s*\(/,
      /\.catch\(/,
      /throw\s+/,
      /Promise\.reject/,
      /console\.error/
    ];

    return errorPatterns.some(pattern =>
      checkLines.some(line => pattern.test(line))
    );
  }

  private hasValidation(func: DalFunction, lines: string[]): boolean {
    const checkLines = lines.slice(func.startLine - 1, func.startLine + 30);
    const validationPatterns = [
      /z\.|zod/,  // Zod validation
      /validate|Validator/i,
      /if\s*\(!.*\)/,  // Basic checks
      /throw.*Invalid/i,
      /assert/i,
      /schema\./,
      /parse\(/
    ];

    return validationPatterns.some(pattern =>
      checkLines.some(line => pattern.test(line))
    );
  }

  private identifyOperations(func: DalFunction, lines: string[]): string[] {
    const operations: string[] = [];
    const checkLines = lines.slice(func.startLine - 1, func.startLine + 50);

    // Supabase operations
    if (checkLines.some(line => /\.select\(/.test(line))) operations.push('SELECT');
    if (checkLines.some(line => /\.insert\(/.test(line))) operations.push('INSERT');
    if (checkLines.some(line => /\.update\(/.test(line))) operations.push('UPDATE');
    if (checkLines.some(line => /\.delete\(/.test(line))) operations.push('DELETE');
    if (checkLines.some(line => /\.upsert\(/.test(line))) operations.push('UPSERT');
    if (checkLines.some(line => /\.rpc\(/.test(line))) operations.push('RPC');

    return operations;
  }

  private findSecurityIssues(func: DalFunction, lines: string[]): void {
    const checkLines = lines.slice(func.startLine - 1, Math.min(func.startLine + 50, lines.length));

    // Check for missing auth on write operations
    if ((func.operations.includes('INSERT') ||
         func.operations.includes('UPDATE') ||
         func.operations.includes('DELETE')) &&
        !func.hasAuthCheck) {
      func.issues.push({
        file: func.file,
        line: func.startLine,
        severity: 'critical',
        type: 'missing-auth',
        description: `Function '${func.name}' performs ${func.operations.join(', ')} without auth check`,
        snippet: lines[func.startLine - 1].trim(),
        fix: 'Add auth check at the beginning of the function'
      });
    }

    // Check for missing RLS on SELECT
    if (func.operations.includes('SELECT') && !func.hasRlsCheck && !func.hasAuthCheck) {
      func.issues.push({
        file: func.file,
        line: func.startLine,
        severity: 'high',
        type: 'no-rls-check',
        description: `Function '${func.name}' selects data without RLS or auth filtering`,
        snippet: lines[func.startLine - 1].trim(),
        fix: 'Add .eq() filter for user_id or appropriate RLS check'
      });
    }

    // Check for potential SQL injection (raw SQL or string concatenation)
    for (let i = 0; i < checkLines.length; i++) {
      const line = checkLines[i];

      if (/\$\{.*\}|`.*\$\{/.test(line) && /SELECT|INSERT|UPDATE|DELETE/i.test(line)) {
        func.issues.push({
          file: func.file,
          line: func.startLine + i,
          severity: 'critical',
          type: 'sql-injection',
          description: 'Potential SQL injection via string interpolation',
          snippet: line.trim(),
          fix: 'Use parameterized queries instead of string interpolation'
        });
      }
    }

    // Check for missing error handling
    if (!func.hasErrorHandling && func.operations.length > 0) {
      func.issues.push({
        file: func.file,
        line: func.startLine,
        severity: 'medium',
        type: 'no-error-handling',
        description: `Function '${func.name}' lacks proper error handling`,
        snippet: lines[func.startLine - 1].trim(),
        fix: 'Wrap database operations in try-catch block'
      });
    }

    // Check for data exposure (selecting all columns without filtering)
    if (func.operations.includes('SELECT')) {
      const hasSelectAll = checkLines.some(line => /\.select\(\s*['"]\*['"]?\s*\)/.test(line));
      const hasLimit = checkLines.some(line => /\.limit\(/.test(line));

      if (hasSelectAll && !hasLimit) {
        func.issues.push({
          file: func.file,
          line: func.startLine,
          severity: 'high',
          type: 'data-exposure',
          description: 'Selecting all columns without limit may expose sensitive data',
          snippet: checkLines.find(line => /\.select\(/.test(line))?.trim() || '',
          fix: 'Select only needed columns and add .limit() to prevent data exposure'
        });
      }
    }

    // Check for missing validation on write operations
    if ((func.operations.includes('INSERT') || func.operations.includes('UPDATE')) &&
        !func.hasValidation) {
      func.issues.push({
        file: func.file,
        line: func.startLine,
        severity: 'medium',
        type: 'missing-validation',
        description: `Function '${func.name}' accepts data without validation`,
        snippet: lines[func.startLine - 1].trim(),
        fix: 'Add input validation using Zod or similar validation library'
      });
    }
  }

  private calculateSecurityScore(): void {
    // Calculate score based on issues
    const totalPossibleIssues = this.report.totalFunctions * 6; // Max 6 types of issues per function
    const actualIssues = Array.from(this.report.issuesByType.values()).reduce((a, b) => a + b, 0);

    // Weight by severity
    const weightedIssues =
      (this.report.criticalIssues * 10) +
      (this.report.highIssues * 5) +
      ((actualIssues - this.report.criticalIssues - this.report.highIssues) * 2);

    const maxWeightedScore = totalPossibleIssues * 10;
    this.report.securityScore = Math.max(0, Math.round(
      ((maxWeightedScore - weightedIssues) / maxWeightedScore) * 100
    ));

    // Sort functions by issue count
    this.report.functions.sort((a, b) => b.issues.length - a.issues.length);
  }

  private generateRecommendations(): void {
    const recs: string[] = [];

    // Critical issues
    if (this.report.criticalIssues > 0) {
      recs.push(
        `🚨 CRITICAL: ${this.report.criticalIssues} critical security issues found. ` +
        'Fix these immediately to prevent data breaches.'
      );
    }

    // Missing auth
    const missingAuthCount = this.report.issuesByType.get('missing-auth') || 0;
    if (missingAuthCount > 0) {
      recs.push(
        `🔐 Authentication: ${missingAuthCount} functions lack auth checks. ` +
        'Add getCurrentUser() checks to all write operations.'
      );
    }

    // RLS issues
    const rlsIssues = this.report.issuesByType.get('no-rls-check') || 0;
    if (rlsIssues > 0) {
      recs.push(
        `🛡️ Row Level Security: ${rlsIssues} functions bypass RLS. ` +
        'Add appropriate filters to ensure users only access their data.'
      );
    }

    // SQL injection
    const sqlInjection = this.report.issuesByType.get('sql-injection') || 0;
    if (sqlInjection > 0) {
      recs.push(
        `💉 SQL Injection: ${sqlInjection} potential SQL injection vulnerabilities. ` +
        'Never use string interpolation in queries. Use parameterized queries.'
      );
    }

    // Validation
    const validationIssues = this.report.issuesByType.get('missing-validation') || 0;
    if (validationIssues > 5) {
      recs.push(
        `✅ Validation: ${validationIssues} functions lack input validation. ` +
        'Implement Zod schemas for all data inputs.'
      );
    }

    // Error handling
    const errorHandling = this.report.issuesByType.get('no-error-handling') || 0;
    if (errorHandling > 10) {
      recs.push(
        `⚠️ Error Handling: ${errorHandling} functions lack proper error handling. ` +
        'Wrap all database operations in try-catch blocks.'
      );
    }

    // General security posture
    if (this.report.securityScore < 50) {
      recs.push(
        '🔒 Overall Security: Score below 50%. Immediate security audit and fixes required.'
      );
    }

    this.report.recommendations = recs;
  }

  private saveReports(): void {
    // Save JSON report
    const jsonPath = path.join('docs', 'dal-security-report.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));

    // Save markdown report
    const mdPath = path.join('docs', 'dal-security-report.md');
    const markdown = this.generateMarkdown();
    fs.writeFileSync(mdPath, markdown);

    console.log('📊 Reports saved:');
    console.log(`   - ${jsonPath} (for agents)`);
    console.log(`   - ${mdPath} (for humans)\n`);
  }

  private generateMarkdown(): string {
    const lines: string[] = [
      '# DAL Security Scan Report',
      '',
      `Generated: ${this.report.timestamp}`,
      '',
      '## Summary',
      '',
      `- **Security Score**: ${this.report.securityScore}/100`,
      `- **Total Functions**: ${this.report.totalFunctions}`,
      `- **Secured Functions**: ${this.report.securedFunctions}`,
      `- **Vulnerable Functions**: ${this.report.vulnerableFunctions}`,
      `- **Critical Issues**: ${this.report.criticalIssues}`,
      `- **High Issues**: ${this.report.highIssues}`,
      '',
      '## Recommendations',
      '',
      ...this.report.recommendations.map(r => `- ${r}`),
      ''
    ];

    // Issue breakdown
    if (this.report.issuesByType.size > 0) {
      lines.push('## Issues by Type');
      lines.push('');

      for (const [type, count] of this.report.issuesByType) {
        const typeLabel = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        lines.push(`- **${typeLabel}**: ${count} occurrences`);
      }
      lines.push('');
    }

    // Most vulnerable functions
    const vulnerable = this.report.functions.filter(f => f.issues.length > 0).slice(0, 10);
    if (vulnerable.length > 0) {
      lines.push('## Most Vulnerable Functions');
      lines.push('');

      for (const func of vulnerable) {
        lines.push(`### ${func.name} (${func.file})`);
        lines.push(`- **Issues**: ${func.issues.length}`);
        lines.push(`- **Operations**: ${func.operations.join(', ') || 'None detected'}`);
        lines.push(`- **Has Auth**: ${func.hasAuthCheck ? '✅' : '❌'}`);
        lines.push(`- **Has RLS**: ${func.hasRlsCheck ? '✅' : '❌'}`);
        lines.push(`- **Has Error Handling**: ${func.hasErrorHandling ? '✅' : '❌'}`);
        lines.push(`- **Has Validation**: ${func.hasValidation ? '✅' : '❌'}`);
        lines.push('');

        lines.push('**Issues Found:**');
        for (const issue of func.issues) {
          lines.push(`- [${issue.severity.toUpperCase()}] ${issue.description}`);
          lines.push(`  Fix: ${issue.fix}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private displaySummary(): void {
    console.log('=' .repeat(60));
    console.log('DAL SECURITY SCAN SUMMARY');
    console.log('=' .repeat(60));

    console.log(`\n🔒 Security Score: ${this.report.securityScore}/100`);
    console.log(`   - Secured Functions: ${this.report.securedFunctions}/${this.report.totalFunctions}`);
    console.log(`   - Vulnerable Functions: ${this.report.vulnerableFunctions}/${this.report.totalFunctions}`);

    console.log(`\n🚨 Issue Severity:`);
    console.log(`   - Critical: ${this.report.criticalIssues}`);
    console.log(`   - High: ${this.report.highIssues}`);

    if (this.report.issuesByType.size > 0) {
      console.log(`\n⚠️ Issue Types:`);
      for (const [type, count] of this.report.issuesByType) {
        const typeLabel = type.replace(/-/g, ' ');
        console.log(`   - ${typeLabel}: ${count}`);
      }
    }

    const topVulnerable = this.report.functions
      .filter(f => f.issues.length > 0)
      .slice(0, 5);

    if (topVulnerable.length > 0) {
      console.log(`\n🔥 Most Vulnerable Functions:`);
      for (const func of topVulnerable) {
        console.log(`   - ${func.name} (${func.file}): ${func.issues.length} issues`);
      }
    }

    if (this.report.recommendations.length > 0) {
      console.log(`\n💡 Key Actions:`);
      for (const rec of this.report.recommendations.slice(0, 3)) {
        console.log(`   ${rec}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ DAL security scan complete!');
    console.log('Database-security-master agent can now secure the data layer.\n');
  }
}

// Run the scanner
const scanner = new DalSecurityScanner();
scanner.scan().catch(console.error);