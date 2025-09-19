'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import {
  createUserProfile,
  updateUserProfile,
  deleteUser
} from '../dal/users-mutations'
import { getUserByEmail, getUserById } from '../dal/users-queries'
import type { ProfileUpdate } from '../dal/users-types'
import { requireAuth, requireAdminRole, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  ActionResponse,
  createValidationErrorResponse,
  createErrorResponse,
  createSuccessResponse
} from './user-helpers'
import { CreateUserSchema, UpdateUserSchema } from './user-schemas'
import { updateUserRole } from '../dal/users-mutations'

export async function createUserAction(
  data: FormData | z.infer<typeof CreateUserSchema>
): Promise<ActionResponse<{ id: string }>> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    const rawData = data instanceof FormData ? {
      email: data.get('email'),
      password: data.get('password'),
      display_name: data.get('display_name'),
      first_name: data.get('first_name'),
      last_name: data.get('last_name'),
      phone: data.get('phone') || undefined,
      role: data.get('role') || 'customer',
      send_welcome_email: data.get('send_welcome_email') !== 'false',
      auto_confirm_email: data.get('auto_confirm_email') === 'true'
    } : data

    const validatedData = CreateUserSchema.parse(rawData)

    const existingUser = await getUserByEmail(validatedData.email)
    if (existingUser) {
      return {
        success: false,
        error: 'A user with this email already exists',
        code: 'EMAIL_EXISTS'
      }
    }

    const supabase = await createClient()
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: validatedData.auto_confirm_email,
      user_metadata: {
        display_name: validatedData.display_name,
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        role: validatedData.role
      }
    })

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

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

    if (validatedData.role !== 'customer') {
      await updateUserRole(authData.user.id, validatedData.role)
    }

    await logSecurityEvent({
      action: 'user.created',
      resource_type: 'user',
      resource_id: authData.user.id,
      details: {
        email: validatedData.email,
        role: validatedData.role,
        created_by: authResult.user.id
      }
    })

    revalidatePath('/admin/users')
    revalidateTag('users')

    return createSuccessResponse(
      { id: authData.user.id },
      'User created successfully'
    )

  } catch (error) {
    console.error('[Server Action Error - createUser]:', error)
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error)
    }
    return createErrorResponse(error, 'Failed to create user')
  }
}

export async function updateUserAction(
  userId: string,
  data: FormData | ProfileUpdate
): Promise<ActionResponse> {
  try {
    const authResult = await requireAuth()
    if ('error' in authResult) {
      return authResult
    }

    const isOwnProfile = userId === authResult.user.id
    const isAdmin = authResult.role === 'admin' || authResult.role === 'super_admin'

    if (!isOwnProfile && !isAdmin) {
      return {
        success: false,
        error: 'You do not have permission to update this user',
        code: 'PERMISSION_DENIED'
      }
    }

    const rawData = data instanceof FormData ? {
      display_name: data.get('display_name') || undefined,
      first_name: data.get('first_name') || undefined,
      last_name: data.get('last_name') || undefined,
      phone: data.get('phone') || undefined
    } : data

    const validatedData = UpdateUserSchema.parse(rawData)

    await updateUserProfile(userId, validatedData as ProfileUpdate)

    await logSecurityEvent({
      action: 'user.updated',
      resource_type: 'user',
      resource_id: userId,
      details: {
        updated_fields: Object.keys(validatedData),
        updated_by: authResult.user.id,
        self_update: isOwnProfile
      }
    })

    revalidatePath(`/admin/users/${userId}`)
    revalidatePath('/admin/users')
    if (isOwnProfile) {
      revalidatePath('/profile')
    }
    revalidateTag(`user-${userId}`)

    return createSuccessResponse(undefined, 'User updated successfully')

  } catch (error) {
    console.error('[Server Action Error - updateUser]:', error)
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error)
    }
    return createErrorResponse(error, 'Failed to update user')
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResponse> {
  try {
    const authResult = await requireAuth()
    if ('error' in authResult) {
      return authResult
    }

    if (authResult.role !== 'super_admin') {
      return {
        success: false,
        error: 'Only super administrators can delete users',
        code: 'PERMISSION_DENIED'
      }
    }

    if (userId === authResult.user.id) {
      return {
        success: false,
        error: 'You cannot delete your own account',
        code: 'SELF_DELETE_FORBIDDEN'
      }
    }

    const supabase = await createClient()
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('customer_id', userId)
      .in('status', ['pending', 'confirmed'])
      .limit(1)

    if (appointments && appointments.length > 0) {
      return {
        success: false,
        error: 'Cannot delete user with active appointments',
        code: 'HAS_ACTIVE_APPOINTMENTS'
      }
    }

    await deleteUser(userId)

    await logSecurityEvent({
      action: 'user.deleted',
      resource_type: 'user',
      resource_id: userId,
      details: {
        deleted_by: authResult.user.id
      }
    })

    revalidatePath('/admin/users')
    revalidateTag(`user-${userId}`)
    revalidateTag('users')

    return createSuccessResponse(undefined, 'User deleted successfully')

  } catch (error) {
    console.error('[Server Action Error - deleteUser]:', error)
    return createErrorResponse(error, 'Failed to delete user')
  }
}

