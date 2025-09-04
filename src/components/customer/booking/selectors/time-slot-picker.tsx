'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TimeSlot } from './booking-types'

interface TimeSlotPickerProps {
  date: Date
  locationId: string
  staffId?: string
  serviceIds: string[]
  selectedSlot: TimeSlot | null
  onSlotSelect: (slot: TimeSlot | null) => void
  disabled?: boolean
}

export function TimeSlotPicker({
  date,
  selectedSlot,
  _onSlotSelect,
  _disabled = false
}: TimeSlotPickerProps) {
  // This is a stub implementation
  // The actual time slot picker should be implemented with availability queries
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Time</CardTitle>
        <CardDescription>
          Choose an available time slot for {date.toDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">
          Time slot selection component to be implemented.
          Currently selected: {selectedSlot ? `${selectedSlot.start_time} - ${selectedSlot.end_time}` : 'None'}
        </div>
      </CardContent>
    </Card>
  )
}