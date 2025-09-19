'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Phone,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Building2,
  Navigation,
  Globe,
  Calendar,
  BarChart3,
  Settings
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface LocationManagerProps {
  salonId: string
}

interface Location {
  id: string
  name: string
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  phone: string
  email: string
  manager?: string
  staff_count: number
  is_active: boolean
  is_primary: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
  business_hours?: any
  metrics?: {
    total_bookings: number
    revenue: number
    utilization_rate: number
  }
}

function LocationCard({ location, onEdit, onDelete, onViewDetails }: {
  location: Location
  onEdit: () => void
  onDelete: () => void
  onViewDetails: () => void
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onViewDetails}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {location.name}
              {location.is_primary && (
                <Badge variant="secondary" className="text-xs">Primary</Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              {location.address.street}, {location.address.city}
            </CardDescription>
          </div>
          <Badge variant={location.is_active ? 'default' : 'secondary'}>
            {location.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            <span>{location.phone}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{location.staff_count} staff</span>
          </div>
        </div>

        {location.metrics && (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Bookings</p>
              <p className="font-semibold">{location.metrics.total_bookings}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="font-semibold">${location.metrics.revenue}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Utilization</p>
              <p className="font-semibold">{location.metrics.utilization_rate}%</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function LocationManager({ salonId }: LocationManagerProps) {
  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Downtown Main',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'US'
      },
      phone: '(212) 555-0100',
      email: 'downtown@salon.com',
      manager: 'Jane Smith',
      staff_count: 12,
      is_active: true,
      is_primary: true,
      coordinates: {
        latitude: 40.7484,
        longitude: -73.9857
      },
      metrics: {
        total_bookings: 245,
        revenue: 18500,
        utilization_rate: 78
      }
    },
    {
      id: '2',
      name: 'Uptown Branch',
      address: {
        street: '456 Park Ave',
        city: 'New York',
        state: 'NY',
        postal_code: '10022',
        country: 'US'
      },
      phone: '(212) 555-0200',
      email: 'uptown@salon.com',
      manager: 'John Doe',
      staff_count: 8,
      is_active: true,
      is_primary: false,
      coordinates: {
        latitude: 40.7614,
        longitude: -73.9776
      },
      metrics: {
        total_bookings: 189,
        revenue: 14200,
        utilization_rate: 65
      }
    }
  ])

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  const totalMetrics = {
    locations: locations.length,
    activeLocations: locations.filter(l => l.is_active).length,
    totalStaff: locations.reduce((sum, l) => sum + l.staff_count, 0),
    totalBookings: locations.reduce((sum, l) => sum + (l.metrics?.total_bookings || 0), 0),
    totalRevenue: locations.reduce((sum, l) => sum + (l.metrics?.revenue || 0), 0),
    avgUtilization: Math.round(
      locations.reduce((sum, l) => sum + (l.metrics?.utilization_rate || 0), 0) / locations.length
    )
  }

  const handleDeleteLocation = async (locationId: string) => {
    const location = locations.find(l => l.id === locationId)
    if (location?.is_primary) {
      toast.error('Cannot delete primary location')
      return
    }

    try {
      // API call would go here
      setLocations(prev => prev.filter(l => l.id !== locationId))
      toast.success('Location deleted successfully')
    } catch (error) {
      toast.error('Failed to delete location')
    }
  }

  const handleSetPrimary = async (locationId: string) => {
    try {
      // API call would go here
      setLocations(prev => prev.map(l => ({
        ...l,
        is_primary: l.id === locationId
      })))
      toast.success('Primary location updated')
    } catch (error) {
      toast.error('Failed to update primary location')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Location Management</h2>
          <p className="text-muted-foreground">Manage your salon locations and their performance</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.locations}</div>
            <p className="text-xs text-muted-foreground">
              {totalMetrics.activeLocations} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalStaff}</div>
            <p className="text-xs text-muted-foreground">across all locations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalBookings}</div>
            <p className="text-xs text-green-600">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMetrics.totalRevenue}</div>
            <p className="text-xs text-green-600">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.avgUtilization}%</div>
            <p className="text-xs text-muted-foreground">capacity usage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Growing</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Locations Grid/List */}
      {selectedLocation ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>{selectedLocation.name} Details</CardTitle>
                <CardDescription>
                  {selectedLocation.address.street}, {selectedLocation.address.city}, {selectedLocation.address.state}
                </CardDescription>
              </div>
              <Button variant="ghost" onClick={() => setSelectedLocation(null)}>
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="hours">Hours</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Contact Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLocation.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedLocation.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {selectedLocation.address.street}, {selectedLocation.address.city},
                          {selectedLocation.address.state} {selectedLocation.address.postal_code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Quick Stats</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Staff Count</p>
                        <p className="text-lg font-semibold">{selectedLocation.staff_count}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Utilization</p>
                        <p className="text-lg font-semibold">{selectedLocation.metrics?.utilization_rate}%</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Bookings</p>
                        <p className="text-lg font-semibold">{selectedLocation.metrics?.total_bookings}</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-lg font-semibold">${selectedLocation.metrics?.revenue}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedLocation.manager && (
                  <div className="pt-4 border-t">
                    <h3 className="font-medium mb-2">Location Manager</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedLocation.manager}</p>
                        <p className="text-sm text-muted-foreground">Location Manager</p>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="staff" className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Staff management is available in the Staff section
                  </AlertDescription>
                </Alert>
                <Button variant="outline" asChild>
                  <a href={`/dashboard/staff?location=${selectedLocation.id}`}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage Staff
                  </a>
                </Button>
              </TabsContent>

              <TabsContent value="hours" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Business Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
                          <span className="text-sm font-medium">{day}</span>
                          <span className="text-sm text-muted-foreground">9:00 AM - 6:00 PM</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Monthly Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Bookings</span>
                          <span className="font-semibold">{selectedLocation.metrics?.total_bookings}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Revenue</span>
                          <span className="font-semibold">${selectedLocation.metrics?.revenue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Avg. Ticket</span>
                          <span className="font-semibold">
                            ${Math.round((selectedLocation.metrics?.revenue || 0) / (selectedLocation.metrics?.total_bookings || 1))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">vs Last Month</span>
                          <Badge variant="default" className="text-xs">+12%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">vs Last Year</span>
                          <Badge variant="default" className="text-xs">+28%</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">vs Other Locations</span>
                          <Badge variant="secondary" className="text-xs">Above Avg</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Location Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Active Location</Label>
                        <p className="text-sm text-muted-foreground">Accept bookings at this location</p>
                      </div>
                      <Switch checked={selectedLocation.is_active} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Primary Location</Label>
                        <p className="text-sm text-muted-foreground">Set as default location</p>
                      </div>
                      <Switch
                        checked={selectedLocation.is_primary}
                        onCheckedChange={() => handleSetPrimary(selectedLocation.id)}
                      />
                    </div>
                    <div className="pt-4 space-y-2">
                      <Button variant="outline" className="w-full" onClick={() => setEditingLocation(selectedLocation)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Location Details
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600"
                        onClick={() => handleDeleteLocation(selectedLocation.id)}
                        disabled={selectedLocation.is_primary}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Location
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {locations.map(location => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={() => setEditingLocation(location)}
              onDelete={() => handleDeleteLocation(location.id)}
              onViewDetails={() => setSelectedLocation(location)}
            />
          ))}
        </div>
      )}

      {/* Comparison Table */}
      {!selectedLocation && locations.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Location Comparison</CardTitle>
            <CardDescription>Compare performance across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map(location => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {location.name}
                        {location.is_primary && (
                          <Badge variant="secondary" className="text-xs">Primary</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={location.is_active ? 'default' : 'secondary'}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{location.staff_count}</TableCell>
                    <TableCell>{location.metrics?.total_bookings || 0}</TableCell>
                    <TableCell>${location.metrics?.revenue || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{location.metrics?.utilization_rate || 0}%</span>
                        {(location.metrics?.utilization_rate || 0) > 70 && (
                          <Badge variant="default" className="text-xs">High</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLocation(location)}
                      >
                        View
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}