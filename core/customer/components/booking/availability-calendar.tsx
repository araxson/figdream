'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { CalendarHeader } from './calendar-header'
import { TimeSlotGrid } from './time-slot-grid'
import { StaffAvailabilityDisplay } from './staff-availability-display'
import { CalendarConflicts } from './calendar-conflicts'
import { useCalendarLogic } from '../hooks/use-calendar-logic'
import type { Service, StaffProfile } from '../types'

interface AvailabilityCalendarProps {
  salonId: string
  services?: Service[]
  staff?: StaffProfile[]
  onSlotSelect?: (date: Date, time: string, staffId?: string) => void
  onServiceSelect?: (service: Service | undefined) => void
  onStaffSelect?: (staff: StaffProfile | undefined) => void
  initialDate?: Date
  className?: string
}

export function AvailabilityCalendar({
  salonId,
  services = [],
  staff = [],
  onSlotSelect,
  onServiceSelect,
  onStaffSelect,
  initialDate,
  className
}: AvailabilityCalendarProps) {
  const [view, setView] = useState<'day' | 'week' | 'calendar' | 'staff'>('day')

  const {
    selectedDate,
    loading,
    error,
    availability,
    staffAvailability,
    conflicts,
    selectedService,
    selectedStaff,
    selectedTime,
    setSelectedDate,
    loadAvailability,
    handleSlotSelect,
    getAvailabilityForDate,
    handleServiceSelect,
    handleStaffSelect,
    resolveConflict
  } = useCalendarLogic({
    salonId,
    initialDate,
    onSlotSelect
  })

  // Handle service selection with external callback
  const onServiceChange = (service: Service | undefined) => {
    handleServiceSelect(service)
    onServiceSelect?.(service)
  }

  // Handle staff selection with external callback
  const onStaffChange = (staffMember: StaffProfile | undefined) => {
    handleStaffSelect(staffMember)
    onStaffSelect?.(staffMember)
  }

  // Handle alternative selection from conflicts
  const handleAlternativeSelect = (date: Date, time: string, staffId?: string) => {
    setSelectedDate(date)
    handleSlotSelect(date, time, staffId)
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const renderDayView = () => {
    const dayAvailability = getAvailabilityForDate(selectedDate)

    return (
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 18 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : (
            <TimeSlotGrid
              date={selectedDate}
              availability={dayAvailability}
              onSlotSelect={handleSlotSelect}
              selectedTime={selectedTime}
              selectedStaffId={selectedStaff?.id}
            />
          )}
        </CardContent>
      </Card>
    )
  }

  const renderWeekView = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    const weekStart = new Date(selectedDate)
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay())

    return (
      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 7 }).map((_, i) => {
          const date = new Date(weekStart)
          date.setDate(weekStart.getDate() + i)
          const dayAvailability = getAvailabilityForDate(date)

          return (
            <Card
              key={i}
              className={`cursor-pointer transition-colors ${
                date.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedDate(date)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-sm font-medium mb-2">
                  {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                </div>
                {dayAvailability ? (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {dayAvailability.availableCount} available
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground">No data</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const renderCalendarView = () => {
    return (
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) =>
              date < new Date() ||
              date > new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
            }
            className="rounded-md border w-full"
            modifiers={{
              booked: availability
                .filter(d => d.isFullyBooked)
                .map(d => d.date)
            }}
            modifiersStyles={{
              booked: {
                backgroundColor: 'hsl(var(--destructive))',
                color: 'hsl(var(--destructive-foreground))'
              }
            }}
          />
        </CardContent>
      </Card>
    )
  }

  const renderStaffView = () => {
    return (
      <Card>
        <CardContent className="p-6">
          <StaffAvailabilityDisplay
            staffAvailability={staffAvailability}
            selectedDate={selectedDate}
            onStaffSelect={handleStaffSelect}
            selectedStaffId={selectedStaff?.id}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <CalendarHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        services={services}
        staff={staff}
        selectedService={selectedService}
        selectedStaff={selectedStaff}
        onServiceSelect={onServiceChange}
        onStaffSelect={onStaffChange}
        view={view}
        onViewChange={setView}
        isLoading={loading}
        onRefresh={loadAvailability}
      />

      <Tabs value={view} onValueChange={setView as (value: string) => void}>
        <TabsContent value="day">
          {renderDayView()}
        </TabsContent>

        <TabsContent value="week">
          {renderWeekView()}
        </TabsContent>

        <TabsContent value="calendar">
          {renderCalendarView()}
        </TabsContent>

        <TabsContent value="staff">
          {renderStaffView()}
        </TabsContent>
      </Tabs>

      {conflicts.length > 0 && (
        <CalendarConflicts
          conflicts={conflicts}
          onResolveConflict={resolveConflict}
          onAlternativeSelect={handleAlternativeSelect}
        />
      )}
    </div>
  )
}