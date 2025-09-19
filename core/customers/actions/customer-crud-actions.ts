'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  updateCustomerProfile
} from '../dal/customers-mutations'
import {
  getCustomerById,
  getCustomerByEmail,
  getCustomerAppointments
} from '../dal/customers-queries'
import type { CustomerProfileUpdate } from '../dal/customers-types'
import { requireAuth, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  ActionResponse
} from './customer-schemas'

/**
 * Create a new customer with profile
 */
export async function createCustomerAction(
  data: FormData | z.infer<typeof CreateCustomerSchema>
): Promise<ActionResponse<{ id: string }>> {
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

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      email: data.get('email'),
      display_name: data.get('display_name'),
      first_name: data.get('first_name'),
      last_name: data.get('last_name'),
      phone: data.get('phone') || undefined,
      date_of_birth: data.get('date_of_birth') || undefined,
      gender: data.get('gender') || undefined,
      marketing_consent: data.get('marketing_consent') === 'true',
      sms_consent: data.get('sms_consent') === 'true',
      email_consent: data.get('email_consent') !== 'false'
    } : data

    const validatedData = CreateCustomerSchema.parse(rawData)

    // 3. Check if email already exists
    const existingCustomer = await getCustomerByEmail(validatedData.email)
    if (existingCustomer) {
      return {
        success: false,
        error: 'A customer with this email already exists',
        code: 'EMAIL_EXISTS'
      }
    }

    // 4. Create customer profile in database
    const supabase = await createClient()

    // First create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      email_confirm: true,
      user_metadata: {
        display_name: validatedData.display_name,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name
      }
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    // Profile will be created automatically via trigger, update it with additional data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: validatedData.display_name,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        phone: validatedData.phone,
        date_of_birth: validatedData.date_of_birth,
        gender: validatedData.gender,
        marketing_consent: validatedData.marketing_consent,
        sms_consent: validatedData.sms_consent,
        email_consent: validatedData.email_consent,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)
      .select()
      .single()

    if (profileError) {
      // Rollback auth user if profile update fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // 5. Log security event
    await logSecurityEvent({
      action: 'customer.created',
      resource_type: 'customer',
      resource_id: authData.user.id,
      details: {
        email: validatedData.email,
        created_by: authUser.user.id
      }
    })

    // 6. Invalidate cache
    revalidatePath('/dashboard/customers')
    revalidatePath('/admin/users')
    revalidateTag('customers')

    return {
      success: true,
      data: { id: authData.user.id },
      message: 'Customer created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createCustomer]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create customer',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update customer profile
 */
export async function updateCustomerAction(
  customerId: string,
  data: FormData | CustomerProfileUpdate
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

    // 2. Parse and validate input
    const rawData = data instanceof FormData ? {
      display_name: data.get('display_name') || undefined,
      first_name: data.get('first_name') || undefined,
      last_name: data.get('last_name') || undefined,
      phone: data.get('phone') || undefined,
      date_of_birth: data.get('date_of_birth') || undefined,
      gender: data.get('gender') || undefined,
      marketing_consent: data.has('marketing_consent') ? data.get('marketing_consent') === 'true' : undefined,
      sms_consent: data.has('sms_consent') ? data.get('sms_consent') === 'true' : undefined,
      email_consent: data.has('email_consent') ? data.get('email_consent') === 'true' : undefined
    } : data

    const validatedData = UpdateCustomerSchema.parse(rawData)

    // 3. Update customer profile
    const updated = await updateCustomerProfile(customerId, validatedData as CustomerProfileUpdate)

    // 4. Log security event
    await logSecurityEvent({
      action: 'customer.updated',
      resource_type: 'customer',
      resource_id: customerId,
      details: {
        updated_fields: Object.keys(validatedData),
        updated_by: authUser.user.id
      }
    })

    // 5. Invalidate cache
    revalidatePath(`/dashboard/customers/${customerId}`)
    revalidatePath('/dashboard/customers')
    revalidateTag(`customer-${customerId}`)

    return {
      success: true,
      data: updated,
      message: 'Customer updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateCustomer]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors,
        code: 'VALIDATION_ERROR'
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update customer',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Delete customer (soft delete - deactivate)
 */
export async function deleteCustomerAction(
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

    // 2. Check for active appointments
    const appointments = await getCustomerAppointments(customerId, {
      status: ['pending', 'confirmed']
    })

    if (appointments.length > 0) {
      return {
        success: false,
        error: 'Cannot delete customer with active appointments',
        code: 'HAS_ACTIVE_APPOINTMENTS'
      }
    }

    // 3. Soft delete (deactivate) customer
    const updated = await updateCustomerProfile(customerId, {
      is_active: false,
      deleted_at: new Date().toISOString()
    } as CustomerProfileUpdate)

    // 4. Log security event
    await logSecurityEvent({
      action: 'customer.deleted',
      resource_type: 'customer',
      resource_id: customerId,
      details: {
        deleted_by: authUser.user.id
      }
    })

    // 5. Invalidate cache
    revalidatePath('/dashboard/customers')
    revalidatePath('/admin/users')
    revalidateTag(`customer-${customerId}`)

    return {
      success: true,
      message: 'Customer deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteCustomer]:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete customer',
      code: 'OPERATION_FAILED'
    }
  }
}