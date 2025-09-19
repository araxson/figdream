'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { updateSalonSettingsAction } from '../actions/salons-actions'

interface BookingConfigurationProps {
  salonId: string
  initialData?: any
  onSaving?: (saving: boolean) => void
}

const bookingSettingsSchema = z.object({
  enable_online_booking: z.boolean(),
  require_deposit: z.boolean(),
  deposit_percentage: z.number().min(0).max(100).optional(),
  auto_confirm_bookings: z.boolean(),
  allow_walk_ins: z.boolean(),
  max_advance_booking_days: z.number().min(1).max(365),
  min_advance_booking_hours: z.number().min(0),
  buffer_time_minutes: z.number().min(0).max(60),
  cancellation_policy_hours: z.number().min(0).max(72)
})

export function BookingConfiguration({ salonId, initialData, onSaving }: BookingConfigurationProps) {
  const form = useForm({
    resolver: zodResolver(bookingSettingsSchema),
    defaultValues: {
      enable_online_booking: initialData?.enable_online_booking ?? true,
      require_deposit: initialData?.require_deposit ?? false,
      deposit_percentage: initialData?.deposit_percentage ?? 20,
      auto_confirm_bookings: initialData?.auto_confirm_bookings ?? false,
      allow_walk_ins: initialData?.allow_walk_ins ?? true,
      max_advance_booking_days: initialData?.max_advance_booking_days ?? 90,
      min_advance_booking_hours: initialData?.min_advance_booking_hours ?? 24,
      buffer_time_minutes: initialData?.buffer_time_minutes ?? 15,
      cancellation_policy_hours: initialData?.cancellation_policy_hours ?? 24
    }
  })

  const requireDeposit = form.watch('require_deposit')

  const handleSubmit = async (data: z.infer<typeof bookingSettingsSchema>) => {
    try {
      onSaving?.(true)
      const response = await updateSalonSettingsAction(salonId, {
        booking_settings: data
      })

      if (response.success) {
        toast.success('Booking settings updated successfully')
      } else {
        toast.error(response.error || 'Failed to update booking settings')
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
          <Calendar className="h-5 w-5" />
          Booking Configuration
        </CardTitle>
        <CardDescription>
          Configure how customers can book appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="enable_online_booking"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Online Booking</FormLabel>
                      <FormDescription>Allow customers to book appointments online</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_confirm_bookings"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-Confirm Bookings</FormLabel>
                      <FormDescription>Automatically confirm new bookings</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_walk_ins"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Walk-In Appointments</FormLabel>
                      <FormDescription>Accept walk-in customers without booking</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="max_advance_booking_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Advance Booking</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[30, 60, 90, 180, 365].map(days => (
                            <SelectItem key={days} value={days.toString()}>{days} days</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>How far in advance can customers book</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="min_advance_booking_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Notice Period</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 2, 4, 12, 24, 48, 72].map(hours => (
                            <SelectItem key={hours} value={hours.toString()}>{hours} hours</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Minimum time before appointment</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="buffer_time_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buffer Time</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 5, 10, 15, 30, 45, 60].map(minutes => (
                            <SelectItem key={minutes} value={minutes.toString()}>{minutes} minutes</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Time between appointments</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cancellation_policy_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cancellation Policy</FormLabel>
                    <FormControl>
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value?.toString()}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 2, 4, 12, 24, 48, 72].map(hours => (
                            <SelectItem key={hours} value={hours.toString()}>{hours} hours</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>Required notice for cancellations</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="require_deposit"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Deposit</FormLabel>
                      <FormDescription>Require a deposit for bookings</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {requireDeposit && (
                <FormField
                  control={form.control}
                  name="deposit_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
                        />
                      </FormControl>
                      <FormDescription>Percentage of service price</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Booking Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}