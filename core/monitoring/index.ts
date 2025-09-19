/**
 * Performance Monitoring and Optimization Module
 * Comprehensive performance tracking, caching, and optimization utilities
 */

// Export all types
export * from './types'

// Export performance tracking utilities
export { performanceTracker, trackPerformance, measureWebVitals } from './lib/performance-tracker'

// Export cache management
export { cacheManager, createCachedFunction, cached } from './lib/cache-manager'

// Export query optimization
export { queryOptimizer } from './lib/query-optimizer'

// Export batch processing
export { batchProcessor, batched, batchMap, batchFilter } from './lib/batch-processor'

// Export streaming utilities
export {
  createReadableStream,
  streamDataInChunks,
  streamDatabaseResults,
  createStreamingResponse,
  transformStream,
  filterStream,
  aggregateStream,
  streamWithProgress,
  parallelStreamProcess,
  createNDJSONStream,
  createSSEStream,
  consumeStream
} from './lib/streaming-utils'

// Export connection pool
export {
  connectionPool,
  usePooledConnection,
  executeWithPool,
  transactionWithPool
} from './lib/connection-pool'

// Export React component
export { PerformanceMonitor } from './performance-monitor'

/**
 * Quick Start Guide
 *
 * 1. Track Server Actions:
 * ```typescript
 * import { performanceTracker } from '@/core/monitoring'
 *
 * export async function myServerAction() {
 *   return performanceTracker.trackServerAction('myAction', async () => {
 *     // Your action logic here
 *   })
 * }
 * ```
 *
 * 2. Cache Data:
 * ```typescript
 * import { cacheManager } from '@/core/monitoring'
 *
 * const data = await cacheManager.getOrSet(
 *   'my-key',
 *   () => fetchExpensiveData(),
 *   { ttl: 60000, staleWhileRevalidate: true }
 * )
 * ```
 *
 * 3. Batch Operations:
 * ```typescript
 * import { batchProcessor } from '@/core/monitoring'
 *
 * const batchedFn = batchProcessor.createBatchedFunction(
 *   myExpensiveOperation,
 *   { maxBatchSize: 10 }
 * )
 * ```
 *
 * 4. Stream Large Data:
 * ```typescript
 * import { streamDataInChunks } from '@/core/monitoring'
 *
 * const stream = streamDataInChunks(largeArray, 100)
 * for await (const chunk of stream) {
 *   // Process chunk
 * }
 * ```
 *
 * 5. Use Connection Pool:
 * ```typescript
 * import { executeWithPool } from '@/core/monitoring'
 *
 * const result = await executeWithPool(async (client) => {
 *   return client.from('table').select('*')
 * })
 * ```
 */

/**
 * Performance Optimization Checklist
 *
 * ✅ Server Actions:
 * - [ ] Implement performance tracking
 * - [ ] Add caching for expensive operations
 * - [ ] Use batch processing for bulk operations
 * - [ ] Implement streaming for large datasets
 *
 * ✅ Database Queries:
 * - [ ] Use connection pooling
 * - [ ] Implement query result caching
 * - [ ] Add indexes for frequently queried columns
 * - [ ] Use cursor-based pagination
 *
 * ✅ Caching Strategy:
 * - [ ] Implement stale-while-revalidate
 * - [ ] Use smart cache invalidation
 * - [ ] Monitor cache hit rates
 * - [ ] Implement cache warming
 *
 * ✅ Bundle Optimization:
 * - [ ] Implement code splitting
 * - [ ] Lazy load components
 * - [ ] Optimize images
 * - [ ] Monitor bundle sizes
 *
 * ✅ Monitoring:
 * - [ ] Track Core Web Vitals
 * - [ ] Monitor server action performance
 * - [ ] Track database query times
 * - [ ] Generate performance reports
 */