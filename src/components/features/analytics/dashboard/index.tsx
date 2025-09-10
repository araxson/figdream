import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, DollarSign } from 'lucide-react'
import { getStaffStats } from './queries'

export async function StaffStats() {
  const stats = await getStaffStats()
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today&apos;s Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.completedToday || 0} completed, {stats?.upcomingToday || 0} upcoming
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Earnings</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats?.weeklyEarnings || 0}</div>
          <p className="text-xs text-muted-foreground">
            ${stats?.monthlyEarnings || 0} this month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.averageRating || 0}</div>
          <p className="text-xs text-muted-foreground">
            From {stats?.totalReviews || 0} reviews
          </p>
        </CardContent>
      </Card>
    </div>
  )
}