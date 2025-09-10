import { Suspense } from 'react'
import { StaffDashboard } from '@/components/features/analytics/dashboard/staff-dashboard'
import { CardGridSkeleton, AppointmentCardSkeleton, CalendarSkeleton } from '@/components/ui/skeleton-variants'

export default function StaffDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your appointments and schedule
        </p>
      </div>
      
      <Suspense fallback={
        <div className="space-y-6">
          <CardGridSkeleton count={3} className="md:grid-cols-3" />
          <div className="grid gap-6 lg:grid-cols-2">
            <CalendarSkeleton />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <AppointmentCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      }>
        <StaffDashboard />
      </Suspense>
    </div>
  )
}