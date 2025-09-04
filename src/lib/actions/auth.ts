'use server'
import { signInWithEmail, signUpWithEmail, signOut } from '@/lib/data-access/auth'
import { 
  sendSignupOTP, 
  verifySignupOTP, 
  sendPasswordResetOTP as sendResetOTP,
  verifyPasswordResetOTP as verifyResetOTP,
  resetPasswordWithOTP,
  sendLoginOTP,
  verifyLoginOTP
} from '@/lib/data-access/auth/otp-auth'
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
      redirect('/super-admin')
      break
    case 'salon_owner':
      redirect('/salon-owner')  
      break
    case 'location_manager':
      redirect('/location-manager')
      break
    case 'staff':
      redirect('/staff-member')
      break
    default:
      redirect('/customer')
      break
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
  redirect('/verify-email')
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
  const result = await sendResetOTP(validatedData.data.email)
  if (result.error) {
    return {
      success: false,
      error: result.error.message
    }
  }
  return {
    success: true,
    message: result.message || 'Verification code sent. Please check your email.',
    otp: result.otp // For development only
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
  const otp = formData.get('otp') as string
  if (!email || !otp) {
    return {
      success: false,
      error: 'Email and verification code are required'
    }
  }
  const result = await verifyResetOTP(email, otp)
  if (result.error) {
    return {
      success: false,
      error: result.error.message
    }
  }
  return {
    success: true,
    message: result.message || 'Verification successful. You can now reset your password.'
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
  
  if (!email) {
    return {
      success: false,
      error: 'Email is required. Please start over.'
    }
  }
  
  const result = await resetPasswordWithOTP(email, validatedData.data.password)
  
  if (result.error) {
    return {
      success: false,
      error: result.error.message
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
 * Send signup OTP server action
 */
export async function sendSignupOtpAction(formData: FormData) {
  const email = formData.get('email') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const role = formData.get('role') as string || 'customer'
  const phone = formData.get('phone') as string
  
  if (!email) {
    return {
      success: false,
      error: 'Email is required'
    }
  }
  
  const metadata = {
    first_name: firstName,
    last_name: lastName,
    full_name: `${firstName} ${lastName}`,
    role,
    phone
  }
  
  const result = await sendSignupOTP(email, metadata)
  
  if (result.error) {
    return {
      success: false,
      error: result.error.message
    }
  }
  
  return {
    success: true,
    message: result.message,
    otp: result.otp // For development only
  }
}

/**
 * Verify signup OTP and complete registration
 */
export async function verifySignupOtpAction(formData: FormData) {
  const email = formData.get('email') as string
  const otp = formData.get('otp') as string
  const password = formData.get('password') as string
  
  if (!email || !otp || !password) {
    return {
      success: false,
      error: 'Email, OTP code, and password are required'
    }
  }
  
  const result = await verifySignupOTP(email, otp, password)
  
  if (result.error) {
    return {
      success: false,
      error: result.error.message
    }
  }
  
  // Redirect to appropriate dashboard
  redirect('/verify-email-success')
}

/**
 * Send login OTP server action
 */
export async function sendLoginOtpAction(formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return {
      success: false,
      error: 'Email is required'
    }
  }
  
  const result = await sendLoginOTP(email)
  
  if (result.error) {
    return {
      success: false,
      error: result.error.message
    }
  }
  
  return {
    success: true,
    message: result.message,
    otp: result.otp // For development only
  }
}

/**
 * Verify login OTP server action
 */
export async function verifyLoginOtpAction(formData: FormData) {
  const email = formData.get('email') as string
  const otp = formData.get('otp') as string
  
  if (!email || !otp) {
    return {
      success: false,
      error: 'Email and OTP code are required'
    }
  }
  
  const result = await verifyLoginOTP(email, otp)
  
  if (result.error) {
    return {
      success: false,
      error: result.error.message
    }
  }
  
  // Get role and redirect
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle()
    
    const role = roleData?.role || 'customer'
    
    switch (role) {
      case 'super_admin':
        redirect('/super-admin')
        break
      case 'salon_owner':
        redirect('/salon-owner')  
        break
      case 'location_manager':
        redirect('/location-manager')
        break
      case 'staff':
        redirect('/staff-member')
        break
      default:
        redirect('/customer')
        break
    }
  }
  
  redirect('/customer')
}