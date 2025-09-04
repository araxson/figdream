import { Metadata } from 'next'
import { AppointmentsList } from '@/components/customer/appointments/appointments-list'
import { Button } from '@/components/ui/button'
import { CalendarPlus } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Appointments',
  description: 'View and manage your appointments',
}

export default async function Page() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
        <Button asChild>
          <Link href="/book">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>
      
      <AppointmentsList />
    </div>
  )
}
