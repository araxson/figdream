'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { MessageSquare } from 'lucide-react'
import { Database } from '@/types/database.types'

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']

interface SmsNotificationSettingsProps {
  settings: NotificationSettings | null
  onToggle: (field: keyof NotificationSettings, value: boolean) => void
}

export function SmsNotificationSettings({ settings, onToggle }: SmsNotificationSettingsProps) {
  if (!settings) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          SMS Notifications
        </CardTitle>
        <CardDescription>
          Choose what SMS notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sms-appointments">Appointment confirmations</Label>
            <p className="text-sm text-muted-foreground">
              Receive SMS confirmations for your appointments
            </p>
          </div>
          <Switch
            id="sms-appointments"
            checked={settings.is_sms_appointments_enabled || false}
            onCheckedChange={(checked) => onToggle('is_sms_appointments_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sms-reminders">Appointment reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get SMS reminders before your appointments
            </p>
          </div>
          <Switch
            id="sms-reminders"
            checked={settings.is_sms_reminders_enabled || false}
            onCheckedChange={(checked) => onToggle('is_sms_reminders_enabled', checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="sms-marketing">Promotions and offers</Label>
            <p className="text-sm text-muted-foreground">
              Receive special offers via SMS
            </p>
          </div>
          <Switch
            id="sms-marketing"
            checked={settings.is_sms_marketing_enabled || false}
            onCheckedChange={(checked) => onToggle('is_sms_marketing_enabled', checked)}
          />
        </div>
      </CardContent>
    </Card>
  )
}