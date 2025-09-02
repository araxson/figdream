import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Badge, Progress } from '@/components/ui'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  Calendar,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/lib/database/supabase/server'

export default async function MetricsOverviewPage() {
  const supabase = await createClient()
  
  // Get dashboard metrics data
  const { data: metrics } = await supabase
    .from('dashboard_metrics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(30) // Last 30 days of metrics
  
  // Get the most recent metrics
  const latestMetrics = metrics?.[0]
  const previousMetrics = metrics?.[1]
  
  // Calculate trends
  const calculateTrend = (current: number | null, previous: number | null) => {
    if (!current || !previous) return 0
    return ((current - previous) / previous) * 100
  }
  
  const revenueTrend = calculateTrend(latestMetrics?.revenue_total ?? null, previousMetrics?.revenue_total ?? null)
  const bookingsTrend = calculateTrend(latestMetrics?.appointments_booked ?? null, previousMetrics?.appointments_booked ?? null)
  const customersTrend = calculateTrend(latestMetrics?.new_customers ?? null, previousMetrics?.new_customers ?? null)
  const utilizationTrend = calculateTrend(latestMetrics?.staff_utilization_rate ?? null, previousMetrics?.staff_utilization_rate ?? null)
  
  // Calculate weekly aggregates
  const weeklyMetrics = metrics?.slice(0, 7).reduce((acc, m) => ({
    revenue: acc.revenue + (m.revenue_total || 0),
    bookings: acc.bookings + (m.appointments_booked || 0),
    customers: acc.customers + (m.new_customers || 0),
    utilization: acc.utilization + (m.staff_utilization_rate || 0)
  }), { revenue: 0, bookings: 0, customers: 0, utilization: 0 })
  
  const avgWeeklyUtilization = weeklyMetrics ? weeklyMetrics.utilization / 7 : 0
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Metrics Overview</h1>
        <p className="text-muted-foreground">Comprehensive business performance dashboard</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestMetrics?.revenue_total?.toLocaleString() || 0}
            </div>
            <div className="flex items-center text-xs">
              {revenueTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={revenueTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(revenueTrend).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.appointments_booked || 0}
            </div>
            <div className="flex items-center text-xs">
              {bookingsTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={bookingsTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(bookingsTrend).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.new_customers || 0}
            </div>
            <div className="flex items-center text-xs">
              {customersTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={customersTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(customersTrend).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.staff_utilization_rate?.toFixed(1) || 0}%
            </div>
            <div className="flex items-center text-xs">
              {utilizationTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={utilizationTrend > 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(utilizationTrend).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Booking Value</CardTitle>
            <CardDescription>Revenue per booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${latestMetrics?.average_ticket?.toFixed(2) || 0}
            </div>
            <Progress 
              value={(latestMetrics?.average_ticket || 0) / 2} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cancellation Rate</CardTitle>
            <CardDescription>Booking cancellations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((latestMetrics?.appointments_cancelled || 0) / Math.max(latestMetrics?.appointments_booked || 1, 1) * 100).toFixed(1)}%
            </div>
            <Progress 
              value={(latestMetrics?.appointments_cancelled || 0) / Math.max(latestMetrics?.appointments_booked || 1, 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Repeat Customer Rate</CardTitle>
            <CardDescription>Returning customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((latestMetrics?.returning_customers || 0) / Math.max(latestMetrics?.total_customers || 1, 1) * 100).toFixed(1)}%
            </div>
            <Progress 
              value={(latestMetrics?.returning_customers || 0) / Math.max(latestMetrics?.total_customers || 1, 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">30-Day Trends</TabsTrigger>
          <TabsTrigger value="services">Service Performance</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>Last 30 days of key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.map((metric, index) => (
                  <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(metric.created_at!).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>Revenue: ${metric.revenue_total?.toLocaleString()}</span>
                        <span>Bookings: {metric.appointments_booked}</span>
                        <span>New: {metric.new_customers}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {metric.staff_utilization_rate?.toFixed(1)}% util
                      </Badge>
                      {index > 0 && (
                        <>
                          {(metric.revenue_total || 0) > (metrics[index - 1].revenue_total || 0) ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Metrics</CardTitle>
              <CardDescription>Performance by service category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Top Service</p>
                    <p className="text-xs text-muted-foreground">
                      {'Top Service'}
                    </p>
                  </div>
                  <Badge>{latestMetrics?.services_performed || 0} services</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Most Revenue</p>
                    <p className="text-xs text-muted-foreground">
                      Highest revenue generator
                    </p>
                  </div>
                  <Badge variant="secondary">
                    ${latestMetrics?.revenue_services?.toLocaleString() || 0}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Service Categories</p>
                    <p className="text-xs text-muted-foreground">
                      Active categories
                    </p>
                  </div>
                  <Badge variant="outline">
                    {latestMetrics?.services_performed || 0} services
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance Summary</CardTitle>
              <CardDescription>Last 7 days aggregated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Weekly Revenue</span>
                    <span className="text-xl font-bold">
                      ${weeklyMetrics?.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Weekly Bookings</span>
                    <span className="text-xl font-bold">
                      {weeklyMetrics?.bookings}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">New Customers This Week</span>
                    <span className="text-xl font-bold">
                      {weeklyMetrics?.customers}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Daily Revenue</span>
                    <span className="text-xl font-bold">
                      ${((weeklyMetrics?.revenue || 0) / 7).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Daily Bookings</span>
                    <span className="text-xl font-bold">
                      {((weeklyMetrics?.bookings || 0) / 7).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg Weekly Utilization</span>
                    <span className="text-xl font-bold">
                      {avgWeeklyUtilization.toFixed(1)}%
                    </span>
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