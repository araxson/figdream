"use client"
import { useState, useEffect } from "react"
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Calendar, Users, Activity, TrendingUp, Clock, Zap, Loader2 } from "lucide-react"
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Progress, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
interface UsageMetric {
  date: string
  dau: number // Daily Active Users
  wau: number // Weekly Active Users
  mau: number // Monthly Active Users
  sessions: number
  avgSessionDuration: number
}
interface FeatureUsage {
  feature: string
  hour: number
  usage: number
  intensity: 'low' | 'medium' | 'high' | 'peak'
}
interface PeakUsage {
  day: string
  hour: string
  users: number
  load: number
}
interface ApiPattern {
  endpoint: string
  calls: number
  avgResponseTime: number
  errorRate: number
  trend: 'up' | 'down' | 'stable'
}
export function UsageTrends() {
  const [timeRange, setTimeRange] = useState("7d")
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([])
  const [featureHeatmap, setFeatureHeatmap] = useState<FeatureUsage[]>([])
  const [peakUsage, setPeakUsage] = useState<PeakUsage[]>([])
  const [apiPatterns, setApiPatterns] = useState<ApiPattern[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetchUsageTrends()
  }, [timeRange])
  const fetchUsageTrends = async () => {
    setLoading(true)
    try {
      // Simulated data - replace with actual API calls
      setUsageMetrics([
        { date: "Mon", dau: 12000, wau: 28000, mau: 42000, sessions: 45000, avgSessionDuration: 12.5 },
        { date: "Tue", dau: 13500, wau: 29000, mau: 42500, sessions: 48000, avgSessionDuration: 13.2 },
        { date: "Wed", dau: 14200, wau: 30000, mau: 43000, sessions: 52000, avgSessionDuration: 14.1 },
        { date: "Thu", dau: 15800, wau: 31500, mau: 43500, sessions: 58000, avgSessionDuration: 15.3 },
        { date: "Fri", dau: 18200, wau: 33000, mau: 44000, sessions: 65000, avgSessionDuration: 16.8 },
        { date: "Sat", dau: 22000, wau: 35000, mau: 44500, sessions: 78000, avgSessionDuration: 18.5 },
        { date: "Sun", dau: 19500, wau: 34000, mau: 45000, sessions: 70000, avgSessionDuration: 17.2 }
      ])
      // Generate heatmap data for features
      const features = ['Booking', 'Payments', 'Analytics', 'Staff Management', 'Marketing']
      const heatmapData: FeatureUsage[] = []
      features.forEach(feature => {
        for (let hour = 0; hour < 24; hour++) {
          const usage = Math.random() * 1000
          heatmapData.push({
            feature,
            hour,
            usage,
            intensity: usage > 750 ? 'peak' : usage > 500 ? 'high' : usage > 250 ? 'medium' : 'low'
          })
        }
      })
      setFeatureHeatmap(heatmapData)
      setPeakUsage([
        { day: "Monday", hour: "10:00 AM", users: 8500, load: 65 },
        { day: "Tuesday", hour: "2:00 PM", users: 9200, load: 72 },
        { day: "Wednesday", hour: "11:00 AM", users: 9800, load: 78 },
        { day: "Thursday", hour: "3:00 PM", users: 10500, load: 82 },
        { day: "Friday", hour: "4:00 PM", users: 12000, load: 90 },
        { day: "Saturday", hour: "11:00 AM", users: 15000, load: 95 },
        { day: "Sunday", hour: "1:00 PM", users: 13500, load: 88 }
      ])
      setApiPatterns([
        { endpoint: "/api/bookings", calls: 145000, avgResponseTime: 120, errorRate: 0.2, trend: 'up' },
        { endpoint: "/api/auth", calls: 98000, avgResponseTime: 85, errorRate: 0.1, trend: 'stable' },
        { endpoint: "/api/payments", calls: 67000, avgResponseTime: 250, errorRate: 0.5, trend: 'up' },
        { endpoint: "/api/analytics", calls: 45000, avgResponseTime: 180, errorRate: 0.3, trend: 'down' },
        { endpoint: "/api/notifications", calls: 89000, avgResponseTime: 95, errorRate: 0.2, trend: 'up' },
        { endpoint: "/api/staff", calls: 34000, avgResponseTime: 110, errorRate: 0.1, trend: 'stable' }
      ])
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }
  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'peak': return '#ff0000'
      case 'high': return '#ff8800'
      case 'medium': return '#ffdd00'
      case 'low': return '#88ff00'
      default: return '#f0f0f0'
    }
  }
  if (loading) {
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
          <h1 className="text-3xl font-bold">Usage Trends</h1>
          <p className="text-muted-foreground">System usage analytics and patterns</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {/* Active Users Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageMetrics[usageMetrics.length - 1]?.dau.toLocaleString()}
            </div>
            <Progress value={75} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">75% of target</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Active Users</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageMetrics[usageMetrics.length - 1]?.wau.toLocaleString()}
            </div>
            <Progress value={82} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">82% of target</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageMetrics[usageMetrics.length - 1]?.mau.toLocaleString()}
            </div>
            <Progress value={90} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">90% of target</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="heatmap">Feature Heatmap</TabsTrigger>
          <TabsTrigger value="peak">Peak Usage</TabsTrigger>
          <TabsTrigger value="api">API Patterns</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Users Trend</CardTitle>
              <CardDescription>Daily, weekly, and monthly active users</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={usageMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="dau" stroke="#8884d8" name="Daily Active" strokeWidth={2} />
                  <Line type="monotone" dataKey="wau" stroke="#82ca9d" name="Weekly Active" strokeWidth={2} />
                  <Line type="monotone" dataKey="mau" stroke="#ffc658" name="Monthly Active" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Session Metrics</CardTitle>
              <CardDescription>Total sessions and average duration</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={usageMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="sessions" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} name="Sessions" />
                  <Line yAxisId="right" type="monotone" dataKey="avgSessionDuration" stroke="#ff7300" name="Avg Duration (min)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Heatmap</CardTitle>
              <CardDescription>Usage intensity by feature and hour of day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Booking', 'Payments', 'Analytics', 'Staff Management', 'Marketing'].map(feature => (
                  <div key={feature} className="flex items-center gap-2">
                    <div className="w-32 text-sm font-medium">{feature}</div>
                    <div className="flex gap-1 flex-1">
                      {Array.from({ length: 24 }, (_, hour) => {
                        const data = featureHeatmap.find(d => d.feature === feature && d.hour === hour)
                        return (
                          <div
                            key={hour}
                            className="flex-1 h-8 rounded"
                            style={{ backgroundColor: getIntensityColor(data?.intensity || 'low') }}
                            title={`${hour}:00 - ${data?.usage.toFixed(0)} users`}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getIntensityColor('low') }} />
                    <span className="text-xs">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getIntensityColor('medium') }} />
                    <span className="text-xs">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getIntensityColor('high') }} />
                    <span className="text-xs">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: getIntensityColor('peak') }} />
                    <span className="text-xs">Peak</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="peak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Peak Usage Times</CardTitle>
              <CardDescription>Highest system load by day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={peakUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="users" fill="#8884d8" name="Peak Users" />
                  <Line yAxisId="right" type="monotone" dataKey="load" stroke="#ff7300" name="System Load %" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 space-y-3">
                {peakUsage.map((peak) => (
                  <div key={peak.day} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{peak.day}</p>
                      <p className="text-sm text-muted-foreground">Peak at {peak.hour}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{peak.users.toLocaleString()} users</p>
                        <Progress value={peak.load} className="w-24 h-2" />
                      </div>
                      <Badge variant={peak.load > 85 ? 'destructive' : peak.load > 70 ? 'secondary' : 'default'}>
                        {peak.load}% Load
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Call Patterns</CardTitle>
              <CardDescription>Endpoint usage and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiPatterns.map((api) => (
                  <div key={api.endpoint} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-mono text-sm font-medium">{api.endpoint}</p>
                        <p className="text-sm text-muted-foreground">
                          {api.calls.toLocaleString()} calls
                        </p>
                      </div>
                      <Badge variant={api.trend === 'up' ? 'default' : api.trend === 'down' ? 'secondary' : 'outline'}>
                        {api.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : null}
                        {api.trend}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Response Time</p>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm font-medium">{api.avgResponseTime}ms</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Error Rate</p>
                        <div className="flex items-center gap-2">
                          <Zap className="h-3 w-3" />
                          <span className="text-sm font-medium">{api.errorRate}%</span>
                        </div>
                      </div>
                    </div>
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