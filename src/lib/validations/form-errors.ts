import { z } from 'zod'
import { logValidationError } from '@/lib/utils/errors/logger'
/**
 * Form validation error type
 */
export interface FormError {
  field: string
  message: string
  code?: string
}
/**
 * Form validation result
 */
export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: FormError[]
}
/**
 * Parse Zod errors into form errors
 */
export function parseZodErrors(error: z.ZodError<unknown>): FormError[] {
  return error.issues.map((err) => {
    const field = err.path.join('.')
    const message = err.message
    // Log validation error
    logValidationError(field, message, { code: err.code })
    return {
      field,
      message,
      code: err.code
    }
  })
}
/**
 * Validate form data with Zod schema
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  try {
    const validated = schema.parse(data)
    return {
      success: true,
      data: validated
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: parseZodErrors(error)
      }
    }
    // Unexpected error
    return {
      success: false,
      errors: [{
        field: 'general',
        message: 'An unexpected validation error occurred'
      }]
    }
  }
}
/**
 * Safe parse with formatted errors
 */
export function safeParseWithErrors<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data?: T; errors?: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { data: result.data }
  }
  const errors: Record<string, string> = {}
  result.error.issues.forEach((err) => {
    const field = err.path.join('.')
    if (!errors[field]) {
      errors[field] = err.message
    }
  })
  return { errors }
}
/**
 * Common validation schemas
 */
export const commonSchemas = {
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, 
      'Please enter a valid phone number'),
  zipCode: z
    .string()
    .min(1, 'ZIP code is required')
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code'),
  url: z
    .string()
    .url('Please enter a valid URL')
    .optional(),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((date) => !isNaN(Date.parse(date)), 'Please enter a valid date'),
  time: z
    .string()
    .min(1, 'Time is required')
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time (HH:MM)'),
  currency: z
    .number()
    .min(0, 'Amount must be positive')
    .multipleOf(0.01, 'Amount must have at most 2 decimal places'),
}
/**
 * Create a required field validator
 */
export function required(message = 'This field is required') {
  return z.string().min(1, message)
}
/**
 * Create a min length validator
 */
export function minLength(min: number, message?: string) {
  return z.string().min(min, message || `Must be at least ${min} characters`)
}
/**
 * Create a max length validator
 */
export function maxLength(max: number, message?: string) {
  return z.string().max(max, message || `Must be at most ${max} characters`)
}
/**
 * Create a pattern validator
 */
export function pattern(regex: RegExp, message: string) {
  return z.string().regex(regex, message)
}
/**
 * Form field state hook
 */
export interface FieldState {
  value: string
  error?: string
  touched: boolean
  dirty: boolean
}
/**
 * Form state manager
 */
export class FormState<T extends Record<string, unknown>> {
  private fields: Map<keyof T, FieldState> = new Map()
  private schema?: z.ZodSchema<T>
  constructor(initialValues: T, schema?: z.ZodSchema<T>) {
    this.schema = schema
    // Initialize field states
    Object.keys(initialValues).forEach((key) => {
      this.fields.set(key as keyof T, {
        value: String(initialValues[key as keyof T] || ''),
        touched: false,
        dirty: false
      })
    })
  }
  /**
   * Get field state
   */
  getField(name: keyof T): FieldState {
    return this.fields.get(name) || {
      value: '',
      touched: false,
      dirty: false
    }
  }
  /**
   * Set field value
   */
  setFieldValue(name: keyof T, value: string): void {
    const field = this.getField(name)
    this.fields.set(name, {
      ...field,
      value,
      dirty: true,
      error: undefined // Clear error on change
    })
  }
  /**
   * Set field error
   */
  setFieldError(name: keyof T, error: string): void {
    const field = this.getField(name)
    this.fields.set(name, {
      ...field,
      error
    })
  }
  /**
   * Mark field as touched
   */
  setFieldTouched(name: keyof T, touched = true): void {
    const field = this.getField(name)
    this.fields.set(name, {
      ...field,
      touched
    })
  }
  /**
   * Validate single field
   */
  validateField(name: keyof T): string | undefined {
    if (!this.schema) return undefined
    const field = this.getField(name)
    // Build full data object for validation
    const data: Partial<T> = {}
    this.fields.forEach((f, n) => {
      data[n] = (n === name ? field.value : f.value) as T[keyof T]
    })
    try {
      // Validate full object
      this.schema.parse(data)
      return undefined
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Find error for this specific field
        const fieldError = error.issues.find((issue: z.ZodIssue) => issue.path[0] === name)
        return fieldError?.message
      }
      return 'Validation error'
    }
  }
  /**
   * Validate all fields
   */
  validate(): boolean {
    if (!this.schema) return true
    const data: Partial<T> = {}
    let hasErrors = false
    // Collect all field values
    this.fields.forEach((field, name) => {
      data[name] = field.value as T[keyof T]
    })
    // Validate with schema
    const result = this.schema.safeParse(data)
    if (!result.success) {
      // Set errors on fields
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof T
        if (fieldName) {
          this.setFieldError(fieldName, err.message)
          hasErrors = true
        }
      })
    }
    return !hasErrors
  }
  /**
   * Get all form values
   */
  getValues(): Partial<T> {
    const values: Partial<T> = {}
    this.fields.forEach((field, name) => {
      values[name] = field.value as T[keyof T]
    })
    return values
  }
  /**
   * Get all form errors
   */
  getErrors(): Partial<Record<keyof T, string>> {
    const errors: Partial<Record<keyof T, string>> = {}
    this.fields.forEach((field, name) => {
      if (field.error) {
        errors[name] = field.error
      }
    })
    return errors
  }
  /**
   * Reset form state
   */
  reset(values?: T): void {
    if (values) {
      Object.keys(values).forEach((key) => {
        this.fields.set(key as keyof T, {
          value: String(values[key as keyof T] || ''),
          touched: false,
          dirty: false
        })
      })
    } else {
      this.fields.forEach((field, name) => {
        this.fields.set(name, {
          value: '',
          touched: false,
          dirty: false
        })
      })
    }
  }
  /**
   * Check if form is valid
   */
  get isValid(): boolean {
    return this.validate()
  }
  /**
   * Check if form is dirty
   */
  get isDirty(): boolean {
    let dirty = false
    this.fields.forEach((field) => {
      if (field.dirty) dirty = true
    })
    return dirty
  }
  /**
   * Check if form is touched
   */
  get isTouched(): boolean {
    let touched = false
    this.fields.forEach((field) => {
      if (field.touched) touched = true
    })
    return touched
  }
}