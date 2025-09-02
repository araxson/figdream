import { createClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"
import { 
  getLocationManagerData, 
  getAllLocationAppointments,
  getLocationAppointments 
} from "@/lib/data-access/location-manager"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription
} from "@/components/ui"
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from "lucide-react"
import { format } from "date-fns"

export default async function LocationAppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login/location-manager")
  }
  
  // Get location manager's data
  let locationData
  let todaysAppointments
  let allAppointments
  
  try {
    locationData = await getLocationManagerData(user.id)
    todaysAppointments = await getLocationAppointments(locationData.locationId, new Date())
    const allData = await getAllLocationAppointments(locationData.locationId, 1, 50)
    allAppointments = allData.appointments
  } catch (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Error: Unable to load appointments. {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
  
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "outline" as const, icon: AlertCircle },
      confirmed: { label: "Confirmed", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "In Progress", variant: "secondary" as const, icon: Clock },
      completed: { label: "Completed", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Cancelled", variant: "destructive" as const, icon: XCircle },
      no_show: { label: "No Show", variant: "destructive" as const, icon: XCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }
  
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a')
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy')
  }
  
  const upcomingToday = todaysAppointments.filter(apt => 
    ['pending', 'confirmed'].includes(apt.status)
  )
  
  const completedToday = todaysAppointments.filter(apt => 
    apt.status === 'completed'
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
        <p className="text-muted-foreground">
          View and manage appointments at {locationData.location.name}
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Appointments scheduled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingToday.length}</div>
            <p className="text-xs text-muted-foreground">Pending & confirmed</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday.length}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${completedToday.reduce((sum, apt) => sum + (apt.total_amount || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From completed appointments</p>
          </CardContent>
        </Card>
      </div>
      
      {upcomingToday.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have {upcomingToday.length} upcoming appointment{upcomingToday.length > 1 ? 's' : ''} today.
            Next appointment starts at {upcomingToday[0] && formatTime(upcomingToday[0].start_time)}.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="today" className="space-y-4">
        <TabsList>
          <TabsTrigger value="today">Today's Appointments</TabsTrigger>
          <TabsTrigger value="all">All Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {todaysAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaysAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">
                            {formatTime(appointment.start_time)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(appointment.end_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {appointment.profiles?.full_name || 'Guest'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.profiles?.phone || appointment.profiles?.email || 'No contact'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.staff_profiles?.profiles?.full_name || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {appointment.appointment_services?.map((service: any) => (
                              <div key={service.id} className="text-sm">
                                {service.services?.name || 'Unknown Service'}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${appointment.total_amount?.toFixed(2) || '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No appointments today</h3>
                  <p className="text-muted-foreground">
                    There are no appointments scheduled for today.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>Recent appointments at your location</CardDescription>
            </CardHeader>
            <CardContent>
              {allAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div className="font-medium">
                            {formatDate(appointment.start_time)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {appointment.profiles?.full_name || 'Guest'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.profiles?.phone || appointment.profiles?.email || 'No contact'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {appointment.staff_profiles?.profiles?.full_name || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {appointment.appointment_services?.map((service: any) => (
                              <div key={service.id} className="text-sm">
                                {service.services?.name || 'Unknown Service'}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(appointment.status)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${appointment.total_amount?.toFixed(2) || '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold">No appointments yet</h3>
                  <p className="text-muted-foreground">
                    There are no appointments recorded for this location.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}