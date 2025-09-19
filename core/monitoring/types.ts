/**
 * Performance Monitoring Types
 * Comprehensive type definitions for performance tracking and optimization
 */

export interface PerformanceMetric {
  name: string
  value: number
  unit: 'ms' | 'bytes' | 'count' | 'percent'
  timestamp: number
  tags?: Record<string, string>
}

export interface ServerActionMetrics {
  actionName: string
  executionTime: number
  dbQueryTime: number
  cacheHitRate: number
  memoryUsed: number
  timestamp: number
  success: boolean
  error?: string
}

export interface QueryPerformance {
  query: string
  executionTime: number
  rowsReturned: number
  cached: boolean
  optimized: boolean
  suggestions?: string[]
}

export interface CacheMetrics {
  hitRate: number
  missRate: number
  evictionRate: number
  totalKeys: number
  memoryUsed: number
  ttlStats: {
    min: number
    max: number
    avg: number
  }
}

export interface BundleMetrics {
  route: string
  jsSize: number
  cssSize: number
  imageSize: number
  totalSize: number
  loadTime: number
  chunks: {
    name: string
    size: number
    cached: boolean
  }[]
}

export interface WebVitals {
  lcp: number // Largest Contentful Paint
  fid: number // First Input Delay
  cls: number // Cumulative Layout Shift
  fcp: number // First Contentful Paint
  ttfb: number // Time to First Byte
  inp: number // Interaction to Next Paint
}

export interface PerformanceReport {
  timestamp: number
  serverActions: ServerActionMetrics[]
  queries: QueryPerformance[]
  cache: CacheMetrics
  bundles: BundleMetrics[]
  webVitals: WebVitals
  recommendations: string[]
}

export interface OptimizationConfig {
  caching: {
    enabled: boolean
    ttl: number
    maxKeys: number
    evictionPolicy: 'lru' | 'lfu' | 'fifo'
  }
  queries: {
    timeout: number
    maxRetries: number
    connectionPoolSize: number
    statementCacheSize: number
  }
  batching: {
    enabled: boolean
    maxBatchSize: number
    maxWaitTime: number
  }
  streaming: {
    enabled: boolean
    chunkSize: number
  }
}

export interface CacheStrategy {
  key: string
  ttl: number
  tags: string[]
  revalidate?: number
  staleWhileRevalidate?: boolean
}

export interface BatchOperation<T> {
  id: string
  operation: () => Promise<T>
  priority: number
  maxRetries: number
  timeout: number
}

export interface StreamingResponse<T> {
  data: ReadableStream<T>
  metadata: {
    totalItems: number
    chunkSize: number
    contentType: string
  }
}