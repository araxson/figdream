'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { ServicePerformance as ServicePerformanceType } from './types'
import { COLORS } from './types'

interface ServicePerformanceProps {
  servicePerformance: ServicePerformanceType[]
}

export function ServicePerformance({ servicePerformance }: ServicePerformanceProps) {
  const maxRevenue = Math.max(...servicePerformance.map(s => s.revenue))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Service Performance</CardTitle>
          <CardDescription>Detailed analysis of service metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servicePerformance.map((service, index) => (
              <div key={service.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{service.bookings} bookings</span>
                    <span className="font-semibold">${(service.revenue / 1000).toFixed(1)}k</span>
                    <Badge
                      variant={service.growth > 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {service.growth > 0 ? '+' : ''}{service.growth}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={(service.revenue / maxRevenue) * 100}
                  className="h-2"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Utilization</CardTitle>
            <CardDescription>Staff time allocation by service</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={servicePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Trends</CardTitle>
            <CardDescription>Growth indicators by service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
                <span className="text-sm font-medium">Trending Up</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-xs">
                    {servicePerformance.filter(s => s.growth > 5).length} services
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                <span className="text-sm font-medium">Stable</span>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs">
                    {servicePerformance.filter(s => s.growth >= -5 && s.growth <= 5).length} services
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950">
                <span className="text-sm font-medium">Declining</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-xs">
                    {servicePerformance.filter(s => s.growth < -5).length} services
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}