import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { DashboardStats } from './dashboard-types'

interface MonthlyOverviewProps {
  stats: DashboardStats
}

export function MonthlyOverview({ stats }: MonthlyOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
        <CardDescription>Performance metrics for the current month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Monthly Revenue</p>
            <p className="text-2xl font-bold">${(stats.monthlyRevenue || 0).toLocaleString()}</p>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+15% vs last month</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Active Staff</p>
            <p className="text-2xl font-bold">{stats.activeStaff || 0}</p>
            <p className="text-xs text-muted-foreground">2 on leave</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Total Services</p>
            <p className="text-2xl font-bold">{stats.totalServices || 0}</p>
            <p className="text-xs text-muted-foreground">3 new this month</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Occupancy Rate</p>
            <p className="text-2xl font-bold">78%</p>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+5% vs last month</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}