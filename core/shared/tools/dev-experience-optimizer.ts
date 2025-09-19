// Development Experience Optimizer
// Tools for improving developer productivity and code quality automation

export interface DevMetrics {
  buildTime: number;
  typeCheckTime: number;
  lintTime: number;
  testTime: number;
  hotReloadTime: number;
  memoryUsage: number;
  fileWatchCount: number;
}

export interface ArchitectureViolation {
  type: 'file_size' | 'wrong_extension' | 'missing_barrel' | 'circular_dependency' | 'coupling';
  severity: 'error' | 'warning' | 'info';
  file: string;
  line?: number;
  message: string;
  suggestion: string;
  autofix?: boolean;
}

export interface CodeQualityRule {
  name: string;
  pattern: RegExp | string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  autofix?: (content: string) => string;
}

/**
 * Development experience optimizer with automated code quality enforcement
 */
export class DevExperienceOptimizer {
  private rules: CodeQualityRule[] = [];
  private violations: ArchitectureViolation[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default architectural rules
   */
  private initializeDefaultRules(): void {
    // File size rules
    this.addRule({
      name: 'component-max-lines',
      pattern: /\.tsx$/,
      severity: 'warning',
      message: 'Component file exceeds 300 lines',
      suggestion: 'Split component into smaller modules or extract sub-components',
      autofix: (content) => this.suggestComponentSplit(content)
    });

    // File extension rules
    this.addRule({
      name: 'tsx-jsx-content',
      pattern: /\.ts$/,
      severity: 'error',
      message: 'TypeScript file contains JSX but uses .ts extension',
      suggestion: 'Rename file to .tsx extension',
      autofix: (content) => content // File rename required
    });

    // Import rules
    this.addRule({
      name: 'relative-import-violation',
      pattern: /import.*from\s+['"]\.\.\//,
      severity: 'warning',
      message: 'Avoid deep relative imports, use absolute imports with @/',
      suggestion: 'Use @/core/[module] imports instead of relative paths'
    });

    // Barrel export rules
    this.addRule({
      name: 'missing-barrel-export',
      pattern: /core\/[\w-]+\/$/,
      severity: 'info',
      message: 'Module missing barrel export (index.ts)',
      suggestion: 'Create index.ts file with proper barrel exports'
    });

    // Authentication rules
    this.addRule({
      name: 'dal-missing-auth',
      pattern: /export\s+(?:async\s+)?function\s+(?:get|create|update|delete)\w*\(/,
      severity: 'error',
      message: 'DAL function missing authentication check',
      suggestion: 'Add auth.getUser() verification at function start'
    });
  }

  /**
   * Add custom rule
   */
  addRule(rule: CodeQualityRule): void {
    this.rules.push(rule);
  }

  /**
   * Analyze file for violations
   */
  analyzeFile(content: string, filePath: string): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    const lines = content.split('\n');

    for (const rule of this.rules) {
      if (typeof rule.pattern === 'string') {
        if (filePath.includes(rule.pattern)) {
          violations.push(this.createViolation(rule, filePath));
        }
      } else {
        // RegExp pattern
        if (rule.pattern.test(filePath) || rule.pattern.test(content)) {
          const matches = content.match(rule.pattern);
          if (matches) {
            const lineNumber = this.findLineNumber(content, matches[0]);
            violations.push(this.createViolation(rule, filePath, lineNumber));
          }
        }
      }
    }

    // File size check
    if (lines.length > this.getMaxLines(filePath)) {
      violations.push({
        type: 'file_size',
        severity: 'warning',
        file: filePath,
        message: `File exceeds ${this.getMaxLines(filePath)} lines (${lines.length} lines)`,
        suggestion: 'Split file into smaller modules',
        autofix: true
      });
    }

    return violations;
  }

  /**
   * Generate ESLint configuration for architectural rules
   */
  generateESLintConfig(): any {
    return {
      extends: [
        '@next/next/recommended',
        'eslint:recommended',
        '@typescript-eslint/recommended'
      ],
      plugins: ['@typescript-eslint', 'import'],
      rules: {
        // Core Module Pattern enforcement
        'import/no-relative-parent-imports': 'error',
        'import/no-cycle': 'error',
        'import/order': [
          'error',
          {
            groups: [
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index'
            ],
            pathGroups: [
              {
                pattern: '@/core/**',
                group: 'internal',
                position: 'before'
              },
              {
                pattern: '@/components/ui/**',
                group: 'internal',
                position: 'after'
              }
            ],
            'newlines-between': 'always'
          }
        ],

        // File naming and structure
        'filenames/match-regex': [
          'error',
          '^[a-z0-9-]+(\\.([a-z0-9-]+))*\\.(ts|tsx|js|jsx)$'
        ],

        // TypeScript rules
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/prefer-const': 'error',

        // React rules
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // Custom architectural rules
        'no-console': 'warn',
        'prefer-const': 'error',
        'no-var': 'error'
      },
      overrides: [
        {
          files: ['**/dal/**/*.ts'],
          rules: {
            'require-auth-check': 'error' // Custom rule for DAL functions
          }
        },
        {
          files: ['**/components/**/*.tsx'],
          rules: {
            'max-lines': ['warn', { max: 300 }]
          }
        }
      ]
    };
  }

  /**
   * Generate TypeScript configuration optimized for development
   */
  generateTSConfig(): any {
    return {
      compilerOptions: {
        target: 'ES2022',
        lib: ['dom', 'dom.iterable', 'ES6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next'
          }
        ],
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*'],
          '@/core/*': ['./core/*'],
          '@/lib/*': ['./lib/*'],
          '@/types/*': ['./types/*']
        },
        // Performance optimizations
        assumeChangesOnlyAffectDirectDependencies: true,
        declaration: false,
        declarationMap: false,
        sourceMap: false
      },
      include: [
        'next-env.d.ts',
        '**/*.ts',
        '**/*.tsx',
        '.next/types/**/*.ts'
      ],
      exclude: [
        'node_modules',
        '.next',
        'dist',
        'out'
      ],
      typeAcquisition: {
        enable: false
      }
    };
  }

