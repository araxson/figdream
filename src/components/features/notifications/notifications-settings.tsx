'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/ui/use-toast'
import { Database } from '@/types/database.types'
import { EmailNotificationSettings } from './email-notification-settings'
import { SmsNotificationSettings } from './sms-notification-settings'
import { Skeleton } from '@/components/ui/skeleton'

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const toast = useToast()

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings(data)
      } else {
        // Create default settings if none exist
        const defaultSettings = {
          user_id: user.id,
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

        const { data: newSettings } = await supabase
          .from('notification_settings')
          .insert(defaultSettings)
          .select()
          .single()

        if (newSettings) {
          setSettings(newSettings)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load notification settings')
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  async function updateSettings(updates: Partial<NotificationSettings>) {
    if (!settings || saving) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('notification_settings')
        .update(updates)
        .eq('id', settings.id)

      if (error) throw error

      setSettings({ ...settings, ...updates })
      toast.success('Your notification preferences have been saved')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof NotificationSettings, value: boolean) => {
    updateSettings({ [field]: value })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <EmailNotificationSettings settings={settings} onToggle={handleToggle} />
      <SmsNotificationSettings settings={settings} onToggle={handleToggle} />
    </div>
  )
}