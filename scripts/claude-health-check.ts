#!/usr/bin/env npx tsx

/**
 * Claude Health Check
 *
 * This script runs all analyzers and generates reports for Claude agents.
 * It provides a complete picture of the project health and what needs fixing.
 *
 * Usage: npx tsx claude-health-check.ts
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

class ClaudeHealthCheck {
  async run(): Promise<void> {
    console.log('🤖 Claude Code Health Check Starting...\n');
    console.log('This will help Claude agents understand your project better.\n');

    try {
      // Step 1: Generate project tree
      console.log('📁 Step 1: Generating project structure tree...');
      await this.runCommand('npx tsx scripts/project-tree-generator.ts');
      console.log('   ✅ docs/project-tree.md created\n');

      // Step 2: Run Claude analyzer
      console.log('🔍 Step 2: Running Claude-optimized analyzer...');
      await this.runCommand('npx tsx scripts/analyzer-claude.ts');
      console.log('   ✅ docs/claude-analysis.json created');
      console.log('   ✅ docs/claude-analysis.md created\n');

      // Step 3: Read and display summary
      await this.displaySummary();

      // Step 4: Generate agent instructions
      this.generateAgentInstructions();

    } catch (error) {
      console.error('❌ Error during health check:', error);
    }
  }

  private async runCommand(command: string): Promise<void> {
    try {
      await execAsync(command, {
        maxBuffer: 50 * 1024 * 1024
      });
    } catch (error: any) {
      // Some commands exit with error code when issues found
      if (!error.stdout && !error.stderr) {
        throw error;
      }
    }
  }

  private async displaySummary(): Promise<void> {
    console.log('📊 Step 3: Reading analysis results...\n');

    if (fs.existsSync('docs/claude-analysis.json')) {
      const report = JSON.parse(fs.readFileSync('docs/claude-analysis.json', 'utf-8'));

      console.log('=' .repeat(60));
      console.log('PROJECT HEALTH SUMMARY');
      console.log('=' .repeat(60));

      console.log(`\n🏥 Health Score: ${report.projectHealth.score}/100 (${report.projectHealth.grade})`);
      console.log(`📦 Can Build: ${report.projectHealth.canBuild ? '✅ Yes' : '❌ No'}`);
      console.log(`🚀 Ready for Deployment: ${report.projectHealth.readyForDeployment ? '✅ Yes' : '❌ No'}`);

      console.log(`\n📈 Error Counts:`);
      console.log(`   - TypeScript Errors: ${report.criticalErrors.typeScript.length}`);
      console.log(`   - ESLint Errors: ${report.criticalErrors.eslint.length}`);
      console.log(`   - Build Errors: ${report.criticalErrors.build.length}`);
      console.log(`   - Total Errors: ${report.criticalErrors.total}`);

      console.log(`\n📁 Structure Issues:`);
      console.log(`   - Forbidden Directories: ${report.structureIssues.forbidden.length}`);
      console.log(`   - Missing Directories: ${report.structureIssues.missing.length}`);
      console.log(`   - Misplaced Files: ${report.structureIssues.misplaced.length}`);

      console.log('\n' + '=' .repeat(60) + '\n');
    }
  }

  private generateAgentInstructions(): void {
    console.log('🤖 INSTRUCTIONS FOR CLAUDE AGENTS');
    console.log('=' .repeat(60));

    console.log('\nTo fix all issues, run agents in this order:\n');

    console.log('1️⃣ FIRST - Check project structure:');
    console.log('   Task: "Use structure-guardian to fix structure issues"');
    console.log('   The agent will read: docs/project-tree.md\n');

    console.log('2️⃣ SECOND - Fix critical errors:');
    console.log('   Task: "Read docs/claude-analysis.md and fix top 5 critical errors"');
    console.log('   The agent will read: docs/claude-analysis.json\n');

    console.log('3️⃣ THIRD - Secure database layer:');
    console.log('   Task: "Use database-security-master to audit DAL functions"');
    console.log('   Focus on files listed in: docs/claude-analysis.md\n');

    console.log('4️⃣ FOURTH - Standardize UI:');
    console.log('   Task: "Use ui-standardizer to fix component issues"');
    console.log('   Check components listed in: docs/project-tree.md\n');

    console.log('5️⃣ FINAL - Quality check:');
    console.log('   Task: "Use quality-deployment-ready for final validation"');
    console.log('   Verify all issues from: docs/claude-analysis.md are fixed\n');

    console.log('=' .repeat(60));
    console.log('\n📝 IMPORTANT NOTES FOR CLAUDE:');
    console.log('- NEVER create auto-fix scripts');
    console.log('- Fix files ONE BY ONE using Edit tool');
    console.log('- Read files BEFORE editing');
    console.log('- Maximum 5 fixes per response');
    console.log('- Database is READ-ONLY (no SQL files)');

    console.log('\n✅ Health check complete!');
    console.log('Claude agents can now read the reports to understand what needs fixing.\n');
  }
}

// Run the health check
const healthCheck = new ClaudeHealthCheck();
healthCheck.run().catch(console.error);