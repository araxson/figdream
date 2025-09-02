import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label, Switch, Tabs, TabsContent, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Settings, Shield, Bell, Database, Globe } from "lucide-react"

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .single()

  if (!userRole) redirect("/error-403")

  // Get system settings (would come from database)
  const systemSettings = {
    general: {
      platformName: "FigDream",
      supportEmail: "support@figdream.com",
      defaultTimezone: "America/New_York",
      maintenanceMode: false,
    },
    security: {
      requireMfa: false,
      passwordMinLength: 8,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      ipWhitelist: false,
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: true,
      pushEnabled: false,
      webhooksEnabled: true,
    },
    database: {
      backupFrequency: "daily",
      retentionDays: 30,
      autoVacuum: true,
      connectionPool: 100,
    },
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input 
                  id="platform-name" 
                  defaultValue={systemSettings.general.platformName}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input 
                  id="support-email" 
                  type="email"
                  defaultValue={systemSettings.general.supportEmail}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select defaultValue={systemSettings.general.defaultTimezone}>
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

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance">Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable platform access for maintenance
                  </p>
                </div>
                <Switch 
                  id="maintenance"
                  defaultChecked={systemSettings.general.maintenanceMode}
                />
              </div>

              <Button>Save General Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Platform security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="mfa">Require Multi-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Force all users to enable MFA
                  </p>
                </div>
                <Switch 
                  id="mfa"
                  defaultChecked={systemSettings.security.requireMfa}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password-length">Minimum Password Length</Label>
                <Input 
                  id="password-length" 
                  type="number"
                  defaultValue={systemSettings.security.passwordMinLength}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input 
                  id="session-timeout" 
                  type="number"
                  defaultValue={systemSettings.security.sessionTimeout}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-attempts">Max Login Attempts</Label>
                <Input 
                  id="max-attempts" 
                  type="number"
                  defaultValue={systemSettings.security.maxLoginAttempts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ip-whitelist">IP Whitelist</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict access to specific IP addresses
                  </p>
                </div>
                <Switch 
                  id="ip-whitelist"
                  defaultChecked={systemSettings.security.ipWhitelist}
                />
              </div>

              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-enabled">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via email
                  </p>
                </div>
                <Switch 
                  id="email-enabled"
                  defaultChecked={systemSettings.notifications.emailEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-enabled">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send notifications via SMS
                  </p>
                </div>
                <Switch 
                  id="sms-enabled"
                  defaultChecked={systemSettings.notifications.smsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-enabled">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send push notifications to mobile apps
                  </p>
                </div>
                <Switch 
                  id="push-enabled"
                  defaultChecked={systemSettings.notifications.pushEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="webhooks-enabled">Webhooks</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable webhook integrations
                  </p>
                </div>
                <Switch 
                  id="webhooks-enabled"
                  defaultChecked={systemSettings.notifications.webhooksEnabled}
                />
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Settings</CardTitle>
              <CardDescription>Database configuration and maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select defaultValue={systemSettings.database.backupFrequency}>
                  <SelectTrigger id="backup-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention-days">Backup Retention (days)</Label>
                <Input 
                  id="retention-days" 
                  type="number"
                  defaultValue={systemSettings.database.retentionDays}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-vacuum">Auto Vacuum</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically optimize database performance
                  </p>
                </div>
                <Switch 
                  id="auto-vacuum"
                  defaultChecked={systemSettings.database.autoVacuum}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="connection-pool">Connection Pool Size</Label>
                <Input 
                  id="connection-pool" 
                  type="number"
                  defaultValue={systemSettings.database.connectionPool}
                />
              </div>

              <Button>Save Database Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  These actions can have significant impact on the platform
                </p>
                <div className="space-y-2">
                  <Button variant="destructive">Clear All Caches</Button>
                  <Button variant="destructive">Reset Platform Settings</Button>
                  <Button variant="destructive">Purge Old Data</Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">System Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Version</span>
                    <span className="font-mono">v2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Database Version</span>
                    <span className="font-mono">PostgreSQL 15.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Node Version</span>
                    <span className="font-mono">v20.11.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next.js Version</span>
                    <span className="font-mono">15.0.0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}