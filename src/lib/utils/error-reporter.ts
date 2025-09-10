interface ErrorContext {
  level?: 'page' | 'section' | 'component'
  componentStack?: string
  errorInfo?: unknown
  userId?: string
  sessionId?: string
  [key: string]: unknown
}

interface ErrorReport {
  message: string
  stack?: string
  timestamp: string
  url: string
  userAgent: string
  context: ErrorContext
}

class ErrorReporter {
  private queue: ErrorReport[] = []
  private isOnline: boolean = true
  private maxRetries: number = 3
  private retryDelay: number = 1000
  private onlineHandler: (() => void) | null = null
  private offlineHandler: (() => void) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine
      
      this.onlineHandler = () => {
        this.isOnline = true
        this.flushQueue()
      }
      this.offlineHandler = () => {
        this.isOnline = false
      }
      
      window.addEventListener('online', this.onlineHandler)
      window.addEventListener('offline', this.offlineHandler)
    }
  }
  
  /**
   * Clean up event listeners
   */
  cleanup() {
    if (typeof window !== 'undefined') {
      if (this.onlineHandler) {
        window.removeEventListener('online', this.onlineHandler)
      }
      if (this.offlineHandler) {
        window.removeEventListener('offline', this.offlineHandler)
      }
    }
  }

  /**
   * Capture and report an error
   */
  async captureError(error: Error, context: ErrorContext = {}) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      context
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 Error Captured')
      console.error('Error:', error)
      console.error('Context:', context)
    }

    // Add to queue
    this.queue.push(report)

    // Send immediately if online, otherwise queue
    if (this.isOnline) {
      await this.sendReport(report)
    }
  }

  /**
   * Send error report to backend
   */
  private async sendReport(report: ErrorReport, retries = 0): Promise<void> {
    try {
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      })

      if (!response.ok && retries < this.maxRetries) {
        // Retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retries)))
        return this.sendReport(report, retries + 1)
      }

      // Remove from queue if successful
      this.queue = this.queue.filter(r => r !== report)
    } catch {
      if (retries < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retries)))
        return this.sendReport(report, retries + 1)
      }
      
      // Store in localStorage as fallback
      this.storeLocally(report)
    }
  }

  /**
   * Store error report locally when unable to send
   */
  private storeLocally(report: ErrorReport) {
    if (typeof localStorage === 'undefined') return

    try {
      const stored = localStorage.getItem('error_reports') || '[]'
      const reports = JSON.parse(stored)
      reports.push(report)
      
      // Keep only last 50 errors
      if (reports.length > 50) {
        reports.shift()
      }
      
      localStorage.setItem('error_reports', JSON.stringify(reports))
    } catch (e) {
      console.error('Failed to store error locally:', e)
    }
  }

  /**
   * Flush queued error reports
   */
  private async flushQueue() {
    const reports = [...this.queue]
    for (const report of reports) {
      await this.sendReport(report)
    }

    // Also try to send locally stored errors
    this.sendStoredReports()
  }

  /**
   * Send locally stored error reports
   */
  private async sendStoredReports() {
    if (typeof localStorage === 'undefined') return

    try {
      const stored = localStorage.getItem('error_reports')
      if (!stored) return

      const reports: ErrorReport[] = JSON.parse(stored)
      
      for (const report of reports) {
        await this.sendReport(report)
      }

      // Clear stored reports after successful send
      localStorage.removeItem('error_reports')
    } catch (e) {
      console.error('Failed to send stored errors:', e)
    }
  }

  /**
   * Get error statistics
   */
  getStats() {
    return {
      queuedErrors: this.queue.length,
      isOnline: this.isOnline,
      storedErrors: this.getStoredErrorCount()
    }
  }

  private getStoredErrorCount(): number {
    if (typeof localStorage === 'undefined') return 0
    
    try {
      const stored = localStorage.getItem('error_reports')
      if (!stored) return 0
      return JSON.parse(stored).length
    } catch {
      return 0
    }
  }
}

// Create singleton instance
const errorReporter = new ErrorReporter()

// Export functions
export const captureError = (error: Error, context?: ErrorContext) => 
  errorReporter.captureError(error, context)

export const getErrorStats = () => errorReporter.getStats()

// Global error handlers
if (typeof window !== 'undefined') {
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    captureError(new Error(event.message), {
      level: 'page',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    })
  })

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    captureError(new Error(event.reason?.message || 'Unhandled Promise Rejection'), {
      level: 'page',
      reason: event.reason
    })
  })
}