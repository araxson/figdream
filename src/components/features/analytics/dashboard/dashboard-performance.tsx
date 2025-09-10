import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users } from 'lucide-react'

interface PerformanceData {
  topServices: Array<{
    service: string
    count: number
    revenue: number
  }>
  regularClients: number
}

interface DashboardPerformanceProps {
  data: PerformanceData
}

export function DashboardPerformance({ data }: DashboardPerformanceProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Services</CardTitle>
          <CardDescription>Most requested services this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="text-sm">{service.service}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{service.count} bookings</p>
                  <p className="text-xs text-muted-foreground">${service.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Your growth and client retention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Regular Clients</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{data.regularClients}</p>
                <p className="text-xs text-muted-foreground">Active this month</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Growth Rate</span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">+15%</p>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}