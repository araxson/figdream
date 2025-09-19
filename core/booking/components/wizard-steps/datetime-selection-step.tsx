'use client'

import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { DateTimeStepProps } from '../wizard-utils/wizard-types'

export function DateTimeSelectionStep({ state, timeSlots, onStateChange }: DateTimeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium mb-2">Select Date & Time</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your preferred appointment time
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={state.selectedDate || undefined}
            onSelect={(date) => onStateChange({ selectedDate: date || null })}
            disabled={(date) =>
              date < new Date() ||
              date > new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            }
            className="rounded-md border"
          />
        </div>

        <div>
          <Label>Available Times</Label>
          {state.selectedDate && (
            <ScrollArea className="h-[350px] rounded-md border p-4">
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(slot => (
                  <Button
                    key={slot.time}
                    variant={state.selectedTime === slot.time ? 'default' : 'outline'}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => onStateChange({ selectedTime: slot.time })}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          )}
          {!state.selectedDate && (
            <div className="h-[350px] rounded-md border p-4 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Please select a date first
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}