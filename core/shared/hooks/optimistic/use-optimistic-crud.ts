'use client'

import { useOptimistic, useTransition, useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface OptimisticCrudOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: () => void
  rollbackDelay?: number
  retryAttempts?: number
  retryDelay?: number
}

export interface OptimisticCrudState<T> {
  items: T[]
  isUpdating: boolean
  error: Error | null
  lastAction: 'create' | 'update' | 'delete' | null
  lastActionId: string | null
}

interface IdentifiableItem {
  id: string
  [key: string]: any
}

export function useOptimisticCrud<T extends IdentifiableItem>(
  initialItems: T[],
  options: OptimisticCrudOptions<T> = {}
) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (state: T[], action: { type: 'create' | 'update' | 'delete'; payload: T }) => {
      switch (action.type) {
        case 'create':
          return [...state, action.payload]
        case 'update':
          return state.map(item =>
            item.id === action.payload.id ? { ...item, ...action.payload } : item
          )
        case 'delete':
          return state.filter(item => item.id !== action.payload.id)
        default:
          return state
      }
    }
  )

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)
  const [lastAction, setLastAction] = useState<'create' | 'update' | 'delete' | null>(null)
  const [lastActionId, setLastActionId] = useState<string | null>(null)

  const executeWithRetry = async (
    fn: () => Promise<T>,
    attempts = options.retryAttempts || 3,
    delay = options.retryDelay || 1000
  ): Promise<T> => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === attempts - 1) throw error
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
      }
    }
    throw new Error('Max retry attempts reached')
  }

  const create = useCallback(
    async (
      newItem: Omit<T, 'id'>,
      serverAction: (item: Omit<T, 'id'>) => Promise<T>
    ) => {
      const tempId = `temp-${Date.now()}`
      const optimisticItem = { ...newItem, id: tempId } as T

      setError(null)
      setLastAction('create')
      setLastActionId(tempId)

      startTransition(() => {
        setOptimisticItems({ type: 'create', payload: optimisticItem })
      })

      try {
        const result = await executeWithRetry(() => serverAction(newItem))

        // Replace optimistic item with real item
        setItems(prev => [
          ...prev.filter(item => item.id !== tempId),
          result
        ])

        toast.success('Item created successfully')
        options.onSuccess?.(result)
        return result
      } catch (error) {
        // Rollback optimistic update
        setItems(prev => prev.filter(item => item.id !== tempId))

        const err = error instanceof Error ? error : new Error('Create failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)
        throw err
      } finally {
        options.onSettled?.()
      }
    },
    [options, startTransition, setOptimisticItems]
  )

  const update = useCallback(
    async (
      id: string,
      updates: Partial<T>,
      serverAction: (id: string, updates: Partial<T>) => Promise<T>
    ) => {
      const originalItem = items.find(item => item.id === id)
      if (!originalItem) {
        throw new Error('Item not found')
      }

      setError(null)
      setLastAction('update')
      setLastActionId(id)

      const optimisticItem = { ...originalItem, ...updates }

      startTransition(() => {
        setOptimisticItems({ type: 'update', payload: optimisticItem })
      })

      try {
        const result = await executeWithRetry(() => serverAction(id, updates))

        // Update with server response
        setItems(prev => prev.map(item =>
          item.id === id ? result : item
        ))

        toast.success('Item updated successfully')
        options.onSuccess?.(result)
        return result
      } catch (error) {
        // Rollback to original
        setItems(prev => prev.map(item =>
          item.id === id ? originalItem : item
        ))

        const err = error instanceof Error ? error : new Error('Update failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)
        throw err
      } finally {
        options.onSettled?.()
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  const remove = useCallback(
    async (
      id: string,
      serverAction: (id: string) => Promise<void>
    ) => {
      const originalItem = items.find(item => item.id === id)
      if (!originalItem) {
        throw new Error('Item not found')
      }

      setError(null)
      setLastAction('delete')
      setLastActionId(id)

      startTransition(() => {
        setOptimisticItems({ type: 'delete', payload: originalItem })
      })

      try {
        await executeWithRetry(() => serverAction(id))

        // Confirm deletion
        setItems(prev => prev.filter(item => item.id !== id))

        toast.success('Item deleted successfully')
        options.onSuccess?.(originalItem)
      } catch (error) {
        // Rollback deletion
        setItems(prev => {
          const exists = prev.some(item => item.id === id)
          if (!exists) {
            return [...prev, originalItem]
          }
          return prev
        })

        const err = error instanceof Error ? error : new Error('Delete failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)
        throw err
      } finally {
        options.onSettled?.()
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  const refresh = useCallback(
    async (fetchFn: () => Promise<T[]>) => {
      try {
        const freshData = await fetchFn()
        setItems(freshData)
        setError(null)
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Refresh failed')
        setError(err)
        toast.error('Failed to refresh data')
      }
    },
    []
  )

  return {
    items: optimisticItems,
    isUpdating: isPending,
    error,
    lastAction,
    lastActionId,
    actions: {
      create,
      update,
      remove,
      refresh
    }
  }
}