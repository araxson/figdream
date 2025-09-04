"use client"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'

import { Clock, DollarSign, MapPin, FileText, CheckCircle, XCircle, AlertCircle, Clock3, Calendar } from "lucide-react"
import type { Database } from "@/types/database.types"
type Appointment = Database['public']['Tables']['appointments']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']
type Service = Database['public']['Tables']['services']['Row']
type AppointmentService = Database['public']['Tables']['appointment_services']['Row']
type StaffProfile = Database['public']['Tables']['staff_profiles']['Row']
type AppointmentDetails = Appointment & {
  profiles?: Profile | null // Customer
  staff_profiles?: (StaffProfile & {
    profiles?: Profile | null // Staff user profile
  }) | null
  appointment_services?: (AppointmentService & {
    services?: Service | null
  })[] | null
  location_name?: string
}
interface AppointmentHoverCardProps {
  appointment: AppointmentDetails
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
}
export function AppointmentHoverCard({ appointment, children, side = "right" }: AppointmentHoverCardProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'}).format(amount)
  }
  // Format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'default'
      case 'completed': return 'secondary'
      case 'cancelled': return 'destructive'
      case 'no_show': return 'destructive'
      case 'pending': return 'outline'
      default: return 'outline'
    }
  }
  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return <CheckCircle className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      case 'no_show': return <XCircle className="h-3 w-3" />
      case 'pending': return <Clock3 className="h-3 w-3" />
      default: return <AlertCircle className="h-3 w-3" />
    }
  }
  const startDateTime = formatDateTime(appointment.start_time)
  const endDateTime = formatDateTime(appointment.end_time)
  const customerName = appointment.profiles?.full_name || 'Unknown Customer'
  const staffName = appointment.staff_profiles?.profiles?.full_name || 
                   appointment.staff_profiles?.display_name || 'Unassigned'
  const services = appointment.appointment_services || []
  const totalDuration = services.reduce((sum, service) => sum + (service.duration_minutes || 0), 0)
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent side={side} className="w-80">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold">Appointment #{appointment.id.slice(-8)}</h4>
              <p className="text-xs text-muted-foreground">
                {startDateTime.date} at {startDateTime.time}
              </p>
            </div>
            <Badge variant={getStatusBadgeVariant(appointment.status)} className="text-xs">
              {getStatusIcon(appointment.status)}
              <span className="ml-1">{appointment.status.replace('_', ' ').toUpperCase()}</span>
            </Badge>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={appointment.profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {customerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs font-medium">{customerName}</p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={appointment.staff_profiles?.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {staffName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-xs font-medium">{staffName}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <p className="text-xs font-medium">Services:</p>
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span>{service.services?.name || 'Unknown Service'}</span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{service.duration_minutes}m</span>
                  <span>{formatCurrency(service.price)}</span>
                </div>
              </div>
            ))}
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>{totalDuration}m total</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-green-500" />
              <span>{formatCurrency(appointment.total_amount)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-purple-500" />
              <span>{startDateTime.time} - {endDateTime.time}</span>
            </div>
            {appointment.location_name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-500" />
                <span className="truncate">{appointment.location_name}</span>
              </div>
            )}
          </div>
          {appointment.notes && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium mb-1 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Notes:
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {appointment.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
