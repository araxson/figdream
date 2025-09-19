// Security Architecture Analyzer
// Comprehensive security audit and hardening tool for Core Module Pattern

export interface SecurityViolation {
  type: 'auth_missing' | 'input_validation' | 'data_exposure' | 'permission_bypass' | 'injection_risk';
  severity: 'critical' | 'high' | 'medium' | 'low';
  module: string;
  file: string;
  line?: number;
  description: string;
  recommendation: string;
  codeSnippet?: string;
}

export interface SecurityMetrics {
  dalFunctionsWithAuth: number;
  dalFunctionsWithoutAuth: number;
  inputValidationCoverage: number;
  exposedSensitiveFields: string[];
  unsafeQueryPatterns: number;
  authBypassRisks: number;
  overallSecurityScore: number;
}

export interface SecurityConfig {
  requiredAuthPatterns: string[];
  sensitiveFields: string[];
  validationPatterns: RegExp[];
  allowedQueryPatterns: RegExp[];
  requiredPermissionChecks: string[];
}

/**
 * Comprehensive security analyzer for DAL functions and core modules
 */
export class SecurityAnalyzer {
  private violations: SecurityViolation[] = [];
  private config: SecurityConfig;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      requiredAuthPatterns: [
        'auth.getUser()',
        'user.id',
        'requireAuth(',
        'getUserContext(',
        'verifySession('
      ],
      sensitiveFields: [
        'password',
        'email',
        'phone',
        'ssn',
        'credit_card',
        'api_key',
        'secret',
        'token',
        'private'
      ],
      validationPatterns: [
        /z\..*\(\)/,  // Zod validation
        /yup\..*\(\)/,  // Yup validation
        /joi\..*\(\)/,  // Joi validation
        /\.validate\(/,  // Generic validation
      ],
      allowedQueryPatterns: [
        /\.select\(['"[`][\w\s,_]+['"[`]\)/,  // Specific field selection
        /\.eq\(['"`]\w+['"`],/,  // Equality filters
        /\.in\(['"`]\w+['"`],/,  // IN filters
      ],
      requiredPermissionChecks: [
        'requireAdminRole',
        'requireSalonOwner',
        'requireStaffRole',
        'checkPermission'
      ],
      ...config
    };
  }

  /**
   * Analyze a DAL function for security violations
   */
  analyzeDalFunction(
    content: string,
    moduleName: string,
    fileName: string
  ): SecurityViolation[] {
    const violations: SecurityViolation[] = [];
    const lines = content.split('\n');

    // Check for authentication
    const hasAuth = this.config.requiredAuthPatterns.some(pattern =>
      content.includes(pattern)
    );

    if (!hasAuth) {
      violations.push({
        type: 'auth_missing',
        severity: 'critical',
        module: moduleName,
        file: fileName,
        description: 'DAL function missing authentication check',
        recommendation: 'Add authentication verification using auth.getUser() or requireAuth()',
        codeSnippet: this.extractFunctionSignature(content)
      });
    }

    // Check for input validation
    const hasValidation = this.config.validationPatterns.some(pattern =>
      pattern.test(content)
    );

    if (!hasValidation && this.hasUserInput(content)) {
      violations.push({
        type: 'input_validation',
        severity: 'high',
        module: moduleName,
        file: fileName,
        description: 'Function accepts user input without validation',
        recommendation: 'Add input validation using Zod, Yup, or similar validation library'
      });
    }

    // Check for sensitive data exposure
    const exposedFields = this.findExposedSensitiveFields(content);
    if (exposedFields.length > 0) {
      violations.push({
        type: 'data_exposure',
        severity: 'high',
        module: moduleName,
        file: fileName,
        description: `Potentially exposing sensitive fields: ${exposedFields.join(', ')}`,
        recommendation: 'Use DTOs to return only safe fields, implement proper field filtering'
      });
    }

    // Check for SQL injection risks
    if (this.hasInjectionRisk(content)) {
      violations.push({
        type: 'injection_risk',
        severity: 'critical',
        module: moduleName,
        file: fileName,
        description: 'Potential SQL injection vulnerability detected',
        recommendation: 'Use parameterized queries and avoid string concatenation in queries'
      });
    }

    // Check for permission bypass
    if (this.hasPermissionBypass(content)) {
      violations.push({
        type: 'permission_bypass',
        severity: 'high',
        module: moduleName,
        file: fileName,
        description: 'Function may bypass permission checks',
        recommendation: 'Implement proper role-based access control and permission verification'
      });
    }

    return violations;
  }

  /**
   * Analyze server actions for security violations
   */
  analyzeServerAction(
    content: string,
    moduleName: string,
    fileName: string
  ): SecurityViolation[] {
    const violations: SecurityViolation[] = [];

    // Server actions must have "use server" directive
    if (!content.includes('"use server"') && !content.includes("'use server'")) {
      violations.push({
        type: 'auth_missing',
        severity: 'high',
        module: moduleName,
        file: fileName,
        description: 'Server action missing "use server" directive',
        recommendation: 'Add "use server" directive at the top of server action functions'
      });
    }

    // Check for FormData validation
    if (content.includes('FormData') && !this.hasValidation(content)) {
      violations.push({
        type: 'input_validation',
        severity: 'high',
        module: moduleName,
        file: fileName,
        description: 'FormData processing without validation',
        recommendation: 'Validate FormData inputs before processing'
      });
    }

    return violations;
  }

  /**
   * Generate comprehensive security report
   */
  generateSecurityReport(): {
    violations: SecurityViolation[];
    metrics: SecurityMetrics;
    recommendations: string[];
    complianceScore: number;
  } {
    const critical = this.violations.filter(v => v.severity === 'critical').length;
    const high = this.violations.filter(v => v.severity === 'high').length;
    const medium = this.violations.filter(v => v.severity === 'medium').length;
    const low = this.violations.filter(v => v.severity === 'low').length;

    // Calculate compliance score (100 - penalty points)
    const complianceScore = Math.max(0, 100 - (critical * 25 + high * 10 + medium * 5 + low * 1));

    const metrics: SecurityMetrics = {
      dalFunctionsWithAuth: 0, // Would be calculated from actual analysis
      dalFunctionsWithoutAuth: critical + high, // Approximation
      inputValidationCoverage: 0, // Would be calculated
      exposedSensitiveFields: this.getExposedFields(),
      unsafeQueryPatterns: 0, // Would be calculated
      authBypassRisks: this.violations.filter(v => v.type === 'permission_bypass').length,
      overallSecurityScore: complianceScore
    };

    const recommendations = this.generateRecommendations();

    return {
      violations: this.violations,
      metrics,
      recommendations,
      complianceScore
    };
  }

  /**
   * Generate security hardening recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const authMissing = this.violations.filter(v => v.type === 'auth_missing');
    if (authMissing.length > 0) {
      recommendations.push(
        `🔐 Add authentication checks to ${authMissing.length} DAL functions`
      );
    }

    const validationMissing = this.violations.filter(v => v.type === 'input_validation');
    if (validationMissing.length > 0) {
      recommendations.push(
        `✅ Implement input validation for ${validationMissing.length} functions`
      );
    }

    const dataExposure = this.violations.filter(v => v.type === 'data_exposure');
    if (dataExposure.length > 0) {
      recommendations.push(
        `🛡️ Implement DTOs to prevent sensitive data exposure in ${dataExposure.length} functions`
      );
    }

    const injectionRisks = this.violations.filter(v => v.type === 'injection_risk');
    if (injectionRisks.length > 0) {
      recommendations.push(
        `💉 Fix SQL injection vulnerabilities in ${injectionRisks.length} queries`
      );
    }

    // General recommendations
    recommendations.push(
      '🔒 Implement centralized authentication middleware',
      '📝 Create security testing suite for all DAL functions',
      '🚨 Set up security monitoring and alerting',
      '📚 Document security patterns and best practices'
    );

    return recommendations;
  }

  /**
   * Check if function has user input parameters
   */
  private hasUserInput(content: string): boolean {
    return /function\s+\w+\s*\([^)]*\w[^)]*\)/g.test(content) ||
           /\w+\s*:\s*\w+/g.test(content);
  }

  /**
   * Find potentially exposed sensitive fields
   */
  private findExposedSensitiveFields(content: string): string[] {
    const exposedFields: string[] = [];

    for (const field of this.config.sensitiveFields) {
      // Check if field is selected but not filtered
      const selectPattern = new RegExp(`select\\([^)]*${field}[^)]*\\)`, 'i');
      const filterPattern = new RegExp(`omit\\([^)]*${field}[^)]*\\)|pick\\([^)]*(?!${field})[^)]*\\)`, 'i');

      if (selectPattern.test(content) && !filterPattern.test(content)) {
        exposedFields.push(field);
      }
    }

    return exposedFields;
  }

  /**
   * Check for SQL injection risks
   */
  private hasInjectionRisk(content: string): boolean {
    // Look for string concatenation in queries
    const concatenationPatterns = [
      /\+\s*['"`]/,  // String concatenation
      /`\$\{[^}]+\}`/,  // Template literal interpolation
      /\.raw\(/,  // Raw SQL usage
    ];

    return concatenationPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check for permission bypass risks
   */
  private hasPermissionBypass(content: string): boolean {
    // Check if function modifies data without permission checks
    const modificationPatterns = [
      /\.insert\(/,
      /\.update\(/,
      /\.delete\(/,
      /\.upsert\(/,
    ];

    const hasModification = modificationPatterns.some(pattern => pattern.test(content));

    if (hasModification) {
      const hasPermissionCheck = this.config.requiredPermissionChecks.some(check =>
        content.includes(check)
      );
      return !hasPermissionCheck;
    }

    return false;
  }

  /**
   * Check if content has validation
   */
  private hasValidation(content: string): boolean {
    return this.config.validationPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Extract function signature for code snippets
   */
  private extractFunctionSignature(content: string): string {
    const match = content.match(/export\s+(?:async\s+)?function\s+\w+\s*\([^)]*\)[^{]*\{/);
    return match ? match[0] : 'Function signature not found';
  }

  /**
   * Get all exposed sensitive fields across violations
   */
  private getExposedFields(): string[] {
    return this.violations
      .filter(v => v.type === 'data_exposure')
      .map(v => v.description.split(':')[1]?.trim())
      .filter(Boolean);
  }

  /**
   * Add violation to the list
   */
  addViolation(violation: SecurityViolation): void {
    this.violations.push(violation);
  }

  /**
   * Clear all violations
   */
  clearViolations(): void {
    this.violations = [];
  }
}

/**
 * Security hardening utilities
 */
export class SecurityHardening {
  /**
   * Generate authentication wrapper for DAL functions
   */
  static generateAuthWrapper(functionName: string): string {
    return `
export async function ${functionName}(userId: string, ...args: any[]) {
  const supabase = await createServerClient();

  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user || user.id !== userId) {
    throw new Error('Unauthorized');
  }

  // Your function logic here
  return await ${functionName}Implementation(userId, ...args);
}`;
  }

  /**
   * Generate input validation schema template
   */
  static generateValidationSchema(functionParams: string[]): string {
    const validations = functionParams.map(param => {
      const type = this.inferParameterType(param);
      return `${param}: ${type}`;
    }).join(',\n  ');

    return `
import { z } from 'zod';

const ${functionParams[0]}Schema = z.object({
  ${validations}
});

export type ${functionParams[0]}Input = z.infer<typeof ${functionParams[0]}Schema>;`;
  }

  /**
   * Generate DTO for safe data transfer
   */
  static generateDTO(tableName: string, safeFields: string[]): string {
    const typeFields = safeFields.map(field => `${field}: any`).join(';\n  ');

    return `
export interface ${tableName}DTO {
  ${typeFields};
}

export function create${tableName}DTO(data: any): ${tableName}DTO {
  return {
    ${safeFields.map(field => `${field}: data.${field}`).join(',\n    ')}
  };
}`;
  }

  /**
   * Generate permission check middleware
   */
  static generatePermissionCheck(roles: string[]): string {
    return `
export async function requireRole(userId: string, requiredRoles: string[]): Promise<void> {
  const supabase = await createServerClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (!profile || !requiredRoles.includes(profile.role)) {
    throw new Error('Insufficient permissions');
  }
}`;
  }

  private static inferParameterType(param: string): string {
    if (param.includes('id') || param.includes('Id')) return 'z.string().uuid()';
    if (param.includes('email')) return 'z.string().email()';
    if (param.includes('phone')) return 'z.string().regex(/^\\+?[1-9]\\d{1,14}$/)';
    if (param.includes('date') || param.includes('Date')) return 'z.string().datetime()';
    return 'z.string().min(1)';
  }
}

/**
 * Factory function to create security analyzer
 */
export function createSecurityAnalyzer(config?: Partial<SecurityConfig>): SecurityAnalyzer {
  return new SecurityAnalyzer(config);
}