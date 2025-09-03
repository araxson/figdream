'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Alert, AlertDescription } from '@/components/ui'
import { TrendingUp, TrendingDown, Calendar, Sun, Snowflake, Flower, Leaf } from 'lucide-react'
interface SeasonalityAnalysisProps {
  salonId: string
  monthlyData: Record<number, number>
}
export function SeasonalityAnalysis({ salonId: _salonId, monthlyData }: SeasonalityAnalysisProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  // Calculate seasonal aggregates
  const seasons = {
    winter: (monthlyData[11] || 0) + (monthlyData[0] || 0) + (monthlyData[1] || 0),
    spring: (monthlyData[2] || 0) + (monthlyData[3] || 0) + (monthlyData[4] || 0),
    summer: (monthlyData[5] || 0) + (monthlyData[6] || 0) + (monthlyData[7] || 0),
    fall: (monthlyData[8] || 0) + (monthlyData[9] || 0) + (monthlyData[10] || 0),
  }
  const totalAppointments = Object.values(seasons).reduce((sum, val) => sum + val, 0)
  const avgPerSeason = totalAppointments / 4
  const bestSeason = Object.entries(seasons)
    .sort(([, a], [, b]) => b - a)[0]
  const worstSeason = Object.entries(seasons)
    .sort(([, a], [, b]) => a - b)[0]
  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'winter': return <Snowflake className="h-5 w-5" />
      case 'spring': return <Flower className="h-5 w-5" />
      case 'summer': return <Sun className="h-5 w-5" />
      case 'fall': return <Leaf className="h-5 w-5" />
      default: return <Calendar className="h-5 w-5" />
    }
  }
  const getSeasonalInsights = () => {
    const insights = []
    // Best performing season
    if (bestSeason[1] > avgPerSeason * 1.2) {
      insights.push({
        type: 'success',
        title: `${bestSeason[0].charAt(0).toUpperCase() + bestSeason[0].slice(1)} is your peak season`,
        description: `${Math.round((bestSeason[1] / totalAppointments) * 100)}% of annual bookings occur in ${bestSeason[0]}`,
        action: 'Consider hiring seasonal staff or extending hours',
      })
    }
    // Underperforming season
    if (worstSeason[1] < avgPerSeason * 0.8) {
      insights.push({
        type: 'warning',
        title: `${worstSeason[0].charAt(0).toUpperCase() + worstSeason[0].slice(1)} needs attention`,
        description: `Only ${Math.round((worstSeason[1] / totalAppointments) * 100)}% of bookings in ${worstSeason[0]}`,
        action: 'Run promotional campaigns to boost off-season business',
      })
    }
    // Holiday patterns
    const december = monthlyData[11] || 0
    const january = monthlyData[0] || 0
    const avgMonth = totalAppointments / 12
    if (december > avgMonth * 1.5) {
      insights.push({
        type: 'info',
        title: 'Holiday season surge detected',
        description: 'December shows significantly higher bookings',
        action: 'Prepare holiday packages and gift certificates',
      })
    }
    if (january < avgMonth * 0.7) {
      insights.push({
        type: 'info',
        title: 'Post-holiday slowdown',
        description: 'January typically sees fewer bookings',
        action: 'Offer New Year promotions to maintain momentum',
      })
    }
    return insights
  }
  const insights = getSeasonalInsights()
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Seasonal Performance Analysis</CardTitle>
          <CardDescription>
            Understanding seasonal trends in your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {Object.entries(seasons).map(([season, count]) => {
              const percentage = totalAppointments > 0 ? (count / totalAppointments) * 100 : 0
              const trend = count > avgPerSeason ? 'up' : 'down'
              return (
                <Card key={season}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      {getSeasonIcon(season)}
                      {trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium capitalize">{season}</p>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(percentage)}% of total
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Monthly Breakdown</h4>
            <div className="grid gap-2 md:grid-cols-3">
              {monthNames.map((month, index) => {
                const count = monthlyData[index] || 0
                const maxCount = Math.max(...Object.values(monthlyData))
                const isHighest = count === maxCount
                const isLowest = count === Math.min(...Object.values(monthlyData))
                return (
                  <div key={month} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">{month}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{count} bookings</span>
                      {isHighest && <Badge variant="default">Peak</Badge>}
                      {isLowest && <Badge variant="secondary">Low</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Seasonal Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.map((insight, index) => (
              <Alert key={index}>
                <AlertDescription>
                  <p className="font-medium mb-1">{insight.title}</p>
                  <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                  <p className="text-sm">
                    <strong>Action:</strong> {insight.action}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}