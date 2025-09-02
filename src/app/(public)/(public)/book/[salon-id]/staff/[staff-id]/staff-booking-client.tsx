'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Calendar as CalendarIcon, Clock, DollarSign, Star, Award, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'

interface StaffData {
  id: string
  name: string
  role: string
  bio: string
  rating: number
  reviewCount: number
  experience: string
  specialties: string[]
  image: string
  services: {
    id: string
    name: string
    description?: string | null
    duration: number
    price: number
    category: string
  }[]
  schedules: any[]
}

interface StaffBookingClientProps {
  staff: StaffData
  timeSlots: string[]
  salonId: string
}

export function StaffBookingClient({ staff, timeSlots, salonId }: StaffBookingClientProps) {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedService, setSelectedService] = useState<string>(staff.services[0]?.id || '')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const selectedServiceData = staff.services.find(s => s.id === selectedService)

  const handleBooking = async () => {
    if (!selectedTime || !date || !selectedServiceData) {
      toast.error('Please select a service, date, and time')
      return
    }

    setIsBooking(true)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please login to book an appointment')
        router.push('/login/customer')
        return
      }

      // Create appointment in database
      const appointmentDate = new Date(date)
      const [time, period] = selectedTime.split(' ')
      const [hours, minutes] = time.split(':')
      let hour = parseInt(hours)
      if (period === 'PM' && hour !== 12) hour += 12
      if (period === 'AM' && hour === 12) hour = 0
      appointmentDate.setHours(hour, parseInt(minutes))

      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert({
          customer_id: user.id,
          salon_id: salonId,
          staff_id: staff.id,
          appointment_date: appointmentDate.toISOString(),
          duration_minutes: selectedServiceData.duration,
          status: 'scheduled',
          notes: notes || null,
          total_price: selectedServiceData.price
        })
        .select()
        .single()

      if (error) throw error

      // Add appointment service
      if (appointment) {
        const { error: serviceError } = await supabase
          .from('appointment_services')
          .insert({
            appointment_id: appointment.id,
            service_id: selectedServiceData.id,
            price: selectedServiceData.price,
            duration_minutes: selectedServiceData.duration
          })

        if (serviceError) throw serviceError
      }

      toast.success('Booking confirmed! Check your email for details.')
      router.push('/role-customer/appointments')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to book appointment. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Staff Header */}
      <section className="mb-8">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={staff.image} />
            <AvatarFallback className="text-lg">
              {staff.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{staff.name}</h1>
            <p className="text-muted-foreground">{staff.role}</p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{staff.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({staff.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{staff.experience}</span>
              </div>
            </div>
            <p className="mt-3 text-sm">{staff.bio}</p>
            {staff.specialties.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {staff.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Service Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Service</CardTitle>
            <CardDescription>Choose from available services</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedService} onValueChange={setSelectedService}>
              <div className="space-y-3">
                {staff.services.map((service) => (
                  <div key={service.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={service.id} id={service.id} className="mt-1" />
                    <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.duration} minutes • {service.category}
                          </p>
                        </div>
                        <span className="font-semibold">${service.price}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Date & Time Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date & Time</CardTitle>
            <CardDescription>Pick your preferred appointment time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>
            
            <div>
              <Label>Available Times</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="w-full"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Additional Notes</CardTitle>
          <CardDescription>Any special requests or information?</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Let us know if you have any special requests..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedServiceData && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{selectedServiceData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Staff:</span>
                <span className="font-medium">{staff.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">
                  {date?.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{selectedServiceData.duration} minutes</span>
              </div>
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total:</span>
                <span>${selectedServiceData.price}</span>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleBooking}
            disabled={!selectedTime || !date || isBooking}
          >
            {isBooking ? 'Booking...' : 'Confirm Booking'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}