import * as fs from 'fs';
import * as path from 'path';

interface TreeOptions {
  maxDepth?: number;
  showHidden?: boolean;
  ignorePaths?: string[];
  outputFile?: string;
}

class ProjectTreeGenerator {
  private tree: string[] = [];
  private fileCount = 0;
  private folderCount = 0;

  private readonly DEFAULT_IGNORE = [
    'node_modules',
    '.next',
    '.git',
    'dist',
    'build',
    '.turbo',
    '.vercel',
    'coverage',
    '.nyc_output',
    'out',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '.env.local',
    '.env.*.local'
  ];

  private readonly IMPORTANT_PATHS = [
    'app/(auth)',
    'app/(admin)',
    'app/(dashboard)',
    'app/(staff)',
    'app/(customer)',
    'app/(public)',
    'core/*/dal',
    'core/*/components',
    'core/*/hooks',
    'core/*/actions',
    'core/*/types',
    'components/ui'
  ];

  generateTree(rootPath: string = '.', options: TreeOptions = {}): void {
    const {
      maxDepth = 10,
      showHidden = false,
      ignorePaths = [],
      outputFile = 'docs/project-tree.md'
    } = options;

    const allIgnore = [...this.DEFAULT_IGNORE, ...ignorePaths];

    console.log('🌳 Generating project tree...\n');

    // Add header
    this.tree.push('# Project Structure\n');
    this.tree.push(`Generated: ${new Date().toISOString()}\n`);
    this.tree.push('```');
    this.tree.push(path.basename(path.resolve(rootPath)) + '/');

    // Generate tree
    this.walkDirectory(rootPath, '', 0, maxDepth, showHidden, allIgnore);

    this.tree.push('```\n');

    // Add statistics
    this.addStatistics();

    // Add structure validation
    this.validateStructure(rootPath);

    // Add important files section
    this.addImportantFiles(rootPath);

    // Save to file
    const content = this.tree.join('\n');
    fs.writeFileSync(outputFile, content);

    console.log(`✅ Project tree saved to ${outputFile}`);
    console.log(`   Files: ${this.fileCount}, Folders: ${this.folderCount}\n`);
  }

