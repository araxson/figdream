'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addMinutes, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns'

export interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
  conflictReason?: string
  price?: number
}

export interface TimeSlotPickerProps {
  staffId: string
  locationId: string
  selectedDate: Date
  serviceDurationMinutes: number
  className?: string
  onTimeSlotSelect?: (timeSlot: TimeSlot) => void
  selectedTimeSlot?: TimeSlot
  businessHours?: {
    start: string // "09:00"
    end: string   // "18:00"
  }
  excludeTimeSlots?: Array<{
    start_time: string
    end_time: string
  }>
  minAdvanceHours?: number // Minimum hours in advance for booking
  showPrice?: boolean
  disabled?: boolean
}

export function TimeSlotPicker({
  staffId,
  locationId,
  selectedDate,
  serviceDurationMinutes,
  className,
  onTimeSlotSelect,
  selectedTimeSlot,
  businessHours = { start: '09:00', end: '18:00' },
  excludeTimeSlots = [],
  minAdvanceHours = 1,
  showPrice = false,
  disabled = false
}: TimeSlotPickerProps) {
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [staffAvailability, setStaffAvailability] = React.useState<Array<{
    day_of_week: number
    start_time: string
    end_time: string
  }>>([])

  // Load staff availability
  const loadStaffAvailability = React.useCallback(async () => {
    if (!staffId) return

    try {
      const response = await fetch(`/api/staff/${staffId}/availability`)
      
      if (!response.ok) {
        throw new Error('Failed to load staff availability')
      }

      const data = await response.json()
      setStaffAvailability(data.availability || [])
    } catch (err) {
      console.error('Failed to load staff availability:', err)
      setStaffAvailability([])
    }
  }, [staffId])

  // Generate time slots based on availability and bookings
  const generateTimeSlots = React.useCallback(async () => {
    if (!staffId || !selectedDate) return

    setLoading(true)
    setError(null)

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const dayOfWeek = selectedDate.getDay()

      // Get staff availability for this day
      const dayAvailability = staffAvailability.filter(
        avail => avail.day_of_week === dayOfWeek
      )

      if (dayAvailability.length === 0) {
        setTimeSlots([])
        return
      }

      // Get existing bookings for this staff member and date
      const bookingsResponse = await fetch(
        `/api/bookings/staff/${staffId}?date=${dateStr}`
      )

      if (!bookingsResponse.ok) {
        throw new Error('Failed to load existing bookings')
      }

      const bookingsData = await bookingsResponse.json()
      const existingBookings = bookingsData.bookings || []

      const slots: TimeSlot[] = []

      // Generate slots for each availability period
      for (const availability of dayAvailability) {
        const availStart = new Date(`${dateStr}T${availability.start_time}`)
        const availEnd = new Date(`${dateStr}T${availability.end_time}`)

        // Respect business hours
        const businessStart = new Date(`${dateStr}T${businessHours.start}:00`)
        const businessEnd = new Date(`${dateStr}T${businessHours.end}:00`)

        const effectiveStart = isAfter(availStart, businessStart) ? availStart : businessStart
        const effectiveEnd = isBefore(availEnd, businessEnd) ? availEnd : businessEnd

        if (effectiveStart >= effectiveEnd) continue

        // Generate 30-minute intervals
        let slotStart = new Date(effectiveStart)
        
        // Round to nearest 30-minute interval
        const minutes = slotStart.getMinutes()
        if (minutes > 0 && minutes < 30) {
          slotStart.setMinutes(30)
        } else if (minutes > 30) {
          slotStart.setMinutes(60)
        }
        slotStart.setSeconds(0, 0)

        while (slotStart.getTime() + serviceDurationMinutes * 60000 <= effectiveEnd.getTime()) {
          const slotEnd = addMinutes(slotStart, serviceDurationMinutes)

          // Check if this is far enough in advance
          const now = new Date()
          const minBookingTime = addMinutes(now, minAdvanceHours * 60)
          const isPastMinAdvance = slotStart <= minBookingTime

          // Check for conflicts with existing bookings
          const hasConflict = existingBookings.some((booking: any) => {
            const bookingStart = new Date(`${dateStr}T${booking.start_time}`)
            const bookingEnd = new Date(`${dateStr}T${booking.end_time}`)
            
            return (slotStart < bookingEnd && slotEnd > bookingStart)
          })

          // Check for conflicts with excluded time slots
          const hasExcludedConflict = excludeTimeSlots.some(excluded => {
            const excludedStart = new Date(`${dateStr}T${excluded.start_time}`)
            const excludedEnd = new Date(`${dateStr}T${excluded.end_time}`)
            
            return (slotStart < excludedEnd && slotEnd > excludedStart)
          })

          let available = !hasConflict && !hasExcludedConflict && !isPastMinAdvance
          let conflictReason: string | undefined

          if (isPastMinAdvance) {
            conflictReason = `Must book at least ${minAdvanceHours} hour(s) in advance`
            available = false
          } else if (hasConflict) {
            conflictReason = 'Time slot already booked'
            available = false
          } else if (hasExcludedConflict) {
            conflictReason = 'Time slot unavailable'
            available = false
          }

          slots.push({
            start_time: format(slotStart, 'HH:mm:ss'),
            end_time: format(slotEnd, 'HH:mm:ss'),
            available,
            conflictReason
          })

          // Move to next 30-minute interval
          slotStart = addMinutes(slotStart, 30)
        }
      }

      setTimeSlots(slots)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate time slots')
      setTimeSlots([])
    } finally {
      setLoading(false)
    }
  }, [
    staffId, 
    selectedDate, 
    serviceDurationMinutes, 
    staffAvailability,
    businessHours,
    excludeTimeSlots,
    minAdvanceHours
  ])

  // Effects
  React.useEffect(() => {
    loadStaffAvailability()
  }, [loadStaffAvailability])

  React.useEffect(() => {
    if (staffAvailability.length > 0) {
      generateTimeSlots()
    }
  }, [generateTimeSlots, staffAvailability])

  // Handlers
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (disabled || !timeSlot.available) return
    
    onTimeSlotSelect?.(timeSlot)
  }

  const refreshTimeSlots = () => {
    generateTimeSlots()
  }

  // Group slots by time periods for better display
  const groupedSlots = React.useMemo(() => {
    const groups: Array<{ label: string; slots: TimeSlot[] }> = []
    
    if (timeSlots.length === 0) return groups

    const morning = timeSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0])
      return hour < 12
    })
    
    const afternoon = timeSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0])
      return hour >= 12 && hour < 17
    })
    
    const evening = timeSlots.filter(slot => {
      const hour = parseInt(slot.start_time.split(':')[0])
      return hour >= 17
    })

    if (morning.length > 0) groups.push({ label: 'Morning', slots: morning })
    if (afternoon.length > 0) groups.push({ label: 'Afternoon', slots: afternoon })
    if (evening.length > 0) groups.push({ label: 'Evening', slots: evening })

    return groups
  }, [timeSlots])

  const isTimeSlotSelected = (timeSlot: TimeSlot) => {
    return selectedTimeSlot?.start_time === timeSlot.start_time && 
           selectedTimeSlot?.end_time === timeSlot.end_time
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Select Time</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshTimeSlots}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
          <Badge variant="outline">
            {serviceDurationMinutes} min
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Available Times for {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Booked</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }, (_, j) => (
                      <Skeleton key={j} className="h-10" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No availability</h4>
              <p className="text-muted-foreground">
                No available time slots for the selected date. 
                {staffAvailability.filter(a => a.day_of_week === selectedDate.getDay()).length === 0 
                  ? ' Staff member is not available on this day.'
                  : ' Please try a different date.'}
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="space-y-6">
                {groupedSlots.map(group => (
                  <div key={group.label} className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">
                      {group.label}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {group.slots.map((slot, index) => (
                        <Button
                          key={`${slot.start_time}-${index}`}
                          variant={
                            isTimeSlotSelected(slot) ? "default" : 
                            slot.available ? "outline" : "secondary"
                          }
                          size="sm"
                          className={cn(
                            "h-12 flex flex-col items-center justify-center transition-all",
                            slot.available && !isTimeSlotSelected(slot) && "hover:border-primary",
                            !slot.available && "opacity-50 cursor-not-allowed",
                            isTimeSlotSelected(slot) && "ring-2 ring-primary ring-offset-2"
                          )}
                          onClick={() => handleTimeSlotSelect(slot)}
                          disabled={disabled || !slot.available}
                          title={slot.conflictReason}
                        >
                          <div className="flex items-center gap-1">
                            {isTimeSlotSelected(slot) && (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            <span className="text-xs font-medium">
                              {slot.start_time.slice(0, 5)}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {slot.end_time.slice(0, 5)}
                          </span>
                          {showPrice && slot.price && (
                            <span className="text-xs font-medium">
                              ${slot.price}
                            </span>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {selectedTimeSlot && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Selected Time</p>
                  <p className="text-sm text-muted-foreground">
                    {format(selectedDate, 'EEEE, MMMM d')} • {selectedTimeSlot.start_time.slice(0, 5)} - {selectedTimeSlot.end_time.slice(0, 5)}
                  </p>
                </div>
              </div>
              {showPrice && selectedTimeSlot.price && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">${selectedTimeSlot.price}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-100 border border-green-300" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-100 border border-blue-300" />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-100 border border-gray-300" />
          <span>Unavailable</span>
        </div>
      </div>
    </div>
  )
}