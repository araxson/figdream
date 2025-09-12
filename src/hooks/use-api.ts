'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseApiOptions<T = unknown> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  showErrorToast?: boolean
  successMessage?: string
  errorMessage?: string
}

export function useApi<T = unknown>(options: UseApiOptions<T> = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (
    url: string,
    fetchOptions?: RequestInit
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred')
      setError(error)
      
      if (options.showErrorToast !== false) {
        toast.error(options.errorMessage || error.message)
      }
      
      options.onError?.(error)
      return null
    } finally {
      setLoading(false)
    }
  }, [options])

  const get = useCallback((url: string) => 
    execute(url, { method: 'GET' }), [execute])
  
  const post = useCallback((url: string, data?: any) => 
    execute(url, { 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }), [execute])
  
  const put = useCallback((url: string, data?: any) => 
    execute(url, { 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }), [execute])
  
  const patch = useCallback((url: string, data?: any) => 
    execute(url, { 
      method: 'PATCH', 
      body: data ? JSON.stringify(data) : undefined 
    }), [execute])
  
  const del = useCallback((url: string) => 
    execute(url, { method: 'DELETE' }), [execute])

  return {
    loading,
    error,
    data,
    execute,
    get,
    post,
    put,
    patch,
    delete: del,
  }
}