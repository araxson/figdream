'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { updateSalonSettingsAction } from '../actions/salons-actions'

interface PaymentConfigurationProps {
  salonId: string
  initialData?: any
  onSaving?: (saving: boolean) => void
}

const paymentSettingsSchema = z.object({
  accept_cash: z.boolean(),
  accept_card: z.boolean(),
  accept_digital_wallets: z.boolean(),
  tax_rate: z.number().min(0).max(30),
  tip_suggestions: z.array(z.number()).optional(),
  require_payment_upfront: z.boolean()
})

export function PaymentConfiguration({ salonId, initialData, onSaving }: PaymentConfigurationProps) {
  const form = useForm({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      accept_cash: initialData?.accept_cash ?? true,
      accept_card: initialData?.accept_card ?? true,
      accept_digital_wallets: initialData?.accept_digital_wallets ?? false,
      tax_rate: initialData?.tax_rate ?? 0,
      tip_suggestions: initialData?.tip_suggestions ?? [15, 18, 20],
      require_payment_upfront: initialData?.require_payment_upfront ?? false
    }
  })

  const handleSubmit = async (data: z.infer<typeof paymentSettingsSchema>) => {
    try {
      onSaving?.(true)
      const response = await updateSalonSettingsAction(salonId, {
        payment_settings: data
      })

      if (response.success) {
        toast.success('Payment settings updated successfully')
      } else {
        toast.error(response.error || 'Failed to update payment settings')
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
          <CreditCard className="h-5 w-5" />
          Payment Configuration
        </CardTitle>
        <CardDescription>
          Configure payment methods and tax settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="text-sm font-medium">Payment Methods</div>

              <FormField
                control={form.control}
                name="accept_cash"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Cash</FormLabel>
                      <FormDescription>Accept cash payments</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accept_card"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Credit/Debit Card</FormLabel>
                      <FormDescription>Accept card payments</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accept_digital_wallets"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Digital Wallets</FormLabel>
                      <FormDescription>Accept Apple Pay, Google Pay, etc.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium">Tax & Pricing</div>

              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="30"
                        step="0.1"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : 0)}
                      />
                    </FormControl>
                    <FormDescription>Sales tax percentage</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="require_payment_upfront"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Require Upfront Payment</FormLabel>
                      <FormDescription>Customers must pay when booking</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save Payment Settings'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}