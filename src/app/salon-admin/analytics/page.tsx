import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { OverviewCards } from './components/overview-cards'
import { RevenueChart } from './components/revenue-chart'
import { AppointmentChart } from './components/appointment-chart'
import { ServiceAnalytics } from './components/service-analytics'
import { StaffPerformance } from './components/staff-performance'
import { CustomerInsights } from './components/customer-insights'
import { getSalonAnalytics, getComparisonAnalytics } from '@/lib/data-access/analytics'
import { getUserSalonId } from '@/lib/data-access/auth/utils'
import { redirect } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'

export default async function AnalyticsPage() {
  const salonId = await getUserSalonId()
  
  if (!salonId) {
    redirect('/salon-admin')
  }

  const [analytics, comparison] = await Promise.all([
    getSalonAnalytics(salonId),
    getComparisonAnalytics(salonId)
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your salon's performance and insights
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {analytics.period.start} to {analytics.period.end}
        </div>
      </div>

      {/* Overview Cards */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        <OverviewCards analytics={analytics} comparison={comparison.changes} />
      </Suspense>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <ResizablePanelGroup direction="horizontal" className="min-h-[400px] rounded-lg border">
            <ResizablePanel defaultSize={50} minSize={30}>
              <Card className="h-full border-0">
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>
                    Daily revenue for the current period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                    <RevenueChart data={analytics.revenue} />
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <Card className="h-full border-0">
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                  <CardDescription>
                    Service category breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                    <ServiceAnalytics services={analytics.services} type="revenue" />
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Metrics</CardTitle>
              <CardDescription>
                Key revenue indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${analytics.revenue?.totalRevenue || '0'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Daily Average</p>
                  <p className="text-2xl font-bold">${analytics.revenue?.dailyAverage || '0'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Average Ticket</p>
                  <p className="text-2xl font-bold">${analytics.revenue?.averageTicket || '0'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{analytics.revenue?.appointmentCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <ResizablePanelGroup direction="horizontal" className="min-h-[400px] rounded-lg border">
            <ResizablePanel defaultSize={60} minSize={40}>
              <Card className="h-full border-0">
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>
                    Daily appointment volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                    <AppointmentChart data={analytics.appointments} />
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <Card className="h-full border-0">
                <CardHeader>
                  <CardTitle>Appointment Status</CardTitle>
                  <CardDescription>
                    Breakdown by status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Completed</span>
                      <span className="text-sm text-muted-foreground">
                        {analytics.appointments?.completed || 0} ({analytics.appointments?.completionRate || 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Cancelled</span>
                      <span className="text-sm text-muted-foreground">
                        {analytics.appointments?.cancelled || 0} ({analytics.appointments?.cancellationRate || 0}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">No Show</span>
                      <span className="text-sm text-muted-foreground">
                        {analytics.appointments?.noShow || 0}
                      </span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between pt-0">
                      <span className="text-sm font-medium">Daily Average</span>
                      <span className="font-bold">
                        {analytics.appointments?.averagePerDay || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>
                Understanding your customer base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <CustomerInsights customers={analytics.customers} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Performance</CardTitle>
              <CardDescription>
                Most popular and profitable services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <ServiceAnalytics services={analytics.services} type="performance" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>
                Individual staff metrics and productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <StaffPerformance staff={analytics.staff} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}