/**
 * Web Vitals Monitoring Component for FigDream
 * Tracks and reports Core Web Vitals metrics
 */

'use client'

import { useEffect } from 'react'
import { onCLS, onFCP, onFID, onLCP, onTTFB, onINP } from 'web-vitals'
import { reportWebVitals, type WebVitalsMetric } from '@/lib/performance/optimization'

export function WebVitalsReporter() {
  useEffect(() => {
    // Report Core Web Vitals
    onCLS((metric) => reportMetric(metric))
    onFCP((metric) => reportMetric(metric))
    onFID((metric) => reportMetric(metric))
    onLCP((metric) => reportMetric(metric))
    onTTFB((metric) => reportMetric(metric))
    onINP((metric) => reportMetric(metric))
  }, [])

  return null
}

function reportMetric(metric: any) {
  const formattedMetric: WebVitalsMetric = {
    name: metric.name as WebVitalsMetric['name'],
    value: metric.value,
    rating: metric.rating as WebVitalsMetric['rating'],
  }

  reportWebVitals(formattedMetric)

  // Send to analytics endpoint
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metric: formattedMetric,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch((error) => {
      console.error('Failed to report web vitals:', error)
    })
  }
}