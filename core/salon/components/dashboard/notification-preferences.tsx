'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { updateSalonSettingsAction } from '../actions/salons-actions'

interface NotificationPreferencesProps {
  salonId: string
  initialData?: any
  onSaving?: (saving: boolean) => void
}

const notificationSettingsSchema = z.object({
  send_booking_confirmations: z.boolean(),
  send_reminders: z.boolean(),
  reminder_hours_before: z.number().min(1).max(72),
  send_follow_ups: z.boolean(),
  send_marketing: z.boolean()
})

export function NotificationPreferences({ salonId, initialData, onSaving }: NotificationPreferencesProps) {
  const form = useForm({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      send_booking_confirmations: initialData?.send_booking_confirmations ?? true,
      send_reminders: initialData?.send_reminders ?? true,
      reminder_hours_before: initialData?.reminder_hours_before ?? 24,
      send_follow_ups: initialData?.send_follow_ups ?? false,
      send_marketing: initialData?.send_marketing ?? false
    }
  })

  const sendReminders = form.watch('send_reminders')

  const handleSubmit = async (data: z.infer<typeof notificationSettingsSchema>) => {
    try {
      onSaving?.(true)
      const response = await updateSalonSettingsAction(salonId, {
        notification_settings: data
      })

      if (response.success) {
        toast.success('Notification settings updated successfully')
      } else {
        toast.error(response.error || 'Failed to update notification settings')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      onSaving?.(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Configure customer communication settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="send_booking_confirmations"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Booking Confirmations</FormLabel>
                      <FormDescription>Send confirmation after booking</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="send_reminders"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Appointment Reminders</FormLabel>
                      <FormDescription>Send reminder before appointment</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {sendReminders && (
                <FormField
                  control={form.control}
                  name="reminder_hours_before"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reminder Timing</FormLabel>
                      <FormControl>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              { value: 1, label: '1 hour before' },
                              { value: 2, label: '2 hours before' },
                              { value: 4, label: '4 hours before' },
                              { value: 12, label: '12 hours before' },
                              { value: 24, label: '1 day before' },
                              { value: 48, label: '2 days before' },
                              { value: 72, label: '3 days before' }
                            ].map(option => (
                              <SelectItem key={option.value} value={option.value.toString()}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>When to send appointment reminders</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="send_follow_ups"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Follow-up Messages</FormLabel>
                      <FormDescription>Send thank you and feedback requests</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="send_marketing"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Marketing Communications</FormLabel>
                      <FormDescription>Send promotional offers and updates</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Notification Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}