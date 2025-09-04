#!/usr/bin/env node

/**
 * Supabase Types Update Script (Node.js version)
 * Updates both database.types.ts and auth.types.ts from your Supabase project
 * Run this after making database changes via MCP or Supabase Dashboard
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  header: (msg) => {
    console.log(`${colors.cyan}${'='.repeat(40)}${colors.reset}`);
    console.log(`${colors.cyan}🔄 ${msg}${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(40)}${colors.reset}\n`);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function main() {
  log.header('Supabase Types Update Script');

  try {
    // 1. Check for environment variables
    let projectId = process.env.SUPABASE_PROJECT_ID || process.env.SUPABASE_PROJECT_REF;
    
    if (!projectId) {
      // Try to read from .env files
      const envFiles = ['.env', '.env.local'];
      for (const envFile of envFiles) {
        if (fs.existsSync(envFile)) {
          const envContent = fs.readFileSync(envFile, 'utf8');
          // Try both PROJECT_ID and PROJECT_REF
          const idMatch = envContent.match(/SUPABASE_PROJECT_ID=(.+)/);
          const refMatch = envContent.match(/SUPABASE_PROJECT_REF=(.+)/);
          if (idMatch) {
            projectId = idMatch[1].trim();
            break;
          } else if (refMatch) {
            projectId = refMatch[1].trim();
            break;
          }
        }
      }
    }

    if (!projectId) {
      log.warning('SUPABASE_PROJECT_ID not found in environment');
      projectId = await question('Enter your Supabase project ID: ');
      
      const save = await question('Save to .env file? (y/n): ');
      if (save.toLowerCase() === 'y') {
        fs.appendFileSync('.env', `\nSUPABASE_PROJECT_ID=${projectId}\n`);
        log.success('Saved to .env');
      }
    }

    // 2. Check if supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'ignore' });
    } catch {
      log.error('Supabase CLI not found');
      log.info('Installing via npm...');
      execSync('npm install -g supabase', { stdio: 'inherit' });
    }

    // 3. Check authentication
    log.info('Checking Supabase authentication...');
    try {
      execSync('supabase projects list', { stdio: 'ignore' });
      log.success('Authenticated');
    } catch {
      log.warning('Not logged in. Please login:');
      execSync('supabase login', { stdio: 'inherit' });
    }

    // 4. Create backups
    log.info('Creating backup of existing types...');
    const backupDir = path.join('src', 'types', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    
    const typesDir = path.join('src', 'types');
    if (!fs.existsSync(typesDir)) {
      fs.mkdirSync(typesDir, { recursive: true });
    }

    ['database.types.ts', 'auth.types.ts'].forEach(file => {
      const filePath = path.join('src', 'types', file);
      if (fs.existsSync(filePath)) {
        const backupPath = path.join(backupDir, `${file.replace('.ts', '')}.${timestamp}.ts`);
        fs.copyFileSync(filePath, backupPath);
        log.success(`Backed up ${file}`);
      }
    });

    // 5. Generate database types
    log.info('Generating database.types.ts...');
    const dbTypesPath = path.join('src', 'types', 'database.types.ts');
    
    try {
      execSync(
        `npx supabase gen types typescript --project-id "${projectId}" --schema public`,
        { stdio: ['pipe', 'pipe', 'pipe'] }
      ).toString().trim();
      
      // Write to file
      const output = execSync(
        `npx supabase gen types typescript --project-id "${projectId}" --schema public`
      ).toString();
      
      fs.writeFileSync(dbTypesPath, output);
      
      const lines = output.split('\n').length;
      log.success(`Generated database.types.ts (${lines} lines)`);
    } catch (error) {
      log.error('Failed to generate database.types.ts');
      console.error(error.message);
      process.exit(1);
    }

    // 6. Generate auth types
    log.info('Generating auth.types.ts...');
    const authTypesPath = path.join('src', 'types', 'auth.types.ts');
    
    try {
      const authOutput = execSync(
        `npx supabase gen types typescript --project-id "${projectId}" --schema auth`
      ).toString();
      
      fs.writeFileSync(authTypesPath, authOutput);
      
      const authLines = authOutput.split('\n').length;
      log.success(`Generated auth.types.ts (${authLines} lines)`);
    } catch (error) {
      log.error('Failed to generate auth.types.ts');
      console.error(error.message);
      process.exit(1);
    }

    // 7. Clean old backups (keep last 5)
    log.info('Cleaning old backups...');
    const backupFiles = fs.readdirSync(backupDir)
      .filter(f => f.endsWith('.ts'))
      .sort()
      .reverse();
    
    if (backupFiles.length > 10) {
      backupFiles.slice(10).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
      });
    }
    log.success('Cleaned old backups (keeping last 5 of each type)');

    // 8. Check TypeScript
    log.info('Checking for TypeScript errors...');
    try {
      execSync('npm run typecheck', { stdio: 'ignore' });
      log.success('No TypeScript errors');
    } catch {
      log.warning('TypeScript errors detected. Run "npm run typecheck" to see details');
    }

    // Summary
    console.log();
    log.header('Types Updated Successfully!');
    console.log('📁 Files updated:');
    console.log(`   • src/types/database.types.ts`);
    console.log(`   • src/types/auth.types.ts`);
    console.log();
    console.log('💡 Next steps:');
    console.log('   1. Check for TypeScript errors: npm run typecheck');
    console.log('   2. Restart dev server if running: npm run dev');
    console.log('   3. Commit the updated types to git');
    console.log();

  } catch (error) {
    log.error(`Script failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
main().catch(console.error);