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
import { ArrowLeft, Calendar as CalendarIcon, Clock, DollarSign, Star, User } from 'lucide-react'
import { toast } from 'sonner'

// Mock data
const mockService = {
  id: '1',
  name: 'Haircut & Style',
  description: 'Professional haircut with styling consultation and finishing touches',
  duration: 60,
  price: 85,
  category: 'Hair',
}

const mockStaff = [
  { 
    id: '1', 
    name: 'Sarah Johnson', 
    role: 'Senior Stylist', 
    rating: 4.9, 
    nextAvailable: '10:30 AM',
    image: '' 
  },
  { 
    id: '2', 
    name: 'Michael Chen', 
    role: 'Hair Specialist', 
    rating: 4.8, 
    nextAvailable: '11:00 AM',
    image: '' 
  },
  { 
    id: '3', 
    name: 'Any Available', 
    role: 'First Available Staff', 
    rating: 0, 
    nextAvailable: '9:00 AM',
    image: '',
    isAny: true 
  },
]

const mockTimeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
]

export default function ServiceBookingPage() {
  const params = useParams()
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedStaff, setSelectedStaff] = useState<string>('3') // Default to "Any Available"
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [isBooking, setIsBooking] = useState(false)

  const handleBooking = async () => {
    if (!selectedTime || !date) {
      toast.error('Please select a date and time')
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

      {/* Service Header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Book {mockService.name}</h1>
        <p className="text-muted-foreground mb-4">{mockService.description}</p>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{mockService.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">${mockService.price}</span>
          </div>
          <Badge variant="secondary">{mockService.category}</Badge>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Staff & Date Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Selection */}
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
                  {mockStaff.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={staff.id} id={staff.id} />
                      <Label htmlFor={staff.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={staff.image} />
                            <AvatarFallback>
                              {staff.isAny ? <User className="h-4 w-4" /> : staff.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-sm text-muted-foreground">{staff.role}</div>
                          </div>
                          {!staff.isAny && (
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-primary text-primary" />
                                <span className="text-sm font-medium">{staff.rating}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Next: {staff.nextAvailable}
                              </div>
                            </div>
                          )}
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
                Choose your preferred appointment date
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

        {/* Right Column - Booking Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">{mockService.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Staff:</span>
                  <span className="font-medium">
                    {mockStaff.find(s => s.id === selectedStaff)?.name}
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
                  <span className="font-medium">{mockService.duration} min</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>${mockService.price}</span>
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