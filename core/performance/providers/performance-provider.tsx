'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { observeWebVitals, reportMetrics, markPerformance, getNetworkInfo, getMemoryUsage } from '../utils/metrics'

interface PerformanceContextValue {
  metrics: Map<string, number>
  vitals: any[]
  networkInfo: any
  memoryInfo: any
  markEvent: (name: string) => void
  measureEvent: (name: string, start: string, end: string) => number | null
}

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined)

interface PerformanceProviderProps {
  children: ReactNode
  enabled?: boolean
  reportingEndpoint?: string
  reportingInterval?: number
}

export function PerformanceProvider({
  children,
  enabled = process.env.NODE_ENV === 'production',
  reportingEndpoint,
  reportingInterval = 30000 // 30 seconds
}: PerformanceProviderProps) {
  const [metrics] = useState(new Map<string, number>())
  const [vitals, setVitals] = useState<any[]>([])
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    if (!enabled) return

    // Mark initial app load
    markPerformance('app-init')

    // Observe Core Web Vitals
    const collectedVitals: any[] = []
    observeWebVitals((metric) => {
      collectedVitals.push(metric)
      setVitals([...collectedVitals])

      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.info(`[Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`)
      }
    })

    // Monitor network changes
    const updateNetworkInfo = () => {
      const info = getNetworkInfo()
      setNetworkInfo(info)

      if (info?.saveData) {
        console.info('[Performance] Data saver mode detected, reducing quality')
      }
    }

    updateNetworkInfo()
    if ('connection' in navigator) {
      (navigator as any).connection?.addEventListener('change', updateNetworkInfo)
    }

    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      const memory = getMemoryUsage()
      setMemoryInfo(memory)

      if (memory) {
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
        if (usagePercent > 80) {
          console.warn(`[Performance] High memory usage: ${usagePercent.toFixed(1)}%`)
        }
      }
    }, 10000) // Check every 10 seconds

    // Report metrics periodically
    let reportInterval: NodeJS.Timeout | undefined

    if (reportingEndpoint) {
      reportInterval = setInterval(async () => {
        if (collectedVitals.length > 0) {
          try {
            await fetch(reportingEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                vitals: collectedVitals,
                network: networkInfo,
                memory: memoryInfo,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
              })
            })
          } catch (error) {
            console.error('[Performance] Failed to report metrics:', error)
          }
        }
      }, reportingInterval)
    }

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        markPerformance('page-hidden')
      } else {
        markPerformance('page-visible')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Mark app ready
    if (document.readyState === 'complete') {
      markPerformance('app-ready')
    } else {
      window.addEventListener('load', () => markPerformance('app-ready'))
    }

    return () => {
      if ('connection' in navigator) {
        (navigator as any).connection?.removeEventListener('change', updateNetworkInfo)
      }
      clearInterval(memoryInterval)
      if (reportInterval) clearInterval(reportInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, reportingEndpoint, reportingInterval])

  const markEvent = (name: string) => {
    if (!enabled) return
    markPerformance(name)
    metrics.set(name, performance.now())
  }

  const measureEvent = (name: string, start: string, end: string): number | null => {
    if (!enabled) return null

    try {
      performance.measure(name, start, end)
      const measures = performance.getEntriesByName(name, 'measure')
      if (measures.length > 0) {
        const duration = measures[0].duration
        metrics.set(name, duration)
        return duration
      }
    } catch (error) {
      console.warn(`[Performance] Failed to measure ${name}:`, error)
    }

    return null
  }

  const value: PerformanceContextValue = {
    metrics,
    vitals,
    networkInfo,
    memoryInfo,
    markEvent,
    measureEvent
  }

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  )
}

export function usePerformance() {
  const context = useContext(PerformanceContext)
  if (!context) {
    // Return no-op functions when provider is not present
    return {
      metrics: new Map(),
      vitals: [],
      networkInfo: null,
      memoryInfo: null,
      markEvent: () => {},
      measureEvent: () => null
    }
  }
  return context
}

// Hook for performance budgets
export function usePerformanceBudget(budgets: Record<string, number>) {
  const { vitals } = usePerformance()
  const [violations, setViolations] = useState<string[]>([])

  useEffect(() => {
    const newViolations: string[] = []

    vitals.forEach((vital) => {
      const budget = budgets[vital.name]
      if (budget && vital.value > budget) {
        newViolations.push(`${vital.name} exceeded budget: ${vital.value}ms > ${budget}ms`)
      }
    })

    setViolations(newViolations)

    if (newViolations.length > 0 && process.env.NODE_ENV === 'development') {
      console.warn('[Performance Budget Violations]', newViolations)
    }
  }, [vitals, budgets])

  return { violations, hasViolations: violations.length > 0 }
}

// Hook for adaptive loading based on network/device
export function useAdaptiveLoading() {
  const { networkInfo, memoryInfo } = usePerformance()

  const quality = (() => {
    // Use data saver mode
    if (networkInfo?.saveData) return 'low'

    // Check connection speed
    if (networkInfo?.effectiveType) {
      if (networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
        return 'low'
      }
      if (networkInfo.effectiveType === '3g') {
        return 'medium'
      }
    }

    // Check memory usage
    if (memoryInfo) {
      const usagePercent = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
      if (usagePercent > 70) return 'medium'
    }

    return 'high'
  })()

  return {
    quality,
    shouldReduceMotion: quality === 'low',
    shouldLazyLoad: quality !== 'high',
    imageQuality: quality === 'low' ? 50 : quality === 'medium' ? 70 : 90,
    videoAutoplay: quality === 'high'
  }
}