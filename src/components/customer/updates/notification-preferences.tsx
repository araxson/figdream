"use client"
import { useState } from "react"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  Gift,
  Star,
  TrendingUp,
  Mail,
  MessageSquare,
  Smartphone,
} from "lucide-react"
import type { Database } from "@/types/database.types"
type NotificationSettings = Database["public"]["Tables"]["notification_settings"]["Row"]
interface NotificationPreferencesProps {
  userId: string
  settings?: NotificationSettings
}
export function NotificationPreferences({ userId, settings }: NotificationPreferencesProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [preferences, setPreferences] = useState({
    // Notification Types
    appointment_reminders: settings?.appointment_reminders ?? true,
    appointment_confirmations: settings?.appointment_confirmations ?? true,
    appointment_cancellations: settings?.appointment_cancellations ?? true,
    promotions: settings?.promotions ?? true,
    review_requests: settings?.review_requests ?? true,
    loyalty_updates: settings?.loyalty_updates ?? true,
    // Delivery Methods
    email_notifications: settings?.email_notifications ?? true,
    sms_notifications: settings?.sms_notifications ?? false,
    push_notifications: settings?.push_notifications ?? true,
    // Timing Preferences
    reminder_hours: settings?.reminder_hours ?? 24,
    quiet_hours_start: settings?.quiet_hours_start ?? "21:00",
    quiet_hours_end: settings?.quiet_hours_end ?? "09:00",
  })
  const handleToggle = (key: string) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }
  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notification-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          ...preferences,
        }),
      })
      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (_error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="appointment_reminders">Appointment Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming appointments
                </p>
              </div>
            </div>
            <Switch
              id="appointment_reminders"
              checked={preferences.appointment_reminders}
              onCheckedChange={() => handleToggle("appointment_reminders")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="appointment_confirmations">Appointment Confirmations</Label>
                <p className="text-sm text-muted-foreground">
                  Receive confirmations when appointments are booked
                </p>
              </div>
            </div>
            <Switch
              id="appointment_confirmations"
              checked={preferences.appointment_confirmations}
              onCheckedChange={() => handleToggle("appointment_confirmations")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="appointment_cancellations">Cancellation Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Be notified if appointments are cancelled
                </p>
              </div>
            </div>
            <Switch
              id="appointment_cancellations"
              checked={preferences.appointment_cancellations}
              onCheckedChange={() => handleToggle("appointment_cancellations")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="promotions">Promotions & Offers</Label>
                <p className="text-sm text-muted-foreground">
                  Receive special offers and promotional deals
                </p>
              </div>
            </div>
            <Switch
              id="promotions"
              checked={preferences.promotions}
              onCheckedChange={() => handleToggle("promotions")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="review_requests">Review Requests</Label>
                <p className="text-sm text-muted-foreground">
                  Get asked to review services after appointments
                </p>
              </div>
            </div>
            <Switch
              id="review_requests"
              checked={preferences.review_requests}
              onCheckedChange={() => handleToggle("review_requests")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="loyalty_updates">Loyalty Program Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Updates about points, rewards, and loyalty status
                </p>
              </div>
            </div>
            <Switch
              id="loyalty_updates"
              checked={preferences.loyalty_updates}
              onCheckedChange={() => handleToggle("loyalty_updates")}
            />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Methods</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              id="email_notifications"
              checked={preferences.email_notifications}
              onCheckedChange={() => handleToggle("email_notifications")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="sms_notifications">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text messages for important updates
                </p>
              </div>
            </div>
            <Switch
              id="sms_notifications"
              checked={preferences.sms_notifications}
              onCheckedChange={() => handleToggle("sms_notifications")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="push_notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive in-app push notifications
                </p>
              </div>
            </div>
            <Switch
              id="push_notifications"
              checked={preferences.push_notifications}
              onCheckedChange={() => handleToggle("push_notifications")}
            />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  )
}