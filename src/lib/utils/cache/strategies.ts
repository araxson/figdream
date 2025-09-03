/**
 * Caching Strategies for FigDream
 * Implements various caching patterns for optimal performance
 */
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import { createClient } from '@/lib/database/supabase/server'
/**
 * Cache configuration
 */
export const cacheConfig = {
  // Cache durations in seconds
  durations: {
    short: 60, // 1 minute
    medium: 300, // 5 minutes
    long: 3600, // 1 hour
    day: 86400, // 24 hours
    week: 604800, // 7 days
    month: 2592000, // 30 days
  },
  // Cache tags for invalidation
  tags: {
    all: 'all',
    salons: 'salons',
    services: 'services',
    bookings: 'bookings',
    staff: 'staff',
    reviews: 'reviews',
    users: 'users',
    analytics: 'analytics',
    promotions: 'promotions',
  },
  // Revalidation strategies
  strategies: {
    onDemand: 'on-demand',
    timeBased: 'time-based',
    staleWhileRevalidate: 'stale-while-revalidate',
  },
} as const
/**
 * Generic cache wrapper with type safety
 */
export function createCachedFunction<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: {
    tags?: string[]
    revalidate?: number | false
    key?: string
  } = {}
): (...args: TArgs) => Promise<TReturn> {
  const {
    tags = [cacheConfig.tags.all],
    revalidate = cacheConfig.durations.medium,
    key,
  } = options
  return unstable_cache(
    fn,
    key ? [key] : undefined,
    {
      tags,
      revalidate,
    }
  )
}
/**
 * React cache for request deduplication
 */
export const dedupedFetch = cache(async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`)
  }
  return response.json()
})
/**
 * Salon data caching
 */
export const getCachedSalons = createCachedFunction(
  async (limit?: number) => {
    const supabase = await createClient()
    const query = supabase
      .from('salons')
      .select(`
        *,
        locations (*)
      `)
      .eq('is_active', true)
    if (limit) {
      query.limit(limit)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  },
  {
    tags: [cacheConfig.tags.salons],
    revalidate: cacheConfig.durations.long,
    key: 'salons-list',
  }
)
/**
 * Service data caching
 */
export const getCachedServices = createCachedFunction(
  async (salonId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
    if (error) throw error
    return data
  },
  {
    tags: [cacheConfig.tags.services],
    revalidate: cacheConfig.durations.medium,
    key: 'salon-services',
  }
)
/**
 * Staff availability caching
 * NOTE: staff_availability table doesn't exist - using staff_schedules instead
 */
export const getCachedStaffAvailability = createCachedFunction(
  async (staffId: string, date: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('staff_schedules')
      .select('*')
      .eq('staff_id', staffId)
      .eq('date', date)
      .single()
    if (error && error.code !== 'PGRST116') throw error
    return data
  },
  {
    tags: [cacheConfig.tags.staff],
    revalidate: cacheConfig.durations.short,
    key: 'staff-availability',
  }
)
/**
 * Reviews caching with pagination
 */
export const getCachedReviews = createCachedFunction(
  async (salonId: string, page: number = 1, limit: number = 10) => {
    const supabase = await createClient()
    const offset = (page - 1) * limit
    const { data, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        customer:profiles!customer_id (
          first_name,
          last_name,
          avatar_url
        )
      `, { count: 'exact' })
      .eq('salon_id', salonId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) throw error
    return {
      reviews: data,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    }
  },
  {
    tags: [cacheConfig.tags.reviews],
    revalidate: cacheConfig.durations.medium,
    key: 'salon-reviews',
  }
)
/**
 * Analytics data caching
 */
export const getCachedAnalytics = createCachedFunction(
  async (salonId: string, period: 'day' | 'week' | 'month' | 'year') => {
    const supabase = await createClient()
    // Calculate date range
    const _endDate = new Date()
    const startDate = new Date()
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }
    // NOTE: analytics_summary table doesn't exist - using analytics_patterns instead
    const { data, error } = await supabase
      .from('analytics_patterns')
      .select('*')
      .eq('salon_id', salonId)
    if (error) throw error
    return data
  },
  {
    tags: [cacheConfig.tags.analytics],
    revalidate: cacheConfig.durations.long,
    key: 'salon-analytics',
  }
)
/**
 * Promotions caching
 * NOTE: marketing_campaigns table doesn't exist - using email_campaigns instead
 */
