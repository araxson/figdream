'use client';

import { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Database, Server, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SystemMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  appointmentsToday: number;
  database: {
    size: string;
    connections: number;
    maxConnections: number;
  };
  alerts: {
    total: number;
    critical: number;
    warning: number;
  };
}

export function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMetrics();
    
    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/admin/system-health?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to load system health metrics');
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (!metrics) return 'unknown';
    
    if (metrics.errorRate > 5 || metrics.uptime < 95) return 'critical';
    if (metrics.errorRate > 2 || metrics.uptime < 98) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return <div>Loading system health...</div>;
  }

  const healthStatus = getHealthStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor platform performance and health metrics</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall System Status</CardTitle>
            <div className="flex items-center gap-2">
              {getStatusIcon(healthStatus)}
              <span className={`font-semibold ${getStatusColor(healthStatus)}`}>
                {healthStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Uptime</span>
                <span className="text-sm">{metrics?.uptime || 0}%</span>
              </div>
              <Progress value={metrics?.uptime || 0} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Response Time</span>
                <span className="text-sm">{metrics?.responseTime || 0}ms</span>
              </div>
              <Progress 
                value={Math.min(100, (metrics?.responseTime || 0) / 10)} 
                className="h-2" 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm">{metrics?.errorRate || 0}%</span>
              </div>
              <Progress 
                value={metrics?.errorRate || 0} 
                className="h-2" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">In selected time range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.appointmentsToday || 0}</div>
            <p className="text-xs text-muted-foreground">Created today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.database?.connections || 0}/{metrics?.database?.maxConnections || 100}
            </div>
            <p className="text-xs text-muted-foreground">Active / Max</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.alerts?.total || 0}</div>
            <div className="flex gap-2 mt-1">
              {metrics?.alerts?.critical > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {metrics.alerts.critical} Critical
                </Badge>
              )}
              {metrics?.alerts?.warning > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {metrics.alerts.warning} Warning
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
          <CardDescription>Deep dive into system performance</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>
            <TabsContent value="performance" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">API Response Time</p>
                      <p className="text-sm text-muted-foreground">Average response time for API calls</p>
                    </div>
                  </div>
                  <Badge variant="outline">{metrics?.responseTime || 0}ms</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Server Uptime</p>
                      <p className="text-sm text-muted-foreground">Platform availability percentage</p>
                    </div>
                  </div>
                  <Badge variant="outline">{metrics?.uptime || 0}%</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Error Rate</p>
                      <p className="text-sm text-muted-foreground">Percentage of failed requests</p>
                    </div>
                  </div>
                  <Badge variant={metrics?.errorRate > 2 ? "destructive" : "outline"}>
                    {metrics?.errorRate || 0}%
                  </Badge>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="database" className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Database Size</p>
                    <p className="text-sm text-muted-foreground">Total storage used</p>
                  </div>
                  <Badge variant="outline">{metrics?.database?.size || 'N/A'}</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Connection Pool</p>
                    <p className="text-sm text-muted-foreground">Active database connections</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(metrics?.database?.connections || 0) / (metrics?.database?.maxConnections || 100) * 100} 
                      className="w-32 h-2" 
                    />
                    <span className="text-sm">
                      {metrics?.database?.connections || 0}/{metrics?.database?.maxConnections || 100}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="alerts" className="space-y-4">
              {metrics?.alerts?.total === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active alerts
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Critical Alerts</span>
                    <Badge variant="destructive">{metrics?.alerts?.critical || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Warning Alerts</span>
                    <Badge variant="secondary">{metrics?.alerts?.warning || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span className="font-medium">Total Alerts</span>
                    <Badge variant="outline">{metrics?.alerts?.total || 0}</Badge>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}