import { notFound } from 'next/navigation'
import { getSalonForBooking, getServicesBySalon, getStaffBySalon } from '@/lib/data-access/bookings/public-booking'
import { createClient } from '@/lib/database/supabase/server'
import { Database } from '@/types/database.types'
import SalonBookingTabs from '@/components/shared/booking/salon-booking-tabs'
import {
  Button,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui'
import { Calendar, MapPin, Phone, Star, Home } from 'lucide-react'
import Link from 'next/link'
type Salon = Database['public']['Tables']['salons']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
// Extended staff type with relations (unused but kept for future use)
// type StaffWithRelations = StaffProfile & {
//   profiles?: {
//     email: string
//     full_name: string | null
//     avatar_url: string | null
//   } | null
//   staff_schedules?: Array<{
//     day_of_week: number
//     start_time: string
//     end_time: string
//     is_available: boolean
//   }>
// }
// Extended salon type with relations
type SalonWithLocations = Salon & {
  salon_locations: Array<{
    id: string
    address_line_1: string | null
    address_line_2: string | null
    city: string | null
    state_province: string | null
    postal_code: string | null
    phone: string | null
    latitude: number | null
    longitude: number | null
  }>
}
interface PageProps {
  params: Promise<{ 'salon-id': string }>
}
export default async function SalonBookingPage({ params }: PageProps) {
  const resolvedParams = await params
  const salonId = resolvedParams['salon-id']
  // Fetch salon data
  const salon = await getSalonForBooking(salonId) as SalonWithLocations | null
  if (!salon) {
    notFound()
  }
  // Fetch services and staff in parallel
  const [services, staff] = await Promise.all([
    getServicesBySalon(salonId),
    getStaffBySalon(salonId)
  ])
  // Get review statistics
  const supabase = await createClient()
  const { data: reviewStats } = await supabase
    .from('reviews')
    .select('rating')
    .eq('salon_id', salonId)
    .eq('is_published', true)
  const avgRating = reviewStats && reviewStats.length > 0
    ? reviewStats.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewStats.length
    : 0
  const location = salon.salon_locations?.[0]
  const address = location 
    ? `${location.address_line_1 || ''}, ${location.city || ''}, ${location.state_province || ''} ${location.postal_code || ''}`
    : 'Address not available'
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">
                <Home className="h-4 w-4" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/book">Book Appointment</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{salon.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Salon Header */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{salon.name}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {reviewStats && reviewStats.length > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">
                    {(Math.round(avgRating * 10) / 10).toFixed(1)}
                  </span>
                  <span>({reviewStats.length} reviews)</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{address}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {location?.phone && (
              <Button variant="outline" asChild>
                <a href={`tel:${location.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href={`/book/${salonId}/service`}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Main Content Tabs */}
      <SalonBookingTabs 
        salon={salon}
        services={services}
        staff={staff as StaffProfile[]}
        reviewCount={reviewStats?.length || 0}
        avgRating={avgRating}
      />
    </div>
  )
}