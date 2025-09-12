import { Suspense } from 'react'
import { AppointmentCardSkeleton, TableSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentHeader } from '@/components/features/appointments/appointment-header'
import { AppointmentList } from '@/components/features/appointments/appointment-list'

export default function StaffAppointmentsPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        <AppointmentHeader userRole="staff" />
      </Suspense>
      
      <Suspense fallback={<AppointmentCardSkeleton />}>
        <AppointmentList 
          userRole="staff" 
          view="today" 
          displayMode="card"
        />
      </Suspense>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<TableSkeleton count={5} />}>
          <AppointmentList 
            userRole="staff" 
            view="upcoming" 
            displayMode="card"
            limit={5}
          />
        </Suspense>
        
        <Suspense fallback={<TableSkeleton count={5} />}>
          <AppointmentList 
            userRole="staff" 
            view="past" 
            displayMode="card"
            limit={5}
          />
        </Suspense>
      </div>
    </div>
  )
}