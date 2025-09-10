import { Suspense } from 'react'
import { CustomerDashboard } from '@/components/features/analytics/dashboard/customer-dashboard'
import { CardGridSkeleton, AppointmentCardSkeleton } from '@/components/ui/skeleton-variants'

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Manage your appointments and explore our services
        </p>
      </div>
      
      <Suspense fallback={
        <div className="space-y-6">
          <CardGridSkeleton count={4} />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <AppointmentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }>
        <CustomerDashboard />
      </Suspense>
    </div>
  )
}