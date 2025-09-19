'use client'

import { format } from 'date-fns'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { AppointmentWithRelations } from '../../types'
import { CalendarAppointmentCard } from './calendar-appointment-card'

interface CalendarDayViewProps {
  selectedDate: Date
  appointments: AppointmentWithRelations[]
  onTimeSlotClick?: (date: Date, time: string) => void
  onAppointmentClick?: (appointment: AppointmentWithRelations) => void
  onAppointmentEdit?: (appointment: AppointmentWithRelations) => void
  onAppointmentCancel?: (appointment: AppointmentWithRelations) => void
  enableDragDrop?: boolean
  timeSlots: string[]
  getAppointmentsForSlot: (date: Date, hour: number) => AppointmentWithRelations[]
}

export function CalendarDayView({
  selectedDate,
  appointments,
  onTimeSlotClick,
  onAppointmentClick,
  onAppointmentEdit,
  onAppointmentCancel,
  enableDragDrop,
  timeSlots,
  getAppointmentsForSlot,
}: CalendarDayViewProps) {
  return (
    <div className="border rounded-lg">
      <div className="grid grid-cols-[80px_1fr] divide-x">
        <div className="p-4 font-medium text-center bg-muted">
          {format(selectedDate, 'EEE')}
          <div className="text-2xl">{format(selectedDate, 'd')}</div>
        </div>
        <ScrollArea className="h-[600px]">
          <div className="divide-y">
            {timeSlots.map((time) => {
              const hour = parseInt(time.split(':')[0])
              const slotAppointments = getAppointmentsForSlot(selectedDate, hour)

              return (
                <div
                  key={time}
                  className={cn(
                    "grid grid-cols-[100px_1fr] divide-x min-h-[60px]",
                    "hover:bg-accent/50 cursor-pointer transition-colors"
                  )}
                  onClick={() => onTimeSlotClick?.(selectedDate, time)}
                >
                  <div className="p-2 text-sm text-muted-foreground text-right">
                    {time}
                  </div>
                  <div className="p-2 space-y-1">
                    {slotAppointments.map((appointment) => (
                      <CalendarAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onAppointmentClick={onAppointmentClick}
                        onAppointmentEdit={onAppointmentEdit}
                        onAppointmentCancel={onAppointmentCancel}
                        enableDragDrop={enableDragDrop}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}