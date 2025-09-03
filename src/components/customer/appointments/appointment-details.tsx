"use client"
import { useState } from 'react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Alert,
  AlertDescription,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  X,
  Star,
  Navigation,
  Car,
} from 'lucide-react'
import Link from 'next/link'
import type { Database } from '@/types/database.types'
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services: Database['public']['Tables']['services']['Row'] | null
  staff: Database['public']['Tables']['staff']['Row'] | null
  salons: Database['public']['Tables']['salons']['Row'] | null
  reviews?: Database['public']['Tables']['reviews']['Row'] | null
  add_ons?: Database['public']['Tables']['appointment_add_ons']['Row'][] | null
}
interface AppointmentDetailsProps {
  appointment: Appointment
  onReschedule?: () => void
  onCancel?: () => void
}
export function AppointmentDetails({ 
  appointment, 
  onReschedule,
  onCancel 
}: AppointmentDetailsProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const isPast = new Date(appointment.appointment_date) < new Date()
  const isUpcoming = !isPast && appointment.status !== 'cancelled'
  const canReview = appointment.status === 'completed' && !appointment.reviews
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'completed':
        return 'text-blue-600 bg-blue-50'
      case 'cancelled':
        return 'text-red-600 bg-red-50'
      case 'no_show':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <AlertCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }
  const handleCancel = async () => {
    setCancelling(true)
    try {
      await onCancel?.()
      setShowCancelDialog(false)
    } finally {
      setCancelling(false)
    }
  }
  const getStaffInitials = () => {
    if (!appointment.staff) return 'ST'
    return `${appointment.staff.first_name?.[0] || ''}${appointment.staff.last_name?.[0] || ''}`
  }
  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {appointment.status === 'pending' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your appointment is pending confirmation from the salon.
          </AlertDescription>
        </Alert>
      )}
      {appointment.status === 'cancelled' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            This appointment has been cancelled.
            {appointment.cancellation_reason && (
              <p className="mt-1">Reason: {appointment.cancellation_reason}</p>
            )}
          </AlertDescription>
        </Alert>
      )}
      {/* Main Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {appointment.services?.name || 'Service'}
              </CardTitle>
              <CardDescription className="mt-1">
                Appointment #{appointment.id.slice(0, 8)}
              </CardDescription>
            </div>
            <Badge className={`${getStatusColor(appointment.status)} border-0`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(appointment.status)}
                {appointment.status.replace('_', ' ')}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date and Time */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Date</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(appointment.appointment_date), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Time</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.start_time} - {appointment.end_time}
                  {appointment.duration && (
                    <span className="ml-1">({appointment.duration} minutes)</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <Separator />
          {/* Staff Member */}
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={appointment.staff?.photo_url || undefined} />
              <AvatarFallback>{getStaffInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">
                {appointment.staff?.first_name} {appointment.staff?.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {appointment.staff?.specialties ? 
                  `Specialist in ${appointment.staff.specialties.slice(0, 2).join(', ')}` : 
                  'Professional Stylist'
                }
              </p>
            </div>
            {appointment.staff?.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">
                  {appointment.staff.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
          <Separator />
          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{appointment.salons?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {appointment.salons?.address}
                </p>
                {appointment.salons?.city && (
                  <p className="text-sm text-muted-foreground">
                    {appointment.salons.city}, {appointment.salons.state} {appointment.salons.zip_code}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-8">
              <Button variant="outline" size="sm">
                <Navigation className="h-4 w-4 mr-1" />
                Get Directions
              </Button>
              {appointment.salons?.parking_available && (
                <Badge variant="secondary">
                  <Car className="h-3 w-3 mr-1" />
                  Parking Available
                </Badge>
              )}
            </div>
          </div>
          <Separator />
          {/* Pricing */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Service Price</span>
              <span className="font-medium">
                ${appointment.services?.price?.toFixed(2) || '0.00'}
              </span>
            </div>
            {appointment.add_ons && appointment.add_ons.length > 0 && (
              <>
                <div className="text-sm text-muted-foreground">
                  Add-ons:
                </div>
                {appointment.add_ons.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span className="ml-4">{addon.name}</span>
                    <span>${addon.price?.toFixed(2) || '0.00'}</span>
                  </div>
                ))}
              </>
            )}
            {appointment.discount_amount && appointment.discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${appointment.discount_amount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>${appointment.total_price?.toFixed(2) || '0.00'}</span>
            </div>
            {appointment.deposit_amount && appointment.deposit_amount > 0 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Deposit Paid</span>
                <span>${appointment.deposit_amount.toFixed(2)}</span>
              </div>
            )}
          </div>
          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Notes</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {appointment.notes}
                </p>
              </div>
            </>
          )}
          {/* Contact Info */}
          <Separator />
          <div className="flex items-center gap-4">
            {appointment.salons?.phone && (
              <Button variant="outline" size="sm" asChild>
                <a href={`tel:${appointment.salons.phone}`}>
                  <Phone className="h-4 w-4 mr-1" />
                  Call Salon
                </a>
              </Button>
            )}
            {appointment.salons?.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${appointment.salons.email}`}>
                  <Mail className="h-4 w-4 mr-1" />
                  Email Salon
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Actions */}
      {isUpcoming && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {onReschedule && (
              <Button onClick={onReschedule} variant="outline">
                <Edit className="h-4 w-4 mr-1" />
                Reschedule
              </Button>
            )}
            {onCancel && (
              <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <X className="h-4 w-4 mr-1" />
                    Cancel Appointment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Appointment</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this appointment? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowCancelDialog(false)}
                      disabled={cancelling}
                    >
                      Keep Appointment
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}
      {canReview && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>
              Share your experience with others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href={`/reviews/new?appointment=${appointment.id}`}>
                <Star className="h-4 w-4 mr-1" />
                Write a Review
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}