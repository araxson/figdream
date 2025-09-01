'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface PerformanceMetricsProps {
  data: Array<{
    metric: string
    value: number
    fullMark: number
  }>
  type?: 'radar' | 'pie'
  title?: string
  description?: string
}

const chartConfig = {
  value: {
    label: 'Performance',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export function PerformanceMetrics({ 
  data,
  type = 'radar',
  title = 'Performance Metrics',
  description = 'Key performance indicators'
}: PerformanceMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          {type === 'radar' ? (
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Radar
                name="Performance"
                dataKey="value"
                stroke="var(--color-value)"
                fill="var(--color-value)"
                fillOpacity={0.6}
              />
            </RadarChart>
          ) : (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ metric, value }) => `${metric}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}