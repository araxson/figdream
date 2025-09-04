'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
const waitlistSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  service_id: z.string().min(1, 'Service is required'),
  staff_id: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time: z.enum(['morning', 'afternoon', 'evening', 'any']),
  notes: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high']),
  notify_via_email: z.boolean(),
  notify_via_sms: z.boolean(),
})
type WaitlistFormData = z.infer<typeof waitlistSchema>
interface WaitlistEntryDialogProps {
  salonId: string
  entry?: Record<string, unknown>
  trigger?: React.ReactNode
}
export function WaitlistEntryDialog({ 
  salonId,
  entry,
  trigger
}: WaitlistEntryDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Array<Record<string, unknown>>>([])
  const [services, setServices] = useState<Array<Record<string, unknown>>>([])
  const [staff, setStaff] = useState<Array<Record<string, unknown>>>([])
  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: entry ? {
      customer_id: entry.customer_id,
      service_id: entry.service_id,
      staff_id: entry.staff_id || '',
      preferred_date: entry.preferred_date || '',
      preferred_time: entry.preferred_time || 'any',
      notes: entry.notes || '',
      priority: entry.priority || 'normal',
      notify_via_email: entry.notify_via_email !== false,
      notify_via_sms: entry.notify_via_sms !== false,
    } : {
      customer_id: '',
      service_id: '',
      staff_id: '',
      preferred_date: '',
      preferred_time: 'any',
      notes: '',
      priority: 'normal',
      notify_via_email: true,
      notify_via_sms: true,
    }
  })
  // Load data when dialog opens
  const loadData = async () => {
    const supabase = createClient()
    const [customersRes, servicesRes, staffRes] = await Promise.all([
      supabase
        .from('customers')
        .select(`
          id,
          profiles!inner(
            full_name,
            email
          )
        `)
        .eq('salon_id', salonId),
      supabase
        .from('services')
        .select('id, name, duration_minutes')
        .eq('salon_id', salonId)
        .eq('is_active', true),
      supabase
        .from('staff_profiles')
        .select(`
          id,
          profiles!inner(
            full_name
          )
        `)
        .eq('salon_id', salonId)
        .eq('is_active', true),
    ])
    setCustomers(customersRes.data || [])
    setServices(servicesRes.data || [])
    setStaff(staffRes.data || [])
  }
  const handleSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const waitlistData = {
        salon_id: salonId,
        customer_id: data.customer_id,
        service_id: data.service_id,
        staff_id: data.staff_id || null,
        preferred_date: data.preferred_date || null,
        preferred_time: data.preferred_time,
        notes: data.notes || null,
        priority: data.priority,
        notify_via_email: data.notify_via_email,
        notify_via_sms: data.notify_via_sms,
        status: 'waiting',
      }
      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from('waitlist')
          .update(waitlistData)
          .eq('id', entry.id)
        if (error) throw error
        toast.success('Waitlist entry updated')
      } else {
        // Create new entry
        const { error } = await supabase
          .from('waitlist')
          .insert(waitlistData)
        if (error) throw error
        toast.success('Added to waitlist')
      }
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save waitlist entry')
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) loadData()
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add to Waitlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {entry ? 'Edit Waitlist Entry' : 'Add to Waitlist'}
          </DialogTitle>
          <DialogDescription>
            Add a customer to the waitlist for appointment openings
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.profiles?.full_name} ({customer.profiles?.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration_minutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="staff_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Staff (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Any available staff" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Any available staff</SelectItem>
                      {staff.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.profiles?.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Leave empty for any available staff member
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="preferred_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Customer&apos;s preferred appointment date
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="preferred_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time preference" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any">Any time</SelectItem>
                        <SelectItem value="morning">Morning (9AM-12PM)</SelectItem>
                        <SelectItem value="afternoon">Afternoon (12PM-5PM)</SelectItem>
                        <SelectItem value="evening">Evening (5PM-9PM)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Higher priority customers are contacted first
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any special requirements or preferences..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="notify_via_email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Notify customer via email when spot opens
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notify_via_sms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>SMS Notifications</FormLabel>
                      <FormDescription>
                        Notify customer via SMS when spot opens
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {entry ? 'Update' : 'Add to Waitlist'}
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