'use client'

import { ReactNode, useEffect, useState, useRef, useCallback } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Skeleton loader that matches exact UI dimensions
export interface SkeletonLoaderProps {
  className?: string
  variant?: 'default' | 'card' | 'table-row' | 'list-item' | 'form'
  count?: number
  animate?: boolean
}

export function SkeletonLoader({
  className,
  variant = 'default',
  count = 1,
  animate = true
}: SkeletonLoaderProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i)

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card className={cn('w-full', className)}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </CardContent>
          </Card>
        )

      case 'table-row':
        return (
          <div className={cn('flex items-center gap-4 p-4 border-b', className)}>
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        )

      case 'list-item':
        return (
          <div className={cn('flex items-start gap-3 p-3', className)}>
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        )

      case 'form':
        return (
          <div className={cn('space-y-4', className)}>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        )

      default:
        return <Skeleton className={cn('h-4 w-full', className)} />
    }
  }

  if (!animate) {
    return <>{skeletons.map(i => <div key={i}>{renderSkeleton()}</div>)}</>
  }

  return (
    <>
      {skeletons.map(i => (
        <div
          key={i}
          className="animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          {renderSkeleton()}
        </div>
      ))}
    </>
  )
}

// Progressive loader for lists
export interface ProgressiveListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  batchSize?: number
  delay?: number
  skeleton?: ReactNode
  onLoadComplete?: () => void
}

export function ProgressiveList<T>({
  items,
  renderItem,
  batchSize = 10,
  delay = 50,
  skeleton,
  onLoadComplete
}: ProgressiveListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(batchSize)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (visibleCount >= items.length) {
      setIsLoading(false)
      onLoadComplete?.()
      return
    }

    const timer = setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + batchSize, items.length))
    }, delay)

    return () => clearTimeout(timer)
  }, [visibleCount, items.length, batchSize, delay, onLoadComplete])

  return (
    <>
      {items.slice(0, visibleCount).map((item, index) => (
        <div key={index} className="animate-in fade-in slide-in-from-bottom-2">
          {renderItem(item, index)}
        </div>
      ))}
      {isLoading && skeleton}
    </>
  )
}

// Lazy loader for below-fold content
export interface LazyLoadProps {
  children: ReactNode
  placeholder?: ReactNode
  rootMargin?: string
  threshold?: number
  onVisible?: () => void
}

export function LazyLoad({
  children,
  placeholder,
  rootMargin = '100px',
  threshold = 0.1,
  onVisible
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
          onVisible?.()
        }
      },
      { rootMargin, threshold }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [rootMargin, threshold, onVisible, isVisible])

  return (
    <div ref={containerRef}>
      {isVisible ? children : placeholder || <SkeletonLoader />}
    </div>
  )
}

// Prefetch manager for navigation
class PrefetchManager {
  private cache = new Map<string, Promise<any>>()
  private pending = new Set<string>()

  async prefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 60000
  ): Promise<T> {
    // Return cached if available
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    // Prevent duplicate fetches
    if (this.pending.has(key)) {
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (this.cache.has(key)) {
            clearInterval(check)
            resolve(this.cache.get(key)!)
          }
        }, 100)

        // Add timeout to prevent infinite waiting
        const timeout = setTimeout(() => {
          clearInterval(check)
          reject(new Error('Prefetch timeout'))
        }, 10000) // 10 second timeout

        // Store cleanup function
        const originalResolve = resolve
        resolve = (value: any) => {
          clearTimeout(timeout)
          originalResolve(value)
        }
      })
    }

    this.pending.add(key)

    const promise = fetcher().then(data => {
      this.pending.delete(key)

      // Set TTL for cache
      setTimeout(() => {
        this.cache.delete(key)
      }, ttl)

      return data
    })

    this.cache.set(key, promise)
    return promise
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

export const prefetchManager = new PrefetchManager()

// Prefetch on hover/focus
export interface PrefetchLinkProps {
  href: string
  prefetchFn: () => Promise<any>
  children: ReactNode
  className?: string
  prefetchDelay?: number
}

export function PrefetchLink({
  href,
  prefetchFn,
  children,
  className,
  prefetchDelay = 200
}: PrefetchLinkProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()

  const handlePrefetch = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      prefetchManager.prefetch(href, prefetchFn)
    }, prefetchDelay)
  }, [href, prefetchFn, prefetchDelay])

  const handleCancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      onMouseLeave={handleCancel}
      onBlur={handleCancel}
    >
      {children}
    </a>
  )
}

// Background refresh pattern
export function useBackgroundRefresh<T>(
  fetcher: () => Promise<T>,
  options: {
    interval?: number
    enabled?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  } = {}
) {
  const {
    interval = 30000,
    enabled = true,
    onSuccess,
    onError
  } = options

  const [data, setData] = useState<T | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const refresh = async () => {
      setIsRefreshing(true)
      try {
        const newData = await fetcher()
        setData(newData)
        onSuccess?.(newData)
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('Refresh failed'))
      } finally {
        setIsRefreshing(false)
      }
    }

    // Initial fetch
    refresh()

    // Set up interval
    const intervalId = setInterval(refresh, interval)

    // Refresh on focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refresh()
      }
    }

    document.addEventListener('visibilitychange', handleFocus)

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleFocus)
    }
  }, [fetcher, interval, enabled, onSuccess, onError])

  return { data, isRefreshing }
}

// Content placeholder with shimmer effect
export function ContentPlaceholder({
  lines = 3,
  className
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded animate-shimmer"
          style={{
            width: `${100 - i * 10}%`,
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  )
}

// Image with progressive loading
export interface ProgressiveImageProps {
  src: string
  alt: string
  className?: string
  placeholderSrc?: string
  onLoad?: () => void
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholderSrc,
  onLoad
}: ProgressiveImageProps) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const img = new Image()
    img.src = src

    img.onload = () => {
      setCurrentSrc(src)
      setIsLoading(false)
      onLoad?.()
    }

    return () => {
      img.onload = null
    }
  }, [src, onLoad])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  )
}