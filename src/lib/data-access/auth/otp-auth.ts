'use server'
import { createClient } from '@/lib/database/supabase/server'
import { AuthError } from '@supabase/supabase-js'

interface OTPResponse {
  success?: boolean
  error?: AuthError | Error
  message?: string
  otp?: string // For development only
}

/**
 * Send OTP for signup verification
 */
export async function sendSignupOTP(email: string, metadata?: Record<string, unknown>): Promise<OTPResponse> {
  const supabase = await createClient()
  
  try {
    // First create the user account (will be unverified)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password: Math.random().toString(36).slice(-12), // Temporary password, will be changed
      options: {
        data: metadata,
        emailRedirectTo: undefined // Don't send confirmation email
      }
    })
    
    if (signUpError) {
      // User might already exist
      if (signUpError.message.includes('already registered')) {
        return { error: new Error('Email already registered') }
      }
      return { error: signUpError }
    }
    
    // Generate OTP
    const { data, error } = await supabase.rpc('create_otp_verification', {
      p_email: email,
      p_otp_type: 'signup',
      p_user_id: authData.user?.id,
      p_metadata: metadata
    })
    
    if (error) {
      return { error }
    }
    
    // In development, log the OTP
    if (process.env.NODE_ENV === 'development' && data?.[0]) {
      console.log(`📧 Signup OTP for ${email}: ${data[0].otp_code}`)
    }
    
    return {
      success: true,
      message: 'Verification code sent to your email',
      otp: process.env.NODE_ENV === 'development' ? data?.[0]?.otp_code : undefined
    }
  } catch (err) {
    return { error: err as Error }
  }
}

/**
 * Verify signup OTP and complete registration
 */
export async function verifySignupOTP(
  email: string, 
  otp: string,
  password: string
): Promise<OTPResponse> {
  const supabase = await createClient()
  
  try {
    // Verify OTP
    const { data, error } = await supabase.rpc('verify_otp_code', {
      p_email: email,
      p_otp_code: otp,
      p_otp_type: 'signup'
    })
    
    if (error || !data?.[0]?.success) {
      return { 
        error: new Error(data?.[0]?.message || 'Invalid verification code') 
      }
    }
    
    // Update user password and mark as verified
    const userId = data[0].user_id
    if (userId) {
      // Mark email as verified in profiles
      await supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('user_id', userId)
      
      // Sign in the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (signInError) {
        return { error: signInError }
      }
      
      return {
        success: true,
        message: 'Account verified successfully'
      }
    }
    
    return {
      success: true,
      message: 'Verification successful'
    }
  } catch (err) {
    return { error: err as Error }
  }
}

/**
 * Send OTP for password reset
 */
export async function sendPasswordResetOTP(email: string): Promise<OTPResponse> {
  const supabase = await createClient()
  
  try {
    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle()
    
    if (!profile) {
      // Don't reveal if user exists
      return {
        success: true,
        message: 'If an account exists, a verification code will be sent'
      }
    }
    
    // Generate OTP
    const { data, error } = await supabase.rpc('create_otp_verification', {
      p_email: email,
      p_otp_type: 'password_reset',
      p_user_id: profile.user_id
    })
    
    if (error) {
      return { error }
    }
    
    // In development, log the OTP
    if (process.env.NODE_ENV === 'development' && data?.[0]) {
      console.log(`🔑 Password Reset OTP for ${email}: ${data[0].otp_code}`)
    }
    
    return {
      success: true,
      message: 'Verification code sent to your email',
      otp: process.env.NODE_ENV === 'development' ? data?.[0]?.otp_code : undefined
    }
  } catch (err) {
    return { error: err as Error }
  }
}

/**
 * Verify password reset OTP
 */
export async function verifyPasswordResetOTP(email: string, otp: string): Promise<OTPResponse> {
  const supabase = await createClient()
  
  try {
    // Verify OTP
    const { data, error } = await supabase.rpc('verify_otp_code', {
      p_email: email,
      p_otp_code: otp,
      p_otp_type: 'password_reset'
    })
    
    if (error || !data?.[0]?.success) {
      return { 
        error: new Error(data?.[0]?.message || 'Invalid verification code') 
      }
    }
    
    return {
      success: true,
      message: 'Verification successful. You can now reset your password.'
    }
  } catch (err) {
    return { error: err as Error }
  }
}

/**
 * Reset password after OTP verification
 */
export async function resetPasswordWithOTP(
  email: string, 
  newPassword: string
): Promise<OTPResponse> {
  const supabase = await createClient()
  
  try {
    // Get user ID from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle()
    
    if (!profile) {
      return { error: new Error('User not found') }
    }
    
    // Check if there's a recently verified OTP
    const { data: otpCheck } = await supabase
      .from('otp_verifications')
      .select('verified_at')
      .eq('email', email)
      .eq('otp_type', 'password_reset')
      .eq('verified', true)
      .gte('verified_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Within 5 minutes
      .order('verified_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (!otpCheck) {
      return { error: new Error('Please verify your email first') }
    }
    
    // Use Supabase's password reset flow
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    
    if (error) {
      return { error }
    }
    
    return {
      success: true,
      message: 'Password updated successfully'
    }
  } catch (err) {
    return { error: err as Error }
  }
}

/**
 * Send OTP for magic link login
 */
export async function sendLoginOTP(email: string): Promise<OTPResponse> {
  const supabase = await createClient()
  
  try {
    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle()
    
    if (!profile) {
      return { error: new Error('No account found with this email') }
    }
    
    // Generate OTP
    const { data, error } = await supabase.rpc('create_otp_verification', {
      p_email: email,
      p_otp_type: 'login',
      p_user_id: profile.user_id
    })
    
    if (error) {
      return { error }
    }
    
    // In development, log the OTP
    if (process.env.NODE_ENV === 'development' && data?.[0]) {
      console.log(`🔐 Login OTP for ${email}: ${data[0].otp_code}`)
    }
    
    return {
      success: true,
      message: 'Login code sent to your email',
      otp: process.env.NODE_ENV === 'development' ? data?.[0]?.otp_code : undefined
    }
  } catch (err) {
    return { error: err as Error }
  }
}

/**
 * Verify login OTP and sign in
 */
export async function verifyLoginOTP(email: string, otp: string): Promise<OTPResponse> {
  const supabase = await createClient()
  
  try {
    // Verify OTP
    const { data, error } = await supabase.rpc('verify_otp_code', {
      p_email: email,
      p_otp_code: otp,
      p_otp_type: 'login'
    })
    
    if (error || !data?.[0]?.success) {
      return { 
        error: new Error(data?.[0]?.message || 'Invalid login code') 
      }
    }
    
    // Sign in with OTP (magic link style)
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false
      }
    })
    
    if (signInError) {
      return { error: signInError }
    }
    
    return {
      success: true,
      message: 'Logged in successfully'
    }
  } catch (err) {
    return { error: err as Error }
  }
}