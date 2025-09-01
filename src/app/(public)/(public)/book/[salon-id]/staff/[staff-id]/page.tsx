'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Calendar as CalendarIcon, Clock, DollarSign, Star, Award, Briefcase } from 'lucide-react'
import { toast } from 'sonner'

// Mock data
const mockStaff = {
  id: '1',
  name: 'Sarah Johnson',
  role: 'Senior Stylist',
  bio: 'With over 10 years of experience in the beauty industry, Sarah specializes in modern cuts, color treatments, and styling for all hair types.',
  rating: 4.9,
  reviewCount: 156,
  experience: '10+ years',
  specialties: ['Hair Color', 'Balayage', 'Precision Cuts', 'Bridal Styling'],
  image: '',
  services: [
    { id: '1', name: 'Haircut & Style', duration: 60, price: 85, category: 'Hair' },
    { id: '2', name: 'Hair Color', duration: 120, price: 150, category: 'Hair' },
    { id: '3', name: 'Highlights', duration: 150, price: 200, category: 'Hair' },
    { id: '4', name: 'Balayage', duration: 180, price: 250, category: 'Hair' },
    { id: '5', name: 'Deep Conditioning', duration: 45, price: 60, category: 'Hair' },
    { id: '6', name: 'Bridal Hair', duration: 90, price: 150, category: 'Special' },
  ],
}

const mockTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
]

export default function StaffBookingPage() {
  const params = useParams()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedService, setSelectedService] = useState<string>('1')
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const selectedServiceData = mockStaff.services.find(s => s.id === selectedService)

  const handleBooking = async () => {
    if (!selectedTime || !date || !selectedServiceData) {
      toast.error('Please select a service, date, and time')
      return
    }

    setIsBooking(true)
    // Simulate booking API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Booking confirmed! Check your email for details.')
    router.push('/customer/appointments')
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
            <AvatarImage src={mockStaff.image} />
            <AvatarFallback className="text-lg">
              {mockStaff.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">Book with {mockStaff.name}</h1>
            <p className="text-muted-foreground mb-2">{mockStaff.role}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold">{mockStaff.rating}</span>
                <span className="text-muted-foreground">({mockStaff.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span>{mockStaff.experience}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-muted-foreground">{mockStaff.bio}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {mockStaff.specialties.map((specialty) => (
            <Badge key={specialty} variant="secondary">
              <Award className="h-3 w-3 mr-1" />
              {specialty}
            </Badge>
          ))}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Service & Date Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Service</CardTitle>
              <CardDescription>
                Choose from {mockStaff.name}&apos;s available services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedService} onValueChange={setSelectedService}>
                <div className="space-y-3">
                  {mockStaff.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={service.id} id={service.id} />
                      <Label htmlFor={service.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.duration} min
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {service.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${service.price}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Date</CardTitle>
              <CardDescription>
                Available dates for {mockStaff.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Time</CardTitle>
              <CardDescription>
                Available time slots for {date?.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {mockTimeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    disabled={Math.random() > 0.8} // Mock some slots as unavailable
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
              <CardDescription>
                Any special requests or information for {mockStaff.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="E.g., specific style preferences, inspirations, concerns..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staff:</span>
                  <span className="font-medium">{mockStaff.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">
                    {selectedServiceData?.name}
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
                  <span className="font-medium">
                    {selectedServiceData?.duration} min
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${selectedServiceData?.price}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                size="lg"
                disabled={!selectedTime || !date || !selectedServiceData || isBooking}
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