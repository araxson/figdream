import { Suspense } from 'react'
import { AppointmentCardSkeleton, TableSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'
// import { StaffAppointmentsHeader } from '@/components/sections/staff/appointments/header'
// import { TodaySchedule } from '@/components/sections/staff/appointments/today'
// import { UpcomingAppointments } from '@/components/sections/staff/appointments/upcoming'
// import { AppointmentHistory } from '@/components/sections/staff/appointments/history'

export default function StaffAppointmentsPage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <StaffAppointmentsHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <p className="text-muted-foreground">Manage your appointment schedule</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<AppointmentCardSkeleton />}>
        {/* <TodaySchedule /> */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Today&apos;s Schedule</h2>
          <p className="text-muted-foreground">Your appointments for today will appear here</p>
        </div>
      </Suspense>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<TableSkeleton count={5} />}>
          {/* <UpcomingAppointments /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Upcoming Appointments</h3>
            <p className="text-muted-foreground">Your upcoming appointments will appear here</p>
          </div>
        </Suspense>
        
        <Suspense fallback={<TableSkeleton count={5} />}>
          {/* <AppointmentHistory /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Appointment History</h3>
            <p className="text-muted-foreground">Your past appointments will appear here</p>
          </div>
        </Suspense>
      </div>
    </div>
  )
}