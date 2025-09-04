import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Phone,
  Mail,
} from 'lucide-react'
import { AppointmentCardActions } from './appointment-card-actions'
import type { 
  Appointment,
  Service,
  StaffProfile,
  Salon,
  Review
} from '@/types/db-types'

// Extended appointment type with relationships
type AppointmentWithRelations = Appointment & {
  services: Service | null
  staff_profiles: StaffProfile | null
  salons: Salon | null
  reviews?: Review | null
}

interface AppointmentCardProps {
  appointment: AppointmentWithRelations
  showActions?: boolean
  onReschedule?: () => void
  onCancel?: () => void
  className?: string
}
export function AppointmentCard({ 
  appointment, 
  showActions = true,
  onReschedule,
  onCancel,
  className 
}: AppointmentCardProps) {
  const isPast = new Date(appointment.appointment_date) < new Date()
  const isUpcoming = !isPast && appointment.status !== 'cancelled'
  const canReview = appointment.status === 'completed' && !appointment.reviews
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      case 'no_show':
        return 'secondary'
      default:
        return 'secondary'
    }
  }
  const getStaffInitials = () => {
    if (!appointment.staff_profiles) return 'ST'
    return 'ST' // Staff initials would come from joined profiles table
  }
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={undefined} />
              <AvatarFallback>{getStaffInitials()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">
                {appointment.services?.name || 'Service'}
              </CardTitle>
              <CardDescription>
                with {appointment.staff_profiles?.title || 'Staff Member'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={getStatusVariant(appointment.status)}>
            {appointment.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {appointment.start_time} - {appointment.end_time}
              {appointment.total_duration && (
                <span className="text-muted-foreground ml-1">
                  ({appointment.total_duration} minutes)
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{appointment.salons?.name}</p>
              {false && (
                <p className="text-muted-foreground text-xs">
                  {''}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              ${appointment.total_amount?.toFixed(2) || '0.00'}
            </span>
            {false && (
              <span className="text-xs text-muted-foreground">
                (Deposit: $0.00)
              </span>
            )}
          </div>
        </div>
        {appointment.notes && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{appointment.notes}</p>
          </div>
        )}
        {appointment.salons?.phone && (
          <div className="flex items-center gap-4 pt-2 border-t">
            <a 
              href={`tel:${appointment.salons.phone}`}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Phone className="h-3 w-3" />
              {appointment.salons.phone}
            </a>
            {appointment.salons?.email && (
              <a 
                href={`mailto:${appointment.salons.email}`}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-3 w-3" />
                Contact
              </a>
            )}
          </div>
        )}
      </CardContent>
      {showActions && (
        <AppointmentCardActions
          appointment={appointment}
          isUpcoming={isUpcoming}
          canReview={canReview}
          onReschedule={onReschedule}
          onCancel={onCancel}
        />
      )}
    </Card>
  )
}