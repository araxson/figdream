"use client"

import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { Star } from 'lucide-react'
import Link from 'next/link'
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

interface AppointmentCardActionsProps {
  appointment: AppointmentWithRelations
  isUpcoming: boolean
  canReview: boolean
  onReschedule?: () => void
  onCancel?: () => void
}

export function AppointmentCardActions({ 
  appointment, 
  isUpcoming,
  canReview,
  onReschedule,
  onCancel
}: AppointmentCardActionsProps) {
  return (
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
  )
}