'use server';
import { createClient } from '@/lib/database/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import type { Database } from '@/types/database.types';
type _CSRFToken = Database['public']['Tables']['csrf_tokens']['Row'];
type CSRFTokenInsert = Database['public']['Tables']['csrf_tokens']['Insert'];
const CSRF_TOKEN_COOKIE = 'csrf_token';
const TOKEN_EXPIRY_HOURS = 24;
/**
 * Generate a secure CSRF token
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
/**
 * Create and store a new CSRF token
 */
export async function generateCSRFToken(userId?: string): Promise<string> {
  const supabase = await createClient();
  // Generate new token
  const token = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);
  // Get session ID from cookies or generate new one
  const cookieStore = cookies();
  let sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) {
    sessionId = crypto.randomBytes(16).toString('hex');
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });
  }
  // Store token in database
  const tokenData: CSRFTokenInsert = {
    token,
    user_id: userId || null,
    session_id: sessionId,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
    used: false
  };
  const { error } = await supabase
    .from('csrf_tokens')
    .insert(tokenData);
  if (error) {
    throw new Error('Failed to generate security token');
  }
  // Set token in HTTP-only cookie
  cookieStore.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * TOKEN_EXPIRY_HOURS
  });
  return token;
}
/**
 * Validate a CSRF token
 */
export async function validateCSRFToken(token: string): Promise<boolean> {
  if (!token) {
    return false;
  }
  const supabase = await createClient();
  const cookieStore = cookies();
  // Get token from cookie for comparison
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  if (token !== cookieToken) {
    return false;
  }
  // Get session ID
  const sessionId = cookieStore.get('session_id')?.value;
  if (!sessionId) {
    return false;
  }
  // Verify token in database
  const { data, error } = await supabase
    .from('csrf_tokens')
    .select('*')
    .eq('token', token)
    .eq('session_id', sessionId)
    .eq('used', false)
    .gte('expires_at', new Date().toISOString())
    .single();
  if (error || !data) {
    return false;
  }
  // Mark token as used (single-use tokens for extra security)
  await supabase
    .from('csrf_tokens')
    .update({ used: true })
    .eq('token', token);
  return true;
}
/**
 * Get current CSRF token or generate new one
 */
export async function getOrGenerateCSRFToken(): Promise<string> {
  const cookieStore = cookies();
  const existingToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  const sessionId = cookieStore.get('session_id')?.value;
  if (existingToken && sessionId) {
    const supabase = await createClient();
    // Check if existing token is still valid
    const { data } = await supabase
      .from('csrf_tokens')
      .select('*')
      .eq('token', existingToken)
      .eq('session_id', sessionId)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();
    if (data) {
      return existingToken;
    }
  }
  // Generate new token if none exists or existing is invalid
  const { data: { user } } = await (await createClient()).auth.getUser();
  return generateCSRFToken(user?.id);
}
/**
 * Clean up expired CSRF tokens (for cron job)
 */
export async function cleanupExpiredTokens(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('csrf_tokens')
    .delete()
    .or(`expires_at.lt.${new Date().toISOString()},used.eq.true`);
  if (error) {
  }
}
/**
 * Revoke all tokens for a user (on logout)
 */
export async function revokeUserTokens(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('csrf_tokens')
    .update({ used: true })
    .eq('user_id', userId)
    .eq('used', false);
  if (error) {
  }
}
/**
 * Middleware helper to validate CSRF on server actions
 */
export async function requireCSRFToken(formData: FormData): Promise<void> {
  const token = formData.get('csrf_token') as string;
  if (!token) {
    throw new Error('Security validation failed: Missing token');
  }
  const isValid = await validateCSRFToken(token);
  if (!isValid) {
    throw new Error('Security validation failed: Invalid token');
  }
}
/**
 * React Hook helper for client components
 * Returns token to include in forms
 */
export async function getCSRFTokenForClient(): Promise<{ token: string }> {
  const token = await getOrGenerateCSRFToken();
  return { token };
}