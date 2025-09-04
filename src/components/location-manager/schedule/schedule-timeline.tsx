import { Database } from "@/types/database.types"
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from "date-fns"
import { Clock, Users } from "lucide-react"
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
interface ScheduleTimelineProps {
  blockedTimes: BlockedTime[]
  timeOff: TimeOff[]
}
export function ScheduleTimeline({ blockedTimes, timeOff }: ScheduleTimelineProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Blocked Time Slots</CardTitle>
          <CardDescription>Times when appointments cannot be scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          {blockedTimes.length > 0 ? (
            <div className="space-y-2">
              {blockedTimes.map((bt) => (
                <div key={bt.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {format(new Date(bt.start_datetime), 'EEE, MMM d')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(bt.start_datetime), 'h:mm a')} - {format(new Date(bt.end_datetime), 'h:mm a')}
                    </div>
                    {bt.reason && (
                      <div className="text-sm mt-1">{bt.reason}</div>
                    )}
                  </div>
                  <div>
                    {bt.staff_id ? (
                      <Badge variant="outline">
                        {bt.staff_profiles?.profiles?.full_name || 'Staff'}
                      </Badge>
                    ) : (
                      <Badge>All Staff</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No blocked times this week</p>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Time Off Requests</CardTitle>
          <CardDescription>Approved time off for this week</CardDescription>
        </CardHeader>
        <CardContent>
          {timeOff.length > 0 ? (
            <div className="space-y-2">
              {timeOff.map((to) => (
                <div key={to.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {to.staff_profiles?.profiles?.full_name || 'Unknown Staff'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(to.start_date), 'MMM d')} - {format(new Date(to.end_date), 'MMM d, yyyy')}
                    </div>
                    {to.notes && (
                      <div className="text-sm mt-1">{to.notes}</div>
                    )}
                  </div>
                  <Badge variant="default">{to.type}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No time off requests this week</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}