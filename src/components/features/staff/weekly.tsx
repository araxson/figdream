'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function WeeklySchedule() {
  const schedule = [
    { day: 'Monday', date: 'Jan 6', shifts: [{ start: '9:00 AM', end: '5:00 PM', break: '1:00 PM - 2:00 PM' }] },
    { day: 'Tuesday', date: 'Jan 7', shifts: [{ start: '9:00 AM', end: '5:00 PM', break: '1:00 PM - 2:00 PM' }] },
    { day: 'Wednesday', date: 'Jan 8', shifts: [{ start: '10:00 AM', end: '6:00 PM', break: '2:00 PM - 3:00 PM' }] },
    { day: 'Thursday', date: 'Jan 9', shifts: [{ start: '9:00 AM', end: '5:00 PM', break: '1:00 PM - 2:00 PM' }] },
    { day: 'Friday', date: 'Jan 10', shifts: [{ start: '9:00 AM', end: '5:00 PM', break: '1:00 PM - 2:00 PM' }] },
    { day: 'Saturday', date: 'Jan 11', shifts: [{ start: '10:00 AM', end: '4:00 PM', break: '1:00 PM - 1:30 PM' }] },
    { day: 'Sunday', date: 'Jan 12', shifts: [] },
  ]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>This Week&apos;s Schedule</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">Jan 6 - Jan 12, 2025</span>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {schedule.map((day) => (
            <div key={day.day} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-24">
                  <p className="font-medium">{day.day}</p>
                  <p className="text-sm text-muted-foreground">{day.date}</p>
                </div>
                {day.shifts.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <Badge variant="default">
                      {day.shifts[0].start} - {day.shifts[0].end}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Break: {day.shifts[0].break}
                    </span>
                  </div>
                ) : (
                  <Badge variant="secondary">Day Off</Badge>
                )}
              </div>
              {day.shifts.length > 0 && (
                <Button variant="ghost" size="sm">Swap Shift</Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}