'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Coffee, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ScheduleData } from './schedule-types'

interface ScheduleDisplayProps {
  selectedDate: Date
  scheduleData: ScheduleData
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function ScheduleDisplay({ selectedDate, scheduleData }: ScheduleDisplayProps) {
  const getDaySchedule = (date: Date) => {
    const dayOfWeek = date.getDay()
    return scheduleData.schedules.find(s => s.day_of_week === dayOfWeek)
  }

  const getDayBreaks = (date: Date) => {
    const dayOfWeek = date.getDay()
    return scheduleData.breaks.filter(b => b.day_of_week === dayOfWeek)
  }

  const isOnTimeOff = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    return scheduleData.timeOffRequests.some(req => {
      return dateStr >= req.start_date && dateStr <= req.end_date
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {format(selectedDate, 'EEEE, MMMM d')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOnTimeOff(selectedDate) ? (
            <div className="text-center py-4">
              <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium">Time Off</p>
              <p className="text-xs text-muted-foreground">You&apos;re off this day</p>
            </div>
          ) : (
            <>
              {getDaySchedule(selectedDate) ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Working Hours</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {getDaySchedule(selectedDate)?.start_time} - {getDaySchedule(selectedDate)?.end_time}
                      </span>
                    </div>
                  </div>

                  {getDayBreaks(selectedDate).length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-1">Breaks</p>
                      {getDayBreaks(selectedDate).map((breakItem) => (
                        <div key={breakItem.id} className="flex items-center gap-2">
                          <Coffee className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {breakItem.start_time} - {breakItem.end_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No schedule set</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {dayNames.map((day, index) => {
              const schedule = scheduleData.schedules.find(s => s.day_of_week === index)
              return (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{day.slice(0, 3)}</span>
                  {schedule ? (
                    <Badge variant="outline" className="text-xs">
                      {schedule.start_time} - {schedule.end_time}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">Off</span>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}