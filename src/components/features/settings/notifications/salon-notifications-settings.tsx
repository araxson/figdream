'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export function NotificationSettings() {
  const notifications = [
    { id: 'new-booking', label: 'New Booking', email: true, sms: true, push: true },
    { id: 'cancel-booking', label: 'Booking Cancellation', email: true, sms: false, push: true },
    { id: 'reminder', label: 'Appointment Reminders', email: true, sms: true, push: false },
    { id: 'review', label: 'New Review', email: true, sms: false, push: true },
    { id: 'staff-request', label: 'Staff Requests', email: true, sms: false, push: false },
    { id: 'low-inventory', label: 'Low Inventory', email: true, sms: false, push: true },
    { id: 'daily-summary', label: 'Daily Summary', email: true, sms: false, push: false },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose how you want to be notified</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium">
            <div>Notification Type</div>
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
        
        <Button className="w-full">Save Preferences</Button>
      </CardContent>
    </Card>
  )
}