import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Calendar, Clock } from 'lucide-react'
import type { ServiceFormData } from './service-form-schema'
import { weekDays } from './service-form-schema'

interface BookingTabProps {
  form: UseFormReturn<ServiceFormData>
}

export function BookingTab({ form }: BookingTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Settings</CardTitle>
        <CardDescription>
          Configure how customers can book this service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="advance_booking_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advance Booking Days</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      max="365"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  How far in advance can customers book
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="max_bookings_per_day"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Bookings Per Day</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number" 
                    min="0"
                    placeholder="Unlimited"
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Leave empty for unlimited
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="preparation_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preparation Time (minutes)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      step="5"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Time needed before service
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cleanup_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleanup Time (minutes)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input 
                      {...field} 
                      type="number" 
                      min="0"
                      step="5"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Time needed after service
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="available_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Available Days</FormLabel>
              <FormDescription>
                Select which days this service is available
              </FormDescription>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                {weekDays.map((day) => (
                  <FormItem
                    key={day.value}
                    className="flex items-center space-x-2"
                  >
                    <FormControl>
                      <Checkbox
                        checked={field.value?.includes(day.value)}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          const updated = checked
                            ? [...current, day.value]
                            : current.filter((d) => d !== day.value)
                          field.onChange(updated)
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      {day.label}
                    </FormLabel>
                  </FormItem>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}