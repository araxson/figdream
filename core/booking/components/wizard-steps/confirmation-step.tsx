'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import type { ConfirmationStepProps } from '../wizard-utils/wizard-types'
import { formatPrice, formatDuration } from '../wizard-utils/wizard-helpers'

export function ConfirmationStep({
  state,
  staff,
  totalDuration,
  total
}: ConfirmationStepProps) {
  const selectedStaffName = state.selectedStaff
    ? staff.find(s => s.id === state.selectedStaff)?.display_name
    : 'Any Available'

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Review & Confirm</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Please review your booking details before confirming
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Services</p>
            {[...state.selectedServices, ...state.selectedAddons].map(service => (
              <div key={service.serviceId} className="flex justify-between">
                <span className="text-sm">{service.serviceName}</span>
                <span className="text-sm font-medium">
                  {formatPrice(service.price * service.quantity)}
                </span>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Professional</span>
              <span className="text-sm font-medium">{selectedStaffName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-sm font-medium">
                {state.selectedDate?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Time</span>
              <span className="text-sm font-medium">{state.selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="text-sm font-medium">{formatDuration(totalDuration)}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Customer</span>
              <span className="text-sm font-medium">
                {state.customerInfo?.firstName} {state.customerInfo?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{state.customerInfo?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">{state.customerInfo?.phone}</span>
            </div>
            {state.specialRequests && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Special Requests</span>
                <span className="text-sm font-medium">{state.specialRequests}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <span className="text-sm font-medium capitalize">
                {state.paymentMethod?.type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          By confirming this booking, you agree to our cancellation policy.
          Cancellations must be made at least 24 hours in advance.
        </AlertDescription>
      </Alert>
    </div>
  )
}