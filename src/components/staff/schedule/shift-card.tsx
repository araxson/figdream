
import { format } from "date-fns"
import { Clock, MapPin, Users, Calendar, DollarSign } from "lucide-react"
import type { Database } from "@/types/database.types"
import { Badge, Button, Card, CardContent } from "@/components/ui"
type Schedule = Database["public"]["Tables"]["staff_schedules"]["Row"]
interface ShiftCardProps {
  schedule: Schedule & {
    location_name?: string
    appointments_count?: number
    estimated_earnings?: number
  }
  onEdit?: () => void
  onSwapRequest?: () => void
}
export function ShiftCard({ schedule, onEdit, onSwapRequest }: ShiftCardProps) {
  const startTime = new Date(`2024-01-01T${schedule.start_time}`)
  const endTime = new Date(`2024-01-01T${schedule.end_time}`)
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  const getDayBadgeColor = (day: string) => {
    const today = format(new Date(), "EEEE").toLowerCase()
    return day.toLowerCase() === today ? "default" : "secondary"
  }
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium capitalize">{schedule.day_of_week}</span>
                <Badge variant={getDayBadgeColor(schedule.day_of_week)}>
                  {schedule.is_recurring ? "Recurring" : "One-time"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(startTime, "h:mm a")} - {format(endTime, "h:mm a")}
                  </span>
                </div>
                <span>({duration} hours)</span>
              </div>
            </div>
            {schedule.appointments_count !== undefined && (
              <Badge variant="outline">
                {schedule.appointments_count} appointments
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm">
            {schedule.location_name && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{schedule.location_name}</span>
              </div>
            )}
            {schedule.estimated_earnings !== undefined && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <DollarSign className="h-3 w-3" />
                <span>${schedule.estimated_earnings.toFixed(2)}</span>
              </div>
            )}
          </div>
          {schedule.break_duration && (
            <div className="rounded-lg bg-muted p-2 text-sm">
              <span className="text-muted-foreground">Break: </span>
              <span>{schedule.break_duration} minutes at {schedule.break_start}</span>
            </div>
          )}
          {(onEdit || onSwapRequest) && (
            <div className="flex gap-2 pt-2">
              {onEdit && (
                <Button size="sm" variant="outline" onClick={onEdit}>
                  Edit Shift
                </Button>
              )}
              {onSwapRequest && (
                <Button size="sm" variant="outline" onClick={onSwapRequest}>
                  Request Swap
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
