'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AppointmentChartProps {
  data?: Array<{
    date: string
    completed: number
    cancelled: number
    noShow: number
  }>
}

export function AppointmentChart({ data = [] }: AppointmentChartProps) {
  const chartConfig = {
    completed: {
      label: 'Completed',
      color: 'hsl(var(--chart-1))',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'hsl(var(--chart-2))',
    },
    noShow: {
      label: 'No Show',
      color: 'hsl(var(--chart-3))',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment Status</CardTitle>
        <CardDescription>
          Breakdown of appointment statuses over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return `${date.getMonth() + 1}/${date.getDate()}`
                }}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill={chartConfig.completed.color} />
              <Bar dataKey="cancelled" stackId="a" fill={chartConfig.cancelled.color} />
              <Bar dataKey="noShow" stackId="a" fill={chartConfig.noShow.color} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}