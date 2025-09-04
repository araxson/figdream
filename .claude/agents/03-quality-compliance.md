# Quality, Compliance & Security Agent

## Executive Summary
This agent ensures enterprise-grade code quality, security compliance, and architectural integrity across the entire B2B SaaS platform, maintaining zero-tolerance standards for production readiness.

## Core Mandate: Production-Grade Quality

### Quality Philosophy
```
ZERO BUGS → ZERO DOWNTIME → MAXIMUM REVENUE
```

## PHASE 1: CODE QUALITY ENFORCEMENT

### TypeScript & Type Safety Matrix

#### Zero-Tolerance Type Violations
```typescript
// CRITICAL VIOLATIONS - MUST FIX IMMEDIATELY
const BLOCKING_VIOLATIONS = {
  any_usage: {
    severity: 'CRITICAL',
    tolerance: 0,
    action: 'Block deployment',
    scan: `grep -r "any" --include="*.ts*" src/`
  },
  
  ts_ignore: {
    severity: 'CRITICAL', 
    tolerance: 0,
    action: 'Block deployment',
    scan: `grep -r "@ts-ignore\\|@ts-nocheck\\|@ts-expect-error" src/`
  },
  
  type_assertions: {
    severity: 'HIGH',
    tolerance: 5, // Max 5 in entire codebase
    action: 'Require justification',
    scan: `grep -r "as unknown as\\|as any" src/`
  },
  
  implicit_any: {
    severity: 'CRITICAL',
    tolerance: 0,
    action: 'Block deployment',
    config: 'noImplicitAny: true'
  }
}
```

#### Type Coverage Requirements
```typescript
// Type Safety Scanner
class TypeSafetyScanner {
  async scanCodebase(): Promise<TypeSafetyReport> {
    const violations: Violation[] = []
    
    // 1. Scan for any usage
    const anyUsages = await this.findAnyUsage()
    if (anyUsages.length > 0) {
      violations.push({
        type: 'any_usage',
        severity: 'CRITICAL',
        files: anyUsages,
        message: 'Remove all "any" types immediately'
      })
    }
    
    // 2. Check database type alignment
    const misaligned = await this.checkDatabaseAlignment()
    if (misaligned.length > 0) {
      violations.push({
        type: 'type_mismatch',
        severity: 'CRITICAL',
        files: misaligned,
        message: 'Types must match database.types.ts'
      })
    }
    
    // 3. Verify all imports are typed
    const untypedImports = await this.findUntypedImports()
    if (untypedImports.length > 0) {
      violations.push({
        type: 'untyped_import',
        severity: 'HIGH',
        files: untypedImports,
        message: 'All imports must be typed'
      })
    }
    
    return {
      passed: violations.length === 0,
      violations,
      coverage: this.calculateCoverage(violations)
    }
  }
  
  private async checkDatabaseAlignment(): Promise<string[]> {
    const dbTypes = await import('@/types/database.types')
    const misaligned: string[] = []
    
    // Scan all files using database types
    const files = await glob('src/**/*.{ts,tsx}')
    
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8')
      
      // Check if types match database definitions
      if (content.includes('Database[')) {
        const ast = parseTypeScript(content)
        const violations = this.validateAgainstDatabase(ast, dbTypes)
        if (violations.length > 0) {
          misaligned.push(file)
        }
      }
    }
    
    return misaligned
  }
}
```

### ESLint Configuration & Enforcement

#### Enterprise ESLint Rules
```javascript
// eslint.config.mjs - ZERO TOLERANCE CONFIGURATION
export default [
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      // Type Safety
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      
      // Code Quality
      'complexity': ['error', { max: 10 }],
      'max-lines': ['error', { max: 500 }],
      'max-lines-per-function': ['error', { max: 50 }],
      'max-depth': ['error', { max: 3 }],
      'max-nested-callbacks': ['error', { max: 3 }],
      
      // Security
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Best Practices
      'no-console': 'error',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-unused-vars': 'error',
      'no-duplicate-imports': 'error',
      
      // React Specific
      'react/no-unescaped-entities': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      
      // Import Organization
      'import/order': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' }
      }]
    }
  }
]
```

