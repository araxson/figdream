'use client'
import { useState, useMemo } from 'react'
import { Calendar } from '@/components/ui/form/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card'
import { Badge } from '@/components/ui/feedback/badge'
import { Button } from '@/components/ui/form/button'
import { ScrollArea } from '@/components/ui/layout/scroll-area'
import { format, isSameDay, addDays, startOfWeek, endOfWeek } from 'date-fns'
import { Clock, Calendar as CalendarIcon, User } from 'lucide-react'
import type { Database } from '@/types/database.types'
type TimeSlot = {
  time: string
  available: boolean
  staffId?: string
  staffName?: string
}
interface BookingCalendarProps {
  availableSlots?: Record<string, TimeSlot[]>
  selectedDate?: Date
  onDateSelect?: (date: Date | undefined) => void
  onTimeSlotSelect?: (date: Date, time: string, staffId?: string) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  staffMembers?: Array<{
    id: string
    full_name: string
  }>
}
export function BookingCalendar({
  availableSlots = {},
  selectedDate,
  onDateSelect,
  onTimeSlotSelect,
  minDate = new Date(),
  maxDate = addDays(new Date(), 60),
  disabledDates = [],
  staffMembers = [],
}: BookingCalendarProps) {
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(selectedDate)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null)
  const handleDateSelect = (date: Date | undefined) => {
    setInternalSelectedDate(date)
    setSelectedTimeSlot(null)
    onDateSelect?.(date)
  }
  const handleTimeSlotSelect = (time: string, staffId?: string) => {
    if (!internalSelectedDate) return
    setSelectedTimeSlot(time)
    onTimeSlotSelect?.(internalSelectedDate, time, staffId)
  }
  const dateKey = internalSelectedDate ? format(internalSelectedDate, 'yyyy-MM-dd') : ''
  const timeSlotsForDate = availableSlots[dateKey] || []
  const groupedTimeSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    }
    timeSlotsForDate.forEach(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      if (hour < 12) {
        groups.morning.push(slot)
      } else if (hour < 17) {
        groups.afternoon.push(slot)
      } else {
        groups.evening.push(slot)
      }
    })
    return groups
  }, [timeSlotsForDate])
  const hasAvailableSlots = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd')
    const slots = availableSlots[key] || []
    return slots.some(slot => slot.available)
  }
  const isDateDisabled = (date: Date) => {
    if (date < minDate || date > maxDate) return true
    if (disabledDates.some(d => isSameDay(d, date))) return true
    return false
  }
  const modifiers = {
    hasSlots: (date: Date) => hasAvailableSlots(date),
    noSlots: (date: Date) => !hasAvailableSlots(date) && !isDateDisabled(date),
  }
  const modifiersStyles = {
    hasSlots: {
      backgroundColor: 'rgb(187 247 208)',
      color: 'rgb(22 101 52)',
      fontWeight: 'bold',
    },
    noSlots: {
      backgroundColor: 'rgb(254 226 226)',
      color: 'rgb(153 27 27)',
    },
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
          <CardDescription>
            Choose your preferred appointment date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={internalSelectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            className="rounded-md border"
          />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-200" />
              <span>Available slots</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-200" />
              <span>No slots available</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {internalSelectedDate
              ? format(internalSelectedDate, 'EEEE, MMMM d')
              : 'Select Time'}
          </CardTitle>
          <CardDescription>
            {internalSelectedDate
              ? 'Choose an available time slot'
              : 'Please select a date first'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {internalSelectedDate && timeSlotsForDate.length > 0 ? (
            <ScrollArea className="h-[400px] pr-4">
              {Object.entries(groupedTimeSlots).map(([period, slots]) => {
                if (slots.length === 0) return null
                return (
                  <div key={period} className="mb-6">
                    <h4 className="mb-3 text-sm font-medium capitalize">
                      {period}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {slots.map((slot, index) => (
                        <Button
                          key={`${slot.time}-${index}`}
                          variant={
                            selectedTimeSlot === slot.time
                              ? 'default'
                              : slot.available
                              ? 'outline'
                              : 'ghost'
                          }
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => handleTimeSlotSelect(slot.time, slot.staffId)}
                          className="justify-start"
                        >
                          <Clock className="mr-2 h-3 w-3" />
                          {slot.time}
                          {slot.staffName && (
                            <span className="ml-auto text-xs opacity-70">
                              {slot.staffName}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          ) : internalSelectedDate ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No available time slots for this date
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please select a different date
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Select a date to view available time slots
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}