'use server'
import { signInWithEmail, signUpWithEmail, signOut, sendPasswordResetOtp, verifyPasswordResetOtp, updatePasswordWithOtp, verifyOtp } from '@/lib/data-access/auth'
import { requireCSRFToken } from '@/lib/data-access/security/csrf'
import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
// Validation schemas
const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})
const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['customer', 'staff', 'salon_owner', 'location_manager', 'super_admin']).optional(),
  phone: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})
const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})
const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})
/**
 * Sign in server action
 */
export async function signInAction(formData: FormData) {
  // Validate CSRF token
  try {
    await requireCSRFToken(formData)
  } catch (_error) {
    return {
      success: false,
      error: 'Security validation failed. Please refresh and try again.'
    }
  }
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }
  const validatedData = signInSchema.safeParse(rawData)
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors
    }
  }
  const { user, session, error } = await signInWithEmail(
    validatedData.data.email,
    validatedData.data.password
  )
  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  if (!user || !session) {
    return {
      success: false,
      error: 'Failed to sign in'
    }
  }
  // Get role from user_roles table instead of metadata
  const supabase = await createClient()
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  const role = roleData?.role || 'customer'
  switch (role) {
    case 'super_admin':
      redirect('/admin')
    case 'salon_owner':
      redirect('/salon')
    case 'location_manager':
      redirect('/location')
    case 'staff':
      redirect('/staff')
    default:
      redirect('/customer')
  }
}
/**
 * Sign up server action
 */
export async function signUpAction(formData: FormData) {
  // Validate CSRF token
  try {
    await requireCSRFToken(formData)
  } catch (_error) {
    return {
      success: false,
      error: 'Security validation failed. Please refresh and try again.'
    }
  }
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    firstName: formData.get('firstName') as string,
    lastName: formData.get('lastName') as string,
    role: formData.get('role') as string || 'customer',
    phone: formData.get('phone') as string
  }
  const validatedData = signUpSchema.safeParse(rawData)
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors
    }
  }
  const { firstName, lastName, phone, role, ...authData } = validatedData.data
  const { user, session, error } = await signUpWithEmail(
    authData.email,
    authData.password,
    {
      first_name: firstName,
      last_name: lastName,
      phone,
      role: role || 'customer',
      full_name: `${firstName} ${lastName}`
    }
  )
  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  if (!user || !session) {
    return {
      success: false,
      error: 'Failed to create account'
    }
  }
  // Redirect to email verification or dashboard
  redirect('/auth/verify-email')
}
/**
 * Sign out server action
 */
export async function signOutAction() {
  const { error } = await signOut()
  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  redirect('/login')
}
/**
 * Reset password request server action - sends OTP
 */
export async function resetPasswordAction(formData: FormData) {
  const rawData = {
    email: formData.get('email') as string
  }
  const validatedData = resetPasswordSchema.safeParse(rawData)
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors
    }
  }
  const { error } = await sendPasswordResetOtp(validatedData.data.email)
  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  return {
    success: true,
    message: 'Verification code sent. Please check your email.'
  }
}
/**
 * Verify reset OTP server action
 */
export async function verifyResetOtpAction(formData: FormData) {
  // Validate CSRF token
  try {
    await requireCSRFToken(formData)
  } catch (_error) {
    return {
      success: false,
      error: 'Security validation failed. Please refresh and try again.'
    }
  }
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  if (!email || !token) {
    return {
      success: false,
      error: 'Email and verification code are required'
    }
  }
  const { success, error } = await verifyPasswordResetOtp(email, token)
  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  return {
    success: success,
    message: 'Verification successful. You can now reset your password.'
  }
}
/**
 * Update password with OTP verification
 */
export async function updatePasswordWithOtpAction(formData: FormData) {
  // Validate CSRF token
  try {
    await requireCSRFToken(formData)
  } catch (_error) {
    return {
      success: false,
      error: 'Security validation failed. Please refresh and try again.'
    }
  }
  const rawData = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string
  }
  const validatedData = updatePasswordSchema.safeParse(rawData)
  if (!validatedData.success) {
    return {
      success: false,
      errors: validatedData.error.flatten().fieldErrors
    }
  }
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  if (!email || !token) {
    return {
      success: false,
      error: 'Verification session expired. Please start over.'
    }
  }
  const { error } = await updatePasswordWithOtp(email, token, validatedData.data.password)
  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  return {
    success: true,
    message: 'Password updated successfully'
  }
}
/**
 * Legacy update password action (for compatibility)
 */
export async function updatePasswordAction(_formData: FormData) {
  // This is kept for backward compatibility but redirects to OTP flow
  return {
    success: false,
    error: 'Please use the forgot password flow to reset your password.'
  }
}
/**
 * Verify OTP server action
 */
export async function verifyOtpAction(formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  if (!email || !token) {
    return {
      success: false,
      error: 'Email and verification code are required'
    }
  }
  const { user, session, error } = await verifyOtp(email, token)
  if (error) {
    return {
      success: false,
      error: error.message
    }
  }
  if (!user || !session) {
    return {
      success: false,
      error: 'Verification failed'
    }
  }
  // Get role from user_roles table instead of metadata
  const supabase = await createClient()
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  const role = roleData?.role || 'customer'
  switch (role) {
    case 'super_admin':
      redirect('/admin')
    case 'salon_owner':
      redirect('/salon')
    case 'location_manager':
      redirect('/location')
    case 'staff':
      redirect('/staff')
    default:
      redirect('/customer')
  }
}