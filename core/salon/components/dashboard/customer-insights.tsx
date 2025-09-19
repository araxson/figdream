'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Star } from 'lucide-react'
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import type { CustomerSegment } from './types'
import { COLORS } from './types'

interface CustomerInsightsProps {
  customerSegments: CustomerSegment[]
}

export function CustomerInsights({ customerSegments }: CustomerInsightsProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>Distribution of customer types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={customerSegments}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {customerSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {customerSegments.map((segment, index) => (
                <div key={segment.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index] }}
                  />
                  <span className="text-sm">
                    {segment.name}: {segment.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Metrics</CardTitle>
            <CardDescription>Key customer performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">New Customers</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">45</span>
                  <Badge variant="default" className="text-xs">+15%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Returning Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">78%</span>
                  <Badge variant="secondary" className="text-xs">-2%</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Frequency</span>
                <span className="font-semibold">2.3 visits/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lifetime Value</span>
                <span className="font-semibold">$1,250</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Churn Rate</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">12%</span>
                  <Badge variant="destructive" className="text-xs">+3%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Satisfaction</CardTitle>
          <CardDescription>Rating distribution and feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-4xl font-bold">4.8</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= 4.8 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Based on 245 reviews</p>
              </div>
            </div>
            <div className="col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const percentage = rating === 5 ? 75 : rating === 4 ? 15 : rating === 3 ? 7 : rating === 2 ? 2 : 1
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm w-10 text-right">{percentage}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}