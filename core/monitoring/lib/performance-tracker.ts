/**
 * Performance Tracking Library
 * Core utilities for monitoring and tracking performance metrics
 */

import type {
  PerformanceMetric,
  ServerActionMetrics,
  QueryPerformance,
  WebVitals
} from '../types'

class PerformanceTracker {
  private static instance: PerformanceTracker
  private metrics: Map<string, PerformanceMetric[]> = new Map()
  private serverActionMetrics: ServerActionMetrics[] = []
  private queryMetrics: QueryPerformance[] = []

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker()
    }
    return PerformanceTracker.instance
  }

  /**
   * Track server action execution
   */
  async trackServerAction<T>(
    actionName: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    const startMemory = process.memoryUsage().heapUsed

    try {
      const result = await fn()

      const executionTime = performance.now() - startTime
      const memoryUsed = process.memoryUsage().heapUsed - startMemory

      this.serverActionMetrics.push({
        actionName,
        executionTime,
        dbQueryTime: 0, // Will be set by query tracker
        cacheHitRate: 0, // Will be calculated
        memoryUsed,
        timestamp: Date.now(),
        success: true
      })

      // Log slow actions
      if (executionTime > 1000) {
        console.warn(`Slow server action detected: ${actionName} took ${executionTime}ms`)
      }

      return result
    } catch (error) {
      const executionTime = performance.now() - startTime

      this.serverActionMetrics.push({
        actionName,
        executionTime,
        dbQueryTime: 0,
        cacheHitRate: 0,
        memoryUsed: 0,
        timestamp: Date.now(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      throw error
    }
  }

  /**
   * Track database query performance
   */
  trackQuery(
    query: string,
    executionTime: number,
    rowsReturned: number,
    cached = false
  ): void {
    const optimized = executionTime < 100 // Consider queries under 100ms as optimized
    const suggestions: string[] = []

    // Add optimization suggestions based on performance
    if (executionTime > 500) {
      suggestions.push('Consider adding indexes')
    }
    if (rowsReturned > 1000 && !cached) {
      suggestions.push('Implement pagination or caching')
    }
    if (query.includes('SELECT *')) {
      suggestions.push('Select only required columns')
    }

    this.queryMetrics.push({
      query: query.substring(0, 100), // Store first 100 chars
      executionTime,
      rowsReturned,
      cached,
      optimized,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    })
  }

  /**
   * Track cache performance
   */
  trackCacheHit(key: string): void {
    this.recordMetric('cache.hit', 1, 'count', { key })
  }

  trackCacheMiss(key: string): void {
    this.recordMetric('cache.miss', 1, 'count', { key })
  }

  /**
   * Track bundle metrics
   */
  trackBundleLoad(route: string, size: number, loadTime: number): void {
    this.recordMetric('bundle.size', size, 'bytes', { route })
    this.recordMetric('bundle.loadTime', loadTime, 'ms', { route })
  }

  /**
   * Record a custom metric
   */
  recordMetric(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'] = 'ms',
    tags?: Record<string, string>
  ): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(metric)

    // Keep only last 1000 metrics per name
    const metrics = this.metrics.get(name)!
    if (metrics.length > 1000) {
      this.metrics.set(name, metrics.slice(-1000))
    }
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {}

    // Aggregate server action metrics
    if (this.serverActionMetrics.length > 0) {
      const recentActions = this.serverActionMetrics.slice(-100)
      summary.serverActions = {
        total: recentActions.length,
        avgExecutionTime: this.average(recentActions.map(m => m.executionTime)),
        successRate: (recentActions.filter(m => m.success).length / recentActions.length) * 100,
        slowest: recentActions.sort((a, b) => b.executionTime - a.executionTime)[0]
      }
    }

    // Aggregate query metrics
    if (this.queryMetrics.length > 0) {
      const recentQueries = this.queryMetrics.slice(-100)
      summary.queries = {
        total: recentQueries.length,
        avgExecutionTime: this.average(recentQueries.map(m => m.executionTime)),
        cacheHitRate: (recentQueries.filter(m => m.cached).length / recentQueries.length) * 100,
        optimizedRate: (recentQueries.filter(m => m.optimized).length / recentQueries.length) * 100
      }
    }

    // Aggregate cache metrics
    const cacheHits = this.metrics.get('cache.hit') || []
    const cacheMisses = this.metrics.get('cache.miss') || []
    if (cacheHits.length > 0 || cacheMisses.length > 0) {
      const totalCacheOps = cacheHits.length + cacheMisses.length
      summary.cache = {
        hitRate: totalCacheOps > 0 ? (cacheHits.length / totalCacheOps) * 100 : 0,
        totalHits: cacheHits.length,
        totalMisses: cacheMisses.length
      }
    }

    return summary
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear()
    this.serverActionMetrics = []
    this.queryMetrics = []
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      serverActions: this.serverActionMetrics,
      queries: this.queryMetrics,
      metrics: Array.from(this.metrics.entries()).map(([name, values]) => ({
        name,
        values: values.slice(-100) // Export last 100 of each metric
      }))
    }, null, 2)
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return numbers.reduce((a, b) => a + b, 0) / numbers.length
  }
}

// Export singleton instance
export const performanceTracker = PerformanceTracker.getInstance()

/**
 * Decorator for tracking server action performance
 */
export function trackPerformance(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    return performanceTracker.trackServerAction(
      `${target.constructor.name}.${propertyKey}`,
      () => originalMethod.apply(this, args)
    )
  }

  return descriptor
}

/**
 * Measure Web Vitals
 */
export function measureWebVitals(): WebVitals | null {
  if (typeof window === 'undefined') return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  const paint = performance.getEntriesByType('paint')

  const fcp = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
  const lcp = performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0

  return {
    lcp,
    fid: 0, // Will be measured on first input
    cls: 0, // Cumulative, needs observer
    fcp,
    ttfb: navigation?.responseStart - navigation?.fetchStart || 0,
    inp: 0 // Needs interaction observer
  }
}