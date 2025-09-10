import { Button } from '@/components/ui/button'
import { CalendarDays, Clock } from 'lucide-react'

export function StaffScheduleHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
        <p className="text-muted-foreground">
          View your shifts and manage time off requests
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Request Time Off
        </Button>
        <Button>
          <CalendarDays className="mr-2 h-4 w-4" />
          View Full Month
        </Button>
      </div>
    </div>
  )
}