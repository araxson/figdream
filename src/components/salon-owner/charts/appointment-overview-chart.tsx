'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ComposedChart, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts'

interface AppointmentOverviewProps {
  data: Array<{
    name: string
    total: number
    completed: number
    cancelled: number
    pending: number
  }>
  title?: string
  description?: string
}

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
  completed: {
    label: 'Completed',
    color: 'hsl(var(--chart-2))',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'hsl(var(--chart-3))',
  },
  pending: {
    label: 'Pending',
    color: 'hsl(var(--chart-4))',
  },
} satisfies ChartConfig

export function AppointmentOverviewChart({ 
  data,
  title = 'Appointment Overview',
  description = 'Status breakdown of appointments'
}: AppointmentOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="completed" stackId="a" fill="var(--color-completed)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pending" stackId="a" fill="var(--color-pending)" radius={[0, 0, 0, 0]} />
            <Bar dataKey="cancelled" stackId="a" fill="var(--color-cancelled)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}