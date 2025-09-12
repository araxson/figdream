'use client';

import { useState, useEffect } from 'react';
import { Activity, Zap, AlertTriangle, TrendingUp, Clock, Server, Database, Shield, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay, endOfDay, subDays, subHours } from 'date-fns';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ApiUsage {
  id: string;
  salon_id?: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time: number; // in milliseconds
  request_size: number; // in bytes
  response_size: number; // in bytes
  user_id?: string;
  api_key_id?: string;
  ip_address: string;
  user_agent?: string;
  error_message?: string;
  created_at: string;
}

interface ApiEndpoint {
  path: string;
  method: string;
  calls: number;
  avg_response_time: number;
  error_rate: number;
  p95_response_time: number;
  p99_response_time: number;
}

interface RateLimitStatus {
  endpoint: string;
  limit: number;
  used: number;
  remaining: number;
  reset_at: string;
}

const ENDPOINTS_CONFIG = [
  { path: '/api/appointments', name: 'Appointments', category: 'core' },
  { path: '/api/customers', name: 'Customers', category: 'core' },
  { path: '/api/services', name: 'Services', category: 'core' },
  { path: '/api/staff', name: 'Staff', category: 'core' },
  { path: '/api/auth', name: 'Authentication', category: 'auth' },
  { path: '/api/billing', name: 'Billing', category: 'billing' },
  { path: '/api/analytics', name: 'Analytics', category: 'analytics' },
  { path: '/api/notifications', name: 'Notifications', category: 'communication' },
  { path: '/api/booking', name: 'Booking', category: 'public' },
  { path: '/api/reviews', name: 'Reviews', category: 'public' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ApiUsageDashboard() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [usage, setUsage] = useState<ApiUsage[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');
  const [viewMode, setViewMode] = useState<'overview' | 'endpoints' | 'errors' | 'performance'>('overview');
  const [rateLimits, setRateLimits] = useState<RateLimitStatus[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    avgResponseTime: 0,
    errorRate: 0,
    totalBandwidth: 0,
    uniqueUsers: 0,
    peakHour: '',
    successRate: 0,
    totalErrors: 0
  });
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [endpointDistribution, setEndpointDistribution] = useState<any[]>([]);
  const [errorTrends, setErrorTrends] = useState<any[]>([]);

  const supabase = createClient();

  useEffect(() => {
    if (salonId || isAdmin) {
      fetchUsage();
      fetchEndpoints();
      fetchRateLimits();
      fetchStats();
      fetchChartData();
      
      // Set up real-time monitoring
      const interval = setInterval(() => {
        fetchUsage();
        fetchStats();
      }, 30000); // Update every 30 seconds

      return () => clearInterval(interval);
    }
  }, [salonId, timeRange]);

  const getTimeFilter = () => {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return subHours(now, 1);
      case '24h':
        return subDays(now, 1);
      case '7d':
        return subDays(now, 7);
      case '30d':
        return subDays(now, 30);
      default:
        return subDays(now, 1);
    }
  };

  const fetchUsage = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('api_usage')
        .select('*')
        .gte('created_at', getTimeFilter().toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (!isAdmin && salonId) {
        query = query.eq('salon_id', salonId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsage(data || []);
    } catch (error) {
      console.error('Error fetching API usage:', error);
      toast.error('Failed to load API usage data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEndpoints = async () => {
    try {
      const { data } = await supabase
        .from('api_usage')
        .select('endpoint, method, status_code, response_time')
        .gte('created_at', getTimeFilter().toISOString());

      if (data) {
        // Group by endpoint and calculate metrics
        const grouped = data.reduce((acc, item) => {
          const key = `${item.method} ${item.endpoint}`;
          if (!acc[key]) {
            acc[key] = {
              path: item.endpoint,
              method: item.method,
              calls: 0,
              response_times: [],
              errors: 0
            };
          }
          acc[key].calls++;
          acc[key].response_times.push(item.response_time);
          if (item.status_code >= 400) acc[key].errors++;
          return acc;
        }, {} as any);

        // Calculate metrics
        const endpointStats = Object.values(grouped).map((ep: any) => {
          const sorted = ep.response_times.sort((a: number, b: number) => a - b);
          return {
            path: ep.path,
            method: ep.method,
            calls: ep.calls,
            avg_response_time: ep.response_times.reduce((a: number, b: number) => a + b, 0) / ep.response_times.length,
            error_rate: (ep.errors / ep.calls) * 100,
            p95_response_time: sorted[Math.floor(sorted.length * 0.95)] || 0,
            p99_response_time: sorted[Math.floor(sorted.length * 0.99)] || 0
          };
        });

        setEndpoints(endpointStats.sort((a, b) => b.calls - a.calls));
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  };

  const fetchRateLimits = async () => {
    try {
      // Simulate rate limit data (would come from actual API)
      const limits = ENDPOINTS_CONFIG.map(endpoint => ({
        endpoint: endpoint.path,
        limit: 1000,
        used: Math.floor(Math.random() * 800),
        remaining: 0,
        reset_at: new Date(Date.now() + 3600000).toISOString()
      }));
      
      limits.forEach(limit => {
        limit.remaining = limit.limit - limit.used;
      });
      
      setRateLimits(limits);
    } catch (error) {
      console.error('Error fetching rate limits:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = usage;
      
      if (data.length > 0) {
        const totalCalls = data.length;
        const avgResponseTime = data.reduce((sum, u) => sum + u.response_time, 0) / totalCalls;
        const errors = data.filter(u => u.status_code >= 400).length;
        const errorRate = (errors / totalCalls) * 100;
        const totalBandwidth = data.reduce((sum, u) => sum + u.request_size + u.response_size, 0);
        const uniqueUsers = new Set(data.map(u => u.user_id).filter(Boolean)).size;
        const successRate = ((totalCalls - errors) / totalCalls) * 100;
        
        // Find peak hour
        const hourCounts = data.reduce((acc, u) => {
          const hour = new Date(u.created_at).getHours();
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        const peakHour = Object.entries(hourCounts)
          .sort(([, a], [, b]) => b - a)[0]?.[0] || '0';
        
        setStats({
          totalCalls,
          avgResponseTime: Math.round(avgResponseTime),
          errorRate,
          totalBandwidth,
          uniqueUsers,
          peakHour: `${peakHour}:00`,
          successRate,
          totalErrors: errors
        });
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const data = usage;
      
      // Hourly data for line chart
      const hourly = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date();
        hour.setHours(hour.getHours() - (23 - i));
        const hourData = data.filter(u => {
          const uHour = new Date(u.created_at).getHours();
          return uHour === hour.getHours();
        });
        
        return {
          time: format(hour, 'ha'),
          calls: hourData.length,
          avgTime: hourData.length > 0
            ? Math.round(hourData.reduce((sum, u) => sum + u.response_time, 0) / hourData.length)
            : 0,
          errors: hourData.filter(u => u.status_code >= 400).length
        };
      });
      setHourlyData(hourly);
      
      // Endpoint distribution for pie chart
      const distribution = endpoints.slice(0, 5).map(ep => ({
        name: ep.path.split('/').pop() || ep.path,
        value: ep.calls,
        percentage: (ep.calls / data.length) * 100
      }));
      setEndpointDistribution(distribution);
      
      // Error trends
      const errors = data.filter(u => u.status_code >= 400);
      const errorsByCode = errors.reduce((acc, e) => {
        const code = e.status_code.toString();
        acc[code] = (acc[code] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const errorData = Object.entries(errorsByCode).map(([code, count]) => ({
        code,
        count,
        percentage: (count / errors.length) * 100
      }));
      setErrorTrends(errorData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: number) => {
    if (status < 300) return <Badge variant="default">Success</Badge>;
    if (status < 400) return <Badge variant="secondary">Redirect</Badge>;
    if (status < 500) return <Badge variant="outline">Client Error</Badge>;
    return <Badge variant="destructive">Server Error</Badge>;
  };

  const getPerformanceColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="p-6">
          <Skeleton className="h-[400px] w-full" />
        </Card>
      </div>
    );
  }

  if (!currentSalon && !isAdmin) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No salon found
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total API Calls</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange} period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(stats.avgResponseTime)}`}>
              {stats.avgResponseTime}ms
            </div>
            <p className="text-xs text-muted-foreground">
              Across all endpoints
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalErrors} errors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth Used</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(stats.totalBandwidth)}</div>
            <p className="text-xs text-muted-foreground">
              Request + Response
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Usage Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Traffic Chart */}
          <Card>
            <CardHeader>
              <CardTitle>API Traffic</CardTitle>
              <CardDescription>Calls and response times over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="calls"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="API Calls"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#82ca9d"
                    name="Avg Response (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Endpoint Distribution */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
                <CardDescription>Most frequently called endpoints</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={endpointDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.percentage.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {endpointDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
                <CardDescription>Current usage against limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {rateLimits.slice(0, 4).map((limit) => {
                  const usage = (limit.used / limit.limit) * 100;
                  return (
                    <div key={limit.endpoint} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{limit.endpoint.split('/').pop()}</span>
                        <span>{limit.used}/{limit.limit}</span>
                      </div>
                      <Progress value={usage} className={usage > 80 ? 'bg-red-100' : ''} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoint Performance</CardTitle>
              <CardDescription>Detailed metrics for each API endpoint</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Calls</TableHead>
                    <TableHead>Avg Response</TableHead>
                    <TableHead>P95</TableHead>
                    <TableHead>P99</TableHead>
                    <TableHead>Error Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoints.map((endpoint) => (
                    <TableRow key={`${endpoint.method}-${endpoint.path}`}>
                      <TableCell className="font-mono text-sm">{endpoint.path}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{endpoint.method}</Badge>
                      </TableCell>
                      <TableCell>{endpoint.calls.toLocaleString()}</TableCell>
                      <TableCell className={getPerformanceColor(endpoint.avg_response_time)}>
                        {Math.round(endpoint.avg_response_time)}ms
                      </TableCell>
                      <TableCell className={getPerformanceColor(endpoint.p95_response_time)}>
                        {Math.round(endpoint.p95_response_time)}ms
                      </TableCell>
                      <TableCell className={getPerformanceColor(endpoint.p99_response_time)}>
                        {Math.round(endpoint.p99_response_time)}ms
                      </TableCell>
                      <TableCell>
                        <span className={endpoint.error_rate > 5 ? 'text-red-600' : ''}>
                          {endpoint.error_rate.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>Recent errors and failure patterns</CardDescription>
            </CardHeader>
            <CardContent>
              {errorTrends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
                  <p>No errors in the selected time range</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={errorTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="code" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Error Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usage
                        .filter(u => u.status_code >= 400)
                        .slice(0, 10)
                        .map((error) => (
                          <TableRow key={error.id}>
                            <TableCell className="text-sm">
                              {format(new Date(error.created_at), 'HH:mm:ss')}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {error.endpoint}
                            </TableCell>
                            <TableCell>{getStatusBadge(error.status_code)}</TableCell>
                            <TableCell className="text-sm text-destructive">
                              {error.error_message || 'No message'}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Response times and throughput analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Peak Hour</p>
                  <p className="text-2xl font-bold">{stats.peakHour}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{stats.uniqueUsers}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Requests/Hour</p>
                  <p className="text-2xl font-bold">
                    {Math.round(stats.totalCalls / (parseInt(timeRange) || 24))}
                  </p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="avgTime"
                    stroke="#8884d8"
                    name="Avg Response Time (ms)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="#ef4444"
                    name="Errors"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {/* Alerts */}
          {stats.errorRate > 5 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                High error rate detected ({stats.errorRate.toFixed(1)}%). Consider investigating recent deployments or infrastructure issues.
              </AlertDescription>
            </Alert>
          )}
          
          {stats.avgResponseTime > 1000 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Average response time is above 1 second. Consider optimizing slow endpoints or scaling infrastructure.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}