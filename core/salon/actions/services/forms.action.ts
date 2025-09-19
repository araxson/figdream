'use server'

import { redirect } from 'next/navigation'
import {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  duplicateServiceAction
} from './crud'

/**
 * Form action handler for non-JS environments
 * Supports progressive enhancement
 */
export async function handleServiceFormAction(formData: FormData) {
  const action = formData.get('_action') as string
  const id = formData.get('id') as string

  try {
    switch (action) {
      case 'create':
        const createResult = await createServiceAction(formData)
        if (createResult.success) {
          redirect('/dashboard/services')
        }
        break

      case 'update':
        if (!id) throw new Error('Service ID required for update')
        const updateResult = await updateServiceAction(id, formData)
        if (updateResult.success) {
          redirect('/dashboard/services')
        }
        break

      case 'delete':
        if (!id) throw new Error('Service ID required for delete')
        const deleteResult = await deleteServiceAction(id)
        if (deleteResult.success) {
          redirect('/dashboard/services')
        }
        break

      case 'duplicate':
        if (!id) throw new Error('Service ID required for duplicate')
        const duplicateResult = await duplicateServiceAction(id)
        if (duplicateResult.success) {
          redirect('/dashboard/services')
        }
        break

      default:
        throw new Error(`Invalid action: ${action}`)
    }
  } catch (error) {
    // In non-JS environment, we can't show toast, so we redirect with error
    const errorMessage = error instanceof Error ? error.message : 'Operation failed'
    redirect(`/dashboard/services?error=${encodeURIComponent(errorMessage)}`)
  }
}
