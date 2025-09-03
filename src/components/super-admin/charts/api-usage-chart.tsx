'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge } from '@/components/ui'
import { 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
interface ApiUsageChartProps {
  apiUsageData: Array<Record<string, unknown>>
  auditLogsData: Array<Record<string, unknown>>
}
export function ApiUsageChart({ apiUsageData, auditLogsData }: ApiUsageChartProps) {
  // Process API endpoints usage
  const processEndpointUsage = () => {
    const endpointCounts: Record<string, number> = {}
    apiUsageData.forEach((usage: Record<string, unknown>) => {
      const endpoint = usage.endpoint as string || 'unknown'
      endpointCounts[endpoint] = (endpointCounts[endpoint] || 0) + (usage.request_count as number || 0)
    })
    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({
        endpoint,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
  // Process API methods distribution
  const processMethodDistribution = () => {
    const methods: Record<string, number> = {
      GET: 0,
      POST: 0,
      PUT: 0,
      DELETE: 0,
      PATCH: 0
    }
    auditLogsData.forEach((log: Record<string, unknown>) => {
      const action = log.action as string || ''
      if (action.includes('create') || action.includes('insert')) methods.POST++
      else if (action.includes('update')) methods.PUT++
      else if (action.includes('delete')) methods.DELETE++
      else if (action.includes('patch')) methods.PATCH++
      else methods.GET++
    })
    return Object.entries(methods).map(([method, count]) => ({
      name: method,
      value: count
    }))
  }
  const endpointUsage = processEndpointUsage()
  const methodDistribution = processMethodDistribution()
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top API Endpoints</CardTitle>
          <CardDescription>Most frequently accessed endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={endpointUsage} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="endpoint" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request Methods</CardTitle>
            <CardDescription>Distribution by HTTP method</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={methodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {methodDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>API Usage Patterns</CardTitle>
            <CardDescription>Request patterns and statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Requests</span>
                <span className="font-semibold">
                  {apiUsageData.reduce((sum, u: Record<string, unknown>) => sum + (u.request_count as number || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Unique Endpoints</span>
                <span className="font-semibold">{endpointUsage.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Most Used</span>
                <Badge variant="outline">{endpointUsage[0]?.endpoint || 'N/A'}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <span className="font-semibold">
                  {apiUsageData.length > 0
                    ? Math.round(apiUsageData.reduce((sum, u: Record<string, unknown>) => sum + (u.response_time as number || 0), 0) / apiUsageData.length)
                    : 0}ms
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}