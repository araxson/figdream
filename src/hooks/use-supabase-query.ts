'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostgrestError } from '@supabase/supabase-js'

interface UseSupabaseQueryOptions<T> {
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: PostgrestError) => void
  refetchInterval?: number
  initialData?: T
}

interface UseSupabaseQueryResult<T> {
  data: T | null
  loading: boolean
  error: PostgrestError | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

export function useSupabaseQuery<T = unknown>(
  queryFn: (client: ReturnType<typeof createClient>) => Promise<{ data: T | null; error: PostgrestError | null }>,
  dependencies: unknown[] = [],
  options: UseSupabaseQueryOptions<T> = {}
): UseSupabaseQueryResult<T> {
  const {
    enabled = true,
    onSuccess,
    onError,
    refetchInterval,
    initialData = null
  } = options

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<PostgrestError | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)
  
  const supabase = createClient()

  const fetchData = useCallback(async (isRefetch = false) => {
    try {
      if (isRefetch) {
        setIsRefetching(true)
      } else {
        setLoading(true)
      }
      
      const { data: result, error: queryError } = await queryFn(supabase)
      
      if (queryError) {
        setError(queryError)
        onError?.(queryError)
      } else if (result) {
        setData(result)
        onSuccess?.(result)
      }
    } catch (err) {
      const error = err as PostgrestError
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
      setIsRefetching(false)
    }
  }, [supabase, queryFn, onSuccess, onError])

  useEffect(() => {
    if (enabled) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, enabled])

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(() => {
        fetchData(true)
      }, refetchInterval)
      
      return () => clearInterval(interval)
    }
  }, [refetchInterval, enabled, fetchData])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching
  }
}

// Mutation hook for create/update/delete operations
export function useSupabaseMutation<T = unknown, V = unknown>(
  mutationFn: (client: ReturnType<typeof createClient>, variables: V) => Promise<{ data: T | null; error: PostgrestError | null }>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<PostgrestError | null>(null)
  const supabase = createClient()

  const mutate = useCallback(async (
    variables: V,
    options?: {
      onSuccess?: (data: T) => void
      onError?: (error: PostgrestError) => void
    }
  ) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: mutationError } = await mutationFn(supabase, variables)
      
      if (mutationError) {
        setError(mutationError)
        options?.onError?.(mutationError)
        return { data: null, error: mutationError }
      }
      
      options?.onSuccess?.(data!)
      return { data, error: null }
    } catch (err) {
      const error = err as PostgrestError
      setError(error)
      options?.onError?.(error)
      return { data: null, error }
    } finally {
      setLoading(false)
    }
  }, [supabase, mutationFn])

  return {
    mutate,
    loading,
    error
  }
}