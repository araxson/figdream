'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Clock } from 'lucide-react'
import { toast } from 'sonner'
import { updateBusinessHoursAction } from '../actions/salons-actions'

interface BusinessHoursSettingsProps {
  salonId: string
  initialData?: any
  onSaving?: (saving: boolean) => void
}

const businessHoursSchema = z.object({
  monday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format'),
    close_time: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format')
  }),
  tuesday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  wednesday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  thursday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  friday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  saturday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  }),
  sunday: z.object({
    open: z.boolean(),
    open_time: z.string().regex(/^\d{2}:\d{2}$/),
    close_time: z.string().regex(/^\d{2}:\d{2}$/)
  })
})

const defaultBusinessHours = {
  monday: { open: true, open_time: '09:00', close_time: '18:00' },
  tuesday: { open: true, open_time: '09:00', close_time: '18:00' },
  wednesday: { open: true, open_time: '09:00', close_time: '18:00' },
  thursday: { open: true, open_time: '09:00', close_time: '18:00' },
  friday: { open: true, open_time: '09:00', close_time: '18:00' },
  saturday: { open: true, open_time: '10:00', close_time: '16:00' },
  sunday: { open: false, open_time: '10:00', close_time: '16:00' }
}

export function BusinessHoursSettings({ salonId, initialData, onSaving }: BusinessHoursSettingsProps) {
  const form = useForm({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: initialData || defaultBusinessHours
  })

  const handleSubmit = async (data: z.infer<typeof businessHoursSchema>) => {
    try {
      onSaving?.(true)
      const response = await updateBusinessHoursAction(salonId, data)

      if (response.success) {
        toast.success('Business hours updated successfully')
      } else {
        toast.error(response.error || 'Failed to update business hours')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      onSaving?.(false)
    }
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Hours
        </CardTitle>
        <CardDescription>
          Set your salon's operating hours for each day of the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {days.map((day) => (
              <div key={day} className="grid grid-cols-4 gap-4 items-end">
                <FormField
                  control={form.control}
                  name={`${day}.open`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="capitalize font-medium">
                        {day}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`${day}.open_time`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={!form.watch(`${day}.open`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`${day}.close_time`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={!form.watch(`${day}.open`)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            ))}

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Business Hours'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}