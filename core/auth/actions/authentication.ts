'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const OTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  token: z.string().length(6, 'OTP must be 6 digits'),
})

// Response types
export type AuthResponse = {
  success: boolean
  error?: string
  data?: any
  redirectUrl?: string
}

// LOGIN
export async function login(formData: FormData): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Validate input
    const validatedData = LoginSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error) {
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'Invalid email or password. Please check your credentials.',
        }
      }
      if (error.message.includes('Email not confirmed')) {
        return {
          success: false,
          error: 'Please verify your email address before logging in.',
        }
      }
      return {
        success: false,
        error: error.message || 'Unable to sign in. Please try again.',
      }
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Authentication failed. Please try again.',
      }
    }

    // Get user profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    // Get user role for proper redirect
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()

    // Determine redirect based on role
    let redirectUrl = '/dashboard'
    if (userRole?.role === 'admin') {
      redirectUrl = '/admin'
    } else if (userRole?.role === 'staff') {
      redirectUrl = '/staff'
    } else if (userRole?.role === 'customer') {
      redirectUrl = '/customer'
    }

    revalidatePath('/', 'layout')

    return {
      success: true,
      data: { user: data.user, profile },
      redirectUrl,
    }
  } catch (error) {
    console.error('[Login Error]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid input. Please check your information.',
      }
    }

    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
    }
  }
}

// LOGOUT
export async function logout(): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message || 'Unable to sign out. Please try again.',
      }
    }

    revalidatePath('/', 'layout')

    return {
      success: true,
      redirectUrl: '/login',
    }
  } catch (error) {
    console.error('[Logout Error]:', error)

    return {
      success: false,
      error: 'An error occurred while signing out.',
    }
  }
}

// SEND OTP
export async function sendOTP(formData: FormData): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string

    if (!email) {
      return {
        success: false,
        error: 'Email is required.',
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP in database with expiry
    const { error } = await supabase
      .from('otp_codes')
      .insert({
        email,
        code: otp,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })

    if (error) {
      return {
        success: false,
        error: 'Unable to send OTP. Please try again.',
      }
    }

    // TODO: Send OTP via email service

    return {
      success: true,
      data: {
        message: 'OTP sent to your email address.',
      },
    }
  } catch (error) {
    console.error('[Send OTP Error]:', error)

    return {
      success: false,
      error: 'An error occurred. Please try again.',
    }
  }
}

// VERIFY OTP
export async function verifyOTP(formData: FormData): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    // Validate input
    const validatedData = OTPSchema.parse({
      email: formData.get('email'),
      token: formData.get('token'),
    })

    // Check OTP
    const { data: otpData, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', validatedData.email)
      .eq('code', validatedData.token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpData) {
      return {
        success: false,
        error: 'Invalid or expired OTP. Please try again.',
      }
    }

    // Mark OTP as used
    await supabase
      .from('otp_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', otpData.id)

    // Sign in user with OTP
    const { data, error } = await supabase.auth.signInWithOtp({
      email: validatedData.email,
      token: validatedData.token,
      options: {
        shouldCreateUser: false,
      },
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Authentication failed. Please try again.',
      }
    }

    revalidatePath('/', 'layout')

    return {
      success: true,
      data: { user: data.user },
      redirectUrl: '/dashboard',
    }
  } catch (error) {
    console.error('[Verify OTP Error]:', error)

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Invalid input.',
      }
    }

    return {
      success: false,
      error: 'Verification failed. Please try again.',
    }
  }
}

// Session management functions
export async function refreshSession(): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.refreshSession()

    if (error) {
      return {
        success: false,
        error: 'Unable to refresh session.',
      }
    }

    return {
      success: true,
      data: { session: data.session },
    }
  } catch (error) {
    console.error('[Refresh Session Error]:', error)
    return {
      success: false,
      error: 'Session refresh failed.',
    }
  }
}

export async function validateSession(): Promise<AuthResponse> {
  try {
    const supabase = await createClient()

    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      return {
        success: false,
        error: 'No valid session found.',
      }
    }

    return {
      success: true,
      data: { session, user: session.user },
    }
  } catch (error) {
    console.error('[Validate Session Error]:', error)
    return {
      success: false,
      error: 'Session validation failed.',
    }
  }
}