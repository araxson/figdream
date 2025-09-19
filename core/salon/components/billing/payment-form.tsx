'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  CreditCard,
  DollarSign,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { InvoiceWithDetails, RecordPaymentInput, PaymentMethodType } from '../types';

const paymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_method: z.enum(['cash', 'card', 'bank_transfer', 'paypal', 'other']),
  payment_date: z.date(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  invoice: InvoiceWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RecordPaymentInput) => Promise<void>;
}

export function PaymentForm({
  invoice,
  isOpen,
  onClose,
  onSubmit,
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingAmount = invoice.amount_due - (invoice.amount_paid || 0);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: remainingAmount,
      payment_method: 'cash',
      payment_date: new Date(),
      reference_number: '',
      notes: '',
    },
  });

  const handleSubmit = async (values: PaymentFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        invoice_id: invoice.id,
        amount: values.amount,
        payment_method: values.payment_method as PaymentMethodType,
        payment_date: values.payment_date.toISOString(),
        reference_number: values.reference_number,
        notes: values.notes,
      });
      form.reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a payment for invoice {invoice.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Invoice Total:</span>
              <span className="font-medium">{formatCurrency(invoice.amount_due)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Amount Paid:</span>
              <span className="font-medium">{formatCurrency(invoice.amount_paid || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold">
              <span>Remaining:</span>
              <span className="text-primary">{formatCurrency(remainingAmount)}</span>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-9"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter the amount being paid
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
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

              <FormField
                control={form.control}
                name="reference_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Check #, transaction ID, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add a reference number for tracking
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
                        placeholder="Add any additional notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Record Payment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}