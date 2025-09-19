'use client'

import { Bell, Mail, MessageSquare, Gift, Calendar } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PreferencesStepProps {
  formData: {
    email_consent: boolean
    sms_consent: boolean
    marketing_consent: boolean
    appointment_reminders: boolean
    promotions: boolean
  }
  onUpdateField: (field: string, value: boolean) => void
}

export function PreferencesStep({
  formData,
  onUpdateField
}: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Communication Preferences</h3>
        <p className="text-sm text-muted-foreground">
          How would you like us to communicate with this customer?
        </p>
      </div>

      <div className="space-y-4">
        {/* Communication Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Communication Channels
            </CardTitle>
            <CardDescription>
              Choose how we can contact this customer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">Email Communications</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow sending emails for bookings and updates
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.email_consent}
                onCheckedChange={(checked) => onUpdateField('email_consent', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="text-sm font-medium">SMS Messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Send appointment reminders and updates via SMS
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.sms_consent}
                onCheckedChange={(checked) => onUpdateField('sms_consent', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Marketing & Promotions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Marketing & Promotions
            </CardTitle>
            <CardDescription>
              Marketing communications and promotional offers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Marketing Communications</Label>
                <p className="text-xs text-muted-foreground">
                  Newsletter, service updates, and salon news
                </p>
              </div>
              <Switch
                checked={formData.marketing_consent}
                onCheckedChange={(checked) => onUpdateField('marketing_consent', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Promotional Offers</Label>
                <p className="text-xs text-muted-foreground">
                  Special deals, discounts, and limited-time offers
                </p>
              </div>
              <Switch
                checked={formData.promotions}
                onCheckedChange={(checked) => onUpdateField('promotions', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Service Reminders
            </CardTitle>
            <CardDescription>
              Automated reminders for appointments and follow-ups
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Appointment Reminders</Label>
                <p className="text-xs text-muted-foreground">
                  24-hour advance notice for upcoming appointments
                </p>
              </div>
              <Switch
                checked={formData.appointment_reminders}
                onCheckedChange={(checked) => onUpdateField('appointment_reminders', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-xs text-muted-foreground text-center p-4 bg-muted rounded-lg">
        These preferences can be updated at any time by the customer through their profile settings.
        We respect all privacy choices and comply with applicable regulations.
      </div>
    </div>
  )
}