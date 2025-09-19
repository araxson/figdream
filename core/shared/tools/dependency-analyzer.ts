// Core Module Dependency Analyzer
// Provides tools for analyzing and optimizing module dependencies

export interface ModuleDependency {
  moduleName: string;
  importedFrom: string;
  importPath: string;
  importType: 'component' | 'dal' | 'action' | 'hook' | 'type' | 'util';
  lineNumber?: number;
  fileName: string;
}

export interface DependencyGraph {
  modules: string[];
  dependencies: Record<string, string[]>;
  circularDependencies: string[][];
  sharedUtilities: string[];
  hotspots: Array<{
    module: string;
    dependencyCount: number;
    dependents: string[];
  }>;
}

export interface ArchitectureMetrics {
  totalModules: number;
  averageDependencies: number;
  maxDependencies: number;
  circularDependencyCount: number;
  sharedUtilityUsage: Record<string, number>;
  moduleCompliance: Record<string, {
    hasBarrelExport: boolean;
    hasDalLayer: boolean;
    hasTypes: boolean;
    hasComponents: boolean;
    properFileExtensions: boolean;
  }>;
}

/**
 * Analyzes dependencies between core modules
 */
export class DependencyAnalyzer {
  private dependencies: ModuleDependency[] = [];
  private graph: DependencyGraph | null = null;

  /**
   * Add dependency to the analysis
   */
  addDependency(dependency: ModuleDependency): void {
    this.dependencies.push(dependency);
    this.graph = null; // Invalidate cached graph
  }

  /**
   * Analyze all dependencies and build dependency graph
   */
  buildDependencyGraph(): DependencyGraph {
    if (this.graph) return this.graph;

    const modules = new Set<string>();
    const dependencies: Record<string, Set<string>> = {};

    // Build dependency map
    for (const dep of this.dependencies) {
      modules.add(dep.moduleName);
      modules.add(dep.importedFrom);

      if (!dependencies[dep.moduleName]) {
        dependencies[dep.moduleName] = new Set();
      }
      dependencies[dep.moduleName].add(dep.importedFrom);
    }

    // Convert to arrays
    const dependencyMap: Record<string, string[]> = {};
    for (const [module, deps] of Object.entries(dependencies)) {
      dependencyMap[module] = Array.from(deps);
    }

    this.graph = {
      modules: Array.from(modules),
      dependencies: dependencyMap,
      circularDependencies: this.findCircularDependencies(dependencyMap),
      sharedUtilities: this.identifySharedUtilities(),
      hotspots: this.identifyDependencyHotspots(dependencyMap)
    };

    return this.graph;
  }

