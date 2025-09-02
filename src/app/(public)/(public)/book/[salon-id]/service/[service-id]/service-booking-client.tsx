'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Calendar,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  RadioGroup,
  RadioGroupItem,
  Label,
  Textarea,
} from '@/components/ui'
import { ArrowLeft, Calendar as CalendarIcon, Clock, DollarSign, Star, User } from 'lucide-react'
import { toast } from 'sonner'
import { createAppointment } from '@/lib/data-access/bookings'

type Service = Database['public']['Tables']['services']['Row']
type Staff = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'] | null
}
type Salon = Pick<Database['public']['Tables']['salons']['Row'], 'id' | 'name' | 'description'>

interface ServiceBookingClientProps {
  service: Service
  salon: Salon
  availableStaff: Staff[]
  initialTimeSlots: string[]
  salonId: string
}

export default function ServiceBookingClient({
  service,
  salon,
  availableStaff,
  initialTimeSlots,
  salonId
}: ServiceBookingClientProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedStaff, setSelectedStaff] = useState<string>('any')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [timeSlots, setTimeSlots] = useState(initialTimeSlots)

  // Add "Any Available" option to staff list
  const staffOptions = [
    {
      id: 'any',
      name: 'Any Available',
      role: 'First Available Staff',
      isAny: true
    },
    ...availableStaff.map(staff => ({
      id: staff.id,
      name: staff.profiles?.full_name || 'Staff Member',
      role: staff.title || 'Staff',
      isAny: false
    }))
  ]

  const handleDateChange = async (newDate: Date | undefined) => {
    setDate(newDate)
    setSelectedTime(null)
    
    if (newDate) {
      // Fetch available time slots for the selected date
      try {
        const response = await fetch('/api/availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            salonId,
            date: newDate.toISOString().split('T')[0],
            serviceId: service.id,
            staffId: selectedStaff === 'any' ? undefined : selectedStaff,
            duration: service.duration_minutes
          })
        })
        
        if (response.ok) {
          const { slots } = await response.json()
          setTimeSlots(slots)
        }
      } catch (error) {
        console.error('Failed to fetch time slots:', error)
      }
    }
  }

  const handleBooking = async () => {
    if (!selectedTime || !date) {
      toast.error('Please select a date and time')
      return
    }

    setIsBooking(true)
    
    try {
      // Create appointment through server action
      const startTime = new Date(date)
      const [hours, minutes] = selectedTime.split(':')
      startTime.setHours(parseInt(hours), parseInt(minutes))
      
      const endTime = new Date(startTime)
      endTime.setMinutes(endTime.getMinutes() + service.duration_minutes)
      
      await createAppointment({
        salon_id: salonId,
        service_id: service.id,
        staff_id: selectedStaff === 'any' ? undefined : selectedStaff,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        total_amount: service.price,
        notes
      })
      
      toast.success('Booking confirmed! Check your email for details.')
      router.push('/customer/appointments')
    } catch (error) {
      toast.error('Failed to create booking. Please try again.')
      setIsBooking(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book {service.name}</h1>
        <p className="text-muted-foreground mb-4">{service.description}</p>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{service.duration_minutes} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">${service.price}</span>
          </div>
          {service.category_id && (
            <Badge variant="secondary">Service</Badge>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Staff Member</CardTitle>
              <CardDescription>
                Choose your preferred stylist or select any available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedStaff} onValueChange={setSelectedStaff}>
                <div className="space-y-3">
                  {staffOptions.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={staff.id} id={staff.id} />
                      <Label htmlFor={staff.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {staff.isAny ? <User className="h-4 w-4" /> : staff.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-muted-foreground">{staff.role}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Choose your preferred appointment date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select Time</CardTitle>
              <CardDescription>
                Available time slots for {date?.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.length > 0 ? (
                  timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">
                    No available time slots for this date
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
              <CardDescription>
                Any special requests or information for your appointment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., specific style preferences, allergies, parking instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staff:</span>
                  <span className="font-medium">
                    {staffOptions.find(s => s.id === selectedStaff)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {date?.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {selectedTime || 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{service.duration_minutes} min</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${service.price}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedTime || !date || isBooking}
                onClick={handleBooking}
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                You won&apos;t be charged until after your appointment
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}