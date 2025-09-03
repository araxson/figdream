'use client'
import { Card, Alert, AlertDescription, Progress } from '@/components/ui'
import { PieChart, TrendingDown, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
interface OptOutStatsProps {
  stats: {
    total: number
    thisMonth: number
    lastMonth: number
    monthlyChange: string
    byReason: Record<string, number>
  }
}
export function OptOutStats({ stats }: OptOutStatsProps) {
  const _reasonColors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
  ]
  const sortedReasons = Object.entries(stats.byReason)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
  const maxReasonCount = Math.max(...Object.values(stats.byReason), 1)
  const changeValue = parseFloat(stats.monthlyChange)
  return (
    <div className="space-y-6">
      {/* Trend Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h3 className="font-semibold mb-4">Monthly Trend</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="font-semibold">{stats.thisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Month</span>
              <span className="font-semibold">{stats.lastMonth}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm font-medium">Change</span>
              <div className="flex items-center gap-2">
                {changeValue > 0 ? (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                ) : changeValue < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-600" />
                )}
                <span className={`font-semibold ${
                  changeValue > 0 ? 'text-red-600' : changeValue < 0 ? 'text-green-600' : ''
                }`}>
                  {stats.monthlyChange}%
                </span>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold mb-4">Opt-Out Rate</h3>
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Opt-Outs</p>
            </div>
            {changeValue !== 0 && (
              <div className="rounded-lg border p-3 text-sm">
                {changeValue > 0 ? (
                  <p className="text-red-600">
                    ⚠️ Opt-out rate increased by {stats.monthlyChange}% this month
                  </p>
                ) : (
                  <p className="text-green-600">
                    ✅ Opt-out rate decreased by {Math.abs(changeValue)}% this month
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
      {/* Reasons Breakdown */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5" />
          <h3 className="font-semibold">Opt-Out Reasons</h3>
        </div>
        {sortedReasons.length > 0 ? (
          <div className="space-y-4">
            {sortedReasons.map(([reason, count], _index) => (
              <div key={reason} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{reason}</span>
                  <span className="text-muted-foreground">
                    {count} ({((count / stats.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <Progress 
                  value={(count / maxReasonCount) * 100} 
                  className="h-2"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No opt-out data available yet
          </p>
        )}
      </Card>
      {/* Insights */}
      <Card>
        <h3 className="font-semibold mb-4">Insights & Recommendations</h3>
        <div className="space-y-3">
          {changeValue > 20 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>High opt-out rate detected.</strong> Consider reviewing your SMS frequency and content relevance.
              </AlertDescription>
            </Alert>
          )}
          {stats.thisMonth > 10 && (
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Multiple opt-outs this month.</strong> Ensure messages provide clear value to recipients.
              </AlertDescription>
            </Alert>
          )}
          {sortedReasons[0] && sortedReasons[0][0] === 'Too frequent' && (
            <Alert variant="info">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Frequency concern detected.</strong> Consider reducing SMS campaign frequency or implementing preference controls.
              </AlertDescription>
            </Alert>
          )}
          {stats.total === 0 && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Excellent!</strong> No opt-outs recorded. Your SMS strategy appears to be well-received.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  )
}