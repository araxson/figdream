'use client'

import { Check, User, Phone, Bell, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ReviewStepProps {
  formData: {
    email: string
    display_name: string
    first_name: string
    last_name: string
    avatar_url?: string
    phone?: string
    date_of_birth?: string
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
    email_consent: boolean
    sms_consent: boolean
    marketing_consent: boolean
    appointment_reminders: boolean
    promotions: boolean
  }
}

export function ReviewStep({ formData }: ReviewStepProps) {
  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'male': return 'Male'
      case 'female': return 'Female'
      case 'other': return 'Other'
      case 'prefer_not_to_say': return 'Prefer not to say'
      default: return 'Not specified'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Review & Create</h3>
        <p className="text-sm text-muted-foreground">
          Please review the customer information before creating the profile
        </p>
      </div>

      {/* Customer Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" />
            Customer Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.avatar_url} />
              <AvatarFallback>
                {formData.first_name.charAt(0)}{formData.last_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold">
                {formData.first_name} {formData.last_name}
              </h4>
              {formData.display_name && (
                <p className="text-sm text-muted-foreground">
                  Display name: {formData.display_name}
                </p>
              )}
              <p className="text-sm">{formData.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Phone:</span>
              <p className="text-muted-foreground">
                {formData.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <span className="font-medium">Date of Birth:</span>
              <p className="text-muted-foreground">
                {formatDate(formData.date_of_birth)}
              </p>
            </div>
          </div>
          <div>
            <span className="font-medium text-sm">Gender:</span>
            <p className="text-sm text-muted-foreground">
              {getGenderLabel(formData.gender)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Communication Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Communication Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-sm">Communication Channels:</span>
              <div className="flex gap-2 mt-1">
                {formData.email_consent && (
                  <Badge variant="secondary">Email</Badge>
                )}
                {formData.sms_consent && (
                  <Badge variant="secondary">SMS</Badge>
                )}
                {!formData.email_consent && !formData.sms_consent && (
                  <Badge variant="outline">No communication consent</Badge>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <span className="font-medium text-sm">Marketing Preferences:</span>
              <div className="flex gap-2 mt-1">
                {formData.marketing_consent && (
                  <Badge variant="secondary">Marketing</Badge>
                )}
                {formData.promotions && (
                  <Badge variant="secondary">Promotions</Badge>
                )}
                {formData.appointment_reminders && (
                  <Badge variant="secondary">Reminders</Badge>
                )}
                {!formData.marketing_consent && !formData.promotions && !formData.appointment_reminders && (
                  <Badge variant="outline">No marketing consent</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          By creating this customer profile, you confirm that you have the customer's consent
          to store their information and communicate with them according to their preferences.
          This profile will be created in compliance with data protection regulations.
        </AlertDescription>
      </Alert>
    </div>
  )
}