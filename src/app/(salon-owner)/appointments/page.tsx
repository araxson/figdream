import { createClient } from "@/lib/database/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { AppointmentsFilter } from './appointments-filter'
import { MoreHorizontal, Calendar, Clock, User, DollarSign, CheckCircle, XCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import Link from "next/link"

export default async function AppointmentsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login/salon-owner")

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name")
    .eq("owner_id", user.id)
    .single()

  if (!salon) {
    redirect("/salon-admin/dashboard")
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id,
      start_time,
      end_time,
      status,
      total_price,
      notes,
      created_at,
      customers (
        id,
        first_name,
        last_name,
        email,
        phone
      ),
      staff_profiles (
        id,
        first_name,
        last_name
      ),
      appointment_services (
        id,
        quantity,
        price,
        services (
          id,
          name,
          duration
        )
      )
    `)
    .eq("salon_id", salon.id)
    .order("start_time", { ascending: false })
    .limit(50)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "Pending", variant: "outline" as const, icon: AlertCircle },
      confirmed: { label: "Confirmed", variant: "default" as const, icon: CheckCircle },
      in_progress: { label: "In Progress", variant: "secondary" as const, icon: Clock },
      completed: { label: "Completed", variant: "success" as const, icon: CheckCircle },
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      }),
      time: date.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit",
        hour12: true 
      })
    }
  }

  const upcomingToday = appointments?.filter(apt => {
    const aptDate = new Date(apt.start_time).toDateString()
    const today = new Date().toDateString()
    return aptDate === today && ["pending", "confirmed"].includes(apt.status)
  }).length || 0

  const pendingCount = appointments?.filter(apt => apt.status === "pending").length || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage and track all salon appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/salon-admin/appointments/new">
            <Calendar className="mr-2 h-4 w-4" />
            New Appointment
          </Link>
        </Button>
      </div>

      {pendingCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            You have {pendingCount} pending appointment{pendingCount > 1 ? 's' : ''} waiting for confirmation. 
            Please review and confirm them to secure the bookings.
          </AlertDescription>
        </Alert>
      )}

      {upcomingToday === 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No Appointments Today</AlertTitle>
          <AlertDescription>
            You don't have any appointments scheduled for today. 
            Consider running a promotion or reaching out to regular customers.
          </AlertDescription>
        </Alert>
      )}

      {upcomingToday > 5 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Busy Day Ahead</AlertTitle>
          <AlertDescription>
            You have {upcomingToday} appointments scheduled for today. 
            Make sure all staff members are prepared and supplies are stocked.
          </AlertDescription>
        </Alert>
      )}

      <AppointmentsFilter />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingToday}</div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Confirmation</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All appointments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>View and manage appointment details</CardDescription>
        </CardHeader>
        <CardContent>
          {appointments && appointments.length > 0 ? (
            <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.start_time)
                  const customer = appointment.customers
                  const staff = appointment.staff_profiles
                  const services = appointment.appointment_services || []
                  
                  return (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{date}</div>
                          <div className="text-sm text-muted-foreground">{time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {customer ? `${customer.first_name} ${customer.last_name}` : "Guest"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {customer?.phone || customer?.email || "No contact"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {staff ? `${staff.first_name} ${staff.last_name}` : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {services.slice(0, 2).map((service, idx) => (
                            <div key={service.id} className="text-sm">
                              {service.services?.name}
                              {service.quantity > 1 && ` x${service.quantity}`}
                            </div>
                          ))}
                          {services.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{services.length - 2} more
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${appointment.total_price?.toFixed(2) || "0.00"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/salon-admin/appointments/${appointment.id}`}>
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/salon-admin/appointments/${appointment.id}/edit`}>
                                Edit appointment
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Send reminder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  Cancel appointment
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. The customer will be notified
                                    of the cancellation and may need to reschedule.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Keep appointment</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90">
                                    Cancel appointment
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            
            {/* Pagination */}
            {appointments && appointments.length > 0 && (
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" isActive>1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#" >2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            </>
          ) : (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No appointments yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first appointment
              </p>
              <Button asChild>
                <Link href="/salon-admin/appointments/new">
                  Create Appointment
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}