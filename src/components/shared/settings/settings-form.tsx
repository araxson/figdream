"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Mail, MessageSquare, Shield, Globe, Eye, Trash2, Settings, Moon, Sun, Monitor } from "lucide-react"
import { hasPermission } from "@/lib/permissions"
import type { Database } from "@/types/database.types"

type UserRole = Database["public"]["Enums"]["user_role_type"]

interface NotificationSettings {
  email_reminders: boolean
  sms_reminders: boolean
  marketing_emails: boolean
  appointment_reminders_hours: number
  push_notifications?: boolean
  newsletter?: boolean
}

interface PrivacySettings {
  allow_online_booking?: boolean
  show_in_reviews?: boolean
  profile_visibility?: "public" | "private" | "customers_only"
  data_sharing?: boolean
}

interface GeneralSettings {
  language: string
  timezone: string
  date_format?: string
  time_format?: "12h" | "24h"
  theme?: "light" | "dark" | "system"
  currency?: string
}

interface SettingsFormProps {
  userRole: UserRole
  notifications?: NotificationSettings
  privacy?: PrivacySettings
  general?: GeneralSettings
  onSaveNotifications?: (settings: NotificationSettings) => Promise<void>
  onSavePrivacy?: (settings: PrivacySettings) => Promise<void>
  onSaveGeneral?: (settings: GeneralSettings) => Promise<void>
  onDeleteAccount?: () => Promise<void>
  customSettings?: React.ReactNode
}