  /**
   * Find circular dependencies using DFS
   */
  private findCircularDependencies(deps: Record<string, string[]>): string[][] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        // Found cycle
        const cycleStart = path.indexOf(node);
        cycles.push([...path.slice(cycleStart), node]);
        return;
      }

      if (visited.has(node)) return;

      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = deps[node] || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, [...path]);
      }

      recursionStack.delete(node);
    };

    for (const module of Object.keys(deps)) {
      if (!visited.has(module)) {
        dfs(module, []);
      }
    }

    return cycles;
  }

  /**
   * Identify shared utilities based on usage frequency
   */
  private identifySharedUtilities(): string[] {
    const utilityUsage = new Map<string, number>();

    for (const dep of this.dependencies) {
      if (dep.importedFrom.includes('/shared/') ||
          dep.importedFrom.includes('/ui/') ||
          dep.importType === 'util') {
        const count = utilityUsage.get(dep.importedFrom) || 0;
        utilityUsage.set(dep.importedFrom, count + 1);
      }
    }

    // Return utilities used by 3+ modules
    return Array.from(utilityUsage.entries())
      .filter(([, count]) => count >= 3)
      .map(([utility]) => utility);
  }

  /**
   * Identify modules with high dependency counts (potential refactoring targets)
   */
  private identifyDependencyHotspots(deps: Record<string, string[]>): Array<{
    module: string;
    dependencyCount: number;
    dependents: string[];
  }> {
    const dependents: Record<string, string[]> = {};

    // Build reverse dependency map
    for (const [module, moduleDeps] of Object.entries(deps)) {
      for (const dep of moduleDeps) {
        if (!dependents[dep]) dependents[dep] = [];
        dependents[dep].push(module);
      }
    }

    return Object.entries(deps)
      .map(([module, moduleDeps]) => ({
        module,
        dependencyCount: moduleDeps.length,
        dependents: dependents[module] || []
      }))
      .filter(item => item.dependencyCount > 5 || item.dependents.length > 5)
      .sort((a, b) => b.dependencyCount - a.dependencyCount);
  }

  /**
   * Generate architecture metrics
   */
  generateMetrics(): ArchitectureMetrics {
    const graph = this.buildDependencyGraph();
    const dependencyCounts = Object.values(graph.dependencies).map(deps => deps.length);

    const sharedUtilityUsage: Record<string, number> = {};
    for (const utility of graph.sharedUtilities) {
      sharedUtilityUsage[utility] = this.dependencies.filter(
        dep => dep.importedFrom === utility
      ).length;
    }

    return {
      totalModules: graph.modules.length,
      averageDependencies: dependencyCounts.reduce((a, b) => a + b, 0) / dependencyCounts.length,
      maxDependencies: Math.max(...dependencyCounts),
      circularDependencyCount: graph.circularDependencies.length,
      sharedUtilityUsage,
      moduleCompliance: this.assessModuleCompliance()
    };
  }

  /**
   * Assess module compliance with Core Module Pattern
   */
  private assessModuleCompliance(): Record<string, {
    hasBarrelExport: boolean;
    hasDalLayer: boolean;
    hasTypes: boolean;
    hasComponents: boolean;
    properFileExtensions: boolean;
  }> {
    // This would be implemented to scan file system
    // For now, return placeholder
    return {};
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(): string[] {
    const graph = this.buildDependencyGraph();
    const metrics = this.generateMetrics();
    const recommendations: string[] = [];

    // Check for circular dependencies
    if (graph.circularDependencies.length > 0) {
      recommendations.push(
        `🔄 Found ${graph.circularDependencies.length} circular dependencies that need resolution`
      );
    }

    // Check for modules with too many dependencies
    const heavyModules = graph.hotspots.filter(h => h.dependencyCount > 8);
    if (heavyModules.length > 0) {
      recommendations.push(
        `📦 ${heavyModules.length} modules exceed 8 dependencies and should be split`
      );
    }

    // Check for underutilized shared utilities
    const underutilizedUtils = Object.entries(metrics.sharedUtilityUsage)
      .filter(([, count]) => count < 3);
    if (underutilizedUtils.length > 0) {
      recommendations.push(
        `♻️ Consider consolidating ${underutilizedUtils.length} underutilized shared utilities`
      );
    }

    // Check for missing shared utilities (code duplication)
    const potentialShared = this.identifyPotentialSharedUtilities();
    if (potentialShared.length > 0) {
      recommendations.push(
        `🔧 ${potentialShared.length} utilities could be extracted to shared modules`
      );
    }

    return recommendations;
  }

  /**
   * Identify potential shared utilities based on similar imports
   */
  private identifyPotentialSharedUtilities(): string[] {
    const importCounts = new Map<string, number>();

    for (const dep of this.dependencies) {
      if (!dep.importedFrom.includes('/shared/') &&
          !dep.importedFrom.includes('/ui/')) {
        const count = importCounts.get(dep.importPath) || 0;
        importCounts.set(dep.importPath, count + 1);
      }
    }

    return Array.from(importCounts.entries())
      .filter(([, count]) => count >= 3)
      .map(([importPath]) => importPath);
  }

  /**
   * Generate dependency visualization data
   */
  generateVisualizationData(): {
    nodes: Array<{ id: string; type: string; size: number }>;
    edges: Array<{ source: string; target: string; type: string }>;
  } {
    const graph = this.buildDependencyGraph();

    const nodes = graph.modules.map(module => ({
      id: module,
      type: this.getModuleType(module),
      size: (graph.dependencies[module] || []).length + 1
    }));

    const edges: Array<{ source: string; target: string; type: string }> = [];
    for (const [source, targets] of Object.entries(graph.dependencies)) {
      for (const target of targets) {
        edges.push({
          source,
          target,
          type: this.getDependencyType(source, target)
        });
      }
    }

    return { nodes, edges };
  }

  private getModuleType(module: string): string {
    if (module.includes('/shared/')) return 'shared';
    if (module.includes('/ui/')) return 'ui';
    if (module.includes('/auth/')) return 'auth';
    return 'feature';
  }

  private getDependencyType(source: string, target: string): string {
    if (target.includes('/shared/')) return 'shared';
    if (target.includes('/ui/')) return 'ui';
    if (target.includes('/auth/')) return 'auth';
    return 'feature';
  }
}

/**
 * Factory function to create dependency analyzer from file system scan
 */
export async function createDependencyAnalyzer(rootPath: string): Promise<DependencyAnalyzer> {
  const analyzer = new DependencyAnalyzer();

  // This would scan the file system and populate dependencies
  // Implementation would use fs/glob to scan files and parse imports

  return analyzer;
}

/**
 * Performance optimization utilities
 */
export class PerformanceOptimizer {
  /**
   * Generate lazy loading configuration
   */
  static generateLazyLoadingConfig(dependencies: ModuleDependency[]): Record<string, {
    component: string;
    lazyImport: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const config: Record<string, any> = {};

    // Identify heavy components that should be lazy loaded
    const componentUsage = new Map<string, number>();

    for (const dep of dependencies) {
      if (dep.importType === 'component') {
        const count = componentUsage.get(dep.importPath) || 0;
        componentUsage.set(dep.importPath, count + 1);
      }
    }

    // Components used in fewer places are good candidates for lazy loading
    for (const [component, usage] of componentUsage.entries()) {
      if (usage <= 2) { // Used in 2 or fewer places
        const moduleName = component.split('/').slice(-2, -1)[0];
        config[moduleName] = {
          component,
          lazyImport: `const ${moduleName} = lazy(() => import('${component}'))`,
          priority: usage === 1 ? 'low' : 'medium'
        };
      }
    }

    return config;
  }

  /**
   * Generate code splitting boundaries
   */
  static generateCodeSplittingConfig(modules: string[]): Record<string, {
    chunks: string[];
    priority: number;
    enforce: 'pre' | 'normal' | 'post';
  }> {
    return {
      'vendor': {
        chunks: ['react', 'react-dom', 'next'],
        priority: 10,
        enforce: 'pre'
      },
      'shared': {
        chunks: modules.filter(m => m.includes('/shared/')),
        priority: 8,
        enforce: 'pre'
      },
      'ui': {
        chunks: modules.filter(m => m.includes('/ui/')),
        priority: 6,
        enforce: 'normal'
      },
      'auth': {
        chunks: modules.filter(m => m.includes('/auth/')),
        priority: 5,
        enforce: 'normal'
      },
      'features': {
        chunks: modules.filter(m => !m.includes('/shared/') && !m.includes('/ui/') && !m.includes('/auth/')),
        priority: 1,
        enforce: 'post'
      }
    };
  }
}