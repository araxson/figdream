import { useState, useCallback } from 'react'

interface AsyncState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

interface UseAsyncOptions {
  retries?: number
  retryDelay?: number
  onError?: (error: Error) => void
  onSuccess?: <T>(data: T) => void
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = {}
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    loading: false
  })

  const execute = useCallback(async () => {
    setState({ data: null, error: null, loading: true })
    
    let lastError: Error | null = null
    const maxRetries = options.retries || 0
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const data = await asyncFunction()
        setState({ data, error: null, loading: false })
        options.onSuccess?.(data)
        return data
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, options.retryDelay || 1000)
          )
        }
      }
    }
    
    setState({ data: null, error: lastError, loading: false })
    options.onError?.(lastError!)
    throw lastError
  }, [asyncFunction, options])

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, error: null, loading: false })
  }
}