import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { verifySession } from '@/lib/api/dal/auth'
import { Database } from '@/types/database.types'

export type NotificationSettingsDTO = Database['public']['Tables']['notification_settings']['Row']

export const getNotificationSettings = cache(async (): Promise<NotificationSettingsDTO | null> => {
  const session = await verifySession()
  if (!session) return null
  
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching notification settings:', error)
    return null
  }
  
  if (!data) {
    const defaultSettings = {
      user_id: session.user.id,
      is_email_appointments_enabled: true,
      is_email_reminders_enabled: true,
      is_email_marketing_enabled: false,
      is_sms_appointments_enabled: true,
      is_sms_reminders_enabled: true,
      is_sms_marketing_enabled: false,
      is_push_appointments_enabled: true,
      is_push_reminders_enabled: true,
      is_push_marketing_enabled: false,
      reminder_hours_before: 24
    }
    
    const { data: newSettings, error: insertError } = await supabase
      .from('notification_settings')
      .insert(defaultSettings)
      .select()
      .single()
    
    if (insertError) {
      console.error('Error creating default notification settings:', insertError)
      return null
    }
    
    return newSettings
  }
  
  return data
})

export async function updateNotificationSettings(
  updates: Partial<NotificationSettingsDTO>
): Promise<boolean> {
  const session = await verifySession()
  if (!session) return false
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('notification_settings')
    .update(updates)
    .eq('user_id', session.user.id)
  
  if (error) {
    console.error('Error updating notification settings:', error)
    return false
  }
  
  return true
}