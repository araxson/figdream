'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CustomerSegmentChartProps {
  segments: {
    vip: { count: number; percentage: number }
    regular: { count: number; percentage: number }
    occasional: { count: number; percentage: number }
    new: { count: number; percentage: number }
  }
}

export default function CustomerSegmentChart({ segments }: CustomerSegmentChartProps) {
  const data = [
    { name: 'VIP', value: segments.vip.count, percentage: segments.vip.percentage },
    { name: 'Regular', value: segments.regular.count, percentage: segments.regular.percentage },
    { name: 'Occasional', value: segments.occasional.count, percentage: segments.occasional.percentage },
    { name: 'New', value: segments.new.count, percentage: segments.new.percentage }
  ]

  const COLORS = {
    VIP: '#facc15',      // yellow-400
    Regular: '#f97316',  // orange-500
    Occasional: '#3b82f6', // blue-500
    New: '#10b981'       // green-500
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">Count: {payload[0].value}</p>
          <p className="text-sm">Percentage: {payload[0].payload.percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percentage }) => `${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}