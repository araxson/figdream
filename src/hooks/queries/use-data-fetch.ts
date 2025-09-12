'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface UseDataFetchOptions<T> {
  fetchFn: () => Promise<T>
  deps?: React.DependencyList
  requireAuth?: boolean
  retries?: number
  retryDelay?: number
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  initialData?: T | null
  enabled?: boolean
}

interface UseDataFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  retry: () => Promise<void>
  reset: () => void
}

export function useDataFetch<T>({
  fetchFn,
  deps = [],
  requireAuth = true,
  retries = 3,
  retryDelay = 1000,
  onSuccess,
  onError,
  initialData = null,
  enabled = true
}: UseDataFetchOptions<T>): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const supabase = createClient()
  const { toast } = useToast()

  const fetchData = useCallback(async (isRetry = false) => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      // Check authentication if required
      if (requireAuth) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          throw new Error('Authentication required. Please sign in to continue.')
        }
      }

      // Execute the fetch function
      const result = await fetchFn()
      
      setData(result)
      setRetryCount(0)
      onSuccess?.(result)
      
    } catch (err) {
      const error = err as Error
      setError(error)
      
      // Handle retries
      if (!isRetry && retryCount < retries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchData(true)
        }, retryDelay)
        return
      }
      
      // Show error toast
      toast.error('Error loading data', error.message)
      
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [enabled, requireAuth, fetchFn, retryCount, retries, retryDelay, supabase, toast, onSuccess, onError])

  useEffect(() => {
    fetchData()
  }, [fetchData, deps])

  const refetch = useCallback(async () => {
    setRetryCount(0)
    await fetchData()
  }, [fetchData])

  const retry = useCallback(async () => {
    if (retryCount < retries) {
      setRetryCount(prev => prev + 1)
      await fetchData(true)
    }
  }, [retryCount, retries, fetchData])

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
    setRetryCount(0)
  }, [initialData])

  return {
    data,
    loading,
    error,
    refetch,
    retry,
    reset
  }
}