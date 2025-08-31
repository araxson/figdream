import { logApiError } from './logger'

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public statusCode: number
  public code?: string
  public details?: unknown

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }
}

/**
 * Common API error types
 */
export const ApiErrors = {
  BadRequest: (message = 'Bad Request', details?: unknown) =>
    new ApiError(message, 400, 'BAD_REQUEST', details),
    
  Unauthorized: (message = 'Unauthorized', details?: unknown) =>
    new ApiError(message, 401, 'UNAUTHORIZED', details),
    
  Forbidden: (message = 'Forbidden', details?: unknown) =>
    new ApiError(message, 403, 'FORBIDDEN', details),
    
  NotFound: (message = 'Not Found', details?: unknown) =>
    new ApiError(message, 404, 'NOT_FOUND', details),
    
  Conflict: (message = 'Conflict', details?: unknown) =>
    new ApiError(message, 409, 'CONFLICT', details),
    
  ValidationError: (message = 'Validation Error', details?: unknown) =>
    new ApiError(message, 422, 'VALIDATION_ERROR', details),
    
  TooManyRequests: (message = 'Too Many Requests', details?: unknown) =>
    new ApiError(message, 429, 'RATE_LIMITED', details),
    
  InternalServer: (message = 'Internal Server Error', details?: unknown) =>
    new ApiError(message, 500, 'INTERNAL_ERROR', details),
    
  ServiceUnavailable: (message = 'Service Unavailable', details?: unknown) =>
    new ApiError(message, 503, 'SERVICE_UNAVAILABLE', details),
}

/**
 * Handle API response and throw error if not ok
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`
    let errorDetails: unknown = null
    
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      errorDetails = errorData
    } catch {
      // Response body is not JSON
      try {
        errorMessage = await response.text() || errorMessage
      } catch {
        // Could not read response body
      }
    }
    
    // Log the error
    logApiError(errorMessage, response.url, response.status, { errorDetails })
    
    // Throw appropriate error based on status code
    switch (response.status) {
      case 400:
        throw ApiErrors.BadRequest(errorMessage, errorDetails)
      case 401:
        throw ApiErrors.Unauthorized(errorMessage, errorDetails)
      case 403:
        throw ApiErrors.Forbidden(errorMessage, errorDetails)
      case 404:
        throw ApiErrors.NotFound(errorMessage, errorDetails)
      case 409:
        throw ApiErrors.Conflict(errorMessage, errorDetails)
      case 422:
        throw ApiErrors.ValidationError(errorMessage, errorDetails)
      case 429:
        throw ApiErrors.TooManyRequests(errorMessage, errorDetails)
      case 503:
        throw ApiErrors.ServiceUnavailable(errorMessage, errorDetails)
      default:
        if (response.status >= 500) {
          throw ApiErrors.InternalServer(errorMessage, errorDetails)
        }
        throw new ApiError(errorMessage, response.status, 'API_ERROR', errorDetails)
    }
  }
  
  // Parse successful response
  try {
    return await response.json()
  } catch {
    // Response is not JSON, return as is
    return response as unknown as T
  }
}

/**
 * Create a type-safe API client
 */
export interface ApiClientConfig {
  baseUrl?: string
  headers?: HeadersInit
  timeout?: number
  retries?: number
  retryDelay?: number
  onError?: (error: ApiError) => void
}

export class ApiClient {
  private config: Required<ApiClientConfig>
  
  constructor(config?: ApiClientConfig) {
    this.config = {
      baseUrl: config?.baseUrl || '',
      headers: config?.headers || {},
      timeout: config?.timeout || 30000,
      retries: config?.retries || 0,
      retryDelay: config?.retryDelay || 1000,
      onError: config?.onError || (() => {})
    }
  }
  
  /**
   * Make an API request with error handling and retries
   */
  async request<T>(
    url: string,
    options?: RequestInit,
    retryCount = 0
  ): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
    
    const fullUrl = this.config.baseUrl + url
    
    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
          ...options?.headers
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      return await handleApiResponse<T>(response)
      
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Handle abort error
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new ApiError('Request timeout', 408, 'TIMEOUT')
        logApiError(timeoutError, fullUrl)
        throw timeoutError
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const networkError = new ApiError('Network error', 0, 'NETWORK_ERROR')
        logApiError(networkError, fullUrl)
        
        // Retry if configured
        if (retryCount < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (retryCount + 1)))
          return this.request<T>(url, options, retryCount + 1)
        }
        
        throw networkError
      }
      
      // Handle API errors
      if (error instanceof ApiError) {
        this.config.onError(error)
        
        // Retry on 503 or 429 if configured
        if ((error.statusCode === 503 || error.statusCode === 429) && retryCount < this.config.retries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay * (retryCount + 1)))
          return this.request<T>(url, options, retryCount + 1)
        }
        
        throw error
      }
      
      // Handle unexpected errors
      const unexpectedError = new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        500,
        'UNEXPECTED_ERROR'
      )
      logApiError(unexpectedError, fullUrl)
      throw unexpectedError
    }
  }
  
  /**
   * GET request
   */
  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'GET'
    })
  }
  
  /**
   * POST request
   */
  async post<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })
  }
  
  /**
   * PUT request
   */
  async put<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })
  }
  
  /**
   * PATCH request
   */
  async patch<T>(url: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    })
  }
  
  /**
   * DELETE request
   */
  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'DELETE'
    })
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
  retries: 2,
  retryDelay: 1000
})

/**
 * Format API error for display
 */
export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 400:
        return 'Invalid request. Please check your input and try again.'
      case 401:
        return 'You need to sign in to continue.'
      case 403:
        return 'You don\'t have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 409:
        return 'This action conflicts with existing data.'
      case 422:
        return 'Please check your input and try again.'
      case 429:
        return 'Too many requests. Please wait a moment and try again.'
      case 500:
        return 'Something went wrong on our end. Please try again later.'
      case 503:
        return 'Service is temporarily unavailable. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred.'
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/**
 * Check if error is a specific status code
 */
export function isStatusCode(error: unknown, statusCode: number): boolean {
  return isApiError(error) && error.statusCode === statusCode
}