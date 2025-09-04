'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { SelectedService, StaffMember, TimeSlot } from './booking-types'
import type { BookingTotals } from './booking-form-types'

interface BookingSummarySidebarProps {
  selectedServices: SelectedService[]
  selectedStaff: StaffMember | null
  selectedDate: Date
  selectedTimeSlot: TimeSlot | null
  customStartTime: string
  timeSelectionMethod: 'slots' | 'custom'
  totals: BookingTotals
  currentStep: number
  totalSteps: number
}

export function BookingSummarySidebar({
  selectedServices,
  selectedStaff,
  selectedDate,
  selectedTimeSlot,
  customStartTime,
  timeSelectionMethod,
  totals,
  currentStep,
  totalSteps
}: BookingSummarySidebarProps) {
  // Don't show on the last step (confirmation)
  if (selectedServices.length === 0 || currentStep >= totalSteps - 1) {
    return null
  }

  return (
    <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 w-80">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {/* Selected Services */}
          <div>
            <h5 className="font-medium mb-2">Services</h5>
            {selectedServices.slice(0, 2).map(service => (
              <div key={service.id} className="flex justify-between">
                <span>{service.name}</span>
                <span>${service.total_price}</span>
              </div>
            ))}
            {selectedServices.length > 2 && (
              <div className="text-muted-foreground">
                +{selectedServices.length - 2} more services
              </div>
            )}
          </div>

          {/* Selected Staff */}
          {selectedStaff && (
            <div>
              <h5 className="font-medium mb-1">Staff</h5>
              <p className="text-muted-foreground">
                {selectedStaff.first_name} {selectedStaff.last_name}
              </p>
            </div>
          )}

          {/* Selected Date/Time */}
          {((timeSelectionMethod === 'slots' && selectedTimeSlot) || 
            (timeSelectionMethod === 'custom' && customStartTime)) && (
            <div>
              <h5 className="font-medium mb-1">Date & Time</h5>
              <p className="text-muted-foreground">
                {format(selectedDate, 'MMM d')} at {
                  timeSelectionMethod === 'slots' && selectedTimeSlot
                    ? selectedTimeSlot.start_time.slice(0, 5)
                    : timeSelectionMethod === 'custom' && customStartTime
                      ? customStartTime
                      : 'Not set'
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {timeSelectionMethod === 'custom' && 'Custom time (pending confirmation)'}
              </p>
            </div>
          )}

          <Separator />

          {/* Total */}
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>${totals.totalPrice}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}