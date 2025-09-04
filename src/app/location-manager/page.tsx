import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/data-access/auth'
import { createClient } from '@/lib/database/supabase/server'
import { PageHeader } from '@/components/shared/ui-components'
import { StatsCard, StatsGrid, EmptyState } from '@/components/shared/ui-components'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Users,
  Clock,
  FileText,
  MapPin,
  Activity,
  ChevronRight,
  CalendarDays,
  UserPlus
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Location Manager Dashboard',
  description: 'Manage your salon location',
}

export default async function LocationManagerDashboardPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  
  // Get location info
  const { data: location } = await supabase
    .from('locations')
    .select('name, address')
    .eq('manager_id', user?.id)
    .single()
  
  const locationName = location?.name || 'Your Location'
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Location Dashboard"
        description={`Managing ${locationName}`}
        badge={location?.address ? 'Active' : 'Setup Required'}
        actions={
          <div className="flex gap-2">
            <Link href="/location-manager/appointments">
              <Button>
                <CalendarDays className="size-4 mr-2" />
                View Schedule
              </Button>
            </Link>
            <Link href="/location-manager/staff">
              <Button variant="outline">
                <UserPlus className="size-4 mr-2" />
                Manage Staff
              </Button>
            </Link>
          </div>
        }
      />

      {/* Today's Metrics */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Today's Metrics</h2>
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
              href="/location-manager/appointments"
              title="Appointments"
              value={0}
              description="Today's bookings"
              icon={Calendar}
              variant="gradient"
            />
            <StatsCard
              href="/location-manager/staff"
              title="Staff on Duty"
              value={0}
              description="Working today"
              icon={Users}
              variant="gradient"
            />
            <StatsCard
              href="/location-manager/schedule"
              title="Utilization"
              value="0%"
              description="Schedule capacity"
              icon={Activity}
              trend={{ value: 0, label: 'vs yesterday' }}
              variant="gradient"
            />
            <StatsCard
              href="/location-manager/reports"
              title="Revenue"
              value="$0"
              description="Today's total"
              icon={FileText}
              trend={{ value: 0, label: 'vs last week' }}
              variant="gradient"
            />
          </Suspense>
        </StatsGrid>
      </div>

      {/* Location Info */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-semibold mb-3">Location Details</h3>
          <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin className="size-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{locationName}</p>
                <p className="text-sm text-muted-foreground">
                  {location?.address || 'Address not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Badge variant="outline">
                <Clock className="size-3 mr-1" />
                Open: 9:00 AM - 6:00 PM
              </Badge>
              <Link href="/location-manager/settings">
                <Button variant="ghost" size="sm">
                  Edit
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link href="/location-manager/appointments">
              <Button variant="outline" className="w-full justify-between">
                Manage Appointments
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/location-manager/reports">
              <Button variant="outline" className="w-full justify-between">
                Generate Reports
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/location-manager/schedule">
              <Button variant="outline" className="w-full justify-between">
                View Team Schedule
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Staff Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Staff Overview</h2>
          <Link href="/location-manager/staff">
            <Button variant="ghost" size="sm">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={Users}
          title="No staff members"
          description="Staff members will appear here once assigned"
          action={{
            label: "Manage Staff",
            href: "/location-manager/staff"
          }}
        />
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <EmptyState
          icon={Activity}
          title="No recent activity"
          description="Recent appointments and staff activities will appear here"
          variant="card"
        />
      </div>
    </div>
  )
}