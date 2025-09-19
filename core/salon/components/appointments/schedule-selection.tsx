'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CalendarIcon, Clock, User, AlertCircle, Check } from 'lucide-react'
import { format } from 'date-fns'
import { UseFormReturn } from 'react-hook-form'
import { cn } from '@/lib/utils'
import type { Database } from '@/types/database.types'

type Staff = Database['public']['Views']['profiles']['Row']
type FormValues = {
  customer_id: string
  services: string[]
  date: Date
  time: string
  staff_id: string
  payment_method: 'cash' | 'card' | 'online'
  notes?: string
}

interface ScheduleSelectionProps {
  form: UseFormReturn<FormValues>
  staff: Staff[]
  loading?: boolean
  onCheckAvailability?: (date: Date, time: string, staffId: string) => Promise<boolean>
}

export function ScheduleSelection({
  form,
  staff = [],
  loading = false,
  onCheckAvailability
}: ScheduleSelectionProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'unavailable'>('idle')

  const selectedDate = form.watch('date')
  const selectedTime = form.watch('time')
  const selectedStaffId = form.watch('staff_id')
  const selectedStaff = staff.find(s => s.id === selectedStaffId)

  // Generate time slots
  const generateTimeSlots = (): string[] => {
    const slots: string[] = []
    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        slots.push(time)
      }
    }
    return slots
  }

  // Check availability when date or staff changes
  useEffect(() => {
    const checkSlotAvailability = async () => {
      if (!selectedDate || !selectedStaffId || !onCheckAvailability) {
        setAvailableSlots([])
        return
      }

      setCheckingAvailability(true)
      const slots = generateTimeSlots()
      const available: string[] = []

      for (const slot of slots) {
        try {
          const isAvailable = await onCheckAvailability(selectedDate, slot, selectedStaffId)
          if (isAvailable) {
            available.push(slot)
          }
        } catch (error) {
          // Slot not available
        }
      }

      setAvailableSlots(available)
      setCheckingAvailability(false)
    }

    checkSlotAvailability()
  }, [selectedDate, selectedStaffId, onCheckAvailability])

  // Check specific slot availability
  useEffect(() => {
    const checkSelectedSlot = async () => {
      if (!selectedDate || !selectedTime || !selectedStaffId || !onCheckAvailability) {
        setAvailabilityStatus('idle')
        return
      }

      try {
        const isAvailable = await onCheckAvailability(selectedDate, selectedTime, selectedStaffId)
        setAvailabilityStatus(isAvailable ? 'available' : 'unavailable')
      } catch (error) {
        setAvailabilityStatus('unavailable')
      }
    }

    if (selectedTime && availableSlots.length > 0) {
      checkSelectedSlot()
    }
  }, [selectedDate, selectedTime, selectedStaffId, availableSlots, onCheckAvailability])

  const isSlotAvailable = (slot: string) => {
    return availableSlots.includes(slot)
  }

  const getAvailabilityIcon = () => {
    switch (availabilityStatus) {
      case 'available':
        return <Check className="h-4 w-4 text-green-500" />
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Schedule & Staff
        </CardTitle>
        <CardDescription>
          Select date, time, and staff member for the appointment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                        disabled={loading}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date > new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="staff_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Staff Member</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{member.full_name}</span>
                          {member.role && (
                            <Badge variant="outline" className="text-xs">
                              {member.role}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedStaff && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 rounded-full bg-primary/10 p-2" />
                <div>
                  <div className="font-medium">{selectedStaff.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedStaff.role} • {selectedStaff.email}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="time"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                Time
                {checkingAvailability && (
                  <Badge variant="outline" className="text-xs">
                    Checking availability...
                  </Badge>
                )}
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-4 gap-2">
                  {generateTimeSlots().map((slot) => {
                    const isSelected = field.value === slot
                    const isAvailable = isSlotAvailable(slot)
                    const isDisabled = !isAvailable || loading || checkingAvailability

                    return (
                      <Button
                        key={slot}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'relative',
                          isDisabled && 'opacity-50 cursor-not-allowed',
                          !isAvailable && !checkingAvailability && 'text-muted-foreground'
                        )}
                        disabled={isDisabled}
                        onClick={() => field.onChange(slot)}
                      >
                        {slot}
                        {!isAvailable && !checkingAvailability && (
                          <div className="absolute inset-0 bg-red-500/10" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedTime && selectedDate && selectedStaff && (
          <Alert className={cn(
            availabilityStatus === 'available' && 'border-green-200 bg-green-50',
            availabilityStatus === 'unavailable' && 'border-red-200 bg-red-50'
          )}>
            <div className="flex items-center gap-2">
              {getAvailabilityIcon()}
              <AlertDescription>
                {availabilityStatus === 'available' && (
                  <span className="text-green-700">
                    ✓ Time slot is available with {selectedStaff.full_name}
                  </span>
                )}
                {availabilityStatus === 'unavailable' && (
                  <span className="text-red-700">
                    ✗ Time slot is not available. Please select a different time.
                  </span>
                )}
                {availabilityStatus === 'idle' && (
                  <span>Select date, time, and staff to check availability</span>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {availableSlots.length === 0 && selectedDate && selectedStaff && !checkingAvailability && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No available time slots for {selectedStaff.full_name} on{' '}
              {format(selectedDate, 'PPP')}. Please select a different date or staff member.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}