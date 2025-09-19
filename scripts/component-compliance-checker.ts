#!/usr/bin/env npx tsx

/**
 * Component Compliance Checker
 *
 * Scans all React components for shadcn/ui compliance
 * Identifies custom CSS, non-shadcn components, and styling issues
 * Helps ui-standardizer agent know exactly what to fix
 *
 * Usage: npx tsx scripts/component-compliance-checker.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface NonCompliantComponent {
  file: string;
  issues: Array<{
    type: 'custom-css' | 'non-shadcn' | 'inline-styles' | 'custom-component' | 'missing-cn';
    line: number;
    description: string;
    suggestion: string;
    snippet?: string;
  }>;
  shadcnUsage: number;
  customUsage: number;
  complianceScore: number;
}

interface ComplianceReport {
  timestamp: string;
  totalComponents: number;
  compliantComponents: number;
  nonCompliantComponents: number;
  overallCompliance: number;
  components: NonCompliantComponent[];
  shadcnImports: Map<string, number>;
  customComponents: Array<{
    name: string;
    file: string;
    usage: number;
    shadcnEquivalent?: string;
  }>;
  recommendations: string[];
}

class ComponentComplianceChecker {
  private report: ComplianceReport = {
    timestamp: new Date().toISOString(),
    totalComponents: 0,
    compliantComponents: 0,
    nonCompliantComponents: 0,
    overallCompliance: 0,
    components: [],
    shadcnImports: new Map(),
    customComponents: [],
    recommendations: []
  };

  private shadcnComponents = new Set([
    'Accordion', 'Alert', 'AlertDialog', 'AspectRatio', 'Avatar',
    'Badge', 'Breadcrumb', 'Button', 'Calendar', 'Card', 'Carousel',
    'Chart', 'Checkbox', 'Collapsible', 'Command', 'ContextMenu',
    'Dialog', 'Drawer', 'DropdownMenu', 'Form', 'HoverCard',
    'Input', 'InputOTP', 'Label', 'Menubar', 'NavigationMenu',
    'Pagination', 'Popover', 'Progress', 'RadioGroup', 'Resizable',
    'ScrollArea', 'Select', 'Separator', 'Sheet', 'Sidebar', 'Skeleton',
    'Slider', 'Sonner', 'Switch', 'Table', 'Tabs', 'Textarea',
    'Toast', 'Toggle', 'ToggleGroup', 'Tooltip'
  ]);

  async check(): Promise<void> {
    console.log('🎨 Component Compliance Checker Starting...\n');

    // Find all component files
    const componentFiles = await this.findComponentFiles();

    // Analyze each component
    for (const file of componentFiles) {
      await this.analyzeComponent(file);
    }

    // Calculate compliance scores
    this.calculateCompliance();

    // Generate recommendations
    this.generateRecommendations();

    // Save reports
    this.saveReports();

    // Display summary
    this.displaySummary();
  }

  private async findComponentFiles(): Promise<string[]> {
    console.log('📁 Finding all React component files...');

    const allFiles: string[] = [];

    // Search in core/*/components and app
    const searchPaths = [
      'core',
      'app'
    ];

    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        this.findTsxFiles(searchPath, allFiles);
      }
    }

    // Filter out files we don't need to check
    const files = allFiles.filter(file => {
      // EXCLUDE components/ui - these are shadcn/ui library files
      if (file.includes('components/ui/')) return false;

      // Exclude test files
      if (file.includes('.test.') || file.includes('.spec.')) return false;

      // Exclude story files
      if (file.includes('.stories.')) return false;

      // Exclude example/demo files
      if (file.includes('/examples/') || file.includes('/demo/')) return false;

      // Exclude type definition files
      if (file.endsWith('.d.tsx')) return false;

      return true;
    });

    console.log(`   Found ${files.length} component files to check (excluded ${allFiles.length - files.length} ui/test files)\n`);
    return files;
  }

  private findTsxFiles(dir: string, files: string[]): void {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        // Skip components/ui directory entirely
        if (fullPath === 'components/ui' || fullPath.endsWith('/components/ui')) {
          continue;
        }
        this.findTsxFiles(fullPath, files);
      } else if (item.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }

  private async analyzeComponent(filePath: string): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const component: NonCompliantComponent = {
      file: filePath,
      issues: [],
      shadcnUsage: 0,
      customUsage: 0,
      complianceScore: 100
    };

    // Check for shadcn/ui imports
    const shadcnImportRegex = /import\s+(?:\{[^}]+\}|\*\s+as\s+\w+)\s+from\s+['"]@\/components\/ui\/(\w+)['"]/g;
    let match;

    while ((match = shadcnImportRegex.exec(content)) !== null) {
      component.shadcnUsage++;
      const componentName = match[1];
      this.report.shadcnImports.set(
        componentName,
        (this.report.shadcnImports.get(componentName) || 0) + 1
      );
    }

    // Check for custom CSS classes (not using cn())
    lines.forEach((line, index) => {
      // Check for className without cn()
      if (line.includes('className=') && !line.includes('cn(')) {
        // Skip if it's a simple string literal with Tailwind classes
        const classNameMatch = line.match(/className=["']([^"']+)["']/);
        if (classNameMatch) {
          const classes = classNameMatch[1];
          // Check if using custom CSS (not Tailwind)
          if (!this.isTailwindOnly(classes)) {
            component.issues.push({
              type: 'custom-css',
              line: index + 1,
              description: 'Custom CSS class used instead of Tailwind',
              suggestion: 'Replace with Tailwind utility classes',
              snippet: line.trim()
            });
            component.customUsage++;
          } else if (!line.includes('cn(')) {
            component.issues.push({
              type: 'missing-cn',
              line: index + 1,
              description: 'className without cn() utility',
              suggestion: 'Use cn() for className composition',
              snippet: line.trim()
            });
          }
        }
      }

      // Check for inline styles
      if (line.includes('style={{') || line.includes('style={')) {
        component.issues.push({
          type: 'inline-styles',
          line: index + 1,
          description: 'Inline styles detected',
          suggestion: 'Replace with Tailwind utility classes',
          snippet: line.trim()
        });
        component.customUsage++;
      }

      // Check for custom component patterns (e.g., CustomButton, MyModal)
      const customComponentMatch = line.match(/<(Custom|My|App)(\w+)/);
      if (customComponentMatch) {
        const componentName = customComponentMatch[0].substring(1);
        const shadcnEquivalent = this.findShadcnEquivalent(componentName);

        component.issues.push({
          type: 'custom-component',
          line: index + 1,
          description: `Custom component ${componentName} used`,
          suggestion: shadcnEquivalent
            ? `Replace with shadcn/ui ${shadcnEquivalent}`
            : 'Consider using shadcn/ui component',
          snippet: line.trim()
        });
        component.customUsage++;

        // Track custom component usage
        const existing = this.report.customComponents.find(c => c.name === componentName);
        if (existing) {
          existing.usage++;
        } else {
          this.report.customComponents.push({
            name: componentName,
            file: filePath,
            usage: 1,
            shadcnEquivalent
          });
        }
      }

      // Check for non-shadcn UI library imports
      if (line.includes('from \'react-') || line.includes('from "@mui') ||
          line.includes('from \'antd') || line.includes('from \'@chakra')) {
        component.issues.push({
          type: 'non-shadcn',
          line: index + 1,
          description: 'Non-shadcn UI library detected',
          suggestion: 'Replace with shadcn/ui components',
          snippet: line.trim()
        });
        component.customUsage++;
      }
    });

    // Calculate component compliance score
    if (component.issues.length > 0) {
      component.complianceScore = Math.max(
        0,
        100 - (component.issues.length * 10)
      );
      this.report.components.push(component);
      this.report.nonCompliantComponents++;
    } else {
      this.report.compliantComponents++;
    }

    this.report.totalComponents++;
  }

  private isTailwindOnly(classes: string): boolean {
    // Common Tailwind prefixes
    const tailwindPrefixes = [
      'flex', 'grid', 'block', 'inline', 'hidden',
      'w-', 'h-', 'p-', 'm-', 'px-', 'py-', 'mx-', 'my-',
      'text-', 'bg-', 'border-', 'rounded-', 'shadow-',
      'hover:', 'focus:', 'active:', 'disabled:',
      'sm:', 'md:', 'lg:', 'xl:', '2xl:',
      'space-', 'gap-', 'items-', 'justify-', 'content-',
      'absolute', 'relative', 'fixed', 'sticky',
      'z-', 'opacity-', 'transition-', 'duration-', 'ease-',
      'font-', 'leading-', 'tracking-', 'truncate'
    ];

    const classArray = classes.split(' ');
    return classArray.every(cls => {
      return tailwindPrefixes.some(prefix => cls.startsWith(prefix)) ||
             cls === '' ||
             cls.startsWith('[') || // Arbitrary values
             cls.startsWith('-') ||  // Negative values
             cls.includes(':');      // Modifiers
    });
  }

  private findShadcnEquivalent(componentName: string): string | undefined {
    // Map common custom components to shadcn equivalents
    const mappings: Record<string, string> = {
      'CustomButton': 'Button',
      'MyButton': 'Button',
      'AppButton': 'Button',
      'CustomModal': 'Dialog',
      'MyModal': 'Dialog',
      'AppModal': 'Dialog',
      'CustomInput': 'Input',
      'MyInput': 'Input',
      'AppInput': 'Input',
      'CustomSelect': 'Select',
      'MySelect': 'Select',
      'AppSelect': 'Select',
      'CustomCard': 'Card',
      'MyCard': 'Card',
      'AppCard': 'Card',
      'CustomTable': 'Table',
      'MyTable': 'Table',
      'AppTable': 'Table',
      'CustomTabs': 'Tabs',
      'MyTabs': 'Tabs',
      'AppTabs': 'Tabs',
      'CustomDropdown': 'DropdownMenu',
      'MyDropdown': 'DropdownMenu',
      'AppDropdown': 'DropdownMenu',
      'CustomTooltip': 'Tooltip',
      'MyTooltip': 'Tooltip',
      'AppTooltip': 'Tooltip'
    };

    return mappings[componentName];
  }

  private calculateCompliance(): void {
    if (this.report.totalComponents > 0) {
      this.report.overallCompliance = Math.round(
        (this.report.compliantComponents / this.report.totalComponents) * 100
      );
    }

    // Sort components by compliance score (worst first)
    this.report.components.sort((a, b) => a.complianceScore - b.complianceScore);

    // Sort custom components by usage
    this.report.customComponents.sort((a, b) => b.usage - a.usage);
  }

  private generateRecommendations(): void {
    const recs: string[] = [];

    // Check overall compliance
    if (this.report.overallCompliance < 50) {
      recs.push(
        '🚨 CRITICAL: Less than 50% shadcn/ui compliance. ' +
        'Major refactoring needed to standardize components.'
      );
    }

    // Check for custom components
    if (this.report.customComponents.length > 10) {
      recs.push(
        '🔄 Replace custom components: ' +
        `${this.report.customComponents.length} custom components found. ` +
        'Prioritize replacing high-usage components with shadcn/ui equivalents.'
      );
    }

    // Check for inline styles
    const inlineStyleCount = this.report.components.reduce(
      (sum, c) => sum + c.issues.filter(i => i.type === 'inline-styles').length,
      0
    );

    if (inlineStyleCount > 20) {
      recs.push(
        '🎨 Remove inline styles: ' +
        `${inlineStyleCount} inline styles found. ` +
        'Convert all inline styles to Tailwind utility classes.'
      );
    }

    // Check for missing cn() utility
    const missingCnCount = this.report.components.reduce(
      (sum, c) => sum + c.issues.filter(i => i.type === 'missing-cn').length,
      0
    );

    if (missingCnCount > 30) {
      recs.push(
        '🔧 Add cn() utility: ' +
        `${missingCnCount} className attributes without cn(). ` +
        'Use cn() for proper class merging and composition.'
      );
    }

    // Check for non-shadcn libraries
    const nonShadcnCount = this.report.components.reduce(
      (sum, c) => sum + c.issues.filter(i => i.type === 'non-shadcn').length,
      0
    );

    if (nonShadcnCount > 0) {
      recs.push(
        '📦 Remove non-shadcn libraries: ' +
        `${nonShadcnCount} imports from other UI libraries detected. ` +
        'Replace all with shadcn/ui components.'
      );
    }

    // Most used shadcn components
    const topShadcn = Array.from(this.report.shadcnImports.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topShadcn.length > 0) {
      recs.push(
        '✅ Most used shadcn components: ' +
        topShadcn.map(([name, count]) => `${name} (${count})`).join(', ')
      );
    }

    this.report.recommendations = recs;
  }

  private saveReports(): void {
    // Save JSON report
    const jsonPath = path.join('docs', 'component-compliance.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));

    // Save markdown report
    const mdPath = path.join('docs', 'component-compliance-report.md');
    const markdown = this.generateMarkdown();
    fs.writeFileSync(mdPath, markdown);

    console.log('📊 Reports saved:');
    console.log(`   - ${jsonPath} (for agents)`);
    console.log(`   - ${mdPath} (for humans)\n`);
  }

  private generateMarkdown(): string {
    const lines: string[] = [
      '# Component Compliance Report',
      '',
      `Generated: ${this.report.timestamp}`,
      '',
      '## Summary',
      '',
      `- **Total Components**: ${this.report.totalComponents}`,
      `- **Compliant**: ${this.report.compliantComponents} (${this.report.overallCompliance}%)`,
      `- **Non-Compliant**: ${this.report.nonCompliantComponents}`,
      `- **Custom Components**: ${this.report.customComponents.length}`,
      '',
      '## Recommendations',
      '',
      ...this.report.recommendations.map(r => `- ${r}`),
      ''
    ];

    // Worst offenders
    if (this.report.components.length > 0) {
      lines.push('## Components Needing Attention (Worst First)');
      lines.push('');

      for (const comp of this.report.components.slice(0, 10)) {
        lines.push(`### ${comp.file}`);
        lines.push(`**Compliance Score**: ${comp.complianceScore}%`);
        lines.push(`**Issues**: ${comp.issues.length}`);
        lines.push('');

        // Group issues by type
        const issuesByType = new Map<string, number>();
        for (const issue of comp.issues) {
          issuesByType.set(issue.type, (issuesByType.get(issue.type) || 0) + 1);
        }

        lines.push('**Issue Types:**');
        for (const [type, count] of issuesByType) {
          lines.push(`- ${type}: ${count} occurrences`);
        }
        lines.push('');

        // Show first few issues
        lines.push('**Example Issues:**');
        for (const issue of comp.issues.slice(0, 3)) {
          lines.push(`- Line ${issue.line}: ${issue.description}`);
          lines.push(`  Suggestion: ${issue.suggestion}`);
        }
        lines.push('');
      }
    }

    // Custom components to replace
    if (this.report.customComponents.length > 0) {
      lines.push('## Custom Components to Replace');
      lines.push('');

      for (const comp of this.report.customComponents.slice(0, 10)) {
        lines.push(`### ${comp.name}`);
        lines.push(`- **Usage Count**: ${comp.usage}`);
        lines.push(`- **First Seen**: ${comp.file}`);
        if (comp.shadcnEquivalent) {
          lines.push(`- **Replace With**: shadcn/ui ${comp.shadcnEquivalent}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private displaySummary(): void {
    console.log('=' .repeat(60));
    console.log('COMPONENT COMPLIANCE SUMMARY');
    console.log('=' .repeat(60));

    console.log(`\n🎨 Overall Compliance: ${this.report.overallCompliance}%`);
    console.log(`   - Compliant: ${this.report.compliantComponents}/${this.report.totalComponents}`);
    console.log(`   - Non-Compliant: ${this.report.nonCompliantComponents}/${this.report.totalComponents}`);

    if (this.report.customComponents.length > 0) {
      console.log(`\n🔄 Custom Components Found: ${this.report.customComponents.length}`);
      for (const comp of this.report.customComponents.slice(0, 5)) {
        console.log(`   - ${comp.name}: ${comp.usage} uses`);
      }
    }

    if (this.report.components.length > 0) {
      console.log(`\n⚠️ Files Needing Attention:`);
      for (const comp of this.report.components.slice(0, 5)) {
        console.log(`   - ${comp.file}: ${comp.issues.length} issues (${comp.complianceScore}% compliant)`);
      }
    }

    if (this.report.recommendations.length > 0) {
      console.log(`\n💡 Key Actions:`);
      for (const rec of this.report.recommendations.slice(0, 3)) {
        console.log(`   ${rec}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Component compliance check complete!');
    console.log('UI standardizer agent can now fix components systematically.\n');
  }
}

// Run the checker
const checker = new ComponentComplianceChecker();
checker.check().catch(console.error);