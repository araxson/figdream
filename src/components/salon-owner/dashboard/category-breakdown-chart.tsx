'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useCallback } from 'react'
interface CategoryBreakdownChartProps {
  categories: Array<{
    category: string
    bookings: number
    revenue: number
    percentage: number
  }>
}
function CategoryBreakdownChart({ categories }: CategoryBreakdownChartProps) {
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }, [])

  const data = categories.map(cat => ({
    name: cat.category,
    bookings: cat.bookings,
    revenue: cat.revenue / 100, // Scale down for better visualization
    percentage: cat.percentage
  }))

  const CustomTooltip = useCallback(({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      const category = categories.find(c => c.category === label)
      return (
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg border">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Bookings: {category?.bookings}</p>
          <p className="text-sm">Revenue: {formatCurrency(category?.revenue || 0)}</p>
          <p className="text-sm">Share: {category?.percentage.toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }, [categories, formatCurrency])
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          angle={-45}
          textAnchor="end"
          height={80}
          className="text-xs"
          stroke="currentColor"
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          className="text-xs"
          stroke="currentColor"
          label={{ value: 'Bookings', angle: -90, position: 'insideLeft' }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          className="text-xs"
          stroke="currentColor"
          tickFormatter={(value) => formatCurrency(value * 100)}
          label={{ value: 'Revenue', angle: 90, position: 'insideRight' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="bookings"
          fill="hsl(var(--primary))"
          name="Bookings"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          yAxisId="right"
          dataKey="revenue"
          fill="hsl(var(--muted-foreground))"
          name="Revenue (÷100)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

CategoryBreakdownChart.displayName = 'CategoryBreakdownChart'

export default CategoryBreakdownChart
