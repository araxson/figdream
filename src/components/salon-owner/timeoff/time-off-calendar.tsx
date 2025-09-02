'use client'

import { useState } from 'react'
import { Calendar, Badge, ScrollArea } from '@/components/ui'
import { format } from 'date-fns'
import { Database } from '@/types/database.types'

type StaffTimeOff = Database['public']['Tables']['staff_time_off']['Row'] & {
  staff_profiles?: {
    id: string
    full_name: string | null
    email: string | null
  } | null
}

interface TimeOffCalendarProps {
  timeOffData: StaffTimeOff[]
}

export function TimeOffCalendar({ timeOffData }: TimeOffCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Get time off for selected date
  const getTimeOffForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return timeOffData.filter(timeOff => {
      return dateStr >= timeOff.start_date && dateStr <= timeOff.end_date
    })
  }

  // Get dates with time off for calendar highlighting
  const datesWithTimeOff = timeOffData.reduce((dates, timeOff) => {
    const start = new Date(timeOff.start_date)
    const end = new Date(timeOff.end_date)
    const current = new Date(start)
    
    while (current <= end) {
      dates.add(format(current, 'yyyy-MM-dd'))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }, new Set<string>())

  const selectedDateTimeOff = selectedDate ? getTimeOffForDate(selectedDate) : []

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            timeOff: (date) => datesWithTimeOff.has(format(date, 'yyyy-MM-dd'))
          }}
          modifiersStyles={{
            timeOff: {
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              fontWeight: 'bold'
            }
          }}
        />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedDateTimeOff.length} staff on leave
          </p>
        </div>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          {selectedDateTimeOff.length > 0 ? (
            <div className="space-y-3">
              {selectedDateTimeOff.map((timeOff) => (
                <div key={timeOff.id} className="space-y-2 rounded-lg border p-3">
                  <div className="font-medium">
                    {timeOff.staff_profiles?.full_name || 'Unknown Staff'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(timeOff.start_date), 'MMM d')} - {format(new Date(timeOff.end_date), 'MMM d, yyyy')}
                  </div>
                  {timeOff.reason && (
                    <div className="text-sm">{timeOff.reason}</div>
                  )}
                  <Badge variant={timeOff.all_day ? 'default' : 'secondary'}>
                    {timeOff.all_day ? 'All Day' : 'Partial Day'}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground">
              No staff on leave for this date
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}