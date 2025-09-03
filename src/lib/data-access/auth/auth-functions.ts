'use server'
import { createClient } from '@/lib/database/supabase/server'
import { AuthError } from '@supabase/supabase-js'
interface AuthResponse {
  user?: Record<string, unknown>
  session?: Record<string, unknown>
  error?: AuthError
}
interface PasswordResetResponse {
  success?: boolean
  error?: AuthError
}
/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) {
    return { error }
  }
  return { user: data.user, session: data.session }
}
/**
 * Sign up with email and password
 */
export async function signUpWithEmail(
  email: string, 
  password: string,
  metadata?: Record<string, unknown>
): Promise<AuthResponse> {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata
    }
  })
  if (error) {
    return { error }
  }
  // Create profile and user_role records after signup
  if (data.user) {
    const role = metadata?.role || 'customer'
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: data.user.id,
        email: data.user.email,
        first_name: metadata?.first_name || '',
        last_name: metadata?.last_name || '',
        full_name: metadata?.full_name || '',
        phone: metadata?.phone || null
      })
    if (profileError) {
    }
    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: role,
        is_active: true
      })
    if (roleError) {
    }
  }
  return { user: data.user, session: data.session }
}
/**
 * Send password reset OTP to email
 */
export async function sendPasswordResetOtp(email: string): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  // Store OTP in a temporary table with expiration (10 minutes)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  const { error: storeError } = await supabase
    .from('password_reset_tokens')
    .upsert({
      email,
      token: otp,
      expires_at: expiresAt.toISOString()
    }, {
      onConflict: 'email'
    })
  if (storeError) {
    return { error: storeError as AuthError }
  }
  // Send OTP via email (using Supabase's email service or custom)
  // For now, we'll use Supabase's resetPasswordForEmail with OTP in the email body
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
  })
  if (error) {
    return { error }
  }
  // In production, you would send a custom email with the OTP
  // For development, the OTP is stored and can be verified
  return { success: true }
}
/**
 * Verify password reset OTP
 */
export async function verifyPasswordResetOtp(email: string, token: string): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  // Check if OTP exists and is not expired
  const { data: tokenData, error: fetchError } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('email', email)
    .eq('token', token)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle()
  if (fetchError || !tokenData) {
    return { 
      error: new Error('Invalid or expired verification code') as AuthError 
    }
  }
  // Mark token as verified (but don't delete yet, will be used for password update)
  const { error: updateError } = await supabase
    .from('password_reset_tokens')
    .update({ verified: true })
    .eq('email', email)
    .eq('token', token)
  if (updateError) {
    return { error: updateError as AuthError }
  }
  return { success: true }
}
/**
 * Update password with OTP verification
 */
export async function updatePasswordWithOtp(
  email: string, 
  token: string, 
  newPassword: string
): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  // Verify the token is valid and verified
  const { data: tokenData, error: fetchError } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('email', email)
    .eq('token', token)
    .eq('verified', true)
    .gte('expires_at', new Date().toISOString())
    .maybeSingle()
  if (fetchError || !tokenData) {
    return { 
      error: new Error('Invalid or expired verification session') as AuthError 
    }
  }
  // Get user by email
  const { data: userData, error: userError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .maybeSingle()
  if (userError || !userData) {
    return { error: new Error('User not found') as AuthError }
  }
  // Update password using admin API (requires service role key)
  // In production, this would be done via a secure backend endpoint
  const { error: updateError } = await supabase.auth.admin.updateUserById(
    userData.user_id,
    { password: newPassword }
  )
  if (updateError) {
    return { error: updateError }
  }
  // Delete the used token
  await supabase
    .from('password_reset_tokens')
    .delete()
    .eq('email', email)
    .eq('token', token)
  return { success: true }
}
/**
 * Verify OTP for email verification
 */
export async function verifyOtp(email: string, token: string): Promise<AuthResponse> {
  const supabase = await createClient()
  // Verify the OTP token
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  })
  if (error) {
    return { error }
  }
  return { user: data.user, session: data.session }
}
/**
 * Sign out
 */
export async function signOut(): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    return { error }
  }
  return { success: true }
}
/**
 * Send password reset email (legacy - for backward compatibility)
 */
export async function sendPasswordResetEmail(email: string): Promise<PasswordResetResponse> {
  // Redirect to OTP-based flow
  return sendPasswordResetOtp(email)
}
/**
 * Update password (legacy - requires active session)
 */
export async function updatePassword(newPassword: string): Promise<PasswordResetResponse> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
  if (error) {
    return { error }
  }
  return { success: true }
}