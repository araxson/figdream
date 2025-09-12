'use server'

import { createClient } from '@/lib/auth/server'

export async function getNotifications(userId?: string) {
  const supabase = await createClient()
  
  // Get current user if no userId provided
  if (!userId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Not authenticated' }
    }
    userId = user.id
  }
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)
  
  if (error) {
    return { error: error.message }
  }
  
  return { data }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('id', notificationId)
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

export async function markAllNotificationsAsRead(userId?: string) {
  const supabase = await createClient()
  
  // Get current user if no userId provided
  if (!userId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Not authenticated' }
    }
    userId = user.id
  }
  
  const { error } = await supabase
    .from('notifications')
    .update({ 
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

export async function deleteNotification(notificationId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
  
  if (error) {
    return { error: error.message }
  }
  
  return { success: true }
}

export async function getUnreadNotificationCount(userId?: string) {
  const supabase = await createClient()
  
  // Get current user if no userId provided
  if (!userId) {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: 'Not authenticated', count: 0 }
    }
    userId = user.id
  }
  
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)
  
  if (error) {
    return { error: error.message, count: 0 }
  }
  
  return { count: count || 0 }
}