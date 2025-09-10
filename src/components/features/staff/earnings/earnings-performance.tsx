import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Target, Award, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { EarningsStats } from './earnings-types'

interface PerformanceMetricsProps {
  stats: EarningsStats | null
}

export function PerformanceMetrics({ stats }: PerformanceMetricsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {formatCurrency(stats?.monthEarnings || 0)} / $5,000
              </span>
            </div>
            <Progress value={stats?.targetProgress || 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Top Service</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{stats?.topService}</p>
          <p className="text-xs text-muted-foreground">Most booked this month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Client Retention</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="font-medium">78%</p>
          <p className="text-xs text-muted-foreground">Repeat customers</p>
        </CardContent>
      </Card>
    </div>
  )
}