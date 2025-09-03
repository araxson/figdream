"use client"
import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui"
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Phone,
  Mail,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database.types'
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services: Database['public']['Tables']['services']['Row'] | null
  staff_profiles: Database['public']['Tables']['staff_profiles']['Row'] | null
  salons: Database['public']['Tables']['salons']['Row'] | null
  reviews?: Database['public']['Tables']['reviews']['Row'] | null
}
interface AppointmentCardProps {
  appointment: Appointment
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
        <CardFooter className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link href={`/appointments/${appointment.id}`}>
              View Details
            </Link>
          </Button>
          {isUpcoming && (
            <>
              {onReschedule && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onReschedule}
                  className="flex-1"
                >
                  Reschedule
                </Button>
              )}
              {onCancel && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </>
          )}
          {canReview && (
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href={`/reviews/new?appointment=${appointment.id}`}>
                <Star className="h-4 w-4 mr-1" />
                Review
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}