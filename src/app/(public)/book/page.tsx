'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, Star, Clock, Phone } from 'lucide-react'

// Mock data for demonstration
const mockSalons = [
  {
    id: '1',
    name: 'Glamour Studio',
    slug: 'glamour-studio',
    description: 'Premier beauty salon specializing in hair, nails, and spa treatments',
    rating: 4.8,
    reviewCount: 234,
    address: '123 Main St, San Francisco, CA',
    distance: '0.8 miles',
    image: '/api/placeholder/400/250',
    services: ['Hair', 'Nails', 'Spa', 'Makeup'],
    priceRange: '$$$',
    nextAvailable: '10:30 AM',
  },
  {
    id: '2',
    name: 'The Beauty Bar',
    slug: 'beauty-bar',
    description: 'Modern salon offering cutting-edge beauty treatments',
    rating: 4.9,
    reviewCount: 189,
    address: '456 Oak Ave, San Francisco, CA',
    distance: '1.2 miles',
    image: '/api/placeholder/400/250',
    services: ['Hair', 'Nails', 'Lashes', 'Brows'],
    priceRange: '$$',
    nextAvailable: '11:00 AM',
  },
  {
    id: '3',
    name: 'Serenity Spa & Salon',
    slug: 'serenity-spa',
    description: 'Relax and rejuvenate at our full-service spa and salon',
    rating: 4.7,
    reviewCount: 156,
    address: '789 Pine Blvd, San Francisco, CA',
    distance: '2.1 miles',
    image: '/api/placeholder/400/250',
    services: ['Spa', 'Massage', 'Facials', 'Hair'],
    priceRange: '$$$$',
    nextAvailable: '2:00 PM',
  },
  {
    id: '4',
    name: 'Urban Hair Studio',
    slug: 'urban-hair',
    description: 'Trendy hair salon with expert stylists',
    rating: 4.6,
    reviewCount: 98,
    address: '321 Market St, San Francisco, CA',
    distance: '0.5 miles',
    image: '/api/placeholder/400/250',
    services: ['Hair', 'Color', 'Extensions'],
    priceRange: '$$',
    nextAvailable: '9:00 AM',
  },
]

export default function BookingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedService, setSelectedService] = useState('all')
  
  const filteredSalons = mockSalons.filter(salon => {
    const matchesSearch = salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          salon.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesService = selectedService === 'all' || 
                           salon.services.some(s => s.toLowerCase() === selectedService.toLowerCase())
    return matchesSearch && matchesService
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find & Book Your Perfect Salon</h1>
        <p className="text-muted-foreground">
          Discover top-rated salons near you and book your appointment instantly
        </p>
      </section>

      {/* Search and Filters */}
      <section className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search salons, services, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            San Francisco, CA
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedService === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedService('all')}
          >
            All Services
          </Badge>
          {['Hair', 'Nails', 'Spa', 'Makeup', 'Lashes'].map((service) => (
            <Badge
              key={service}
              variant={selectedService === service ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedService(service)}
            >
              {service}
            </Badge>
          ))}
        </div>
      </section>

      {/* Results Count */}
      <section className="mb-6">
        <p className="text-sm text-muted-foreground">
          {filteredSalons.length} salons found near you
        </p>
      </section>

      {/* Salon Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map((salon) => (
          <Card key={salon.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <div className="absolute top-2 right-2">
                <Badge className="bg-background/90">{salon.priceRange}</Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{salon.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {salon.distance}
                    </span>
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold">{salon.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({salon.reviewCount})
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {salon.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {salon.services.slice(0, 3).map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
                {salon.services.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{salon.services.length - 3}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Next available:</span>
                <span className="font-medium text-primary">{salon.nextAvailable}</span>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button className="flex-1" asChild>
                <Link href={`/book/${salon.slug}`}>
                  Book Now
                </Link>
              </Button>
              <Button variant="outline" size="icon">
                <Phone className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* Empty State */}
      {filteredSalons.length === 0 && (
        <Card className="p-8 text-center">
          <CardHeader>
            <CardTitle>No salons found</CardTitle>
            <CardDescription>
              Try adjusting your search or filters to find more results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('')
                setSelectedService('all')
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}