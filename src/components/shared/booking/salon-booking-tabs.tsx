'use client'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/database.types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Phone, Star, ChevronRight } from 'lucide-react'
type Salon = Database['public']['Tables']['salons']['Row'] & {
  salon_locations?: Array<{
    id: string
    address_line_1: string | null
    address_line_2?: string | null
    city: string | null
    state_province: string | null
    postal_code: string | null
    phone: string | null
  }>
}
type Service = Database['public']['Tables']['services']['Row'] & {
  service_categories?: {
    id: string
    name: string
    description: string | null
  } | null
}
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row'] & {
  profiles?: {
    email: string
    full_name: string | null
    avatar_url: string | null
  } | null
  staff_schedules?: Array<{
    day_of_week: number
    start_time: string
    end_time: string
    is_available: boolean
  }>
}
interface SalonBookingTabsProps {
  salon: Salon
  services: Service[]
  staff: StaffProfile[]
  reviewCount: number
  avgRating: number
}
function SalonBookingTabs({ 
  salon, 
  services, 
  staff, 
  reviewCount, 
  avgRating 
}: SalonBookingTabsProps) {
  const router = useRouter()
  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.service_categories?.name || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(service)
    return acc
  }, {} as Record<string, Service[]>)
  const handleBookService = (serviceId: string) => {
    router.push(`/book/${salon.id}/service/${serviceId}`)
  }
  const handleBookWithStaff = (staffId: string) => {
    router.push(`/book/${salon.id}/staff/${staffId}`)
  }
  // Format operating hours
  const formatSchedule = (schedules?: Array<{ day_of_week: number; start_time: string; end_time: string; is_available: boolean }>) => {
    if (!schedules || schedules.length === 0) return 'Schedule not available'
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const available = schedules
      .filter(s => s.is_available)
      .map(s => days[s.day_of_week])
      .join(', ')
    return available || 'By appointment'
  }
  return (
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
              {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
                <div key={category}>
                  <h3 className="font-semibold mb-3">{category}</h3>
                  <div className="grid gap-3">
                    {categoryServices.map((service) => (
                      <Button
                        key={service.id}
                        variant="ghost"
                        className="h-auto p-4 justify-between"
                        onClick={() => handleBookService(service.id)}
                        asChild
                      >
                        <div className="flex items-center justify-between w-full">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.name}</h4>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                      </Button>
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
              {staff.map((member) => (
                <Button
                  key={member.id}
                  variant="ghost"
                  className="flex items-start gap-4 p-4 h-auto justify-start border rounded-lg"
                  onClick={() => handleBookWithStaff(member.id)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.profiles?.avatar_url || undefined} />
                    <AvatarFallback>
                      {(member.display_name || member.profiles?.full_name || 'S')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {member.display_name || member.profiles?.full_name || 'Staff Member'}
                    </h4>
                    <p className="text-sm text-muted-foreground">{member.title || 'Team Member'}</p>
                    {member.bio && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {member.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatSchedule(member.staff_schedules)}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              ))}
            </div>
            {staff.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No staff members available
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      {/* About Tab */}
      <TabsContent value="about" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>About {salon.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {salon.description && (
              <div>
                <p className="text-muted-foreground">
                  {salon.description}
                </p>
              </div>
            )}
            {salon.operating_hours && (
              <div>
                <h3 className="font-semibold mb-3">Business Hours</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekdays</span>
                    <span className="font-medium">
                      {salon.operating_hours.weekday_open} - {salon.operating_hours.weekday_close}
                    </span>
                  </div>
                  {salon.operating_hours.saturday_open && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium">
                        {salon.operating_hours.saturday_open} - {salon.operating_hours.saturday_close}
                      </span>
                    </div>
                  )}
                  {salon.operating_hours.sunday_open && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium">
                        {salon.operating_hours.sunday_open} - {salon.operating_hours.sunday_close}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {salon.salon_locations?.[0] && (
              <div>
                <h3 className="font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {salon.salon_locations[0].address_line_1}, {salon.salon_locations[0].city}, 
                      {salon.salon_locations[0].state_province} {salon.salon_locations[0].postal_code}
                    </span>
                  </div>
                  {salon.salon_locations[0].phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{salon.salon_locations[0].phone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {salon.amenities && salon.amenities.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {salon.amenities.map((amenity: string) => (
                    <Badge key={amenity} variant="secondary">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      {/* Reviews Tab */}
      <TabsContent value="reviews" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              {reviewCount > 0 ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold">
                      {(Math.round(avgRating * 10) / 10).toFixed(1)}
                    </span>
                  </div>
                  <span>based on {reviewCount} reviews</span>
                </div>
              ) : (
                'No reviews yet'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Detailed reviews coming soon...
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

SalonBookingTabs.displayName = 'SalonBookingTabs'

export default SalonBookingTabs