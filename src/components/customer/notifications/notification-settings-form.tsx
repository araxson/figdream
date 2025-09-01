'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { 
  upsertNotificationSettings,
  updateNotificationChannel,
  updateNotificationType,
  toggleAllNotifications
} from '@/lib/data-access/notification-settings'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Save, Bell, BellOff, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { Database } from '@/types/database.types'

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row']

interface NotificationCategory {
  id: string
  label: string
  description: string
  types: Array<{
    id: string
    label: string
    description: string
  }>
}

interface NotificationSettingsFormProps {
  userId: string
  currentSettings: NotificationSettings
  categories: NotificationCategory[]
}

export function NotificationSettingsForm({
  userId,
  currentSettings,
  categories
}: NotificationSettingsFormProps) {
  const router = useRouter()
  const [settings, setSettings] = useState(currentSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Handle channel toggle (email, sms, push)
  const handleChannelToggle = async (channel: 'email' | 'sms' | 'push', enabled: boolean) => {
    const channelKey = `${channel}_enabled` as keyof NotificationSettings
    setSettings(prev => ({
      ...prev,
      [channelKey]: enabled
    }))
    setHasChanges(true)
  }

  // Handle individual notification type toggle
  const handleNotificationToggle = (type: string, channel: 'email' | 'sms' | 'push', enabled: boolean) => {
    const key = `${type}_${channel}` as keyof NotificationSettings
    setSettings(prev => ({
      ...prev,
      [key]: enabled
    }))
    setHasChanges(true)
  }

  // Handle master toggle
  const handleMasterToggle = (enabled: boolean) => {
    const newSettings = { ...settings }
    
    // Toggle all channels
    newSettings.email_enabled = enabled
    newSettings.sms_enabled = enabled
    newSettings.push_enabled = enabled
    
    // Toggle all notification types
    categories.forEach(category => {
      category.types.forEach(type => {
        const emailKey = `${type.id}_email` as keyof NotificationSettings
        const smsKey = `${type.id}_sms` as keyof NotificationSettings
        const pushKey = `${type.id}_push` as keyof NotificationSettings
        
        newSettings[emailKey] = enabled as any
        newSettings[smsKey] = enabled as any
        newSettings[pushKey] = enabled as any
      })
    })
    
    setSettings(newSettings)
    setHasChanges(true)
  }

  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Calculate what changed
      const updates: Partial<NotificationSettings> = {}
      Object.keys(settings).forEach(key => {
        if (settings[key as keyof NotificationSettings] !== currentSettings[key as keyof NotificationSettings]) {
          updates[key as keyof NotificationSettings] = settings[key as keyof NotificationSettings]
        }
      })
      
      await upsertNotificationSettings(userId, updates)
      toast.success('Notification settings saved successfully')
      setHasChanges(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to save notification settings')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Check if all notifications are enabled/disabled
  const allEnabled = settings.email_enabled && settings.sms_enabled && settings.push_enabled

  return (
    <div className="space-y-6">
      {/* Master Controls */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-base">All Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Enable or disable all notifications at once
          </p>
        </div>
        <Button
          variant={allEnabled ? 'outline' : 'default'}
          size="sm"
          onClick={() => handleMasterToggle(!allEnabled)}
        >
          {allEnabled ? (
            <>
              <BellOff className="mr-2 h-4 w-4" />
              Disable All
            </>
          ) : (
            <>
              <Bell className="mr-2 h-4 w-4" />
              Enable All
            </>
          )}
        </Button>
      </div>

      <Separator />

      {/* Channel Controls */}
      <div className="space-y-4">
        <h3 className="font-medium">Notification Channels</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email-channel" className="cursor-pointer">
                Email Notifications
              </Label>
            </div>
            <Switch
              id="email-channel"
              checked={settings.email_enabled}
              onCheckedChange={(checked) => handleChannelToggle('email', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sms-channel" className="cursor-pointer">
                SMS Notifications
              </Label>
            </div>
            <Switch
              id="sms-channel"
              checked={settings.sms_enabled}
              onCheckedChange={(checked) => handleChannelToggle('sms', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="push-channel" className="cursor-pointer">
                Push Notifications
              </Label>
            </div>
            <Switch
              id="push-channel"
              checked={settings.push_enabled}
              onCheckedChange={(checked) => handleChannelToggle('push', checked)}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Detailed Preferences */}
      <div className="space-y-4">
        <h3 className="font-medium">Notification Types</h3>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="push">Push</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger>
                    <div className="text-left">
                      <p className="font-medium">{category.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-4">
                      {category.types.map((type) => {
                        const emailKey = `${type.id}_email` as keyof NotificationSettings
                        const smsKey = `${type.id}_sms` as keyof NotificationSettings
                        const pushKey = `${type.id}_push` as keyof NotificationSettings
                        
                        return (
                          <div key={type.id} className="space-y-3 rounded-lg border p-4">
                            <div>
                              <p className="font-medium">{type.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {type.description}
                              </p>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`${type.id}-email`}
                                  checked={settings[emailKey] as boolean}
                                  onCheckedChange={(checked) => 
                                    handleNotificationToggle(type.id, 'email', checked)
                                  }
                                  disabled={!settings.email_enabled}
                                />
                                <Label 
                                  htmlFor={`${type.id}-email`}
                                  className="text-sm cursor-pointer"
                                >
                                  Email
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`${type.id}-sms`}
                                  checked={settings[smsKey] as boolean}
                                  onCheckedChange={(checked) => 
                                    handleNotificationToggle(type.id, 'sms', checked)
                                  }
                                  disabled={!settings.sms_enabled}
                                />
                                <Label 
                                  htmlFor={`${type.id}-sms`}
                                  className="text-sm cursor-pointer"
                                >
                                  SMS
                                </Label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  id={`${type.id}-push`}
                                  checked={settings[pushKey] as boolean}
                                  onCheckedChange={(checked) => 
                                    handleNotificationToggle(type.id, 'push', checked)
                                  }
                                  disabled={!settings.push_enabled}
                                />
                                <Label 
                                  htmlFor={`${type.id}-push`}
                                  className="text-sm cursor-pointer"
                                >
                                  Push
                                </Label>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          {/* Channel-specific tabs */}
          {['email', 'sms', 'push'].map((channel) => (
            <TabsContent key={channel} value={channel} className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <h4 className="font-medium">{category.label}</h4>
                  {category.types.map((type) => {
                    const key = `${type.id}_${channel}` as keyof NotificationSettings
                    const channelEnabled = settings[`${channel}_enabled` as keyof NotificationSettings]
                    
                    return (
                      <div 
                        key={type.id} 
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <Label htmlFor={`${type.id}-${channel}-tab`} className="cursor-pointer">
                            {type.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                        <Switch
                          id={`${type.id}-${channel}-tab`}
                          checked={settings[key] as boolean}
                          onCheckedChange={(checked) => 
                            handleNotificationToggle(type.id, channel as 'email' | 'sms' | 'push', checked)
                          }
                          disabled={!channelEnabled}
                        />
                      </div>
                    )
                  })}
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4 pt-4">
        {hasChanges && (
          <p className="text-sm text-muted-foreground self-center">
            You have unsaved changes
          </p>
        )}
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !hasChanges}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}