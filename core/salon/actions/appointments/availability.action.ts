'use server'

import { checkAvailability, getStaffAppointments } from '../dal/appointments-queries'
import { getUserContext } from '@/core/auth/actions'
import type { ActionResponse } from './crud'

/**
 * Check availability for a time slot
 */
export async function checkAvailabilityAction(
  staffId: string,
  startTime: string,
  endTime: string
): Promise<ActionResponse<boolean>> {
  try {
    const context = await getUserContext()
    if ('success' in context && !context.success) {
      return context
    }

    // Type guard to ensure we have a valid UserContext
    if (!('user' in context)) {
      return {
        success: false,
        error: 'Invalid authentication context',
        code: 'AUTH_ERROR'
      }
    }

    const isAvailable = await checkAvailability(staffId, startTime, endTime)

    return {
      success: true,
      data: isAvailable
    }

  } catch (error) {
    console.error('[Server Action Error - checkAvailability]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check availability',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get staff appointments for a date range
 */
export async function getStaffAppointmentsAction(
  staffId: string,
  filters: { start_date: string; end_date: string }
): Promise<ActionResponse<any[]>> {
  try {
    const context = await getUserContext()
    if ('success' in context && !context.success) {
      return context
    }

    // Type guard to ensure we have a valid UserContext
    if (!('user' in context)) {
      return {
        success: false,
        error: 'Invalid authentication context',
        code: 'AUTH_ERROR'
      }
    }

    const appointments = await getStaffAppointments(staffId, filters)

    return {
      success: true,
      data: appointments || []
    }

  } catch (error) {
    console.error('[Server Action Error - getStaffAppointments]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get staff appointments',
      code: 'OPERATION_FAILED'
    }
  }
}
