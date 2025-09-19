'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react'
import type { TimeSlot, DailyAvailability } from '../types'

interface TimeSlotGridProps {
  date: Date
  availability?: DailyAvailability
  onSlotSelect: (date: Date, time: string, staffId?: string) => void
  selectedTime?: string
  selectedStaffId?: string
}

export function TimeSlotGrid({
  date,
  availability,
  onSlotSelect,
  selectedTime,
  selectedStaffId
}: TimeSlotGridProps) {
  if (!availability) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No availability data for this date
      </div>
    )
  }

  const renderTimeSlot = (slot: TimeSlot) => {
    const isPast = new Date(`${date.toDateString()} ${slot.time}`) < new Date()
    const isSelected = selectedTime === slot.time

    return (
      <TooltipProvider key={slot.time}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={`w-full relative ${
                slot.available
                  ? isPast
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-primary/10'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              disabled={!slot.available || isPast}
              onClick={() => !isPast && slot.available && onSlotSelect(date, slot.time, selectedStaffId)}
            >
              <div className={`h-full transition-all ${
                slot.available
                  ? isPast
                    ? 'bg-gray-200'
                    : 'bg-green-100 hover:bg-green-200'
                  : 'bg-red-100'
              } w-full rounded flex items-center justify-center gap-1`}>

                {slot.available ? (
                  <CheckCircle className="h-3 w-3 text-green-600" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-600" />
                )}

                <span className="text-xs font-medium">{slot.time}</span>

                {slot.capacity && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {slot.capacity.available}/{slot.capacity.total}
                  </Badge>
                )}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>{slot.time}</span>
              </div>
              <div className="flex items-center gap-2">
                {slot.available ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <XCircle className="h-3 w-3 text-red-500" />
                )}
                <span>{slot.available ? 'Available' : 'Unavailable'}</span>
              </div>
              {slot.capacity && (
                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3" />
                  <span>{slot.capacity.available} of {slot.capacity.total} slots</span>
                </div>
              )}
              {slot.staffName && (
                <div className="text-xs text-muted-foreground">
                  Staff: {slot.staffName}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">
          {date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric'
          })}
        </h3>
        <div className="flex items-center gap-2">
          <Badge variant={availability.isFullyBooked ? "destructive" : "default"}>
            {availability.isFullyBooked ? 'Fully Booked' : `${availability.slots.filter(s => s.available).length} available`}
          </Badge>
        </div>
      </div>

      {availability.isFullyBooked ? (
        <div className="text-center py-8 text-muted-foreground">
          <XCircle className="h-12 w-12 mx-auto mb-2 text-red-500" />
          <p>No available slots for this date</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {availability.slots.map(renderTimeSlot)}
        </div>
      )}
    </div>
  )
}