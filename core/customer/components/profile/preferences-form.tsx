'use client'

import { useState } from 'react'
import { Save, Bell, Mail, MessageSquare, Clock, Volume2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { CustomerPreferences, PreferencesFormData } from '../../types'

interface PreferencesFormProps {
  preferences: CustomerPreferences
  onSave: (data: PreferencesFormData) => Promise<void>
  isLoading?: boolean
}

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' }
]

const TIME_SLOTS = [
  'Early Morning (6AM - 9AM)',
  'Morning (9AM - 12PM)',
  'Afternoon (12PM - 3PM)',
  'Late Afternoon (3PM - 6PM)',
  'Evening (6PM - 9PM)'
]

export function PreferencesForm({ preferences, onSave, isLoading = false }: PreferencesFormProps) {
  const [formData, setFormData] = useState<PreferencesFormData>({
    language: preferences.language,
    timezone: preferences.timezone,
    communication: { ...preferences.communication },
    notifications: { ...preferences.notifications },
    booking: { ...preferences.booking }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  const updateCommunication = (field: keyof typeof formData.communication, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      communication: {
        ...prev.communication,
        [field]: value
      }
    }))
  }

  const updateNotifications = (field: keyof typeof formData.notifications, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }))
  }

  const updateBooking = (field: keyof typeof formData.booking, value: any) => {
    setFormData(prev => ({
      ...prev,
      booking: {
        ...prev.booking,
        [field]: value
      }
    }))
  }

  const toggleTimeSlot = (timeSlot: string) => {
    const currentSlots = formData.booking.preferredTimeSlots || []
    const updatedSlots = currentSlots.includes(timeSlot)
      ? currentSlots.filter(slot => slot !== timeSlot)
      : [...currentSlots, timeSlot]

    updateBooking('preferredTimeSlots', updatedSlots)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* General Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>General Preferences</CardTitle>
            <CardDescription>
              Set your language and timezone preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Communication Preferences
            </CardTitle>
            <CardDescription>
              Choose how you'd like to receive communications from us
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label>Email Communications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates and information via email
                  </p>
                </div>
                <Switch
                  checked={formData.communication.email}
                  onCheckedChange={(checked) => updateCommunication('email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <Label>SMS Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get text messages for urgent updates and reminders
                  </p>
                </div>
                <Switch
                  checked={formData.communication.sms}
                  onCheckedChange={(checked) => updateCommunication('sms', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <Label>Push Notifications</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications on your devices
                  </p>
                </div>
                <Switch
                  checked={formData.communication.push}
                  onCheckedChange={(checked) => updateCommunication('push', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Customize which notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Booking Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about upcoming appointments
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.bookingReminders}
                  onCheckedChange={(checked) => updateNotifications('bookingReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Promotional Offers</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive special offers and discounts
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.promotions}
                  onCheckedChange={(checked) => updateNotifications('promotions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Review Requests</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified to review your salon experience
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.reviews}
                  onCheckedChange={(checked) => updateNotifications('reviews', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Cancellation Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Be notified if appointments are cancelled or rescheduled
                  </p>
                </div>
                <Switch
                  checked={formData.notifications.cancellations}
                  onCheckedChange={(checked) => updateNotifications('cancellations', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Booking Preferences
            </CardTitle>
            <CardDescription>
              Set your preferred booking settings and notes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Time Slots */}
            <div className="space-y-3">
              <Label>Preferred Time Slots</Label>
              <p className="text-sm text-muted-foreground">
                Select your preferred appointment times (you can choose multiple)
              </p>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS.map((timeSlot) => (
                  <Badge
                    key={timeSlot}
                    variant={
                      formData.booking.preferredTimeSlots?.includes(timeSlot)
                        ? 'default'
                        : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => toggleTimeSlot(timeSlot)}
                  >
                    {timeSlot}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Special Notes */}
            <div className="space-y-2">
              <Label htmlFor="bookingNotes">Special Notes</Label>
              <Textarea
                id="bookingNotes"
                placeholder="Any special requests, allergies, or preferences you'd like salons to know about..."
                value={formData.booking.notes || ''}
                onChange={(e) => updateBooking('notes', e.target.value)}
                className="min-h-20"
              />
              <p className="text-sm text-muted-foreground">
                These notes will be visible to salons when you book appointments
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </form>
  )
}