  /**
   * Generate file watcher configuration for optimal performance
   */
  generateWatcherConfig(): any {
    return {
      watchOptions: {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/dist/**',
          '**/coverage/**'
        ],
        aggregateTimeout: 300,
        poll: false
      },
      experiments: {
        cacheUnaffected: true
      }
    };
  }

  /**
   * Generate automated code generation templates
   */
  generateCodeTemplates(): Record<string, string> {
    return {
      'core-module': `
// Core Module Template
// Generated by Dev Experience Optimizer

// Types
export type * from './types';

// DAL
// DAL functions are available via ./dal/* imports for server-side use only

// Actions
export * from './actions';

// Components
export * from './components';

// Hooks
export * from './hooks';
`,

      'dal-function': `
import { createServerClient } from '@/lib/supabase/server';
import type { /* Add your types */ } from '../types';

export async function {{functionName}}(userId: string, /* Add your params */): Promise</* Add return type */> {
  const supabase = await createServerClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== userId) {
    throw new Error('Unauthorized');
  }

  // Your function logic here
  const { data, error } = await supabase
    .from('{{tableName}}')
    .select('/* Add your fields */')
    .eq('user_id', userId);

  if (error) {
    throw new Error(\`Failed to {{action}}: \${error.message}\`);
  }

  return data;
}
`,

      'component': `
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface {{ComponentName}}Props {
  // Add your props
}

export function {{ComponentName}}({ /* Add your props */ }: {{ComponentName}}Props) {
  return (
    <Card>
      {/* Add your component content */}
    </Card>
  );
}
`,

      'server-action': `
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { /* Add your DAL imports */ } from '../dal';

export async function {{actionName}}(formData: FormData) {
  // Validate input
  const validatedFields = /* Add validation */;

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    // Call DAL function
    await /* Add your DAL call */;

    revalidatePath('/* Add your path */');
  } catch (error) {
    return {
      message: 'Database Error: Failed to {{action}}.',
    };
  }

  redirect('/* Add redirect path */');
}
`
    };
  }

  /**
   * Generate pre-commit hooks for quality enforcement
   */
  generatePreCommitHooks(): string {
    return `#!/bin/sh
# Pre-commit hook for architectural quality enforcement

echo "🔍 Running architectural compliance checks..."

# Check for file size violations
echo "📏 Checking file sizes..."
find src core -name "*.tsx" -exec wc -l {} + | awk '$1 > 300 {print "❌ File too large: " $2 " (" $1 " lines)"; exit 1}'

# Check for proper file extensions
echo "📝 Checking file extensions..."
find src core -name "*.ts" -exec grep -l "jsx\\|JSX\\|<\\|>" {} \\; | while read file; do
  echo "❌ JSX content in .ts file: $file"
  exit 1
done

# Check for missing barrel exports
echo "📦 Checking barrel exports..."
find core -mindepth 1 -maxdepth 1 -type d | while read dir; do
  if [ ! -f "$dir/index.ts" ]; then
    echo "❌ Missing barrel export: $dir/index.ts"
    exit 1
  fi
done

# Run TypeScript check
echo "🔧 Running TypeScript check..."
npx tsc --noEmit || exit 1

# Run ESLint
echo "🧹 Running ESLint..."
npx eslint . --ext .ts,.tsx || exit 1

# Run tests
echo "🧪 Running tests..."
npm run test || exit 1

echo "✅ All checks passed!"
`;
  }

  /**
   * Generate development metrics dashboard
   */
  generateMetricsDashboard(): string {
    return `
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DevMetrics {
  buildTime: number;
  typeCheckTime: number;
  bundleSize: number;
  violations: number;
  testCoverage: number;
  performanceScore: number;
}

export function DevMetricsDashboard() {
  const [metrics, setMetrics] = useState<DevMetrics | null>(null);

  useEffect(() => {
    // Fetch development metrics
    fetchDevMetrics().then(setMetrics);
  }, []);

  if (!metrics) return <div>Loading metrics...</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
      <MetricCard
        title="Build Time"
        value={\`\${metrics.buildTime}s\`}
        progress={Math.max(0, 100 - (metrics.buildTime / 30) * 100)}
        color="blue"
      />
      <MetricCard
        title="Type Check"
        value={\`\${metrics.typeCheckTime}s\`}
        progress={Math.max(0, 100 - (metrics.typeCheckTime / 10) * 100)}
        color="green"
      />
      <MetricCard
        title="Bundle Size"
        value={\`\${(metrics.bundleSize / 1024 / 1024).toFixed(1)}MB\`}
        progress={Math.max(0, 100 - (metrics.bundleSize / 5000000) * 100)}
        color="orange"
      />
      <MetricCard
        title="Violations"
        value={metrics.violations.toString()}
        progress={Math.max(0, 100 - metrics.violations * 10)}
        color="red"
      />
      <MetricCard
        title="Test Coverage"
        value={\`\${metrics.testCoverage}%\`}
        progress={metrics.testCoverage}
        color="purple"
      />
      <MetricCard
        title="Performance"
        value={\`\${metrics.performanceScore}/100\`}
        progress={metrics.performanceScore}
        color="teal"
      />
    </div>
  );
}

function MetricCard({ title, value, progress, color }: {
  title: string;
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <Progress value={progress} className={\`h-2 bg-\${color}-200\`} />
    </Card>
  );
}

async function fetchDevMetrics(): Promise<DevMetrics> {
  // This would connect to your development metrics API
  return {
    buildTime: 15,
    typeCheckTime: 8,
    bundleSize: 2500000,
    violations: 3,
    testCoverage: 85,
    performanceScore: 92
  };
}
`;
  }

  /**
   * Helper methods
   */
  private createViolation(
    rule: CodeQualityRule,
    filePath: string,
    lineNumber?: number
  ): ArchitectureViolation {
    return {
      type: 'coupling', // Default type, could be refined
      severity: rule.severity,
      file: filePath,
      line: lineNumber,
      message: rule.message,
      suggestion: rule.suggestion,
      autofix: !!rule.autofix
    };
  }

  private findLineNumber(content: string, searchText: string): number {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(searchText)) {
        return i + 1;
      }
    }
    return 1;
  }

  private getMaxLines(filePath: string): number {
    if (filePath.includes('components') && filePath.endsWith('.tsx')) return 300;
    if (filePath.includes('dal') && filePath.endsWith('.ts')) return 500;
    if (filePath.includes('hooks') && filePath.endsWith('.ts')) return 150;
    if (filePath.includes('types') && filePath.endsWith('.ts')) return 400;
    return 200;
  }

  private suggestComponentSplit(content: string): string {
    // Simple heuristic for component splitting suggestions
    const lines = content.split('\n');
    const functionsCount = (content.match(/function\s+\w+/g) || []).length;

    if (functionsCount > 3) {
      return `// Consider extracting ${functionsCount - 1} helper functions to separate files`;
    }

    if (lines.length > 400) {
      return '// Consider splitting this component into smaller sub-components';
    }

    return '// Consider refactoring this component for better maintainability';
  }

  /**
   * Generate all violations found
   */
  getAllViolations(): ArchitectureViolation[] {
    return this.violations;
  }

  /**
   * Generate comprehensive development setup
   */
  generateDevSetup(): Record<string, any> {
    return {
      eslintConfig: this.generateESLintConfig(),
      tsConfig: this.generateTSConfig(),
      watcherConfig: this.generateWatcherConfig(),
      templates: this.generateCodeTemplates(),
      preCommitHook: this.generatePreCommitHooks(),
      metricsDashboard: this.generateMetricsDashboard()
    };
  }
}

/**
 * Factory function to create development experience optimizer
 */
export function createDevExperienceOptimizer(): DevExperienceOptimizer {
  return new DevExperienceOptimizer();
}