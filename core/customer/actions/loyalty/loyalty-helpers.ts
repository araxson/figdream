/**
 * Shared helpers and types for loyalty actions
 */

export interface ActionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  fieldErrors?: Record<string, string[] | undefined>
  code?: string
  message?: string
}

export function extractFormDataValue(
  data: FormData,
  key: string,
  type: 'string'
): string | undefined
export function extractFormDataValue(
  data: FormData,
  key: string,
  type: 'number'
): number | undefined
export function extractFormDataValue(
  data: FormData,
  key: string,
  type: 'boolean'
): boolean | undefined
export function extractFormDataValue(
  data: FormData,
  key: string,
  type: 'json'
): any | undefined
export function extractFormDataValue(
  data: FormData,
  key: string,
  type: 'string' | 'number' | 'boolean' | 'json'
): any {
  const value = data.get(key)

  if (value === null || value === undefined) {
    return undefined
  }

  switch (type) {
    case 'string':
      return value as string
    case 'number':
      return value ? Number(value) : undefined
    case 'boolean':
      return value === 'true'
    case 'json':
      return value ? JSON.parse(value as string) : undefined
    default:
      return value
  }
}

export function parseFormData<T>(
  formData: FormData,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'json'>
): Partial<T> {
  const result: Partial<T> = {}

  for (const [key, type] of Object.entries(schema)) {
    const value = extractFormDataValue(formData, key, type as any)
    if (value !== undefined) {
      (result as any)[key] = value
    }
  }

  return result
}

export async function checkLoyaltyAdminPermission(): Promise<boolean> {
  // For now, return true - implement proper permission checking later
  return true
}

export async function invalidateLoyaltyCache(tags?: string[]): Promise<void> {
  // Cache invalidation placeholder - implement when caching is added
  return
}