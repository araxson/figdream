'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

interface UseFilterStateOptions {
  syncWithUrl?: boolean
  debounceMs?: number
}

export function useFilterState<T extends Record<string, string | number | boolean | Date | null | undefined>>(
  initialFilters: T,
  options: UseFilterStateOptions = {}
) {
  const { syncWithUrl = false, debounceMs = 0 } = options
  const [filters, setFilters] = useState<T>(initialFilters)
  const [debouncedFilters, setDebouncedFilters] = useState<T>(initialFilters)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // Initialize filters from URL if syncWithUrl is enabled
  useEffect(() => {
    if (syncWithUrl) {
      const urlFilters = {} as T
      Object.keys(initialFilters).forEach((key) => {
        const value = searchParams.get(key)
        if (value !== null) {
          urlFilters[key as keyof T] = value as T[keyof T]
        } else {
          urlFilters[key as keyof T] = initialFilters[key as keyof T]
        }
      })
      setFilters(urlFilters)
      setDebouncedFilters(urlFilters)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
      
      if (syncWithUrl) {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            params.set(key, String(value))
          } else {
            params.delete(key)
          }
        })
        router.push(`${pathname}?${params.toString()}`)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filters, debounceMs, syncWithUrl, searchParams, router, pathname])

  const updateFilter = useCallback((key: keyof T, value: T[keyof T]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateFilters = useCallback((updates: Partial<T>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setDebouncedFilters(initialFilters)
    
    if (syncWithUrl) {
      router.push(pathname)
    }
  }, [initialFilters, syncWithUrl, router, pathname])

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value !== initialFilters[key as keyof T]
  )

  return {
    filters: debounceMs > 0 ? debouncedFilters : filters,
    rawFilters: filters,
    updateFilter,
    updateFilters,
    resetFilters,
    hasActiveFilters
  }
}