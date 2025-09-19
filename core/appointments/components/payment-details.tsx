'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { DollarSign, CreditCard, Banknote, Smartphone, FileText } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row']
type FormValues = {
  customer_id: string
  services: string[]
  date: Date
  time: string
  staff_id: string
  payment_method: 'cash' | 'card' | 'online'
  notes?: string
}

interface PaymentDetailsProps {
  form: UseFormReturn<FormValues>
  services: Service[]
  taxRate?: number
  depositRequired?: boolean
  depositPercentage?: number
  loading?: boolean
}

export function PaymentDetails({
  form,
  services = [],
  taxRate = 0,
  depositRequired = false,
  depositPercentage = 20,
  loading = false
}: PaymentDetailsProps) {
  const selectedServiceIds = form.watch('services') || []
  const selectedServices = services.filter(s => selectedServiceIds.includes(s.id))
  const paymentMethod = form.watch('payment_method')

  const subtotal = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount
  const depositAmount = depositRequired ? total * (depositPercentage / 100) : 0
  const remainingBalance = total - depositAmount

  const paymentMethods = [
    {
      value: 'cash',
      label: 'Cash',
      description: 'Pay with cash at the salon',
      icon: Banknote
    },
    {
      value: 'card',
      label: 'Credit/Debit Card',
      description: 'Pay with card at the salon',
      icon: CreditCard
    },
    {
      value: 'online',
      label: 'Online Payment',
      description: 'Pay online now with card or digital wallet',
      icon: Smartphone
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment & Summary
        </CardTitle>
        <CardDescription>
          Review your booking details and choose a payment method
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Booking Summary */}
        <div className="space-y-4">
          <h3 className="font-medium">Booking Summary</h3>

          {selectedServices.length > 0 ? (
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span>{service.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {service.duration}min
                    </Badge>
                  </div>
                  <span className="font-medium">${service.price?.toFixed(2)}</span>
                </div>
              ))}

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({taxRate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {depositRequired && (
                  <>
                    <Separator />
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Deposit Required ({depositPercentage}%):</span>
                        <span className="font-medium text-foreground">
                          ${depositAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Remaining Balance:</span>
                        <span>${remainingBalance.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No services selected
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="payment_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={loading}
                    className="space-y-3"
                  >
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      const isSelected = paymentMethod === method.value

                      return (
                        <div key={method.value}>
                          <div
                            className={`relative border rounded-lg p-4 cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem
                                value={method.value}
                                id={method.value}
                                className="mt-1"
                              />
                              <Label
                                htmlFor={method.value}
                                className="flex-1 cursor-pointer"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <Icon className="h-4 w-4" />
                                  <span className="font-medium">{method.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {method.description}
                                </p>
                              </Label>
                            </div>
                          </div>

                          {isSelected && method.value === 'online' && depositRequired && (
                            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <div className="flex items-center gap-2 text-sm text-blue-700">
                                <DollarSign className="h-4 w-4" />
                                <span>
                                  You will be charged ${depositAmount.toFixed(2)} now.
                                  Remaining ${remainingBalance.toFixed(2)} will be collected at the salon.
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Special Notes (Optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special requests or notes for this appointment..."
                  className="min-h-[80px]"
                  disabled={loading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}