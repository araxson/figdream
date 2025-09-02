import { redirect } from "next/navigation"
import { createClient } from "@/lib/database/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Progress, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import { Activity, Database, Server, Wifi, CheckCircle, AlertCircle, XCircle } from "lucide-react"

export default async function SystemHealthPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: userRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "super_admin")
    .single()

  if (!userRole) redirect("/error-403")

  // Get system metrics (simulated for now)
  const systemMetrics = {
    database: {
      status: "healthy",
      connections: 45,
      maxConnections: 100,
      responseTime: 23,
      storage: 2.3,
      maxStorage: 10,
    },
    api: {
      status: "healthy",
      uptime: 99.9,
      avgResponseTime: 145,
      requestsPerMinute: 1250,
      errorRate: 0.02,
    },
    services: [
      { name: "Authentication", status: "operational", uptime: 99.99 },
      { name: "Database", status: "operational", uptime: 99.95 },
      { name: "Email Service", status: "operational", uptime: 99.8 },
      { name: "SMS Service", status: "degraded", uptime: 98.5 },
      { name: "Payment Gateway", status: "operational", uptime: 99.9 },
      { name: "File Storage", status: "operational", uptime: 99.99 },
    ],
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "down":
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variant = status === "operational" || status === "healthy" 
      ? "default" 
      : status === "degraded" 
      ? "secondary" 
      : "destructive"
    return <Badge variant={variant}>{status}</Badge>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground">Monitor platform health and performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon("healthy")}
              <span className="text-2xl font-bold">Healthy</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Uptime</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.api.uptime}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.api.avgResponseTime}ms</div>
            <p className="text-xs text-muted-foreground">Average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.api.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
                <CardDescription>Current status of all platform services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemMetrics.services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.uptime}% uptime
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(service.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Health</CardTitle>
              <CardDescription>Database performance and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-xs text-muted-foreground">Database connectivity</p>
                </div>
                {getStatusBadge(systemMetrics.database.status)}
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Connections</span>
                  <span>{systemMetrics.database.connections}/{systemMetrics.database.maxConnections}</span>
                </div>
                <Progress 
                  value={(systemMetrics.database.connections / systemMetrics.database.maxConnections) * 100} 
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Storage Used</span>
                  <span>{systemMetrics.database.storage}GB / {systemMetrics.database.maxStorage}GB</span>
                </div>
                <Progress 
                  value={(systemMetrics.database.storage / systemMetrics.database.maxStorage) * 100} 
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-xs text-muted-foreground">Average query time</p>
                </div>
                <span className="text-2xl font-bold">{systemMetrics.database.responseTime}ms</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Performance</CardTitle>
              <CardDescription>API metrics and performance data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Requests per Minute</p>
                  <p className="text-3xl font-bold">{systemMetrics.api.requestsPerMinute}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Average Response Time</p>
                  <p className="text-3xl font-bold">{systemMetrics.api.avgResponseTime}ms</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Error Rate</p>
                  <p className="text-3xl font-bold">{systemMetrics.api.errorRate}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Uptime (30 days)</p>
                  <p className="text-3xl font-bold">{systemMetrics.api.uptime}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>External Services</CardTitle>
              <CardDescription>Status of integrated third-party services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemMetrics.services.map((service) => (
                  <div key={service.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{service.name}</h4>
                      {getStatusBadge(service.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Uptime: {service.uptime}%
                    </div>
                    <Progress 
                      value={service.uptime} 
                      className="mt-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}