'use client'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, CardContent } from '@/components/ui'
interface ServicePerformanceMatrixProps {
  services: Array<{
    id: string
    name: string
    bookings: number
    revenue: number
    efficiency: number
    avgPrice: number
  }>
}
export default function ServicePerformanceMatrix({ services }: ServicePerformanceMatrixProps) {
  // Prepare data for scatter plot
  const data = services.map(service => ({
    x: service.bookings,
    y: service.avgPrice,
    z: service.revenue,
    name: service.name,
    efficiency: service.efficiency
  }))
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { x: number; y: number; z: number; name: string } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Bookings: {data.x}</p>
          <p className="text-sm">Avg Price: {formatCurrency(data.y)}</p>
          <p className="text-sm">Total Revenue: {formatCurrency(data.z)}</p>
        </div>
      )
    }
    return null
  }
  // Color based on efficiency
  const getColor = (efficiency: number) => {
    const maxEfficiency = Math.max(...services.map(s => s.efficiency))
    const ratio = efficiency / maxEfficiency
    if (ratio > 0.75) return '#10b981' // green-500
    if (ratio > 0.5) return '#3b82f6'  // blue-500
    if (ratio > 0.25) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }
  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 50 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            dataKey="x"
            name="Bookings"
            label={{ value: 'Number of Bookings', position: 'insideBottom', offset: -10 }}
            className="text-xs"
            stroke="currentColor"
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Average Price"
            tickFormatter={formatCurrency}
            label={{ value: 'Average Price', angle: -90, position: 'insideLeft' }}
            className="text-xs"
            stroke="currentColor"
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter name="Services" data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(services[index].efficiency)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Matrix Quadrants Explanation */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="font-medium">Stars</span>
            </div>
            <p className="text-xs text-muted-foreground">
              High bookings, high price - Your best performers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="font-medium">Opportunities</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Low bookings, high price - Need more promotion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <span className="font-medium">Workhorses</span>
            </div>
            <p className="text-xs text-muted-foreground">
              High bookings, low price - Consider price increase
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <span className="font-medium">Review</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Low bookings, low price - Need strategic review
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}