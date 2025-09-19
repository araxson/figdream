/**
 * Advanced Cache Manager
 * Implements multiple caching strategies with Redis-like patterns
 */

import { unstable_cache } from 'next/cache'
import type { CacheStrategy, CacheMetrics } from '../types'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  hits: number
}

class CacheManager {
  private static instance: CacheManager
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map()
  private cacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0
  }
  private cleanupInterval: NodeJS.Timeout | undefined

  private readonly MAX_CACHE_SIZE = 1000
  private readonly DEFAULT_TTL = 60 * 1000 // 60 seconds

  private constructor() {
    // Start cleanup interval
    if (typeof process !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 30000) // Cleanup every 30 seconds
    }
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * Get or set cache with stale-while-revalidate pattern
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    strategy?: Partial<CacheStrategy>
  ): Promise<T> {
    const ttl = strategy?.ttl || this.DEFAULT_TTL
    const tags = strategy?.tags || []
    const staleWhileRevalidate = strategy?.staleWhileRevalidate ?? true

    // Check memory cache first
    const cached = this.memoryCache.get(key)

    if (cached) {
      const age = Date.now() - cached.timestamp
      const isStale = age > cached.ttl

      if (!isStale) {
        // Cache hit - fresh data
        this.cacheStats.hits++
        cached.hits++
        return cached.data
      }

      if (staleWhileRevalidate) {
        // Return stale data and revalidate in background
        this.cacheStats.hits++
        this.revalidateInBackground(key, fetcher, ttl, tags)
        return cached.data
      }
    }

    // Cache miss
    this.cacheStats.misses++

    try {
      const data = await fetcher()
      this.set(key, data, ttl, tags)
      return data
    } catch (error) {
      // If fetch fails and we have stale data, return it
      if (cached) {
        return cached.data
      }
      throw error
    }
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number, tags?: string[]): void {
    // Implement LRU eviction if cache is full
    if (this.memoryCache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU()
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
      tags: tags || [],
      hits: 0
    })
  }

  /**
   * Get cache entry
   */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key)

    if (!entry) {
      this.cacheStats.misses++
      return null
    }

    const age = Date.now() - entry.timestamp
    if (age > entry.ttl) {
      // Expired
      this.memoryCache.delete(key)
      this.cacheStats.misses++
      return null
    }

    this.cacheStats.hits++
    entry.hits++
    return entry.data
  }

  /**
   * Delete cache entry
   */
  delete(key: string): void {
    this.memoryCache.delete(key)
  }

  /**
   * Invalidate by tags
   */
  invalidateByTags(tags: string[]): void {
    const keysToDelete: string[] = []

    for (const [key, entry] of this.memoryCache.entries()) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key))
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.memoryCache.clear()
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses
    const entries = Array.from(this.memoryCache.values())

    const ttlStats = entries.length > 0 ? {
      min: Math.min(...entries.map(e => e.ttl)),
      max: Math.max(...entries.map(e => e.ttl)),
      avg: entries.reduce((sum, e) => sum + e.ttl, 0) / entries.length
    } : { min: 0, max: 0, avg: 0 }

    // Estimate memory usage (rough approximation)
    const memoryUsed = JSON.stringify(Array.from(this.memoryCache.entries())).length

    return {
      hitRate: totalRequests > 0 ? (this.cacheStats.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.cacheStats.misses / totalRequests) * 100 : 0,
      evictionRate: totalRequests > 0 ? (this.cacheStats.evictions / totalRequests) * 100 : 0,
      totalKeys: this.memoryCache.size,
      memoryUsed,
      ttlStats
    }
  }

  /**
   * Revalidate cache in background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number,
    tags: string[]
  ): Promise<void> {
    // Run in background without blocking
    Promise.resolve().then(async () => {
      try {
        const data = await fetcher()
        this.set(key, data, ttl, tags)
      } catch (error) {
        console.error(`Failed to revalidate cache for key: ${key}`, error)
      }
    })
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null
    let minHits = Infinity
    const oldestTimestamp = Infinity

    for (const [key, entry] of this.memoryCache.entries()) {
      // Consider both hits and age for LRU
      const score = entry.hits * 1000 + (Date.now() - entry.timestamp)
      if (score < minHits) {
        minHits = score
        lruKey = key
      }
    }

    if (lruKey) {
      this.memoryCache.delete(lruKey)
      this.cacheStats.evictions++
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keysToDelete: string[] = []

    for (const [key, entry] of this.memoryCache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.memoryCache.delete(key))
  }

  /**
   * Destroy the cache manager and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
    this.clear()
  }
}

// Export singleton instance
export const cacheManager = CacheManager.getInstance()

/**
 * Create a cached function using Next.js unstable_cache with our cache manager
 */
export function createCachedFunction<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyParts: string[],
  options?: {
    revalidate?: number | false
    tags?: string[]
  }
): T {
  return unstable_cache(
    async (...args: Parameters<T>) => {
      const key = [...keyParts, ...args.map(arg => JSON.stringify(arg))].join(':')

      return cacheManager.getOrSet(
        key,
        () => fn(...args),
        {
          ttl: options?.revalidate ? options.revalidate * 1000 : 60000,
          tags: options?.tags,
          staleWhileRevalidate: true
        }
      )
    },
    keyParts,
    options
  ) as T
}

/**
 * Decorator for caching method results
 */
export function cached(options?: { ttl?: number; tags?: string[] }) {
  return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (this: object, ...args: unknown[]) {
      const key = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`

      return cacheManager.getOrSet(
        key,
        () => originalMethod.apply(this, args),
        {
          ttl: options?.ttl,
          tags: options?.tags,
          staleWhileRevalidate: true
        }
      )
    }

    return descriptor
  }
}