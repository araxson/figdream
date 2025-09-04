'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createRecurringBlockedTimes } from '@/lib/data-access/blocked-times'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
const formSchema = z.object({
  apply_to: z.enum(['salon', 'staff']),
  staff_id: z.string().optional(),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  end_date: z.date({
    required_error: 'End date is required',
  }),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  days_of_week: z.array(z.number()).min(1, 'Select at least one day'),
  block_type: z.enum(['maintenance', 'break', 'meeting', 'holiday', 'other']),
  reason: z.string().min(1, 'Reason is required for recurring blocks'),
}).refine((data) => {
  if (data.apply_to === 'staff' && !data.staff_id) {
    return false
  }
  return true
}, {
  message: 'Please select a staff member',
  path: ['staff_id'],
}).refine((data) => {
  return data.end_date >= data.start_date
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time
  }
  return true
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
})
interface RecurringBlockedTimeDialogProps {
  staff: StaffProfile[]
  salonId: string
}
const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]
export function RecurringBlockedTimeDialog({ staff, salonId }: RecurringBlockedTimeDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apply_to: 'salon',
      block_type: 'break',
      days_of_week: [],
      reason: '',
    },
  })
  const applyTo = form.watch('apply_to')
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      await createRecurringBlockedTimes({
        salonId: values.apply_to === 'salon' ? salonId : undefined,
        staffId: values.apply_to === 'staff' ? values.staff_id : undefined,
        startDate: format(values.start_date, 'yyyy-MM-dd'),
        endDate: format(values.end_date, 'yyyy-MM-dd'),
        timeSlot: {
          startTime: values.start_time,
          endTime: values.end_time,
        },
        daysOfWeek: values.days_of_week,
        reason: values.reason,
        blockType: values.block_type as Database['public']['Enums']['block_type'],
      })
      toast.success('Recurring blocked times created successfully')
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (_error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create recurring blocked times'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Repeat className="mr-2 h-4 w-4" />
          Recurring Block
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Create Recurring Blocked Time</DialogTitle>
          <DialogDescription>
            Set up recurring blocked times (e.g., daily lunch breaks)
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="apply_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apply To</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="salon">Entire Salon</SelectItem>
                      <SelectItem value="staff">Specific Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {applyTo === 'staff' && (
              <FormField
                control={form.control}
                name="staff_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Member</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.full_name || member.email || 'Unknown'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues('start_date')
                            return startDate ? date < startDate : date < new Date(new Date().setHours(0, 0, 0, 0))
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="days_of_week"
              render={() => (
                <FormItem>
                  <FormLabel>Days of Week</FormLabel>
                  <FormDescription>
                    Select which days to apply the blocked time
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-3">
                    {DAYS_OF_WEEK.map((day) => (
                      <FormField
                        key={day.value}
                        control={form.control}
                        name="days_of_week"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={day.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, day.value])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== day.value
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {day.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="block_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Block Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="break">Break</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Lunch break, Staff meeting..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a clear reason for the recurring block
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Recurring Blocks'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}