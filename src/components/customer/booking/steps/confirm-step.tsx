'use client'

import * as React from 'react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Badge,
  Alert,
  AlertDescription,
} from '@/components/ui'
import { CheckCircle, CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { calculateEndTime } from '../booking-form-utils'
import type { StepContentProps } from '../booking-form-types'

export function ConfirmStep({
  selectedServices,
  selectedStaff,
  selectedDate,
  selectedTimeSlot,
  customStartTime,
  timeSelectionMethod,
  totals,
  businessRules,
  submitError
}: StepContentProps) {
  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Services */}
          <div>
            <h4 className="font-medium mb-2">Services</h4>
            <div className="space-y-2">
              {selectedServices.map(service => (
                <div key={service.id} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{service.name}</span>
                    {service.quantity > 1 && (
                      <span className="text-muted-foreground ml-1">× {service.quantity}</span>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {service.total_duration} minutes
                    </div>
                  </div>
                  <span className="font-medium">${service.total_price}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Staff */}
          <div>
            <h4 className="font-medium mb-2">Staff</h4>
            <p className="text-sm">
              {selectedStaff 
                ? `${selectedStaff.first_name} ${selectedStaff.last_name} - ${selectedStaff.role}`
                : 'Any available staff member'
              }
            </p>
          </div>

          <Separator />

          {/* Date & Time */}
          <div>
            <h4 className="font-medium mb-2">Date & Time</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm">
                <CalendarIcon className="h-4 w-4" />
                <span>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="h-4 w-4" />
                {timeSelectionMethod === 'slots' && selectedTimeSlot ? (
                  <span>{selectedTimeSlot.start_time.slice(0, 5)} - {selectedTimeSlot.end_time.slice(0, 5)}</span>
                ) : timeSelectionMethod === 'custom' && customStartTime ? (
                  <span>
                    {(() => {
                      const startTime = customStartTime + ':00'
                      const endTime = calculateEndTime(startTime, totals.totalDuration)
                      return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`
                    })()}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Time not selected</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Badge variant="outline">
                  {timeSelectionMethod === 'slots' ? 'Available Slot' : 'Custom Time'}
                </Badge>
                {timeSelectionMethod === 'custom' && (
                  <span className="ml-2">Subject to availability confirmation</span>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span>${totals.totalPrice}</span>
            </div>
            {businessRules?.require_deposit && totals.depositAmount > 0 && (
              <>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Deposit ({businessRules.deposit_percentage}%)</span>
                  <span>-${totals.depositAmount}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-medium pt-2">
                  <span>Due at service</span>
                  <span>${totals.finalAmount}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {/* Terms and Conditions */}
      <Card>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>By confirming this booking, you agree to our terms and conditions:</p>
            <ul className="list-disc ml-4 space-y-1">
              <li>Cancellations must be made at least 24 hours in advance</li>
              <li>No-shows may be charged the full service amount</li>
              <li>Rescheduling is subject to availability</li>
              {businessRules?.require_deposit && (
                <li>Deposits are non-refundable but can be applied to rescheduled appointments</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}