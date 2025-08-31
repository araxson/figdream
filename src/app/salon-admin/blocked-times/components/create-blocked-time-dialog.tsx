'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createBlockedTime } from '@/lib/data-access/blocked-times'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'

type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']

const formSchema = z.object({
  apply_to: z.enum(['salon', 'staff']),
  staff_id: z.string().optional(),
  date: z.date({
    required_error: 'Date is required',
  }),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  block_type: z.enum(['maintenance', 'break', 'meeting', 'holiday', 'other']),
  reason: z.string().optional(),
}).refine((data) => {
  if (data.apply_to === 'staff' && !data.staff_id) {
    return false
  }
  return true
}, {
  message: 'Please select a staff member',
  path: ['staff_id'],
}).refine((data) => {
  if (data.start_time && data.end_time) {
    return data.end_time > data.start_time
  }
  return true
}, {
  message: 'End time must be after start time',
  path: ['end_time'],
})

interface CreateBlockedTimeDialogProps {
  staff: StaffProfile[]
  salonId: string
}

export function CreateBlockedTimeDialog({ staff, salonId }: CreateBlockedTimeDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      apply_to: 'salon',
      block_type: 'other',
      reason: '',
    },
  })

  const applyTo = form.watch('apply_to')

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    try {
      const date = format(values.date, 'yyyy-MM-dd')
      const startDateTime = new Date(`${date}T${values.start_time}`)
      const endDateTime = new Date(`${date}T${values.end_time}`)
      
      await createBlockedTime({
        salon_id: values.apply_to === 'salon' ? salonId : null,
        staff_id: values.apply_to === 'staff' ? values.staff_id : null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        block_type: values.block_type as Database['public']['Enums']['block_type'],
        reason: values.reason || null,
        is_recurring: false,
      })
      
      toast.success('Blocked time created successfully')
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create blocked time')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Block Time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Block Time Slot</DialogTitle>
          <DialogDescription>
            Block a time slot to prevent appointments from being booked
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
                  <FormDescription>
                    Block time for the entire salon or specific staff member
                  </FormDescription>
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
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
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter reason for blocking time..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Blocked Time'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}