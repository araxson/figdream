'use client'
import { useState } from 'react'
import { Database } from '@/types/database.types'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { X, AlertTriangle } from 'lucide-react'
type Appointment = Database['public']['Tables']['appointments']['Row']
interface CancelAppointmentDialogProps {
  appointment: Appointment & {
    services?: Array<{
      name: string
      duration: number
      price: number
    }>
    staff_profiles?: {
      display_name: string | null
    }
    salons?: {
      name: string
    }
  }
  onCancel?: (appointmentId: string, reason: string) => Promise<void>
  trigger?: React.ReactNode
}
function CancelAppointmentDialog({
  appointment,
  onCancel,
  trigger
}: CancelAppointmentDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // Calculate if within cancellation window (e.g., 24 hours)
  const appointmentDate = new Date(`${appointment.date} ${appointment.start_time}`)
  const hoursUntilAppointment = (appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60)
  const isWithinCancellationWindow = hoursUntilAppointment > 24
  const handleCancel = async () => {
    if (!onCancel) {
      // Default cancellation logic if no handler provided
      try {
        setIsLoading(true)
        const response = await fetch(`/api/appointments/${appointment.id}/cancel`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: cancellationReason,
          }),
        })
        if (!response.ok) {
          throw new Error('Failed to cancel appointment')
        }
        toast.success('Appointment cancelled successfully')
        setIsOpen(false)
        // Refresh the page to show updated status
        window.location.reload()
      } catch (_error) {
        toast.error('Failed to cancel appointment. Please try again.')
      } finally {
        setIsLoading(false)
      }
    } else {
      // Use provided handler
      try {
        setIsLoading(true)
        await onCancel(appointment.id, cancellationReason)
        toast.success('Appointment cancelled successfully')
        setIsOpen(false)
      } catch (_error) {
        toast.error('Failed to cancel appointment. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="destructive" size="sm">
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this appointment?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          {/* Appointment Details */}
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm">
              <span className="font-medium">Date:</span>{' '}
              {new Date(appointment.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm">
              <span className="font-medium">Time:</span> {appointment.start_time} - {appointment.end_time}
            </p>
            {appointment.staff_profiles && (
              <p className="text-sm">
                <span className="font-medium">Staff:</span> {appointment.staff_profiles.display_name}
              </p>
            )}
            {appointment.salons && (
              <p className="text-sm">
                <span className="font-medium">Salon:</span> {appointment.salons.name}
              </p>
            )}
            {appointment.services && appointment.services.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Services:</span>
                <ul className="ml-4 mt-1">
                  {appointment.services.map((service, index) => (
                    <li key={index} className="text-muted-foreground">
                      • {service.name} (${service.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Cancellation Policy Warning */}
          {!isWithinCancellationWindow && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <span className="font-medium">Late Cancellation</span>
                <br />
                This appointment is within 24 hours. A cancellation fee may apply.
              </AlertDescription>
            </Alert>
          )}
          {/* Cancellation Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for cancellation (optional)
            </Label>
            <Textarea
              id="reason"
              placeholder="Please let us know why you&apos;re cancelling..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Keep Appointment</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Appointment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

CancelAppointmentDialog.displayName = 'CancelAppointmentDialog'

export default CancelAppointmentDialog
