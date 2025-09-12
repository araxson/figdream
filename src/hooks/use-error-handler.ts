'use client'

import { useToast } from '@/hooks/use-toast'
import { PostgrestError } from '@supabase/supabase-js'
import { useCallback } from 'react'

interface ErrorHandlerOptions {
  showToast?: boolean
  context?: string
  fallbackMessage?: string
  onError?: (error: unknown) => void
}

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      context,
      fallbackMessage = 'An unexpected error occurred',
      onError
    } = options

    let message = fallbackMessage
    let description: string | undefined

    if (error instanceof Error) {
      message = error.message
    } else if ((error as PostgrestError)?.message) {
      message = (error as PostgrestError).message
    } else if (typeof error === 'string') {
      message = error
    }

    if (context) {
      description = `Error in ${context}`
    }

    console.error(`[Error${context ? ` in ${context}` : ''}]:`, error)

    if (showToast) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive'
      })
    }

    onError?.(error)

    return { message, description }
  }, [toast])

  const withErrorHandling = useCallback(async <T,>(
    fn: () => Promise<T>,
    options?: ErrorHandlerOptions
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      handleError(error, options)
      return null
    }
  }, [handleError])

  const handleAsyncOperation = useCallback(async <T,>(
    operation: () => Promise<{ data: T | null; error: unknown }>,
    options?: ErrorHandlerOptions
  ): Promise<{ data: T | null; error: unknown }> => {
    try {
      const result = await operation()
      
      if (result.error) {
        handleError(result.error, options)
        return { data: null, error: result.error }
      }
      
      return result
    } catch (error) {
      handleError(error, options)
      return { data: null, error }
    }
  }, [handleError])

  return {
    handleError,
    withErrorHandling,
    handleAsyncOperation
  }
}