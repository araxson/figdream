'use server'

import { createClient } from '@/lib/supabase/server'

export interface ErrorReport {
  message: string
  stack?: string
  componentStack?: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
}

/**
 * Report error to monitoring system
 */
export async function reportErrorAction(
  errorData: ErrorReport
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()

    // Log error to console for immediate visibility
    console.error('[Error Reported]:', {
      ...errorData,
      userId: user?.id
    })

    // TODO: Store error in database when error_logs table is ready
    // For now, just log to console

    return { success: true }

  } catch (error) {
    console.error('Failed to report error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to report error'
    }
  }
}

/**
 * Report performance metrics
 */
export async function reportPerformanceMetricsAction(
  metrics: {
    name: string
    value: number
    unit: string
    timestamp: number
    category: string
  }[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()

    // Log performance metrics
    console.debug('[Performance Metrics]:', {
      metrics,
      userId: user?.id
    })

    // TODO: Store performance metrics when monitoring tables are ready

    return { success: true }

  } catch (error) {
    console.error('Failed to report performance metrics:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to report performance metrics'
    }
  }
}

/**
 * Report performance issue
 */
export async function reportPerformanceIssueAction(
  performanceData: {
    type: string
    value: number
    url: string
    timestamp: string
    details?: any
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()

    // Log performance issue
    console.warn('[Performance Issue]:', {
      ...performanceData,
      userId: user?.id
    })

    // TODO: Store performance data when monitoring tables are ready

    return { success: true }

  } catch (error) {
    console.error('Failed to report performance issue:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to report performance issue'
    }
  }
}