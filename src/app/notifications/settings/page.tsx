import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationSettingsForm } from './components/notification-settings-form'
import { getNotificationSettings, NOTIFICATION_CATEGORIES } from '@/lib/data-access/notification-settings'
import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'

export default async function NotificationSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const settings = await getNotificationSettings(user.id)

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground">
          Manage how you receive notifications
        </p>
      </div>

      {/* Channel Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.email_enabled ? 'Enabled' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground">
              Receive notifications via email
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.sms_enabled ? 'Enabled' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground">
              Receive text message notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {settings.push_enabled ? 'Enabled' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground">
              Receive push notifications
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Settings Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <CardDescription>
            Choose which notifications you want to receive and how
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
            <NotificationSettingsForm 
              userId={user.id}
              currentSettings={settings}
              categories={NOTIFICATION_CATEGORIES}
            />
          </Suspense>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quiet Hours</CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Quiet hours feature coming soon. You'll be able to set specific times when notifications are paused.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>
            View your recent notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View your notification history in the <a href="/notifications" className="text-primary hover:underline">Notifications Center</a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}