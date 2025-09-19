import { Suspense } from 'react'
import { Metadata } from 'next'
import { AppointmentsPageServer } from '@/core/appointments/components/appointments-page-server'
import { AppointmentsLoadingSkeleton } from '@/core/shared/components/loading/appointments-skeleton'

export const metadata: Metadata = {
  title: 'Appointments | Dashboard',
  description: 'Manage salon appointments and bookings',
}

export default function AppointmentsPage() {
  return (
    <Suspense fallback={<AppointmentsLoadingSkeleton />}>
      <AppointmentsPageServer />
    </Suspense>
  )
}