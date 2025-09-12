'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface UseFormHandlerOptions<T = unknown> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  successMessage?: string
  errorMessage?: string
  redirectTo?: string
  resetOnSuccess?: boolean
}

export function useFormHandler<T = unknown>(options: UseFormHandlerOptions<T> = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = useCallback(async (
    submitFn: () => Promise<T>
  ): Promise<T | null> => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitFn()
      
      if (options.successMessage) {
        toast.success(options.successMessage)
      }
      
      if (options.redirectTo) {
        router.push(options.redirectTo)
      }
      
      if (options.resetOnSuccess) {
        router.refresh()
      }
      
      options.onSuccess?.(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred')
      setError(error.message)
      
      toast.error(options.errorMessage || error.message)
      options.onError?.(error)
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [router, options])

  return {
    isSubmitting,
    error,
    handleSubmit
  }
}