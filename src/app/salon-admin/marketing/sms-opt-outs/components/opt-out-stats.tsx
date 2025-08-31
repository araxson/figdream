'use client'

import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PieChart, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'

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
  const reasonColors = [
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
        <Card className="p-6">
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

        <Card className="p-6">
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
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="h-5 w-5" />
          <h3 className="font-semibold">Opt-Out Reasons</h3>
        </div>
        
        {sortedReasons.length > 0 ? (
          <div className="space-y-4">
            {sortedReasons.map(([reason, count], index) => (
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
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Insights & Recommendations</h3>
        <div className="space-y-3">
          {changeValue > 20 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">
                <strong>High opt-out rate detected.</strong> Consider reviewing your SMS frequency and content relevance.
              </p>
            </div>
          )}
          
          {stats.thisMonth > 10 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                <strong>Multiple opt-outs this month.</strong> Ensure messages provide clear value to recipients.
              </p>
            </div>
          )}

          {sortedReasons[0] && sortedReasons[0][0] === 'Too frequent' && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-blue-800">
                <strong>Frequency concern detected.</strong> Consider reducing SMS campaign frequency or implementing preference controls.
              </p>
            </div>
          )}

          {stats.total === 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-800">
                <strong>Excellent!</strong> No opt-outs recorded. Your SMS strategy appears to be well-received.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}