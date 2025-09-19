/**
 * Batch Processor
 * Efficiently batch multiple operations to reduce overhead
 */

import type { BatchOperation } from '../types'

interface BatchResult<T> {
  id: string
  success: boolean
  data?: T
  error?: Error
}

export class BatchProcessor {
  private static instance: BatchProcessor
  private queues = new Map<string, BatchOperation<any>[]>()
  private processing = new Map<string, boolean>()
  private results = new Map<string, BatchResult<any>[]>()

  private readonly DEFAULT_BATCH_SIZE = 10
  private readonly DEFAULT_WAIT_TIME = 100 // ms

  private constructor() {}

  static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor()
    }
    return BatchProcessor.instance
  }

  /**
   * Add operation to batch queue
   */
  async add<T>(
    queueName: string,
    operation: BatchOperation<T>
  ): Promise<T> {
    // Initialize queue if needed
    if (!this.queues.has(queueName)) {
      this.queues.set(queueName, [])
    }

    // Add to queue
    this.queues.get(queueName)!.push(operation)

    // Start processing if not already running
    if (!this.processing.get(queueName)) {
      this.scheduleProcessing(queueName)
    }

    // Wait for result
    return this.waitForResult(operation.id)
  }

  /**
   * Schedule batch processing
   */
  private scheduleProcessing(queueName: string): void {
    this.processing.set(queueName, true)

    setTimeout(() => {
      this.processBatch(queueName)
    }, this.DEFAULT_WAIT_TIME)
  }

  /**
   * Process a batch of operations
   */
  private async processBatch(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName)
    if (!queue || queue.length === 0) {
      this.processing.set(queueName, false)
      return
    }

    // Take batch
    const batch = queue.splice(0, this.DEFAULT_BATCH_SIZE)

    // Sort by priority
    batch.sort((a, b) => b.priority - a.priority)

    // Process in parallel with timeout
    const results = await Promise.allSettled(
      batch.map(op => this.executeWithTimeout(op))
    )

    // Store results
    const batchResults: BatchResult<any>[] = results.map((result, index) => {
      const op = batch[index]

      if (result.status === 'fulfilled') {
        return {
          id: op.id,
          success: true,
          data: result.value
        }
      } else {
        return {
          id: op.id,
          success: false,
          error: result.reason
        }
      }
    })

    // Store results for retrieval
    if (!this.results.has(queueName)) {
      this.results.set(queueName, [])
    }
    this.results.get(queueName)!.push(...batchResults)

    // Continue processing if more items in queue
    if (this.queues.get(queueName)!.length > 0) {
      this.scheduleProcessing(queueName)
    } else {
      this.processing.set(queueName, false)
    }
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    operation: BatchOperation<T>
  ): Promise<T> {
    return Promise.race([
      operation.operation(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Operation timeout: ${operation.id}`)),
          operation.timeout
        )
      )
    ])
  }

  /**
   * Wait for operation result
   */
  private async waitForResult<T>(operationId: string): Promise<T> {
    const maxWait = 30000 // 30 seconds max wait
    const checkInterval = 100 // Check every 100ms
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      // Check all result queues
      for (const [, results] of this.results) {
        const result = results.find(r => r.id === operationId)
        if (result) {
          // Remove from results
          const index = results.indexOf(result)
          results.splice(index, 1)

          if (result.success) {
            return result.data as T
          } else {
            throw result.error || new Error('Operation failed')
          }
        }
      }

      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, checkInterval))
    }

    throw new Error(`Operation timeout: ${operationId}`)
  }

  /**
   * Create a batched function
   */
  createBatchedFunction<TArgs extends any[], TResult>(
    fn: (...args: TArgs) => Promise<TResult>,
    options?: {
      maxBatchSize?: number
      maxWaitTime?: number
      queueName?: string
    }
  ): (...args: TArgs) => Promise<TResult> {
    const queueName = options?.queueName || fn.name || 'default'

    return async (...args: TArgs): Promise<TResult> => {
      const operationId = `${queueName}-${Date.now()}-${Math.random()}`

      const operation: BatchOperation<TResult> = {
        id: operationId,
        operation: () => fn(...args),
        priority: 1,
        maxRetries: 3,
        timeout: 5000
      }

      return this.add(queueName, operation)
    }
  }

  /**
   * Process database operations in batch
   */
  async batchDatabaseOperations<T>(
    operations: Array<() => Promise<T>>
  ): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
    const batchSize = 5 // Process 5 at a time for database operations

    const results: Array<{ success: boolean; data?: T; error?: Error }> = []

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize)

      const batchResults = await Promise.allSettled(
        batch.map(op => op())
      )

      results.push(...batchResults.map(result => {
        if (result.status === 'fulfilled') {
          return { success: true, data: result.value }
        } else {
          return { success: false, error: result.reason }
        }
      }))
    }

    return results
  }

  /**
   * Clear all queues and results
   */
  clear(): void {
    this.queues.clear()
    this.processing.clear()
    this.results.clear()
  }

  /**
   * Get queue statistics
   */
  getStats(): Record<string, any> {
    const stats: Record<string, any> = {}

    for (const [name, queue] of this.queues) {
      stats[name] = {
        pending: queue.length,
        processing: this.processing.get(name) || false,
        results: this.results.get(name)?.length || 0
      }
    }

    return stats
  }
}

export const batchProcessor = BatchProcessor.getInstance()

/**
 * Decorator for batching method calls
 */
export function batched(options?: {
  maxBatchSize?: number
  maxWaitTime?: number
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = batchProcessor.createBatchedFunction(
      originalMethod,
      {
        ...options,
        queueName: `${target.constructor.name}.${propertyKey}`
      }
    )

    return descriptor
  }
}

/**
 * Utility to batch array operations efficiently
 */
export async function batchMap<T, R>(
  items: T[],
  mapper: (item: T) => Promise<R>,
  batchSize = 10
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(mapper))
    results.push(...batchResults)
  }

  return results
}

/**
 * Utility to batch filter operations
 */
export async function batchFilter<T>(
  items: T[],
  predicate: (item: T) => Promise<boolean>,
  batchSize = 10
): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const predicates = await Promise.all(batch.map(predicate))

    batch.forEach((item, index) => {
      if (predicates[index]) {
        results.push(item)
      }
    })
  }

  return results
}