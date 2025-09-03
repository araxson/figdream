'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, ChartContainer } from '@/components/ui'
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { Users, UserPlus, UserCheck, TrendingUp } from 'lucide-react'
interface CustomerInsightsProps {
  data?: {
    newCustomers: number
    totalCustomers: number
    returningCustomers: number
    retentionRate: string
    averageVisits: string
  }
}
export function CustomerInsights({ data }: CustomerInsightsProps) {
  const pieData = [
    { name: 'New', value: data?.newCustomers || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Returning', value: data?.returningCustomers || 0, color: 'hsl(var(--chart-2))' },
  ]
  const stats = [
    {
      label: 'Total Customers',
      value: data?.totalCustomers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'New This Month',
      value: data?.newCustomers || 0,
      icon: UserPlus,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Retention Rate',
      value: data?.retentionRate || '0%',
      icon: UserCheck,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Avg Visits',
      value: data?.averageVisits || '0',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Insights</CardTitle>
        <CardDescription>
          Customer acquisition and retention metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-3 w-3 ${stat.color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </div>
          {/* Customer Type Pie Chart */}
          <div>
            <h4 className="text-sm font-medium mb-3">Customer Distribution</h4>
            <ChartContainer
              config={{
                new: {
                  label: 'New Customers',
                  color: 'hsl(var(--chart-1))',
                },
                returning: {
                  label: 'Returning Customers',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
          {/* Insights */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">Key Insights</h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Customer retention rate: {data?.retentionRate || '0%'}</li>
              <li>• Average visits per customer: {data?.averageVisits || '0'}</li>
              <li>• New customer growth: {((data?.newCustomers || 0) / (data?.totalCustomers || 1) * 100).toFixed(1)}%</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}