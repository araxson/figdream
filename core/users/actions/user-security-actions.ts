'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { updateUserProfile } from '../dal/users-mutations'
import type { ProfileUpdate } from '../dal/users-types'
import { requireAuth, requireAdminRole, logSecurityEvent } from '@/core/auth/actions/auth-helpers'
import {
  ActionResponse,
  createValidationErrorResponse,
  createErrorResponse,
  createSuccessResponse,
  generateTemporaryPassword
} from './user-helpers'
import { ResetPasswordSchema, SecuritySettingsSchema } from './user-schemas'

export async function resetUserPasswordAction(
  userId: string,
  data?: FormData | z.infer<typeof ResetPasswordSchema>
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdminRole()
    if ('error' in authResult) {
      return authResult
    }

    const rawData = data instanceof FormData ? {
      temporary_password: data.get('temporary_password') || undefined,
      send_email: data.get('send_email') !== 'false',
      require_change: data.get('require_change') !== 'false'
    } : (data || { send_email: true, require_change: true })

    const validatedData = ResetPasswordSchema.parse(rawData)

    const temporaryPassword = validatedData.temporary_password || generateTemporaryPassword()

    const supabase = await createClient()
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: temporaryPassword
    })

    if (error) {
      throw new Error(`Failed to reset password: ${error.message}`)
    }

    await logSecurityEvent({
      action: 'user.password_reset',
      resource_type: 'user',
      resource_id: userId,
      details: {
        reset_by: authResult.user.id,
        email_sent: validatedData.send_email,
        require_change: validatedData.require_change
      }
    })

    revalidateTag(`user-${userId}`)

    return createSuccessResponse(
      validatedData.send_email ? undefined : { temporaryPassword },
      validatedData.send_email
        ? 'Password reset email sent successfully'
        : `Temporary password: ${temporaryPassword}`
    )

  } catch (error) {
    console.error('[Server Action Error - resetPassword]:', error)
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error)
    }
    return createErrorResponse(error, 'Failed to reset password')
  }
}

export async function updateSecuritySettingsAction(
  userId: string,
  settings: z.infer<typeof SecuritySettingsSchema>
): Promise<ActionResponse> {
  try {
    const authResult = await requireAuth()
    if ('error' in authResult) {
      return authResult
    }

    if (authResult.user.id !== userId) {
      const adminCheck = await requireAdminRole()
      if ('error' in adminCheck) {
        return adminCheck
      }
    }

    const validatedSettings = SecuritySettingsSchema.parse(settings)

    await updateUserProfile(userId, {
      metadata: validatedSettings
    } as ProfileUpdate)

    await logSecurityEvent({
      action: 'SECURITY_SETTINGS_UPDATED',
      resource_type: 'user',
      resource_id: userId,
      details: {
        userId,
        settings: validatedSettings
      }
    })

    revalidatePath('/profile')
    revalidatePath('/admin/users')

    return createSuccessResponse(undefined, 'Security settings updated successfully')

  } catch (error) {
    console.error('Error updating security settings:', error)
    if (error instanceof z.ZodError) {
      return createValidationErrorResponse(error)
    }
    return createErrorResponse(error, 'Failed to update security settings')
  }
}

export async function verifyEmailAction(
  userId: string,
  token?: string
): Promise<ActionResponse> {
  try {
    const adminCheck = await requireAdminRole()
    const isAdmin = !('error' in adminCheck)

    if (!isAdmin && !token) {
      return {
        success: false,
        error: 'Verification token required',
        code: 'TOKEN_REQUIRED'
      }
    }

    await updateUserProfile(userId, {
      email_verified: true,
      email_verified_at: new Date().toISOString()
    } as ProfileUpdate)

    await logSecurityEvent({
      action: 'EMAIL_VERIFIED',
      resource_type: 'user',
      resource_id: userId,
      details: {
        userId,
        verifiedBy: isAdmin ? 'admin' : 'user'
      }
    })

    revalidatePath('/profile')
    revalidatePath('/admin/users')

    return createSuccessResponse(undefined, 'Email verified successfully')

  } catch (error) {
    console.error('Error verifying email:', error)
    return createErrorResponse(error, 'Failed to verify email')
  }
}