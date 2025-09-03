'use client'
import { useState } from 'react'
import { Calendar as CalendarUI } from '@/components/ui/form/calendar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/data-display/card'
import { Badge } from '@/components/ui/feedback/badge'
import { Button } from '@/components/ui/form/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
interface CalendarEvent {
  id: string
  date: Date
  title: string
  type?: 'appointment' | 'blocked' | 'holiday' | 'event'
  color?: string
}
interface CalendarProps {
  events?: CalendarEvent[]
  selectedDate?: Date
  onDateSelect?: (date: Date | undefined) => void
  mode?: 'single' | 'multiple' | 'range'
  disabled?: (date: Date) => boolean
  className?: string
}
export function Calendar({
  events = [],
  selectedDate,
  onDateSelect,
  mode = 'single',
  disabled,
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(selectedDate)
  const handleDateSelect = (date: Date | undefined) => {
    setInternalSelectedDate(date)
    onDateSelect?.(date)
  }
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }
  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }
  const getEventColor = (type?: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-100 text-blue-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      case 'holiday':
        return 'bg-green-100 text-green-800'
      case 'event':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  const modifiers = {
    hasEvent: (date: Date) => getEventsForDate(date).length > 0,
  }
  const modifiersStyles = {
    hasEvent: {
      backgroundColor: 'rgb(239 246 255)',
      fontWeight: 'bold',
    },
  }
  const selectedDateEvents = internalSelectedDate ? getEventsForDate(internalSelectedDate) : []
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                {format(currentMonth, 'MMMM yyyy')}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CalendarUI
            mode={mode as any}
            selected={internalSelectedDate}
            onSelect={handleDateSelect as any}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            modifiers={modifiers}
            modifiersStyles={modifiersStyles}
            disabled={disabled}
            className="rounded-md border"
          />
          {internalSelectedDate && selectedDateEvents.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">
                Events on {format(internalSelectedDate, 'PPP')}
              </h4>
              {selectedDateEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <span className="text-sm">{event.title}</span>
                  <Badge className={getEventColor(event.type)}>
                    {event.type || 'Event'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}