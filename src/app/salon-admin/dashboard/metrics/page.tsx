import { createServerClient } from '@/lib/database/supabase/server'
import { getDashboardSummary } from '@/lib/data-access/analytics/metrics'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign,
  Calendar,
  Clock,
  Star,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import RevenueChart from './revenue-chart'
import PeakHoursHeatmap from './peak-hours-heatmap'
import ServicePopularityChart from './service-popularity-chart'
import StaffUtilizationChart from './staff-utilization-chart'

export default async function MetricsDashboardPage() {
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

  // Get comprehensive dashboard data
  const dashboardData = await getDashboardSummary(userRole.salon_id)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive insights into your salon performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/salon-admin/data-export">
              Export Data
            </Link>
          </Button>
          <Button asChild>
            <Link href="/salon-admin/dashboard">
              Main Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Revenue (This Month)</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.revenue.current)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {dashboardData.revenue.growth >= 0 ? (
                <>
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {formatPercentage(dashboardData.revenue.growth)}
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">
                    {formatPercentage(dashboardData.revenue.growth)}
                  </span>
                </>
              )}
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Customers Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Customers</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.customers.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                +{dashboardData.customers.new} new
              </Badge>
              <span className="text-xs text-muted-foreground">
                {dashboardData.customers.retention.toFixed(1)}% retention
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Staff Utilization Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Staff Utilization</CardDescription>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData.staff.utilization.toFixed(1)}%
            </div>
            <div className="mt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">
                  {dashboardData.staff.utilization > 80 ? 'High' : 
                   dashboardData.staff.utilization > 60 ? 'Good' : 'Low'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peak Times Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Peak Times</CardDescription>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium">{dashboardData.patterns.peakDay}</p>
                <p className="text-xs text-muted-foreground">Busiest day</p>
              </div>
              <div>
                <p className="text-sm font-medium">{dashboardData.patterns.peakHour}</p>
                <p className="text-xs text-muted-foreground">Peak hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
                  Daily revenue over the past 30 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart data={dashboardData.revenue.chart} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>
                  Revenue by service category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(dashboardData.services.categories).map(([category, data]: [string, any]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm font-medium">{category}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatCurrency(data.revenue)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {data.bookings} bookings
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <Link href="/salon-admin/dashboard/metrics/revenue">
                View Detailed Revenue Analytics
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Customers</span>
                    <span className="font-semibold">{dashboardData.customers.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New (30 days)</span>
                    <span className="font-semibold text-green-600">+{dashboardData.customers.new}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Retention Rate</span>
                    <span className="font-semibold">{dashboardData.customers.retention.toFixed(1)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>
                  Performance by customer segment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Customer segmentation analysis coming soon
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <Link href="/salon-admin/dashboard/metrics/customers">
                View Customer Analytics
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
                <CardDescription>
                  Most popular services this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ServicePopularityChart services={dashboardData.services.popular} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.services.popular.map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{service.bookings} bookings</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(service.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <Link href="/salon-admin/dashboard/metrics/services">
                View Service Analytics
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Staff Utilization</CardTitle>
                <CardDescription>
                  Individual staff performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaffUtilizationChart staff={dashboardData.staff.top} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours Heatmap</CardTitle>
                <CardDescription>
                  Booking distribution throughout the week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PeakHoursHeatmap hourlyData={dashboardData.patterns.hourly} />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <Link href="/salon-admin/staff">
                Manage Staff
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}