/**
 * Shared Utilities - Consolidated
 * Essential utilities used across multiple modules
 */

import { z } from 'zod';

// ============================================
// ERROR HANDLING UTILITIES
// ============================================

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  code?: string;
  message?: string;
}

/**
 * Unified error handler for server actions
 */
export function handleActionError(error: unknown): ActionResponse {
  console.error('Action error:', error);

  if (error instanceof z.ZodError) {
    return {
      success: false,
      error: 'Validation failed',
      fieldErrors: error.flatten().fieldErrors,
      code: 'VALIDATION_ERROR'
    };
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('Unauthorized')) {
      return {
        success: false,
        error: 'You are not authorized to perform this action',
        code: 'UNAUTHORIZED'
      };
    }

    if (error.message.includes('Not found')) {
      return {
        success: false,
        error: 'Resource not found',
        code: 'NOT_FOUND'
      };
    }

    if (error.message.includes('duplicate key')) {
      return {
        success: false,
        error: 'A record with this information already exists',
        code: 'DUPLICATE_ERROR'
      };
    }

    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
      code: 'INTERNAL_ERROR'
    };
  }

  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };
}

/**
 * Wrap async functions with error handling
 */
export async function withErrorHandler<T>(
  fn: () => Promise<T>
): Promise<ActionResponse<T>> {
  try {
    const result = await fn();
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return handleActionError(error);
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
    const validated = schema.parse(input);
    const result = await action(validated);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    return handleActionError(error);
  }
}

// ============================================
// FORMATTING UTILITIES
// ============================================

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format date values
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }).format(dateObj);
}

/**
 * Format phone numbers
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);

  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phone;
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Generate URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/-+/g, '-') // Replace multiple - with single -
    .trim('-'); // Trim - from start and end
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Check if value is empty
 */
export function isEmpty(value: any): boolean {
  if (value == null) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Remove duplicates from array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item).toString();
    (groups[key] = groups[key] || []).push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Sort array by multiple keys
 */
export function sortBy<T>(
  array: T[],
  ...keys: Array<(item: T) => any>
): T[] {
  return [...array].sort((a, b) => {
    for (const key of keys) {
      const aVal = key(a);
      const bVal = key(b);

      if (aVal < bVal) return -1;
      if (aVal > bVal) return 1;
    }
    return 0;
  });
}

// ============================================
// DYNAMIC IMPORT UTILITIES
// ============================================

// Cache for loaded modules
const moduleCache = new Map<string, any>();

/**
 * Dynamically import a module with caching
 */
export async function dynamicImport<T>(
  importPath: string,
  importFunc: () => Promise<{ default: T }>
): Promise<T> {
  if (moduleCache.has(importPath)) {
    return moduleCache.get(importPath);
  }

  try {
    const module = await importFunc();
    moduleCache.set(importPath, module.default);
    return module.default;
  } catch (error) {
    console.error(`Failed to import ${importPath}:`, error);
    throw error;
  }
}

/**
 * Preload modules for better performance
 */
export function preloadModules(
  modules: Array<{ path: string; importFunc: () => Promise<any> }>
): void {
  if (typeof window === "undefined") return; // Server-side, skip preloading

  // Use requestIdleCallback for non-blocking preload
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => {
      modules.forEach(({ path, importFunc }) => {
        if (!moduleCache.has(path)) {
          importFunc()
            .then((module) => {
              moduleCache.set(path, module.default || module);
            })
            .catch((error) => {
              console.warn(`Failed to preload ${path}:`, error);
            });
        }
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      modules.forEach(({ path, importFunc }) => {
        if (!moduleCache.has(path)) {
          importFunc().catch(() => {});
        }
      });
    }, 2000);
  }
}