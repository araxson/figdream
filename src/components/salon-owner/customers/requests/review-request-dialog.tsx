'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  RadioGroup,
  RadioGroupItem,
  Checkbox,
  ScrollArea,
  Label,
} from '@/components/ui'
import { MessageSquare, Send, Mail, MessageCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
const reviewRequestSchema = z.object({
  customer_ids: z.array(z.string()).min(1, 'Select at least one customer'),
  request_method: z.enum(['email', 'sms', 'both']),
  template_id: z.string().optional(),
  custom_message: z.string().optional(),
  schedule_type: z.enum(['immediate', 'scheduled']),
  scheduled_date: z.string().optional(),
  follow_up_enabled: z.boolean(),
  follow_up_days: z.coerce.number().min(1).max(30).optional(),
})
type ReviewRequestFormData = z.infer<typeof reviewRequestSchema>
interface ReviewRequestDialogProps {
  salonId: string
  eligibleAppointments: Array<{
    id: string
    customer_name: string
    service_name: string
    appointment_date: string
  }>[]
  selectedCustomerId?: string
  trigger?: React.ReactNode
}
export function ReviewRequestDialog({ 
  salonId, 
  eligibleAppointments,
  selectedCustomerId,
  trigger
}: ReviewRequestDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<ReviewRequestFormData>({
    resolver: zodResolver(reviewRequestSchema),
    defaultValues: {
      customer_ids: selectedCustomerId ? [selectedCustomerId] : [],
      request_method: 'email',
      schedule_type: 'immediate',
      follow_up_enabled: true,
      follow_up_days: 7,
    }
  })
  const handleSubmit = async (data: ReviewRequestFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      // Create review requests for each selected customer
      const requests = data.customer_ids.map(customerId => {
        const appointment = eligibleAppointments.find(a => a.customer_id === customerId)
        return {
          salon_id: salonId,
          customer_id: customerId,
          appointment_id: appointment?.id,
          request_method: data.request_method,
          template_id: data.template_id || null,
          custom_message: data.custom_message || null,
          status: data.schedule_type === 'immediate' ? 'pending' : 'scheduled',
          scheduled_for: data.schedule_type === 'scheduled' ? data.scheduled_date : null,
          follow_up_enabled: data.follow_up_enabled,
          follow_up_days: data.follow_up_days || 7,
        }
      })
      const { error } = await supabase
        .from('review_requests')
        .insert(requests)
      if (error) throw error
      toast.success(`Created ${requests.length} review request(s)`)
      // If immediate, simulate sending (in real app, this would trigger email/SMS service)
      if (data.schedule_type === 'immediate') {
        const { error: updateError } = await supabase
          .from('review_requests')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .in('customer_id', data.customer_ids)
          .eq('status', 'pending')
        if (!updateError) {
          toast.success('Review requests sent successfully')
        }
      }
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (_error) {
      toast.error('Failed to create review requests')
    } finally {
      setIsSubmitting(false)
    }
  }
  // Group appointments by customer
  const customerMap = new Map()
  eligibleAppointments.forEach(apt => {
    if (!customerMap.has(apt.customer_id)) {
      customerMap.set(apt.customer_id, {
        customer: apt.customers,
        appointments: []
      })
    }
    customerMap.get(apt.customer_id).appointments.push(apt)
  })
  const customers = Array.from(customerMap.values())
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Request Reviews
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Request Customer Reviews</DialogTitle>
          <DialogDescription>
            Send review requests to customers who have completed appointments
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Customers</FormLabel>
                  <FormDescription>
                    Choose customers to request reviews from
                  </FormDescription>
                  <ScrollArea className="h-48 border rounded-lg p-3">
                    <div className="space-y-2">
                    {customers.map(({ customer, appointments }) => (
                      <div key={customer.id} className="flex items-start space-x-3">
                        <Checkbox
                          checked={field.value.includes(customer.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, customer.id])
                            } else {
                              field.onChange(field.value.filter(id => id !== customer.id))
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{customer.profiles?.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last visit: {new Date(appointments[0].appointment_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    </div>
                  </ScrollArea>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="request_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Request Method</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                          <Mail className="h-4 w-4" />
                          Email
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="sms" />
                        <Label htmlFor="sms" className="flex items-center gap-2 cursor-pointer">
                          <MessageCircle className="h-4 w-4" />
                          SMS
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both" className="flex items-center gap-2 cursor-pointer">
                          Both
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="custom_message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a personalized message to your review request..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be included in the review request
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="schedule_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>When to Send</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timing" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('schedule_type') === 'scheduled' && (
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Date & Time</FormLabel>
                    <FormControl>
                      <input
                        type="datetime-local"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="follow_up_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Enable Follow-up Reminders
                    </FormLabel>
                    <FormDescription>
                      Automatically send reminder if customer doesn&apos;t respond
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {form.watch('follow_up_enabled') && (
              <FormField
                control={form.control}
                name="follow_up_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up After (Days)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Days to wait before sending reminder
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  form.reset()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}