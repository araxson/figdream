import { createClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"
import { 
  getLocationManagerData, 
  getLocationReports 
} from "@/lib/data-access/location-manager"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui"
import { 
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Award,
  BarChart,
  PieChart
} from "lucide-react"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from "date-fns"

export default async function LocationReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login/location-manager")
  }
  
  // Get location manager's data and reports
  let locationData
  let monthlyReport
  let weeklyReport
  
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
  
  try {
    locationData = await getLocationManagerData(user.id)
    monthlyReport = await getLocationReports(locationData.locationId, monthStart, monthEnd)
    weeklyReport = await getLocationReports(locationData.locationId, weekStart, weekEnd)
  } catch (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Error: Unable to load reports. {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
  
  // Calculate completion rate
  const monthlyCompletionRate = monthlyReport.totalAppointments > 0
    ? (monthlyReport.completedAppointments / monthlyReport.totalAppointments) * 100
    : 0
  
  const weeklyCompletionRate = weeklyReport.totalAppointments > 0
    ? (weeklyReport.completedAppointments / weeklyReport.totalAppointments) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Performance insights for {locationData.location.name}
        </p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthlyReport.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(monthStart, 'MMM yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyReport.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyReport.completedAppointments} completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyCompletionRate.toFixed(1)}%</div>
            <Progress value={monthlyCompletionRate} className="mt-2 h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Appointment</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${monthlyReport.averageRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue per service
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="monthly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Report</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>{format(monthStart, 'MMMM yyyy')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Appointments</span>
                  <span className="font-medium">{monthlyReport.totalAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completed</span>
                  <span className="font-medium text-green-600">{monthlyReport.completedAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cancelled</span>
                  <span className="font-medium text-orange-600">{monthlyReport.cancelledAppointments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">No Shows</span>
                  <span className="font-medium text-red-600">{monthlyReport.noShowAppointments}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Revenue</span>
                    <span className="font-bold text-lg">
                      ${monthlyReport.totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Appointment Status Breakdown</CardTitle>
                <CardDescription>Monthly appointment outcomes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Completed</span>
                    <span>{monthlyCompletionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={monthlyCompletionRate} className="h-2 bg-green-100" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Cancelled</span>
                    <span>
                      {monthlyReport.totalAppointments > 0 
                        ? ((monthlyReport.cancelledAppointments / monthlyReport.totalAppointments) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={monthlyReport.totalAppointments > 0 
                      ? (monthlyReport.cancelledAppointments / monthlyReport.totalAppointments) * 100
                      : 0} 
                    className="h-2 bg-orange-100" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>No Show</span>
                    <span>
                      {monthlyReport.totalAppointments > 0 
                        ? ((monthlyReport.noShowAppointments / monthlyReport.totalAppointments) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={monthlyReport.totalAppointments > 0 
                      ? (monthlyReport.noShowAppointments / monthlyReport.totalAppointments) * 100
                      : 0} 
                    className="h-2 bg-red-100" 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance</CardTitle>
              <CardDescription>
                Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Appointments</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total</span>
                      <span className="font-medium">{weeklyReport.totalAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completed</span>
                      <span className="font-medium">{weeklyReport.completedAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <Badge variant="default">{weeklyCompletionRate.toFixed(1)}%</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Revenue</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total</span>
                      <span className="font-medium">${weeklyReport.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average</span>
                      <span className="font-medium">${weeklyReport.averageRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Per Day</span>
                      <span className="font-medium">
                        ${(weeklyReport.totalRevenue / 7).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
              {monthlyReport.popularServices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-center">Bookings</TableHead>
                      <TableHead className="text-center">Popularity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyReport.popularServices.map((service, index) => {
                      const popularity = monthlyReport.totalAppointments > 0
                        ? (service.count / monthlyReport.totalAppointments) * 100
                        : 0
                      
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{service.name}</TableCell>
                          <TableCell className="text-center">{service.count}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Progress value={popularity} className="w-20 h-2" />
                              <span className="text-sm">{popularity.toFixed(0)}%</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No service data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance</CardTitle>
              <CardDescription>Monthly staff metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyReport.staffPerformance.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff Member</TableHead>
                      <TableHead className="text-center">Appointments</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Avg per Service</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyReport.staffPerformance.map((staff, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell className="text-center">{staff.appointments}</TableCell>
                        <TableCell className="text-right">${staff.revenue.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          ${staff.appointments > 0 
                            ? (staff.revenue / staff.appointments).toFixed(2)
                            : '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No staff performance data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}