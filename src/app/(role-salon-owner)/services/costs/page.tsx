import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  DataTable,
  Badge,
} from '@/components/ui'
import { Plus, DollarSign, Clock, MapPin, TrendingUp, Settings } from 'lucide-react'
import Link from 'next/link'
import { ServiceCostDialog } from './service-cost-dialog'
import type { Database } from '@/types/database.types'

type ServiceCost = Database['public']['Tables']['service_costs']['Row']
type Service = Database['public']['Tables']['services']['Row']
type Location = Database['public']['Tables']['salon_locations']['Row']

interface ServiceWithCosts extends Service {
  service_costs: (ServiceCost & {
    salon_locations?: Location
  })[]
  service_categories?: {
    id: string
    name: string
  }
}

export default async function ServiceCostsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login/salon-owner')
  }

  // Get salon ID for the user
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

  // Fetch services with their costs and locations
  const { data: services, error } = await supabase
    .from('services')
    .select(`
      *,
      service_categories(id, name),
      service_costs(
        *,
        salon_locations(id, name, address)
      )
    `)
    .eq('salon_id', salonId)
    .order('name')

  if (error) {
    console.error('Error fetching services:', error)
  }

  // Fetch all salon locations for the dropdown
  const { data: locations } = await supabase
    .from('salon_locations')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)

  // Calculate statistics
  const totalServices = services?.length || 0
  const servicesWithCosts = services?.filter(s => s.service_costs.length > 0).length || 0
  const averagePrice = services?.reduce((sum, s) => {
    const avgCost = s.service_costs.length > 0
      ? s.service_costs.reduce((costSum, c) => costSum + (c.base_price || 0), 0) / s.service_costs.length
      : 0
    return sum + avgCost
  }, 0) || 0

  const priceRange = {
    min: Math.min(...(services?.flatMap(s => s.service_costs.map(c => c.base_price || 0)) || [0])),
    max: Math.max(...(services?.flatMap(s => s.service_costs.map(c => c.base_price || 0)) || [0]))
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Cost Management</h1>
          <p className="text-muted-foreground">
            Configure pricing for services across different locations
          </p>
        </div>
        <ServiceCostDialog 
          services={services || []} 
          locations={locations || []}
          mode="create"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {servicesWithCosts} with pricing configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalServices > 0 ? (averagePrice / totalServices).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${priceRange.min} - ${priceRange.max}
            </div>
            <p className="text-xs text-muted-foreground">
              Min to max pricing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active locations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Pricing</CardTitle>
          <CardDescription>
            Manage pricing for each service across your salon locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services?.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <CardDescription>{service.description}</CardDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary">
                          {service.service_categories?.name || 'General'}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {service.duration_minutes} min
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          Base: ${service.price}
                        </div>
                      </div>
                    </div>
                    <ServiceCostDialog
                      services={[service]}
                      locations={locations || []}
                      mode="edit"
                      serviceId={service.id}
                    />
                  </div>
                </CardHeader>
                {service.service_costs.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium mb-2">Location-Specific Pricing</h4>
                      {service.service_costs.map((cost) => (
                        <div key={cost.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-4">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {cost.salon_locations?.name || 'All Locations'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {cost.salon_locations?.address || 'Default pricing'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-semibold">${cost.base_price}</p>
                              <p className="text-xs text-muted-foreground">
                                {cost.duration_minutes} min
                              </p>
                            </div>
                            <Badge variant={cost.is_active ? 'default' : 'secondary'}>
                              {cost.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {(!services || services.length === 0) && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No services found</h3>
              <p className="text-muted-foreground mb-4">
                Create services first before configuring costs
              </p>
              <Button asChild>
                <Link href="/role-salon-owner/services">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Service
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}