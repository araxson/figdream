import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Switch, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Bell, Mail, MessageSquare, Calendar, Users, DollarSign, AlertCircle } from "lucide-react"

export default async function NotificationSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("*, salons (*)")
    .eq("user_id", user.id)
    .eq("role", "salon_owner")
    .single()

  if (!userRole) redirect("/error-403")

  // Get notification preferences
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const defaultPreferences = {
    email_notifications: true,
    sms_notifications: true,
    push_notifications: false,
    new_appointment: true,
    appointment_cancelled: true,
    appointment_reminder: true,
    new_customer: true,
    staff_absence: true,
    low_inventory: false,
    payment_received: true,
    review_posted: true,
    ...preferences
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-muted-foreground">Configure how you receive notifications</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                </div>
                <Switch 
                  id="email-notifications"
                  defaultChecked={defaultPreferences.email_notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive text message notifications
                    </p>
                  </div>
                </div>
                <Switch 
                  id="sms-notifications"
                  defaultChecked={defaultPreferences.sms_notifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Browser and mobile app notifications
                    </p>
                  </div>
                </div>
                <Switch 
                  id="push-notifications"
                  defaultChecked={defaultPreferences.push_notifications}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appointment Notifications</CardTitle>
              <CardDescription>Notifications related to appointments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="new-appointment">New Appointment</Label>
                    <p className="text-sm text-muted-foreground">
                      When a new appointment is booked
                    </p>
                  </div>
                </div>
                <Switch 
                  id="new-appointment"
                  defaultChecked={defaultPreferences.new_appointment}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="appointment-cancelled">Appointment Cancelled</Label>
                    <p className="text-sm text-muted-foreground">
                      When an appointment is cancelled
                    </p>
                  </div>
                </div>
                <Switch 
                  id="appointment-cancelled"
                  defaultChecked={defaultPreferences.appointment_cancelled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="appointment-reminder">Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Daily summary of upcoming appointments
                    </p>
                  </div>
                </div>
                <Switch 
                  id="appointment-reminder"
                  defaultChecked={defaultPreferences.appointment_reminder}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Notifications</CardTitle>
              <CardDescription>Notifications about your business operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="new-customer">New Customer</Label>
                    <p className="text-sm text-muted-foreground">
                      When a new customer registers
                    </p>
                  </div>
                </div>
                <Switch 
                  id="new-customer"
                  defaultChecked={defaultPreferences.new_customer}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="staff-absence">Staff Absence</Label>
                    <p className="text-sm text-muted-foreground">
                      When staff members request time off
                    </p>
                  </div>
                </div>
                <Switch 
                  id="staff-absence"
                  defaultChecked={defaultPreferences.staff_absence}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="payment-received">Payment Received</Label>
                    <p className="text-sm text-muted-foreground">
                      When payments are processed
                    </p>
                  </div>
                </div>
                <Switch 
                  id="payment-received"
                  defaultChecked={defaultPreferences.payment_received}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button>Save Notification Settings</Button>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Schedule</CardTitle>
              <CardDescription>Set quiet hours for notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Quiet Hours Start</Label>
                <Select defaultValue="22:00">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quiet Hours End</Label>
                <Select defaultValue="08:00">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-muted-foreground">
                Non-urgent notifications will be held during quiet hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Summary</CardTitle>
              <CardDescription>Daily digest options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-summary">Daily Summary</Label>
                <Switch id="daily-summary" defaultChecked />
              </div>

              <div className="space-y-2">
                <Label>Summary Time</Label>
                <Select defaultValue="09:00">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-sm text-muted-foreground">
                Receive a daily summary of your salon's activity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Notifications</CardTitle>
              <CardDescription>Send a test notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Test Email
              </Button>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Test SMS
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Send Test Push
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}