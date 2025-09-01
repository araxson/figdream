import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TimeOffCalendar } from './components/time-off-calendar'
import { TimeOffRequests } from './components/time-off-requests'
import { TimeOffList } from './components/time-off-list'
import { CreateTimeOffDialog } from './components/create-time-off-dialog'
import { getTimeOffRequests, getStaffTimeOff } from '@/lib/data-access/time-off'
import { getStaffBySalon } from '@/lib/data-access/staff'
import { getUserSalonId } from '@/lib/data-access/auth/utils'
import { redirect } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export default async function StaffTimeOffPage() {
  const salonId = await getUserSalonId()
  
  if (!salonId) {
    redirect('/salon-admin')
  }

  const [timeOffData, requests, staff] = await Promise.all([
    getStaffTimeOff(),
    getTimeOffRequests(),
    getStaffBySalon(salonId)
  ])

  const pendingRequests = requests?.filter(r => r.status === 'pending') || []
  const approvedTimeOff = timeOffData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Time Off</h1>
          <p className="text-muted-foreground">
            Manage staff time off requests and schedules
          </p>
        </div>
        <CreateTimeOffDialog staff={staff} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvedTimeOff.filter(t => {
                const today = new Date().toISOString().split('T')[0]
                return t.start_date <= today && t.end_date >= today
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff members on leave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Upcoming Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {approvedTimeOff.filter(t => {
                const today = new Date().toISOString().split('T')[0]
                return t.start_date > today
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In the next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="requests">
            Requests {pendingRequests.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Calendar</CardTitle>
              <CardDescription>
                View all staff time off in a calendar format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
                <TimeOffCalendar timeOffData={approvedTimeOff} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Time Off Requests</CardTitle>
              <CardDescription>
                Review and manage pending time off requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <TimeOffRequests requests={requests || []} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Time Off</CardTitle>
              <CardDescription>
                View and manage approved time off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                <TimeOffList timeOffData={approvedTimeOff} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}