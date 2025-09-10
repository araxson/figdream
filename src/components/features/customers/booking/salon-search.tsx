'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Search, MapPin, Star, Clock, AlertCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { useDebounce } from '@/hooks/utils/use-debounce'
import { useToast } from '@/hooks/ui/use-toast'
import { cn } from '@/lib/utils'

type Salon = Database['public']['Tables']['salons']['Row'] & {
  reviews: Array<{
    rating: number
  }>
  services: Array<{
    id: string
    name: string
    price: number
  }>
  salon_locations: Array<{
    city: string
    operating_hours: Database['public']['Tables']['salon_locations']['Row']['operating_hours']
  }>
}

interface SalonSearchProps {
  onSalonSelect?: (salonId: string) => void
}

export function SalonSearch({ onSalonSelect }: SalonSearchProps) {
  const [salons, setSalons] = useState<Salon[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const supabase = createClient()
  const toast = useToast()
  
  // Debounce search terms
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const debouncedLocation = useDebounce(location, 500)

  const searchSalons = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Please sign in to search for salons')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      // Verify authentication before query
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Authentication required')
      }
      
      let query = supabase
        .from('salons')
        .select(`
          *,
          reviews(rating),
          services(id, name, price),
          salon_locations(city, operating_hours)
        `)
        .eq('is_active', true)

      if (debouncedSearchTerm) {
        query = query.ilike('name', `%${debouncedSearchTerm}%`)
      }

      if (debouncedLocation) {
        query = query.or(`address.ilike.%${debouncedLocation}%,salon_locations.city.ilike.%${debouncedLocation}%`)
      }

      const { data, error } = await query.limit(20)

      if (error) throw error
      setSalons(data || [])
      
      // Show success feedback for search
      if (data && data.length === 0) {
        toast.info('No salons found', 'Try adjusting your search criteria')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to search salons'
      setError(errorMessage)
      setSalons([])
      
      // Show error toast
      toast.error('Search failed', errorMessage)
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Error searching salons:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, debouncedSearchTerm, debouncedLocation, supabase, toast])

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
      if (user) {
        searchSalons()
      } else {
        setLoading(false)
        setError('Please sign in to search for salons')
      }
    }
    checkAuth()
  }, [searchSalons, supabase.auth])
  
  // Auto-search when debounced values change
  useEffect(() => {
    if (isAuthenticated && (debouncedSearchTerm || debouncedLocation)) {
      searchSalons()
    }
  }, [debouncedSearchTerm, debouncedLocation, isAuthenticated, searchSalons])

  const calculateAverageRating = (reviews: { rating: number }[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  const getPriceRange = (services: { price: number }[]) => {
    if (!services || services.length === 0) return '$'
    const avg = services.reduce((acc, s) => acc + s.price, 0) / services.length
    if (avg < 30) return '$'
    if (avg < 60) return '$$'
    if (avg < 100) return '$$$'
    return '$$$$'
  }

  return (
    <div className={cn("space-y-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Find a Salon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-4")}>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className={cn("h-4 w-4")} />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className={cn("flex gap-2")}>
              <Input
                placeholder="Search by salon name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn("flex-1")}
                disabled={!isAuthenticated}
              />
              <Input
                placeholder="City or ZIP..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={cn("w-48")}
                disabled={!isAuthenticated}
              />
              <Button 
                onClick={() => searchSalons()}
                disabled={!isAuthenticated || loading}
              >
                <Search className={cn("h-4 w-4 mr-2")} />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className={cn("flex items-center justify-center py-12")}>
          Searching salons...
        </div>
      ) : salons.length === 0 ? (
        <Card>
          <CardContent className={cn("text-center py-12")}>
            <p className={cn("text-muted-foreground")}>
              No salons found. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn("grid gap-4 md:grid-cols-2")}>
          {salons.map((salon) => {
            const avgRating = calculateAverageRating(salon.reviews)
            const priceRange = getPriceRange(salon.services)
            
            return (
              <Card key={salon.id} className={cn("cursor-pointer hover:shadow-lg transition-shadow")}>
                <CardContent className={cn("p-6")}>
                  <div className={cn("space-y-3")}>
                    <div>
                      <h3 className={cn("font-semibold text-lg")}>{salon.name}</h3>
                      {salon.description && (
                        <p className={cn("text-sm text-muted-foreground mt-1")}>
                          {salon.description}
                        </p>
                      )}
                    </div>

                    <div className={cn("flex items-center gap-4 text-sm")}>
                      <div className={cn("flex items-center gap-1")}>
                        <MapPin className={cn("h-3 w-3")} />
                        <span>{salon.salon_locations?.[0]?.city || 'Location'}</span>
                      </div>
                      {Number(avgRating) > 0 && (
                        <div className={cn("flex items-center gap-1")}>
                          <Star className={cn("h-3 w-3 fill-yellow-500 text-yellow-500")} />
                          <span>{avgRating} ({salon.reviews.length})</span>
                        </div>
                      )}
                      <Badge variant="secondary">{priceRange}</Badge>
                    </div>

                    <div className={cn("flex items-center gap-2 text-sm text-muted-foreground")}>
                      <Clock className={cn("h-3 w-3")} />
                      <span>
                        {JSON.stringify(salon.salon_locations?.[0]?.operating_hours) || 'Mon-Sat 9AM-7PM'}
                      </span>
                    </div>

                    {salon.services && salon.services.length > 0 && (
                      <div>
                        <p className={cn("text-xs text-muted-foreground mb-2")}>Popular services:</p>
                        <div className={cn("flex flex-wrap gap-1")}>
                          {salon.services.slice(0, 3).map((service) => (
                            <Badge key={service.id} variant="outline" className={cn("text-xs")}>
                              {service.name}
                            </Badge>
                          ))}
                          {salon.services.length > 3 && (
                            <Badge variant="outline" className={cn("text-xs")}>
                              +{salon.services.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      className={cn("w-full")}
                      onClick={() => onSalonSelect?.(salon.id)}
                    >
                      View Details & Book
                    </Button>
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