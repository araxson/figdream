#!/usr/bin/env npx tsx

/**
 * Database Type Validator
 *
 * Compares database.types.ts with actual usage across the codebase
 * Identifies type mismatches, missing properties, and schema drift
 * Helps fix the majority of TypeScript errors related to database types
 *
 * Usage: npx tsx scripts/database-type-validator.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TypeMismatch {
  file: string;
  line: number;
  property: string;
  expectedType: string;
  actualType: string;
  suggestion: string;
}

interface MissingProperty {
  file: string;
  line: number;
  typeName: string;
  property: string;
  usageContext: string;
  suggestion: string;
}

interface DatabaseTypeReport {
  timestamp: string;
  totalIssues: number;
  typeMismatches: TypeMismatch[];
  missingProperties: MissingProperty[];
  affectedTables: string[];
  commonPatterns: Array<{
    pattern: string;
    occurrences: number;
    files: string[];
    fixStrategy: string;
  }>;
  recommendations: string[];
}

class DatabaseTypeValidator {
  private report: DatabaseTypeReport = {
    timestamp: new Date().toISOString(),
    totalIssues: 0,
    typeMismatches: [],
    missingProperties: [],
    affectedTables: new Set<string>() as any,
    commonPatterns: [],
    recommendations: []
  };

  private databaseTypes: Map<string, any> = new Map();

  async validate(): Promise<void> {
    console.log('🔍 Database Type Validator Starting...\n');

    // Load database types
    await this.loadDatabaseTypes();

    // Analyze TypeScript errors for database-related issues
    await this.analyzeTypeErrors();

    // Find common patterns
    this.identifyPatterns();

    // Generate recommendations
    this.generateRecommendations();

    // Save report
    this.saveReport();

    // Display summary
    this.displaySummary();
  }

  private async loadDatabaseTypes(): Promise<void> {
    console.log('📚 Loading database type definitions...');

    const typesPath = path.join('types', 'database.types.ts');
    if (!fs.existsSync(typesPath)) {
      console.error('❌ database.types.ts not found in types/');
      return;
    }

    const content = fs.readFileSync(typesPath, 'utf-8');

    // Parse type definitions (simplified - looks for interface/type declarations)
    const typeRegex = /(?:export\s+)?(?:interface|type)\s+(\w+)\s*(?:<[^>]+>)?\s*\{([^}]+)\}/g;
    let match;

    while ((match = typeRegex.exec(content)) !== null) {
      const typeName = match[1];
      const typeBody = match[2];

      // Extract properties
      const properties: Record<string, string> = {};
      const propRegex = /(\w+)(\?)?:\s*([^;]+);/g;
      let propMatch;

      while ((propMatch = propRegex.exec(typeBody)) !== null) {
        const propName = propMatch[1];
        const isOptional = propMatch[2] === '?';
        const propType = propMatch[3].trim();
        properties[propName] = isOptional ? `${propType} | undefined` : propType;
      }

      this.databaseTypes.set(typeName, properties);
    }

    console.log(`   Loaded ${this.databaseTypes.size} type definitions\n`);
  }

  private async analyzeTypeErrors(): Promise<void> {
    console.log('🔎 Analyzing TypeScript errors for database issues...');

    // Load errors from claude-analysis.json
    const analysisPath = path.join('docs', 'claude-analysis.json');
    if (!fs.existsSync(analysisPath)) {
      console.error('❌ No claude-analysis.json found. Run claude-health-check.ts first.');
      return;
    }

    const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf-8'));
    const allErrors = analysis.criticalErrors.typeScript || [];

    // Filter out errors from files we don't need to analyze
    const errors = allErrors.filter(error => {
      // Exclude components/ui (shadcn/ui library)
      if (error.file.includes('components/ui/')) return false;

      // Exclude test files
      if (error.file.includes('.test.') || error.file.includes('.spec.')) return false;

      // Exclude scripts folder
      if (error.file.startsWith('scripts/')) return false;

      // Exclude type definition files
      if (error.file === 'types/database.types.ts') return false;

      // Only include DAL and database-related files
      return error.file.includes('/dal/') ||
             error.file.includes('/actions/') ||
             error.file.includes('supabase') ||
             error.file.includes('database');
    });

    console.log(`   Analyzing ${errors.length} database-related errors (excluded ${allErrors.length - errors.length} non-DAL errors)`);

    // Patterns for database-related errors
    const patterns = {
      missingProperty: /Property '(\w+)' does not exist on type '([^']+)'/,
      typeMismatch: /Type '([^']+)' is not assignable to type '([^']+)'/,
      undefinedProperty: /Cannot read prop(?:erty|erties) '(\w+)' of undefined/,
      nullProperty: /Object is possibly 'null'.*property '(\w+)'/
    };

    const affectedTables = new Set<string>();

    for (const error of errors) {
      // Check for missing property errors
      const missingPropMatch = error.message.match(patterns.missingProperty);
      if (missingPropMatch) {
        const property = missingPropMatch[1];
        const typeName = missingPropMatch[2];

        // Check if this is a database type
        if (this.isDatabaseType(typeName)) {
          this.report.missingProperties.push({
            file: error.file,
            line: error.line,
            typeName,
            property,
            usageContext: this.getUsageContext(error.file, error.line),
            suggestion: this.getSuggestionForMissingProperty(typeName, property)
          });

          // Track affected table
          const tableName = this.extractTableName(typeName);
          if (tableName) {
            affectedTables.add(tableName);
          }
        }
      }

      // Check for type mismatch errors
      const typeMismatchMatch = error.message.match(patterns.typeMismatch);
      if (typeMismatchMatch) {
        const actualType = typeMismatchMatch[1];
        const expectedType = typeMismatchMatch[2];

        if (this.isDatabaseRelated(error.file)) {
          this.report.typeMismatches.push({
            file: error.file,
            line: error.line,
            property: this.extractPropertyFromContext(error.file, error.line),
            expectedType,
            actualType,
            suggestion: this.getSuggestionForTypeMismatch(actualType, expectedType)
          });
        }
      }
    }

    this.report.affectedTables = Array.from(affectedTables);
    this.report.totalIssues = this.report.missingProperties.length + this.report.typeMismatches.length;

    console.log(`   Found ${this.report.totalIssues} database type issues\n`);
  }

  private isDatabaseType(typeName: string): boolean {
    // Check if type name suggests database origin
    return typeName.includes('Row') ||
           typeName.includes('Insert') ||
           typeName.includes('Update') ||
           typeName.includes('Database') ||
           typeName.includes('Tables') ||
           this.databaseTypes.has(typeName);
  }

  private isDatabaseRelated(filePath: string): boolean {
    // Check if file is DAL or database-related
    return filePath.includes('/dal/') ||
           filePath.includes('/actions/') ||
           filePath.includes('supabase') ||
           filePath.includes('database');
  }

  private extractTableName(typeName: string): string | null {
    // Extract table name from type name (e.g., 'UsersRow' -> 'users')
    const match = typeName.match(/(\w+)(?:Row|Insert|Update)$/);
    if (match) {
      return match[1].toLowerCase();
    }
    return null;
  }

  private getUsageContext(file: string, line: number): string {
    // Simplified - in real implementation would read actual file
    if (file.includes('/dal/')) return 'DAL function';
    if (file.includes('/components/')) return 'React component';
    if (file.includes('/actions/')) return 'Server action';
    if (file.includes('/hooks/')) return 'Custom hook';
    return 'Unknown context';
  }

  private extractPropertyFromContext(file: string, line: number): string {
    // Simplified - would need to read actual file content
    return 'unknown_property';
  }

  private getSuggestionForMissingProperty(typeName: string, property: string): string {
    // Common property name mappings
    const commonMappings: Record<string, string> = {
      'start_time': 'startTime',
      'end_time': 'endTime',
      'created_at': 'createdAt',
      'updated_at': 'updatedAt',
      'user_id': 'userId',
      'salon_id': 'salonId',
      'staff_id': 'staffId',
      'service_id': 'serviceId',
      'customer_id': 'customerId',
      'payment_status': 'paymentStatus',
      'confirmation_code': 'confirmationCode',
      'is_active': 'isActive',
      'tier_based': 'tierBased'
    };

    if (commonMappings[property]) {
      return `Property might be camelCase: try '${commonMappings[property]}' instead of '${property}'`;
    }

    // Check if property exists in camelCase
    const camelCase = property.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    if (camelCase !== property) {
      return `Try camelCase version: '${camelCase}'`;
    }

    return `Add '${property}' to type definition or check if property name is correct`;
  }

  private getSuggestionForTypeMismatch(actual: string, expected: string): string {
    // Handle common type mismatches
    if (actual.includes('undefined') && !expected.includes('undefined')) {
      return 'Add null check or use optional chaining (?.)';
    }

    if (expected === 'string' && actual.includes('string | undefined')) {
      return 'Use nullish coalescing (??) to provide default value';
    }

    if (actual === 'unknown') {
      return 'Add type assertion or type guard';
    }

    if (actual === 'any') {
      return 'Replace any with specific type';
    }

    return `Cast or convert ${actual} to ${expected}`;
  }

  private identifyPatterns(): void {
    console.log('📊 Identifying common patterns...');

    const patterns = new Map<string, { count: number; files: Set<string>; strategy: string }>();

    // Analyze missing properties
    for (const issue of this.report.missingProperties) {
      const key = `missing_${issue.property}`;
      if (!patterns.has(key)) {
        patterns.set(key, {
          count: 0,
          files: new Set(),
          strategy: issue.suggestion
        });
      }
      const pattern = patterns.get(key)!;
      pattern.count++;
      pattern.files.add(issue.file);
    }

    // Convert to array and sort
    this.report.commonPatterns = Array.from(patterns.entries())
      .map(([pattern, data]) => ({
        pattern,
        occurrences: data.count,
        files: Array.from(data.files),
        fixStrategy: data.strategy
      }))
      .sort((a, b) => b.occurrences - a.occurrences)
      .slice(0, 10); // Top 10 patterns

    console.log(`   Found ${this.report.commonPatterns.length} common patterns\n`);
  }

  private generateRecommendations(): void {
    const recommendations: string[] = [];

    // Check for snake_case vs camelCase issues
    const snakeCaseIssues = this.report.missingProperties.filter(p =>
      p.property.includes('_')
    );

    if (snakeCaseIssues.length > 10) {
      recommendations.push(
        '🔄 CRITICAL: Many snake_case properties not found. ' +
        'Your database uses snake_case but TypeScript expects camelCase. ' +
        'Consider using a transformer or updating type definitions.'
      );
    }

    // Check for missing auth properties
    const authProperties = this.report.missingProperties.filter(p =>
      ['userId', 'user_id', 'ownerId', 'owner_id'].includes(p.property)
    );

    if (authProperties.length > 0) {
      recommendations.push(
        '🔐 Security: Missing user/owner ID properties. ' +
        'Ensure all DAL functions properly join with auth tables.'
      );
    }

    // Check for timestamp issues
    const timestampIssues = this.report.missingProperties.filter(p =>
      ['created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(p.property)
    );

    if (timestampIssues.length > 0) {
      recommendations.push(
        '⏰ Timestamps: Missing timestamp properties. ' +
        'Check if timestamps are being selected in queries.'
      );
    }

    // Type safety recommendations
    if (this.report.typeMismatches.length > 50) {
      recommendations.push(
        '⚠️ Type Safety: Many type mismatches detected. ' +
        'Run TypeScript strict mode and fix all any types.'
      );
    }

    // Table-specific recommendations
    if (this.report.affectedTables.length > 0) {
      recommendations.push(
        `📊 Affected Tables: Focus on fixing types for: ${this.report.affectedTables.slice(0, 5).join(', ')}`
      );
    }

    this.report.recommendations = recommendations;
  }

  private saveReport(): void {
    // Save JSON report
    const jsonPath = path.join('docs', 'database-type-issues.json');
    fs.writeFileSync(jsonPath, JSON.stringify(this.report, null, 2));

    // Save markdown report
    const mdPath = path.join('docs', 'database-type-report.md');
    const markdown = this.generateMarkdown();
    fs.writeFileSync(mdPath, markdown);

    console.log('📊 Reports saved:');
    console.log(`   - ${jsonPath} (for agents)`);
    console.log(`   - ${mdPath} (for humans)\n`);
  }

  private generateMarkdown(): string {
    const lines: string[] = [
      '# Database Type Validation Report',
      '',
      `Generated: ${this.report.timestamp}`,
      '',
      '## Summary',
      '',
      `- **Total Issues**: ${this.report.totalIssues}`,
      `- **Missing Properties**: ${this.report.missingProperties.length}`,
      `- **Type Mismatches**: ${this.report.typeMismatches.length}`,
      `- **Affected Tables**: ${this.report.affectedTables.length}`,
      '',
      '## Recommendations',
      '',
      ...this.report.recommendations.map(r => `- ${r}`),
      '',
      '## Common Patterns',
      ''
    ];

    for (const pattern of this.report.commonPatterns) {
      lines.push(`### ${pattern.pattern} (${pattern.occurrences} occurrences)`);
      lines.push(`**Fix Strategy**: ${pattern.fixStrategy}`);
      lines.push(`**Files**: ${pattern.files.length} files affected`);
      lines.push('');
    }

    // Top missing properties
    if (this.report.missingProperties.length > 0) {
      lines.push('## Top Missing Properties');
      lines.push('');

      const propertyGroups = new Map<string, MissingProperty[]>();
      for (const prop of this.report.missingProperties) {
        if (!propertyGroups.has(prop.property)) {
          propertyGroups.set(prop.property, []);
        }
        propertyGroups.get(prop.property)!.push(prop);
      }

      const sorted = Array.from(propertyGroups.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10);

      for (const [property, occurrences] of sorted) {
        lines.push(`### \`${property}\` (${occurrences.length} occurrences)`);
        lines.push(`**Suggestion**: ${occurrences[0].suggestion}`);
        lines.push('**Example files:**');
        for (const occ of occurrences.slice(0, 3)) {
          lines.push(`- ${occ.file}:${occ.line}`);
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  private displaySummary(): void {
    console.log('=' .repeat(60));
    console.log('DATABASE TYPE VALIDATION SUMMARY');
    console.log('=' .repeat(60));

    console.log(`\n🔍 Total Issues Found: ${this.report.totalIssues}`);
    console.log(`   - Missing Properties: ${this.report.missingProperties.length}`);
    console.log(`   - Type Mismatches: ${this.report.typeMismatches.length}`);

    if (this.report.affectedTables.length > 0) {
      console.log(`\n📊 Affected Tables:`);
      for (const table of this.report.affectedTables.slice(0, 5)) {
        console.log(`   - ${table}`);
      }
    }

    if (this.report.commonPatterns.length > 0) {
      console.log(`\n🎯 Most Common Issues:`);
      for (const pattern of this.report.commonPatterns.slice(0, 5)) {
        console.log(`   - ${pattern.pattern}: ${pattern.occurrences} times`);
      }
    }

    if (this.report.recommendations.length > 0) {
      console.log(`\n💡 Key Recommendations:`);
      for (const rec of this.report.recommendations.slice(0, 3)) {
        console.log(`   ${rec}`);
      }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Database type validation complete!');
    console.log('Agents can now fix type issues systematically.\n');
  }
}

// Run the validator
const validator = new DatabaseTypeValidator();
validator.validate().catch(console.error);