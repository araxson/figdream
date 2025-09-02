import { Suspense } from 'react'
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
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  Separator,
  Skeleton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
// Component imports temporarily commented - components need to be created
// import { OverviewCards } from './components/overview-cards'
// import { RevenueChart } from './components/revenue-chart'
// import { AppointmentChart } from './components/appointment-chart'
// import { ServiceAnalytics } from './components/service-analytics'
// import { StaffPerformance } from './components/staff-performance'
// import { CustomerInsights } from './components/customer-insights'
import { getSalonAnalytics, getComparisonAnalytics } from '@/lib/data-access/analytics'
import { getUserSalonId } from '@/lib/data-access/auth/utils'
import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const salonId = await getUserSalonId(user.id)
  
  if (!salonId) {
    redirect('/salon-admin')
  }

  const [analytics, comparison] = await Promise.all([
    getSalonAnalytics(salonId),
    getComparisonAnalytics(salonId)
  ])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/salon-owner">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track your salon's performance and insights
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Action Menubar */}
            <Menubar>
              <MenubarMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MenubarTrigger>View</MenubarTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Switch between different analytics views</p>
                  </TooltipContent>
                </Tooltip>
                <MenubarContent>
                  <MenubarItem>Revenue Trends</MenubarItem>
                  <MenubarItem>Appointment Analytics</MenubarItem>
                  <MenubarItem>Customer Insights</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Comparison View</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MenubarTrigger>Export</MenubarTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export analytics data and reports</p>
                  </TooltipContent>
                </Tooltip>
                <MenubarContent>
                  <MenubarItem>
                    PDF Report
                    <MenubarShortcut>⌘P</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    CSV Data
                    <MenubarShortcut>⌘C</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem>
                    Excel Workbook
                    <MenubarShortcut>⌘E</MenubarShortcut>
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MenubarTrigger>Time Range</MenubarTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select date range for analytics data</p>
                  </TooltipContent>
                </Tooltip>
                <MenubarContent>
                  <MenubarItem>Today</MenubarItem>
                  <MenubarItem>Last 7 Days</MenubarItem>
                  <MenubarItem>Last 30 Days</MenubarItem>
                  <MenubarItem>Last Quarter</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Custom Range...</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {analytics.period.start} to {analytics.period.end}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Current analytics reporting period</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

      {/* Overview Cards */}
      <Suspense fallback={<Skeleton className="h-32 w-full" />}>
        {/* <OverviewCards analytics={analytics} comparison={comparison.changes} /> */}
      </Suspense>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>View revenue trends and financial metrics</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Analyze appointment patterns and booking data</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="customers">Customers</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Explore customer demographics and behavior</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="services">Services</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Track service performance and popularity</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="staff">Staff</TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Monitor staff performance and productivity</p>
              </TooltipContent>
            </Tooltip>
          </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <ResizablePanelGroup direction="horizontal" className="min-h-[400px] rounded-lg border">
            <ResizablePanel defaultSize={50} minSize={30}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>
                    Daily revenue for the current period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                    {/* <RevenueChart data={analytics.revenue} /> */}
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Revenue chart component pending
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={30}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Revenue by Category</CardTitle>
                  <CardDescription>
                    Service category breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                    {/* <ServiceAnalytics services={analytics.services} type="revenue" /> */}
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Service analytics component pending
                    </div>
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
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Appointment Trends</CardTitle>
                  <CardDescription>
                    Daily appointment volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                    {/* <AppointmentChart data={analytics.appointments} /> */}
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Appointment chart component pending
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <Card className="h-full">
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
          <ResizablePanelGroup direction="vertical" className="min-h-[500px] rounded-lg border">
            <ResizablePanel defaultSize={60} minSize={40}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Customer Growth</CardTitle>
                  <CardDescription>
                    New vs returning customers over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
                    {/* <CustomerInsights customers={analytics.customers} /> */}
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Customer insights component pending
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={50} minSize={35}>
                  <Card className="h-full border-r">
                    <CardHeader>
                      <CardTitle>Customer Demographics</CardTitle>
                      <CardDescription>
                        Age groups and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">18-25 years</span>
                          <span className="text-sm text-muted-foreground">
                            15%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">26-40 years</span>
                          <span className="text-sm text-muted-foreground">
                            45%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">41+ years</span>
                          <span className="text-sm text-muted-foreground">
                            40%
                          </span>
                        </div>
                        <Separator />
                        <div className="pt-2">
                          <span className="text-sm font-medium">Total Active</span>
                          <p className="text-2xl font-bold">
                            {analytics.customers?.totalCustomers || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={35}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Customer Lifetime Value</CardTitle>
                      <CardDescription>
                        Revenue and visit patterns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Average CLV</p>
                          <p className="text-2xl font-bold">
                            $0
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Avg. Visits/Customer</p>
                          <p className="text-xl font-semibold">
                            {analytics.customers?.averageVisits || '0'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Retention Rate</p>
                          <p className="text-xl font-semibold">
                            {analytics.customers?.retentionRate || '0'}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
            <ResizablePanel defaultSize={65} minSize={45}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Service Performance</CardTitle>
                  <CardDescription>
                    Most popular and profitable services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    {/* <ServiceAnalytics services={analytics.services} type="performance" /> */}
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Service performance component pending
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={25}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={50} minSize={30}>
                  <Card className="h-full border-b">
                    <CardHeader>
                      <CardTitle>Service Categories</CardTitle>
                      <CardDescription>
                        Category performance breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Hair Services</span>
                          <span className="text-sm text-muted-foreground">
                            {analytics.services?.categoryBreakdown?.['Hair'] || 0} bookings
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Nail Services</span>
                          <span className="text-sm text-muted-foreground">
                            {analytics.services?.categoryBreakdown?.['Nails'] || 0} bookings
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Spa Services</span>
                          <span className="text-sm text-muted-foreground">
                            {analytics.services?.categoryBreakdown?.['Spa'] || 0} bookings
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={30}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Booking Patterns</CardTitle>
                      <CardDescription>
                        Peak service times
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Peak Hours</p>
                          <p className="text-lg font-semibold">
                            10:00 AM - 2:00 PM
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Busiest Day</p>
                          <p className="text-lg font-semibold">
                            Saturday
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                          <p className="text-lg font-semibold">
                            45 min
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <ResizablePanelGroup direction="horizontal" className="min-h-[500px] rounded-lg border">
            <ResizablePanel defaultSize={70} minSize={50}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Staff Performance Overview</CardTitle>
                  <CardDescription>
                    Individual staff metrics and productivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    {/* <StaffPerformance staff={analytics.staff} /> */}
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Staff performance component pending
                    </div>
                  </Suspense>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30} minSize={25}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={40}>
                  <Card className="h-full border-b">
                    <CardHeader>
                      <CardTitle>Team Metrics</CardTitle>
                      <CardDescription>
                        Overall team performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Active Staff</p>
                          <p className="text-2xl font-bold">
                            {analytics.staff?.totalStaff || 0}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Avg. Utilization</p>
                          <p className="text-xl font-semibold">
                            {Math.round(analytics.staff?.topPerformers?.[0]?.utilization || 75)}%
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Top Performer</p>
                          <p className="text-sm font-medium">
                            {analytics.staff?.topPerformers?.[0]?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={40} minSize={30}>
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle>Schedule Efficiency</CardTitle>
                      <CardDescription>
                        Time and booking optimization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Booking Rate</span>
                          <span className="text-sm font-semibold">
                            85%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">No-show Rate</span>
                          <span className="text-sm font-semibold">
                            8%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Overtime Hours</span>
                          <span className="text-sm font-semibold">
                            12h
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>
      </Tabs>
      </div>
    </TooltipProvider>
  )
}