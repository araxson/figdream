import { logNetworkError } from './logger'
import { retry, retryConditions } from './retry'
/**
 * Network status type
 */
export type NetworkStatus = 'online' | 'offline' | 'slow' | 'unknown'
/**
 * Network error types
 */
export enum NetworkErrorType {
  OFFLINE = 'OFFLINE',
  TIMEOUT = 'TIMEOUT',
  CONNECTION_LOST = 'CONNECTION_LOST',
  SLOW_NETWORK = 'SLOW_NETWORK',
  DNS_FAILURE = 'DNS_FAILURE',
  SSL_ERROR = 'SSL_ERROR',
  CORS_ERROR = 'CORS_ERROR',
  UNKNOWN = 'UNKNOWN'
}
/**
 * Network error class
 */
export class NetworkError extends Error {
  public type: NetworkErrorType
  public url?: string
  public status?: number
  public retry?: boolean
  constructor(
    message: string,
    type: NetworkErrorType = NetworkErrorType.UNKNOWN,
    url?: string,
    status?: number,
    retry = true
  ) {
    super(message)
    this.name = 'NetworkError'
    this.type = type
    this.url = url
    this.status = status
    this.retry = retry
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError)
    }
  }
}
/**
 * Network monitor class
 */
export class NetworkMonitor {
  private status: NetworkStatus = 'unknown'
  private listeners: Set<(status: NetworkStatus) => void> = new Set()
  private pingInterval: NodeJS.Timeout | null = null
  private slowThreshold = 3000 // 3 seconds
  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }
  /**
   * Initialize network monitoring
   */
  private initialize(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => this.updateStatus('online'))
    window.addEventListener('offline', () => this.updateStatus('offline'))
    // Initial status check
    this.checkStatus()
    // Start periodic ping
    this.startPing()
  }
  /**
   * Check network status
   */
  private async checkStatus(): Promise<void> {
    if (!navigator.onLine) {
      this.updateStatus('offline')
      return
    }
    // Ping to check connection quality
    try {
      const start = Date.now()
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      const duration = Date.now() - start
      if (!response.ok) {
        this.updateStatus('offline')
      } else if (duration > this.slowThreshold) {
        this.updateStatus('slow')
      } else {
        this.updateStatus('online')
      }
    } catch {
      this.updateStatus('offline')
    }
  }
  /**
   * Start periodic ping
   */
  private startPing(): void {
    this.pingInterval = setInterval(() => {
      this.checkStatus()
    }, 30000) // Check every 30 seconds
  }
  /**
   * Stop periodic ping
   */
  stopPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }
  /**
   * Update network status
   */
  private updateStatus(status: NetworkStatus): void {
    if (this.status !== status) {
      this.status = status
      this.notifyListeners(status)
      // Log network status changes
      if (status === 'offline' || status === 'slow') {
        logNetworkError(`Network status changed to ${status}`)
      }
    }
  }
  /**
   * Get current network status
   */
  getStatus(): NetworkStatus {
    return this.status
  }
  /**
   * Check if network is available
   */
  isOnline(): boolean {
    return this.status === 'online' || this.status === 'slow'
  }
  /**
   * Subscribe to network status changes
   */
  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener)
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener)
    }
  }
  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach(listener => listener(status))
  }
}
// Create singleton instance
export const networkMonitor = new NetworkMonitor()
/**
 * Detect network error type from error object
 */
export function detectNetworkErrorType(error: unknown): NetworkErrorType {
  if (!error) return NetworkErrorType.UNKNOWN
  // Check if offline
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return NetworkErrorType.OFFLINE
  }
  // Check error message/type
  if (error instanceof TypeError) {
    if (error.message === 'Failed to fetch') {
      return NetworkErrorType.CONNECTION_LOST
    }
    if (error.message.includes('NetworkError')) {
      return NetworkErrorType.CONNECTION_LOST
    }
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    if (message.includes('timeout')) {
      return NetworkErrorType.TIMEOUT
    }
    if (message.includes('dns')) {
      return NetworkErrorType.DNS_FAILURE
    }
    if (message.includes('ssl') || message.includes('certificate')) {
      return NetworkErrorType.SSL_ERROR
    }
    if (message.includes('cors')) {
      return NetworkErrorType.CORS_ERROR
    }
    if (error.name === 'AbortError') {
      return NetworkErrorType.TIMEOUT
    }
  }
  return NetworkErrorType.UNKNOWN
}
/**
 * Handle network error with appropriate recovery
 */
