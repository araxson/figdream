import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  UserPlus, 
  UserMinus,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { GrowthData, TimeRange } from '@/types/features/user-growth-types'

interface UserGrowthStatsProps {
  data: GrowthData
  timeRange: TimeRange
}

export function UserGrowthStats({ data, timeRange }: UserGrowthStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Users</CardTitle>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.newUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {timeRange === 'month' ? 'This month' : timeRange === 'quarter' ? 'This quarter' : 'This year'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
          {data.growthRate > 0 ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${data.growthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.growthRate > 0 ? '+' : ''}{data.growthRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">vs previous period</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          <UserMinus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.churnRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">30-day inactive</p>
        </CardContent>
      </Card>
    </div>
  )
}