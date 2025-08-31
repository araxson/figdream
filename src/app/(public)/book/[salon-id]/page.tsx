'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Clock, MapPin, Phone, Star, Users, ChevronRight } from 'lucide-react'

// Mock salon data
const mockSalonData = {
  id: '1',
  name: 'Glamour Studio',
  description: 'Premier beauty salon specializing in hair, nails, and spa treatments. Our expert team is dedicated to making you look and feel your best.',
  rating: 4.8,
  reviewCount: 234,
  address: '123 Main St, San Francisco, CA 94105',
  phone: '(415) 555-0123',
  email: 'info@glamourstudio.com',
  hours: {
    monday: '9:00 AM - 7:00 PM',
    tuesday: '9:00 AM - 7:00 PM',
    wednesday: '9:00 AM - 7:00 PM',
    thursday: '9:00 AM - 8:00 PM',
    friday: '9:00 AM - 8:00 PM',
    saturday: '10:00 AM - 6:00 PM',
    sunday: '11:00 AM - 5:00 PM',
  },
  services: [
    { id: '1', name: 'Haircut & Style', duration: 60, price: 85, category: 'Hair' },
    { id: '2', name: 'Hair Color', duration: 120, price: 150, category: 'Hair' },
    { id: '3', name: 'Manicure', duration: 45, price: 45, category: 'Nails' },
    { id: '4', name: 'Pedicure', duration: 60, price: 65, category: 'Nails' },
    { id: '5', name: 'Facial Treatment', duration: 75, price: 120, category: 'Spa' },
    { id: '6', name: 'Massage Therapy', duration: 90, price: 140, category: 'Spa' },
  ],
  staff: [
    { id: '1', name: 'Sarah Johnson', role: 'Senior Stylist', rating: 4.9, image: '', specialties: ['Hair Color', 'Styling'] },
    { id: '2', name: 'Michael Chen', role: 'Hair Specialist', rating: 4.8, image: '', specialties: ['Haircuts', 'Beard Styling'] },
    { id: '3', name: 'Emily Rodriguez', role: 'Nail Technician', rating: 4.7, image: '', specialties: ['Nail Art', 'Gel Nails'] },
    { id: '4', name: 'David Kim', role: 'Massage Therapist', rating: 5.0, image: '', specialties: ['Deep Tissue', 'Swedish'] },
  ],
}

export default function SalonBookingPage() {
  const params = useParams()
  const router = useRouter()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)

  const handleBookService = (serviceId: string) => {
    router.push(`/book/${params['salon-id']}/service/${serviceId}`)
  }

  const handleBookWithStaff = (staffId: string) => {
    router.push(`/book/${params['salon-id']}/staff/${staffId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Salon Header */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{mockSalonData.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold text-foreground">{mockSalonData.rating}</span>
                <span>({mockSalonData.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{mockSalonData.address}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Services</CardTitle>
              <CardDescription>
                Choose from our wide range of beauty and wellness services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Hair', 'Nails', 'Spa'].map((category) => (
                  <div key={category}>
                    <h3 className="font-semibold mb-3">{category}</h3>
                    <div className="grid gap-3">
                      {mockSalonData.services
                        .filter(service => service.category === category)
                        .map((service) => (
                          <div
                            key={service.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => handleBookService(service.id)}
                          >
                            <div className="flex-1">
                              <h4 className="font-medium">{service.name}</h4>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {service.duration} min
                                </span>
                                <span className="font-semibold text-foreground">
                                  ${service.price}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Team</CardTitle>
              <CardDescription>
                Book with your preferred stylist or therapist
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {mockSalonData.staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleBookWithStaff(member.id)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={member.image} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span className="text-sm font-medium">{member.rating}</span>
                        </div>
                        <div className="flex gap-1">
                          {member.specialties.map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About {mockSalonData.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-muted-foreground">
                  {mockSalonData.description}
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Business Hours</h3>
                <div className="grid gap-2 text-sm">
                  {Object.entries(mockSalonData.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="capitalize text-muted-foreground">{day}</span>
                      <span className="font-medium">{hours}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{mockSalonData.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{mockSalonData.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>
                See what our customers are saying about us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Reviews coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}