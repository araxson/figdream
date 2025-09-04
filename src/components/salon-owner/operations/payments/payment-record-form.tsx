'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { CalendarIcon, DollarSign } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createPaymentRecord } from '@/app/_actions/payments'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const paymentRecordSchema = z.object({
  appointment_id: z.string().optional().nullable(),
  customer_id: z.string().min(1, 'Customer is required'),
  staff_id: z.string().min(1, 'Staff member is required'),
  service_amount: z.coerce.number().min(0, 'Service amount must be positive'),
  tip_amount: z.coerce.number().min(0, 'Tip amount must be positive').default(0),
  tax_amount: z.coerce.number().min(0, 'Tax amount must be positive').default(0),
  discount_amount: z.coerce.number().min(0, 'Discount amount must be positive').default(0),
  payment_method: z.enum(['cash', 'card', 'check', 'gift_card', 'store_credit', 'other']),
  payment_date: z.date(),
  notes: z.string().optional().nullable(),
})

type PaymentRecordFormValues = z.infer<typeof paymentRecordSchema>

interface PaymentRecordFormProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  salonId: string
  locationId?: string
  appointmentId?: string
  customerId?: string
  staffId?: string
  customers?: Array<{ id: string; full_name: string; email: string }>
  staff?: Array<{ id: string; full_name: string }>
}

export function PaymentRecordForm({
  open,
  onClose,
  onSuccess,
  salonId,
  locationId,
  appointmentId,
  customerId,
  staffId,
  customers = [],
  staff = [],
}: PaymentRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PaymentRecordFormValues>({
    resolver: zodResolver(paymentRecordSchema),
    defaultValues: {
      appointment_id: appointmentId || null,
      customer_id: customerId || '',
      staff_id: staffId || '',
      service_amount: 0,
      tip_amount: 0,
      tax_amount: 0,
      discount_amount: 0,
      payment_method: 'cash',
      payment_date: new Date(),
      notes: '',
    },
  })

  const totalAmount = 
    (form.watch('service_amount') || 0) +
    (form.watch('tip_amount') || 0) +
    (form.watch('tax_amount') || 0) -
    (form.watch('discount_amount') || 0)

  async function onSubmit(values: PaymentRecordFormValues) {
    try {
      setIsSubmitting(true)

      // Get current user ID for recorded_by field
      const response = await fetch('/api/auth/user')
      const { user } = await response.json()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      await createPaymentRecord({
        ...values,
        salon_id: salonId,
        location_id: locationId,
        recorded_by: user.id,
        payment_date: values.payment_date.toISOString(),
        payment_status: 'completed',
      })

      toast.success('Payment record created successfully')
      form.reset()
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to create payment record:', error)
      toast.error('Failed to create payment record')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment received from a customer for services rendered.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.full_name} ({customer.email})
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
                    <FormLabel>Staff Member</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="service_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Base service amount before tips/tax</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tip_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tip Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discount_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="gift_card">Gift Card</SelectItem>
                        <SelectItem value="store_credit">Store Credit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
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
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this payment..."
                      className="resize-none"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}