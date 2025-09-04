'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react'
import { TimeSlotPicker } from '../selectors/time-slot-picker'
import { Input } from '@/components/ui/input'
import { calculateEndTime, formatTimeDisplay } from '../forms/booking-form-utils'
import type { StepContentProps } from '../forms/booking-form-types'

export function DateTimeStep({
  selectedStaff,
  selectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  customStartTime,
  setCustomStartTime,
  timeSelectionMethod,
  setTimeSelectionMethod,
  locationId,
  totals,
  businessRules,
  disabled
}: StepContentProps) {
  return (
    <div className="space-y-6">
      {/* Date Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calendar component would go here */}
          <div className="text-center p-8 text-muted-foreground">
            <CalendarIcon className="h-12 w-12 mx-auto mb-2" />
            <p>Calendar component placeholder</p>
            <p className="text-sm">Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Time Selection Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Choose Time Selection Method
          </CardTitle>
          <CardDescription>
            Select from available time slots or specify a custom time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={timeSelectionMethod}
            onValueChange={(value) => {
              setTimeSelectionMethod(value as 'slots' | 'custom')
              // Reset selections when switching methods
              setSelectedTimeSlot(null)
              setCustomStartTime('')
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            disabled={disabled}
          >
            <Card>
              <CardContent className="flex items-center space-x-2">
                <RadioGroupItem value="slots" id="slots" />
                <div className="flex-1">
                  <Label htmlFor="slots" className="font-medium">Available Time Slots</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose from staff availability ({selectedStaff ? 'with selected staff' : 'any staff'})
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  {selectedStaff ? 'Staff-specific' : 'Flexible'}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <div className="flex-1">
                  <Label htmlFor="custom" className="font-medium">Custom Time</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select any time (subject to availability confirmation)
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Flexible
                </Badge>
              </CardContent>
            </Card>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Time Slot Selection */}
      {timeSelectionMethod === 'slots' && selectedStaff && (
        <TimeSlotPicker
          staffId={selectedStaff.id}
          locationId={locationId}
          selectedDate={selectedDate}
          serviceDurationMinutes={totals.totalDuration}
          onTimeSlotSelect={setSelectedTimeSlot}
          selectedTimeSlot={selectedTimeSlot}
          minAdvanceHours={businessRules?.min_advance_hours || 1}
          disabled={disabled}
        />
      )}

      {/* Custom Time Selection */}
      {timeSelectionMethod === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Custom Time
            </CardTitle>
            <CardDescription>
              Choose your preferred start time. Duration: {totals.totalDuration} minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  placeholder="Select start time"
                  value={customStartTime}
                  onChange={(e) => setCustomStartTime(e.target.value)}
                  disabled={disabled}
                  min="08:00"
                  max="20:00"
                  step={900}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time (Calculated)</Label>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    {customStartTime 
                      ? formatTimeDisplay(calculateEndTime(customStartTime + ':00', totals.totalDuration))
                      : 'Select start time first'
                    }
                  </AlertDescription>
                </Alert>
                <p className="text-xs text-muted-foreground">
                  Automatically calculated based on service duration
                </p>
              </div>
            </div>
            {customStartTime && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Custom time selections are subject to staff availability. 
                  We&apos;ll confirm your appointment time and notify you of any necessary adjustments.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Staff Selected Message */}
      {timeSelectionMethod === 'slots' && !selectedStaff && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a staff member first to see available time slots, or choose the custom time option.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}