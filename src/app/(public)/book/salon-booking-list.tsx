'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { MapPin, Search, Star, Clock, Phone } from 'lucide-react'
import { Database } from '@/types/database.types'

type Salon = Database['public']['Tables']['salons']['Row'] & {
  rating: number
  reviewCount: number
  serviceCategories: string[]
  salon_locations?: Array<{
    id: string
    address: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    phone: string | null
  }>
}

interface SalonBookingListProps {
  salons: Salon[]
}

export default function SalonBookingList({ salons }: SalonBookingListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Get all unique categories
  const allCategories = Array.from(
    new Set(salons.flatMap(s => s.serviceCategories))
  ).sort()
  
  // Filter salons based on search and category
  const filteredSalons = salons.filter(salon => {
    const matchesSearch = 
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (salon.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      salon.serviceCategories.includes(selectedCategory)
    
    return matchesSearch && matchesCategory
  })

  return (
    <>
      {/* Search and Filters */}
      <section className="mb-8 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search salons or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge 
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory('all')}
          >
            All Services
          </Badge>
          {allCategories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
        
        <p className="text-sm text-muted-foreground">
          {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'} found
        </p>
      </section>

      {/* Salon Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map((salon) => {
          const location = salon.salon_locations?.[0]
          const address = location ? 
            `${location.city}${location.state ? `, ${location.state}` : ''}` : 
            'Location TBD'
          
          return (
            <Card key={salon.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted relative">
                {salon.image_url && (
                  <AspectRatio ratio={16 / 9}>
                    <img 
                      src={salon.image_url} 
                      alt={salon.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </AspectRatio>
                )}
                {salon.price_range && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-background/90">{salon.price_range}</Badge>
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl line-clamp-1">{salon.name}</CardTitle>
                    <CardDescription className="mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {address}
                      </span>
                    </CardDescription>
                  </div>
                  {salon.reviewCount > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-semibold">{salon.rating}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({salon.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {salon.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {salon.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {salon.serviceCategories.slice(0, 3).map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                  {salon.serviceCategories.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{salon.serviceCategories.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {salon.operating_hours?.weekday_open || 'Hours vary'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button className="flex-1" asChild>
                  <Link href={`/book/${salon.slug || salon.id}`}>
                    Book Now
                  </Link>
                </Button>
                {location?.phone && (
                  <Button variant="outline" size="icon" asChild>
                    <a href={`tel:${location.phone}`}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
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
                setSelectedCategory('all')
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}