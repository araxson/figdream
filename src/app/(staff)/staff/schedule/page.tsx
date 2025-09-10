import { Suspense } from 'react'
import { CalendarSkeleton, TableSkeleton } from '@/components/ui/skeleton-variants'
import { Skeleton } from '@/components/ui/skeleton'
// import { ScheduleHeader } from '@/components/sections/staff/schedule/header'
// import { WeeklySchedule } from '@/components/sections/staff/schedule/weekly'
// import { ShiftSwapRequests } from '@/components/sections/staff/schedule/swap-requests'
// import { TimeOffRequests } from '@/components/sections/staff/schedule/time-off'

export default function StaffSchedulePage() {
  return (
    <div className="flex-1 space-y-8 p-8">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        {/* <ScheduleHeader /> */}
        <div>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">View and manage your work schedule</p>
        </div>
      </Suspense>
      
      <Suspense fallback={<CalendarSkeleton />}>
        {/* <WeeklySchedule /> */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Weekly Schedule</h2>
          <p className="text-muted-foreground">Your weekly schedule will appear here</p>
        </div>
      </Suspense>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Suspense fallback={<TableSkeleton count={4} />}>
          {/* <ShiftSwapRequests /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Shift Swap Requests</h3>
            <p className="text-muted-foreground">Swap requests will appear here</p>
          </div>
        </Suspense>
        
        <Suspense fallback={<TableSkeleton count={4} />}>
          {/* <TimeOffRequests /> */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-2">Time Off Requests</h3>
            <p className="text-muted-foreground">Time off requests will appear here</p>
          </div>
        </Suspense>
      </div>
    </div>
  )
}