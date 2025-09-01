'use client'

import { Area, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts'
import { format } from 'date-fns'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

interface DemandForecastChartProps {
  forecast: Array<{
    date: string
    dayOfWeek: string
    predicted: number
    confidence: number
  }>
}

export default function DemandForecastChart({ forecast }: DemandForecastChartProps) {
  const data = forecast.map(day => ({
    ...day,
    upper: Math.round(day.predicted * (1 + (100 - day.confidence) / 100)),
    lower: Math.round(day.predicted * (1 - (100 - day.confidence) / 100))
  }))

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd')
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-sm">{data.dayOfWeek}</p>
          <p className="text-sm">Predicted: {data.predicted} bookings</p>
          <p className="text-sm">Range: {data.lower} - {data.upper}</p>
          <p className="text-sm">Confidence: {data.confidence}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          className="text-xs"
          stroke="currentColor"
        />
        <YAxis
          className="text-xs"
          stroke="currentColor"
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="upper"
          stackId="1"
          stroke="transparent"
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
        />
        <Area
          type="monotone"
          dataKey="predicted"
          stackId="2"
          stroke="hsl(var(--primary))"
          fill="hsl(var(--primary))"
          fillOpacity={0.6}
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="lower"
          stackId="1"
          stroke="transparent"
          fill="hsl(var(--primary))"
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}