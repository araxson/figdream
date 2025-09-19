'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, addDays, startOfDay, endOfDay, isSameDay, setHours, setMinutes } from 'date-fns'
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { checkAvailabilityAction, getStaffAppointmentsAction } from '../../actions/appointments'
import type { Database } from '@/types/database.types'

type Staff = Database['public']['Views']['profiles']['Row']
type Service = Database['public']['Views']['services']['Row']

interface TimeSlot {
  time: string
  date: Date
  available: boolean
  reason?: string
}

interface AvailabilityCheckerProps {
  staffList: Staff[]
  selectedStaffId?: string
  onStaffChange?: (staffId: string) => void
  selectedService?: Service
  serviceDuration?: number
  selectedDate?: Date
  onDateChange?: (date: Date) => void
  onSlotSelect?: (date: Date, time: string, staffId: string) => void
  showStaffSelector?: boolean
  daysToShow?: number
  startHour?: number
  endHour?: number
  slotInterval?: number
}

export function AvailabilityChecker({
  staffList,
  selectedStaffId,
  onStaffChange,
  selectedService,
  serviceDuration = 30,
  selectedDate = new Date(),
  onDateChange,
  onSlotSelect,
  showStaffSelector = true,
  daysToShow = 7,
  startHour = 9,
  endHour = 18,
  slotInterval = 30,
}: AvailabilityCheckerProps) {
  const [loading, setLoading] = useState(false)
  const [availabilityMap, setAvailabilityMap] = useState<Map<string, TimeSlot[]>>(new Map())
  const [selectedDateIndex, setSelectedDateIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Generate dates for the next N days
  const dates = Array.from({ length: daysToShow }, (_, i) => addDays(startOfDay(new Date()), i))

  // Generate time slots for a day
  const generateTimeSlots = useCallback((date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    const dayStart = setHours(setMinutes(date, 0), startHour)
    const dayEnd = setHours(setMinutes(date, 0), endHour)

    let current = dayStart
    while (current < dayEnd) {
      slots.push({
        time: format(current, 'HH:mm'),
        date: current,
        available: false,
      })
      current = new Date(current.getTime() + slotInterval * 60 * 1000)
    }

    return slots
  }, [startHour, endHour, slotInterval])

  // Check availability for all slots
  const checkAllAvailability = useCallback(async () => {
    if (!selectedStaffId) return

    setLoading(true)
    try {
      const newAvailabilityMap = new Map<string, TimeSlot[]>()

      // Get all appointments for the selected staff for the date range
      const startDate = dates[0]
      const endDate = endOfDay(dates[dates.length - 1])

      const appointmentsResponse = await getStaffAppointmentsAction(selectedStaffId, {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      const appointments = appointmentsResponse.success ? appointmentsResponse.data : []

      // Check each date
      for (const date of dates) {
        const slots = generateTimeSlots(date)

        // Check each slot
        for (const slot of slots) {
          const slotStart = slot.date
          const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60 * 1000)

          // Check if slot conflicts with any appointment
          const hasConflict = appointments.some(apt => {
            const aptStart = new Date(apt.start_time)
            const aptEnd = new Date(apt.end_time)

            return (
              (slotStart >= aptStart && slotStart < aptEnd) ||
              (slotEnd > aptStart && slotEnd <= aptEnd) ||
              (slotStart <= aptStart && slotEnd >= aptEnd)
            )
          })

          slot.available = !hasConflict
          if (hasConflict) {
            slot.reason = 'Already booked'
          }

          // Check if slot is in the past
          if (slot.date < new Date()) {
            slot.available = false
            slot.reason = 'Past time'
          }
        }

        newAvailabilityMap.set(format(date, 'yyyy-MM-dd'), slots)
      }

      setAvailabilityMap(newAvailabilityMap)
    } catch (error) {
      console.error('Failed to check availability:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedStaffId, dates, serviceDuration, generateTimeSlots])

  // Check availability when staff or service changes
  useEffect(() => {
    if (selectedStaffId) {
      checkAllAvailability()
    }
  }, [selectedStaffId, serviceDuration, checkAllAvailability])

  // Handle slot selection
  const handleSlotSelect = (date: Date, time: string) => {
    if (!selectedStaffId) return
    onSlotSelect?.(date, time, selectedStaffId)
  }

  // Navigate dates
  const navigateDates = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? Math.min(selectedDateIndex + 1, dates.length - 1)
      : Math.max(selectedDateIndex - 1, 0)

    setSelectedDateIndex(newIndex)
    onDateChange?.(dates[newIndex])
  }

  // Get availability stats
  const getAvailabilityStats = (dateKey: string) => {
    const slots = availabilityMap.get(dateKey) || []
    const availableCount = slots.filter(s => s.available).length
    const totalCount = slots.length

    return {
      availableCount,
      totalCount,
      percentage: totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0,
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Check Availability</CardTitle>
            <CardDescription>
              {selectedService
                ? `Available slots for ${selectedService.name} (${serviceDuration} min)`
                : 'Select a service to check available time slots'}
            </CardDescription>
          </div>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {showStaffSelector && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedStaffId} onValueChange={onStaffChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select a staff member" />
              </SelectTrigger>
              <SelectContent>
                {staffList.map((staff) => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.first_name} {staff.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        )}

        {!selectedStaffId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Select Staff Member</AlertTitle>
            <AlertDescription>
              Please select a staff member to check their availability
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-4">
            {/* Date selector */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDates('prev')}
                disabled={selectedDateIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <ScrollArea className="flex-1">
                <div className="flex gap-2">
                  {dates.map((date, index) => {
                    const dateKey = format(date, 'yyyy-MM-dd')
                    const stats = getAvailabilityStats(dateKey)
                    const isSelected = index === selectedDateIndex

                    return (
                      <button
                        key={dateKey}
                        onClick={() => {
                          setSelectedDateIndex(index)
                          onDateChange?.(date)
                        }}
                        className={cn(
                          "flex-shrink-0 p-3 rounded-lg border text-center transition-colors",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <div className="text-xs text-muted-foreground">
                          {format(date, 'EEE')}
                        </div>
                        <div className="text-lg font-semibold">
                          {format(date, 'd')}
                        </div>
                        <div className="text-xs">
                          {format(date, 'MMM')}
                        </div>
                        <Badge
                          variant={stats.availableCount > 0 ? "success" : "secondary"}
                          className="mt-1 text-xs"
                        >
                          {stats.availableCount}/{stats.totalCount}
                        </Badge>
                      </button>
                    )
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDates('next')}
                disabled={selectedDateIndex === dates.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Time slots grid */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {format(dates[selectedDateIndex], 'EEEE, MMMM d')}
                </CardTitle>
                <CardDescription>
                  Select an available time slot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {(availabilityMap.get(format(dates[selectedDateIndex], 'yyyy-MM-dd')) || []).map((slot) => (
                    <Button
                      key={slot.time}
                      variant={slot.available ? "outline" : "ghost"}
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => handleSlotSelect(slot.date, slot.time)}
                      className={cn(
                        "relative",
                        slot.available
                          ? "hover:bg-primary/10 hover:border-primary"
                          : "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {slot.time}
                      {!slot.available && (
                        <XCircle className="absolute -top-1 -right-1 h-3 w-3 text-destructive" />
                      )}
                    </Button>
                  ))}
                </div>
                {availabilityMap.get(format(dates[selectedDateIndex], 'yyyy-MM-dd'))?.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No slots available for this date
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-3">
            {dates.map((date) => {
              const dateKey = format(date, 'yyyy-MM-dd')
              const slots = availabilityMap.get(dateKey) || []
              const availableSlots = slots.filter(s => s.available)

              return (
                <Card key={dateKey}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {format(date, 'EEEE')}
                        </CardTitle>
                        <CardDescription>
                          {format(date, 'MMMM d, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge variant={availableSlots.length > 0 ? "success" : "secondary"}>
                        {availableSlots.length} available
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot.time}
                            variant="outline"
                            size="sm"
                            onClick={() => handleSlotSelect(slot.date, slot.time)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {slot.time}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No available slots for this date
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span>Past time</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}