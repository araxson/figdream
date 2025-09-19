'use client'

import { useState, useCallback, useMemo } from 'react'
import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, DollarSign, AlertCircle, MoreHorizontal, Eye, Edit, X, Check, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { AppointmentWithRelations, AppointmentStatus } from '../types'

type ViewMode = 'day' | 'week' | 'month'

interface CalendarEnhancedProps {
  appointments: AppointmentWithRelations[]
  selectedDate: Date
  onDateChange: (date: Date) => void
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void
  onAppointmentReschedule?: (appointment: AppointmentWithRelations, newDate: Date, newTime: string) => void
  onTimeSlotClick?: (date: Date, time: string) => void
  staffMembers?: Array<{ id: string; name: string; avatar?: string }>
  selectedStaffId?: string
  onStaffChange?: (staffId: string | 'all') => void
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  showStaffFilter?: boolean
  enableDragDrop?: boolean
}

const statusColors: Record<AppointmentStatus, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-gray-500',
  no_show: 'bg-red-500',
  rescheduled: 'bg-orange-500',
}

const statusIcons: Record<AppointmentStatus, React.ReactNode> = {
  pending: <Clock className="h-3 w-3" />,
  confirmed: <Check className="h-3 w-3" />,
  completed: <CheckCircle className="h-3 w-3" />,
  cancelled: <X className="h-3 w-3" />,
  no_show: <AlertCircle className="h-3 w-3" />,
  rescheduled: <Calendar className="h-3 w-3" />,
}

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0')
  return `${hour}:00`
})

