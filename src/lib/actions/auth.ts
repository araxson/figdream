'use server'

import { createClient } from '@/lib/auth/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signInWithEmail(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Failed to sign in' }
  }

  // Get user role from profiles table (source of truth)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
  
  // Use role from profiles table, fallback to user_roles table, then to customer
  let userRole = 'customer'
  
  if (profile?.role) {
    userRole = profile.role
  } else {
    // Check user_roles table as fallback
    const { data: userRoleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()
    
    if (userRoleData?.role) {
      userRole = userRoleData.role
      // Update profiles table to maintain consistency
      await supabase
        .from('profiles')
        .update({ role: userRoleData.role })
        .eq('id', data.user.id)
    }
  }
  
  // Return success with role for client-side redirect
  return { 
    success: true, 
    role: userRole as 'super_admin' | 'salon_owner' | 'salon_manager' | 'location_manager' | 'staff' | 'customer'
  }
}

export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
  
  return { error: 'Failed to initiate OAuth' }
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }
  
  redirect('/')
}

export async function signUp(email: string, password: string, metadata?: Record<string, unknown>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Failed to create account' }
  }

  return { success: true, user: data.user }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  const origin = (await headers()).get('origin')
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}