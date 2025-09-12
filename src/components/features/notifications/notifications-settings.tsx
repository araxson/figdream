'use client'

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Database } from '@/types/database.types'
import { EmailNotificationSettings } from './email-notification-settings'
import { SmsNotificationSettings } from './sms-notification-settings'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']

interface NotificationSettingsProps {
  initialSettings: NotificationSettings | null
}

export function NotificationSettings({ initialSettings }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings | null>(initialSettings)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  async function updateSettings(updates: Partial<NotificationSettings>) {
    if (!settings || saving) return

    setSaving(true)
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Failed to update settings')
      }

      setSettings({ ...settings, ...updates })
      toast({ 
        title: 'Success',
        description: 'Your notification preferences have been saved' 
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({ 
        title: 'Error',
        description: 'Failed to update settings',
        variant: "destructive" 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (field: keyof NotificationSettings, value: boolean) => {
    updateSettings({ [field]: value })
  }

  if (!settings) {
    return (
      <div className={cn("space-y-6")}>
        <Skeleton className={cn("h-64 w-full")} />
        <Skeleton className={cn("h-64 w-full")} />
      </div>
    )
  }

  return (
    <div className={cn("space-y-6")}>
      <EmailNotificationSettings settings={settings} onToggle={handleToggle} />
      <SmsNotificationSettings settings={settings} onToggle={handleToggle} />
    </div>
  )
}