'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Calendar,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  XCircle,
  CheckCircle,
  Clock,
  CalendarDays,
  CalendarCheck,
  Users,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Appointment {
  id: string
  salon_id: string
  customer_id: string
  staff_id: string
  service_id: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  total_price: number
  created_at: string
  customer?: { id: string; full_name: string; email: string; phone: string }
  staff?: { id: string; user_id: string }
  service?: { id: string; name: string; duration_minutes: number; price: number }
  salon?: { id: string; name: string; address: string }
}

interface AppointmentsManagementClientProps {
  appointments: Appointment[]
  counts: {
    total: number
    scheduled: number
    completed: number
    cancelled: number
    today: number
    week: number
  }
  salons: Array<{ id: string; name: string }>
  services: Array<{ id: string; name: string }>
}

export function AppointmentsManagementClient({ 
  appointments: initialAppointments, 
  counts,
  salons,
  services
}: AppointmentsManagementClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [searchQuery, setSearchQuery] = useState('')
  const [salonFilter, setSalonFilter] = useState<string>('all')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = !searchQuery || 
      appointment.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.service?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSalon = salonFilter === 'all' || appointment.salon_id === salonFilter
    const matchesService = serviceFilter === 'all' || appointment.service_id === serviceFilter
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter
    
    return matchesSearch && matchesSalon && matchesService && matchesStatus
  })

  const handleStatusChange = async (appointment: Appointment, newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/appointments/${appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Failed to update appointment status')
      
      const { appointment: updated } = await response.json()
      setAppointments(prev => prev.map(a => a.id === appointment.id ? updated : a))
      toast.success('Appointment status updated')
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment status')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!selectedAppointment) return
    
    setLoading(true)
    try {
      await handleStatusChange(selectedAppointment, 'cancelled')
    } finally {
      setCancelDialogOpen(false)
      setSelectedAppointment(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Scheduled', variant: 'default' },
      confirmed: { label: 'Confirmed', variant: 'secondary' },
      in_progress: { label: 'In Progress', variant: 'warning' },
      completed: { label: 'Completed', variant: 'success' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
      no_show: { label: 'No Show', variant: 'outline' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    return <Badge variant={config.variant as any}>{config.label}</Badge>
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a')
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground">
            Manage all platform appointments and bookings
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.today}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.week}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.scheduled}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.cancelled}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Appointments</CardTitle>
                <CardDescription>
                  View and manage all appointments across the platform
                </CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                {filteredAppointments.length} appointments
              </Badge>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by customer or service..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={salonFilter} onValueChange={setSalonFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Salons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salons</SelectItem>
                  {salons.map(salon => (
                    <SelectItem key={salon.id} value={salon.id}>
                      {salon.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Salon</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No appointments found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="text-sm">
                          {formatDateTime(appointment.start_time)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {appointment.customer?.full_name || 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.customer?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {appointment.service?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {appointment.salon?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          {appointment.total_price?.toFixed(2) || '0.00'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(appointment, 'confirmed')}
                              disabled={appointment.status === 'confirmed'}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(appointment, 'completed')}
                              disabled={appointment.status === 'completed'}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => {
                                setSelectedAppointment(appointment)
                                setCancelDialogOpen(true)
                              }}
                              disabled={appointment.status === 'cancelled'}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? The customer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}