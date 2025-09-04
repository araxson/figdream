/**
 * Performance Optimization Utilities for FigDream
 * Implements various performance optimization strategies
 */
import dynamic from 'next/dynamic'
import React, { ComponentType } from 'react'
/**
 * Image optimization configuration
 */
export const imageOptimizationConfig = {
  deviceSizes: [640, 768, 1024, 1280, 1536],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
}
/**
 * Lazy load a component with loading state
 */
export function lazyLoadComponent<T extends ComponentType<unknown>>(
  importFunc: () => Promise<{ default: T }>,
  loadingComponent?: ComponentType
) {
  return dynamic(importFunc, {
    loading: loadingComponent ? () => React.createElement(loadingComponent) : undefined,
    ssr: true,
  })
}
/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return function (this: unknown, ...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(this, args), delay)
  }
}
/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      inThrottle = true
      func.apply(this, args)
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
/**
 * Memoize expensive computations
 */
export function memoize<T extends (...args: never[]) => unknown>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, unknown>()
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }
    const result = func(...args) as ReturnType<T>
    cache.set(key, result)
    // Limit cache size to prevent memory leaks
    if (cache.size > 100) {
      const firstKey = cache.keys().next().value as string
      cache.delete(firstKey)
    }
    return result
  }) as T
}
/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !window.IntersectionObserver) {
    return null
  }
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.01,
    ...options,
  })
}
/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string): void {
  if (typeof window === 'undefined') return
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = as
  link.href = href
  if (as === 'font') {
    link.crossOrigin = 'anonymous'
  }
  document.head.appendChild(link)
}
/**
 * Prefetch resources for upcoming navigation
 */
export function prefetchResources(urls: string[]): void {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return
  }
  urls.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = url
    document.head.appendChild(link)
  })
}
// Web Vitals functionality removed as per project requirements
// Use PerformanceMonitor class below for custom performance tracking
/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && window.requestIdleCallback
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback): number => {
        const start = Date.now()
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          })
        }, 1) as unknown as number
      }
/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && window.cancelIdleCallback
    ? window.cancelIdleCallback
    : clearTimeout
/**
 * Batch DOM updates
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  requestIdleCallback(() => {
    updates.forEach(update => update())
  })
}
/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  itemHeight: number
  containerHeight: number
  bufferSize: number
  data: unknown[]
}
export function calculateVirtualScrollIndices(
  scrollTop: number,
  config: VirtualScrollConfig
): { startIndex: number; endIndex: number } {
  const { itemHeight, containerHeight, bufferSize, data } = config
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize)
  const endIndex = Math.min(
    data.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + bufferSize
  )
  return { startIndex, endIndex }
}
/**
 * Code splitting boundaries
 */
export const codeSplitBoundaries = {
  // Route-based splitting
  routes: [
    '/customer/*',
    '/salon-owner/*',
    '/super-admin/*',
    '/staff-member/*',
    '/location-manager/*',
  ],
  // Component-based splitting
  components: [
    'BookingCalendar',
    'PaymentForm',
    'ReviewSystem',
    'MarketingDashboard',
    'AnalyticsCharts',
  ],
  // Library-based splitting
  libraries: [
    '@stripe/stripe-js',
    'react-big-calendar',
    'recharts',
    '@tanstack/react-table',
  ],
}
/**
 * Resource hints for better loading
 */
export function addResourceHints(): void {
  if (typeof window === 'undefined') return
  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'https://api.stripe.com',
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net',
  ]
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = domain
    document.head.appendChild(link)
  })
  // Preconnect to critical domains
  const preconnectDomains = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'https://fonts.gstatic.com',
  ]
  preconnectDomains.forEach(domain => {
    if (domain) {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = domain
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    }
  })
}
/**
 * Service Worker registration
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    return registration
  } catch (_error) {
    return null
  }
}
/**
 * Cache strategies
 */
export const cacheStrategies = {
  // Static assets - cache first
  static: {
    cacheName: 'static-v1',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    maxEntries: 100,
  },
  // API responses - network first with cache fallback
  api: {
    cacheName: 'api-v1',
    maxAge: 60 * 5, // 5 minutes
    maxEntries: 50,
  },
  // Images - cache first with network fallback
  images: {
    cacheName: 'images-v1',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    maxEntries: 200,
  },
}
/**
 * Performance monitoring
 */
export class PerformanceMonitor {
  private marks: Map<string, number> = new Map()
  private measures: Map<string, number> = new Map()
  mark(name: string): void {
    this.marks.set(name, performance.now())
  }
  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark)
    const end = endMark ? this.marks.get(endMark) : performance.now()
    if (start === undefined || (endMark && end === undefined)) {
      return 0
    }
    const duration = (end || performance.now()) - start
    this.measures.set(name, duration)
    if (process.env.NODE_ENV === 'development') {
      // Performance: ${name}: ${duration.toFixed(2)}ms
    }
    return duration
  }
  getMeasures(): Record<string, number> {
    return Object.fromEntries(this.measures)
  }
  clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}
// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()