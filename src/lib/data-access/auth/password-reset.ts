'use server'
import { createClient } from '@/lib/database/supabase/server'
import { AuthError } from '@supabase/supabase-js'

interface PasswordResetResponse {
  success?: boolean
  error?: AuthError | Error
  message?: string
}

/**
 * Send password reset email using Supabase's built-in functionality
 */
export async function sendPasswordResetEmail(email: string): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  
  // Use Supabase's built-in password reset
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
  })
  
  if (error) {
    return { error }
  }
  
  return { 
    success: true,
    message: 'Password reset email sent. Please check your inbox.'
  }
}

/**
 * Update password after user clicks reset link
 */
export async function updatePassword(newPassword: string): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  
  // Update the user's password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  
  if (error) {
    return { error }
  }
  
  return { 
    success: true,
    message: 'Password updated successfully.'
  }
}

/**
 * Simple OTP-based password reset (stores OTP in database)
 */
export async function createPasswordResetOTP(email: string): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  
  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  // Store OTP in database
  const { error } = await supabase
    .from('password_reset_tokens')
    .upsert({
      email,
      token: otp,
      expires_at: expiresAt.toISOString(),
      verified: false
    }, {
      onConflict: 'email'
    })
  
  if (error) {
    return { error }
  }
  
  // In production, send email with OTP
  // For development, we'll just log it
  console.log(`Password reset OTP for ${email}: ${otp}`)
  
  return {
    success: true,
    message: 'Verification code sent to your email.'
  }
}

/**
 * Verify OTP and mark as verified
 */
export async function verifyPasswordResetOTP(email: string, otp: string): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  
  // Check if OTP is valid
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('email', email)
    .eq('token', otp)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle()
  
  if (error || !data) {
    return { 
      error: new Error('Invalid or expired verification code')
    }
  }
  
  // Mark as verified
  const { error: updateError } = await supabase
    .from('password_reset_tokens')
    .update({ verified: true })
    .eq('email', email)
    .eq('token', otp)
  
  if (updateError) {
    return { error: updateError }
  }
  
  return {
    success: true,
    message: 'Verification successful.'
  }
}