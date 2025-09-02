import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Mail, MessageSquare, Calendar, Shield, Globe, Eye } from "lucide-react"

export default async function StaffSettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Get staff profile
  const { data: staffProfile } = await supabase
    .from("staff_profiles")
    .select(`
      *,
      profiles (full_name, email),
      salons (name)
    `)
    .eq("user_id", user.id)
    .single()

  if (!staffProfile) redirect("/error-403")

  // Get notification preferences
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  const defaultPreferences = {
    email_notifications: true,
    sms_notifications: true,
    appointment_reminders: true,
    schedule_changes: true,
    new_reviews: true,
    performance_updates: false,
    ...preferences
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Channels</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="email-notif">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="email-notif"
                    defaultChecked={defaultPreferences.email_notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="sms-notif">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receive text message alerts
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="sms-notif"
                    defaultChecked={defaultPreferences.sms_notifications}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="appt-remind">Appointment Reminders</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified about upcoming appointments
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="appt-remind"
                    defaultChecked={defaultPreferences.appointment_reminders}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="schedule-change">Schedule Changes</Label>
                      <p className="text-xs text-muted-foreground">
                        Notifications about schedule modifications
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="schedule-change"
                    defaultChecked={defaultPreferences.schedule_changes}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <Label htmlFor="new-reviews">New Reviews</Label>
                      <p className="text-xs text-muted-foreground">
                        Get notified when customers leave reviews
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="new-reviews"
                    defaultChecked={defaultPreferences.new_reviews}
                  />
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your information visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="show-profile">Public Profile</Label>
                    <p className="text-xs text-muted-foreground">
                      Allow customers to view your profile
                    </p>
                  </div>
                </div>
                <Switch id="show-profile" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="show-schedule">Show Availability</Label>
                    <p className="text-xs text-muted-foreground">
                      Display your available time slots to customers
                    </p>
                  </div>
                </div>
                <Switch id="show-schedule" defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label htmlFor="show-reviews">Display Reviews</Label>
                    <p className="text-xs text-muted-foreground">
                      Show customer reviews on your profile
                    </p>
                  </div>
                </div>
                <Switch id="show-reviews" defaultChecked />
              </div>

              <Button>Save Privacy Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>General app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="MM/DD/YYYY">
                  <SelectTrigger id="date-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Save Preferences</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar Sync</CardTitle>
              <CardDescription>Sync with external calendars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Google Calendar</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Outlook Calendar</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Apple Calendar</p>
                  <p className="text-xs text-muted-foreground">Not connected</p>
                </div>
                <Button size="sm" variant="outline">Connect</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support</CardTitle>
              <CardDescription>Get help and support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Globe className="h-4 w-4 mr-2" />
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy Policy
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}