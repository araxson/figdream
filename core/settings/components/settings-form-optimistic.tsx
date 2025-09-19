'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useOptimisticForm } from '@/core/shared/hooks/optimistic'
import { ErrorRecovery } from '@/core/shared/components/error-recovery'
import { ContentPlaceholder } from '@/core/shared/components/optimized-loading'
import { Save, Loader2, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

// Validation schema
const SalonSettingsSchema = z.object({
  name: z.string().min(1, 'Salon name is required').max(100),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone number required'),
  address: z.string().min(1, 'Address is required'),
  description: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  booking_enabled: z.boolean(),
  online_payments: z.boolean(),
  auto_confirm: z.boolean(),
  reminder_hours: z.number().min(1).max(48),
  cancellation_hours: z.number().min(1).max(72),
  tax_rate: z.number().min(0).max(100)
})

type SalonSettings = z.infer<typeof SalonSettingsSchema>

interface SettingsFormOptimisticProps {
  initialSettings: SalonSettings
  salonId: string
}

export function SettingsFormOptimistic({
  initialSettings,
  salonId
}: SettingsFormOptimisticProps) {
  const {
    data,
    errors,
    isSubmitting,
    isDirty,
    submitCount,
    actions
  } = useOptimisticForm(initialSettings, SalonSettingsSchema, {
    onSuccess: (data) => {
      // Settings saved successfully
    },
    onError: (error) => {
      console.error('Settings save failed:', error)
    },
    resetOnSuccess: false,
    showToast: true,
    successMessage: 'Settings saved successfully',
    errorMessage: 'Failed to save settings'
  })

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty) return

    const cleanup = actions.autoSave(
      async (dirtyFields) => {
        // Server action simulation
        const response = await fetch(`/api/salons/${salonId}/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dirtyFields)
        })

        if (!response.ok) throw new Error('Auto-save failed')
        return response.json()
      },
      2000 // 2 second debounce
    )

    return cleanup
  }, [isDirty, actions, salonId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await actions.submit(async (formData) => {
      // Server action simulation
      const response = await fetch(`/api/salons/${salonId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to save settings')
      return response.json()
    })
  }

  const handleFieldBlur = async (fieldName: keyof SalonSettings) => {
    // Submit individual field on blur
    await actions.submitField(
      fieldName,
      data[fieldName],
      async (name, value) => {
        // Server action simulation
        const response = await fetch(`/api/salons/${salonId}/settings/${name}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [name]: value })
        })

        if (!response.ok) throw new Error(`Failed to update ${name}`)
        return response.json()
      }
    )
  }

  return (
    <div className="space-y-6">
      <ErrorRecovery
        error={errors.general ? new Error(errors.general[0]) : null}
        onRetry={() => actions.submit(async () => initialSettings)}
        showOfflineIndicator
      />

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Basic information about your salon
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Salon Name</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => actions.updateField('name', e.target.value)}
                    onBlur={() => handleFieldBlur('name')}
                    disabled={isSubmitting}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => actions.updateField('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email')}
                    disabled={isSubmitting}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => actions.updateField('phone', e.target.value)}
                    onBlur={() => handleFieldBlur('phone')}
                    disabled={isSubmitting}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={data.address}
                    onChange={(e) => actions.updateField('address', e.target.value)}
                    onBlur={() => handleFieldBlur('address')}
                    disabled={isSubmitting}
                    className={errors.address ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-500">{errors.address[0]}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(e) => actions.updateField('description', e.target.value)}
                    onBlur={() => handleFieldBlur('description')}
                    disabled={isSubmitting}
                    placeholder="Brief description of your salon..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={data.website || ''}
                    onChange={(e) => actions.updateField('website', e.target.value)}
                    onBlur={() => handleFieldBlur('website')}
                    disabled={isSubmitting}
                    placeholder="https://..."
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-sm text-red-500">{errors.website[0]}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Booking Settings</CardTitle>
                <CardDescription>
                  Configure how customers book appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="booking_enabled">Online Booking</Label>
                    <p className="text-sm text-gray-500">
                      Allow customers to book appointments online
                    </p>
                  </div>
                  <Switch
                    id="booking_enabled"
                    checked={data.booking_enabled}
                    onCheckedChange={(checked) => {
                      actions.updateField('booking_enabled', checked)
                      handleFieldBlur('booking_enabled')
                    }}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto_confirm">Auto-Confirm</Label>
                    <p className="text-sm text-gray-500">
                      Automatically confirm new bookings
                    </p>
                  </div>
                  <Switch
                    id="auto_confirm"
                    checked={data.auto_confirm}
                    onCheckedChange={(checked) => {
                      actions.updateField('auto_confirm', checked)
                      handleFieldBlur('auto_confirm')
                    }}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder_hours">Reminder Time</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="reminder_hours"
                      type="number"
                      value={data.reminder_hours}
                      onChange={(e) => actions.updateField('reminder_hours', parseInt(e.target.value))}
                      onBlur={() => handleFieldBlur('reminder_hours')}
                      disabled={isSubmitting}
                      min={1}
                      max={48}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">hours before appointment</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation_hours">Cancellation Window</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="cancellation_hours"
                      type="number"
                      value={data.cancellation_hours}
                      onChange={(e) => actions.updateField('cancellation_hours', parseInt(e.target.value))}
                      onBlur={() => handleFieldBlur('cancellation_hours')}
                      disabled={isSubmitting}
                      min={1}
                      max={72}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">hours before appointment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial Settings</CardTitle>
                <CardDescription>
                  Payment and tax configuration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="online_payments">Online Payments</Label>
                    <p className="text-sm text-gray-500">
                      Accept online payments for bookings
                    </p>
                  </div>
                  <Switch
                    id="online_payments"
                    checked={data.online_payments}
                    onCheckedChange={(checked) => {
                      actions.updateField('online_payments', checked)
                      handleFieldBlur('online_payments')
                    }}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="tax_rate"
                      type="number"
                      value={data.tax_rate}
                      onChange={(e) => actions.updateField('tax_rate', parseFloat(e.target.value))}
                      onBlur={() => handleFieldBlur('tax_rate')}
                      disabled={isSubmitting}
                      min={0}
                      max={100}
                      step={0.01}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Save Button */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {isDirty && (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <span>You have unsaved changes</span>
                </>
              )}
              {!isDirty && submitCount > 0 && (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span>All changes saved</span>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => actions.reset()}
                disabled={!isDirty || isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={!isDirty || isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Tabs>
    </div>
  )
}