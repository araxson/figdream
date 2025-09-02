'use client'

import * as React from 'react'
import {
  Calendar,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  ScrollArea,
  Separator,
  Skeleton,
  Alert,
  AlertDescription,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppointmentHoverCard } from '@/components/shared/hovers'
import type { Database } from '@/types/database.types'

type Booking = Database['public']['Tables']['bookings']['Row']
type BookingStatus = Database['public']['Enums']['booking_status']

export interface BookingCalendarProps {
  locationId: string
  staffId?: string
  className?: string
  onBookingSelect?: (booking: Booking) => void
  onDateSelect?: (date: Date) => void
  onTimeSlotSelect?: (date: Date, timeSlot: { start_time: string; end_time: string }) => void
  showCreateBooking?: boolean
  view?: 'month' | 'week' | 'day'
  defaultView?: 'month' | 'week' | 'day'
}

interface BookingWithDetails extends Booking {
  customer: {
    first_name: string
    last_name: string
    email: string
  } | null
  staff: {
    first_name: string
    last_name: string
  } | null
  services: Array<{
    name: string
    duration_minutes: number
  }>
}

interface TimeSlot {
  start_time: string
  end_time: string
  available: boolean
  booking?: BookingWithDetails
}

export function BookingCalendar({
  locationId,
  staffId,
  className,
  onBookingSelect,
  onDateSelect,
  onTimeSlotSelect,
  showCreateBooking = false,
  view = 'month',
  defaultView = 'month'
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const [currentView, setCurrentView] = React.useState<'month' | 'week' | 'day'>(view || defaultView)
  const [bookings, setBookings] = React.useState<BookingWithDetails[]>([])
  const [timeSlots, setTimeSlots] = React.useState<TimeSlot[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = React.useState<string>(staffId || '')
  const [availableStaff, setAvailableStaff] = React.useState<Array<{ id: string; first_name: string; last_name: string }>>([])

  // Load bookings for the selected date range
  const loadBookings = React.useCallback(async () => {
    if (!locationId) return

    setLoading(true)
    setError(null)

    try {
      const startDate = new Date(selectedDate)
      const endDate = new Date(selectedDate)

      // Adjust date range based on view
      if (currentView === 'month') {
        startDate.setDate(1)
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(0)
      } else if (currentView === 'week') {
        const dayOfWeek = startDate.getDay()
        startDate.setDate(startDate.getDate() - dayOfWeek)
        endDate.setDate(startDate.getDate() + 6)
      }

      const response = await fetch(`/api/bookings/location/${locationId}?` + new URLSearchParams({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        ...(selectedStaff && { staff_id: selectedStaff })
      }))

      if (!response.ok) {
        throw new Error('Failed to load bookings')
      }

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [locationId, selectedDate, currentView, selectedStaff])

  // Load time slots for day view
  const loadTimeSlots = React.useCallback(async () => {
    if (!locationId || currentView !== 'day' || !selectedStaff) return

    setLoading(true)
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      
      const response = await fetch(`/api/bookings/time-slots?` + new URLSearchParams({
        location_id: locationId,
        staff_id: selectedStaff,
        date: dateStr
      }))

      if (!response.ok) {
        throw new Error('Failed to load time slots')
      }

      const data = await response.json()
      setTimeSlots(data.timeSlots || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots')
    } finally {
      setLoading(false)
    }
  }, [locationId, selectedDate, selectedStaff, currentView])

  // Load available staff
  const loadAvailableStaff = React.useCallback(async () => {
    if (!locationId) return

    try {
      const response = await fetch(`/api/staff/location/${locationId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load staff')
      }

      const data = await response.json()
      setAvailableStaff(data.staff || [])
      
      // Set first staff as selected if none is selected
      if (!selectedStaff && data.staff?.length > 0) {
        setSelectedStaff(data.staff[0].id)
      }
    } catch (err) {
      console.error('Failed to load staff:', err)
    }
  }, [locationId, selectedStaff])

  // Effects
  React.useEffect(() => {
    loadBookings()
  }, [loadBookings])

  React.useEffect(() => {
    if (currentView === 'day') {
      loadTimeSlots()
    }
  }, [loadTimeSlots])

  React.useEffect(() => {
    loadAvailableStaff()
  }, [loadAvailableStaff])

  // Handlers
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    
    setSelectedDate(date)
    onDateSelect?.(date)
  }

  const handleBookingSelect = (booking: BookingWithDetails) => {
    onBookingSelect?.(booking)
  }

  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    if (!timeSlot.available) return
    
    onTimeSlotSelect?.(selectedDate, {
      start_time: timeSlot.start_time,
      end_time: timeSlot.end_time
    })
  }

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    setCurrentView(newView)
  }

  const handleStaffChange = (staffId: string) => {
    setSelectedStaff(staffId)
  }

  const refreshData = () => {
    loadBookings()
    if (currentView === 'day') {
      loadTimeSlots()
    }
  }

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return bookings.filter(booking => booking.booking_date === dateStr)
  }

  // Get status badge variant
  const getStatusVariant = (status: BookingStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'confirmed': return 'default'
      case 'pending': return 'secondary'
      case 'cancelled': return 'destructive'
      case 'completed': return 'outline'
      case 'no_show': return 'destructive'
      default: return 'secondary'
    }
  }

  // Render month view
  const renderMonthView = () => (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={handleDateSelect}
      className="rounded-md border"
      components={{
        Day: ({ date, ...props }) => {
          const dayBookings = getBookingsForDate(date)
          const hasBookings = dayBookings.length > 0
          
          return (
            <div className="relative">
              <button
                {...props}
                className={cn(
                  "h-9 w-9 p-0 font-normal hover:bg-accent hover:text-accent-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  date.toDateString() === selectedDate.toDateString() && "bg-primary text-primary-foreground",
                  hasBookings && "bg-blue-50 border-blue-200"
                )}
              >
                <span className={cn(hasBookings && "font-semibold")}>{date.getDate()}</span>
              </button>
              {hasBookings && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="flex gap-1">
                    {dayBookings.slice(0, 3).map((booking, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          booking.status === 'confirmed' && "bg-green-500",
                          booking.status === 'pending' && "bg-yellow-500",
                          booking.status === 'cancelled' && "bg-red-500",
                          booking.status === 'completed' && "bg-blue-500"
                        )}
                      />
                    ))}
                    {dayBookings.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        }
      }}
    />
  )

  // Render week view
  const renderWeekView = () => {
    const weekStart = new Date(selectedDate)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(weekStart)
      day.setDate(day.getDate() + i)
      return day
    })

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayBookings = getBookingsForDate(day)
          const isToday = day.toDateString() === new Date().toDateString()
          const isSelected = day.toDateString() === selectedDate.toDateString()
          
          return (
            <Card 
              key={day.toISOString()} 
              className={cn(
                "min-h-32 cursor-pointer transition-colors hover:bg-accent",
                isSelected && "ring-2 ring-primary",
                isToday && "border-primary"
              )}
              onClick={() => handleDateSelect(day)}
            >
              <CardHeader className="p-2 pb-1">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday && "text-primary font-semibold"
                  )}>
                    {day.getDate()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {day.toLocaleDateString('en', { weekday: 'short' })}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map(booking => (
                    <AppointmentHoverCard appointment={booking} key={booking.id}>
                      <div
                        className="text-xs p-1 rounded bg-background border cursor-pointer hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookingSelect(booking)
                        }}
                      >
                        <div className="font-medium truncate">
                          {booking.customer?.first_name} {booking.customer?.last_name}
                        </div>
                        <div className="text-muted-foreground">
                          {booking.start_time.slice(0, 5)}
                        </div>
                      </div>
                    </AppointmentHoverCard>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Render day view
  const renderDayView = () => (
    <div className="space-y-4">
      {/* Staff selector for day view */}
      {availableStaff.length > 1 && (
        <Select value={selectedStaff} onValueChange={handleStaffChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select staff member" />
          </SelectTrigger>
          <SelectContent>
            {availableStaff.map(staff => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.first_name} {staff.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Time slots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate.toLocaleDateString('en', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-8 w-8 mx-auto mb-2" />
                  <p>No availability for this date</p>
                </div>
              ) : (
                timeSlots.map((slot, index) => (
                  <Card
                    key={`${slot.start_time}-${index}`}
                    className={cn(
                      "cursor-pointer transition-colors",
                      slot.available 
                        ? "hover:bg-accent border-green-200 bg-green-50" 
                        : "bg-gray-50 border-gray-200 cursor-not-allowed"
                    )}
                    onClick={() => slot.available && handleTimeSlotSelect(slot)}
                  >
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                          </div>
                          {slot.booking && (
                            <div className="text-sm text-muted-foreground">
                              {slot.booking.customer?.first_name} {slot.booking.customer?.last_name}
                              <Badge 
                                variant={getStatusVariant(slot.booking.status)} 
                                className="ml-2"
                              >
                                {slot.booking.status}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <div>
                          {slot.available ? (
                            <Badge variant="outline" className="bg-green-100 text-green-700">
                              Available
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              Booked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with view controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(selectedDate)
              if (currentView === 'month') {
                newDate.setMonth(newDate.getMonth() - 1)
              } else if (currentView === 'week') {
                newDate.setDate(newDate.getDate() - 7)
              } else {
                newDate.setDate(newDate.getDate() - 1)
              }
              setSelectedDate(newDate)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold min-w-48 text-center">
            {currentView === 'month' && selectedDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            {currentView === 'week' && `Week of ${selectedDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`}
            {currentView === 'day' && selectedDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const newDate = new Date(selectedDate)
              if (currentView === 'month') {
                newDate.setMonth(newDate.getMonth() + 1)
              } else if (currentView === 'week') {
                newDate.setDate(newDate.getDate() + 7)
              } else {
                newDate.setDate(newDate.getDate() + 1)
              }
              setSelectedDate(newDate)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>

          <Tabs value={currentView} onValueChange={handleViewChange as any}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Calendar content based on view */}
      <div className="min-h-96">
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView()}
      </div>

      {/* Selected date bookings for month/week view */}
      {(currentView === 'month' || currentView === 'week') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Bookings for {selectedDate.toLocaleDateString('en', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {getBookingsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2" />
                      <p>No bookings for this date</p>
                    </div>
                  ) : (
                    getBookingsForDate(selectedDate).map(booking => (
                      <Card
                        key={booking.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleBookingSelect(booking)}
                      >
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {booking.customer?.first_name} {booking.customer?.last_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                                {booking.staff && ` • ${booking.staff.first_name} ${booking.staff.last_name}`}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {booking.services.map(s => s.name).join(', ')}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusVariant(booking.status)}>
                                {booking.status}
                              </Badge>
                              <span className="font-medium">${booking.total_price}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}