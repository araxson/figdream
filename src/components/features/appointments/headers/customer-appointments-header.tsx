import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export function AppointmentsHeader() {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming and past appointments
        </p>
      </div>
      <Button asChild>
        <Link href="/customer/booking">
          <Plus className="mr-2 h-4 w-4" />
          Book New
        </Link>
      </Button>
    </div>
  )
}