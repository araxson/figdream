'use client'

import { useOptimistic, useTransition, useCallback, useState } from 'react'
import { toast } from 'sonner'

export interface ToggleOptions {
  onSuccess?: (newState: boolean) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  optimisticDelay?: number
}

export function useOptimisticToggle(
  initialState: boolean,
  options: ToggleOptions = {}
) {
  const [state, setState] = useState(initialState)
  const [optimisticState, setOptimisticState] = useOptimistic(
    state,
    (_, newState: boolean) => newState
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)

  const toggle = useCallback(
    async (
      serverAction: (newState: boolean) => Promise<boolean>
    ) => {
      const newState = !optimisticState
      const previousState = state

      setError(null)

      // Optimistic update
      startTransition(() => {
        setOptimisticState(newState)
      })

      try {
        const result = await serverAction(newState)

        // Update with server response
        setState(result)

        toast.success(options.successMessage || `Status ${result ? 'enabled' : 'disabled'}`)
        options.onSuccess?.(result)

        return result
      } catch (error) {
        // Rollback on error
        setState(previousState)

        const err = error instanceof Error ? error : new Error('Toggle failed')
        setError(err)
        toast.error(options.errorMessage || err.message)
        options.onError?.(err)

        throw err
      }
    },
    [optimisticState, state, options, startTransition, setOptimisticState]
  )

  const set = useCallback(
    async (
      newState: boolean,
      serverAction: (newState: boolean) => Promise<boolean>
    ) => {
      const previousState = state

      setError(null)

      // Optimistic update
      startTransition(() => {
        setOptimisticState(newState)
      })

      try {
        const result = await serverAction(newState)

        // Update with server response
        setState(result)

        toast.success(options.successMessage || 'Status updated')
        options.onSuccess?.(result)

        return result
      } catch (error) {
        // Rollback on error
        setState(previousState)

        const err = error instanceof Error ? error : new Error('Update failed')
        setError(err)
        toast.error(options.errorMessage || err.message)
        options.onError?.(err)

        throw err
      }
    },
    [state, options, startTransition, setOptimisticState]
  )

  return {
    state: optimisticState,
    isToggling: isPending,
    error,
    toggle,
    set
  }
}

export interface MultiToggleState {
  [key: string]: boolean
}

export function useOptimisticMultiToggle(
  initialStates: MultiToggleState,
  options: ToggleOptions = {}
) {
  const [states, setStates] = useState(initialStates)
  const [optimisticStates, setOptimisticStates] = useOptimistic(
    states,
    (state: MultiToggleState, action: { id: string; value: boolean }) => ({
      ...state,
      [action.id]: action.value
    })
  )
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<Error | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

  const toggle = useCallback(
    async (
      id: string,
      serverAction: (id: string, newState: boolean) => Promise<boolean>
    ) => {
      const currentState = optimisticStates[id] ?? false
      const newState = !currentState
      const previousStates = { ...states }

      setError(null)
      setPendingId(id)

      // Optimistic update
      startTransition(() => {
        setOptimisticStates({ id, value: newState })
      })

      try {
        const result = await serverAction(id, newState)

        // Update with server response
        setStates(prev => ({ ...prev, [id]: result }))

        toast.success(options.successMessage || `Status ${result ? 'enabled' : 'disabled'}`)
        options.onSuccess?.(result)

        return result
      } catch (error) {
        // Rollback on error
        setStates(previousStates)

        const err = error instanceof Error ? error : new Error('Toggle failed')
        setError(err)
        toast.error(options.errorMessage || err.message)
        options.onError?.(err)

        throw err
      } finally {
        setPendingId(null)
      }
    },
    [optimisticStates, states, options, startTransition, setOptimisticStates]
  )

  const set = useCallback(
    async (
      id: string,
      newState: boolean,
      serverAction: (id: string, newState: boolean) => Promise<boolean>
    ) => {
      const previousStates = { ...states }

      setError(null)
      setPendingId(id)

      // Optimistic update
      startTransition(() => {
        setOptimisticStates({ id, value: newState })
      })

      try {
        const result = await serverAction(id, newState)

        // Update with server response
        setStates(prev => ({ ...prev, [id]: result }))

        toast.success(options.successMessage || 'Status updated')
        options.onSuccess?.(result)

        return result
      } catch (error) {
        // Rollback on error
        setStates(previousStates)

        const err = error instanceof Error ? error : new Error('Update failed')
        setError(err)
        toast.error(options.errorMessage || err.message)
        options.onError?.(err)

        throw err
      } finally {
        setPendingId(null)
      }
    },
    [states, options, startTransition, setOptimisticStates]
  )

  return {
    states: optimisticStates,
    isToggling: isPending,
    pendingId,
    error,
    toggle,
    set
  }
}