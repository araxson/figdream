'use client'

import { Button } from '@/components/ui/button'
import { CalendarIcon, Repeat, Users, ListPlus } from 'lucide-react'
import type { BookingActionsToolbarProps } from '../booking-utils/booking-manager-types'

export function BookingActionsToolbar({
  onNewBooking,
  onRecurring,
  onGroup,
  onWaitingList
}: BookingActionsToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onNewBooking}>
        <CalendarIcon className="mr-2 h-4 w-4" />
        New Booking
      </Button>
      <Button variant="outline" onClick={onRecurring}>
        <Repeat className="mr-2 h-4 w-4" />
        Recurring
      </Button>
      <Button variant="outline" onClick={onGroup}>
        <Users className="mr-2 h-4 w-4" />
        Group
      </Button>
      <Button variant="outline" onClick={onWaitingList}>
        <ListPlus className="mr-2 h-4 w-4" />
        Waiting List
      </Button>
    </div>
  )
}