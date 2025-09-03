'use client'

import { Calendar } from '@/components/ui/form/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card'

export interface BookingCalendarProps {
  staffId?: string
  onDateSelect?: (date: Date) => void
}

export function BookingCalendar({ }: BookingCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Calendar</CardTitle>
      </CardHeader>
      <CardContent>
        <Calendar />
      </CardContent>
    </Card>
  )
}
