import { Database } from "@/types/database.types"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { format } from "date-fns"
import { Ban } from "lucide-react"
type BlockedTime = Database['public']['Tables']['blocked_times']['Row'] & {
  staff_profiles?: {
    profiles?: Database['public']['Tables']['profiles']['Row'] | null
  } | null
}
type TimeOff = Database['public']['Tables']['time_off']['Row'] & {
  staff_profiles?: {
    profiles?: Database['public']['Tables']['profiles']['Row'] | null
  } | null
}
type Appointment = Database['public']['Views']['location_appointments_view']['Row']
interface ScheduleDay {
  date: Date
  blockedTimes: BlockedTime[]
  timeOff: TimeOff[]
  appointments: Appointment[]
}
interface ScheduleCalendarProps {
  scheduleByDay: ScheduleDay[]
  weekStart: Date
}
export function ScheduleCalendar({ scheduleByDay, weekStart }: ScheduleCalendarProps) {
  const today = new Date()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Week of {format(weekStart, 'MMM d, yyyy')}</CardTitle>
        <CardDescription>Staff schedule and availability</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {scheduleByDay.map((day) => {
            const isToday = format(day.date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
            return (
              <div 
                key={day.date.toISOString()} 
                className={`border rounded-lg p-4 ${isToday ? 'border-primary bg-primary/5' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">
                      {format(day.date, 'EEEE, MMM d')}
                      {isToday && <Badge className="ml-2" variant="default">Today</Badge>}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{day.appointments.length} appointments</span>
                    {day.blockedTimes.length > 0 && (
                      <Badge variant="outline" className="gap-1">
                        <Ban className="h-3 w-3" />
                        {day.blockedTimes.length} blocked
                      </Badge>
                    )}
                    {day.timeOff.length > 0 && (
                      <Badge variant="secondary">
                        {day.timeOff.length} on leave
                      </Badge>
                    )}
                  </div>
                </div>
                {day.blockedTimes.length > 0 && (
                  <div className="mb-2">
                    <p className="text-sm font-medium mb-1">Blocked Times:</p>
                    <div className="flex flex-wrap gap-2">
                      {day.blockedTimes.map((bt) => (
                        <Badge key={bt.id} variant="outline" className="text-xs">
                          {format(new Date(bt.start_datetime), 'h:mm a')} - {format(new Date(bt.end_datetime), 'h:mm a')}
                          {bt.reason && `: ${bt.reason}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {day.timeOff.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Staff on Leave:</p>
                    <div className="flex flex-wrap gap-2">
                      {day.timeOff.map((to) => (
                        <Badge key={to.id} variant="secondary" className="text-xs">
                          {to.staff_profiles?.profiles?.full_name || 'Unknown'} - {to.type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}