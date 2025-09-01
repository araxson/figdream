'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface RetentionChartProps {
  currentRate: number
  returningCustomers: number
  totalCustomers: number
}

export default function RetentionChart({ 
  currentRate, 
  returningCustomers, 
  totalCustomers 
}: RetentionChartProps) {
  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    if (rate >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getRateBadge = (rate: number) => {
    if (rate >= 80) return { label: 'Excellent', variant: 'default' as const }
    if (rate >= 60) return { label: 'Good', variant: 'secondary' as const }
    if (rate >= 40) return { label: 'Fair', variant: 'outline' as const }
    return { label: 'Needs Improvement', variant: 'destructive' as const }
  }

  const badge = getRateBadge(currentRate)
  const monthlyBreakdown = [
    { month: 'Month 1', rate: 85, customers: Math.floor(totalCustomers * 0.85) },
    { month: 'Month 2', rate: 78, customers: Math.floor(totalCustomers * 0.78) },
    { month: 'Month 3', rate: 72, customers: Math.floor(totalCustomers * 0.72) },
    { month: 'Month 6', rate: 65, customers: Math.floor(totalCustomers * 0.65) },
    { month: 'Month 12', rate: currentRate, customers: returningCustomers }
  ]

  return (
    <div className="space-y-6">
      {/* Current Rate Display */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className={`text-4xl font-bold ${getRateColor(currentRate)}`}>
            {currentRate.toFixed(1)}%
          </span>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {returningCustomers} of {totalCustomers} customers retained
        </p>
      </div>

      {/* Retention Funnel */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Retention Funnel</h4>
        {monthlyBreakdown.map((period, index) => (
          <div key={period.month} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{period.month}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{period.rate}%</span>
                <span className="text-xs text-muted-foreground">
                  ({period.customers} customers)
                </span>
              </div>
            </div>
            <Progress 
              value={period.rate} 
              className="h-2"
            />
          </div>
        ))}
      </div>

      {/* Cohort Analysis Preview */}
      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium">Cohort Analysis</h4>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="font-medium">Cohort</div>
          <div className="text-center text-muted-foreground">Month 1</div>
          <div className="text-center text-muted-foreground">Month 2</div>
          <div className="text-center text-muted-foreground">Month 3</div>
          <div className="text-center text-muted-foreground">Month 6</div>
          
          <div className="text-muted-foreground">Jan</div>
          <div className="text-center">95%</div>
          <div className="text-center">82%</div>
          <div className="text-center">74%</div>
          <div className="text-center">68%</div>
          
          <div className="text-muted-foreground">Feb</div>
          <div className="text-center">92%</div>
          <div className="text-center">80%</div>
          <div className="text-center">71%</div>
          <div className="text-center">65%</div>
          
          <div className="text-muted-foreground">Mar</div>
          <div className="text-center">88%</div>
          <div className="text-center">76%</div>
          <div className="text-center">69%</div>
          <div className="text-center">-</div>
        </div>
      </div>

      {/* Retention Insights */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium">Key Insights</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Highest drop-off occurs between Month 1 and Month 2</li>
          <li>• Customers who stay past Month 3 are likely to become long-term</li>
          <li>• Consider targeted campaigns for 2-month inactive customers</li>
        </ul>
      </div>
    </div>
  )
}