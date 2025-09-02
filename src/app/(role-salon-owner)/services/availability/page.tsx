import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
} from '@/components/ui'
import { MapPin, Clock, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { AvailabilityMatrix } from './availability-matrix'
import type { Database } from '@/types/database.types'

type Service = Database['public']['Tables']['services']['Row']
type Location = Database['public']['Tables']['salon_locations']['Row']
type ServiceAvailability = Database['public']['Tables']['service_location_availability']['Row']

export default async function ServiceAvailabilityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/salon-owner')
  }

  // Get salon ID
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .eq('role', 'salon_owner')
    .single()

  if (!userRole?.salon_id) {
    redirect('/role-salon-owner')
  }

  const salonId = userRole.salon_id

  // Fetch services, locations, and availability
  const [servicesRes, locationsRes, availabilityRes] = await Promise.all([
    supabase
      .from('services')
      .select(`
        *,
        service_categories(id, name)
      `)
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name'),
    
    supabase
      .from('salon_locations')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name'),
    
    supabase
      .from('service_location_availability')
      .select('*')
  ])

  const services = servicesRes.data || []
  const locations = locationsRes.data || []
  const availability = availabilityRes.data || []

  // Create availability map
  const availabilityMap = availability.reduce((acc, avail) => {
    const key = `${avail.service_id}-${avail.location_id}`
    acc[key] = avail
    return acc
  }, {} as Record<string, ServiceAvailability>)

  // Calculate statistics
  const totalCombinations = services.length * locations.length
  const configuredCombinations = availability.filter(a => a.is_available).length
  const availabilityRate = totalCombinations > 0 
    ? Math.round((configuredCombinations / totalCombinations) * 100)
    : 0

  const servicesWithFullCoverage = services.filter(service =>
    locations.every(location => {
      const key = `${service.id}-${location.id}`
      return availabilityMap[key]?.is_available
    })
  ).length

  const locationsWithFullServices = locations.filter(location =>
    services.every(service => {
      const key = `${service.id}-${location.id}`
      return availabilityMap[key]?.is_available
    })
  ).length

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Availability Matrix</h1>
          <p className="text-muted-foreground">
            Configure which services are available at each location
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availabilityRate}%</div>
            <p className="text-xs text-muted-foreground">
              Services available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              Active services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
            <p className="text-xs text-muted-foreground">
              Active locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full Coverage</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicesWithFullCoverage}</div>
            <p className="text-xs text-muted-foreground">
              Services at all locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete Locations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationsWithFullServices}</div>
            <p className="text-xs text-muted-foreground">
              With all services
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Availability Management */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList>
          <TabsTrigger value="matrix">Availability Matrix</TabsTrigger>
          <TabsTrigger value="by-service">By Service</TabsTrigger>
          <TabsTrigger value="by-location">By Location</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle>Service-Location Matrix</CardTitle>
              <CardDescription>
                Toggle service availability for each location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AvailabilityMatrix
                services={services}
                locations={locations}
                availabilityMap={availabilityMap}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="by-service">
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                      <Badge variant="secondary" className="mt-2">
                        {service.service_categories?.name || 'General'}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {locations.filter(loc => {
                          const key = `${service.id}-${loc.id}`
                          return availabilityMap[key]?.is_available
                        }).length}/{locations.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Locations</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locations.map((location) => {
                      const key = `${service.id}-${location.id}`
                      const isAvailable = availabilityMap[key]?.is_available || false
                      
                      return (
                        <div key={location.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{location.name}</p>
                              <p className="text-sm text-muted-foreground">{location.address}</p>
                            </div>
                          </div>
                          <Badge variant={isAvailable ? 'default' : 'secondary'}>
                            {isAvailable ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Available
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Unavailable
                              </>
                            )}
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="by-location">
          <div className="space-y-4">
            {locations.map((location) => (
              <Card key={location.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                      <CardDescription>{location.address}</CardDescription>
                      {location.phone && (
                        <p className="text-sm text-muted-foreground mt-1">{location.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {services.filter(svc => {
                          const key = `${svc.id}-${location.id}`
                          return availabilityMap[key]?.is_available
                        }).length}/{services.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Services</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    {services.map((service) => {
                      const key = `${service.id}-${location.id}`
                      const isAvailable = availabilityMap[key]?.is_available || false
                      
                      return (
                        <div key={service.id} className="flex items-center justify-between p-2 border rounded-lg">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{service.name}</span>
                          </div>
                          {isAvailable ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-300" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}