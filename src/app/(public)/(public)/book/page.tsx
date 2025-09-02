import { Suspense } from 'react'
import { getSalonsForBooking } from '@/lib/data-access/bookings/public-booking'
import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import SalonBookingList from '@/components/shared/booking/salon-booking-list'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Skeleton,
} from '@/components/ui'
import { MapPin, Search } from 'lucide-react'

type Salon = Database['public']['Tables']['salons']['Row']

export default async function BookingPage() {
  // Fetch real salon data from database
  const salons = await getSalonsForBooking()
  
  // Get aggregated stats for each salon
  const supabase = await createClient()
  
  // Fetch review stats and service categories for all salons
  const salonIds = salons.map((s: Salon) => s.id)
  
  const [reviewStats, services] = await Promise.all([
    // Get review statistics
    supabase
      .from('reviews')
      .select('salon_id, rating')
      .in('salon_id', salonIds)
      .eq('is_published', true),
    
    // Get services grouped by salon
    supabase
      .from('services')
      .select(`
        salon_id,
        name,
        service_categories (
          name
        )
      `)
      .in('salon_id', salonIds)
      .eq('is_active', true)
  ])
  
  // Process salon data with stats
  const salonsWithStats = salons.map((salon: Salon) => {
    // Calculate average rating
    const salonReviews = reviewStats.data?.filter(r => r.salon_id === salon.id) || []
    const avgRating = salonReviews.length > 0
      ? salonReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / salonReviews.length
      : 0
    
    // Get unique service categories
    const salonServices = services.data?.filter(s => s.salon_id === salon.id) || []
    const categories = [...new Set(salonServices
      .map(s => s.service_categories?.name)
      .filter((name): name is string => Boolean(name))
    )]
    
    return {
      ...salon,
      rating: Math.round(avgRating * 10) / 10,
      reviewCount: salonReviews.length,
      serviceCategories: categories
    }
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

      {/* Results Count */}
      <section className="mb-6">
        <p className="text-sm text-muted-foreground">
          {salonsWithStats.length} salons available for booking
        </p>
      </section>

      {/* Salon List with Client-Side Filtering */}
      <Suspense fallback={<SalonListSkeleton />}>
        <SalonBookingList salons={salonsWithStats} />
      </Suspense>
    </div>
  )
}

// Loading skeleton component
function SalonListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardHeader>
            <Skeleton className="h-6 mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 mb-2" />
            <Skeleton className="h-4 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}