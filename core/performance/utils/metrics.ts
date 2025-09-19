// Performance metrics tracking utilities
export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
  TTI: { good: 3800, poor: 7300 }  // Time to Interactive
}

// Performance observer for Core Web Vitals
export function observeWebVitals(callback: (metric: PerformanceMetric) => void) {
  if (typeof window === 'undefined') return

  // Observe LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any
      const value = lastEntry.renderTime || lastEntry.loadTime

      callback({
        name: 'LCP',
        value,
        rating: getRating('LCP', value),
        timestamp: Date.now()
      })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    console.warn('LCP observer not supported')
  }

  // Observe FID
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        if (entry.name === 'first-input') {
          const value = entry.processingStart - entry.startTime
          callback({
            name: 'FID',
            value,
            rating: getRating('FID', value),
            timestamp: Date.now()
          })
        }
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
  } catch (e) {
    console.warn('FID observer not supported')
  }

  // Observe CLS
  let clsValue = 0
  let clsEntries: any[] = []

  try {
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          const firstSessionEntry = clsEntries[0]
          const lastSessionEntry = clsEntries[clsEntries.length - 1]

          if (firstSessionEntry &&
              (entry as any).startTime - lastSessionEntry.startTime < 1000 &&
              (entry as any).startTime - firstSessionEntry.startTime < 5000) {
            clsEntries.push(entry)
            clsValue += (entry as any).value
          } else {
            clsEntries = [entry]
            clsValue = (entry as any).value
          }
        }
      }

      callback({
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        timestamp: Date.now()
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
  } catch (e) {
    console.warn('CLS observer not supported')
  }
}

// Get rating for a metric value
function getRating(metric: keyof typeof THRESHOLDS, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric]
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Mark custom performance points
export function markPerformance(name: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(name)
  }
}

// Measure between marks
export function measurePerformance(name: string, startMark: string, endMark: string): number | null {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(name, startMark, endMark)
      const measures = performance.getEntriesByName(name)
      return measures.length > 0 ? measures[0].duration : null
    } catch (e) {
      console.warn(`Failed to measure ${name}`)
      return null
    }
  }
  return null
}

// Report metrics to analytics service
export function reportMetrics(metrics: PerformanceMetric[]) {
  // In production, send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics, Vercel Analytics, etc.
    console.log('Reporting metrics:', metrics)
  }
}

// Performance budget checker
export function checkPerformanceBudget(metric: string, value: number): boolean {
  const budget = THRESHOLDS[metric as keyof typeof THRESHOLDS]
  if (!budget) return true
  return value <= budget.good
}

// Network information API
export function getNetworkInfo() {
  if (typeof window !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection
    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    }
  }
  return null
}

// Memory usage monitoring
export function getMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    }
  }
  return null
}