import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Clock, Building, Calendar } from "lucide-react"
interface BookingRules {
  advance_booking_days?: number
  cancellation_hours?: number
  max_bookings_per_day?: number
  special_notes?: string
}
interface NotificationPreferencesProps {
  bookingRules: BookingRules
}
export function NotificationPreferences({ bookingRules }: NotificationPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Rules</CardTitle>
        <CardDescription>Configuration for appointment bookings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Advance Booking
            </Label>
            <p className="font-medium">
              {bookingRules.advance_booking_days || 30} days in advance
            </p>
            <p className="text-xs text-muted-foreground">
              How far in advance customers can book appointments
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cancellation Window
            </Label>
            <p className="font-medium">
              {bookingRules.cancellation_hours || 24} hours before appointment
            </p>
            <p className="text-xs text-muted-foreground">
              Minimum notice required for cancellations
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Daily Booking Limit
            </Label>
            <p className="font-medium">
              {bookingRules.max_bookings_per_day || 10} bookings per customer
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum appointments a customer can book per day
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground flex items-center gap-2">
              <Building className="h-4 w-4" />
              Location Type
            </Label>
            <Badge variant="default">Physical Location</Badge>
            <p className="text-xs text-muted-foreground">
              In-person appointments only
            </p>
          </div>
        </div>
        {bookingRules.special_notes && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm text-muted-foreground">Special Notes</Label>
            <p className="text-sm">{bookingRules.special_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}