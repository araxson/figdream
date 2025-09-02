'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RetentionChartProps {
  data?: Array<{
    month: string
    retention: number
    new: number
    returning: number
  }>
}

export function RetentionChart({ data = [] }: RetentionChartProps) {
  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', retention: 0, new: 0, returning: 0 },
    { month: 'Feb', retention: 0, new: 0, returning: 0 },
    { month: 'Mar', retention: 0, new: 0, returning: 0 },
    { month: 'Apr', retention: 0, new: 0, returning: 0 },
    { month: 'May', retention: 0, new: 0, returning: 0 },
    { month: 'Jun', retention: 0, new: 0, returning: 0 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Retention Trends</CardTitle>
        <CardDescription>Monthly retention and acquisition metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="retention" 
              stroke="#8884d8" 
              name="Retention Rate (%)"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="returning" 
              stroke="#82ca9d" 
              name="Returning Customers"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="new" 
              stroke="#ffc658" 
              name="New Customers"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}