  private walkDirectory(
    dirPath: string,
    prefix: string,
    depth: number,
    maxDepth: number,
    showHidden: boolean,
    ignorePaths: string[]
  ): void {
    if (depth >= maxDepth) return;

    let items: string[];
    try {
      items = fs.readdirSync(dirPath);
    } catch (error) {
      return;
    }

    // Filter items
    items = items.filter(item => {
      if (!showHidden && item.startsWith('.')) return false;
      if (ignorePaths.some(ignore => {
        if (ignore.includes('*')) {
          const regex = new RegExp(ignore.replace('*', '.*'));
          return regex.test(item);
        }
        return item === ignore;
      })) return false;
      return true;
    });

    // Sort: directories first, then files
    items.sort((a, b) => {
      const aPath = path.join(dirPath, a);
      const bPath = path.join(dirPath, b);
      const aIsDir = fs.statSync(aPath).isDirectory();
      const bIsDir = fs.statSync(bPath).isDirectory();

      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    items.forEach((item, index) => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      const isLast = index === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const extension = isLast ? '    ' : '│   ';

      if (stats.isDirectory()) {
        this.tree.push(prefix + connector + item + '/');
        this.folderCount++;

        // Recursively walk subdirectory
        this.walkDirectory(
          itemPath,
          prefix + extension,
          depth + 1,
          maxDepth,
          showHidden,
          ignorePaths
        );
      } else {
        // Add file size for important files
        const size = this.formatFileSize(stats.size);
        const fileInfo = this.isImportantFile(item)
          ? `${item} (${size})`
          : item;

        this.tree.push(prefix + connector + fileInfo);
        this.fileCount++;
      }
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
    return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
  }

  private isImportantFile(filename: string): boolean {
    const important = [
      'package.json',
      'tsconfig.json',
      'next.config.js',
      'tailwind.config.ts',
      '.env.example',
      'database.types.ts',
      'middleware.ts'
    ];
    return important.includes(filename);
  }

  private addStatistics(): void {
    this.tree.push('## Statistics\n');
    this.tree.push(`- **Total Folders**: ${this.folderCount}`);
    this.tree.push(`- **Total Files**: ${this.fileCount}`);
    this.tree.push(`- **Total Items**: ${this.folderCount + this.fileCount}\n`);
  }

  private validateStructure(rootPath: string): void {
    this.tree.push('## Structure Validation\n');
    this.tree.push('### Required Directories\n');

    const requiredDirs = [
      'app',
      'app/(auth)',
      'app/(admin)',
      'app/(dashboard)',
      'app/(staff)',
      'app/(customer)',
      'app/(public)',
      'core',
      'components/ui',
      'lib',
      'types'
    ];

    const forbiddenDirs = [
      'src',
      'components/features',
      'app/(management)'
    ];

    requiredDirs.forEach(dir => {
      const exists = fs.existsSync(path.join(rootPath, dir));
      const status = exists ? '✅' : '❌';
      this.tree.push(`- ${status} ${dir}`);
    });

    this.tree.push('\n### Forbidden Directories\n');

    forbiddenDirs.forEach(dir => {
      const exists = fs.existsSync(path.join(rootPath, dir));
      const status = exists ? '❌ EXISTS (MUST BE REMOVED)' : '✅ Not present';
      this.tree.push(`- ${status} ${dir}`);
    });

    this.tree.push('');
  }

  private addImportantFiles(rootPath: string): void {
    this.tree.push('## Core Feature Modules\n');

    const corePath = path.join(rootPath, 'core');
    if (fs.existsSync(corePath)) {
      const features = fs.readdirSync(corePath).filter(item => {
        const itemPath = path.join(corePath, item);
        return fs.statSync(itemPath).isDirectory();
      });

      features.forEach(feature => {
        this.tree.push(`### core/${feature}/`);

        const requiredSubdirs = ['dal', 'components', 'hooks', 'actions', 'types'];
        requiredSubdirs.forEach(subdir => {
          const exists = fs.existsSync(path.join(corePath, feature, subdir));
          const status = exists ? '✅' : '❌ Missing';
          this.tree.push(`  - ${status} ${subdir}/`);
        });

        this.tree.push('');
      });
    }

    // Check for problematic files
    this.tree.push('## Potential Issues\n');

    // Check for files that are too large
    this.checkLargeFiles(rootPath);

    // Check for misplaced components
    this.checkMisplacedComponents(rootPath);
  }

  private checkLargeFiles(rootPath: string, dir: string = ''): void {
    const currentPath = path.join(rootPath, dir);

    try {
      const items = fs.readdirSync(currentPath);

      items.forEach(item => {
        if (this.DEFAULT_IGNORE.includes(item)) return;

        const itemPath = path.join(currentPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory() && !item.startsWith('.')) {
          this.checkLargeFiles(rootPath, path.join(dir, item));
        } else if (stats.isFile()) {
          // Check TypeScript/TSX files for line count
          if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            const content = fs.readFileSync(itemPath, 'utf-8');
            const lines = content.split('\n').length;

            // Check against limits
            const filePath = path.join(dir, item);

            if (filePath.startsWith('app/') && item === 'page.tsx' && lines > 50) {
              this.tree.push(`- ⚠️ Page too large: ${filePath} (${lines} lines, max 50)`);
            } else if (filePath.includes('/components/') && lines > 300) {
              this.tree.push(`- ⚠️ Component too large: ${filePath} (${lines} lines, max 300)`);
            } else if (filePath.includes('/dal/') && lines > 500) {
              this.tree.push(`- ⚠️ DAL file too large: ${filePath} (${lines} lines, max 500)`);
            }
          }
        }
      });
    } catch (error) {
      // Ignore permission errors
    }
  }

  private checkMisplacedComponents(rootPath: string): void {
    const componentsPath = path.join(rootPath, 'components');

    if (fs.existsSync(componentsPath)) {
      const checkForNonUI = (dir: string, relativePath: string = 'components') => {
        const items = fs.readdirSync(dir);

        items.forEach(item => {
          const itemPath = path.join(dir, item);
          const stats = fs.statSync(itemPath);
          const relPath = path.join(relativePath, item);

          if (stats.isDirectory()) {
            if (item !== 'ui') {
              this.tree.push(`- ⚠️ Non-UI directory in components: ${relPath}/`);
            } else {
              checkForNonUI(itemPath, relPath);
            }
          } else if (stats.isFile() && !relativePath.includes('/ui/')) {
            if (item.endsWith('.tsx') || item.endsWith('.ts')) {
              this.tree.push(`- ⚠️ Component outside ui/: ${relPath}`);
            }
          }
        });
      };

      checkForNonUI(componentsPath);
    }
  }
}

// Run the generator
const generator = new ProjectTreeGenerator();
generator.generateTree('.', {
  maxDepth: 5,
  outputFile: 'docs/project-tree.md'
});