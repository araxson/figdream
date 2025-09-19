import { useOptimistic, useTransition, useCallback } from 'react';
import { toast } from 'sonner';

export type OptimisticAction<T> =
  | { type: 'add'; item: T }
  | { type: 'update'; id: string; updates: Partial<T> }
  | { type: 'delete'; id: string }
  | { type: 'reorder'; items: T[] }
  | { type: 'reset'; items: T[] };

interface UseOptimisticUpdatesOptions<T> {
  onError?: (error: Error) => void;
  getItemId?: (item: T) => string;
  optimisticDelay?: number;
}

/**
 * Hook for managing optimistic updates with automatic rollback on failure
 */
export function useOptimisticUpdates<T extends { id: string }>(
  initialItems: T[],
  options: UseOptimisticUpdatesOptions<T> = {}
) {
  const {
    onError = (error) => toast.error(error.message),
    getItemId = (item) => item.id,
    optimisticDelay = 0
  } = options;

  const [isPending, startTransition] = useTransition();

  const [optimisticItems, updateOptimisticItems] = useOptimistic(
    initialItems,
    (state: T[], action: OptimisticAction<T>) => {
      switch (action.type) {
        case 'add':
          return [...state, action.item];

        case 'update':
          return state.map(item =>
            getItemId(item) === action.id
              ? { ...item, ...action.updates }
              : item
          );

        case 'delete':
          return state.filter(item => getItemId(item) !== action.id);

        case 'reorder':
          return action.items;

        case 'reset':
          return action.items;

        default:
          return state;
      }
    }
  );

  /**
   * Add item with optimistic update
   */
  const addOptimistic = useCallback(async (
    item: T,
    serverAction: () => Promise<T | void>
  ) => {
    // Apply optimistic update immediately
    startTransition(() => {
      updateOptimisticItems({ type: 'add', item });
    });

    try {
      // Add artificial delay if specified (for demo purposes)
      if (optimisticDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, optimisticDelay));
      }

      // Execute server action
      const result = await serverAction();

      // If server returns updated item, update optimistic state
      if (result) {
        startTransition(() => {
          updateOptimisticItems({
            type: 'update',
            id: getItemId(item),
            updates: result as Partial<T>
          });
        });
      }

      return result;
    } catch (error) {
      // Rollback optimistic update on error
      startTransition(() => {
        updateOptimisticItems({ type: 'delete', id: getItemId(item) });
      });

      const err = error instanceof Error ? error : new Error('Operation failed');
      onError(err);
      throw err;
    }
  }, [updateOptimisticItems, getItemId, onError, optimisticDelay]);

  /**
   * Update item with optimistic update
   */
  const updateOptimistic = useCallback(async (
    id: string,
    updates: Partial<T>,
    serverAction: () => Promise<T | void>
  ) => {
    // Store original state for rollback
    const originalItem = optimisticItems.find(item => getItemId(item) === id);

    // Apply optimistic update
    startTransition(() => {
      updateOptimisticItems({ type: 'update', id, updates });
    });

    try {
      if (optimisticDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, optimisticDelay));
      }

      const result = await serverAction();

      // Update with server response if available
      if (result) {
        startTransition(() => {
          updateOptimisticItems({
            type: 'update',
            id,
            updates: result as Partial<T>
          });
        });
      }

      return result;
    } catch (error) {
      // Rollback to original state
      if (originalItem) {
        startTransition(() => {
          updateOptimisticItems({
            type: 'update',
            id,
            updates: originalItem as Partial<T>
          });
        });
      }

      const err = error instanceof Error ? error : new Error('Update failed');
      onError(err);
      throw err;
    }
  }, [optimisticItems, updateOptimisticItems, getItemId, onError, optimisticDelay]);

  /**
   * Delete item with optimistic update
   */
  const deleteOptimistic = useCallback(async (
    id: string,
    serverAction: () => Promise<void>
  ) => {
    // Store item for rollback
    const itemToDelete = optimisticItems.find(item => getItemId(item) === id);

    // Apply optimistic delete
    startTransition(() => {
      updateOptimisticItems({ type: 'delete', id });
    });

    try {
      if (optimisticDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, optimisticDelay));
      }

      await serverAction();
    } catch (error) {
      // Rollback by re-adding the item
      if (itemToDelete) {
        startTransition(() => {
          updateOptimisticItems({ type: 'add', item: itemToDelete });
        });
      }

      const err = error instanceof Error ? error : new Error('Delete failed');
      onError(err);
      throw err;
    }
  }, [optimisticItems, updateOptimisticItems, getItemId, onError, optimisticDelay]);

  /**
   * Batch update multiple items
   */
  const batchUpdateOptimistic = useCallback(async (
    updates: Array<{ id: string; updates: Partial<T> }>,
    serverAction: () => Promise<void>
  ) => {
    // Store original state
    const originalItems = [...optimisticItems];

    // Apply all optimistic updates
    startTransition(() => {
      updates.forEach(({ id, updates }) => {
        updateOptimisticItems({ type: 'update', id, updates });
      });
    });

    try {
      if (optimisticDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, optimisticDelay));
      }

      await serverAction();
    } catch (error) {
      // Rollback all changes
      startTransition(() => {
        updateOptimisticItems({ type: 'reset', items: originalItems });
      });

      const err = error instanceof Error ? error : new Error('Batch update failed');
      onError(err);
      throw err;
    }
  }, [optimisticItems, updateOptimisticItems, onError, optimisticDelay]);

  /**
   * Reorder items with optimistic update
   */
  const reorderOptimistic = useCallback(async (
    newOrder: T[],
    serverAction: () => Promise<void>
  ) => {
    const originalOrder = [...optimisticItems];

    startTransition(() => {
      updateOptimisticItems({ type: 'reorder', items: newOrder });
    });

    try {
      if (optimisticDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, optimisticDelay));
      }

      await serverAction();
    } catch (error) {
      // Rollback to original order
      startTransition(() => {
        updateOptimisticItems({ type: 'reset', items: originalOrder });
      });

      const err = error instanceof Error ? error : new Error('Reorder failed');
      onError(err);
      throw err;
    }
  }, [optimisticItems, updateOptimisticItems, onError, optimisticDelay]);

  /**
   * Reset to new state (useful after server refetch)
   */
  const resetItems = useCallback((items: T[]) => {
    startTransition(() => {
      updateOptimisticItems({ type: 'reset', items });
    });
  }, [updateOptimisticItems]);

  return {
    items: optimisticItems,
    isPending,
    addOptimistic,
    updateOptimistic,
    deleteOptimistic,
    batchUpdateOptimistic,
    reorderOptimistic,
    resetItems,
  };
}

/**
 * Hook for single item optimistic updates (forms)
 */
export function useOptimisticForm<T>(
  initialData: T,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  } = {}
) {
  const { onSuccess, onError = (error) => toast.error(error.message) } = options;

  const [optimisticData, updateOptimisticData] = useOptimistic(
    initialData,
    (state: T, updates: Partial<T>) => ({ ...state, ...updates })
  );

  const [isPending, startTransition] = useTransition();

  const submitOptimistic = useCallback(async (
    updates: Partial<T>,
    serverAction: () => Promise<T>
  ) => {
    // Apply optimistic update
    startTransition(() => {
      updateOptimisticData(updates);
    });

    try {
      const result = await serverAction();

      // Update with server response
      startTransition(() => {
        updateOptimisticData(result);
      });

      onSuccess?.(result);
      return result;
    } catch (error) {
      // Rollback to initial state
      startTransition(() => {
        updateOptimisticData(initialData);
      });

      const err = error instanceof Error ? error : new Error('Submit failed');
      onError(err);
      throw err;
    }
  }, [initialData, updateOptimisticData, onSuccess, onError]);

  return {
    data: optimisticData,
    isPending,
    submitOptimistic,
  };
}