'use server'

import { revalidatePath } from 'next/cache'

// Common revalidation action
export async function revalidatePageAction(path: string) {
  revalidatePath(path)
  return { success: true }
}

// Common error logging action
export async function logErrorAction(error: string, context?: string) {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error)
  return { success: true }
}