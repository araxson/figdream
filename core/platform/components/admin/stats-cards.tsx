import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Activity, AlertCircle, TrendingUp } from 'lucide-react'
import type { UserManagementStats } from '../dal/users-types'

interface UsersStatsCardsProps {
  stats?: UserManagementStats
}

export function UsersStatsCards({ stats }: UsersStatsCardsProps) {
  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium bg-muted h-4 w-20 rounded" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="bg-muted h-8 w-16 rounded mb-1" />
              <div className="bg-muted h-3 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            +{stats.newUsersThisMonth} from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total users
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.suspendedUsers}</div>
          <p className="text-xs text-muted-foreground">
            Requiring attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.growthRate > 0 ? '+' : ''}{stats.growthRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            From previous month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}