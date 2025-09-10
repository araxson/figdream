"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartDataItem, chartConfig } from './revenue-types'

interface RevenueBarChartProps {
  data: ChartDataItem[]
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[300px] w-full"
    >
      <BarChart
        data={data}
        margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => `$${value}`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => value}
            />
          }
        />
        <Bar 
          dataKey="revenue" 
          fill="var(--color-revenue)" 
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="tips" 
          fill="var(--color-tips)" 
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}