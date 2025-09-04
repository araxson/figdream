import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/data-access/auth'
import { getStaffByUserId } from '@/lib/data-access/staff'
import { PageHeader } from '@/components/shared/ui-components'
import { StatsCard, StatsGrid, EmptyState } from '@/components/shared/ui-components'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp,
  CalendarCheck,
  UserCheck,
  Star,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Staff Dashboard',
  description: 'Your staff member dashboard',
}

export default async function StaffDashboardPage() {
  const user = await getCurrentUser()
  const staff = await getStaffByUserId(user?.id || '')
  
  const staffName = staff?.profiles?.full_name || 'Staff Member'
  const salonName = staff?.salons?.name || 'Your Salon'
  
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="font-normal">
              <UserCheck className="h-3 w-3 mr-1" />
              {salonName}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome back, {staffName}!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here's your schedule and performance overview
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/staff-member/appointments">
              <Button size="lg" className="group">
                View Today's Appointments
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/staff-member/schedule">
              <Button size="lg" variant="outline">
                <Clock className="mr-2 h-4 w-4" />
                Manage Schedule
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Today's Overview */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Today's Overview</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
        <StatsGrid>
          <Suspense fallback={
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          }>
            <StatsCard
              href="/staff-member/appointments"
              title="Today's Appointments"
              value={0}
              description="Scheduled today"
              icon={Calendar}
              variant="gradient"
            />
            <StatsCard
              href="/staff-member/schedule"
              title="Working Hours"
              value="9-5"
              description="Today's shift"
              icon={Clock}
              variant="gradient"
            />
            <StatsCard
              href="/staff-member/earnings"
              title="Earnings"
              value="$0"
              description="This month"
              icon={DollarSign}
              trend={{ value: 0, label: 'vs last month' }}
              variant="gradient"
            />
            <StatsCard
              href="/staff-member/performance"
              title="Rating"
              value="5.0"
              description="Average rating"
              icon={Star}
              variant="gradient"
            />
          </Suspense>
        </StatsGrid>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/staff-member/time-off">
              <Button variant="outline" className="w-full justify-between">
                Request Time Off
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/staff-member/profile">
              <Button variant="outline" className="w-full justify-between">
                Update Profile
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/staff-member/schedule">
              <Button variant="outline" className="w-full justify-between">
                Update Availability
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Performance Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Appointments Completed</span>
              <Badge>0 this month</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Client Retention</span>
              <Badge>0%</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm">Punctuality Rate</span>
              <Badge>100%</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
          <Link href="/staff-member/appointments">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={CalendarCheck}
          title="No upcoming appointments"
          description="Your scheduled appointments will appear here"
          action={{
            label: "View Calendar",
            href: "/staff-member/schedule"
          }}
        />
      </div>
    </div>
  )
}