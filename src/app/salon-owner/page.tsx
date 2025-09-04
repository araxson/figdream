import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/data-access/auth'
import { createClient } from '@/lib/database/supabase/server'
import { PageHeader } from '@/components/shared/ui-components'
import { StatsCard, StatsGrid, EmptyState } from '@/components/shared/ui-components'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata: Metadata = {
  title: 'Salon Owner Dashboard',
  description: 'Manage your salon business',
}

export default async function SalonOwnerDashboardPage() {
  const user = await getCurrentUser()
  const supabase = await createClient()
  
  // Get salon info
  const { data: salon } = await supabase
    .from('salons')
    .select('name')
    .eq('owner_id', user?.id)
    .single()
  
  const salonName = salon?.name || 'Your Salon'
  
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back to ${salonName}`}
        actions={
          <div className="flex gap-2">
            <Link href="/salon-owner/appointments/new">
              <Button>
                <Plus className="size-4 mr-2" />
                New Appointment
              </Button>
            </Link>
            <Link href="/salon-owner/staff/new">
              <Button variant="outline">
                <UserCheck className="size-4 mr-2" />
                Add Staff
              </Button>
            </Link>
          </div>
        }
      />
      
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
              href="/salon-owner/appointments"
              title="Today's Appointments"
              value={0}
              description="Scheduled today"
              icon={Calendar}
              variant="gradient"
            />
            <StatsCard
              href="/salon-owner/customers"
              title="Active Customers"
              value={0}
              description="This month"
              icon={Users}
              trend={{ value: 0, label: 'vs last month' }}
              variant="gradient"
            />
            <StatsCard
              href="/salon-owner/analytics"
              title="Revenue"
              value="$0"
              description="This month"
              icon={DollarSign}
              trend={{ value: 0, label: 'vs last month' }}
              variant="gradient"
            />
            <StatsCard
              href="/salon-owner/staff"
              title="Staff Members"
              value={0}
              description="Active staff"
              icon={UserCheck}
              variant="gradient"
            />
          </Suspense>
        </StatsGrid>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/salon-owner/services/new">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="size-4 mr-2" />
              Add New Service
            </Button>
          </Link>
          <Link href="/salon-owner/blocked-times/new">
            <Button variant="outline" className="w-full justify-start">
              <Clock className="size-4 mr-2" />
              Block Time Slot
            </Button>
          </Link>
          <Link href="/salon-owner/marketing/new">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="size-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <EmptyState
          icon={Calendar}
          title="No recent activity"
          description="Your recent appointments and activities will appear here"
          action={{
            label: "View All Appointments",
            href: "/salon-owner/appointments"
          }}
        />
      </div>
    </div>
  )
}