'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line
} from 'recharts'
import type { RevenueDataPoint, ServicePerformance } from './types'
import { COLORS } from './types'

interface RevenueDashboardProps {
  revenueData: RevenueDataPoint[]
  servicePerformance: ServicePerformance[]
}

export function RevenueDashboard({ revenueData, servicePerformance }: RevenueDashboardProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly revenue and booking trends</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                name="Revenue ($)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="bookings"
                stroke="#10B981"
                strokeWidth={2}
                name="Bookings"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Revenue by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={servicePerformance}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: $${(entry.revenue / 1000).toFixed(0)}k`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {servicePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Generators</CardTitle>
            <CardDescription>Services by revenue contribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servicePerformance.slice(0, 4).map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    />
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">${(service.revenue / 1000).toFixed(1)}k</span>
                    <Badge
                      variant={service.growth > 0 ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {service.growth > 0 ? '+' : ''}{service.growth}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}