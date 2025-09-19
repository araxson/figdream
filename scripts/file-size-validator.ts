#!/usr/bin/env npx tsx

/**
 * File Size Validator
 *
 * Checks all files against size limits from CLAUDE.md
 * Pages <50 lines, Components <300 lines, DAL <500 lines
 * Identifies files that need to be split for better maintainability
 *
 * Usage: npx tsx scripts/file-size-validator.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface OversizedFile {
  path: string;
  type: 'page' | 'component' | 'dal' | 'hook' | 'action' | 'util' | 'other';
  currentLines: number;
  maxLines: number;
  excessLines: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  splitSuggestions: string[];
  functions: Array<{
    name: string;
    startLine: number;
    endLine: number;
    lines: number;
  }>;
}

interface SizeReport {
  timestamp: string;
  totalFiles: number;
  compliantFiles: number;
  oversizedFiles: number;
  criticalFiles: number;
  files: OversizedFile[];
  statistics: {
    averageFileSize: number;
    largestFile: { path: string; lines: number };
    byType: Map<string, { count: number; avgSize: number; maxSize: number }>;
  };
  recommendations: string[];
}

class FileSizeValidator {
  private report: SizeReport = {
    timestamp: new Date().toISOString(),
    totalFiles: 0,
    compliantFiles: 0,
    oversizedFiles: 0,
    criticalFiles: 0,
    files: [],
    statistics: {
      averageFileSize: 0,
      largestFile: { path: '', lines: 0 },
      byType: new Map()
    },
    recommendations: []
  };

  // Size limits from CLAUDE.md
  private readonly SIZE_LIMITS = {
    page: { ideal: 30, max: 50, critical: 100 },
    component: { ideal: 200, max: 300, critical: 400 },
    dal: { ideal: 300, max: 500, critical: 600 },
    hook: { ideal: 100, max: 150, critical: 200 },
    action: { ideal: 150, max: 250, critical: 300 },
    util: { ideal: 150, max: 200, critical: 250 },
    other: { ideal: 200, max: 400, critical: 500 }
  };

  async validate(): Promise<void> {
    console.log('📏 File Size Validator Starting...\n');

    // Find all TypeScript files
    const files = await this.findAllFiles();

    // Analyze each file
    let totalLines = 0;
    for (const file of files) {
      const analysis = await this.analyzeFile(file);
      if (analysis) {
        totalLines += analysis.currentLines;

        if (analysis.currentLines > analysis.maxLines) {
          this.report.files.push(analysis);
          this.report.oversizedFiles++;

          if (analysis.severity === 'critical') {
            this.report.criticalFiles++;
          }
        } else {
          this.report.compliantFiles++;
        }
      }
    }

    // Calculate statistics
    this.calculateStatistics(totalLines);

    // Generate recommendations
    this.generateRecommendations();

    // Save reports
    this.saveReports();

    // Display summary
    this.displaySummary();
  }

  private async findAllFiles(): Promise<string[]> {
    console.log('📁 Finding all TypeScript files...');

    const allFiles: string[] = [];
    const searchDirs = ['app', 'core', 'lib'];

    for (const dir of searchDirs) {
      if (fs.existsSync(dir)) {
        this.collectTsFiles(dir, allFiles);
      }
    }

    // Filter out files we don't need to validate
    const files = allFiles.filter(file => {
      // EXCLUDE components/ui - these are shadcn/ui library files
      if (file.includes('components/ui/')) return false;

      // Exclude scripts folder
      if (file.startsWith('scripts/')) return false;

      // Exclude test files
      if (file.includes('.test.') || file.includes('.spec.')) return false;

      // Exclude type definition files
      if (file.endsWith('.d.ts') || file === 'types/database.types.ts') return false;

      // Exclude generated files
      if (file.includes('.generated.') || file.includes('generated/')) return false;

      // Exclude config files
      if (file.match(/\.(config|rc)\.(ts|tsx)$/)) return false;

      // Exclude build artifacts
      if (file.includes('.next/') || file.includes('dist/') || file.includes('build/')) return false;

      return true;
    });

    this.report.totalFiles = files.length;
    console.log(`   Found ${files.length} TypeScript files to validate (excluded ${allFiles.length - files.length} ui/test/config files)\n`);
    return files;
  }

  private collectTsFiles(dir: string, files: string[]): void {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory() &&
          !item.startsWith('.') &&
          item !== 'node_modules' &&
          item !== '.next' &&
          item !== 'ui') {  // Skip ui folder in components
        this.collectTsFiles(fullPath, files);
      } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  private async analyzeFile(filePath: string): Promise<OversizedFile | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const lineCount = lines.length;

      // Determine file type
      const fileType = this.determineFileType(filePath);
      const limits = this.SIZE_LIMITS[fileType];

      // Update statistics
      if (!this.report.statistics.byType.has(fileType)) {
        this.report.statistics.byType.set(fileType, {
          count: 0,
          avgSize: 0,
          maxSize: 0
        });
      }

      const typeStats = this.report.statistics.byType.get(fileType)!;
      typeStats.count++;
      typeStats.avgSize = ((typeStats.avgSize * (typeStats.count - 1)) + lineCount) / typeStats.count;
      typeStats.maxSize = Math.max(typeStats.maxSize, lineCount);

      // Check if largest file
      if (lineCount > this.report.statistics.largestFile.lines) {
        this.report.statistics.largestFile = { path: filePath, lines: lineCount };
      }

      // Only create report if oversized
      if (lineCount <= limits.max) {
        return null;
      }

      const analysis: OversizedFile = {
        path: filePath,
        type: fileType,
        currentLines: lineCount,
        maxLines: limits.max,
        excessLines: lineCount - limits.max,
        severity: this.determineSeverity(lineCount, limits),
        splitSuggestions: [],
        functions: []
      };

      // Extract functions for split suggestions
      analysis.functions = this.extractFunctions(lines);

      // Generate split suggestions
      analysis.splitSuggestions = this.generateSplitSuggestions(analysis);

      return analysis;
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error);
      return null;
    }
  }

  private determineFileType(filePath: string): OversizedFile['type'] {
    if (filePath.includes('/app/') && filePath.endsWith('/page.tsx')) {
      return 'page';
    }
    if (filePath.includes('/components/') || filePath.endsWith('.tsx')) {
      return 'component';
    }
    if (filePath.includes('/dal/')) {
      return 'dal';
    }
    if (filePath.includes('/hooks/')) {
      return 'hook';
    }
    if (filePath.includes('/actions/')) {
      return 'action';
    }
    if (filePath.includes('/utils/') || filePath.includes('/lib/')) {
      return 'util';
    }
    return 'other';
  }

  private determineSeverity(
    lineCount: number,
    limits: typeof this.SIZE_LIMITS.page
  ): OversizedFile['severity'] {
    if (lineCount >= limits.critical) return 'critical';
    if (lineCount >= limits.max + 100) return 'high';
    if (lineCount >= limits.max + 50) return 'medium';
    return 'low';
  }

  private extractFunctions(lines: string[]): OversizedFile['functions'] {
    const functions: OversizedFile['functions'] = [];
    const functionRegex = /^(?:export\s+)?(?:async\s+)?function\s+(\w+)|^(?:export\s+)?const\s+(\w+)\s*=/;

    let currentFunction: typeof functions[0] | null = null;
    let braceCount = 0;

    lines.forEach((line, index) => {
      const match = line.match(functionRegex);

      if (match && braceCount === 0) {
        if (currentFunction) {
          currentFunction.endLine = index;
          currentFunction.lines = currentFunction.endLine - currentFunction.startLine;
          functions.push(currentFunction);
        }

        currentFunction = {
          name: match[1] || match[2],
          startLine: index + 1,
          endLine: index + 1,
          lines: 0
        };
      }

      // Count braces to determine function boundaries (simplified)
      braceCount += (line.match(/\{/g) || []).length;
      braceCount -= (line.match(/\}/g) || []).length;

      if (currentFunction && braceCount === 0 && index > currentFunction.startLine) {
        currentFunction.endLine = index + 1;
        currentFunction.lines = currentFunction.endLine - currentFunction.startLine;
        functions.push(currentFunction);
        currentFunction = null;
      }
    });

    // Handle last function
    if (currentFunction) {
      currentFunction.endLine = lines.length;
      currentFunction.lines = currentFunction.endLine - currentFunction.startLine;
      functions.push(currentFunction);
    }

    return functions.sort((a, b) => b.lines - a.lines);
  }

  private generateSplitSuggestions(file: OversizedFile): string[] {
    const suggestions: string[] = [];

    // Based on file type
    switch (file.type) {
      case 'page':
        suggestions.push('Extract business logic to core module');
        suggestions.push('Move data fetching to server components');
        suggestions.push('Create separate loading and error components');
        break;

      case 'component':
        if (file.functions.length > 5) {
          suggestions.push('Split into multiple smaller components');
        }
        if (file.functions.some(f => f.lines > 50)) {
          suggestions.push('Extract large functions to custom hooks');
        }
        suggestions.push('Consider component composition pattern');
        break;

      case 'dal':
        suggestions.push('Split by domain (queries.ts, mutations.ts)');
        suggestions.push('Extract complex queries to separate files');
        suggestions.push('Create repository pattern classes');
        break;

      case 'hook':
        suggestions.push('Split into multiple specialized hooks');
        suggestions.push('Extract utility functions to helpers');
        break;

      case 'action':
        suggestions.push('Group related actions into separate files');
        suggestions.push('Extract validation to validators/');
        suggestions.push('Move business logic to core modules');
        break;

      case 'util':
        suggestions.push('Group utilities by functionality');
        suggestions.push('Create specialized utility modules');
        break;
    }

    // Function-based suggestions
    const largeFunctions = file.functions.filter(f => f.lines > 50);
    if (largeFunctions.length > 0) {
      suggestions.push(
        `Extract large functions: ${largeFunctions.slice(0, 3).map(f => f.name).join(', ')}`
      );
    }

    return suggestions;
  }

  private calculateStatistics(totalLines: number): void {
    if (this.report.totalFiles > 0) {
      this.report.statistics.averageFileSize = Math.round(totalLines / this.report.totalFiles);
    }

    // Sort files by size
    this.report.files.sort((a, b) => b.currentLines - a.currentLines);
  }

  private generateRecommendations(): void {
    const recs: string[] = [];

    // Critical files
    if (this.report.criticalFiles > 0) {
      recs.push(
        `🚨 CRITICAL: ${this.report.criticalFiles} files are critically oversized. ` +
        'These need immediate refactoring to maintain code quality.'
      );
    }

    // Pages too large
    const oversizedPages = this.report.files.filter(f => f.type === 'page');
    if (oversizedPages.length > 0) {
      recs.push(
        `📄 Pages: ${oversizedPages.length} pages exceed 50 lines. ` +
        'Pages should be ultra-thin and only import components. Move logic to core modules.'
      );
    }

    // Components too large
    const oversizedComponents = this.report.files.filter(f => f.type === 'component');
    if (oversizedComponents.length > 5) {
      recs.push(
        `🧩 Components: ${oversizedComponents.length} components exceed 300 lines. ` +
        'Split into smaller, focused components for better reusability.'
      );
    }

    // DAL files too large
    const oversizedDal = this.report.files.filter(f => f.type === 'dal');
    if (oversizedDal.length > 0) {
      recs.push(
        `🗄️ DAL: ${oversizedDal.length} DAL files exceed 500 lines. ` +
        'Split by operation type (queries/mutations) or by domain.'
      );
    }

    // Overall compliance
    const complianceRate = (this.report.compliantFiles / this.report.totalFiles) * 100;
    if (complianceRate < 80) {
      recs.push(
        `📊 Overall: Only ${complianceRate.toFixed(1)}% of files meet size limits. ` +
        'Implement a file size policy and regular refactoring.'
      );
    }

    // Largest file
    if (this.report.statistics.largestFile.lines > 1000) {
      recs.push(
        `📈 Largest File: ${this.report.statistics.largestFile.path} has ${this.report.statistics.largestFile.lines} lines. ` +
        'This file urgently needs to be broken down.'
      );
    }

    this.report.recommendations = recs;
  }

  private saveReports(): void {
    // Save JSON report
    const jsonPath = path.join('docs', 'oversized-files.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));

    // Save markdown report
    const mdPath = path.join('docs', 'file-size-report.md');
    const markdown = this.generateMarkdown();
    fs.writeFileSync(mdPath, markdown);

    console.log('📊 Reports saved:');
    console.log(`   - ${jsonPath} (for agents)`);
    console.log(`   - ${mdPath} (for humans)\n`);
  }

  private generateMarkdown(): string {
    const lines: string[] = [
      '# File Size Validation Report',
      '',
      `Generated: ${this.report.timestamp}`,
      '',
      '## Summary',
      '',
      `- **Total Files**: ${this.report.totalFiles}`,
      `- **Compliant Files**: ${this.report.compliantFiles} (${((this.report.compliantFiles / this.report.totalFiles) * 100).toFixed(1)}%)`,
      `- **Oversized Files**: ${this.report.oversizedFiles}`,
      `- **Critical Files**: ${this.report.criticalFiles}`,
      `- **Average File Size**: ${this.report.statistics.averageFileSize} lines`,
      '',
      '## Recommendations',
      '',
      ...this.report.recommendations.map(r => `- ${r}`),
      '',
      '## File Size Limits',
      '',
      '| Type | Ideal | Maximum | Critical |',
      '|------|-------|---------|----------|'
    ];

    for (const [type, limits] of Object.entries(this.SIZE_LIMITS)) {
      lines.push(`| ${type} | ${limits.ideal} | ${limits.max} | ${limits.critical} |`);
    }

    lines.push('');

    // Statistics by type
    lines.push('## Statistics by File Type');
    lines.push('');
    lines.push('| Type | Count | Avg Size | Max Size |');
    lines.push('|------|-------|----------|----------|');

    for (const [type, stats] of this.report.statistics.byType) {
      lines.push(`| ${type} | ${stats.count} | ${Math.round(stats.avgSize)} | ${stats.maxSize} |`);
    }

    lines.push('');

    // Oversized files
    if (this.report.files.length > 0) {
      lines.push('## Oversized Files (Largest First)');
      lines.push('');

      for (const file of this.report.files.slice(0, 20)) {
        lines.push(`### ${file.path}`);
        lines.push(`- **Type**: ${file.type}`);
        lines.push(`- **Current Size**: ${file.currentLines} lines`);
        lines.push(`- **Max Allowed**: ${file.maxLines} lines`);
        lines.push(`- **Excess**: ${file.excessLines} lines`);
        lines.push(`- **Severity**: ${file.severity}`);
        lines.push('');

        if (file.functions.length > 0) {
          lines.push('**Largest Functions:**');
          for (const func of file.functions.slice(0, 3)) {
            lines.push(`- ${func.name}: ${func.lines} lines (lines ${func.startLine}-${func.endLine})`);
          }
          lines.push('');
        }

        if (file.splitSuggestions.length > 0) {
          lines.push('**Split Suggestions:**');
          for (const suggestion of file.splitSuggestions) {
            lines.push(`- ${suggestion}`);
          }
          lines.push('');
        }
      }
    }

    return lines.join('\n');
  }

  private displaySummary(): void {
    console.log('=' .repeat(60));
    console.log('FILE SIZE VALIDATION SUMMARY');
    console.log('=' .repeat(60));

    const complianceRate = (this.report.compliantFiles / this.report.totalFiles) * 100;

    console.log(`\n📏 Overall Compliance: ${complianceRate.toFixed(1)}%`);
    console.log(`   - Compliant: ${this.report.compliantFiles}/${this.report.totalFiles}`);
    console.log(`   - Oversized: ${this.report.oversizedFiles}/${this.report.totalFiles}`);
    console.log(`   - Critical: ${this.report.criticalFiles}`);

    console.log(`\n📊 Statistics:`);
    console.log(`   - Average Size: ${this.report.statistics.averageFileSize} lines`);
    console.log(`   - Largest File: ${this.report.statistics.largestFile.lines} lines`);
    console.log(`     ${this.report.statistics.largestFile.path}`);

    if (this.report.files.length > 0) {
      console.log(`\n🔥 Top Oversized Files:`);
      for (const file of this.report.files.slice(0, 5)) {
        console.log(`   - ${file.path}`);
        console.log(`     ${file.currentLines} lines (max: ${file.maxLines}, severity: ${file.severity})`);
      }
    }

    console.log(`\n📈 By Type:`);
    for (const [type, stats] of this.report.statistics.byType) {
      if (stats.count > 0) {
        console.log(`   - ${type}: ${stats.count} files, avg ${Math.round(stats.avgSize)} lines`);
      }
    }

    if (this.report.recommendations.length > 0) {
      console.log(`\n💡 Key Actions:`);
      for (const rec of this.report.recommendations.slice(0, 3)) {
        console.log(`   ${rec}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ File size validation complete!');
    console.log('Agents can now identify and split oversized files.\n');
  }
}

// Run the validator
const validator = new FileSizeValidator();
validator.validate().catch(console.error);