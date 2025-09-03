'use client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts'
interface SystemMetricsChartProps {
  apiUsageData: Array<Record<string, unknown>>
  errorLogsData: Array<Record<string, unknown>>
}
export function SystemMetricsChart({ apiUsageData, errorLogsData }: SystemMetricsChartProps) {
  // Process data for time-series visualization
  const processTimeSeriesData = () => {
    const hourlyData: Record<string, {
      time: string
      apiCalls: number
      errors: number
      avgResponseTime: number
    }> = {}
    // Initialize 24 hours
    for (let i = 23; i >= 0; i--) {
      const hour = new Date()
      hour.setHours(hour.getHours() - i)
      const hourKey = hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      hourlyData[hourKey] = {
        time: hourKey,
        apiCalls: 0,
        errors: 0,
        avgResponseTime: 0
      }
    }
    // Aggregate API usage data
    apiUsageData.forEach((usage: Record<string, unknown>) => {
      const date = new Date(usage.created_at as string)
      const hourKey = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      if (hourlyData[hourKey]) {
        hourlyData[hourKey].apiCalls += usage.request_count as number || 0
        hourlyData[hourKey].avgResponseTime += usage.response_time as number || 0
      }
    })
    // Aggregate error logs
    errorLogsData.forEach((error: Record<string, unknown>) => {
      const date = new Date(error.created_at as string)
      const hourKey = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      if (hourlyData[hourKey]) {
        hourlyData[hourKey].errors++
      }
    })
    // Calculate averages
    Object.values(hourlyData).forEach(hour => {
      if (hour.apiCalls > 0) {
        hour.avgResponseTime = hour.avgResponseTime / hour.apiCalls
      }
    })
    return Object.values(hourlyData)
  }
  const timeSeriesData = processTimeSeriesData()
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Traffic & Performance</CardTitle>
          <CardDescription>Real-time system performance metrics over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="apiCalls" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="API Calls"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="avgResponseTime" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Avg Response Time (ms)"
              />
              <ReferenceLine 
                yAxisId="right" 
                y={200} 
                stroke="#ef4444" 
                strokeDasharray="3 3" 
                label="Target Response Time"
              />
              <Brush dataKey="time" height={30} stroke="#3b82f6" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Error Rate Analysis</CardTitle>
          <CardDescription>System errors and exceptions over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="errors" 
                stroke="#ef4444" 
                fillOpacity={1} 
                fill="url(#colorErrors)"
                name="Errors"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}