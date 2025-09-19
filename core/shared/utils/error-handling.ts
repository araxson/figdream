import { z } from 'zod'

export interface ActionResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

/**
 * Unified error handler for server actions
 */
export function handleActionError(error: unknown): ActionResponse {
  console.error('Action error:', error)

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: error.flatten().fieldErrors,
      code: 'VALIDATION_ERROR'
    }
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: 'You are not authorized to perform this action',
        code: 'UNAUTHORIZED'
      }
    }

    if (error.message.includes('Not found')) {
      return {
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND'
      }
    }

    if (error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'A record with this information already exists',
        code: 'DUPLICATE_ERROR'
      }
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    }
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  }
}

/**
 * Wrap async functions with error handling
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const result = await fn()
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return handleActionError(error)
  }
}

/**
 * Validate input and execute action
 */
export async function validateAndExecute<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  input: unknown,
  action: (validatedInput: TInput) => Promise<TOutput>
): Promise<ActionResponse<TOutput>> {
  try {
    const validated = schema.parse(input)
    const result = await action(validated)
    return {
      success: true,
      data: result
    }
  } catch (error) {
    return handleActionError(error)
  }
}