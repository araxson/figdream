import { Metadata } from 'next'
import { getApiUsageStats } from '@/lib/data-access/monitoring/api-usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ApiUsageChart } from '@/components/super-admin/charts'

export const metadata: Metadata = {
  title: 'API Usage Monitoring',
  description: 'Monitor API endpoint usage and performance',
}

export default async function ApiUsagePage() {
  // Get stats for the last 24 hours
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 1)
  
  const stats = await getApiUsageStats(startDate, endDate)
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Usage</h1>
        <p className="text-muted-foreground">
          Monitor API endpoint usage and performance metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRequests ?? 0}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats?.averageResponseTime ?? 0)}ms</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.errorRate ?? 0}%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requests/Min</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats?.requestsPerMinute ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Average rate</p>
          </CardContent>
        </Card>
      </div>

      <ApiUsageChart apiUsageData={[]} auditLogsData={[]} />
    </div>
  )
}