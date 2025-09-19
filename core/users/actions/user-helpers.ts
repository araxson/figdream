import { z } from 'zod'

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

export function createValidationErrorResponse(error: z.ZodError): ActionResponse {
  return {
    success: false,
    error: 'Validation failed',
    fieldErrors: error.flatten().fieldErrors,
    code: 'VALIDATION_ERROR'
  }
}

export function createErrorResponse(error: unknown, defaultMessage: string): ActionResponse {
  return {
    success: false,
    error: error instanceof Error ? error.message : defaultMessage,
    code: 'OPERATION_FAILED'
  }
}

export function createSuccessResponse<T = any>(
  data?: T,
  message?: string
): ActionResponse<T> {
  return {
    success: true,
    data,
    message
  }
}

export function generateTemporaryPassword(): string {
  return Math.random().toString(36).slice(-8) +
         Math.random().toString(36).slice(-8).toUpperCase()
}

export function formatCsvRow(data: string[]): string {
  return data.map(field =>
    field && field.includes(',') ? `"${field}"` : field
  ).join(',')
}