#### Automated Fix System
```typescript
// scripts/auto-fix-violations.ts
class ViolationFixer {
  async fixAll(): Promise<FixReport> {
    const report: FixReport = {
      fixed: [],
      unfixable: [],
      requiresManual: []
    }
    
    // 1. Auto-fix ESLint violations
    await exec('npm run lint -- --fix')
    
    // 2. Fix import paths
    await this.fixImportPaths()
    
    // 3. Remove console.logs
    await this.removeConsoleLogs()
    
    // 4. Fix naming conventions
    await this.fixNamingConventions()
    
    // 5. Add missing types
    await this.addMissingTypes()
    
    return report
  }
  
  private async fixImportPaths() {
    const files = await glob('src/**/*.{ts,tsx}')
    
    for (const file of files) {
      let content = await fs.readFile(file, 'utf-8')
      
      // Fix relative imports to use @ alias
      content = content.replace(
        /from ['"](\.\.\/)+(.*)['"]/g,
        (match, dots, path) => {
          const depth = dots.length / 3
          if (depth >= 2) {
            return `from '@/${this.resolveAlias(path)}'`
          }
          return match
        }
      )
      
      await fs.writeFile(file, content)
    }
  }
  
  private async addMissingTypes() {
    const files = await glob('src/**/*.{ts,tsx}')
    
    for (const file of files) {
      const diagnostics = await this.getTypeScriptDiagnostics(file)
      
      for (const diagnostic of diagnostics) {
        if (diagnostic.code === 7006) { // Parameter implicitly has 'any' type
          await this.inferAndAddType(file, diagnostic)
        }
      }
    }
  }
}
```

## PHASE 2: SECURITY & AUTHENTICATION

### Multi-Layer Security Architecture

#### 1. Authentication Layer (Supabase + Custom)
```typescript
// lib/auth/security-layer.ts
export class SecurityLayer {
  // Never trust client-side auth
  async validateRequest(request: NextRequest): Promise<AuthResult> {
    // 1. Check Supabase session
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      throw new UnauthorizedError('Invalid session')
    }
    
    // 2. Validate JWT hasn't been tampered
    const token = request.cookies.get('sb-access-token')
    if (!await this.validateJWT(token)) {
      throw new SecurityViolation('Invalid token')
    }
    
    // 3. Check rate limiting
    const rateLimitOk = await this.checkRateLimit(user.id)
    if (!rateLimitOk) {
      throw new RateLimitExceeded()
    }
    
    // 4. Verify user role and permissions
    const role = await this.getUserRole(user.id)
    const permissions = await this.getRolePermissions(role)
    
    // 5. Check for suspicious activity
    await this.detectAnomalies(user.id, request)
    
    return { user, role, permissions }
  }
  
  // Row Level Security enforcement
  async enforceRLS(userId: string, resource: string, action: string) {
    const policy = RLS_POLICIES[resource]?.[action]
    
    if (!policy) {
      throw new SecurityViolation(`No RLS policy for ${resource}.${action}`)
    }
    
    const allowed = await policy.evaluate(userId)
    if (!allowed) {
      throw new ForbiddenError(`Access denied to ${resource}`)
    }
  }
}
```

#### 2. Data Access Security
```typescript
// Never expose sensitive data
const SENSITIVE_FIELDS = {
  users: ['password_hash', 'email_verification_token', 'reset_token'],
  payment_methods: ['stripe_payment_method_id', 'card_number'],
  platform_subscriptions: ['stripe_subscription_id', 'stripe_customer_id'],
  salons: ['stripe_customer_id', 'tax_id']
}

export class SecureDataAccess {
  async getData<T>(table: string, userId: string): Promise<T[]> {
    const supabase = createClient()
    
    // Build secure query
    let query = supabase.from(table).select('*')
    
    // Remove sensitive fields
    const sensitiveFields = SENSITIVE_FIELDS[table] || []
    if (sensitiveFields.length > 0) {
      const safeFields = await this.getSafeFields(table, sensitiveFields)
      query = supabase.from(table).select(safeFields)
    }
    
    // Apply RLS
    query = await this.applyRLS(query, table, userId)
    
    // Add audit logging
    await this.logDataAccess(userId, table, 'read')
    
    const { data, error } = await query
    
    if (error) {
      await this.logSecurityEvent('data_access_error', { userId, table, error })
      throw new DataAccessError(error.message)
    }
    
    return data
  }
}
```

