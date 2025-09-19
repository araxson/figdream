'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function CustomerPreferences() {
  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive updates about your appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch id="email-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sms-notifications">SMS Notifications</Label>
            <Switch id="sms-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="appointment-reminders">Appointment Reminders</Label>
            <Switch id="appointment-reminders" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}