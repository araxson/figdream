"use client"

import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Clock, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
export function WaitlistAnalytics() {
  const stats = {
    averageWaitTime: "3.2 days",
    conversionRate: 68,
    totalThisMonth: 45,
    peakDays: ["Friday", "Saturday"]
  }
  const waitTimeData = [
    { day: 'Mon', wait: 2.1 },
    { day: 'Tue', wait: 2.5 },
    { day: 'Wed', wait: 2.8 },
    { day: 'Thu', wait: 3.2 },
    { day: 'Fri', wait: 4.5 },
    { day: 'Sat', wait: 5.1 },
    { day: 'Sun', wait: 3.0 }
  ]
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Average Wait Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.averageWaitTime}</div>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={waitTimeData}>
              <Line type="monotone" dataKey="wait" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.conversionRate}%</div>
          <Progress value={stats.conversionRate} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Waitlist to booking conversion
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
