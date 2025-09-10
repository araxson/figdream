import { Button } from '@/components/ui/button'
import { Calendar, Clock } from 'lucide-react'

export function StaffAppointmentsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">
          Manage your client appointments and schedule
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Break Time
        </Button>
        <Button>
          <Calendar className="mr-2 h-4 w-4" />
          Book Appointment
        </Button>
      </div>
    </div>
  )
}