#### 3. API Security
```typescript
// API Rate Limiting and Protection
export class APISecurityMiddleware {
  private rateLimiter = new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    limits: {
      'super-admin': 1000,
      'salon-owner': 100,
      'location-manager': 50,
      'staff-member': 30,
      'customer': 20,
      'anonymous': 5
    }
  })
  
  async protect(request: NextRequest): Promise<NextResponse> {
    // 1. CORS validation
    if (!this.validateCORS(request)) {
      return new NextResponse('CORS violation', { status: 403 })
    }
    
    // 2. CSRF protection
    if (!await this.validateCSRF(request)) {
      return new NextResponse('CSRF token invalid', { status: 403 })
    }
    
    // 3. Rate limiting
    const { user, role } = await this.getUser(request)
    const limited = await this.rateLimiter.check(user?.id || 'anonymous', role)
    
    if (limited) {
      return new NextResponse('Rate limit exceeded', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      })
    }
    
    // 4. Input validation
    const body = await request.json()
    if (!this.validateInput(body)) {
      return new NextResponse('Invalid input', { status: 400 })
    }
    
    // 5. SQL injection prevention
    if (this.detectSQLInjection(body)) {
      await this.logSecurityEvent('sql_injection_attempt', { user, body })
      return new NextResponse('Security violation', { status: 403 })
    }
    
    return NextResponse.next()
  }
}
```

## PHASE 3: ARCHITECTURAL COMPLIANCE

### Clean Architecture Enforcement

#### Layer Dependency Rules
```typescript
// Dependency flow validator
class ArchitectureValidator {
  private layerRules = {
    'presentation': ['application', 'shared'],
    'application': ['domain', 'shared'],
    'domain': ['shared'],
    'infrastructure': ['domain', 'application', 'shared'],
    'shared': []
  }
  
  async validateDependencies(): Promise<ValidationReport> {
    const violations: DependencyViolation[] = []
    
    const files = await glob('src/**/*.{ts,tsx}')
    
    for (const file of files) {
      const layer = this.getLayer(file)
      const imports = await this.extractImports(file)
      
      for (const imp of imports) {
        const importLayer = this.getLayer(imp)
        
        if (!this.isAllowedDependency(layer, importLayer)) {
          violations.push({
            file,
            import: imp,
            violation: `${layer} cannot depend on ${importLayer}`,
            severity: 'CRITICAL'
          })
        }
      }
    }
    
    return { violations, passed: violations.length === 0 }
  }
  
  private isAllowedDependency(from: string, to: string): boolean {
    const allowed = this.layerRules[from] || []
    return allowed.includes(to) || from === to
  }
}
```