export const getCachedPromotions = createCachedFunction(
  async (salonId?: string) => {
    const supabase = await createClient()
    const query = supabase
      .from('email_campaigns')
      .select('*')
      .eq('status', 'active')
    if (salonId) {
      query.eq('salon_id', salonId)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  },
  {
    tags: [cacheConfig.tags.promotions],
    revalidate: cacheConfig.durations.medium,
    key: 'active-promotions',
  }
)
/**
 * In-memory cache for client-side
 */
export class ClientCache<T> {
  private cache: Map<string, { data: T; timestamp: number }> = new Map()
  private ttl: number
  constructor(ttl: number = 60000) { // Default 1 minute
    this.ttl = ttl
  }
  /**
   * Get cached data
   */
  get(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }
    return cached.data
  }
  /**
   * Set cached data
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }
  /**
   * Clear specific key or all cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
  /**
   * Get or fetch data
   */
  async getOrFetch(
    key: string,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = this.get(key)
    if (cached !== null) return cached
    const data = await fetcher()
    this.set(key, data)
    return data
  }
}
/**
 * Service Worker cache strategies
 */
export const swCacheStrategies = {
  /**
   * Cache First - for static assets
   */
  cacheFirst: async (request: Request, cacheName: string): Promise<Response> => {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  },
  /**
   * Network First - for API calls
   */
  networkFirst: async (request: Request, cacheName: string): Promise<Response> => {
    try {
      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(cacheName)
        cache.put(request, response.clone())
      }
      return response
    } catch (_error) {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(request)
      if (cachedResponse) {
        return cachedResponse
      }
      throw error
    }
  },
  /**
   * Stale While Revalidate - for frequently updated content
   */
  staleWhileRevalidate: async (request: Request, cacheName: string): Promise<Response> => {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    const fetchPromise = fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    return cachedResponse || fetchPromise
  },
}
/**
 * Cache invalidation utilities
 */
export const cacheInvalidation = {
  /**
   * Invalidate by tags
   */
  async byTags(tags: string[]): Promise<void> {
    if (typeof window !== 'undefined') {
      // Client-side invalidation
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags }),
      })
    } else {
      // Server-side invalidation
      const { revalidateTag } = await import('next/cache')
      tags.forEach(tag => revalidateTag(tag))
    }
  },
  /**
   * Invalidate by path
   */
  async byPath(path: string): Promise<void> {
    if (typeof window !== 'undefined') {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
    } else {
      const { revalidatePath } = await import('next/cache')
      revalidatePath(path)
    }
  },
  /**
   * Clear all caches
   */
  async all(): Promise<void> {
    await this.byTags([cacheConfig.tags.all])
  },
}
/**
 * Edge caching with Cloudflare Workers KV (example)
 */
export class EdgeCache {
  private namespace: string
  constructor(namespace: string = 'figdream-cache') {
    this.namespace = namespace
  }
  /**
   * Get from edge cache
   */
  async get<T>(_key: string): Promise<T | null> {
    // This would connect to your edge provider's KV store
    // Example with Cloudflare Workers KV:
    // const value = await env.KV.get(key)
    // return value ? JSON.parse(value) : null
    // Placeholder implementation
    return null
  }
  /**
   * Set in edge cache
   */
  async set<T>(
    _key: string,
    _value: T,
    _options?: { expirationTtl?: number }
  ): Promise<void> {
    // This would connect to your edge provider's KV store
    // Example with Cloudflare Workers KV:
    // await env.KV.put(key, JSON.stringify(value), options)
    // Placeholder implementation
  }
  /**
   * Delete from edge cache
   */
  async delete(_key: string): Promise<void> {
    // This would connect to your edge provider's KV store
    // Example with Cloudflare Workers KV:
    // await env.KV.delete(key)
    // Placeholder implementation
  }
}
/**
 * Redis cache wrapper (if using Redis)
 */
export class RedisCache {
  // This would connect to your Redis instance
  // Example implementation:
  // private redis: Redis
  constructor() {
    // this.redis = new Redis(process.env.REDIS_URL)
  }
  async get<T>(_key: string): Promise<T | null> {
    // const value = await this.redis.get(key)
    // return value ? JSON.parse(value) : null
    return null
  }
  async set<T>(
    _key: string,
    _value: T,
    _ttl?: number
  ): Promise<void> {
    // await this.redis.set(key, JSON.stringify(value), 'EX', ttl)
  }
  async delete(_key: string): Promise<void> {
    // await this.redis.del(key)
  }
}