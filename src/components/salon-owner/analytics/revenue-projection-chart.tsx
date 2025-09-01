'use client'

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface RevenueProjectionChartProps {
  projections: Array<{
    month: string
    projected: number
    optimistic: number
    pessimistic: number
    confidence: number
  }>
}

export default function RevenueProjectionChart({ projections }: RevenueProjectionChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = projections.find(p => p.month === label)
      return (
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-green-600">
              Optimistic: {formatCurrency(data?.optimistic || 0)}
            </p>
            <p className="font-medium">
              Expected: {formatCurrency(data?.projected || 0)}
            </p>
            <p className="text-orange-600">
              Pessimistic: {formatCurrency(data?.pessimistic || 0)}
            </p>
            <p className="text-muted-foreground">
              Confidence: {data?.confidence}%
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={projections}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="month"
          className="text-xs"
          stroke="currentColor"
        />
        <YAxis
          tickFormatter={formatCurrency}
          className="text-xs"
          stroke="currentColor"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="optimistic"
          stroke="#10b981"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          name="Optimistic"
        />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ r: 4 }}
          name="Expected"
        />
        <Line
          type="monotone"
          dataKey="pessimistic"
          stroke="#f97316"
          strokeWidth={1}
          strokeDasharray="5 5"
          dot={false}
          name="Pessimistic"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}