'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Star, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SalonBookingListProps, SalonWithDetails } from './SalonBookingList.types'

export function SalonBookingList({ 
  salons,
  searchQuery: initialSearchQuery = '',
  selectedCategory: initialCategory = '',
  selectedLocation: initialLocation = ''
}: SalonBookingListProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)

  // Extract unique categories and locations for filters
  const categories = useMemo(() => {
    const allCategories = new Set<string>()
    salons.forEach(salon => {
      salon.categories?.forEach(cat => allCategories.add(cat))
    })
    return Array.from(allCategories).sort()
  }, [salons])

  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>()
    salons.forEach(salon => {
      if (salon.city) uniqueLocations.add(salon.city)
    })
    return Array.from(uniqueLocations).sort()
  }, [salons])

  // Filter salons based on search and filters
  const filteredSalons = useMemo(() => {
    return salons.filter(salon => {
      const matchesSearch = !searchQuery || 
        salon.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = !selectedCategory || 
        salon.categories?.includes(selectedCategory)
      
      const matchesLocation = !selectedLocation || 
        salon.city === selectedLocation
      
      return matchesSearch && matchesCategory && matchesLocation
    })
  }, [salons, searchQuery, selectedCategory, selectedLocation])

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Input
          placeholder="Search salons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Found {filteredSalons.length} salon{filteredSalons.length !== 1 ? 's' : ''}
      </p>

      {/* Salon Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredSalons.map((salon) => (
          <SalonCard key={salon.id} salon={salon} />
        ))}
      </div>

      {/* Empty State */}
      {filteredSalons.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              No salons found matching your criteria.
            </p>
            <Button
              variant="link"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('')
                setSelectedLocation('')
              }}
              className="mt-2"
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function SalonCard({ salon }: { salon: SalonWithDetails }) {
  const rating = salon.reviewStats?.average_rating ?? 0
  const reviewCount = salon.reviewStats?.total_reviews ?? 0

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{salon.name}</CardTitle>
            <CardDescription className="mt-1">
              {salon.description}
            </CardDescription>
          </div>
          {salon.logo_url && (
            <Image
              src={salon.logo_url}
              alt={salon.name}
              width={48}
              height={48}
              className="rounded-lg object-cover"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location */}
        {salon.city && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{salon.city}, {salon.state}</span>
          </div>
        )}

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({reviewCount} reviews)
            </span>
          </div>
        )}

        {/* Categories */}
        {salon.categories && salon.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {salon.categories.slice(0, 3).map(category => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
            {salon.categories.length > 3 && (
              <Badge variant="outline">
                +{salon.categories.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Hours */}
        {salon.opening_hours && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Open now</span>
          </div>
        )}

        {/* Book Now Button */}
        <Button asChild className="w-full">
          <Link href={`/book/${salon.id}`}>
            Book Now
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}