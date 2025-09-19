'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface NotificationsManagementProps {
  role?: string
}

export function NotificationsManagement({ role }: NotificationsManagementProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Manage your notification settings and preferences.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Notification management system coming soon.
        </p>
      </CardContent>
    </Card>
  )
}