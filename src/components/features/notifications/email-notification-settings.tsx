'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Mail } from 'lucide-react'
import { Database } from '@/types/database.types'

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']

interface EmailNotificationSettingsProps {
  settings: NotificationSettings | null
  onToggle: (field: keyof NotificationSettings, value: boolean) => void
}

export function EmailNotificationSettings({ settings, onToggle }: EmailNotificationSettingsProps) {
  if (!settings) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose what email notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-appointments">Appointment confirmations</Label>
            <p className="text-sm text-muted-foreground">
              Receive email confirmations when appointments are booked or changed
            </p>
          </div>
          <Switch
            id="email-appointments"
            checked={settings.is_email_appointments_enabled || false}
            onCheckedChange={(checked) => onToggle('is_email_appointments_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-reminders">Appointment reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get reminder emails before your appointments
            </p>
          </div>
          <Switch
            id="email-reminders"
            checked={settings.is_email_reminders_enabled || false}
            onCheckedChange={(checked) => onToggle('is_email_reminders_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-reviews">Review requests</Label>
            <p className="text-sm text-muted-foreground">
              Receive emails asking for feedback after appointments
            </p>
          </div>
          <Switch
            id="email-reviews"
            checked={false}
            onCheckedChange={() => {}}
            disabled
            title="Review notifications are not available via email"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="email-marketing">Promotions and offers</Label>
            <p className="text-sm text-muted-foreground">
              Stay updated with special offers and salon news
            </p>
          </div>
          <Switch
            id="email-marketing"
            checked={settings.is_email_marketing_enabled || false}
            onCheckedChange={(checked) => onToggle('is_email_marketing_enabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}