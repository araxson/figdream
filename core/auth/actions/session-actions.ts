'use server'

import { createClient } from '@/lib/supabase/server'

export interface SessionData {
  user: {
    id: string
    email: string
    role: string
    profile: {
      full_name?: string
      avatar_url?: string
      phone?: string
      salon_id?: string | null
      staff_id?: string | null
    }
  } | null
  salon: {
    id: string
    name: string
    slug: string
    settings?: any
  } | null
}

/**
 * Get current user session with salon context
 */
export async function getSessionAction(): Promise<SessionData> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { user: null, salon: null }
    }

    // Get user profile from public schema
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Failed to fetch profile:', profileError)
      return { user: null, salon: null }
    }

    // Get user role to determine salon_id
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('salon_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    // Get salon information if user has a salon_id
    let salon = null
    if (userRole?.salon_id) {
      const { data: salonData } = await supabase
        .from('salons')
        .select('id, name, slug, settings')
        .eq('id', userRole.salon_id)
        .single()

      if (salonData) {
        salon = salonData
      }
    }

    // Format response
    const session: SessionData = {
      user: {
        id: user.id,
        email: user.email || profile.email,
        role: userRole?.role || 'guest',
        profile: {
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          phone: profile.phone,
          salon_id: userRole?.salon_id || null,
          staff_id: null // Will be set if staff profile exists
        }
      },
      salon
    }

    return session
  } catch (error) {
    console.error('Session error:', error)
    return { user: null, salon: null }
  }
}

/**
 * Get notification counts for current user
 */
export async function getNotificationCountAction(): Promise<{ total: number; unread: number }> {
  try {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { total: 0, unread: 0 }
    }

    // Get notification counts - using placeholder since table doesn't exist
    // TODO: Replace with actual notification counts when communication schema is ready
    return { total: 0, unread: 0 }
  } catch (error) {
    console.error('Notification count error:', error)
    return { total: 0, unread: 0 }
  }
}