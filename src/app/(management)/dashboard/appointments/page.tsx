import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AppointmentsTabs } from '@/components/features/appointments/appointments-tabs'

export default function OwnerAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your salon appointments and schedule</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>
      
      <AppointmentsTabs />
    </div>
  )
}