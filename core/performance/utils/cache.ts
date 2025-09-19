// API caching utilities with stale-while-revalidate strategy

interface CacheEntry<T> {
  data: T
  timestamp: number
  etag?: string
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  staleWhileRevalidate?: number // Time to serve stale data while revalidating
  key?: string // Custom cache key
  persist?: boolean // Persist to localStorage
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>()
  private pendingRequests = new Map<string, Promise<any>>()

  // Generate cache key
  private getCacheKey(url: string, options?: CacheOptions): string {
    if (options?.key) return options.key
    return url
  }

  // Check if cache is valid
  private isValid<T>(entry: CacheEntry<T> | undefined, ttl: number): boolean {
    if (!entry) return false
    return Date.now() - entry.timestamp < ttl
  }

  // Check if cache is stale but within revalidation window
  private isStale<T>(entry: CacheEntry<T> | undefined, ttl: number, swr: number): boolean {
    if (!entry) return false
    const age = Date.now() - entry.timestamp
    return age >= ttl && age < ttl + swr
  }

  // Get from memory cache
  private getFromMemory<T>(key: string): CacheEntry<T> | undefined {
    return this.memoryCache.get(key)
  }

  // Get from localStorage
  private getFromStorage<T>(key: string): CacheEntry<T> | undefined {
    if (typeof window === 'undefined') return undefined

    try {
      const stored = localStorage.getItem(`cache:${key}`)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to get from localStorage:', e)
    }
    return undefined
  }

  // Save to memory cache
  private saveToMemory<T>(key: string, data: T, etag?: string): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      etag
    })
  }

  // Save to localStorage
  private saveToStorage<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
    } catch (e) {
      console.warn('Failed to save to localStorage:', e)
    }
  }

  // Clear expired entries
  private cleanupCache(): void {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24 hours

    // Clean memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > maxAge) {
        this.memoryCache.delete(key)
      }
    }

    // Clean localStorage
    if (typeof window !== 'undefined') {
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key?.startsWith('cache:')) {
            const stored = localStorage.getItem(key)
            if (stored) {
              const entry = JSON.parse(stored)
              if (now - entry.timestamp > maxAge) {
                localStorage.removeItem(key)
              }
            }
          }
        }
      } catch (e) {
        console.warn('Failed to cleanup localStorage:', e)
      }
    }
  }

  // Fetch with cache
  async fetch<T>(
    url: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const {
      ttl = 5 * 60 * 1000, // 5 minutes default
      staleWhileRevalidate = 60 * 1000, // 1 minute default
      persist = false
    } = options

    const key = this.getCacheKey(url, options)

    // Check memory cache first
    let entry = this.getFromMemory<T>(key)

    // Check localStorage if not in memory and persist is enabled
    if (!entry && persist) {
      entry = this.getFromStorage<T>(key)
      if (entry) {
        // Restore to memory cache
        this.memoryCache.set(key, entry)
      }
    }

    // If valid cache exists, return it
    if (this.isValid(entry, ttl)) {
      return entry!.data
    }

    // If stale cache exists, return it and revalidate in background
    if (this.isStale(entry, ttl, staleWhileRevalidate)) {
      // Check if revalidation is already in progress
      if (!this.pendingRequests.has(key)) {
        // Start background revalidation
        const revalidationPromise = fetcher()
          .then(data => {
            this.saveToMemory(key, data)
            if (persist) {
              this.saveToStorage(key, {
                data,
                timestamp: Date.now()
              })
            }
            return data
          })
          .catch(error => {
            console.error('Revalidation failed:', error)
            throw error
          })
          .finally(() => {
            this.pendingRequests.delete(key)
          })

        this.pendingRequests.set(key, revalidationPromise)
      }

      // Return stale data immediately
      return entry!.data
    }

    // Check if request is already pending
    const pendingRequest = this.pendingRequests.get(key)
    if (pendingRequest) {
      return pendingRequest
    }

    // No valid cache, fetch fresh data
    const fetchPromise = fetcher()
      .then(data => {
        this.saveToMemory(key, data)
        if (persist) {
          this.saveToStorage(key, {
            data,
            timestamp: Date.now()
          })
        }
        return data
      })
      .finally(() => {
        this.pendingRequests.delete(key)
      })

    this.pendingRequests.set(key, fetchPromise)
    return fetchPromise
  }

  // Invalidate cache
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      // Clear all cache
      this.memoryCache.clear()
      if (typeof window !== 'undefined') {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i)
          if (key?.startsWith('cache:')) {
            localStorage.removeItem(key)
          }
        }
      }
      return
    }

    // Clear matching keys
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    // Clear from memory
    for (const key of this.memoryCache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key)
      }
    }

    // Clear from localStorage
    if (typeof window !== 'undefined') {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache:')) {
          const cacheKey = key.substring(6) // Remove 'cache:' prefix
          if (regex.test(cacheKey)) {
            localStorage.removeItem(key)
          }
        }
      }
    }
  }

  // Prefetch data
  async prefetch<T>(
    url: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<void> {
    const key = this.getCacheKey(url, options)

    // Don't prefetch if already cached
    if (this.memoryCache.has(key)) return

    await this.fetch(url, fetcher, options)
  }

  // Get cache statistics
  getStats() {
    const stats = {
      memoryEntries: this.memoryCache.size,
      pendingRequests: this.pendingRequests.size,
      storageEntries: 0,
      totalSize: 0
    }

    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('cache:')) {
          stats.storageEntries++
          const value = localStorage.getItem(key)
          if (value) {
            stats.totalSize += value.length
          }
        }
      }
    }

    return stats
  }

  // Initialize cleanup interval
  init() {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupCache()
    }, 60 * 60 * 1000)

    // Initial cleanup
    this.cleanupCache()
  }
}

// Export singleton instance
export const cache = new CacheManager()

// React hook for cached data fetching
import { useEffect, useState } from 'react'

interface UseCachedDataOptions<T> extends CacheOptions {
  enabled?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCachedDataOptions<T> = {}
) {
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<Error | undefined>()
  const [loading, setLoading] = useState(true)

  const { enabled = true, onSuccess, onError, ...cacheOptions } = options

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const fetchData = async () => {
      try {
        setLoading(true)
        const result = await cache.fetch(key, fetcher, cacheOptions)
        if (!cancelled) {
          setData(result)
          onSuccess?.(result)
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error('Failed to fetch data')
          setError(error)
          onError?.(error)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [key, enabled])

  return {
    data,
    error,
    loading,
    refetch: () => {
      cache.invalidate(key)
      setLoading(true)
      setError(undefined)
    }
  }
}

// Initialize cache manager on module load
if (typeof window !== 'undefined') {
  cache.init()
}