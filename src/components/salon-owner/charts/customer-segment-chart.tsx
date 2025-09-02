'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface CustomerSegmentChartProps {
  data?: Array<{
    segment: string
    count: number
    percentage: number
  }>
}

export function CustomerSegmentChart({ data = [] }: CustomerSegmentChartProps) {
  // Default data if none provided
  const chartData = data.length > 0 ? data : [
    { segment: 'New', count: 0, percentage: 0 },
    { segment: 'Regular', count: 0, percentage: 0 },
    { segment: 'VIP', count: 0, percentage: 0 },
    { segment: 'At Risk', count: 0, percentage: 0 }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Segments</CardTitle>
        <CardDescription>Distribution of customers by segment</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" name="Customers" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}