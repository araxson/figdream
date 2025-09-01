'use server'

import { signInWithEmail, signUpWithEmail, signOut, sendPasswordResetEmail, updatePassword, verifyOtp } from '@/lib/data-access/auth'
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

  // Redirect based on user role
  const role = user.raw_app_meta_data?.role || user.app_metadata?.role || 'customer'
  
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
 * Reset password request server action
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

  const { success, error } = await sendPasswordResetEmail(validatedData.data.email)

  if (error) {
    return {
      success: false,
      error: error.message
    }
  }

  return {
    success: true,
    message: 'Password reset email sent. Please check your inbox.'
  }
}

/**
 * Update password server action (after reset)
 */
export async function updatePasswordAction(formData: FormData) {
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

  const { success, error } = await updatePassword(validatedData.data.password)

  if (error) {
    return {
      success: false,
      error: error.message
    }
  }

  redirect('/login?message=Password updated successfully')
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

  // Redirect based on user role
  const role = user.raw_app_meta_data?.role || user.app_metadata?.role || 'customer'
  
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