export async function handleNetworkError(
  error: unknown,
  url?: string,
  retryFn?: () => Promise<unknown>
): Promise<void> {
  const errorType = detectNetworkErrorType(error)
  const networkError = new NetworkError(
    getNetworkErrorMessage(errorType),
    errorType,
    url
  )
  // Log the error
  logNetworkError(networkError, url)
  // Attempt retry if appropriate
  if (networkError.retry && retryFn) {
    try {
      await retry(retryFn, {
        maxAttempts: 3,
        retryCondition: retryConditions.any(
          retryConditions.networkErrors,
          retryConditions.timeoutErrors
        )
      })
    } catch (_retryError) {
      throw networkError
    }
  } else {
    throw networkError
  }
}
/**
 * Get user-friendly message for network error type
 */
export function getNetworkErrorMessage(type: NetworkErrorType): string {
  const messages: Record<NetworkErrorType, string> = {
    [NetworkErrorType.OFFLINE]: 'You appear to be offline. Please check your internet connection.',
    [NetworkErrorType.TIMEOUT]: 'The request timed out. Please try again.',
    [NetworkErrorType.CONNECTION_LOST]: 'Connection lost. Please check your network and try again.',
    [NetworkErrorType.SLOW_NETWORK]: 'Your network connection is slow. This may take longer than usual.',
    [NetworkErrorType.DNS_FAILURE]: 'Could not connect to the server. Please try again later.',
    [NetworkErrorType.SSL_ERROR]: 'Secure connection failed. Please contact support.',
    [NetworkErrorType.CORS_ERROR]: 'Cross-origin request blocked. Please contact support.',
    [NetworkErrorType.UNKNOWN]: 'A network error occurred. Please try again.'
  }
  return messages[type] || messages[NetworkErrorType.UNKNOWN]
}
/**
 * Fetch with network error handling
 */
export async function fetchWithNetworkHandling(
  url: string,
  options?: RequestInit,
  config?: {
    timeout?: number
    retries?: number
    onSlowNetwork?: () => void
  }
): Promise<Response> {
  const timeout = config?.timeout || 30000
  const controller = new AbortController()
  // Set timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  // Check for slow network
  const slowNetworkTimer = setTimeout(() => {
    if (config?.onSlowNetwork) {
      config.onSlowNetwork()
    }
  }, 5000)
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    clearTimeout(slowNetworkTimer)
    return response
  } catch (_error) {
    clearTimeout(timeoutId)
    clearTimeout(slowNetworkTimer)
    // Handle network error
    await handleNetworkError(
      error,
      url,
      config?.retries ? () => fetch(url, options) : undefined
    )
    throw error
  }
}
/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError
}
/**
 * Check if specific network error type
 */
export function isNetworkErrorType(error: unknown, type: NetworkErrorType): boolean {
  return isNetworkError(error) && error.type === type
}
/**
 * Wait for network to be available
 */
export function waitForNetwork(timeout = 30000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (networkMonitor.isOnline()) {
      resolve()
      return
    }
    const timeoutId = setTimeout(() => {
      unsubscribe()
      reject(new NetworkError('Network timeout', NetworkErrorType.TIMEOUT))
    }, timeout)
    const unsubscribe = networkMonitor.subscribe((status) => {
      if (status === 'online' || status === 'slow') {
        clearTimeout(timeoutId)
        unsubscribe()
        resolve()
      }
    })
  })
}