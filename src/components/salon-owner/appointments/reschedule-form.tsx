'use client'
import { useState, useEffect } from 'react'
import { Database } from '@/types/database.types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Calendar,
  Label,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
} from '@/components/ui'
import { toast } from 'sonner'
import { CalendarDays, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
type Appointment = Database['public']['Tables']['appointments']['Row']
interface RescheduleAppointmentFormProps {
  appointment: Appointment & {
    services?: Array<{
      id: string
      name: string
      duration: number
    }>
    staff_profiles?: {
      id: string
      display_name: string | null
    }
  }
  onReschedule?: (appointmentId: string, newDate: string, newTime: string) => Promise<void>
  trigger?: React.ReactNode
}
interface TimeSlot {
  time: string
  available: boolean
}
export default function RescheduleAppointmentForm({
  appointment,
  onReschedule,
  trigger
}: RescheduleAppointmentFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  // Load available time slots when date changes
  useEffect(() => {
    if (selectedDate && appointment.staff_id) {
      loadAvailableSlots()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])
  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointment.staff_id) return
    setIsLoadingSlots(true)
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      const serviceId = appointment.services?.[0]?.id
      const response = await fetch(
        `/api/availability?staff_id=${appointment.staff_id}&date=${dateStr}&service_id=${serviceId || ''}`
      )
      if (!response.ok) {
        throw new Error('Failed to load available slots')
      }
      const data = await response.json()
      setAvailableSlots(data.slots || [])
    } catch (_error) {
      // Fallback to generic slots
      const slots: TimeSlot[] = []
      for (let hour = 9; hour < 18; hour++) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:00:00`,
          available: true
        })
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:30:00`,
          available: true
        })
      }
      setAvailableSlots(slots)
    } finally {
      setIsLoadingSlots(false)
    }
  }
  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error('Please select both date and time')
      return
    }
    const newDate = format(selectedDate, 'yyyy-MM-dd')
    if (!onReschedule) {
      // Default reschedule logic
      try {
        setIsRescheduling(true)
        const response = await fetch(`/api/appointments/${appointment.id}/reschedule`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: newDate,
            start_time: selectedTime,
          }),
        })
        if (!response.ok) {
          throw new Error('Failed to reschedule appointment')
        }
        toast.success('Appointment rescheduled successfully')
        setIsOpen(false)
        // Refresh the page
        window.location.reload()
      } catch (_error) {
        toast.error('Failed to reschedule appointment. Please try again.')
      } finally {
        setIsRescheduling(false)
      }
    } else {
      // Use provided handler
      try {
        setIsRescheduling(true)
        await onReschedule(appointment.id, newDate, selectedTime)
        toast.success('Appointment rescheduled successfully')
        setIsOpen(false)
      } catch (_error) {
        toast.error('Failed to reschedule appointment. Please try again.')
      } finally {
        setIsRescheduling(false)
      }
    }
  }
  // Disable past dates and dates more than 60 days in future
  const disabledDays = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 60)
    return date < today || date > maxDate
  }
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <CalendarDays className="h-4 w-4 mr-1" />
            Reschedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Select a new date and time for your appointment
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 py-4">
          {/* Date Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Date</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Choose your preferred date
              </p>
            </div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              initialFocus
            />
          </div>
          {/* Time Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Select Time</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Available time slots for {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'selected date'}
              </p>
            </div>
            {selectedDate ? (
              isLoadingSlots ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : availableSlots.length > 0 ? (
                <ScrollArea className="h-64">
                  <RadioGroup value={selectedTime} onValueChange={setSelectedTime}>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <div key={slot.time} className="flex items-center">
                          <RadioGroupItem
                            value={slot.time}
                            id={slot.time}
                            disabled={!slot.available}
                            className="mr-2"
                          />
                          <Label
                            htmlFor={slot.time}
                            className={`text-sm cursor-pointer ${
                              !slot.available ? 'text-muted-foreground line-through' : ''
                            }`}
                          >
                            <Clock className="inline h-3 w-3 mr-1" />
                            {formatTime(slot.time)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No available slots for this date
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                Please select a date first
              </div>
            )}
          </div>
        </div>
        {/* Current Appointment Info */}
        <div className="bg-muted p-3 rounded-lg text-sm">
          <p className="font-medium mb-1">Current Appointment:</p>
          <p className="text-muted-foreground">
            {new Date(appointment.date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })} at {formatTime(appointment.start_time)}
            {appointment.staff_profiles && ` with ${appointment.staff_profiles.display_name}`}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isRescheduling}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={!selectedDate || !selectedTime || isRescheduling}
          >
            {isRescheduling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Rescheduling...
              </>
            ) : (
              'Confirm Reschedule'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}