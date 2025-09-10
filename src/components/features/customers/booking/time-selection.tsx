'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { useState, useEffect, useCallback } from 'react'
import { formatTime, formatCurrency, formatDuration } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/client'

interface TimeSelectionProps {
  salonId?: string
  serviceIds?: string[]
  onSelect?: (data: { staffId: string; date: string; time: string }) => void
  onBack?: () => void
}

export function TimeSelection({ salonId, serviceIds, onSelect, onBack }: TimeSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedStaff, setSelectedStaff] = useState<string>('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [staff, setStaff] = useState<{id: string; profiles: {first_name: string | null; last_name: string | null} | null}[]>([])
  const [services, setServices] = useState<{id: string; name: string; duration_minutes: number; price: number}[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchStaffAndServices = useCallback(async () => {
    try {
      // Fetch staff
      const { data: staffData } = await supabase
        .from('staff_profiles')
        .select('*, profiles(first_name, last_name)')
        .eq('salon_id', salonId || '')
        .eq('is_active', true)
        .eq('is_bookable', true)

      setStaff(staffData || [])

      // Fetch services
      if (serviceIds && serviceIds.length > 0) {
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .in('id', serviceIds)

        setServices(servicesData || [])
      }
    } catch (error) {
      console.error('Error fetching staff and services:', error)
    }
  }, [salonId, serviceIds, supabase])

  const fetchAvailableTimes = useCallback(async () => {
    try {
      setLoading(true)
      if (!date || !selectedStaff) return

      const dateStr = date.toISOString().split('T')[0]

      // Get existing appointments for the staff on this date
      const { data: appointments } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('staff_id', selectedStaff)
        .eq('appointment_date', dateStr)
        .neq('status', 'cancelled')

      // Get staff schedule
      const { data: schedule } = await supabase
        .from('staff_schedules')
        .select('*')
        .eq('staff_id', selectedStaff)
        .eq('day_of_week', date.getDay())
        .single()

      if (schedule) {
        // Generate available time slots
        const slots: string[] = []
        const startHour = parseInt(schedule.start_time.split(':')[0])
        const endHour = parseInt(schedule.end_time.split(':')[0])

        for (let hour = startHour; hour < endHour; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`)
          slots.push(`${hour.toString().padStart(2, '0')}:30`)
        }

        // Filter out booked times
        const available = slots.filter(slot => {
          const slotTime = slot
          return !appointments?.some(apt => {
            return apt.start_time <= slotTime && slotTime < apt.end_time
          })
        })

        setAvailableTimes(available)
      } else {
        // Default working hours if no schedule found
        setAvailableTimes([
          '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
          '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
          '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
        ])
      }
    } catch (error) {
      console.error('Error fetching available times:', error)
    } finally {
      setLoading(false)
    }
  }, [date, selectedStaff, supabase])

  useEffect(() => {
    if (salonId) {
      fetchStaffAndServices()
    }
  }, [salonId, fetchStaffAndServices])

  useEffect(() => {
    if (date && selectedStaff) {
      fetchAvailableTimes()
    }
  }, [date, selectedStaff, fetchAvailableTimes])

  const handleContinue = () => {
    if (!date || !selectedTime || !selectedStaff) return

    onSelect?.({
      staffId: selectedStaff,
      date: date.toISOString().split('T')[0],
      time: selectedTime
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Date & Time</CardTitle>
          <CardDescription>Choose your preferred appointment date and time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-3">Select Staff</h3>
              <div className="space-y-2">
                {staff.map((member) => (
                  <Button
                    key={member.id}
                    variant={selectedStaff === member.id ? 'default' : 'outline'}
                    onClick={() => setSelectedStaff(member.id)}
                    className="w-full justify-start"
                  >
                    {member.profiles?.first_name} {member.profiles?.last_name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Select Date</h3>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                disabled={(date) => date < new Date() || date.getDay() === 0}
              />
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Available Times</h3>
              {!selectedStaff ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please select a staff member first
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  Loading available times...
                </div>
              ) : availableTimes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available times for this date
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="w-full"
                    >
                      {formatTime(time)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Services</span>
              <span className="font-medium">
                {services.map(s => s.name).join(', ') || 'Services selected'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Staff</span>
              <span className="font-medium">
                {selectedStaff && staff.find(s => s.id === selectedStaff) 
                  ? `${staff.find(s => s.id === selectedStaff)?.profiles?.first_name} ${staff.find(s => s.id === selectedStaff)?.profiles?.last_name}`
                  : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {date ? date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                }) : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time</span>
              <span className="font-medium">
                {selectedTime ? formatTime(selectedTime) : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Duration</span>
              <span className="font-medium">
                {formatDuration(services.reduce((sum, s) => sum + (s.duration_minutes || 0), 0))}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Price</span>
              <span className="font-semibold text-lg">
                {formatCurrency(services.reduce((sum, s) => sum + (s.price || 0), 0))}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button 
              disabled={!date || !selectedTime || !selectedStaff}
              onClick={handleContinue}
            >
              Continue to Confirmation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}