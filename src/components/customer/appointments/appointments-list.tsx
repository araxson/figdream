"use client"
import { useState } from 'react'
import { format } from 'date-fns'
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  MoreHorizontal,
  Eye,
  Edit,
  X,
  MessageSquare,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database.types'
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services: Database['public']['Tables']['services']['Row'] | null
  staff_profiles: Database['public']['Tables']['staff_profiles']['Row'] | null
  salons: Database['public']['Tables']['salons']['Row'] | null
}
interface AppointmentsListProps {
  appointments: Appointment[]
  customerId: string
}
export function AppointmentsList({ appointments }: AppointmentsListProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const now = new Date()
  const categorizedAppointments = {
    upcoming: appointments.filter(apt => 
      new Date(apt.appointment_date) >= now && 
      apt.status !== 'cancelled'
    ).sort((a, b) => 
      new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
    ),
    past: appointments.filter(apt => 
      new Date(apt.appointment_date) < now || 
      apt.status === 'completed'
    ).sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    ),
    cancelled: appointments.filter(apt => 
      apt.status === 'cancelled'
    ).sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    ),
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {appointment.services?.name || 'Service'}
            </CardTitle>
            <CardDescription>
              {appointment.salons?.name || 'Salon'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status.replace('_', ' ')}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/appointments/${appointment.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                {appointment.status === 'confirmed' && (
                  <>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  </>
                )}
                {appointment.status === 'completed' && (
                  <DropdownMenuItem asChild>
                    <Link href={`/reviews/new?appointment=${appointment.id}`}>
                      <Star className="mr-2 h-4 w-4" />
                      Leave Review
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(appointment.appointment_date), 'MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {appointment.start_time} - {appointment.end_time}
              {appointment.total_duration && ` (${appointment.total_duration} min)`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span>
              {appointment.staff_profiles?.title || 'Staff Member'}
            </span>
          </div>
          {false && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">Location</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>${appointment.total_amount?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
        {appointment.notes && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upcoming' | 'past' | 'cancelled')}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="upcoming">
          Upcoming ({categorizedAppointments.upcoming.length})
        </TabsTrigger>
        <TabsTrigger value="past">
          Past ({categorizedAppointments.past.length})
        </TabsTrigger>
        <TabsTrigger value="cancelled">
          Cancelled ({categorizedAppointments.cancelled.length})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="upcoming" className="mt-4">
        <ScrollArea className="h-[600px] pr-4">
          {categorizedAppointments.upcoming.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No upcoming appointments
                </p>
                <div className="mt-4 text-center">
                  <Button asChild>
                    <Link href="/book">Book an Appointment</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            categorizedAppointments.upcoming.map(renderAppointmentCard)
          )}
        </ScrollArea>
      </TabsContent>
      <TabsContent value="past" className="mt-4">
        <ScrollArea className="h-[600px] pr-4">
          {categorizedAppointments.past.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No past appointments
                </p>
              </CardContent>
            </Card>
          ) : (
            categorizedAppointments.past.map(renderAppointmentCard)
          )}
        </ScrollArea>
      </TabsContent>
      <TabsContent value="cancelled" className="mt-4">
        <ScrollArea className="h-[600px] pr-4">
          {categorizedAppointments.cancelled.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
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
  )
}