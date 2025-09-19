'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CalendarDays,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Activity,
  Settings,
  Package,
  MapPin,
  BarChart3,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCheck,
  Calendar
} from 'lucide-react'
import { getSalonByIdAction, updateSalonAction } from '../actions/salons-actions'
import type { ActionResponse } from '../actions/salons-actions'

interface SalonDashboardProps {
  salonId: string
}

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
  }
  status?: 'default' | 'success' | 'warning' | 'danger'
}

function MetricCard({ title, value, description, icon: Icon, trend, status = 'default' }: MetricCardProps) {
  const statusColors = {
    default: '',
    success: 'border-green-500 bg-green-50 dark:bg-green-950',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
    danger: 'border-red-500 bg-red-50 dark:bg-red-950'
  }

  return (
    <Card className={statusColors[status]}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={`text-xs mt-1 flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp className={`h-3 w-3 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
            {Math.abs(trend.value)}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-24" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SalonDashboard({ salonId }: SalonDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [salon, setSalon] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [salonId])

  const loadDashboardData = async () => {
    try {
      setError(null)
      const response: ActionResponse = await getSalonByIdAction(salonId)

      if (!response.success) {
        setError(response.error || 'Failed to load salon data')
        return
      }

      setSalon(response.data)
      setMetrics(response.data.metrics)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
  }

  const handleToggleBooking = async () => {
    try {
      const newStatus = !salon.is_accepting_bookings
      const response = await updateSalonAction(salonId, { is_accepting_bookings: newStatus })

      if (response.success) {
        setSalon({ ...salon, is_accepting_bookings: newStatus })
      } else {
        setError(response.error || 'Failed to update booking status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!salon) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No salon data available</AlertDescription>
      </Alert>
    )
  }

  // Calculate key metrics
  const todayMetrics = metrics?.daily?.[0] || {}
  const monthlyMetric = metrics?.monthly || {}
  const todayAppointments = metrics?.todayAppointments || 0
  const todayConfirmed = metrics?.todayConfirmed || 0

  const utilizationRate = todayMetrics.staff_utilization_rate || 0
  const conversionRate = todayMetrics.booking_conversion_rate || 0
  const avgRating = salon.rating_average || 0

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{salon.name}</h1>
          <p className="text-muted-foreground">{salon.business_name || 'Salon Management Dashboard'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={salon.is_accepting_bookings ? 'default' : 'secondary'}
            onClick={handleToggleBooking}
          >
            {salon.is_accepting_bookings ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepting Bookings
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Bookings Paused
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <Activity className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2">
        {salon.is_verified && (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}
        {salon.is_featured && (
          <Badge variant="secondary">
            <Star className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        <Badge variant={salon.is_active ? 'default' : 'destructive'}>
          {salon.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="outline">{salon.subscription_tier || 'Free'}</Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Appointments"
          value={todayAppointments}
          description={`${todayConfirmed} confirmed`}
          icon={CalendarDays}
          status={todayAppointments > 0 ? 'success' : 'default'}
        />
        <MetricCard
          title="Staff Utilization"
          value={`${Math.round(utilizationRate * 100)}%`}
          description="Today's capacity"
          icon={Users}
          status={utilizationRate > 0.7 ? 'success' : utilizationRate > 0.4 ? 'warning' : 'danger'}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${Math.round(conversionRate * 100)}%`}
          description="Booking to completion"
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricCard
          title="Average Rating"
          value={avgRating.toFixed(1)}
          description={`${salon.rating_count || 0} reviews`}
          icon={Star}
          status={avgRating >= 4.5 ? 'success' : avgRating >= 3.5 ? 'warning' : 'danger'}
        />
      </div>

      {/* Monthly Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
            <CardDescription>Key metrics for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Appointments</span>
              <span className="font-semibold">{monthlyMetric.total_appointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-semibold text-green-600">{monthlyMetric.completed_appointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cancellation Rate</span>
              <span className="font-semibold text-yellow-600">{Math.round((monthlyMetric.cancellation_rate || 0) * 100)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Customers</span>
              <span className="font-semibold">{monthlyMetric.new_customers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Retention Rate</span>
              <span className="font-semibold">{Math.round((monthlyMetric.customer_retention_rate || 0) * 100)}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your salon settings and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/dashboard/settings`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Business Settings
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/dashboard/services`}>
                  <Package className="h-4 w-4 mr-2" />
                  Service Catalog
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/dashboard/staff`}>
                  <Users className="h-4 w-4 mr-2" />
                  Staff Management
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/dashboard/locations`}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Locations
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/dashboard/analytics`}>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </a>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <a href={`/dashboard/appointments`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Appointments
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff and Services Overview */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff ({salon.staff?.length || 0})</TabsTrigger>
          <TabsTrigger value="services">Services ({salon.services?.length || 0})</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Overview</CardTitle>
              <CardDescription>Active staff members and their availability</CardDescription>
            </CardHeader>
            <CardContent>
              {salon.staff && salon.staff.length > 0 ? (
                <div className="space-y-3">
                  {salon.staff.slice(0, 5).map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{member.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.specializations?.join(', ') || 'General'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.is_bookable && (
                          <Badge variant="outline" className="text-xs">Available</Badge>
                        )}
                        {member.rating_average > 0 && (
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{member.rating_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No staff members found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Popular Services</CardTitle>
              <CardDescription>Most booked services this month</CardDescription>
            </CardHeader>
            <CardContent>
              {salon.services && salon.services.length > 0 ? (
                <div className="space-y-3">
                  {salon.services.slice(0, 5).map((service: any) => (
                    <div key={service.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration_minutes} min • ${service.current_price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {service.is_featured && (
                          <Badge variant="secondary" className="text-xs">Featured</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {service.booking_count || 0} bookings
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-6">No services found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <CalendarDays className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">New appointment booked</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm">New 5-star review received</p>
                    <p className="text-xs text-muted-foreground">1 hour ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border">
                  <Users className="h-5 w-5 text-green-500" />
                  <div className="flex-1">
                    <p className="text-sm">New customer registered</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}