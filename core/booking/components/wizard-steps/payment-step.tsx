'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Banknote, Building } from 'lucide-react'
import type { PaymentStepProps } from '../wizard-utils/wizard-types'
import type { PaymentMethod } from '../../types'
import { formatPrice } from '../wizard-utils/wizard-helpers'

export function PaymentStep({
  state,
  subtotal,
  tax,
  total,
  onStateChange
}: PaymentStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Payment Method</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose how you'd like to pay for your appointment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...state.selectedServices, ...state.selectedAddons].map(service => (
            <div key={service.serviceId} className="flex justify-between text-sm">
              <span>{service.serviceName} x{service.quantity}</span>
              <span>{formatPrice(service.price * service.quantity)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (10%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </CardContent>
      </Card>

      <RadioGroup
        value={state.paymentMethod?.type || ''}
        onValueChange={(value) => onStateChange({
          paymentMethod: {
            type: value as any,
          } as PaymentMethod
        })}
      >
        <Card className="cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="card" id="card" />
              <CreditCard className="h-5 w-5" />
              <Label htmlFor="card" className="cursor-pointer flex-1">
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-muted-foreground">
                    Pay securely with your card
                  </p>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="cash" id="cash" />
              <Banknote className="h-5 w-5" />
              <Label htmlFor="cash" className="cursor-pointer flex-1">
                <div>
                  <p className="font-medium">Cash</p>
                  <p className="text-sm text-muted-foreground">
                    Pay at the salon
                  </p>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="bank_transfer" id="bank" />
              <Building className="h-5 w-5" />
              <Label htmlFor="bank" className="cursor-pointer flex-1">
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">
                    Transfer directly to our account
                  </p>
                </div>
              </Label>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>
    </div>
  )
}