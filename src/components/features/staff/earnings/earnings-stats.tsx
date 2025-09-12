import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { EarningsStats } from '@/types/features/earnings-types'

interface EarningsStatsCardsProps {
  stats: EarningsStats | null
}

export function EarningsStatsCards({ stats }: EarningsStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Today&apos;s Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.todayEarnings || 0)}</div>
          <p className="text-xs text-muted-foreground">
            Including {formatCurrency(stats?.todayTips || 0)} in tips
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.weekEarnings || 0)}</div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>12% from last week</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.monthEarnings || 0)}</div>
          <Progress value={stats?.targetProgress || 0} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {stats?.targetProgress?.toFixed(0)}% of target
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Avg per Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats?.averagePerAppointment || 0)}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats?.commissionRate}% commission rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}