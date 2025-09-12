import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { GrowthData, TimeRange } from '@/types/features/user-growth-types'

interface UserGrowthDetailsProps {
  data: GrowthData
  timeRange: TimeRange
  onTimeRangeChange: (value: TimeRange) => void
}

export function UserGrowthDetails({ data, timeRange, onTimeRangeChange }: UserGrowthDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Growth Details</CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
              <TabsTrigger value="year">Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Users by Role</h3>
            <div className="space-y-2">
              {data.usersByRole.map((role) => (
                <div key={role.role} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {role.role}
                    </Badge>
                    <span className="text-sm">{role.count} users</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {role.percentage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Monthly Growth Trend</h3>
            <div className="space-y-2">
              {data.monthlyGrowth.map((month) => (
                <div key={month.month} className="flex items-center justify-between text-sm">
                  <span>{month.month}</span>
                  <div className="flex gap-4">
                    <span className="text-green-600">+{month.new_users}</span>
                    <span className="text-red-600">-{month.churned_users}</span>
                    <span className={`font-medium ${
                      month.net_growth > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {month.net_growth > 0 ? '+' : ''}{month.net_growth}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Retention Cohorts</h3>
            <div className="space-y-2">
              {data.retentionCohorts.map((cohort) => (
                <div key={cohort.cohort} className="flex items-center justify-between text-sm">
                  <span>{cohort.cohort}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-muted-foreground">
                      {cohort.retained_users}/{cohort.initial_users}
                    </span>
                    <Badge variant={cohort.retention_rate > 80 ? 'default' : cohort.retention_rate > 60 ? 'secondary' : 'destructive'}>
                      {cohort.retention_rate.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}