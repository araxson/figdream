'use client'

/**
 * Performance Monitor Component
 * Real-time performance metrics visualization
 */

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Activity,
  Database,
  Zap,
  AlertTriangle,
  TrendingUp,
  Clock,
  Server,
  HardDrive,
  Gauge,
  Package
} from 'lucide-react'
import type {
  PerformanceReport,
  ServerActionMetrics,
  QueryPerformance,
  WebVitals
} from './types'

export function PerformanceMonitor() {
  const [report, setReport] = useState<PerformanceReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    loadPerformanceData()

    if (autoRefresh) {
      const interval = setInterval(loadPerformanceData, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  async function loadPerformanceData() {
    try {
      // For now, return mock data since there's no monitoring data yet
      // TODO: Replace with actual performance data Server Action when monitoring tables are ready
      const mockData: PerformanceReport = {
        serverActions: [],
        queries: [],
        webVitals: {
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0,
          ttfb: 0
        },
        timestamp: new Date().toISOString()
      }
      setReport(mockData)
    } catch (error) {
      console.error('Failed to load performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading performance metrics...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Data Available</AlertTitle>
        <AlertDescription>
          Performance monitoring data is not available at this time.
        </AlertDescription>
      </Alert>
    )
  }

  const serverActionChartData = report.serverActions
    .slice(-20)
    .map(action => ({
      name: action.actionName.split('.').pop(),
      time: action.executionTime,
      dbTime: action.dbQueryTime,
      cacheHit: action.cacheHitRate
    }))

  const queryChartData = report.queries
    .slice(-20)
    .map((query, index) => ({
      id: `Q${index + 1}`,
      time: query.executionTime,
      rows: query.rowsReturned,
      cached: query.cached ? 'Yes' : 'No'
    }))

  const cacheData = [
    { name: 'Hits', value: report.cache.hitRate, color: '#10b981' },
    { name: 'Misses', value: report.cache.missRate, color: '#ef4444' },
    { name: 'Evictions', value: report.cache.evictionRate, color: '#f59e0b' }
  ]

  const webVitalsData = [
    { metric: 'LCP', value: report.webVitals.lcp, target: 2500, unit: 'ms' },
    { metric: 'FID', value: report.webVitals.fid, target: 100, unit: 'ms' },
    { metric: 'CLS', value: report.webVitals.cls, target: 0.1, unit: '' },
    { metric: 'FCP', value: report.webVitals.fcp, target: 1800, unit: 'ms' },
    { metric: 'TTFB', value: report.webVitals.ttfb, target: 800, unit: 'ms' },
    { metric: 'INP', value: report.webVitals.inp, target: 200, unit: 'ms' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitor</h1>
          <p className="text-muted-foreground">Real-time performance metrics and optimization insights</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={autoRefresh ? 'default' : 'outline'}>
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Badge>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="text-sm underline"
          >
            Toggle
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                report.serverActions.reduce((sum, a) => sum + a.executionTime, 0) /
                report.serverActions.length
              )}ms
            </div>
            <p className="text-xs text-muted-foreground">Last 100 requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.cache.hitRate.toFixed(1)}%</div>
            <Progress value={report.cache.hitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {report.queries.filter(q => q.optimized).length}/{report.queries.length}
            </div>
            <p className="text-xs text-muted-foreground">Optimized queries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(report.cache.memoryUsed / 1024 / 1024).toFixed(1)}MB
            </div>
            <p className="text-xs text-muted-foreground">Cache memory</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="actions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="actions">Server Actions</TabsTrigger>
          <TabsTrigger value="queries">Database Queries</TabsTrigger>
          <TabsTrigger value="cache">Cache Performance</TabsTrigger>
          <TabsTrigger value="bundles">Bundle Analysis</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Server Action Performance</CardTitle>
              <CardDescription>Execution times and cache hit rates</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={serverActionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="time" fill="#3b82f6" name="Total Time (ms)" />
                  <Bar dataKey="dbTime" fill="#10b981" name="DB Time (ms)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Slow Actions Alert */}
          {report.serverActions.filter(a => a.executionTime > 1000).length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Slow Actions Detected</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1">
                  {report.serverActions
                    .filter(a => a.executionTime > 1000)
                    .slice(-5)
                    .map((action, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{action.actionName}</span>:{' '}
                        {action.executionTime}ms
                      </li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Query Execution Times</CardTitle>
              <CardDescription>Database query performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={queryChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="id" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="time" stroke="#3b82f6" name="Execution Time (ms)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Query Optimization Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle>Query Optimization Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.queries
                  .filter(q => q.suggestions && q.suggestions.length > 0)
                  .slice(-5)
                  .map((query, index) => (
                    <div key={index} className="border-l-2 border-orange-500 pl-4">
                      <p className="text-sm font-mono">{query.query}</p>
                      <ul className="mt-1 text-sm text-muted-foreground">
                        {query.suggestions?.map((suggestion, sIndex) => (
                          <li key={sIndex}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Performance</CardTitle>
              <CardDescription>Cache hit/miss distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={cacheData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cacheData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Total Keys</p>
                  <p className="text-2xl font-bold">{report.cache.totalKeys}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">TTL Range</p>
                  <p className="text-sm">
                    {report.cache.ttlStats.min}ms - {report.cache.ttlStats.max}ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bundle Sizes by Route</CardTitle>
              <CardDescription>JavaScript bundle analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report.bundles.map((bundle, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">{bundle.route}</p>
                      <p className="text-sm text-muted-foreground">
                        Load time: {bundle.loadTime}ms
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{(bundle.totalSize / 1024).toFixed(1)}KB</p>
                      <div className="flex gap-1">
                        <Badge variant="outline">JS: {(bundle.jsSize / 1024).toFixed(1)}KB</Badge>
                        <Badge variant="outline">CSS: {(bundle.cssSize / 1024).toFixed(1)}KB</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>User experience metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webVitalsData.map(vital => {
                  const percentage = Math.min(100, (vital.value / vital.target) * 100)
                  const isGood = vital.value <= vital.target

                  return (
                    <div key={vital.metric} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{vital.metric}</span>
                        <span className="text-sm">
                          {vital.value}{vital.unit} / {vital.target}{vital.unit}
                        </span>
                      </div>
                      <Progress
                        value={percentage}
                        className={isGood ? '' : 'bg-red-100'}
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>Actionable insights to improve performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <Alert key={index}>
                    <TrendingUp className="h-4 w-4" />
                    <AlertDescription>{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}