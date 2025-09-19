'use client'

import { useOptimistic, useTransition, useCallback, useState, useRef } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export interface OptimisticFormOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onValidationError?: (errors: Record<string, string[]>) => void
  resetOnSuccess?: boolean
  showToast?: boolean
  successMessage?: string
  errorMessage?: string
}

export interface FormState<T> {
  data: T
  errors: Record<string, string[]>
  isSubmitting: boolean
  isDirty: boolean
  lastSubmission: T | null
  submitCount: number
}

export function useOptimisticForm<T extends Record<string, any>>(
  initialData: T,
  schema?: z.ZodSchema<T>,
  options: OptimisticFormOptions<T> = {}
) {
  const [formData, setFormData] = useState<T>(initialData)
  const [optimisticData, setOptimisticData] = useOptimistic(
    formData,
    (_, newData: T) => newData
  )
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()
  const [isDirty, setIsDirty] = useState(false)
  const [lastSubmission, setLastSubmission] = useState<T | null>(null)
  const [submitCount, setSubmitCount] = useState(0)

  const previousDataRef = useRef<T>(initialData)

  const validateField = useCallback(
    (name: string, value: any): string[] => {
      if (!schema) return []

      try {
        const fieldSchema = schema.shape[name as keyof typeof schema.shape]
        if (fieldSchema && 'parse' in fieldSchema) {
          ;(fieldSchema as z.ZodTypeAny).parse(value)
        }
        return []
      } catch (error) {
        if (error instanceof z.ZodError) {
          return error.errors.map(e => e.message)
        }
        return ['Invalid value']
      }
    },
    [schema]
  )

  const updateField = useCallback(
    (name: string, value: any) => {
      setFormData(prev => ({ ...prev, [name]: value }))
      setIsDirty(true)

      // Validate single field
      const fieldErrors = validateField(name, value)
      setErrors(prev => {
        const newErrors = { ...prev }
        if (fieldErrors.length > 0) {
          newErrors[name] = fieldErrors
        } else {
          delete newErrors[name]
        }
        return newErrors
      })
    },
    [validateField]
  )

  const updateFields = useCallback(
    (updates: Partial<T>) => {
      setFormData(prev => ({ ...prev, ...updates }))
      setIsDirty(true)

      // Validate updated fields
      const newErrors: Record<string, string[]> = {}
      Object.entries(updates).forEach(([name, value]) => {
        const fieldErrors = validateField(name, value)
        if (fieldErrors.length > 0) {
          newErrors[name] = fieldErrors
        }
      })

      setErrors(prev => ({ ...prev, ...newErrors }))
    },
    [validateField]
  )

  const reset = useCallback(
    (newData?: T) => {
      const dataToSet = newData || initialData
      setFormData(dataToSet)
      setErrors({})
      setIsDirty(false)
      previousDataRef.current = dataToSet
    },
    [initialData]
  )

  const validate = useCallback((): boolean => {
    if (!schema) return true

    try {
      schema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string[]> = {}
        error.errors.forEach(err => {
          const path = err.path.join('.')
          if (!newErrors[path]) {
            newErrors[path] = []
          }
          newErrors[path].push(err.message)
        })
        setErrors(newErrors)
        options.onValidationError?.(newErrors)
      }
      return false
    }
  }, [formData, schema, options])

  const submit = useCallback(
    async (
      serverAction: (data: T) => Promise<T>,
      skipValidation = false
    ) => {
      // Validate before submission
      if (!skipValidation && !validate()) {
        toast.error('Please fix validation errors')
        return null
      }

      const previousData = { ...formData }
      setErrors({})
      setSubmitCount(prev => prev + 1)

      // Optimistic update
      startTransition(() => {
        setOptimisticData(formData)
      })

      try {
        const result = await serverAction(formData)

        // Update with server response
        setFormData(result)
        setLastSubmission(result)
        setIsDirty(false)
        previousDataRef.current = result

        if (options.resetOnSuccess) {
          reset()
        }

        if (options.showToast !== false) {
          toast.success(options.successMessage || 'Form submitted successfully')
        }

        options.onSuccess?.(result)
        return result
      } catch (error) {
        // Rollback on error
        setFormData(previousData)

        const err = error instanceof Error ? error : new Error('Submission failed')

        if (options.showToast !== false) {
          toast.error(options.errorMessage || err.message)
        }

        options.onError?.(err)
        throw err
      }
    },
    [formData, validate, options, reset, startTransition, setOptimisticData]
  )

  const submitField = useCallback(
    async (
      name: string,
      value: any,
      serverAction: (name: string, value: any) => Promise<T>
    ) => {
      const fieldErrors = validateField(name, value)
      if (fieldErrors.length > 0) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors }))
        toast.error('Invalid field value')
        return null
      }

      const previousData = { ...formData }
      const updatedData = { ...formData, [name]: value }

      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })

      // Optimistic update
      startTransition(() => {
        setOptimisticData(updatedData)
      })

      try {
        const result = await serverAction(name, value)

        // Update with server response
        setFormData(result)
        setIsDirty(false)

        toast.success('Field updated')
        options.onSuccess?.(result)

        return result
      } catch (error) {
        // Rollback on error
        setFormData(previousData)

        const err = error instanceof Error ? error : new Error('Update failed')
        toast.error(err.message)
        options.onError?.(err)

        throw err
      }
    },
    [formData, validateField, options, startTransition, setOptimisticData]
  )

  const autoSave = useCallback(
    async (
      serverAction: (data: Partial<T>) => Promise<T>,
      debounceMs = 1000
    ) => {
      if (!isDirty) return

      const timeoutId = setTimeout(async () => {
        const dirtyFields = Object.keys(formData).reduce((acc, key) => {
          if (formData[key as keyof T] !== previousDataRef.current[key as keyof T]) {
            acc[key as keyof T] = formData[key as keyof T]
          }
          return acc
        }, {} as Partial<T>)

        if (Object.keys(dirtyFields).length === 0) return

        try {
          const result = await serverAction(dirtyFields)
          setFormData(result)
          setIsDirty(false)
          previousDataRef.current = result
          toast.success('Auto-saved', { duration: 1000 })
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }, debounceMs)

      return () => clearTimeout(timeoutId)
    },
    [formData, isDirty]
  )

  return {
    data: optimisticData,
    errors,
    isSubmitting: isPending,
    isDirty,
    lastSubmission,
    submitCount,
    actions: {
      updateField,
      updateFields,
      submit,
      submitField,
      validate,
      reset,
      autoSave
    }
  }
}