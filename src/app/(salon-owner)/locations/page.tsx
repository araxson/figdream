import { createServerClient } from '@/lib/database/supabase/server'
import { getSalonLocations } from '@/lib/data-access/locations'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Phone, 
  Clock, 
  Users, 
  DollarSign, 
  Calendar,
  Plus,
  Settings,
  Star,
  MoreVertical
} from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default async function LocationsPage() {
  const supabase = await createServerClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get user's salon
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('user_id', user.id)
    .single()

  if (!userRole?.salon_id) {
    redirect('/401')
  }

  // Get all locations for the salon
  const locations = await getSalonLocations(userRole.salon_id)

  // Get stats for each location
  const locationsWithStats = await Promise.all(
    locations.map(async (location) => {
      // Get basic stats
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('location_id', location.id)
        .gte('date', new Date().toISOString().split('T')[0])

      const { count: staffCount } = await supabase
        .from('staff_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('primary_location_id', location.id)
        .eq('is_active', true)

      return {
        ...location,
        stats: {
          todayAppointments: appointmentCount || 0,
          activeStaff: staffCount || 0
        }
      }
    })
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Locations</h1>
          <p className="text-muted-foreground mt-1">
            Manage your salon locations and their settings
          </p>
        </div>
        <Button asChild>
          <Link href="/salon-admin/locations/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Location
          </Link>
        </Button>
      </div>

      {/* Locations Grid */}
      {locationsWithStats.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {locationsWithStats.map((location) => (
            <Card key={location.id} className="relative">
              {location.is_primary && (
                <Badge className="absolute -top-2 -right-2 z-10">
                  <Star className="h-3 w-3 mr-1" />
                  Primary
                </Badge>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{location.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {location.is_active ? (
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactive</Badge>
                      )}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/salon-admin/locations/${location.id}`}>
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/salon-admin/locations/${location.id}/services`}>
                          Service Availability
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/salon-admin/locations/${location.id}/staff`}>
                          Staff Assignment
                        </Link>
                      </DropdownMenuItem>
                      {!location.is_primary && (
                        <DropdownMenuItem className="text-destructive">
                          Delete Location
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{location.address}</p>
                    <p className="text-muted-foreground">
                      {location.city}, {location.state} {location.postal_code}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                {location.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{location.phone}</span>
                  </div>
                )}

                {/* Operating Hours */}
                {location.operating_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {location.operating_hours.weekday_open} - {location.operating_hours.weekday_close}
                    </span>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs">Today</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {location.stats.todayAppointments}
                    </p>
                    <p className="text-xs text-muted-foreground">appointments</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">Staff</span>
                    </div>
                    <p className="text-lg font-semibold">
                      {location.stats.activeStaff}
                    </p>
                    <p className="text-xs text-muted-foreground">active</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/salon-admin/locations/${location.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link href={`/salon-admin/appointments?location=${location.id}`}>
                      Appointments
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold">No locations yet</h3>
              <p className="text-muted-foreground mt-1">
                Add your first salon location to get started
              </p>
            </div>
            <Button asChild>
              <Link href="/salon-admin/locations/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Location
              </Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}