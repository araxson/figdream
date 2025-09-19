'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, Filter, Heart } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SalonSearchResult, SalonSearchFilters } from '../../types'

interface SalonSearchProps {
  onSalonSelect: (salon: SalonSearchResult) => void
  searchSalons: (filters: SalonSearchFilters) => Promise<SalonSearchResult[]>
  addToFavorites?: (salonId: string) => Promise<void>
  favoriteIds?: string[]
}

export function SalonSearch({ onSalonSelect, searchSalons, addToFavorites, favoriteIds = [] }: SalonSearchProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [salons, setSalons] = useState<SalonSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState<SalonSearchFilters>({
    location: '',
    services: [],
    rating: 0,
    distance: 25,
    priceRange: [0, 200]
  })
  const [showFilters, setShowFilters] = useState(false)

  const serviceOptions = [
    'Haircut', 'Hair Color', 'Highlights', 'Blowout', 'Hair Styling',
    'Manicure', 'Pedicure', 'Gel Nails', 'Nail Art', 'Acrylic Nails',
    'Facial', 'Massage', 'Eyebrow Threading', 'Lash Extensions', 'Waxing'
  ]

  useEffect(() => {
    handleSearch()
  }, [])

  const handleSearch = async () => {
    setLoading(true)
    try {
      const searchFilters: SalonSearchFilters = {
        ...filters,
        location: searchQuery || filters.location
      }
      const results = await searchSalons(searchFilters)
      setSalons(results)
    } catch (error) {
      console.error('Search failed:', error)
      setSalons([])
    } finally {
      setLoading(false)
    }
  }

  const handleServiceToggle = (service: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      services: checked
        ? [...(prev.services || []), service]
        : (prev.services || []).filter(s => s !== service)
    }))
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      services: [],
      rating: 0,
      distance: 25,
      priceRange: [0, 200]
    })
  }

  const applyFilters = () => {
    setShowFilters(false)
    handleSearch()
  }

  if (loading && salons.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Find Your Perfect Salon</h1>
          <p className="text-muted-foreground">
            Discover and book appointments at top-rated salons near you
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, salon name, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={loading}>
            Search
          </Button>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Salons</SheetTitle>
                <SheetDescription>
                  Narrow down your search with these filters
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Location Filter */}
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    placeholder="Enter city or zip code"
                    value={filters.location || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                {/* Distance Filter */}
                <div className="space-y-2">
                  <Label>Distance: {filters.distance} miles</Label>
                  <Slider
                    value={[filters.distance || 25]}
                    onValueChange={([value]) => setFilters(prev => ({ ...prev, distance: value }))}
                    max={50}
                    min={1}
                    step={1}
                  />
                </div>

                {/* Rating Filter */}
                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <Select
                    value={filters.rating?.toString() || '0'}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, rating: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any Rating</SelectItem>
                      <SelectItem value="3">3+ Stars</SelectItem>
                      <SelectItem value="4">4+ Stars</SelectItem>
                      <SelectItem value="5">5 Stars Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div className="space-y-2">
                  <Label>Price Range: ${filters.priceRange?.[0]} - ${filters.priceRange?.[1]}</Label>
                  <Slider
                    value={filters.priceRange || [0, 200]}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priceRange: value as [number, number] }))}
                    max={500}
                    min={0}
                    step={10}
                  />
                </div>

                {/* Services Filter */}
                <div className="space-y-2">
                  <Label>Services</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {serviceOptions.map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={service}
                          checked={filters.services?.includes(service) || false}
                          onCheckedChange={(checked) => handleServiceToggle(service, checked as boolean)}
                        />
                        <Label htmlFor={service} className="text-sm">
                          {service}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2">
                  <Button onClick={applyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {(filters.services?.length || filters.rating || filters.location) && (
          <div className="flex flex-wrap gap-2">
            {filters.location && (
              <Badge variant="secondary">
                Location: {filters.location}
              </Badge>
            )}
            {filters.rating && filters.rating > 0 && (
              <Badge variant="secondary">
                {filters.rating}+ Stars
              </Badge>
            )}
            {filters.services?.map((service) => (
              <Badge key={service} variant="secondary">
                {service}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {salons.length} salon{salons.length !== 1 ? 's' : ''} found
          </h2>
          {loading && (
            <div className="text-sm text-muted-foreground">Searching...</div>
          )}
        </div>

        {salons.length === 0 && !loading ? (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No salons found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or expanding your search area
            </p>
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salons.map((salon) => (
              <Card key={salon.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{salon.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {salon.address.city}, {salon.address.state}
                        {salon.distance && (
                          <span className="text-xs">• {salon.distance.toFixed(1)} miles</span>
                        )}
                      </CardDescription>
                    </div>
                    {addToFavorites && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          addToFavorites(salon.id)
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            favoriteIds.includes(salon.id)
                              ? 'fill-red-500 text-red-500'
                              : 'text-muted-foreground'
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent onClick={() => onSalonSelect(salon)}>
                  {salon.coverImageUrl && (
                    <div className="aspect-video rounded-md bg-muted mb-4 overflow-hidden">
                      <img
                        src={salon.coverImageUrl}
                        alt={salon.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {salon.shortDescription || salon.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{salon.rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">
                          ({salon.reviewCount})
                        </span>
                      </div>
                      <Badge variant="outline">{salon.priceRange}</Badge>
                    </div>

                    {salon.features && salon.features.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {salon.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature.replace('_', ' ')}
                          </Badge>
                        ))}
                        {salon.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{salon.features.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm">
                        {salon.isBookingAvailable ? (
                          <span className="text-green-600">Available today</span>
                        ) : (
                          <span className="text-orange-600">Limited availability</span>
                        )}
                      </div>
                      <Button size="sm">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}