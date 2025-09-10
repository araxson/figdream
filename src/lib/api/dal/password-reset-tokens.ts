import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type PasswordResetToken = Tables['password_reset_tokens']['Row']
type PasswordResetTokenInsert = Tables['password_reset_tokens']['Insert']

export interface PasswordResetTokenDTO {
  id: string
  email: string
  token: string
  expires_at: string
  is_verified: boolean
  created_at: string
}

function toPasswordResetTokenDTO(token: PasswordResetToken): PasswordResetTokenDTO {
  return {
    id: token.id,
    email: token.email,
    token: token.token,
    expires_at: token.expires_at,
    is_verified: token.is_verified || false,
    created_at: token.created_at || new Date().toISOString()
  }
}

export const verifyPasswordResetToken = cache(async (
  token: string
): Promise<PasswordResetTokenDTO | null> => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .select('*')
    .eq('token', token)
    .eq('is_verified', false)
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (error) {
    console.error('Error verifying password reset token:', error)
    return null
  }
  
  return data ? toPasswordResetTokenDTO(data) : null
})

export async function createPasswordResetToken(
  email: string
): Promise<PasswordResetTokenDTO | null> {
  const supabase = await createClient()
  
  // Generate a secure random token
  const token = crypto.randomUUID()
  
  // Set expiration to 1 hour from now
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 1)
  
  const tokenData: PasswordResetTokenInsert = {
    email,
    token,
    expires_at: expiresAt.toISOString(),
    is_verified: false
  }
  
  const { data, error } = await supabase
    .from('password_reset_tokens')
    .insert(tokenData)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating password reset token:', error)
    throw new Error('Failed to create password reset token')
  }
  
  return data ? toPasswordResetTokenDTO(data) : null
}

export async function markTokenAsUsed(
  tokenId: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('password_reset_tokens')
    .update({ 
      is_verified: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', tokenId)
  
  if (error) {
    console.error('Error marking token as used:', error)
    throw new Error('Failed to mark token as used')
  }
  
  return true
}

export async function invalidateUserTokens(
  email: string
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('password_reset_tokens')
    .update({ is_verified: true })
    .eq('email', email)
    .eq('is_verified', false)
  
  if (error) {
    console.error('Error invalidating user tokens:', error)
    throw new Error('Failed to invalidate user tokens')
  }
  
  return true
}

export async function cleanupExpiredTokens(): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('password_reset_tokens')
    .delete()
    .lt('expires_at', new Date().toISOString())
  
  if (error) {
    console.error('Error cleaning up expired tokens:', error)
    throw new Error('Failed to cleanup expired tokens')
  }
  
  return true
}