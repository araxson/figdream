'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schemas
const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const ResetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Response types
export type AuthResponse = {
  success: boolean
  error?: string
  data?: any
  redirectUrl?: string
}

// REGISTER
export async function register(formData: FormData): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Validate input
    const validatedData = RegisterSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone') || undefined,
      acceptTerms: formData.get('acceptTerms') === 'true',
    })

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validatedData.email)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists.',
      }
    }

    // Create user account
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          phone: validatedData.phone,
        },
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.',
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      }
    }

    // Create profile record
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        email: validatedData.email,
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        full_name: `${validatedData.firstName} ${validatedData.lastName}`,
        phone: validatedData.phone,
        is_active: true,
        is_verified: false,
      })

    if (profileError) {
      console.error('[Profile Creation Error]:', profileError)
    }

    // Assign default customer role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: 'customer',
      })

    if (roleError) {
      console.error('[Role Assignment Error]:', roleError)
    }

    return {
      success: true,
      data: { user: data.user },
      redirectUrl: '/verify-email',
    }
  } catch (error) {
    console.error('[Register Error]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid input. Please check your information.',
      }
    }

    return {
      success: false,
      error: 'Registration failed. Please try again.',
    }
  }
}

// FORGOT PASSWORD
export async function forgotPassword(formData: FormData): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Validate input
    const validatedData = ForgotPasswordSchema.parse({
      email: formData.get('email'),
    })

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(
      validatedData.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
      }
    )

    if (error) {
      return {
        success: false,
        error: error.message || 'Unable to send reset email. Please try again.',
      }
    }

    // Always return success to prevent email enumeration
    return {
      success: true,
      data: {
        message: 'If an account exists with this email, you will receive a password reset link.',
      },
    }
  } catch (error) {
    console.error('[Forgot Password Error]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid email address.',
      }
    }

    return {
      success: false,
      error: 'An error occurred. Please try again.',
    }
  }
}

// RESET PASSWORD
export async function resetPassword(formData: FormData): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Validate input
    const validatedData = ResetPasswordSchema.parse({
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: validatedData.password,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Unable to reset password. Please try again.',
      }
    }

    return {
      success: true,
      data: {
        message: 'Password reset successfully.',
      },
      redirectUrl: '/login',
    }
  } catch (error) {
    console.error('[Reset Password Error]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid password.',
      }
    }

    return {
      success: false,
      error: 'An error occurred. Please try again.',
    }
  }
}

// UPDATE PROFILE
export async function updateProfile(formData: FormData): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to update your profile.',
      }
    }

    const updates = {
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
      full_name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message || 'Unable to update profile. Please try again.',
      }
    }

    revalidatePath('/profile')

    return {
      success: true,
      data: {
        message: 'Profile updated successfully.',
      },
    }
  } catch (error) {
    console.error('[Update Profile Error]:', error)

    return {
      success: false,
      error: 'An error occurred while updating your profile.',
    }
  }
}

// CHANGE PASSWORD
export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: "Passwords don't match.",
      }
    }

    // Validate new password strength
    const passwordValidation = z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .safeParse(newPassword)

    if (!passwordValidation.success) {
      return {
        success: false,
        error: passwordValidation.error.errors[0]?.message || 'Invalid password.',
      }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to change your password.',
      }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Unable to change password. Please try again.',
      }
    }

    return {
      success: true,
      data: {
        message: 'Password changed successfully.',
      },
    }
  } catch (error) {
    console.error('[Change Password Error]:', error)

    return {
      success: false,
      error: 'An error occurred while changing your password.',
    }
  }
}

// UPDATE EMAIL
export async function updateEmail(newEmail: string): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Validate email
    const emailValidation = z.string().email().safeParse(newEmail)
    if (!emailValidation.success) {
      return {
        success: false,
        error: 'Invalid email address.',
      }
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to update your email.',
      }
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', newEmail)
      .neq('id', user.id)
      .single()

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists.',
      }
    }

    // Update email
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Unable to update email. Please try again.',
      }
    }

    return {
      success: true,
      data: {
        message: 'Email update confirmation sent. Please check your new email address.',
      },
    }
  } catch (error) {
    console.error('[Update Email Error]:', error)

    return {
      success: false,
      error: 'An error occurred while updating your email.',
    }
  }
}

// DELETE ACCOUNT
export async function deleteAccount(): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'You must be logged in to delete your account.',
      }
    }

    // Mark profile as deleted (soft delete to preserve data integrity)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        is_active: false,
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('[Profile Deletion Error]:', profileError)
    }

    // Note: Actual user deletion from auth.users should be handled by admin
    // or through Supabase admin API for data compliance

    return {
      success: true,
      data: {
        message: 'Account deletion request processed. You will be logged out.',
      },
      redirectUrl: '/login',
    }
  } catch (error) {
    console.error('[Delete Account Error]:', error)

    return {
      success: false,
      error: 'An error occurred while deleting your account.',
    }
  }
}