import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Skeleton } from '@/components/ui'
import { BlockedTimesCalendar } from '@/components/salon-owner/blocked/blocked-calendar'
import { BlockedTimesList } from '@/components/salon-owner/blocked/blocked-list'
import { CreateBlockedTimeDialog } from '@/components/salon-owner/blocked/create-blocked-time-dialog'
import { RecurringBlockedTimeDialog } from '@/components/salon-owner/blocked/recurring-blocked-time-dialog'
import { getBlockedTimes } from '@/lib/data-access/blocked'
import { getStaffBySalon } from '@/lib/data-access/staff'
import { getUserSalonId } from '@/lib/data-access/auth/utils'
import { createClient } from '@/lib/database/supabase/server'
import { redirect } from 'next/navigation'
import { Clock, Calendar, AlertCircle } from 'lucide-react'

export default async function BlockedTimesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const salonId = await getUserSalonId(user?.id || null)
  
  if (!salonId) {
    redirect('/salon-admin')
  }

  const [blockedTimesRaw, staff] = await Promise.all([
    getBlockedTimes({ salonId }),
    getStaffBySalon(salonId)
  ])

  // Transform blocked times to match component expectations
  const blockedTimes = blockedTimesRaw?.map(bt => ({
    ...bt,
    staff_profiles: bt.staff_profiles ? {
      id: bt.staff_profiles.id,
      full_name: bt.staff_profiles.profiles?.full_name || null,
      email: bt.staff_profiles.profiles?.email || null
    } : null
  })) || []

  const today = new Date().toISOString()
  const activeBlocks = blockedTimes?.filter(b => b.end_datetime >= today) || []
  const recurringBlocks: typeof blockedTimes = [] // blocked_times table doesn't have is_recurring field

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
                const blockDate = new Date(b.start_datetime).toISOString().split('T')[0]
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