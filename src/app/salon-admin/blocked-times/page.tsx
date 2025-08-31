import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BlockedTimesCalendar } from './components/blocked-times-calendar'
import { BlockedTimesList } from './components/blocked-times-list'
import { CreateBlockedTimeDialog } from './components/create-blocked-time-dialog'
import { RecurringBlockedTimeDialog } from './components/recurring-blocked-time-dialog'
import { getBlockedTimes } from '@/lib/data-access/blocked-times'
import { getStaffBySalon } from '@/lib/data-access/staff'
import { getUserSalonId } from '@/lib/data-access/auth/utils'
import { redirect } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Calendar, AlertCircle } from 'lucide-react'

export default async function BlockedTimesPage() {
  const salonId = await getUserSalonId()
  
  if (!salonId) {
    redirect('/salon-admin')
  }

  const [blockedTimes, staff] = await Promise.all([
    getBlockedTimes({ salonId }),
    getStaffBySalon(salonId)
  ])

  const today = new Date().toISOString().split('T')[0]
  const activeBlocks = blockedTimes?.filter(b => b.end_time >= today) || []
  const recurringBlocks = blockedTimes?.filter(b => b.is_recurring) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blocked Times</h1>
          <p className="text-muted-foreground">
            Manage unavailable time slots for appointments
          </p>
        </div>
        <div className="flex gap-2">
          <RecurringBlockedTimeDialog staff={staff} salonId={salonId} />
          <CreateBlockedTimeDialog staff={staff} salonId={salonId} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Blocks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBlocks.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently blocking appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Blocks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeBlocks.filter(b => {
                const blockDate = new Date(b.start_time).toISOString().split('T')[0]
                return blockDate === today
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Blocked time slots today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recurring</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recurringBlocks.length}</div>
            <p className="text-xs text-muted-foreground">
              Recurring blocked times
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Times Calendar</CardTitle>
              <CardDescription>
                View and manage blocked time slots in calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                <BlockedTimesCalendar 
                  blockedTimes={blockedTimes || []} 
                  staff={staff}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Blocked Times</CardTitle>
              <CardDescription>
                Manage all blocked time slots in a list format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <BlockedTimesList blockedTimes={blockedTimes || []} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}