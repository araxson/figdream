import { Suspense } from 'react'
import { AppointmentCardSkeleton } from '@/components/shared/ui-helpers/skeleton-patterns'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentHeader } from '@/components/features/appointments/appointment-header'
import { AppointmentList } from '@/components/features/appointments/appointment-list'

export default function AppointmentsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        <AppointmentHeader userRole="customer" />
      </Suspense>
      
      <Suspense fallback={
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <AppointmentCardSkeleton key={i} />
          ))}
        </div>
      }>
        <AppointmentList 
          userRole="customer" 
          view="upcoming" 
          displayMode="card"
        />
      </Suspense>
    </div>
  )
}