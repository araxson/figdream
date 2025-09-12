'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EmptyState } from '@/components/shared/ui-helpers/empty-states'
import { LoadingCard } from '@/components/shared/ui-helpers/loading-states'

interface SalonData {
  id: string
  name: string
  description?: string | null
  reviews?: Array<{ rating: number }>
  services?: Array<{
    id: string
    name: string
    price: number
  }>
  salon_locations?: Array<{
    city: string
    operating_hours: unknown
  }>
}

interface SalonSearchProps {
  onSalonSelect?: (salonId: string) => void
}

export function SalonSearch({ onSalonSelect }: SalonSearchProps) {
  const [salons, setSalons] = useState<SalonData[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSalons()
  }, [])

  const fetchSalons = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/salons/active')
      if (response.ok) {
        const data = await response.json()
        setSalons(data)
      }
    } catch (error) {
      console.error('Failed to fetch salons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (location) params.set('location', location)
    router.push(`/customer/book?${params.toString()}`)
  }

  const calculateAverageRating = (reviews?: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const filteredSalons = salons.filter(salon => {
    const matchesSearch = !searchTerm || 
      salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      salon.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLocation = !location ||
      salon.salon_locations?.some(loc => 
        loc.city.toLowerCase().includes(location.toLowerCase())
      )
    
    return matchesSearch && matchesLocation
  })

  if (loading) {
    return <LoadingCard title="Finding Salons" message="Loading available salons..." />
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Find Your Perfect Salon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search salons or services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Enter city or area..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredSalons.length === 0 ? (
        <EmptyState
          title="No salons found"
          description="Try adjusting your search criteria"
          icon={Search}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSalons.map((salon) => {
            const avgRating = calculateAverageRating(salon.reviews)
            const location = salon.salon_locations?.[0]
            
            return (
              <Card 
                key={salon.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onSalonSelect?.(salon.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{salon.name}</h3>
                      {salon.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {salon.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {Number(avgRating) > 0 && (
                          <>
                            <Star className="h-4 w-4 fill-current text-yellow-500" />
                            <span className="font-medium">{avgRating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({salon.reviews?.length || 0} reviews)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{location.city}</span>
                      </div>
                    )}
                    
                    {salon.services && salon.services.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {salon.services.slice(0, 3).map((service) => (
                          <Badge key={service.id} variant="secondary">
                            {service.name}
                          </Badge>
                        ))}
                        {salon.services.length > 3 && (
                          <Badge variant="outline">
                            +{salon.services.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}