export function CalendarEnhanced({
  appointments,
  selectedDate,
  onDateChange,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  onAppointmentReschedule,
  onTimeSlotClick,
  staffMembers = [],
  selectedStaffId,
  onStaffChange,
  viewMode = 'week',
  onViewModeChange,
  showStaffFilter = true,
  enableDragDrop = true,
}: CalendarEnhancedProps) {
  const [draggedAppointment, setDraggedAppointment] = useState<AppointmentWithRelations | null>(null)
  const [dropTarget, setDropTarget] = useState<{ date: Date; time: string } | null>(null)

  // Filter appointments by staff
  const filteredAppointments = useMemo(() => {
    if (!selectedStaffId || selectedStaffId === 'all') return appointments
    return appointments.filter(apt => apt.staff_id === selectedStaffId)
  }, [appointments, selectedStaffId])

  // Get appointments for a specific date and time
  const getAppointmentsForSlot = useCallback((date: Date, hour: number) => {
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.start_time)
      return isSameDay(aptDate, date) && aptDate.getHours() === hour
    })
  }, [filteredAppointments])

  // Get appointments for a specific date
  const getAppointmentsForDay = useCallback((date: Date) => {
    return filteredAppointments.filter(apt => {
      const aptDate = new Date(apt.start_time)
      return isSameDay(aptDate, date)
    })
  }, [filteredAppointments])

  // Navigate dates
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    const amount = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 1
    const unit = viewMode === 'month' ? 'month' : 'day'

    if (unit === 'month') {
      onDateChange(direction === 'next' ? addMonths(selectedDate, 1) : subMonths(selectedDate, 1))
    } else {
      onDateChange(direction === 'next' ? addDays(selectedDate, amount) : addDays(selectedDate, -amount))
    }
  }, [selectedDate, viewMode, onDateChange])

  // Get dates for current view
  const viewDates = useMemo(() => {
    if (viewMode === 'day') {
      return [selectedDate]
    } else if (viewMode === 'week') {
      const start = startOfWeek(selectedDate)
      return Array.from({ length: 7 }, (_, i) => addDays(start, i))
    } else {
      const start = startOfMonth(selectedDate)
      const end = endOfMonth(selectedDate)
      const dates = []
      let current = start
      while (current <= end) {
        dates.push(current)
        current = addDays(current, 1)
      }
      return dates
    }
  }, [selectedDate, viewMode])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, appointment: AppointmentWithRelations) => {
    if (!enableDragDrop) return
    setDraggedAppointment(appointment)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, date: Date, time: string) => {
    if (!enableDragDrop || !draggedAppointment) return
    e.preventDefault()
    setDropTarget({ date, time })
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, date: Date, time: string) => {
    e.preventDefault()
    if (!enableDragDrop || !draggedAppointment) return

    onAppointmentReschedule?.(draggedAppointment, date, time)
    setDraggedAppointment(null)
    setDropTarget(null)
  }

  // Render appointment card
  const renderAppointmentCard = (appointment: AppointmentWithRelations) => {
    const startTime = new Date(appointment.start_time)
    const endTime = new Date(appointment.end_time)
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    return (
      <div
        key={appointment.id}
        className={cn(
          "group relative p-2 rounded-md border cursor-pointer transition-all",
          "hover:shadow-md hover:z-10",
          statusColors[appointment.status as AppointmentStatus],
          "bg-opacity-10 border-opacity-50"
        )}
        draggable={enableDragDrop}
        onDragStart={(e) => handleDragStart(e, appointment)}
        onClick={() => onAppointmentClick?.(appointment)}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              {statusIcons[appointment.status as AppointmentStatus]}
              <span className="text-xs font-medium truncate">
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </span>
            </div>
            <p className="text-xs font-medium truncate">
              {appointment.customer?.first_name} {appointment.customer?.last_name}
            </p>
            {appointment.services && appointment.services.length > 0 && (
              <p className="text-xs text-muted-foreground truncate">
                {appointment.services[0].service_name}
                {appointment.services.length > 1 && ` +${appointment.services.length - 1}`}
              </p>
            )}
            {appointment.staff && (
              <p className="text-xs text-muted-foreground truncate">
                {appointment.staff.first_name} {appointment.staff.last_name}
              </p>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAppointmentClick?.(appointment)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAppointmentEdit?.(appointment)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onAppointmentCancel?.(appointment)}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  // Render day view
  const renderDayView = () => (
    <div className="border rounded-lg">
      <div className="grid grid-cols-[80px_1fr] divide-x">
        <div className="p-4 font-medium text-center bg-muted">
          {format(selectedDate, 'EEE')}
          <div className="text-2xl">{format(selectedDate, 'd')}</div>
        </div>
        <ScrollArea className="h-[600px]">
          <div className="divide-y">
            {timeSlots.map((time) => {
              const hour = parseInt(time.split(':')[0])
              const slotAppointments = getAppointmentsForSlot(selectedDate, hour)
              const isDropTarget = dropTarget?.date === selectedDate && dropTarget?.time === time

              return (
                <div
                  key={time}
                  className={cn(
                    "grid grid-cols-[80px_1fr] divide-x hover:bg-muted/50 transition-colors",
                    isDropTarget && "bg-primary/10"
                  )}
                  onDragOver={(e) => handleDragOver(e, selectedDate, time)}
                  onDrop={(e) => handleDrop(e, selectedDate, time)}
                >
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {time}
                  </div>
                  <div
                    className="p-2 min-h-[60px] cursor-pointer"
                    onClick={() => onTimeSlotClick?.(selectedDate, time)}
                  >
                    <div className="space-y-1">
                      {slotAppointments.map(renderAppointmentCard)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )

  // Render week view
  const renderWeekView = () => (
    <div className="border rounded-lg">
      <div className="grid grid-cols-8 divide-x">
        <div className="p-2 bg-muted"></div>
        {viewDates.map((date) => (
          <div
            key={date.toISOString()}
            className={cn(
              "p-2 text-center font-medium bg-muted",
              isToday(date) && "bg-primary/10"
            )}
          >
            <div className="text-sm">{format(date, 'EEE')}</div>
            <div className={cn(
              "text-lg",
              isToday(date) && "font-bold"
            )}>
              {format(date, 'd')}
            </div>
          </div>
        ))}
      </div>
      <ScrollArea className="h-[600px]">
        <div className="divide-y">
          {timeSlots.map((time) => {
            const hour = parseInt(time.split(':')[0])

            return (
              <div key={time} className="grid grid-cols-8 divide-x">
                <div className="p-2 text-sm text-muted-foreground text-center bg-muted/50">
                  {time}
                </div>
                {viewDates.map((date) => {
                  const slotAppointments = getAppointmentsForSlot(date, hour)
                  const isDropTarget = dropTarget?.date === date && dropTarget?.time === time

                  return (
                    <div
                      key={date.toISOString()}
                      className={cn(
                        "p-1 min-h-[60px] hover:bg-muted/50 transition-colors cursor-pointer",
                        isDropTarget && "bg-primary/10"
                      )}
                      onDragOver={(e) => handleDragOver(e, date, time)}
                      onDrop={(e) => handleDrop(e, date, time)}
                      onClick={() => onTimeSlotClick?.(date, time)}
                    >
                      <div className="space-y-1">
                        {slotAppointments.slice(0, 2).map(renderAppointmentCard)}
                        {slotAppointments.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{slotAppointments.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  // Render month view
  const renderMonthView = () => {
    const weeks: Date[][] = []
    let currentWeek: Date[] = []
    const startDate = startOfWeek(startOfMonth(selectedDate))
    const endDate = endOfWeek(endOfMonth(selectedDate))
    let current = startDate

    while (current <= endDate) {
      currentWeek.push(current)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
      current = addDays(current, 1)
    }

    return (
      <div className="border rounded-lg">
        <div className="grid grid-cols-7 divide-x">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center font-medium bg-muted text-sm">
              {day}
            </div>
          ))}
        </div>
        <div className="divide-y">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 divide-x">
              {week.map((date) => {
                const dayAppointments = getAppointmentsForDay(date)
                const isCurrentMonth = isSameMonth(date, selectedDate)

                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "p-2 min-h-[100px] cursor-pointer hover:bg-muted/50 transition-colors",
                      !isCurrentMonth && "bg-gray-50 dark:bg-gray-900",
                      isToday(date) && "bg-primary/5"
                    )}
                    onClick={() => {
                      onDateChange(date)
                      onViewModeChange?.('day')
                    }}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      !isCurrentMonth && "text-muted-foreground",
                      isToday(date) && "text-primary"
                    )}>
                      {format(date, 'd')}
                    </div>
                    {dayAppointments.length > 0 && (
                      <div className="space-y-1">
                        {dayAppointments.slice(0, 3).map((apt) => (
                          <div
                            key={apt.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              statusColors[apt.status as AppointmentStatus],
                              "bg-opacity-20"
                            )}
                          >
                            {format(new Date(apt.start_time), 'HH:mm')} {apt.customer?.last_name}
                          </div>
                        ))}
                        {dayAppointments.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{dayAppointments.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Appointment Calendar</CardTitle>
            <Tabs value={viewMode} onValueChange={(v) => onViewModeChange?.(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex items-center gap-2">
            {showStaffFilter && staffMembers.length > 0 && (
              <Select value={selectedStaffId || 'all'} onValueChange={onStaffChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Staff</SelectItem>
                  {staffMembers.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={staff.avatar} />
                          <AvatarFallback>
                            {staff.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {staff.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDateChange(new Date())}
            >
              Today
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[150px] text-center font-medium">
                {viewMode === 'day' && format(selectedDate, 'MMMM d, yyyy')}
                {viewMode === 'week' && `${format(viewDates[0], 'MMM d')} - ${format(viewDates[viewDates.length - 1], 'MMM d, yyyy')}`}
                {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateDate('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <CardDescription>
          {filteredAppointments.length} appointments scheduled
        </CardDescription>
      </CardHeader>

      <CardContent>
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-6">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded", color, "bg-opacity-50")} />
                <span className="capitalize text-muted-foreground">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}