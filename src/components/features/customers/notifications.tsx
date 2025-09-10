'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function NotificationPreferences() {
  const notifications = [
    { id: 'booking-confirm', label: 'Booking Confirmations', email: true, sms: true, push: true },
    { id: 'reminder', label: 'Appointment Reminders', email: true, sms: true, push: false },
    { id: 'promotions', label: 'Promotions & Offers', email: true, sms: false, push: false },
    { id: 'birthday', label: 'Birthday Specials', email: true, sms: true, push: true },
    { id: 'loyalty', label: 'Loyalty Rewards', email: true, sms: false, push: true },
    { id: 'newsletter', label: 'Newsletter', email: true, sms: false, push: false },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to receive updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium mb-4">
            <div>Notification</div>
            <div className="text-center">Email</div>
            <div className="text-center">SMS</div>
            <div className="text-center">Push</div>
          </div>
          
          {notifications.map((notification) => (
            <div key={notification.id} className="grid grid-cols-4 gap-4 items-center">
              <Label className="text-sm">{notification.label}</Label>
              <div className="flex justify-center">
                <Switch defaultChecked={notification.email} />
              </div>
              <div className="flex justify-center">
                <Switch defaultChecked={notification.sms} />
              </div>
              <div className="flex justify-center">
                <Switch defaultChecked={notification.push} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}