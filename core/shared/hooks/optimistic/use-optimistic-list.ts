'use client'

import { useOptimistic, useTransition, useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface ListItem {
  id: string
  order?: number
  [key: string]: any
}

export interface OptimisticListOptions<T> {
  onSuccess?: (items: T[]) => void
  onError?: (error: Error) => void
  enableReordering?: boolean
  enableBatchOperations?: boolean
}

export function useOptimisticList<T extends ListItem>(
  initialItems: T[],
  options: OptimisticListOptions<T> = {}
) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [optimisticItems, setOptimisticItems] = useOptimistic(
    items,
    (
      state: T[],
      action: {
        type: 'add' | 'remove' | 'reorder' | 'batch-add' | 'batch-remove' | 'batch-update'
        payload: any
      }
    ) => {
      switch (action.type) {
        case 'add':
          return [...state, action.payload]

        case 'remove':
          return state.filter(item => item.id !== action.payload)

        case 'reorder':
          const { fromIndex, toIndex } = action.payload
          const newItems = [...state]
          const [movedItem] = newItems.splice(fromIndex, 1)
          newItems.splice(toIndex, 0, movedItem)
          return newItems.map((item, index) => ({
            ...item,
            order: index
          }))

        case 'batch-add':
          return [...state, ...action.payload]

        case 'batch-remove':
          const idsToRemove = new Set(action.payload)
          return state.filter(item => !idsToRemove.has(item.id))

        case 'batch-update':
          const updates = new Map(action.payload.map((item: T) => [item.id, item]))
          return state.map(item =>
            updates.has(item.id) ? { ...item, ...updates.get(item.id) } : item
          )

        default:
          return state
      }
    }
  )

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)

  const add = useCallback(
    async (
      item: Omit<T, 'id'>,
      serverAction: (item: Omit<T, 'id'>) => Promise<T>
    ) => {
      const tempId = `temp-${Date.now()}`
      const optimisticItem = { ...item, id: tempId } as T

      setError(null)

      startTransition(() => {
        setOptimisticItems({ type: 'add', payload: optimisticItem })
      })

      try {
        const result = await serverAction(item)

        // Replace temp item with real item
        setItems(prev => [
          ...prev.filter(i => i.id !== tempId),
          result
        ])

        toast.success('Item added successfully')
        options.onSuccess?.([...items, result])

        return result
      } catch (error) {
        // Remove optimistic item
        setItems(prev => prev.filter(i => i.id !== tempId))

        const err = error instanceof Error ? error : new Error('Add failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)

        throw err
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  const remove = useCallback(
    async (
      id: string,
      serverAction: (id: string) => Promise<void>
    ) => {
      const originalItems = [...items]

      setError(null)

      startTransition(() => {
        setOptimisticItems({ type: 'remove', payload: id })
      })

      try {
        await serverAction(id)

        // Confirm removal
        setItems(prev => prev.filter(item => item.id !== id))

        toast.success('Item removed successfully')
        options.onSuccess?.(items.filter(item => item.id !== id))
      } catch (error) {
        // Restore original items
        setItems(originalItems)

        const err = error instanceof Error ? error : new Error('Remove failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)

        throw err
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  const reorder = useCallback(
    async (
      fromIndex: number,
      toIndex: number,
      serverAction: (items: T[]) => Promise<T[]>
    ) => {
      if (!options.enableReordering) {
        throw new Error('Reordering is not enabled')
      }

      const originalItems = [...items]

      setError(null)

      startTransition(() => {
        setOptimisticItems({ type: 'reorder', payload: { fromIndex, toIndex } })
      })

      try {
        // Create reordered array
        const reorderedItems = [...items]
        const [movedItem] = reorderedItems.splice(fromIndex, 1)
        reorderedItems.splice(toIndex, 0, movedItem)

        // Update order properties
        const itemsWithOrder = reorderedItems.map((item, index) => ({
          ...item,
          order: index
        }))

        const result = await serverAction(itemsWithOrder)

        setItems(result)
        toast.success('Items reordered successfully')
        options.onSuccess?.(result)

        return result
      } catch (error) {
        // Restore original order
        setItems(originalItems)

        const err = error instanceof Error ? error : new Error('Reorder failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)

        throw err
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  const batchAdd = useCallback(
    async (
      newItems: Omit<T, 'id'>[],
      serverAction: (items: Omit<T, 'id'>[]) => Promise<T[]>
    ) => {
      if (!options.enableBatchOperations) {
        throw new Error('Batch operations are not enabled')
      }

      const tempItems = newItems.map((item, index) => ({
        ...item,
        id: `temp-batch-${Date.now()}-${index}`
      })) as T[]

      setError(null)

      startTransition(() => {
        setOptimisticItems({ type: 'batch-add', payload: tempItems })
      })

      try {
        const results = await serverAction(newItems)

        // Replace temp items with real items
        setItems(prev => [
          ...prev.filter(item => !item.id.startsWith('temp-batch-')),
          ...results
        ])

        toast.success(`${results.length} items added successfully`)
        options.onSuccess?.([...items, ...results])

        return results
      } catch (error) {
        // Remove temp items
        setItems(prev =>
          prev.filter(item => !item.id.startsWith('temp-batch-'))
        )

        const err = error instanceof Error ? error : new Error('Batch add failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)

        throw err
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  const batchRemove = useCallback(
    async (
      ids: string[],
      serverAction: (ids: string[]) => Promise<void>
    ) => {
      if (!options.enableBatchOperations) {
        throw new Error('Batch operations are not enabled')
      }

      const originalItems = [...items]

      setError(null)

      startTransition(() => {
        setOptimisticItems({ type: 'batch-remove', payload: ids })
      })

      try {
        await serverAction(ids)

        // Confirm removal
        const idsSet = new Set(ids)
        setItems(prev => prev.filter(item => !idsSet.has(item.id)))

        toast.success(`${ids.length} items removed successfully`)
        options.onSuccess?.(items.filter(item => !idsSet.has(item.id)))
      } catch (error) {
        // Restore original items
        setItems(originalItems)

        const err = error instanceof Error ? error : new Error('Batch remove failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)

        throw err
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  const batchUpdate = useCallback(
    async (
      updates: Partial<T>[],
      serverAction: (updates: Partial<T>[]) => Promise<T[]>
    ) => {
      if (!options.enableBatchOperations) {
        throw new Error('Batch operations are not enabled')
      }

      const originalItems = [...items]

      setError(null)

      startTransition(() => {
        setOptimisticItems({ type: 'batch-update', payload: updates })
      })

      try {
        const results = await serverAction(updates)

        // Update items with results
        const resultsMap = new Map(results.map(item => [item.id, item]))
        setItems(prev =>
          prev.map(item =>
            resultsMap.has(item.id) ? resultsMap.get(item.id)! : item
          )
        )

        toast.success(`${results.length} items updated successfully`)
        options.onSuccess?.(items)

        return results
      } catch (error) {
        // Restore original items
        setItems(originalItems)

        const err = error instanceof Error ? error : new Error('Batch update failed')
        setError(err)
        toast.error(err.message)
        options.onError?.(err)

        throw err
      }
    },
    [items, options, startTransition, setOptimisticItems]
  )

  return {
    items: optimisticItems,
    isUpdating: isPending,
    error,
    actions: {
      add,
      remove,
      reorder,
      batchAdd,
      batchRemove,
      batchUpdate
    }
  }
}