"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartDataItem, chartConfig } from './revenue-types'

interface RevenueAreaChartProps {
  data: ChartDataItem[]
}

export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[300px] w-full"
    >
      <AreaChart
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
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="var(--color-revenue)"
          fillOpacity={0.6}
        />
        <Area
          type="monotone"
          dataKey="tips"
          stroke="var(--color-tips)"
          fill="var(--color-tips)"
          fillOpacity={0.6}
        />
      </AreaChart>
    </ChartContainer>
  )
}