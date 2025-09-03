"use client"
import { useState, useEffect } from "react"

import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays, addWeeks, subWeeks } from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, MapPin, AlertCircle } from "lucide-react"
import type { Database } from "@/types/database.types"
import { Badge, Button, Calendar, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
type Schedule = Database["public"]["Tables"]["staff_schedules"]["Row"]
type Appointment = Database["public"]["Tables"]["appointments"]["Row"]
type TimeOff = Database["public"]["Tables"]["time_off_requests"]["Row"]
interface ScheduleCalendarProps {
  staffId: string
  locationId?: string
  canEdit?: boolean
}
interface TimeSlot {
  id: string
  start: Date
  end: Date
  type: "appointment" | "break" | "time-off"
  title: string
  description?: string
  location?: string
  customerName?: string
  serviceName?: string
  status?: string
}
export function ScheduleCalendar({ staffId, locationId, canEdit = false }: ScheduleCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [view, setView] = useState<"day" | "week" | "month">("week")
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOff[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [draggedSlot, setDraggedSlot] = useState<TimeSlot | null>(null)
  useEffect(() => {
    fetchScheduleData()
  }, [staffId, currentWeek, view])
  const fetchScheduleData = async () => {
    setLoading(true)
    try {
      const weekStart = startOfWeek(currentWeek)
      const weekEnd = endOfWeek(currentWeek)
      // Fetch schedules, appointments, and time-off requests
      const [schedulesRes, appointmentsRes, timeOffRes] = await Promise.all([
        fetch(`/api/staff/schedules?staffId=${staffId}&start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`),
        fetch(`/api/appointments?staffId=${staffId}&start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`),
        fetch(`/api/time-off?staffId=${staffId}&start=${weekStart.toISOString()}&end=${weekEnd.toISOString()}`),
      ])
      if (schedulesRes.ok && appointmentsRes.ok && timeOffRes.ok) {
        setSchedules(await schedulesRes.json())
        setAppointments(await appointmentsRes.json())
        setTimeOffRequests(await timeOffRes.json())
      }
    } catch (error) {
      console.error("Failed to fetch schedule data:", error)
    } finally {
      setLoading(false)
    }
  }
  const handlePreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1))
  }
  const handleNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1))
  }
  const handleToday = () => {
    setCurrentWeek(new Date())
    setSelectedDate(new Date())
  }
  const handleSlotDragStart = (slot: TimeSlot) => {
    if (!canEdit) return
    setDraggedSlot(slot)
  }
  const handleSlotDragEnd = () => {
    setDraggedSlot(null)
  }
  const handleSlotDrop = async (date: Date, hour: number) => {
    if (!draggedSlot || !canEdit) return
    try {
      // Update the appointment or schedule time
      const response = await fetch(`/api/appointments/${draggedSlot.id}/reschedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newDate: date.toISOString(),
          newTime: `${hour.toString().padStart(2, "0")}:00`,
        }),
      })
      if (response.ok) {
        await fetchScheduleData()
      }
    } catch (error) {
      console.error("Failed to reschedule:", error)
    } finally {
      setDraggedSlot(null)
    }
  }
  const getTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = []
    // Add appointments
    appointments
      .filter(apt => isSameDay(new Date(apt.start_time), date))
      .forEach(apt => {
        slots.push({
          id: apt.id,
          start: new Date(apt.start_time),
          end: new Date(apt.end_time),
          type: "appointment",
          title: apt.service_name || "Appointment",
          customerName: apt.customer_name || undefined,
          serviceName: apt.service_name || undefined,
          location: apt.location_name || undefined,
          status: apt.status,
        })
      })
    // Add time-off
    timeOffRequests
      .filter(to => {
        const start = new Date(to.start_date)
        const end = new Date(to.end_date)
        return date >= start && date <= end && to.status === "approved"
      })
      .forEach(to => {
        slots.push({
          id: to.id,
          start: new Date(`${format(date, "yyyy-MM-dd")}T09:00:00`),
          end: new Date(`${format(date, "yyyy-MM-dd")}T17:00:00`),
          type: "time-off",
          title: "Time Off",
          description: to.reason || undefined,
        })
      })
    return slots.sort((a, b) => a.start.getTime() - b.start.getTime())
  }
  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek),
    end: endOfWeek(currentWeek),
  })
  const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM
  const getSlotColor = (type: TimeSlot["type"], status?: string) => {
    if (status === "cancelled") return "bg-gray-100 dark:bg-gray-800 text-gray-600"
    switch (type) {
      case "appointment":
        return "bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100 border-blue-200"
      case "break":
        return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-900 dark:text-yellow-100 border-yellow-200"
      case "time-off":
        return "bg-red-100 dark:bg-red-900/50 text-red-900 dark:text-red-100 border-red-200"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Schedule Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={view} onValueChange={(v) => setView(v as typeof view)}>
                <TabsList>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "week" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePreviousWeek}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNextWeek}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToday}
                  >
                    Today
                  </Button>
                </div>
                <h3 className="font-medium">
                  {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
                </h3>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-8 border-b bg-muted/50">
                  <div className="p-2 text-xs font-medium text-muted-foreground">
                    Time
                  </div>
                  {weekDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`p-2 text-center border-l ${
                        isSameDay(day, new Date()) ? "bg-primary/10" : ""
                      }`}
                    >
                      <div className="text-xs font-medium text-muted-foreground">
                        {format(day, "EEE")}
                      </div>
                      <div className={`text-lg font-semibold ${
                        isSameDay(day, new Date()) ? "text-primary" : ""
                      }`}>
                        {format(day, "d")}
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollArea className="h-[600px]">
                  {hours.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="p-2 text-xs text-muted-foreground">
                        {format(new Date().setHours(hour, 0), "h:mm a")}
                      </div>
                      {weekDays.map((day) => {
                        const slots = getTimeSlots(day).filter(
                          (slot) => slot.start.getHours() === hour
                        )
                        return (
                          <div
                            key={`${day.toISOString()}-${hour}`}
                            className="relative p-1 border-l min-h-[60px]"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleSlotDrop(day, hour)}
                          >
                            {slots.map((slot) => (
                              <div
                                key={slot.id}
                                draggable={canEdit && slot.type === "appointment"}
                                onDragStart={() => handleSlotDragStart(slot)}
                                onDragEnd={handleSlotDragEnd}
                                onClick={() => setSelectedSlot(slot)}
                                className={`absolute inset-x-1 p-1 rounded cursor-pointer transition-colors hover:opacity-90 ${getSlotColor(
                                  slot.type,
                                  slot.status
                                )} ${draggedSlot?.id === slot.id ? "opacity-50" : ""}`}
                                style={{
                                  top: `${(slot.start.getMinutes() / 60) * 100}%`,
                                  height: `${
                                    ((slot.end.getTime() - slot.start.getTime()) /
                                      (1000 * 60 * 60)) *
                                    100
                                  }%`,
                                }}
                              >
                                <div className="text-xs font-medium truncate">
                                  {slot.title}
                                </div>
                                {slot.customerName && (
                                  <div className="text-xs truncate opacity-75">
                                    {slot.customerName}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </ScrollArea>
              </div>
            </>
          )}
          {view === "month" && (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasAppointments: (date) => getTimeSlots(date).length > 0,
              }}
              modifiersStyles={{
                hasAppointments: {
                  fontWeight: "bold",
                  textDecoration: "underline",
                },
              }}
            />
          )}
          {view === "day" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                  >
                    Previous Day
                  </Button>
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
                    onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                  >
                    Next Day
                  </Button>
                </div>
              </div>
              <ScrollArea className="h-[600px] border rounded-lg p-4">
                <div className="space-y-2">
                  {getTimeSlots(selectedDate).length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No appointments scheduled for this day</p>
                    </div>
                  ) : (
                    getTimeSlots(selectedDate).map((slot) => (
                      <Card
                        key={slot.id}
                        className={`cursor-pointer ${
                          slot.status === "cancelled" ? "opacity-50" : ""
                        }`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {format(slot.start, "h:mm a")} - {format(slot.end, "h:mm a")}
                                </span>
                                <Badge variant={slot.type === "appointment" ? "default" : "secondary"}>
                                  {slot.type}
                                </Badge>
                              </div>
                              <p className="font-medium">{slot.title}</p>
                              {slot.customerName && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {slot.customerName}
                                </div>
                              )}
                              {slot.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {slot.location}
                                </div>
                              )}
                            </div>
                            {slot.status === "cancelled" && (
                              <Badge variant="destructive">Cancelled</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSlot?.title}</DialogTitle>
            <DialogDescription>
              {selectedSlot && format(selectedSlot.start, "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(selectedSlot.start, "h:mm a")} - {format(selectedSlot.end, "h:mm a")}
                  </span>
                </div>
                {selectedSlot.customerName && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSlot.customerName}</span>
                  </div>
                )}
                {selectedSlot.serviceName && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSlot.serviceName}</span>
                  </div>
                )}
                {selectedSlot.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedSlot.location}</span>
                  </div>
                )}
                {selectedSlot.description && (
                  <p className="text-sm text-muted-foreground">
                    {selectedSlot.description}
                  </p>
                )}
              </div>
              {canEdit && selectedSlot.type === "appointment" && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline">Reschedule</Button>
                  <Button variant="destructive">Cancel</Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
