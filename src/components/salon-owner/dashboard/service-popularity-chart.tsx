'use client'

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ServicePopularityChartProps {
  services: Array<{
    id: string
    name: string
    category: string
    bookings: number
    revenue: number
  }>
}

export default function ServicePopularityChart({ services }: ServicePopularityChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const data = services.map(service => ({
    name: service.name.length > 15 ? service.name.substring(0, 15) + '...' : service.name,
    fullName: service.name,
    bookings: service.bookings,
    revenue: service.revenue,
    category: service.category
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 50 }}
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
          className="text-xs"
          stroke="currentColor"
        />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'bookings') return [value, 'Bookings']
            return [formatCurrency(value), 'Revenue']
          }}
          labelFormatter={(index: number) => {
            if (data[index]) {
              return data[index].fullName
            }
            return ''
          }}
          contentStyle={{
            backgroundColor: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar
          dataKey="bookings"
          fill="hsl(var(--primary))"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}