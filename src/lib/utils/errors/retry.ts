import { logError } from './logger'
/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts?: number
  initialDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: unknown, attempt: number) => boolean
  onRetry?: (error: unknown, attempt: number) => void
}
/**
 * Default retry configuration
 */
const defaultConfig: Required<RetryConfig> = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  retryCondition: () => true,
  onRetry: () => {}
}
/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffFactor: number
): number {
  const delay = initialDelay * Math.pow(backoffFactor, attempt - 1)
  return Math.min(delay, maxDelay)
}
/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config?: RetryConfig
): Promise<T> {
  const options = { ...defaultConfig, ...config }
  let lastError: unknown
  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (_error) {
      lastError = error
      // Check if we should retry
      if (attempt === options.maxAttempts || !options.retryCondition(error, attempt)) {
        throw error
      }
      // Log retry attempt
      logError(
        `Retry attempt ${attempt}/${options.maxAttempts} failed`,
        'low',
        'unknown',
        { error: error instanceof Error ? error.message : String(error) }
      )
      // Call retry callback
      options.onRetry(error, attempt)
      // Calculate and apply delay
      const delay = calculateDelay(
        attempt,
        options.initialDelay,
        options.maxDelay,
        options.backoffFactor
      )
      await sleep(delay)
    }
  }
  throw lastError
}
/**
 * Retry with linear backoff
 */
export async function retryLinear<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delay = 1000
): Promise<T> {
  return retry(fn, {
    maxAttempts,
    initialDelay: delay,
    backoffFactor: 1
  })
}
/**
 * Retry with custom strategy
 */
export class RetryStrategy {
  private config: Required<RetryConfig>
  constructor(config?: RetryConfig) {
    this.config = { ...defaultConfig, ...config }
  }
  /**
   * Execute function with retry
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return retry(fn, this.config)
  }
  /**
   * Create a retryable wrapper for a function
   */
  wrap<T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T {
    return (async (...args: Parameters<T>) => {
      return this.execute(() => fn(...args))
    }) as T
  }
}
/**
 * Common retry conditions
 */
export const retryConditions = {
  /**
   * Retry on network errors
   */
  networkErrors: (error: unknown): boolean => {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return true
    }
    if (error instanceof Error && error.name === 'NetworkError') {
      return true
    }
    return false
  },
  /**
   * Retry on specific status codes
   */
  statusCodes: (codes: number[]) => (error: unknown): boolean => {
    const err = error as { statusCode?: number }
    return err?.statusCode !== undefined && codes.includes(err.statusCode)
  },
  /**
   * Retry on 5xx errors
   */
  serverErrors: (error: unknown): boolean => {
    const err = error as { statusCode?: number }
    return err?.statusCode !== undefined && err.statusCode >= 500
  },
  /**
   * Retry on rate limit errors
   */
  rateLimitErrors: (error: unknown): boolean => {
    const err = error as { statusCode?: number }
    return err?.statusCode === 429
  },
  /**
   * Retry on timeout errors
   */
  timeoutErrors: (error: unknown): boolean => {
    if (error instanceof Error && error.name === 'AbortError') {
      return true
    }
    if (error instanceof Error && error.message.includes('timeout')) {
      return true
    }
    return false
  },
  /**
   * Combine multiple conditions with OR logic
   */
  any: (...conditions: Array<(error: unknown) => boolean>) => (error: unknown): boolean => {
    return conditions.some(condition => condition(error))
  },
  /**
   * Combine multiple conditions with AND logic
   */
  all: (...conditions: Array<(error: unknown) => boolean>) => (error: unknown): boolean => {
    return conditions.every(condition => condition(error))
  }
}
/**
 * Circuit breaker for preventing cascading failures
 */
export class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'
  constructor(
    private threshold = 5,
    private timeout = 60000,
    private resetTimeout = 30000
  ) {}
  /**
   * Execute function with circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const now = Date.now()
      if (now - this.lastFailureTime > this.timeout) {
        this.state = 'half-open'
      } else {
        throw new Error('Circuit breaker is open')
      }
    }
    try {
      const result = await fn()
      // Reset on success
      if (this.state === 'half-open') {
        this.reset()
      }
      return result
    } catch (_error) {
      this.recordFailure()
      throw error
    }
  }
  /**
   * Record a failure
   */
  private recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    if (this.failures >= this.threshold) {
      this.state = 'open'
      // Auto-reset after timeout
      setTimeout(() => {
        this.state = 'half-open'
      }, this.resetTimeout)
    }
  }
  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.failures = 0
    this.lastFailureTime = 0
    this.state = 'closed'
  }
  /**
   * Get circuit breaker state
   */
  getState(): 'closed' | 'open' | 'half-open' {
    return this.state
  }
}
/**
 * Rate limiter for controlling request frequency
 */
export class RateLimiter {
  private queue: Array<() => void> = []
  private running = 0
  constructor(
    private maxConcurrent = 5,
    private minInterval = 100
  ) {}
  /**
   * Execute function with rate limiting
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.running++
        try {
          const result = await fn()
          resolve(result)
        } catch (_error) {
          reject(error)
        } finally {
          this.running--
          // Process next in queue after interval
          setTimeout(() => {
            const next = this.queue.shift()
            if (next) next()
          }, this.minInterval)
        }
      }
      if (this.running < this.maxConcurrent) {
        run()
      } else {
        this.queue.push(run)
      }
    })
  }
}
/**
 * Create a debounced retry function
 */
export function createDebouncedRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delay = 500,
  config?: RetryConfig
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null
  let pendingPromise: Promise<ReturnType<T>> | null = null
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          pendingPromise = retry(() => fn(...args), config) as Promise<ReturnType<T>>
          const result = await pendingPromise
          resolve(result)
        } catch (_error) {
          reject(error)
        } finally {
          pendingPromise = null
          timeoutId = null
        }
      }, delay)
    })
  }
}