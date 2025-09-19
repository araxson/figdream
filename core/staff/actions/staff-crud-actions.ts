'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  createStaffProfile,
  updateStaffProfile,
  deleteStaffProfile
} from '../dal/staff-mutations'
import {
  getStaffMembers,
  getStaffById
} from '../dal/staff-queries'
import type {
  StaffProfileInsert,
  StaffProfileUpdate,
  StaffFilters
} from '../dal/staff-types'
import { getUserContext, requireAuth, requireSalonContext, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  ActionResponse,
  CreateStaffSchema,
  UpdateStaffSchema,
  CreateStaffInput,
  UpdateStaffInput
} from './staff-action-types'

/**
 * Create new staff member with auth user and profile
 */
export async function createStaffMemberAction(
  data: FormData | CreateStaffInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const rawData = data instanceof FormData ? {
      email: data.get('email'),
      display_name: data.get('display_name'),
      first_name: data.get('first_name'),
      last_name: data.get('last_name'),
      phone: data.get('phone') || undefined,
      title: data.get('title'),
      bio: data.get('bio') || undefined,
      experience_years: data.get('experience_years') ? parseInt(data.get('experience_years') as string) : undefined,
      specializations: data.get('specializations') ? JSON.parse(data.get('specializations') as string) : undefined,
      languages: data.get('languages') ? JSON.parse(data.get('languages') as string) : undefined,
      commission_rate: data.get('commission_rate') ? parseFloat(data.get('commission_rate') as string) : undefined,
      hourly_rate: data.get('hourly_rate') ? parseFloat(data.get('hourly_rate') as string) : undefined,
      employment_type: data.get('employment_type') || undefined,
      is_bookable: data.get('is_bookable') !== 'false',
      hired_at: data.get('hired_at') || new Date().toISOString()
    } : data

    const validatedData = CreateStaffSchema.parse(rawData)

    // Create auth user
    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      email_confirm: true,
      user_metadata: {
        display_name: validatedData.display_name,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        role: 'staff'
      }
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    // Update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        display_name: validatedData.display_name,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        phone: validatedData.phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', authData.user.id)

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    // Create staff profile
    const staffProfileData: StaffProfileInsert = {
      user_id: authData.user.id,
      salon_id: context.salonId,
      title: validatedData.title,
      bio: validatedData.bio,
      experience_years: validatedData.experience_years,
      specializations: validatedData.specializations,
      languages: validatedData.languages,
      commission_rate: validatedData.commission_rate,
      hourly_rate: validatedData.hourly_rate,
      employment_type: validatedData.employment_type,
      is_bookable: validatedData.is_bookable,
      hired_at: validatedData.hired_at,
      is_active: true,
      is_featured: false,
      status: 'available'
    }

    const staffId = await createStaffProfile(staffProfileData)

    await logSecurityEvent({
      action: 'staff.created',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        salon_id: context.salonId,
        email: validatedData.email,
        created_by: context.user.id
      }
    })

    revalidatePath('/dashboard/staff')
    revalidateTag(`salon-${context.salonId}-staff`)

    return {
      success: true,
      data: { id: staffId },
      message: 'Staff member created successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - createStaffMember]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to create staff member',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Update staff member profile
 */
export async function updateStaffMemberAction(
  staffId: string,
  data: FormData | UpdateStaffInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const rawData = data instanceof FormData ? {
      display_name: data.get('display_name') || undefined,
      first_name: data.get('first_name') || undefined,
      last_name: data.get('last_name') || undefined,
      phone: data.get('phone') || undefined,
      title: data.get('title') || undefined,
      bio: data.get('bio') || undefined,
      experience_years: data.get('experience_years') ? parseInt(data.get('experience_years') as string) : undefined,
      specializations: data.get('specializations') ? JSON.parse(data.get('specializations') as string) : undefined,
      commission_rate: data.get('commission_rate') ? parseFloat(data.get('commission_rate') as string) : undefined,
      hourly_rate: data.get('hourly_rate') ? parseFloat(data.get('hourly_rate') as string) : undefined,
      employment_type: data.get('employment_type') || undefined,
      is_bookable: data.get('is_bookable') ? data.get('is_bookable') === 'true' : undefined
    } : data

    const validatedData = UpdateStaffSchema.parse(rawData)

    const updatedData: StaffProfileUpdate = {
      ...validatedData,
      updated_at: new Date().toISOString()
    }

    await updateStaffProfile(staffId, updatedData, context.salonId)

    await logSecurityEvent({
      action: 'staff.updated',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        salon_id: context.salonId,
        updated_by: context.user.id,
        fields_updated: Object.keys(validatedData)
      }
    })

    revalidatePath('/dashboard/staff')
    revalidateTag(`staff-${staffId}`)

    return {
      success: true,
      data: { id: staffId },
      message: 'Staff member updated successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - updateStaffMember]:', error)

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
      error: error instanceof Error ? error.message : 'Failed to update staff member',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Delete staff member (soft delete)
 */
export async function deleteStaffMemberAction(
  staffId: string
): Promise<ActionResponse<{ id: string }>> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    await deleteStaffProfile(staffId, context.salonId)

    await logSecurityEvent({
      action: 'staff.deleted',
      resource_type: 'staff',
      resource_id: staffId,
      details: {
        salon_id: context.salonId,
        deleted_by: context.user.id
      }
    })

    revalidatePath('/dashboard/staff')
    revalidateTag(`staff-${staffId}`)

    return {
      success: true,
      data: { id: staffId },
      message: 'Staff member deleted successfully'
    }

  } catch (error) {
    console.error('[Server Action Error - deleteStaffMember]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete staff member',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get staff members with filtering
 */
export async function getStaffAction(
  filters?: StaffFilters
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const staff = await getStaffMembers(context.salonId, filters)

    return {
      success: true,
      data: staff
    }

  } catch (error) {
    console.error('[Server Action Error - getStaff]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get staff members',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get staff member by ID
 */
export async function getStaffByIdAction(
  staffId: string
): Promise<ActionResponse> {
  try {
    const context = await requireSalonContext()
    if ('error' in context) return context

    const staff = await getStaffById(staffId, context.salonId)

    return {
      success: true,
      data: staff
    }

  } catch (error) {
    console.error('[Server Action Error - getStaffById]:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get staff member',
      code: 'OPERATION_FAILED'
    }
  }
}

/**
 * Get staff profile by ID (alias for getStaffByIdAction)
 * Used in some components that expect this naming
 */
export async function getStaffProfileByIdAction(
  staffId: string
): Promise<ActionResponse> {
  return getStaffByIdAction(staffId)
}

/**
 * Get staff profiles (alias for getStaffAction)
 * Used in some components that expect this naming
 */
export async function getStaffProfilesAction(
  filters?: StaffFilters
): Promise<ActionResponse> {
  return getStaffAction(filters)
}