'use client'

import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export type NotificationChannel = 'email' | 'sms' | 'push'

interface NotificationCategoryItemProps {
  category: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  email: boolean
  sms: boolean
  push: boolean
  onChannelToggle: (category: string, channel: NotificationChannel, value: boolean) => void
}

export function NotificationCategoryItem({
  category,
  description,
  icon: Icon,
  email,
  sms,
  push,
  onChannelToggle
}: NotificationCategoryItemProps) {
  return (
    <div className="space-y-4 pb-6 border-b last:border-0">
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium">{category}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 ml-8">
        <div className="flex items-center space-x-2">
          <Switch
            id={`${category}-email`}
            checked={email}
            onCheckedChange={(value) => onChannelToggle(category, 'email', value)}
          />
          <Label htmlFor={`${category}-email`} className="text-sm">
            Email
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`${category}-sms`}
            checked={sms}
            onCheckedChange={(value) => onChannelToggle(category, 'sms', value)}
          />
          <Label htmlFor={`${category}-sms`} className="text-sm">
            SMS
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id={`${category}-push`}
            checked={push}
            onCheckedChange={(value) => onChannelToggle(category, 'push', value)}
          />
          <Label htmlFor={`${category}-push`} className="text-sm">
            Push
          </Label>
        </div>
      </div>
    </div>
  )
}