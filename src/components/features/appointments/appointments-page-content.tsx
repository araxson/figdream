import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AppointmentHeader } from '@/components/features/appointments/appointment-header'
import { AppointmentList } from '@/components/features/appointments/appointment-list'
import { AppointmentCalendar } from '@/components/features/appointments/appointment-calendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { UserRole } from '@/types/auth'

interface AppointmentsPageContentProps {
  userRole: UserRole
}

export function AppointmentsPageContent({ userRole }: AppointmentsPageContentProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-96" /></div>}>
        <AppointmentHeader 
          userRole={userRole} 
          showFilters={true}
          showDateRange={true}
          showActions={true}
        />
      </Suspense>
      
      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[200px]" />}>
            <AppointmentList userRole={userRole} view="all" displayMode="card" />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="table" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <AppointmentList userRole={userRole} view="all" displayMode="table" />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="calendar" className="space-y-4">
          <Suspense fallback={<Skeleton className="h-[500px]" />}>
            <AppointmentCalendar userRole={userRole} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}