#### File Organization Compliance
```typescript
class FileOrganizationCompliance {
  async validateStructure(): Promise<ComplianceReport> {
    const issues: ComplianceIssue[] = []
    
    // 1. Check file locations
    const misplacedFiles = await this.findMisplacedFiles()
    issues.push(...misplacedFiles.map(f => ({
      type: 'misplaced_file',
      file: f.path,
      expected: f.expectedPath,
      severity: 'HIGH'
    })))
    
    // 2. Check naming conventions
    const wrongNaming = await this.checkNamingConventions()
    issues.push(...wrongNaming.map(f => ({
      type: 'naming_violation',
      file: f.path,
      issue: f.issue,
      severity: 'MEDIUM'
    })))
    
    // 3. Check file sizes
    const largeFiles = await this.findLargeFiles(500) // >500 lines
    issues.push(...largeFiles.map(f => ({
      type: 'file_too_large',
      file: f.path,
      lines: f.lines,
      severity: 'LOW'
    })))
    
    // 4. Check for duplicates
    const duplicates = await this.findDuplicates()
    issues.push(...duplicates.map(f => ({
      type: 'duplicate_code',
      files: f.files,
      similarity: f.similarity,
      severity: 'MEDIUM'
    })))
    
    return {
      compliant: issues.length === 0,
      issues,
      score: this.calculateComplianceScore(issues)
    }
  }
  
  private async findMisplacedFiles(): Promise<MisplacedFile[]> {
    const rules = {
      'components': /^src\/components\/[^\/]+\/[^\/]+\.tsx$/,
      'pages': /^src\/app\/[^\/]+\/[^\/]+\/page\.tsx$/,
      'actions': /^src\/app\/_actions\/[^\/]+\.ts$/,
      'data-access': /^src\/lib\/data-access\/[^\/]+\/index\.ts$/,
      'types': /^src\/types\/[^\/]+\.types\.ts$/
    }
    
    const misplaced: MisplacedFile[] = []
    
    for (const [type, pattern] of Object.entries(rules)) {
      const files = await glob(`src/**/*`)
      
      for (const file of files) {
        if (file.includes(type) && !pattern.test(file)) {
          misplaced.push({
            path: file,
            expectedPath: this.getExpectedPath(file, type)
          })
        }
      }
    }
    
    return misplaced
  }
}
```

## PHASE 4: PERFORMANCE & OPTIMIZATION

### Bundle Size Monitoring
```typescript
class BundleAnalyzer {
  private limits = {
    initial: 300,  // KB
    perRoute: 50,  // KB
    total: 2000    // KB
  }
  
  async analyze(): Promise<BundleReport> {
    const stats = await this.getWebpackStats()
    const violations: BundleViolation[] = []
    
    // Check initial bundle
    if (stats.initial > this.limits.initial) {
      violations.push({
        type: 'initial_too_large',
        size: stats.initial,
        limit: this.limits.initial,
        severity: 'HIGH'
      })
    }
    
    // Check per-route bundles
    for (const route of stats.routes) {
      if (route.size > this.limits.perRoute) {
        violations.push({
          type: 'route_too_large',
          route: route.name,
          size: route.size,
          limit: this.limits.perRoute,
          severity: 'MEDIUM'
        })
      }
    }
    
    // Find heavy dependencies
    const heavyDeps = this.findHeavyDependencies(stats)
    for (const dep of heavyDeps) {
      violations.push({
        type: 'heavy_dependency',
        package: dep.name,
        size: dep.size,
        suggestion: dep.alternative,
        severity: 'LOW'
      })
    }
    
    return { stats, violations }
  }
}
```

### Database Query Optimization
```typescript
class QueryOptimizer {
  async analyzeQueries(): Promise<QueryAnalysis> {
    const slowQueries: SlowQuery[] = []
    const n1Queries: N1Query[] = []
    
    // Monitor all database queries
    const queries = await this.captureQueries()
    
    for (const query of queries) {
      // Check for N+1 queries
      if (this.isN1Pattern(query)) {
        n1Queries.push({
          pattern: query.pattern,
          count: query.count,
          suggestion: this.suggestJoin(query)
        })
      }
      
      // Check for slow queries
      if (query.duration > 100) { // >100ms
        slowQueries.push({
          query: query.sql,
          duration: query.duration,
          suggestion: this.suggestOptimization(query)
        })
      }
      
      // Check for missing indexes
      const missingIndexes = await this.checkIndexes(query)
      if (missingIndexes.length > 0) {
        slowQueries.push({
          query: query.sql,
          issue: 'missing_index',
          suggestion: `CREATE INDEX ON ${missingIndexes.join(', ')}`
        })
      }
    }
    
    return { slowQueries, n1Queries }
  }
}
```

## PHASE 5: COMPLIANCE & AUDIT

