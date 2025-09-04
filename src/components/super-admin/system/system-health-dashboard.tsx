"use client"
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { useState, useEffect } from "react"
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { 
  Activity, Server, Database, AlertTriangle, 
  CheckCircle, XCircle, Clock, Cpu, HardDrive,
  Network, Shield, RefreshCw, Loader2
} from "lucide-react"
interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  threshold: number
}
interface ServerStatus {
  id: string
  name: string
  region: string
  status: 'online' | 'offline' | 'degraded'
  cpu: number
  memory: number
  disk: number
  uptime: string
  lastCheck: string
}
interface DatabaseMetric {
  connections: number
  maxConnections: number
  queryTime: number
  slowQueries: number
  replicationLag: number
  size: string
}
interface ApiMetric {
  endpoint: string
  avgResponseTime: number
  p95ResponseTime: number
  p99ResponseTime: number
  errorRate: number
  rpm: number // requests per minute
}
export function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [servers, setServers] = useState<ServerStatus[]>([])
  const [dbMetrics, setDbMetrics] = useState<DatabaseMetric | null>(null)
  const [apiMetrics, setApiMetrics] = useState<ApiMetric[]>([])
  const [performanceData, setPerformanceData] = useState<Array<{ time: string; cpu: number; memory: number; requests: number; responseTime: number }>>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  useEffect(() => {
    fetchSystemHealth()
    const interval = autoRefresh ? setInterval(fetchSystemHealth, 30000) : null // Refresh every 30 seconds
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])
  const fetchSystemHealth = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual system monitoring API calls
      // For now, showing empty data instead of mock data
      setMetrics([])
      setServers([])
      setDbMetrics(null)
      setApiMetrics([])
      setPerformanceData([])
      
      // Implementation needed:
      // - Query system monitoring APIs or database for real metrics
      // - Connect to monitoring service (e.g., DataDog, New Relic, Prometheus)
      // - Get actual server health status from infrastructure provider
    } catch (_error) {
    } finally {
      setLoading(false)
    }
  }
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600'
      case 'warning':
      case 'degraded':
        return 'text-yellow-600'
      case 'critical':
      case 'offline':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }
  if (loading && metrics.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Real-time system monitoring and health metrics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-refreshing' : 'Auto-refresh off'}
          </Button>
          <Button onClick={fetchSystemHealth} variant="outline">
            Refresh Now
          </Button>
        </div>
      </div>
      {/* System Status Alert */}
      <Alert className="border-yellow-600 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>System Warning</AlertTitle>
        <AlertDescription>
          Database replica experiencing higher than normal latency. Monitoring situation.
        </AlertDescription>
      </Alert>
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {metrics.map((metric) => (
          <Card key={metric.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}{metric.unit}
                </span>
                {getStatusIcon(metric.status)}
              </div>
              <Progress 
                value={(metric.value / metric.threshold) * 100} 
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Threshold: {metric.threshold}{metric.unit}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Tabs defaultValue="servers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="servers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Status</CardTitle>
              <CardDescription>Real-time server health and resource usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servers.map((server) => (
                  <div key={server.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4" />
                          <span className="font-medium">{server.name}</span>
                          {getStatusIcon(server.status)}
                          <Badge variant={server.status === 'online' ? 'default' : server.status === 'degraded' ? 'secondary' : 'destructive'}>
                            {server.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {server.region} • Uptime: {server.uptime} • Last check: {server.lastCheck}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm flex items-center gap-1">
                            <Cpu className="h-3 w-3" /> CPU
                          </span>
                          <span className="text-sm font-medium">{server.cpu}%</span>
                        </div>
                        <Progress value={server.cpu} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm flex items-center gap-1">
                            <Activity className="h-3 w-3" /> Memory
                          </span>
                          <span className="text-sm font-medium">{server.memory}%</span>
                        </div>
                        <Progress value={server.memory} />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm flex items-center gap-1">
                            <HardDrive className="h-3 w-3" /> Disk
                          </span>
                          <span className="text-sm font-medium">{server.disk}%</span>
                        </div>
                        <Progress value={server.disk} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Performance</CardTitle>
              <CardDescription>Database health and query performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-medium">Connections</span>
                  </div>
                  <div className="text-2xl font-bold">{dbMetrics?.connections}/{dbMetrics?.maxConnections}</div>
                  <Progress value={(dbMetrics?.connections || 0) / (dbMetrics?.maxConnections || 1) * 100} className="mt-2" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Avg Query Time</span>
                  </div>
                  <div className="text-2xl font-bold">{dbMetrics?.queryTime}ms</div>
                  <Badge variant={(dbMetrics?.queryTime ?? 0) < 100 ? 'default' : 'secondary'} className="mt-2">
                    {(dbMetrics?.queryTime ?? 0) < 100 ? 'Optimal' : 'Slow'}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Slow Queries</span>
                  </div>
                  <div className="text-2xl font-bold">{dbMetrics?.slowQueries}</div>
                  <p className="text-xs text-muted-foreground mt-2">Last hour</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="h-4 w-4" />
                    <span className="text-sm font-medium">Replication Lag</span>
                  </div>
                  <div className="text-2xl font-bold">{dbMetrics?.replicationLag}ms</div>
                  <Badge variant={(dbMetrics?.replicationLag ?? 0) < 200 ? 'default' : 'destructive'} className="mt-2">
                    {(dbMetrics?.replicationLag ?? 0) < 200 ? 'Healthy' : 'High Lag'}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm font-medium">Database Size</span>
                  </div>
                  <div className="text-2xl font-bold">{dbMetrics?.size}</div>
                  <p className="text-xs text-muted-foreground mt-2">Total storage</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Backup Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Healthy</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Last: 2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>Endpoint response times and error rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiMetrics.map((api) => (
                  <div key={api.endpoint} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <code className="text-sm font-mono font-medium">{api.endpoint}</code>
                        <p className="text-sm text-muted-foreground mt-1">
                          {api.rpm} requests/min
                        </p>
                      </div>
                      <Badge variant={api.errorRate < 0.5 ? 'default' : api.errorRate < 1 ? 'secondary' : 'destructive'}>
                        {api.errorRate}% errors
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Response</p>
                        <p className="text-lg font-medium">{api.avgResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">P95 Response</p>
                        <p className="text-lg font-medium">{api.p95ResponseTime}ms</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">P99 Response</p>
                        <p className="text-lg font-medium">{api.p99ResponseTime}ms</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>24-hour system performance overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="requests" stroke="#ffc658" name="Requests/min" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}