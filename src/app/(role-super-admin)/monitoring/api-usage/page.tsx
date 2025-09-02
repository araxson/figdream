import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, Badge, ScrollArea } from '@/components/ui'
import { 
  getApiUsageStats, 
  getRecentApiUsage,
  getApiUsageByEndpoint 
} from '@/lib/data-access/monitoring/api-usage'
import { formatDistanceToNow } from 'date-fns'

export default async function ApiUsagePage() {
  // Get stats for last 24 hours
  const startDate = new Date()
  startDate.setHours(startDate.getHours() - 24)
  const endDate = new Date()
  
  const stats = await getApiUsageStats(startDate, endDate)
  const recentUsage = await getRecentApiUsage(100)
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Usage Monitoring</h1>
        <p className="text-muted-foreground">Monitor API requests and performance metrics</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRequests > 0 
                ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.successfulRequests} successful
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">Average latency</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.errorRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.failedRequests} failed
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="endpoints">Top Endpoints</TabsTrigger>
          <TabsTrigger value="recent">Recent Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Used Endpoints</CardTitle>
              <CardDescription>Top 10 endpoints by request count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topEndpoints.map((endpoint, index) => (
                  <div key={endpoint.endpoint} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{endpoint.endpoint}</p>
                        <p className="text-xs text-muted-foreground">
                          Avg: {endpoint.averageResponseTime.toFixed(0)}ms
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {endpoint.count.toLocaleString()} requests
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent API Requests</CardTitle>
              <CardDescription>Last 100 API requests</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {recentUsage.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={request.method === 'GET' ? 'secondary' : 'default'}>
                            {request.method}
                          </Badge>
                          <span className="text-sm font-medium">{request.endpoint}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                          </span>
                          {request.response_time_ms && (
                            <span className="text-xs text-muted-foreground">
                              {request.response_time_ms}ms
                            </span>
                          )}
                          {request.user_id && (
                            <span className="text-xs text-muted-foreground">
                              User: {request.user_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={
                          !request.status_code ? 'outline' :
                          request.status_code < 400 ? 'default' : 
                          request.status_code < 500 ? 'secondary' : 
                          'destructive'
                        }
                      >
                        {request.status_code || 'N/A'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}