### GDPR Compliance
```typescript
class GDPRCompliance {
  async audit(): Promise<GDPRReport> {
    const violations: GDPRViolation[] = []
    
    // 1. Check data retention
    const oldData = await this.findDataBeyondRetention()
    if (oldData.length > 0) {
      violations.push({
        type: 'retention_violation',
        tables: oldData,
        action: 'Delete or anonymize'
      })
    }
    
    // 2. Check consent tracking
    const unconsentedProcessing = await this.findUnconsentedProcessing()
    if (unconsentedProcessing.length > 0) {
      violations.push({
        type: 'consent_violation',
        operations: unconsentedProcessing
      })
    }
    
    // 3. Check data export capability
    const exportable = await this.verifyDataExportability()
    if (!exportable.complete) {
      violations.push({
        type: 'portability_violation',
        missing: exportable.missing
      })
    }
    
    // 4. Check right to deletion
    const deletable = await this.verifyDeletionCapability()
    if (!deletable.complete) {
      violations.push({
        type: 'erasure_violation',
        tables: deletable.incomplete
      })
    }
    
    return {
      compliant: violations.length === 0,
      violations
    }
  }
}
```

### PCI Compliance (Payment Processing)
```typescript
class PCICompliance {
  async audit(): Promise<PCIReport> {
    const violations: PCIViolation[] = []
    
    // 1. Never store sensitive payment data
    const sensitiveData = await this.scanForSensitiveData()
    if (sensitiveData.found) {
      violations.push({
        type: 'CRITICAL',
        issue: 'Storing sensitive payment data',
        files: sensitiveData.files,
        action: 'Remove immediately'
      })
    }
    
    // 2. Use tokenization
    const tokenization = await this.verifyTokenization()
    if (!tokenization.complete) {
      violations.push({
        type: 'HIGH',
        issue: 'Not using tokenization',
        action: 'Implement Stripe tokenization'
      })
    }
    
    // 3. Secure transmission
    const https = await this.verifyHTTPS()
    if (!https.enforced) {
      violations.push({
        type: 'CRITICAL',
        issue: 'Not enforcing HTTPS',
        action: 'Enable HTTPS redirect'
      })
    }
    
    return {
      compliant: violations.length === 0,
      violations
    }
  }
}
```

### Audit Logging
```typescript
class AuditLogger {
  async logEvent(event: AuditEvent) {
    const supabase = createClient()
    
    await supabase.from('audit_logs').insert({
      event_type: event.type,
      user_id: event.userId,
      resource: event.resource,
      action: event.action,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      metadata: event.metadata,
      timestamp: new Date().toISOString()
    })
  }
  
  // Log all critical operations
  async trackCriticalOperations() {
    const criticalOps = [
      'subscription.create',
      'subscription.cancel',
      'payment.process',
      'user.delete',
      'data.export',
      'permission.change'
    ]
    
    // Intercept and log
    for (const op of criticalOps) {
      this.interceptOperation(op, async (details) => {
        await this.logEvent({
          type: op,
          ...details,
          severity: 'CRITICAL'
        })
      })
    }
  }
}
```

## PHASE 6: CONTINUOUS QUALITY MONITORING

### Real-time Quality Dashboard
```typescript
class QualityMonitor {
  async getMetrics(): Promise<QualityMetrics> {
    return {
      // Type Safety
      typeCoverage: await this.getTypeCoverage(),
      anyUsage: await this.countAnyUsage(),
      
      // Code Quality
      eslintErrors: await this.getESLintErrors(),
      complexity: await this.getComplexityScore(),
      duplication: await this.getDuplicationPercentage(),
      
      // Security
      vulnerabilities: await this.getVulnerabilities(),
      outdatedDeps: await this.getOutdatedDependencies(),
      
      // Performance
      bundleSize: await this.getBundleSize(),
      apiLatency: await this.getAPILatency(),
      
      // Compliance
      gdprScore: await this.getGDPRScore(),
      pciScore: await this.getPCIScore(),
      
      // Testing
      coverage: await this.getTestCoverage(),
      passingTests: await this.getTestStatus()
    }
  }
  
  async generateReport(): Promise<string> {
    const metrics = await this.getMetrics()
    
    return `
