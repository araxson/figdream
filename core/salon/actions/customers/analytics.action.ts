'use server'

import {
  getCustomers,
  getCustomerById,
  getCustomerAppointments,
  getCustomerFavorites,
  getCustomerMetrics
} from '../dal/customers-queries'
import type { CustomerFilters } from '../dal/customers-types'
import { requireAuth } from '@/core/auth/actions'
import { ActionResponse } from '../../validators/customer.schemas'

/**
 * Get customers with filters
 */
export async function getCustomersAction(
  filters?: CustomerFilters,
  page = 1,
  limit = 20
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Fetch customers with filters
    const customers = await getCustomers(filters, page, limit)

    // 3. Get metrics if on first page
    let metrics = null
    if (page === 1) {
      metrics = await getCustomerMetrics(filters?.salon_id)
    }

    return {
      success: true,
      data: {
        customers,
        metrics,
        page,
        limit
      }
    }

  } catch (error) {
    console.error('[Server Action Error - getCustomers]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customers',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get customer by ID with relations
 */
export async function getCustomerByIdAction(
  customerId: string
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Fetch customer with all relations
    const customer = await getCustomerById(customerId)

    if (!customer) {
      return {
        success: false,
        error: 'Customer not found',
        code: 'NOT_FOUND'
      }
    }

    // 3. Fetch additional data
    const [appointments, favorites] = await Promise.all([
      getCustomerAppointments(customerId, { limit: 10 }),
      getCustomerFavorites(customerId)
    ])

    return {
      success: true,
      data: {
        ...customer,
        appointments,
        favorites
      }
    }

  } catch (error) {
    console.error('[Server Action Error - getCustomerById]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch customer',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get customer metrics for a salon
 */
export async function getCustomerMetricsAction(
  salonId?: string
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Fetch metrics
    const metrics = await getCustomerMetrics(salonId)

    return {
      success: true,
      data: metrics
    }

  } catch (error) {
    console.error('[Server Action Error - getMetrics]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch metrics',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get customer appointments
 */
export async function getCustomerAppointmentsAction(
  customerId: string,
  options?: {
    status?: string[]
    limit?: number
    offset?: number
  }
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Fetch appointments
    const appointments = await getCustomerAppointments(customerId, options)

    return {
      success: true,
      data: appointments
    }

  } catch (error) {
    console.error('[Server Action Error - getAppointments]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch appointments',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get customer favorites
 */
export async function getCustomerFavoritesAction(
  customerId: string
): Promise<ActionResponse> {
  try {
    // 1. Authentication
    let authUser: any
    try {
      authUser = await requireAuth()
    } catch (error) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    }

    // 2. Fetch favorites
    const favorites = await getCustomerFavorites(customerId)

    return {
      success: true,
      data: favorites
    }

  } catch (error) {
    console.error('[Server Action Error - getFavorites]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch favorites',
      code: 'OPERATION_FAILED'
    }
  }
}