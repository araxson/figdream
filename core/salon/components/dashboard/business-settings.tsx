'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Clock,
  Calendar,
  CreditCard,
  Bell,
  Settings,
  Info
} from 'lucide-react'
import { BusinessHoursSettings } from './business-hours-settings'
import { BookingConfiguration } from './booking-configuration'
import { PaymentConfiguration } from './payment-configuration'
import { NotificationPreferences } from './notification-preferences'

interface BusinessSettingsProps {
  salonId: string
  initialSettings?: any
}

export function BusinessSettings({ salonId, initialSettings = {} }: BusinessSettingsProps) {
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('hours')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Business Settings
          </CardTitle>
          <CardDescription>
            Configure your salon's operating preferences and policies
          </CardDescription>
        </CardHeader>
      </Card>

      {saving && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>Saving your settings...</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Hours
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Booking
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <BusinessHoursSettings
            salonId={salonId}
            initialData={initialSettings.business_hours}
            onSaving={setSaving}
          />
        </TabsContent>

        <TabsContent value="booking">
          <BookingConfiguration
            salonId={salonId}
            initialData={initialSettings.booking_settings}
            onSaving={setSaving}
          />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentConfiguration
            salonId={salonId}
            initialData={initialSettings.payment_settings}
            onSaving={setSaving}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPreferences
            salonId={salonId}
            initialData={initialSettings.notification_settings}
            onSaving={setSaving}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}