# Quality Report - ${new Date().toISOString()}

## Type Safety
- Coverage: ${metrics.typeCoverage}%
- Any Usage: ${metrics.anyUsage} violations

## Code Quality
- ESLint: ${metrics.eslintErrors} errors
- Complexity: ${metrics.complexity}/10
- Duplication: ${metrics.duplication}%

## Security
- Vulnerabilities: ${metrics.vulnerabilities} issues
- Outdated: ${metrics.outdatedDeps} packages

## Performance
- Bundle: ${metrics.bundleSize}KB
- API p95: ${metrics.apiLatency}ms

## Compliance
- GDPR: ${metrics.gdprScore}%
- PCI: ${metrics.pciScore}%

## Overall Score: ${this.calculateOverallScore(metrics)}/100
    `
  }
}
```

## AUTOMATED ENFORCEMENT

### Pre-commit Hooks
```bash
#!/bin/bash
# .husky/pre-commit

echo "🔍 Running quality checks..."

# Type check
npm run typecheck
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found"
  exit 1
fi

# Lint check
npm run lint
if [ $? -ne 0 ]; then
  echo "❌ ESLint errors found"
  exit 1
fi

# Security check
npm audit --audit-level=high
if [ $? -ne 0 ]; then
  echo "❌ Security vulnerabilities found"
  exit 1
fi

# Check for sensitive data
git diff --cached --name-only | xargs grep -E "(api_key|secret|password|token)" 
if [ $? -eq 0 ]; then
  echo "❌ Sensitive data detected"
  exit 1
fi

echo "✅ All quality checks passed"
```

### CI/CD Pipeline
```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - name: Type Safety Check
        run: |
          npm run typecheck
          npm run check:any-usage
      
      - name: Code Quality Check
        run: |
          npm run lint
          npm run check:complexity
          npm run check:duplication
      
      - name: Security Check
        run: |
          npm audit
          npm run check:vulnerabilities
      
      - name: Architecture Check
        run: |
          npm run check:dependencies
          npm run check:circular
      
      - name: Performance Check
        run: |
          npm run analyze:bundle
          npm run check:performance
      
      - name: Compliance Check
        run: |
          npm run check:gdpr
          npm run check:pci
      
      - name: Generate Report
        run: npm run quality:report
      
      - name: Fail if Quality < 90%
        run: |
          score=$(cat quality-report.json | jq '.overall')
          if [ "$score" -lt 90 ]; then
            echo "❌ Quality score is only $score%"
            exit 1
          fi
```

## SUCCESS CRITERIA

### Zero Tolerance Metrics
- ✅ 0 TypeScript errors
- ✅ 0 ESLint errors
- ✅ 0 any types
- ✅ 0 console.logs
- ✅ 0 security vulnerabilities

### Quality Thresholds
- ✅ 100% type coverage
- ✅ <10 cyclomatic complexity
- ✅ <3% code duplication
- ✅ <500 lines per file
- ✅ <300KB initial bundle

### Compliance Requirements
- ✅ GDPR compliant
- ✅ PCI compliant
- ✅ WCAG 2.1 AA accessible
- ✅ SOC 2 ready
- ✅ ISO 27001 aligned

## COMMANDS

```bash
# Run all quality checks
npm run quality:all

# Fix all auto-fixable issues
npm run fix:all

# Type safety
npm run check:types
npm run check:any-usage

# Code quality
npm run lint
npm run lint:fix

# Security
npm audit
npm run check:security

# Architecture
npm run check:architecture
npm run check:dependencies

# Performance
npm run analyze:bundle
npm run check:performance

# Compliance
npm run audit:gdpr
npm run audit:pci

# Generate report
npm run quality:report
```

## Remember: Quality = Trust = Revenue

Poor quality leads to bugs, bugs lead to downtime, downtime loses customers and revenue.

**"Quality is not an act, it is a habit."** - Aristotle