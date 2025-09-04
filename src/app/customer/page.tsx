import { Metadata } from 'next'
import { getCurrentUser } from '@/lib/data-access/auth'
import { StatsCard, StatsGrid, EmptyState } from '@/components/shared/ui-components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Heart, Trophy, Clock, ArrowRight, Sparkles, Gift, Bell } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Customer Dashboard',
  description: 'Your personal dashboard',
}


export default async function CustomerDashboardPage() {
  const user = await getCurrentUser()
  const firstName = user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'there'
  
  return (
    <div className="space-y-8">
      {/* Welcome Section with gradient background */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <Badge variant="secondary" className="font-normal">
              <Clock className="h-3 w-3 mr-1" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Welcome back, {firstName}!
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Ready to book your next appointment? Check out today&apos;s available slots.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/book">
              <Button size="lg" className="group">
                Book Appointment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/customer/profile">
              <Button size="lg" variant="outline">
                Complete Profile
                <Badge className="ml-2" variant="secondary">+50 pts</Badge>
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Quick Stats Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Overview</h2>
          <Link href="/customer/notifications">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            </Button>
          </Link>
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
              href="/customer/appointments"
              title="Appointments"
              value={0}
              description="Upcoming bookings"
              icon={Calendar}
              trend={{ value: 0, label: 'this month' }}
              variant="gradient"
            />
            <StatsCard
              href="/customer/favorites"
              title="Favorites"
              value={0}
              description="Saved salons"
              icon={Heart}
              variant="gradient"
            />
            <StatsCard
              href="/customer/loyalty"
              title="Loyalty Points"
              value={0}
              description="Available points"
              icon={Trophy}
              trend={{ value: 0, label: 'earned' }}
              variant="gradient"
            />
            <StatsCard
              href="/customer/gift-cards"
              title="Gift Cards"
              value={0}
              description="Active cards"
              icon={Gift}
              variant="gradient"
            />
          </Suspense>
        </StatsGrid>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <EmptyState
          icon={Calendar}
          title="No recent activity"
          description="Book your first appointment to get started with rewards and exclusive offers"
          action={{
            label: "Browse Salons",
            href: "/book"
          }}
        />
      </div>
    </div>
  )
}