'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Activity, AlertTriangle, CheckCircle, Database, Server, Shield } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  database: {
    status: 'online' | 'offline' | 'degraded'
    connections: number
    maxConnections: number
    responseTime: number
  }
  security: {
    failedLoginAttempts: number
    suspiciousActivities: number
    lastSecurityScan: string
  }
  performance: {
    avgResponseTime: number
    errorRate: number
    uptime: number
  }
  alerts: Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    timestamp: string
  }>
}

export function SystemHealthMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

   
  const fetchSystemHealth = useCallback(async () => {
    try {
      // Fetch system health metrics
      const { data: metricsArray } = await supabase
        .from('system_health_metrics')
        .select('*')
        .order('collected_at', { ascending: false })
        .limit(10)
      
      // Parse metrics from the array
      const metrics = metricsArray?.reduce((acc, metric) => {
        if (metric.metric_name && metric.metric_value !== null) {
          acc[metric.metric_name] = metric.metric_value
        }
        return acc
      }, {} as Record<string, number>) || {}

      // Fetch recent alerts
      const { data: alerts } = await supabase
        .from('alert_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch error logs count
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { data: errors } = await supabase
        .from('error_logs')
        .select('id')
        .gte('created_at', oneHourAgo)

      // Fetch failed login attempts
      const { data: failedLogins } = await supabase
        .from('audit_logs')
        .select('id')
        .eq('action', 'login_failed')
        .gte('created_at', oneHourAgo)

      const errorRate = errors?.length || 0
      const systemStatus = errorRate > 10 ? 'critical' : errorRate > 5 ? 'warning' : 'healthy'

      setHealth({
        status: systemStatus,
        database: {
          status: 'online',
          connections: Math.round(metrics['active_connections'] || 0),
          maxConnections: Math.round(metrics['max_connections'] || 100),
          responseTime: Math.round(metrics['avg_query_time'] || 0)
        },
        security: {
          failedLoginAttempts: failedLogins?.length || 0,
          suspiciousActivities: 0,
          lastSecurityScan: new Date().toISOString()
        },
        performance: {
          avgResponseTime: Math.round(metrics['avg_response_time'] || 0),
          errorRate: errorRate,
          uptime: metrics['uptime_percentage'] || 99.9
        },
        alerts: alerts?.map(alert => ({
          id: alert.id,
          type: alert.severity === 'critical' ? 'error' : alert.severity === 'warning' ? 'warning' : 'info',
          message: alert.message || '',
          timestamp: alert.triggered_at || new Date().toISOString()
        })) || []
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching system health:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [fetchSystemHealth])

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Real-time system monitoring</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(health?.status || 'healthy')}
              <Badge variant={
                health?.status === 'healthy' ? 'default' : 
                health?.status === 'warning' ? 'secondary' : 
                'destructive'
              }>
                {health?.status?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Database Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {health?.database.status}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Connections</span>
                <span>{health?.database.connections}/{health?.database.maxConnections}</span>
              </div>
              <Progress 
                value={(health?.database.connections || 0) / (health?.database.maxConnections || 1) * 100} 
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Response time: {health?.database.responseTime}ms
            </p>
          </div>

          {/* Security Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Security</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {health?.security.failedLoginAttempts} failed logins
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Last scan: {new Date(health?.security.lastSecurityScan || '').toLocaleTimeString()}
            </p>
          </div>

          {/* Performance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Performance</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {health?.performance.uptime}% uptime
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Avg Response</span>
                <p className="font-medium">{health?.performance.avgResponseTime}ms</p>
              </div>
              <div>
                <span className="text-muted-foreground">Error Rate</span>
                <p className="font-medium">{health?.performance.errorRate} errors/hr</p>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          {health?.alerts && health.alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Recent Alerts</h4>
              <div className="space-y-2">
                {health.alerts.map(alert => (
                  <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                    <AlertDescription className="text-xs">
                      {alert.message}
                      <span className="text-muted-foreground ml-2">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}