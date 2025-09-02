'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Badge,
  AspectRatio,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { MapPin, Search, Star, Clock, Phone, Filter, DollarSign, Users, Award, Scissors } from 'lucide-react'
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
  const [selectedPriceRange, setSelectedPriceRange] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState('all')
  
  // Get all unique categories, price ranges, locations
  const allCategories = Array.from(
    new Set(salons.flatMap(s => s.serviceCategories))
  ).sort()
  
  const allPriceRanges = Array.from(
    new Set(salons.map(s => s.price_range).filter(Boolean))
  ).sort()
  
  const allLocations = Array.from(
    new Set(salons.map(s => s.salon_locations?.[0]?.city).filter(Boolean))
  ).sort()
  
  // Filter salons based on all criteria
  const filteredSalons = salons.filter(salon => {
    const matchesSearch = 
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (salon.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    
    const matchesCategory = 
      selectedCategory === 'all' || 
      salon.serviceCategories.includes(selectedCategory)
    
    const matchesPriceRange = 
      selectedPriceRange === 'all' || 
      salon.price_range === selectedPriceRange
    
    const matchesRating = 
      selectedRating === 'all' || 
      (selectedRating === '4+' && salon.rating >= 4) ||
      (selectedRating === '3+' && salon.rating >= 3) ||
      (selectedRating === '2+' && salon.rating >= 2)
    
    const matchesLocation = 
      selectedLocation === 'all' || 
      salon.salon_locations?.[0]?.city === selectedLocation
    
    return matchesSearch && matchesCategory && matchesPriceRange && matchesRating && matchesLocation
  })

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setSelectedPriceRange('all')
    setSelectedRating('all')
    setSelectedLocation('all')
  }

  return (
    <>
      {/* Search and Advanced Navigation */}
      <section className="mb-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search salons or services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Advanced Filter Navigation */}
          <NavigationMenu>
            <NavigationMenuList>
              {/* Service Categories */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2">
                  <Scissors className="h-4 w-4" />
                  Services
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                      1
                    </Badge>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                            selectedCategory === 'all' && "bg-accent"
                          )}
                          onClick={() => setSelectedCategory('all')}
                        >
                          <div className="text-sm font-medium leading-none">All Services</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Browse all available salon services
                          </p>
                        </Button>
                      </NavigationMenuLink>
                    </li>
                    {allCategories.map((category) => (
                      <li key={category}>
                        <NavigationMenuLink asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                              selectedCategory === category && "bg-accent"
                            )}
                            onClick={() => setSelectedCategory(category)}
                          >
                            <div className="text-sm font-medium leading-none">{category}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Find salons specializing in {category.toLowerCase()} services
                            </p>
                          </Button>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              {/* Price Range */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Price
                  {selectedPriceRange !== 'all' && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                      1
                    </Badge>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[250px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                            selectedPriceRange === 'all' && "bg-accent"
                          )}
                          onClick={() => setSelectedPriceRange('all')}
                        >
                          <div className="text-sm font-medium leading-none">All Price Ranges</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            View salons at every price point
                          </p>
                        </Button>
                      </NavigationMenuLink>
                    </li>
                    {allPriceRanges.map((range) => (
                      <li key={range}>
                        <NavigationMenuLink asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                              selectedPriceRange === range && "bg-accent"
                            )}
                            onClick={() => setSelectedPriceRange(range)}
                          >
                            <div className="text-sm font-medium leading-none">{range}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Salons in the {range} price category
                            </p>
                          </Button>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              {/* Rating */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Rating
                  {selectedRating !== 'all' && (
                    <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                      1
                    </Badge>
                  )}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[250px] gap-3 p-4">
                    <li>
                      <NavigationMenuLink asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                            selectedRating === 'all' && "bg-accent"
                          )}
                          onClick={() => setSelectedRating('all')}
                        >
                          <div className="text-sm font-medium leading-none">All Ratings</div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Show salons with any rating
                          </p>
                        </Button>
                      </NavigationMenuLink>
                    </li>
                    {['4+', '3+', '2+'].map((rating) => (
                      <li key={rating}>
                        <NavigationMenuLink asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                              selectedRating === rating && "bg-accent"
                            )}
                            onClick={() => setSelectedRating(rating)}
                          >
                            <div className="text-sm font-medium leading-none flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              {rating} Stars & Above
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Top-rated salons with {rating} stars or higher
                            </p>
                          </Button>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              
              {/* Location */}
              {allLocations.length > 0 && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location
                    {selectedLocation !== 'all' && (
                      <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                        1
                      </Badge>
                    )}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[250px] gap-3 p-4 max-h-96 overflow-y-auto">
                      <li>
                        <NavigationMenuLink asChild>
                          <Button
                            variant="ghost"
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                              selectedLocation === 'all' && "bg-accent"
                            )}
                            onClick={() => setSelectedLocation('all')}
                          >
                            <div className="text-sm font-medium leading-none">All Locations</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              View salons in all areas
                            </p>
                          </Button>
                        </NavigationMenuLink>
                      </li>
                      {allLocations.map((location) => (
                        <li key={location}>
                          <NavigationMenuLink asChild>
                            <Button
                              variant="ghost"
                              className={cn(
                                "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground w-full text-left h-auto justify-start",
                                selectedLocation === location && "bg-accent"
                              )}
                              onClick={() => setSelectedLocation(location)}
                            >
                              <div className="text-sm font-medium leading-none">{location}</div>
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                Salons in {location}
                              </p>
                            </Button>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Active Filters Summary */}
        <div className="flex flex-wrap items-center gap-2">
          {(selectedCategory !== 'all' || selectedPriceRange !== 'all' || selectedRating !== 'all' || selectedLocation !== 'all') && (
            <>
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <Scissors className="h-3 w-3" />
                  {selectedCategory}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive p-0 h-auto"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedPriceRange !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <DollarSign className="h-3 w-3" />
                  {selectedPriceRange}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedPriceRange('all')}
                    className="ml-1 hover:text-destructive p-0 h-auto"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedRating !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3" />
                  {selectedRating} Stars
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRating('all')}
                    className="ml-1 hover:text-destructive p-0 h-auto"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedLocation !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {selectedLocation}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLocation('all')}
                    className="ml-1 hover:text-destructive p-0 h-auto"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">
                Clear all
              </Button>
            </>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'} found
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>{salons.length} total salons available</span>
          </div>
        </div>
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
        <Card className="text-center">
          <CardHeader>
            <CardTitle>No salons found</CardTitle>
            <CardDescription>
              Try adjusting your search or filters to find more results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  )
}