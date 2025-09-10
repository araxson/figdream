import { Suspense } from 'react'
import { AppointmentCardSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'
// import { AppointmentsHeader } from '@/components/sections/appointments/header'
// import { AppointmentsList } from '@/components/sections/appointments/list'

export default function AppointmentsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <AppointmentsHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
      </Suspense>
      
      <Suspense fallback={
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <AppointmentCardSkeleton key={i} />
          ))}
        </div>
      }>
        {/* <AppointmentsList /> */}
        <div className="border rounded-lg p-6">
          <p className="text-muted-foreground text-center">Your appointments will appear here</p>
        </div>
      </Suspense>
    </div>
  )
}