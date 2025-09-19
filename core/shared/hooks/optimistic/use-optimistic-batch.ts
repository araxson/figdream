'use client'

import { useOptimistic, useTransition, useCallback, useState, useRef } from 'react'
import { toast } from 'sonner'

export interface BatchOperation<T> {
  id: string
  type: 'create' | 'update' | 'delete'
  data: T
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error?: string
}

export interface BatchProgress {
  total: number
  completed: number
  failed: number
  percentage: number
}

export interface OptimisticBatchOptions<T> {
  onProgress?: (progress: BatchProgress) => void
  onItemComplete?: (item: T, index: number) => void
  onItemError?: (error: Error, item: T, index: number) => void
  onComplete?: (results: T[]) => void
  onError?: (error: Error) => void
  batchSize?: number
  delayBetweenBatches?: number
  showProgressToast?: boolean
  continueOnError?: boolean
}

export function useOptimisticBatch<T extends { id: string }>(
  options: OptimisticBatchOptions<T> = {}
) {
  const [operations, setOperations] = useState<BatchOperation<T>[]>([])
  const [optimisticOperations, setOptimisticOperations] = useOptimistic(
    operations,
    (
      state: BatchOperation<T>[],
      action: {
        type: 'add' | 'update-status' | 'clear'
        payload: any
      }
    ) => {
      switch (action.type) {
        case 'add':
          return [...state, ...action.payload]

        case 'update-status':
          return state.map(op =>
            op.id === action.payload.id
              ? { ...op, status: action.payload.status, error: action.payload.error }
              : op
          )

        case 'clear':
          return []

        default:
          return state
      }
    }
  )

  const [isPending, startTransition] = useTransition()
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    percentage: 0
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const updateProgress = useCallback(
    (completed: number, failed: number, total: number) => {
      const newProgress: BatchProgress = {
        total,
        completed,
        failed,
        percentage: total > 0 ? Math.round(((completed + failed) / total) * 100) : 0
      }
      setProgress(newProgress)
      options.onProgress?.(newProgress)

      if (options.showProgressToast) {
        toast.loading(`Processing... ${newProgress.percentage}%`, {
          id: 'batch-progress'
        })
      }
    },
    [options]
  )

  const processBatch = useCallback(
    async <R>(
      items: T[],
      serverAction: (items: T[]) => Promise<R[]>,
      operationType: 'create' | 'update' | 'delete' = 'update'
    ): Promise<R[]> => {
      if (items.length === 0) return []

      const batchSize = options.batchSize || 10
      const delayBetweenBatches = options.delayBetweenBatches || 100
      const continueOnError = options.continueOnError !== false

      setIsProcessing(true)
      abortControllerRef.current = new AbortController()

      // Create operations
      const ops: BatchOperation<T>[] = items.map((item, index) => ({
        id: item.id || `batch-${Date.now()}-${index}`,
        type: operationType,
        data: item,
        status: 'pending' as const
      }))

      startTransition(() => {
        setOptimisticOperations({ type: 'add', payload: ops })
      })

      const results: R[] = []
      const errors: Error[] = []

      updateProgress(0, 0, items.length)

      try {
        // Process in batches
        for (let i = 0; i < items.length; i += batchSize) {
          if (abortControllerRef.current?.signal.aborted) {
            throw new Error('Batch operation cancelled')
          }

          const batch = items.slice(i, Math.min(i + batchSize, items.length))
          const batchOps = ops.slice(i, Math.min(i + batchSize, ops.length))

          // Update status to processing
          batchOps.forEach(op => {
            startTransition(() => {
              setOptimisticOperations({
                type: 'update-status',
                payload: { id: op.id, status: 'processing' }
              })
            })
          })

          try {
            const batchResults = await serverAction(batch)
            results.push(...batchResults)

            // Update status to completed
            batchOps.forEach((op, index) => {
              startTransition(() => {
                setOptimisticOperations({
                  type: 'update-status',
                  payload: { id: op.id, status: 'completed' }
                })
              })

              options.onItemComplete?.(op.data, i + index)
            })

            updateProgress(results.length, errors.length, items.length)
          } catch (error) {
            const err = error instanceof Error ? error : new Error('Batch processing failed')
            errors.push(err)

            // Update status to failed
            batchOps.forEach((op, index) => {
              startTransition(() => {
                setOptimisticOperations({
                  type: 'update-status',
                  payload: { id: op.id, status: 'failed', error: err.message }
                })
              })

              options.onItemError?.(err, op.data, i + index)
            })

            updateProgress(results.length, errors.length, items.length)

            if (!continueOnError) {
              throw err
            }
          }

          // Delay between batches
          if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
          }
        }

        // Final update
        setOperations(ops.map(op => ({
          ...op,
          status: op.status === 'processing' ? 'completed' : op.status
        })))

        if (options.showProgressToast) {
          toast.dismiss('batch-progress')
          if (errors.length > 0) {
            toast.warning(`Completed with ${errors.length} errors`)
          } else {
            toast.success('Batch operation completed successfully')
          }
        }

        options.onComplete?.(results as any)
        return results
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Batch operation failed')

        if (options.showProgressToast) {
          toast.dismiss('batch-progress')
          toast.error(err.message)
        }

        options.onError?.(err)
        throw err
      } finally {
        setIsProcessing(false)
        abortControllerRef.current = null
      }
    },
    [options, startTransition, setOptimisticOperations, updateProgress]
  )

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      toast.info('Batch operation cancelled')
    }
  }, [])

  const clear = useCallback(() => {
    startTransition(() => {
      setOptimisticOperations({ type: 'clear', payload: null })
    })
    setOperations([])
    setProgress({
      total: 0,
      completed: 0,
      failed: 0,
      percentage: 0
    })
  }, [startTransition, setOptimisticOperations])

  const retry = useCallback(
    async <R>(
      serverAction: (items: T[]) => Promise<R[]>
    ): Promise<R[]> => {
      const failedOps = operations.filter(op => op.status === 'failed')
      if (failedOps.length === 0) {
        toast.info('No failed operations to retry')
        return []
      }

      const items = failedOps.map(op => op.data)
      return processBatch(items, serverAction, 'update')
    },
    [operations, processBatch]
  )

  return {
    operations: optimisticOperations,
    progress,
    isProcessing: isProcessing || isPending,
    actions: {
      processBatch,
      cancel,
      clear,
      retry
    }
  }
}

// Specialized hook for bulk updates
export function useOptimisticBulkUpdate<T extends { id: string }>(
  options: OptimisticBatchOptions<T> = {}
) {
  const batch = useOptimisticBatch(options)

  const bulkUpdate = useCallback(
    async (
      items: T[],
      serverAction: (items: T[]) => Promise<T[]>
    ) => {
      return batch.actions.processBatch(items, serverAction, 'update')
    },
    [batch.actions]
  )

  return {
    ...batch,
    bulkUpdate
  }
}

// Specialized hook for bulk deletion
export function useOptimisticBulkDelete<T extends { id: string }>(
  options: OptimisticBatchOptions<T> = {}
) {
  const batch = useOptimisticBatch(options)

  const bulkDelete = useCallback(
    async (
      items: T[],
      serverAction: (ids: string[]) => Promise<void>
    ) => {
      const ids = items.map(item => item.id)
      return batch.actions.processBatch(
        items,
        async () => {
          await serverAction(ids)
          return []
        },
        'delete'
      )
    },
    [batch.actions]
  )

  return {
    ...batch,
    bulkDelete
  }
}