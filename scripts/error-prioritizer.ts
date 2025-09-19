#!/usr/bin/env npx tsx

/**
 * Error Prioritizer
 *
 * Analyzes all errors from claude-analysis.json and creates a priority queue
 * Groups similar errors for efficient fixing
 * Provides specific fix strategies per error type
 *
 * Usage: npx tsx scripts/error-prioritizer.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ErrorDetail {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
  severity: 'error' | 'warning';
  fixInstructions?: string;
}

interface ErrorGroup {
  pattern: string;
  description: string;
  count: number;
  fixStrategy: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  files: Array<{
    path: string;
    occurrences: number;
    lines: number[];
  }>;
  examples: ErrorDetail[];
}

interface PriorityQueue {
  timestamp: string;
  totalErrors: number;
  groups: ErrorGroup[];
  quickWins: ErrorGroup[];
  complexIssues: ErrorGroup[];
  filesByErrorCount: Array<{
    file: string;
    errorCount: number;
    types: string[];
  }>;
  recommendedFixOrder: string[];
}

class ErrorPrioritizer {
  private errors: ErrorDetail[] = [];
  private groups: Map<string, ErrorGroup> = new Map();

  async analyze(): Promise<void> {
    console.log('🎯 Error Prioritizer Starting...\n');

    // Load errors from claude-analysis.json
    this.loadErrors();

    // Group and categorize errors
    this.categorizeErrors();

    // Create priority queue
    const queue = this.createPriorityQueue();

    // Save results
    this.saveReport(queue);

    // Display summary
    this.displaySummary(queue);
  }

  private loadErrors(): void {
    console.log('📊 Loading errors from analysis...');

    const analysisPath = path.join('docs', 'claude-analysis.json');
    if (!fs.existsSync(analysisPath)) {
      console.error('❌ No claude-analysis.json found. Run claude-health-check.ts first.');
      process.exit(1);
    }

    const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));

    // Combine TypeScript and ESLint errors
    const allErrors = [
      ...analysis.criticalErrors.typeScript,
      ...analysis.criticalErrors.eslint
    ];

    // Filter out errors from files we don't need to analyze
    this.errors = allErrors.filter(error => {
      // Exclude components/ui (shadcn/ui library)
      if (error.file.includes('components/ui/')) return false;

      // Exclude test files
      if (error.file.includes('.test.') || error.file.includes('.spec.')) return false;

      // Exclude build/generated files
      if (error.file.includes('.next/') || error.file.includes('node_modules/')) return false;

      // Exclude type definition files that are generated
      if (error.file.endsWith('.d.ts')) return false;

      // Exclude scripts folder (analysis tools)
      if (error.file.startsWith('scripts/')) return false;

      // Exclude configuration files
      if (error.file.match(/\.(config|rc)\.(ts|js|json)$/)) return false;

      return true;
    });

    console.log(`   Found ${this.errors.length} errors to prioritize (excluded ${allErrors.length - this.errors.length} from ui/test/config files)\n`);
  }

  private categorizeErrors(): void {
    console.log('🔍 Categorizing errors by pattern...');

    const patterns = [
      {
        regex: /Property '(.+)' does not exist on type/,
        key: 'missing-property',
        description: 'Missing properties on types',
        strategy: 'Add missing properties to type definitions or fix property names',
        impact: 'high' as const
      },
      {
        regex: /Type '(.+)' is not assignable to type '(.+)'/,
        key: 'type-mismatch',
        description: 'Type mismatches',
        strategy: 'Fix type assignments or add type guards',
        impact: 'high' as const
      },
      {
        regex: /Cannot find module|Could not find a declaration file/,
        key: 'missing-module',
        description: 'Missing modules or type declarations',
        strategy: 'Install missing packages or add type declarations',
        impact: 'high' as const
      },
      {
        regex: /Unexpected console statement/,
        key: 'console-log',
        description: 'Console.log statements',
        strategy: 'Remove console.log or replace with proper logging',
        impact: 'low' as const
      },
      {
        regex: /'(.+)' is declared but its value is never read/,
        key: 'unused-variable',
        description: 'Unused variables',
        strategy: 'Remove unused variables or use them',
        impact: 'low' as const
      },
      {
        regex: /'(.+)' is defined but never used/,
        key: 'unused-import',
        description: 'Unused imports',
        strategy: 'Remove unused imports',
        impact: 'low' as const
      },
      {
        regex: /is of type 'unknown'/,
        key: 'unknown-type',
        description: 'Unknown types needing assertion',
        strategy: 'Add proper type assertions or type guards',
        impact: 'medium' as const
      },
      {
        regex: /Missing return type on function/,
        key: 'missing-return-type',
        description: 'Missing function return types',
        strategy: 'Add explicit return types to functions',
        impact: 'medium' as const
      },
      {
        regex: /Unsafe assignment of an `any` value/,
        key: 'unsafe-any',
        description: 'Unsafe any assignments',
        strategy: 'Replace any with specific types',
        impact: 'medium' as const
      }
    ];

    for (const error of this.errors) {
      let categorized = false;

      for (const pattern of patterns) {
        if (pattern.regex.test(error.message)) {
          if (!this.groups.has(pattern.key)) {
            this.groups.set(pattern.key, {
              pattern: pattern.key,
              description: pattern.description,
              count: 0,
              fixStrategy: pattern.strategy,
              estimatedImpact: pattern.impact,
              files: [],
              examples: []
            });
          }

          const group = this.groups.get(pattern.key)!;
          group.count++;

          // Track file occurrences
          let fileEntry = group.files.find(f => f.path === error.file);
          if (!fileEntry) {
            fileEntry = { path: error.file, occurrences: 0, lines: [] };
            group.files.push(fileEntry);
          }
          fileEntry.occurrences++;
          fileEntry.lines.push(error.line);

          // Keep first 3 examples
          if (group.examples.length < 3) {
            group.examples.push(error);
          }

          categorized = true;
          break;
        }
      }

      // Uncategorized errors
      if (!categorized) {
        const key = 'uncategorized';
        if (!this.groups.has(key)) {
          this.groups.set(key, {
            pattern: key,
            description: 'Uncategorized errors',
            count: 0,
            fixStrategy: 'Manual review required',
            estimatedImpact: 'medium',
            files: [],
            examples: []
          });
        }

        const group = this.groups.get(key)!;
        group.count++;

        let fileEntry = group.files.find(f => f.path === error.file);
        if (!fileEntry) {
          fileEntry = { path: error.file, occurrences: 0, lines: [] };
          group.files.push(fileEntry);
        }
        fileEntry.occurrences++;
        fileEntry.lines.push(error.line);

        if (group.examples.length < 3) {
          group.examples.push(error);
        }
      }
    }

    // Sort files in each group by error count
    for (const group of this.groups.values()) {
      group.files.sort((a, b) => b.occurrences - a.occurrences);
    }

    console.log(`   Created ${this.groups.size} error groups\n`);
  }

  private createPriorityQueue(): PriorityQueue {
    console.log('📋 Creating priority queue...');

    const groups = Array.from(this.groups.values());

    // Sort groups by impact and count
    groups.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.estimatedImpact] - impactOrder[a.estimatedImpact];
      if (impactDiff !== 0) return impactDiff;
      return b.count - a.count;
    });

    // Separate quick wins and complex issues
    const quickWins = groups.filter(g =>
      g.estimatedImpact === 'low' && g.count > 10
    );

    const complexIssues = groups.filter(g =>
      g.estimatedImpact === 'high' && g.files.length > 5
    );

    // Create file error summary
    const fileErrorMap = new Map<string, { count: number; types: Set<string> }>();

    for (const error of this.errors) {
      if (!fileErrorMap.has(error.file)) {
        fileErrorMap.set(error.file, { count: 0, types: new Set() });
      }
      const entry = fileErrorMap.get(error.file)!;
      entry.count++;

      // Categorize error type
      for (const group of this.groups.values()) {
        if (group.examples.some(e => e.message === error.message)) {
          entry.types.add(group.pattern);
          break;
        }
      }
    }

    const filesByErrorCount = Array.from(fileErrorMap.entries())
      .map(([file, data]) => ({
        file,
        errorCount: data.count,
        types: Array.from(data.types)
      }))
      .sort((a, b) => b.errorCount - a.errorCount)
      .slice(0, 20); // Top 20 files

    // Recommended fix order
    const recommendedFixOrder = [
      '1. Fix console.log statements (quick win - improves ESLint score)',
      '2. Remove unused imports and variables (quick win - cleans codebase)',
      '3. Fix missing properties on types (high impact - fixes TypeScript errors)',
      '4. Resolve type mismatches (high impact - ensures type safety)',
      '5. Add missing return types (medium impact - improves type inference)',
      '6. Fix unknown types with assertions (medium impact - removes any usage)',
      '7. Address uncategorized errors (requires manual review)'
    ];

    return {
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      groups,
      quickWins,
      complexIssues,
      filesByErrorCount,
      recommendedFixOrder
    };
  }

  private saveReport(queue: PriorityQueue): void {
    const outputPath = path.join('docs', 'error-priority-queue.json');
    fs.writeFileSync(outputPath, JSON.stringify(queue, null, 2));

    // Also create a markdown report for human reading
    const mdPath = path.join('docs', 'error-priority-report.md');
    const markdown = this.generateMarkdown(queue);
    fs.writeFileSync(mdPath, markdown);

    console.log('\n📊 Reports saved:');
    console.log(`   - ${outputPath} (for agents)`);
    console.log(`   - ${mdPath} (for humans)\n`);
  }

  private generateMarkdown(queue: PriorityQueue): string {
    const lines: string[] = [
      '# Error Priority Report',
      '',
      `Generated: ${queue.timestamp}`,
      '',
      '## Summary',
      '',
      `- **Total Errors**: ${queue.totalErrors}`,
      `- **Error Groups**: ${queue.groups.length}`,
      `- **Quick Wins Available**: ${queue.quickWins.reduce((sum, g) => sum + g.count, 0)} errors`,
      `- **Complex Issues**: ${queue.complexIssues.reduce((sum, g) => sum + g.count, 0)} errors`,
      '',
      '## Recommended Fix Order',
      '',
      ...queue.recommendedFixOrder.map(step => `${step}`),
      '',
      '## Error Groups (Sorted by Priority)',
      ''
    ];

    for (const group of queue.groups) {
      lines.push(`### ${group.description} (${group.count} errors)`);
      lines.push('');
      lines.push(`- **Pattern**: \`${group.pattern}\``);
      lines.push(`- **Impact**: ${group.estimatedImpact}`);
      lines.push(`- **Fix Strategy**: ${group.fixStrategy}`);
      lines.push(`- **Files Affected**: ${group.files.length}`);
      lines.push('');

      if (group.files.length > 0) {
        lines.push('**Top Files:**');
        lines.push('');
        for (const file of group.files.slice(0, 5)) {
          lines.push(`- \`${file.path}\` (${file.occurrences} errors)`);
        }
        lines.push('');
      }

      if (group.examples.length > 0) {
        lines.push('**Examples:**');
        lines.push('');
        for (const example of group.examples) {
          lines.push(`- Line ${example.line}: ${example.message}`);
        }
        lines.push('');
      }
    }

    lines.push('## Files with Most Errors');
    lines.push('');

    for (const file of queue.filesByErrorCount.slice(0, 10)) {
      lines.push(`### ${file.file} (${file.errorCount} errors)`);
      lines.push(`Error types: ${file.types.join(', ')}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  private displaySummary(queue: PriorityQueue): void {
    console.log('=' .repeat(60));
    console.log('ERROR PRIORITIZATION SUMMARY');
    console.log('=' .repeat(60));

    console.log(`\n📊 Total Errors: ${queue.totalErrors}`);
    console.log(`📁 Files Affected: ${queue.filesByErrorCount.length}`);
    console.log(`🎯 Error Groups: ${queue.groups.length}`);

    console.log('\n🏆 Top Error Categories:');
    for (const group of queue.groups.slice(0, 5)) {
      const percentage = ((group.count / queue.totalErrors) * 100).toFixed(1);
      console.log(`   - ${group.description}: ${group.count} errors (${percentage}%)`);
    }

    console.log('\n⚡ Quick Wins (Low Impact, High Count):');
    for (const group of queue.quickWins.slice(0, 3)) {
      console.log(`   - ${group.description}: ${group.count} errors`);
    }

    console.log('\n🔥 Files Needing Urgent Attention:');
    for (const file of queue.filesByErrorCount.slice(0, 5)) {
      console.log(`   - ${file.file}: ${file.errorCount} errors`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Error prioritization complete!');
    console.log('Agents can now fix errors systematically using the priority queue.\n');
  }
}

// Run the prioritizer
const prioritizer = new ErrorPrioritizer();
prioritizer.analyze().catch(console.error);