import { createClient } from '@/lib/database/supabase/server'
import { getServiceMetrics } from '@/lib/data-access/analytics/metrics'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
  Progress,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui'
import { 
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowLeft,
  Download,
  Star,
  BarChart3,
  Scissors,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import Link from 'next/link'
import ServicePopularityChart from '@/components/salon-owner/dashboard/service-popularity-chart'
import ServicePerformanceMatrix from './service-performance-matrix'
import CategoryBreakdownChart from './category-breakdown-chart'

export default async function ServiceAnalyticsPage() {
  const supabase = await createClient()
  
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

  // Get service metrics
  const serviceData = await getServiceMetrics(userRole.salon_id)
  
  // Get additional service insights
  const { data: allServices } = await supabase
    .from('services')
    .select(`
      *,
      service_categories (
        name
      )
    `)
    .eq('salon_id', userRole.salon_id)
    .eq('is_active', true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Calculate service efficiency (revenue per minute)
  const servicesWithEfficiency = serviceData.topServices.map(service => ({
    ...service,
    efficiency: service.avgDuration > 0 ? service.revenue / service.avgDuration : 0,
    avgPrice: service.bookings > 0 ? service.revenue / service.bookings : 0
  }))

  // Calculate category stats
  const categoryStats = Object.entries(serviceData.categoryBreakdown).map(([category, data]: [string, any]) => ({
    category,
    bookings: data.bookings,
    revenue: data.revenue,
    percentage: serviceData.totalBookings > 0 ? (data.bookings / serviceData.totalBookings) * 100 : 0
  }))

  // Find trending services (mock data for now)
  const trendingServices = servicesWithEfficiency.slice(0, 3).map(service => ({
    ...service,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    trendValue: Math.floor(Math.random() * 30) + 5
  }))

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/salon-admin/dashboard/metrics">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Service Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Performance insights for your service offerings
            </p>
          </div>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Services</CardDescription>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceData.totalServices}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active offerings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Bookings</CardDescription>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceData.totalBookings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Avg Service Price</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                servicesWithEfficiency.length > 0
                  ? servicesWithEfficiency.reduce((sum, s) => sum + s.avgPrice, 0) / servicesWithEfficiency.length
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per service
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Avg Duration</CardDescription>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(
                servicesWithEfficiency.length > 0
                  ? Math.round(servicesWithEfficiency.reduce((sum, s) => sum + s.avgDuration, 0) / servicesWithEfficiency.length)
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per appointment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="popularity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="popularity">Popularity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Popularity Tab */}
        <TabsContent value="popularity" className="space-y-4">
          <ResizablePanelGroup direction="vertical" className="min-h-[600px] rounded-lg border">
            <ResizablePanel defaultSize={65} minSize={45}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={60} minSize={40}>
                  <Card className="h-full border-0">
                    <CardHeader>
                      <CardTitle>Most Popular Services</CardTitle>
                      <CardDescription>
                        Top services by booking volume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ServicePopularityChart services={serviceData.topServices.slice(0, 5)} />
                    </CardContent>
                  </Card>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <Card className="h-full border-0">
                    <CardHeader>
                      <CardTitle>Service Rankings</CardTitle>
                      <CardDescription>
                        Top performing services ranked
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {serviceData.topServices.slice(0, 5).map((service, index) => (
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
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={25}>
              <Card className="h-full border-0">
                <CardHeader>
                  <CardTitle>Trending Services</CardTitle>
                  <CardDescription>
                    Services with significant growth or decline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {trendingServices.map((service) => (
                      <div key={service.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium">{service.name}</p>
                            <p className="text-xs text-muted-foreground">{service.category}</p>
                          </div>
                          {service.trend === 'up' ? (
                            <Badge variant="default" className="gap-1 text-xs">
                              <ArrowUpRight className="h-3 w-3" />
                              {service.trendValue}%
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <ArrowDownRight className="h-3 w-3" />
                              {service.trendValue}%
                            </Badge>
                          )}
                        </div>
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Bookings</span>
                            <span className="font-medium">{service.bookings}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Revenue</span>
                            <span className="font-medium">{formatCurrency(service.revenue)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance Matrix</CardTitle>
              <CardDescription>
                Analyzing service efficiency and profitability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServicePerformanceMatrix services={servicesWithEfficiency} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>High Performers</CardTitle>
                <CardDescription>
                  Services with best revenue per minute
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servicesWithEfficiency
                    .sort((a, b) => b.efficiency - a.efficiency)
                    .slice(0, 5)
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(service.avgDuration)} average
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatCurrency(service.efficiency)}/min
                          </p>
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="h-3 w-3 mr-1" />
                            High efficiency
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Opportunities</CardTitle>
                <CardDescription>
                  Services that could be improved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {servicesWithEfficiency
                    .filter(s => s.bookings < 5)
                    .slice(0, 5)
                    .map((service) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Only {service.bookings} bookings
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Needs attention
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Service bookings by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryBreakdownChart categories={categoryStats} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryStats.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {category.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{category.bookings} bookings</span>
                        <span>{formatCurrency(category.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Service Catalog Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Service Catalog</CardTitle>
              <CardDescription>
                All active services by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allServices?.slice(0, 9).map((service) => (
                  <div key={service.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {service.service_categories?.name || 'Uncategorized'}
                        </Badge>
                      </div>
                      <Scissors className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Price</p>
                        <p className="font-medium">{formatCurrency(service.price || 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{formatDuration(service.duration_minutes || 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Optimization Recommendations</CardTitle>
              <CardDescription>
                Data-driven suggestions to improve service performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Price Optimization */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium">Price Optimization</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Services below market rate</span>
                      <Badge variant="secondary">3 services</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Potential revenue increase</span>
                      <span className="font-medium text-green-600">+$2,450/month</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    View Pricing Recommendations
                  </Button>
                </div>

                {/* Duration Optimization */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium">Duration Optimization</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Services with buffer time</span>
                      <Badge variant="secondary">5 services</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Time savings potential</span>
                      <span className="font-medium text-blue-600">45 min/day</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Optimize Scheduling
                  </Button>
                </div>

                {/* Bundle Opportunities */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium">Bundle Opportunities</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Frequently combined services</span>
                      <Badge variant="secondary">4 pairs</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Bundle revenue potential</span>
                      <span className="font-medium text-purple-600">+$1,800/month</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Create Service Bundles
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}