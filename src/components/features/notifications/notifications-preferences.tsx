'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Save, Calendar, DollarSign, Star, Gift, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { NotificationCategoryItem, type NotificationChannel } from './preferences/notification-category-item'
import { QuietHoursSettings } from './preferences/quiet-hours-settings'

type NotificationPreference = {
  category: string
  email: boolean
  sms: boolean
  push: boolean
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      category: 'Appointments',
      email: true,
      sms: true,
      push: true,
      description: 'Booking confirmations, reminders, and changes',
      icon: Calendar
    },
    {
      category: 'Payments',
      email: true,
      sms: false,
      push: true,
      description: 'Payment confirmations and receipts',
      icon: DollarSign
    },
    {
      category: 'Reviews',
      email: true,
      sms: false,
      push: false,
      description: 'New reviews and ratings from customers',
      icon: Star
    },
    {
      category: 'Promotions',
      email: true,
      sms: true,
      push: false,
      description: 'Special offers and marketing campaigns',
      icon: Gift
    },
    {
      category: 'System',
      email: true,
      sms: false,
      push: true,
      description: 'Important system updates and maintenance',
      icon: Bell
    }
  ])

  const [quietHours, setQuietHours] = useState({
    enabled: true,
    start: '22:00',
    end: '08:00'
  })

  const updatePreference = (category: string, channel: NotificationChannel, value: boolean) => {
    setPreferences(prev => 
      prev.map(p => 
        p.category === category 
          ? { ...p, [channel]: value }
          : p
      )
    )
  }

  const savePreferences = () => {
    toast.success('Notification preferences saved')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Notification Preferences</CardTitle>
            </div>
            <Button onClick={savePreferences} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="channels" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            
            <TabsContent value="channels" className="space-y-4">
              <div className="space-y-6">
                {preferences.map((pref) => (
                  <NotificationCategoryItem
                    key={pref.category}
                    {...pref}
                    onChannelToggle={updatePreference}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="schedule" className="space-y-4">
              <QuietHoursSettings
                settings={quietHours}
                onSettingsChange={setQuietHours}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}