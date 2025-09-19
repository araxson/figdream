'use client'

// Performance monitoring component for tracking and reporting metrics
import { useEffect, ReactNode } from 'react'
import type { PerformanceMetric } from '../types'

interface PerformanceMonitorProps {
  children: ReactNode
}

export function PerformanceMonitor({ children }: PerformanceMonitorProps) {
  useEffect(() => {
    const metrics: PerformanceMetric[] = []

    // Monitor navigation timing
    const observeNavigation = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

        if (navigation) {
          metrics.push({
            name: 'page-load',
            value: navigation.loadEventEnd - navigation.fetchStart,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'navigation'
          })

          metrics.push({
            name: 'dom-content-loaded',
            value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'navigation'
          })

          metrics.push({
            name: 'first-contentful-paint',
            value: navigation.responseEnd - navigation.fetchStart,
            unit: 'ms',
            timestamp: Date.now(),
            category: 'render'
          })
        }
      }
    }

    // Monitor resource loading
    const observeResources = () => {
      if (typeof window !== 'undefined' && window.performance) {
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

        const apiCalls = resources.filter(r => r.name.includes('/api/'))
        const avgApiTime = apiCalls.reduce((acc, r) => acc + r.duration, 0) / (apiCalls.length || 1)

        if (apiCalls.length > 0) {
          metrics.push({
            name: 'avg-api-response',
            value: Math.round(avgApiTime),
            unit: 'ms',
            timestamp: Date.now(),
            category: 'api'
          })
        }

        // Track bundle sizes
        const jsResources = resources.filter(r => r.name.endsWith('.js'))
        const totalJsSize = jsResources.reduce((acc, r) => acc + (r.transferSize || 0), 0)

        if (totalJsSize > 0) {
          metrics.push({
            name: 'total-js-size',
            value: Math.round(totalJsSize / 1024),
            unit: 'kb',
            timestamp: Date.now(),
            category: 'resource'
          })
        }
      }
    }

    // Monitor long tasks
    let longTaskObserver: PerformanceObserver | null = null

    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              metrics.push({
                name: 'long-task',
                value: Math.round(entry.duration),
                unit: 'ms',
                timestamp: Date.now(),
                category: 'render'
              })

              // Report if task is too long
              if (entry.duration > 200) {
                reportPerformanceIssue('long-task', entry.duration)
              }
            }
          }
        })

        longTaskObserver.observe({ entryTypes: ['longtask'] })
      } catch (e) {
        console.debug('Long task observer not supported')
      }
    }

    // Monitor memory usage
    const monitorMemory = () => {
      if (typeof window !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory

        if (memory) {
          const usedMemoryMB = Math.round(memory.usedJSHeapSize / 1048576)
          const limitMemoryMB = Math.round(memory.jsHeapSizeLimit / 1048576)

          metrics.push({
            name: 'memory-usage',
            value: Math.round((usedMemoryMB / limitMemoryMB) * 100),
            unit: '%',
            timestamp: Date.now(),
            category: 'resource'
          })

          // Alert if memory usage is high
          if (usedMemoryMB / limitMemoryMB > 0.9) {
            reportPerformanceIssue('high-memory', usedMemoryMB)
          }
        }
      }
    }

    // Send metrics to server periodically
    const sendMetrics = async () => {
      if (metrics.length > 0) {
        try {
          const { reportPerformanceMetricsAction } = await import('@/core/monitoring/actions/error-actions')
          await reportPerformanceMetricsAction([...metrics])
        } catch (err) {
          console.debug('Failed to send performance metrics:', err)
        }

        // Clear sent metrics
        metrics.length = 0
      }
    }

    // Report performance issues
    const reportPerformanceIssue = async (type: string, value: number) => {
      try {
        const { reportPerformanceIssueAction } = await import('@/core/monitoring/actions/error-actions')
        await reportPerformanceIssueAction({
          type,
          value,
          url: window.location.href,
          timestamp: new Date().toISOString()
        })
      } catch (err) {
        console.debug('Failed to report performance issue:', err)
      }
    }

    // Run initial observations
    setTimeout(() => {
      observeNavigation()
      observeResources()
      monitorMemory()
    }, 1000)

    // Set up periodic monitoring
    const monitoringInterval = setInterval(() => {
      observeResources()
      monitorMemory()
    }, 30000) // Every 30 seconds

    // Send metrics every minute
    const metricsInterval = setInterval(sendMetrics, 60000)

    // Monitor route changes
    const handleRouteChange = () => {
      // Mark route change
      metrics.push({
        name: 'route-change',
        value: 1,
        unit: 'ms',
        timestamp: Date.now(),
        category: 'navigation'
      })

      // Re-observe after route change
      setTimeout(() => {
        observeResources()
        monitorMemory()
      }, 500)
    }

    window.addEventListener('popstate', handleRouteChange)

    // Cleanup
    return () => {
      clearInterval(monitoringInterval)
      clearInterval(metricsInterval)
      window.removeEventListener('popstate', handleRouteChange)
      longTaskObserver?.disconnect()
      sendMetrics() // Send any remaining metrics
    }
  }, [])

  return <>{children}</>
}