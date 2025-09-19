#!/usr/bin/env npx tsx

/**
 * Agent Workflow Orchestrator
 *
 * Master script that runs all analysis tools in the correct sequence
 * Generates a comprehensive action plan for agents to follow
 * Provides a single command to prepare the codebase for agent work
 *
 * Usage: npx tsx scripts/agent-workflow.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface WorkflowStep {
  name: string;
  script: string;
  outputs: string[];
  critical: boolean;
}

class AgentWorkflowOrchestrator {
  private readonly steps: WorkflowStep[] = [
    {
      name: 'Project Structure Analysis',
      script: 'npx tsx scripts/project-tree-generator.ts',
      outputs: ['docs/project-tree.md'],
      critical: true
    },
    {
      name: 'Claude Code Analysis',
      script: 'npx tsx scripts/analyzer-claude.ts',
      outputs: ['docs/claude-analysis.json', 'docs/claude-analysis.md'],
      critical: true
    },
    {
      name: 'Error Prioritization',
      script: 'npx tsx scripts/error-prioritizer.ts',
      outputs: ['docs/error-priority-queue.json', 'docs/error-priority-report.md'],
      critical: false
    },
    {
      name: 'Database Type Validation',
      script: 'npx tsx scripts/database-type-validator.ts',
      outputs: ['docs/database-type-issues.json', 'docs/database-type-report.md'],
      critical: false
    },
    {
      name: 'Component Compliance Check',
      script: 'npx tsx scripts/component-compliance-checker.ts',
      outputs: ['docs/component-compliance.json', 'docs/component-compliance-report.md'],
      critical: false
    },
    {
      name: 'DAL Security Scan',
      script: 'npx tsx scripts/dal-security-scanner.ts',
      outputs: ['docs/dal-security-report.json', 'docs/dal-security-report.md'],
      critical: false
    },
    {
      name: 'File Size Validation',
      script: 'npx tsx scripts/file-size-validator.ts',
      outputs: ['docs/oversized-files.json', 'docs/file-size-report.md'],
      critical: false
    }
  ];

  private results: Map<string, boolean> = new Map();
  private startTime: number = 0;

  async run(): Promise<void> {
    this.startTime = Date.now();

    console.log('🤖 Agent Workflow Orchestrator Starting...\n');
    console.log('This will run all analysis tools and generate a comprehensive action plan.\n');
    console.log('=' .repeat(60));

    // Ensure docs directory exists
    if (!fs.existsSync('docs')) {
      fs.mkdirSync('docs');
    }

    // Run each step
    for (const step of this.steps) {
      await this.runStep(step);
    }

    // Generate master action plan
    await this.generateActionPlan();

    // Display final summary
    this.displaySummary();
  }

  private async runStep(step: WorkflowStep): Promise<void> {
    console.log(`\n📋 ${step.name}...`);

    try {
      const { stdout, stderr } = await execAsync(step.script, {
        maxBuffer: 50 * 1024 * 1024
      });

      // Check if outputs were created
      const outputsCreated = step.outputs.every(output => fs.existsSync(output));

      if (outputsCreated) {
        console.log(`   ✅ Success - Generated ${step.outputs.length} report(s)`);
        this.results.set(step.name, true);
      } else {
        console.log(`   ⚠️ Warning - Some outputs were not created`);
        this.results.set(step.name, false);

        if (step.critical) {
          throw new Error(`Critical step failed: ${step.name}`);
        }
      }
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`);
      this.results.set(step.name, false);

      if (step.critical) {
        console.error('\n🛑 Critical step failed. Cannot continue.');
        process.exit(1);
      }
    }
  }

  private async generateActionPlan(): Promise<void> {
    console.log('\n📝 Generating Master Action Plan...');

    const actionPlan: string[] = [
      '# Agent Action Plan',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      '## 🎯 Execution Order for Agents',
      '',
      'Follow this exact sequence for optimal results:',
      ''
    ];

    // Load analysis results
    const analysis = this.loadJsonReport('docs/claude-analysis.json');
    const errorPriority = this.loadJsonReport('docs/error-priority-queue.json');
    const databaseIssues = this.loadJsonReport('docs/database-type-issues.json');
    const compliance = this.loadJsonReport('docs/component-compliance.json');
    const security = this.loadJsonReport('docs/dal-security-report.json');
    const fileSizes = this.loadJsonReport('docs/oversized-files.json');

    // Calculate priorities
    const healthScore = analysis?.projectHealth?.score || 0;
    const totalErrors = analysis?.criticalErrors?.total || 0;
    const criticalSecurity = security?.criticalIssues || 0;
    const complianceRate = compliance?.overallCompliance || 0;

    // Phase 1: Critical Structure & Security
    actionPlan.push('### Phase 1: Critical Issues (MUST FIX FIRST)');
    actionPlan.push('');

    if (healthScore < 50) {
      actionPlan.push('1. **Structure Guardian** - Fix project structure');
      actionPlan.push('   ```bash');
      actionPlan.push('   Task: "Use structure-guardian to fix forbidden directories and misplaced files"');
      actionPlan.push('   Read: docs/project-tree.md');
      actionPlan.push('   ```');
      actionPlan.push('');
    }

    if (criticalSecurity > 0) {
      actionPlan.push('2. **Database Security Master** - Fix critical security issues');
      actionPlan.push('   ```bash');
      actionPlan.push('   Task: "Use database-security-master to fix critical auth issues"');
      actionPlan.push('   Read: docs/dal-security-report.md');
      actionPlan.push(`   Critical Issues: ${criticalSecurity}`);
      actionPlan.push('   ```');
      actionPlan.push('');
    }

    // Phase 2: Type & Error Fixes
    actionPlan.push('### Phase 2: Error Resolution');
    actionPlan.push('');

    if (totalErrors > 100) {
      actionPlan.push('3. **Quality Deployment Ready** - Fix top priority errors');
      actionPlan.push('   ```bash');
      actionPlan.push('   Task: "Use quality-deployment-ready to fix console.log and unused imports"');
      actionPlan.push('   Read: docs/error-priority-report.md');
      actionPlan.push(`   Quick Wins: ${errorPriority?.quickWins?.reduce((sum: number, g: any) => sum + g.count, 0) || 0} errors`);
      actionPlan.push('   ```');
      actionPlan.push('');

      actionPlan.push('4. **Database Security Master** - Fix database type issues');
      actionPlan.push('   ```bash');
      actionPlan.push('   Task: "Fix missing properties on database types"');
      actionPlan.push('   Read: docs/database-type-report.md');
      actionPlan.push(`   Type Issues: ${databaseIssues?.totalIssues || 0}`);
      actionPlan.push('   ```');
      actionPlan.push('');
    }

    // Phase 3: UI Standardization
    actionPlan.push('### Phase 3: UI Standardization');
    actionPlan.push('');

    if (complianceRate < 50) {
      actionPlan.push('5. **UI Standardizer** - Convert to shadcn/ui');
      actionPlan.push('   ```bash');
      actionPlan.push('   Task: "Use ui-standardizer to replace custom components with shadcn/ui"');
      actionPlan.push('   Read: docs/component-compliance-report.md');
      actionPlan.push(`   Compliance: ${complianceRate}%`);
      actionPlan.push('   ```');
      actionPlan.push('');
    }

    // Phase 4: Architecture & Optimization
    actionPlan.push('### Phase 4: Architecture Optimization');
    actionPlan.push('');

    const criticalFiles = fileSizes?.criticalFiles || 0;
    if (criticalFiles > 0) {
      actionPlan.push('6. **Core Feature Builder** - Split oversized files');
      actionPlan.push('   ```bash');
      actionPlan.push('   Task: "Split critically oversized files into smaller modules"');
      actionPlan.push('   Read: docs/file-size-report.md');
      actionPlan.push(`   Critical Files: ${criticalFiles}`);
      actionPlan.push('   ```');
      actionPlan.push('');
    }

    // Phase 5: Final Validation
    actionPlan.push('### Phase 5: Final Validation');
    actionPlan.push('');
    actionPlan.push('7. **Quality Deployment Ready** - Final checks');
    actionPlan.push('   ```bash');
    actionPlan.push('   Task: "Use quality-deployment-ready to validate all fixes"');
    actionPlan.push('   Re-run: npx tsx scripts/agent-workflow.ts');
    actionPlan.push('   Target: Health score > 90, Build success');
    actionPlan.push('   ```');
    actionPlan.push('');

    // Current Status
    actionPlan.push('## 📊 Current Status');
    actionPlan.push('');
    actionPlan.push(`- **Health Score**: ${healthScore}/100`);
    actionPlan.push(`- **Total Errors**: ${totalErrors}`);
    actionPlan.push(`- **Security Score**: ${security?.securityScore || 0}/100`);
    actionPlan.push(`- **UI Compliance**: ${complianceRate}%`);
    actionPlan.push(`- **Can Build**: ${analysis?.projectHealth?.canBuild ? '✅' : '❌'}`);
    actionPlan.push('');

    // Top Files to Fix
    if (errorPriority?.filesByErrorCount?.length > 0) {
      actionPlan.push('## 🔥 Priority Files (Most Errors)');
      actionPlan.push('');

      for (const file of errorPriority.filesByErrorCount.slice(0, 10)) {
        actionPlan.push(`- \`${file.file}\`: ${file.errorCount} errors`);
      }
      actionPlan.push('');
    }

    // Key Recommendations
    actionPlan.push('## 💡 Key Recommendations');
    actionPlan.push('');

    const allRecommendations = [
      ...(analysis?.agentInstructions?.stepsToFix || []),
      ...(security?.recommendations || []),
      ...(compliance?.recommendations || []),
      ...(fileSizes?.recommendations || [])
    ];

    const uniqueRecs = [...new Set(allRecommendations)].slice(0, 10);
    for (const rec of uniqueRecs) {
      actionPlan.push(`- ${rec}`);
    }

    actionPlan.push('');
    actionPlan.push('## 🚀 Quick Start');
    actionPlan.push('');
    actionPlan.push('```bash');
    actionPlan.push('# Run the complete agent chain');
    actionPlan.push('Task: "Execute the agent action plan from docs/agent-action-plan.md"');
    actionPlan.push('```');
    actionPlan.push('');
    actionPlan.push('## ⚠️ Important Rules');
    actionPlan.push('');
    actionPlan.push('- **NEVER** create auto-fix scripts');
    actionPlan.push('- **NEVER** use sed/awk/perl for mass replacements');
    actionPlan.push('- **NEVER** create SQL files for database changes');
    actionPlan.push('- **ALWAYS** fix files ONE BY ONE using Edit/MultiEdit');
    actionPlan.push('- **ALWAYS** read files before editing');
    actionPlan.push('- **Maximum** 5 fixes per response');

    // Save action plan
    const actionPlanPath = path.join('docs', 'agent-action-plan.md');
    fs.writeFileSync(actionPlanPath, actionPlan.join('\n'));

    console.log(`   ✅ Action plan saved to ${actionPlanPath}`);
  }

  private loadJsonReport(filePath: string): any {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      }
    } catch (error) {
      console.error(`   Warning: Could not load ${filePath}`);
    }
    return null;
  }

  private displaySummary(): void {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);

    console.log('\n' + '=' .repeat(60));
    console.log('WORKFLOW COMPLETE');
    console.log('=' .repeat(60));

    console.log('\n📊 Analysis Results:');
    for (const [step, success] of this.results) {
      const status = success ? '✅' : '❌';
      console.log(`   ${status} ${step}`);
    }

    console.log('\n📁 Generated Reports:');
    console.log('   All reports saved in docs/ directory');

    console.log('\n⏱️ Execution Time:', elapsed, 'seconds');

    console.log('\n🎯 Next Steps:');
    console.log('   1. Review docs/agent-action-plan.md');
    console.log('   2. Execute agents in the recommended sequence');
    console.log('   3. Re-run this workflow to track progress');

    console.log('\n✨ Agents are now ready to work productively!');
    console.log('   They have detailed analysis and clear action plans.\n');
  }
}

// Run the workflow
const workflow = new AgentWorkflowOrchestrator();
workflow.run().catch(error => {
  console.error('❌ Workflow failed:', error);
  process.exit(1);
});