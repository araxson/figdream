"use client"
import { useState } from 'react'
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  User,
  DollarSign,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database.types'
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services: Database['public']['Tables']['services']['Row'] | null
  customers: Database['public']['Tables']['customers']['Row'] | null
  salons: Database['public']['Tables']['salons']['Row'] | null
}
interface StaffAppointmentsListProps {
  appointments: Appointment[]
  staffId: string
}
export function StaffAppointmentsList({ appointments }: StaffAppointmentsListProps) {
  const [_selectedDate, _setSelectedDate] = useState<Date>(new Date())
  // Group appointments by status
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date)
    const today = new Date()
    return aptDate.toDateString() === today.toDateString()
  })
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date)
    const today = new Date()
    return aptDate > today && apt.status !== 'cancelled'
  })
  const categorizedAppointments = {
    today: todayAppointments,
    upcoming: upcomingAppointments,
    completed: appointments.filter(apt => apt.status === 'completed'),
    cancelled: appointments.filter(apt => apt.status === 'cancelled'),
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'no_show':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }
  const getCustomerInitials = (customer: Appointment['customers']) => {
    if (!customer) return 'CU'
    return `${customer.first_name?.[0] || ''}${customer.last_name?.[0] || ''}`
  }
  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={appointment.customers?.avatar_url || undefined} />
              <AvatarFallback>
                {getCustomerInitials(appointment.customers)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">
                {appointment.customers?.first_name} {appointment.customers?.last_name}
              </CardTitle>
              <CardDescription className="text-xs">
                {appointment.services?.name}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(appointment.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/appointments/${appointment.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </DropdownMenuItem>
                {appointment.status === 'confirmed' && (
                  <>
                    <DropdownMenuItem>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Check In
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark Complete
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Call Customer
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(appointment.appointment_date), 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.start_time} - {appointment.end_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${appointment.total_price?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{appointment.duration || 30} min</span>
          </div>
        </div>
        {appointment.notes && (
          <div className="mt-3 p-2 bg-muted rounded text-sm">
            <p className="text-muted-foreground">{appointment.notes}</p>
          </div>
        )}
        {appointment.customers?.phone && (
          <div className="mt-3 pt-3 border-t flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${appointment.customers.phone}`}>
                <Phone className="h-3 w-3 mr-1" />
                Call
              </a>
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-3 w-3 mr-1" />
              Message
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Today</CardDescription>
            <CardTitle className="text-2xl">
              {todayAppointments.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Week</CardDescription>
            <CardTitle className="text-2xl">
              {upcomingAppointments.filter(apt => {
                const aptDate = new Date(apt.appointment_date)
                const weekFromNow = new Date()
                weekFromNow.setDate(weekFromNow.getDate() + 7)
                return aptDate <= weekFromNow
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-2xl">
              {categorizedAppointments.completed.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue Today</CardDescription>
            <CardTitle className="text-2xl">
              ${todayAppointments.reduce((sum, apt) => 
                sum + (apt.total_price || 0), 0
              ).toFixed(0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      {/* Appointments Tabs */}
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today">
            Today ({categorizedAppointments.today.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({categorizedAppointments.upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({categorizedAppointments.completed.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({categorizedAppointments.cancelled.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="mt-4">
          <ScrollArea className="h-[500px]">
            {categorizedAppointments.today.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No appointments scheduled for today
                  </p>
                </CardContent>
              </Card>
            ) : (
              categorizedAppointments.today.map(renderAppointmentCard)
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <ScrollArea className="h-[500px]">
            {categorizedAppointments.upcoming.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No upcoming appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              categorizedAppointments.upcoming.map(renderAppointmentCard)
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <ScrollArea className="h-[500px]">
            {categorizedAppointments.completed.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No completed appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              categorizedAppointments.completed.map(renderAppointmentCard)
            )}
          </ScrollArea>
        </TabsContent>
        <TabsContent value="cancelled" className="mt-4">
          <ScrollArea className="h-[500px]">
            {categorizedAppointments.cancelled.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">
                    No cancelled appointments
                  </p>
                </CardContent>
              </Card>
            ) : (
              categorizedAppointments.cancelled.map(renderAppointmentCard)
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}