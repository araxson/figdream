/**
 * Error logging utilities for the application
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'
export type ErrorCategory = 'auth' | 'api' | 'validation' | 'network' | 'ui' | 'unknown'
export interface ErrorLog {
  id: string
  message: string
  severity: ErrorSeverity
  category: ErrorCategory
  timestamp: Date
  stack?: string
  context?: Record<string, unknown>
  userId?: string
  sessionId?: string
  url?: string
  userAgent?: string
}
export interface ErrorLoggerConfig {
  enableConsoleLog: boolean
  enableRemoteLogging: boolean
  remoteEndpoint?: string
  environment: 'development' | 'staging' | 'production'
  userId?: string
  sessionId?: string
}
class ErrorLogger {
  private config: ErrorLoggerConfig
  private errorQueue: ErrorLog[] = []
  private maxQueueSize = 50
  private flushInterval = 30000 // 30 seconds
  constructor(config?: Partial<ErrorLoggerConfig>) {
    this.config = {
      enableConsoleLog: process.env.NODE_ENV === 'development',
      enableRemoteLogging: process.env.NODE_ENV === 'production',
      environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
      ...config
    }
    // Start flush interval for remote logging
    if (this.config.enableRemoteLogging) {
      this.startFlushInterval()
    }
  }
  /**
   * Log an error with severity and category
   */
  public logError(
    error: Error | string,
    severity: ErrorSeverity = 'medium',
    category: ErrorCategory = 'unknown',
    context?: Record<string, unknown>
  ): string {
    const errorLog = this.createErrorLog(error, severity, category, context)
    // Console logging
    if (this.config.enableConsoleLog) {
      this.logToConsole(errorLog)
    }
    // Add to queue for remote logging
    if (this.config.enableRemoteLogging) {
      this.addToQueue(errorLog)
    }
    return errorLog.id
  }
  /**
   * Log authentication errors
   */
  public logAuthError(error: Error | string, context?: Record<string, unknown>): string {
    return this.logError(error, 'high', 'auth', context)
  }
  /**
   * Log API errors
   */
  public logApiError(
    error: Error | string,
    endpoint?: string,
    statusCode?: number,
    context?: Record<string, unknown>
  ): string {
    return this.logError(error, 'medium', 'api', {
      endpoint,
      statusCode,
      ...context
    })
  }
  /**
   * Log validation errors
   */
  public logValidationError(
    field: string,
    message: string,
    context?: Record<string, unknown>
  ): string {
    return this.logError(message, 'low', 'validation', {
      field,
      ...context
    })
  }
  /**
   * Log network errors
   */
  public logNetworkError(
    error: Error | string,
    url?: string,
    context?: Record<string, unknown>
  ): string {
    return this.logError(error, 'high', 'network', {
      url,
      ...context
    })
  }
  /**
   * Log UI errors
   */
  public logUIError(
    error: Error | string,
    component?: string,
    context?: Record<string, unknown>
  ): string {
    return this.logError(error, 'low', 'ui', {
      component,
      ...context
    })
  }
  /**
   * Log critical errors that need immediate attention
   */
  public logCriticalError(
    error: Error | string,
    category: ErrorCategory = 'unknown',
    context?: Record<string, unknown>
  ): string {
    const id = this.logError(error, 'critical', category, context)
    // Immediately flush critical errors
    if (this.config.enableRemoteLogging) {
      this.flushErrors()
    }
    return id
  }
  /**
   * Create error log object
   */
  private createErrorLog(
    error: Error | string,
    severity: ErrorSeverity,
    category: ErrorCategory,
    context?: Record<string, unknown>
  ): ErrorLog {
    const message = typeof error === 'string' ? error : error.message
    const stack = typeof error === 'object' ? error.stack : undefined
    return {
      id: this.generateId(),
      message,
      severity,
      category,
      timestamp: new Date(),
      stack,
      context,
      userId: this.config.userId,
      sessionId: this.config.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    }
  }
  /**
   * Log to console with appropriate styling
   */
  private logToConsole(_errorLog: ErrorLog): void {
    // Console logging disabled in production
  }
  /**
   * Get console style based on severity
   */
  private getConsoleStyle(severity: ErrorSeverity): string {
    const styles = {
      low: 'color: #6b7280; font-weight: normal;',
      medium: 'color: #f59e0b; font-weight: bold;',
      high: 'color: #ef4444; font-weight: bold;',
      critical: 'color: #ffffff; background-color: #dc2626; padding: 2px 4px; font-weight: bold;'
    }
    return styles[severity]
  }
  /**
   * Add error to queue for batch sending
   */
  private addToQueue(errorLog: ErrorLog): void {
    this.errorQueue.push(errorLog)
    // Flush if queue is full
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushErrors()
    }
  }
  /**
   * Send errors to remote logging service
   */
  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return
    const errors = [...this.errorQueue]
    this.errorQueue = []
    try {
      if (this.config.remoteEndpoint) {
        const response = await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            errors,
            environment: this.config.environment
          })
        })
        if (!response.ok) {
        }
      }
    } catch (_err) {
      // Re-add errors to queue if sending failed
      this.errorQueue.unshift(...errors)
    }
  }
  /**
   * Start interval for flushing errors
   */
  private startFlushInterval(): void {
    setInterval(() => {
      this.flushErrors()
    }, this.flushInterval)
  }
  /**
   * Generate unique ID for error log
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  /**
   * Set user context for all future logs
   */
  public setUserContext(userId?: string, sessionId?: string): void {
    this.config.userId = userId
    this.config.sessionId = sessionId
  }
  /**
   * Clear user context
   */
  public clearUserContext(): void {
    this.config.userId = undefined
    this.config.sessionId = undefined
  }
  /**
   * Get error statistics
   */
  public getErrorStats(): {
    total: number
    bySeverity: Record<ErrorSeverity, number>
    byCategory: Record<ErrorCategory, number>
  } {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      byCategory: {
        auth: 0,
        api: 0,
        validation: 0,
        network: 0,
        ui: 0,
        unknown: 0
      }
    }
    this.errorQueue.forEach(error => {
      stats.bySeverity[error.severity]++
      stats.byCategory[error.category]++
    })
    return stats
  }
}
// Create singleton instance
const errorLogger = new ErrorLogger()
// Export instance and class
export { errorLogger, ErrorLogger }
// Convenience functions
export const logError = errorLogger.logError.bind(errorLogger)
export const logAuthError = errorLogger.logAuthError.bind(errorLogger)
export const logApiError = errorLogger.logApiError.bind(errorLogger)
export const logValidationError = errorLogger.logValidationError.bind(errorLogger)
export const logNetworkError = errorLogger.logNetworkError.bind(errorLogger)
export const logUIError = errorLogger.logUIError.bind(errorLogger)
export const logCriticalError = errorLogger.logCriticalError.bind(errorLogger)