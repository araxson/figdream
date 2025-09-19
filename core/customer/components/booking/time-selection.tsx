'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { TimeSlot } from '../../types'

interface TimeSelectionProps {
  selectedDate?: Date
  selectedTime?: string
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
  onContinue: () => void
  getAvailableSlots: (date: Date) => Promise<TimeSlot[]>
  totalDuration: number
}

export function TimeSelection({
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  onContinue,
  getAvailableSlots,
  totalDuration
}: TimeSelectionProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>({})

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  // Load availability for visible dates
  useEffect(() => {
    const loadAvailability = async () => {
      const days = generateCalendarDays().filter(Boolean) as Date[]
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const availability: Record<string, boolean> = {}

      for (const day of days) {
        if (day >= today) {
          try {
            const slots = await getAvailableSlots(day)
            const hasAvailableSlots = slots.some(slot => slot.isAvailable)
            availability[day.toDateString()] = hasAvailableSlots
          } catch (error) {
            availability[day.toDateString()] = false
          }
        } else {
          availability[day.toDateString()] = false
        }
      }

      setAvailabilityMap(availability)
    }

    loadAvailability()
  }, [currentMonth, getAvailableSlots])

  // Load time slots for selected date
  useEffect(() => {
    if (selectedDate) {
      loadTimeSlots(selectedDate)
    }
  }, [selectedDate])

  const loadTimeSlots = async (date: Date) => {
    setLoadingSlots(true)
    try {
      const slots = await getAvailableSlots(date)
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Failed to load time slots:', error)
      setAvailableSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    onDateSelect(date)
    // Clear selected time when date changes
    if (selectedTime) {
      onTimeSelect('')
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1))
    setCurrentMonth(newMonth)
  }

  const isDateSelectable = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today && availabilityMap[date.toDateString()]
  }

  const isDateSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
    return `${mins}m`
  }

  const calendarDays = generateCalendarDays()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const availableSlotsByPeriod = {
    morning: availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 6 && hour < 12
    }),
    afternoon: availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 12 && hour < 17
    }),
    evening: availableSlots.filter(slot => {
      const hour = parseInt(slot.time.split(':')[0])
      return hour >= 17 && hour < 22
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Select Date & Time</h2>
        <p className="text-muted-foreground">
          Choose your preferred appointment date and time
        </p>
      </div>

      {/* Duration Info */}
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Your appointment will take approximately {formatDuration(totalDuration)}.
          Please ensure you have enough time in your schedule.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Choose Date</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('prev')}
                  disabled={currentMonth.getMonth() === today.getMonth()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-32 text-center font-medium">
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-2" />
                  }

                  const isSelectable = isDateSelectable(date)
                  const isSelected = isDateSelected(date)
                  const isPast = date < today
                  const hasAvailability = availabilityMap[date.toDateString()]

                  return (
                    <Button
                      key={date.toDateString()}
                      variant={isSelected ? "default" : "ghost"}
                      className={cn(
                        "h-10 w-10 p-0 font-normal",
                        isPast && "text-muted-foreground cursor-not-allowed",
                        !isSelectable && !isPast && "text-muted-foreground cursor-not-allowed",
                        isSelectable && !isSelected && "hover:bg-accent",
                        hasAvailability && !isSelected && "bg-green-50 text-green-700 hover:bg-green-100"
                      )}
                      disabled={!isSelectable}
                      onClick={() => isSelectable && handleDateSelect(date)}
                    >
                      {date.getDate()}
                    </Button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-muted rounded" />
                  <span>No availability</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-primary rounded" />
                  <span>Selected</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Times</CardTitle>
            <CardDescription>
              {selectedDate
                ? `Available appointments for ${selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}`
                : 'Select a date to see available times'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a date from the calendar to view available time slots
                </p>
              </div>
            ) : loadingSlots ? (
              <div className="space-y-4">
                {['Morning', 'Afternoon', 'Evening'].map((period) => (
                  <div key={period} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-8" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No available time slots for this date
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(availableSlotsByPeriod).map(([period, slots]) => {
                  if (slots.length === 0) return null

                  const periodLabels = {
                    morning: 'Morning',
                    afternoon: 'Afternoon',
                    evening: 'Evening'
                  }

                  return (
                    <div key={period} className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        {periodLabels[period as keyof typeof periodLabels]}
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant={selectedTime === slot.time ? "default" : "outline"}
                            size="sm"
                            className="justify-center"
                            disabled={!slot.isAvailable}
                            onClick={() => onTimeSelect(slot.time)}
                          >
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Summary */}
      {selectedDate && selectedTime && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Appointment Scheduled</div>
                <div className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })} at {selectedTime}
                </div>
              </div>
              <Badge variant="secondary">
                {formatDuration(totalDuration)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Button */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-muted-foreground">
          {selectedDate && selectedTime
            ? 'Date and time selected'
            : 'Please select both date and time'
          }
        </div>
        <Button
          onClick={onContinue}
          disabled={!selectedDate || !selectedTime}
          className="min-w-32"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}