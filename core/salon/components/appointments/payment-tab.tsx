'use client'

import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import type { AppointmentWithRelations, PaymentStatus } from '../types'

interface AppointmentPaymentTabProps {
  appointment: AppointmentWithRelations
  paymentStatusConfig: Record<PaymentStatus, { label: string; color: string }>
}

export function AppointmentPaymentTab({
  appointment,
  paymentStatusConfig
}: AppointmentPaymentTabProps) {
  const paymentStatus = paymentStatusConfig[appointment.payment_status as PaymentStatus]

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Status</span>
            <Badge variant={paymentStatus.color as any}>
              {paymentStatus.label}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-2">
            {appointment.subtotal != null && (
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${appointment.subtotal.toFixed(2)}</span>
              </div>
            )}
            {appointment.tax_amount != null && appointment.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>${appointment.tax_amount.toFixed(2)}</span>
              </div>
            )}
            {appointment.discount_amount != null && appointment.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${appointment.discount_amount.toFixed(2)}</span>
              </div>
            )}
            {appointment.tip_amount != null && appointment.tip_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tip</span>
                <span>${appointment.tip_amount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${appointment.total_amount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          {appointment.deposit_required && (
            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertTitle>Deposit Required</AlertTitle>
              <AlertDescription>
                A deposit of ${appointment.deposit_amount?.toFixed(2)} is required.
                {appointment.deposit_paid && ' (Paid)'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}