export function SettingsForm({
  userRole,
  notifications = {
    email_reminders: true,
    sms_reminders: true,
    marketing_emails: false,
    appointment_reminders_hours: 24,
    push_notifications: true,
    newsletter: false
  },
  privacy = {
    allow_online_booking: true,
    show_in_reviews: true,
    profile_visibility: "public",
    data_sharing: false
  },
  general = {
    language: "en",
    timezone: "America/New_York",
    date_format: "MM/DD/YYYY",
    time_format: "12h",
    theme: "system",
    currency: "USD"
  },
  onSaveNotifications,
  onSavePrivacy,
  onSaveGeneral,
  onDeleteAccount,
  customSettings
}: SettingsFormProps) {
  const [notificationForm, setNotificationForm] = useState(notifications)
  const [privacyForm, setPrivacyForm] = useState(privacy)
  const [generalForm, setGeneralForm] = useState(general)
  const [isLoading, setIsLoading] = useState(false)

  const canEditSettings = hasPermission(userRole, "settings.edit_own") || hasPermission(userRole, "settings.edit_all")

  const handleSaveNotifications = async () => {
    if (onSaveNotifications) {
      setIsLoading(true)
      await onSaveNotifications(notificationForm)
      setIsLoading(false)
    }
  }

  const handleSavePrivacy = async () => {
    if (onSavePrivacy) {
      setIsLoading(true)
      await onSavePrivacy(privacyForm)
      setIsLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    if (onSaveGeneral) {
      setIsLoading(true)
      await onSaveGeneral(generalForm)
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          {customSettings && <TabsTrigger value="custom">Advanced</TabsTrigger>}
          <TabsTrigger value="danger">Security</TabsTrigger>
        </TabsList>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="email-reminders">Email Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive appointment reminders via email
                    </p>
                  </div>
                </div>
                <Switch 
                  id="email-reminders"
                  checked={notificationForm.email_reminders}
                  onCheckedChange={(checked) => setNotificationForm({...notificationForm, email_reminders: checked})}
                  disabled={!canEditSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="sms-reminders">SMS Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive appointment reminders via text
                    </p>
                  </div>
                </div>
                <Switch 
                  id="sms-reminders"
                  checked={notificationForm.sms_reminders}
                  onCheckedChange={(checked) => setNotificationForm({...notificationForm, sms_reminders: checked})}
                  disabled={!canEditSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="push">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive in-app notifications
                    </p>
                  </div>
                </div>
                <Switch 
                  id="push"
                  checked={notificationForm.push_notifications}
                  onCheckedChange={(checked) => setNotificationForm({...notificationForm, push_notifications: checked})}
                  disabled={!canEditSettings}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="marketing">Marketing Communications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive special offers and promotions
                    </p>
                  </div>
                </div>
                <Switch 
                  id="marketing"
                  checked={notificationForm.marketing_emails}
                  onCheckedChange={(checked) => setNotificationForm({...notificationForm, marketing_emails: checked})}
                  disabled={!canEditSettings}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminder-time">Reminder Timing</Label>
                <Select 
                  value={notificationForm.appointment_reminders_hours.toString()}
                  onValueChange={(value) => setNotificationForm({...notificationForm, appointment_reminders_hours: parseInt(value)})}
                  disabled={!canEditSettings}
                >
                  <SelectTrigger id="reminder-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 hours before</SelectItem>
                    <SelectItem value="6">6 hours before</SelectItem>
                    <SelectItem value="12">12 hours before</SelectItem>
                    <SelectItem value="24">24 hours before</SelectItem>
                    <SelectItem value="48">48 hours before</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSaveNotifications} disabled={!canEditSettings || isLoading}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your information visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {privacyForm.allow_online_booking !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="online-booking">Online Booking</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow customers to book appointments online
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="online-booking"
                    checked={privacyForm.allow_online_booking}
                    onCheckedChange={(checked) => setPrivacyForm({...privacyForm, allow_online_booking: checked})}
                    disabled={!canEditSettings}
                  />
                </div>
              )}

              {privacyForm.show_in_reviews !== undefined && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label htmlFor="show-reviews">Show in Reviews</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your name in reviews
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="show-reviews"
                    checked={privacyForm.show_in_reviews}
                    onCheckedChange={(checked) => setPrivacyForm({...privacyForm, show_in_reviews: checked})}
                    disabled={!canEditSettings}
                  />
                </div>
              )}

              {privacyForm.profile_visibility !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="visibility">Profile Visibility</Label>
                  <Select 
                    value={privacyForm.profile_visibility}
                    onValueChange={(value: "public" | "private" | "customers_only") => setPrivacyForm({...privacyForm, profile_visibility: value})}
                    disabled={!canEditSettings}
                  >
                    <SelectTrigger id="visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="customers_only">Customers Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label htmlFor="data-sharing">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymous usage data for improvements
                    </p>
                  </div>
                </div>
                <Switch 
                  id="data-sharing"
                  checked={privacyForm.data_sharing}
                  onCheckedChange={(checked) => setPrivacyForm({...privacyForm, data_sharing: checked})}
                  disabled={!canEditSettings}
                />
              </div>

              <Button onClick={handleSavePrivacy} disabled={!canEditSettings || isLoading}>
                Save Privacy Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Preferences</CardTitle>
              <CardDescription>Customize your app experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={generalForm.language}
                    onValueChange={(value) => setGeneralForm({...generalForm, language: value})}
                    disabled={!canEditSettings}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={generalForm.timezone}
                    onValueChange={(value) => setGeneralForm({...generalForm, timezone: value})}
                    disabled={!canEditSettings}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {generalForm.date_format !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select 
                      value={generalForm.date_format}
                      onValueChange={(value) => setGeneralForm({...generalForm, date_format: value})}
                      disabled={!canEditSettings}
                    >
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
                )}

                {generalForm.time_format !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select 
                      value={generalForm.time_format}
                      onValueChange={(value: "12h" | "24h") => setGeneralForm({...generalForm, time_format: value})}
                      disabled={!canEditSettings}
                    >
                      <SelectTrigger id="time-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12 Hour</SelectItem>
                        <SelectItem value="24h">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {generalForm.currency !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={generalForm.currency}
                      onValueChange={(value) => setGeneralForm({...generalForm, currency: value})}
                      disabled={!canEditSettings}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD ($)</SelectItem>
                        <SelectItem value="AUD">AUD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {generalForm.theme !== undefined && (
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={generalForm.theme === "light" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGeneralForm({...generalForm, theme: "light"})}
                      disabled={!canEditSettings}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={generalForm.theme === "dark" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGeneralForm({...generalForm, theme: "dark"})}
                      disabled={!canEditSettings}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                    <Button
                      variant={generalForm.theme === "system" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGeneralForm({...generalForm, theme: "system"})}
                      disabled={!canEditSettings}
                    >
                      <Monitor className="h-4 w-4 mr-2" />
                      System
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={handleSaveGeneral} disabled={!canEditSettings || isLoading}>
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Settings Tab */}
        {customSettings && (
          <TabsContent value="custom">
            {customSettings}
          </TabsContent>
        )}

        {/* Security/Danger Tab */}
        <TabsContent value="danger">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="h-4 w-4 mr-2" />
                  View Login History
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage API Keys
                </Button>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Permanent account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {onDeleteAccount && (
                  <>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={onDeleteAccount}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      This action cannot be undone. All your data will be permanently deleted.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}