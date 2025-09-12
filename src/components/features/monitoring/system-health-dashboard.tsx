'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createBrowserClient } from '@supabase/ssr';
import { useSalon } from '@/lib/contexts/salon-context';
import { Database } from '@/types/database.types';
import { toast } from 'sonner';
import { 
  Activity,
  AlertTriangle,
  CheckCircle,
  Server,
  Database as DatabaseIcon,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Globe,
  Shield,
  Zap,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Settings,
  BarChart3,
  Gauge,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  Thermometer,
  Users,
  FileText,
  Cloud
} from 'lucide-react';
import { format, parseISO, subHours, subDays } from 'date-fns';
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
  RadialBarChart,
  RadialBar,
  PolarAngleAxis
} from 'recharts';

interface SystemMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency: number;
  database_connections: number;
  cache_hit_rate: number;
  api_response_time: number;
  error_rate: number;
  uptime_percentage: number;
  active_users: number;
  request_rate: number;
  queue_size: number;
}

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
  last_check: string;
  response_time: number;
  error_count: number;
}

interface HealthCheck {
  id: string;
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  last_check: string;
  next_check: string;
  check_duration: number;
  metadata?: any;
}

export function SystemHealthDashboard() {
  const { currentSalon } = useSalon();
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu_usage: 0,
    memory_usage: 0,
    disk_usage: 0,
    network_latency: 0,
    database_connections: 0,
    cache_hit_rate: 0,
    api_response_time: 0,
    error_rate: 0,
    uptime_percentage: 0,
    active_users: 0,
    request_rate: 0,
    queue_size: 0
  });
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000);
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchSystemData();
    const interval = autoRefresh ? setInterval(fetchSystemData, refreshInterval) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval]);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      // Simulate fetching system metrics
      const newMetrics: SystemMetrics = {
        cpu_usage: Math.random() * 100,
        memory_usage: Math.random() * 100,
        disk_usage: 45 + Math.random() * 30,
        network_latency: Math.random() * 100,
        database_connections: Math.floor(Math.random() * 50) + 10,
        cache_hit_rate: 85 + Math.random() * 10,
        api_response_time: Math.random() * 500,
        error_rate: Math.random() * 5,
        uptime_percentage: 99.5 + Math.random() * 0.4,
        active_users: Math.floor(Math.random() * 200) + 50,
        request_rate: Math.floor(Math.random() * 1000) + 200,
        queue_size: Math.floor(Math.random() * 20)
      };
      setMetrics(newMetrics);

      // Simulate service status
      const serviceList: ServiceStatus[] = [
        {
          name: 'API Server',
          status: Math.random() > 0.1 ? 'operational' : 'degraded',
          uptime: 99.9,
          last_check: new Date().toISOString(),
          response_time: Math.random() * 100,
          error_count: Math.floor(Math.random() * 5)
        },
        {
          name: 'Database',
          status: Math.random() > 0.05 ? 'operational' : 'degraded',
          uptime: 99.95,
          last_check: new Date().toISOString(),
          response_time: Math.random() * 50,
          error_count: Math.floor(Math.random() * 3)
        },
        {
          name: 'Cache Server',
          status: 'operational',
          uptime: 99.99,
          last_check: new Date().toISOString(),
          response_time: Math.random() * 10,
          error_count: 0
        },
        {
          name: 'Queue Service',
          status: Math.random() > 0.2 ? 'operational' : 'degraded',
          uptime: 99.8,
          last_check: new Date().toISOString(),
          response_time: Math.random() * 30,
          error_count: Math.floor(Math.random() * 2)
        },
        {
          name: 'Storage',
          status: 'operational',
          uptime: 100,
          last_check: new Date().toISOString(),
          response_time: Math.random() * 20,
          error_count: 0
        },
        {
          name: 'Email Service',
          status: Math.random() > 0.15 ? 'operational' : 'degraded',
          uptime: 99.7,
          last_check: new Date().toISOString(),
          response_time: Math.random() * 200,
          error_count: Math.floor(Math.random() * 4)
        }
      ];
      setServices(serviceList);

      // Simulate health checks
      const checks: HealthCheck[] = serviceList.map((service, index) => ({
        id: `check-${index}`,
        service: service.name,
        status: service.status === 'operational' ? 'healthy' : 
                service.status === 'degraded' ? 'degraded' : 'unhealthy',
        message: service.status === 'operational' 
          ? 'Service is running normally'
          : service.status === 'degraded'
          ? 'Service is experiencing some issues'
          : 'Service is down',
        last_check: service.last_check,
        next_check: new Date(Date.now() + refreshInterval).toISOString(),
        check_duration: Math.random() * 100,
        metadata: {
          response_time: service.response_time,
          error_count: service.error_count
        }
      }));
      setHealthChecks(checks);

      // Generate metrics history
      const history = Array.from({ length: 24 }, (_, i) => ({
        time: format(subHours(new Date(), 23 - i), 'HH:00'),
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        requests: Math.floor(Math.random() * 1000),
        errors: Math.floor(Math.random() * 50)
      }));
      setMetricsHistory(history);

    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error('Failed to fetch system health data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
      case 'unhealthy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
      case 'healthy':
        return <Badge variant="success">Operational</Badge>;
      case 'degraded':
        return <Badge variant="warning">Degraded</Badge>;
      case 'down':
      case 'unhealthy':
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getMetricStatus = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'critical';
    if (value >= thresholds.warning) return 'warning';
    return 'normal';
  };

  const getMetricColor = (status: string) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const overallHealth = services.every(s => s.status === 'operational') 
    ? 'healthy' 
    : services.some(s => s.status === 'down') 
    ? 'critical' 
    : 'degraded';

  const cpuData = [{
    name: 'CPU',
    value: metrics.cpu_usage,
    fill: getMetricColor(getMetricStatus(metrics.cpu_usage, { warning: 70, critical: 90 }))
  }];

  const memoryData = [{
    name: 'Memory',
    value: metrics.memory_usage,
    fill: getMetricColor(getMetricStatus(metrics.memory_usage, { warning: 80, critical: 95 }))
  }];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground mt-1">
            Real-time system monitoring and health status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Auto-refresh</span>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              {autoRefresh ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  On
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Off
                </>
              )}
            </Button>
          </div>
          <Button variant="outline" onClick={fetchSystemData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${
        overallHealth === 'healthy' ? 'border-green-500' :
        overallHealth === 'degraded' ? 'border-yellow-500' :
        'border-red-500'
      }`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {overallHealth === 'healthy' ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : overallHealth === 'degraded' ? (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  {overallHealth === 'healthy' 
                    ? 'All systems operational'
                    : overallHealth === 'degraded'
                    ? 'Some services are degraded'
                    : 'Critical issues detected'}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{metrics.uptime_percentage.toFixed(2)}%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu_usage.toFixed(1)}%</div>
            <Progress 
              value={metrics.cpu_usage} 
              className="mt-2"
              indicatorClassName={
                metrics.cpu_usage > 90 ? 'bg-red-500' :
                metrics.cpu_usage > 70 ? 'bg-yellow-500' :
                'bg-green-500'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MemoryStick className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.memory_usage.toFixed(1)}%</div>
            <Progress 
              value={metrics.memory_usage} 
              className="mt-2"
              indicatorClassName={
                metrics.memory_usage > 95 ? 'bg-red-500' :
                metrics.memory_usage > 80 ? 'bg-yellow-500' :
                'bg-green-500'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.disk_usage.toFixed(1)}%</div>
            <Progress 
              value={metrics.disk_usage} 
              className="mt-2"
              indicatorClassName={
                metrics.disk_usage > 90 ? 'bg-red-500' :
                metrics.disk_usage > 75 ? 'bg-yellow-500' :
                'bg-green-500'
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_users}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently online</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Service Status Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Service Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${
                          service.status === 'operational' ? 'bg-green-500' :
                          service.status === 'degraded' ? 'bg-yellow-500' :
                          'bg-red-500'
                        } animate-pulse`} />
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {service.response_time.toFixed(0)}ms response time
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(service.status)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {service.uptime}% uptime
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Real-time Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Network className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Network Latency</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{metrics.network_latency.toFixed(1)}ms</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">DB Connections</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{metrics.database_connections}/100</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Cache Hit Rate</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{metrics.cache_hit_rate.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">API Response Time</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{metrics.api_response_time.toFixed(0)}ms</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Error Rate</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${
                        metrics.error_rate > 3 ? 'text-red-500' :
                        metrics.error_rate > 1 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>{metrics.error_rate.toFixed(2)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Request Rate</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">{metrics.request_rate} req/s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>System Metrics (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="cpu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="CPU %" />
                  <Area type="monotone" dataKey="memory" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Memory %" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Health Checks</CardTitle>
              <CardDescription>Detailed service monitoring and health status</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {healthChecks.map((check) => (
                    <Card key={check.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <div className="mt-1">
                            {check.status === 'healthy' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : check.status === 'degraded' ? (
                              <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{check.service}</h3>
                              <Badge variant={
                                check.status === 'healthy' ? 'success' :
                                check.status === 'degraded' ? 'warning' :
                                'destructive'
                              }>
                                {check.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {check.message}
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last: {format(parseISO(check.last_check), 'HH:mm:ss')}
                              </div>
                              <div className="flex items-center gap-1">
                                <RefreshCw className="h-3 w-3" />
                                Next: {format(parseISO(check.next_check), 'HH:mm:ss')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="h-3 w-3" />
                                Duration: {check.check_duration.toFixed(0)}ms
                              </div>
                              {check.metadata?.response_time && (
                                <div className="flex items-center gap-1">
                                  <Activity className="h-3 w-3" />
                                  Response: {check.metadata.response_time.toFixed(0)}ms
                                </div>
                              )}
                              {check.metadata?.error_count > 0 && (
                                <div className="flex items-center gap-1 text-red-500">
                                  <AlertTriangle className="h-3 w-3" />
                                  Errors: {check.metadata.error_count}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={cpuData}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold">
                      {metrics.cpu_usage.toFixed(0)}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={memoryData}>
                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                    <RadialBar dataKey="value" cornerRadius={10} fill="#82ca9d" />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold">
                      {metrics.memory_usage.toFixed(0)}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request & Error Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metricsHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="requests" stroke="#3b82f6" name="Requests" />
                  <Line yAxisId="right" type="monotone" dataKey="errors" stroke="#ef4444" name="Errors" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Database Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Query Time</span>
                      <span className="font-semibold">23ms avg</span>
                    </div>
                    <Progress value={23} max={100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Connection Pool</span>
                      <span className="font-semibold">{metrics.database_connections}/100</span>
                    </div>
                    <Progress value={metrics.database_connections} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Lock Wait Time</span>
                      <span className="font-semibold">5ms</span>
                    </div>
                    <Progress value={5} max={50} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Cache Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hit Rate</span>
                      <span className="font-semibold text-green-600">{metrics.cache_hit_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.cache_hit_rate} className="bg-green-100" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memory Used</span>
                      <span className="font-semibold">1.2GB / 4GB</span>
                    </div>
                    <Progress value={30} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Eviction Rate</span>
                      <span className="font-semibold">0.5%</span>
                    </div>
                    <Progress value={0.5} max={10} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">API Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg Response Time</span>
                      <span className="font-semibold">{metrics.api_response_time.toFixed(0)}ms</span>
                    </div>
                    <Progress value={metrics.api_response_time} max={1000} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Throughput</span>
                      <span className="font-semibold">{metrics.request_rate} req/s</span>
                    </div>
                    <Progress value={metrics.request_rate} max={2000} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Error Rate</span>
                      <span className={`font-semibold ${
                        metrics.error_rate > 3 ? 'text-red-600' :
                        metrics.error_rate > 1 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>{metrics.error_rate.toFixed(2)}%</span>
                    </div>
                    <Progress 
                      value={metrics.error_rate} 
                      max={10}
                      className={
                        metrics.error_rate > 3 ? 'bg-red-100' :
                        metrics.error_rate > 1 ? 'bg-yellow-100' :
                        'bg-green-100'
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>System resource usage and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Gauge className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{metrics.cpu_usage.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">CPU</p>
                </div>
                <div className="text-center">
                  <MemoryStick className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{metrics.memory_usage.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">Memory</p>
                </div>
                <div className="text-center">
                  <HardDrive className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{metrics.disk_usage.toFixed(0)}%</div>
                  <p className="text-xs text-muted-foreground">Disk</p>
                </div>
                <div className="text-center">
                  <Network className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-2xl font-bold">{metrics.network_latency.toFixed(0)}ms</div>
                  <p className="text-xs text-muted-foreground">Network</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}