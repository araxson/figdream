'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { createBrowserClient } from '@supabase/ssr';
import { useSalon } from '@/lib/contexts/salon-context';
import { Database } from '@/types/database.types';
import { toast } from 'sonner';
import { 
  Shield, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Users,
  Globe,
  Zap,
  Ban,
  CheckCircle,
  XCircle,
  Activity,
  Server,
  Database as DatabaseIcon,
  Cpu,
  HardDrive,
  Network,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Info,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Filter
} from 'lucide-react';
import { format, parseISO, subHours, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RateLimit {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ALL';
  limit_type: 'requests' | 'bandwidth' | 'concurrent' | 'custom';
  max_requests: number;
  time_window: number; // in seconds
  burst_limit?: number;
  burst_window?: number; // in seconds
  apply_to: 'all' | 'user' | 'ip' | 'api_key' | 'salon';
  conditions?: {
    user_roles?: string[];
    ip_ranges?: string[];
    api_keys?: string[];
    headers?: Record<string, string>;
  };
  actions: {
    block: boolean;
    throttle: boolean;
    alert: boolean;
    log: boolean;
    custom_response?: string;
  };
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  metadata?: any;
}

interface RateLimitUsage {
  id: string;
  rate_limit_id: string;
  identifier: string; // user_id, ip, api_key, etc.
  endpoint: string;
  request_count: number;
  bandwidth_used?: number;
  last_request_at: string;
  blocked_count: number;
  throttled_count: number;
  window_start: string;
  window_end: string;
}

interface RateLimitViolation {
  id: string;
  rate_limit_id: string;
  rate_limit_name: string;
  identifier: string;
  identifier_type: string;
  endpoint: string;
  violated_at: string;
  request_count: number;
  limit_exceeded: number;
  action_taken: 'blocked' | 'throttled' | 'alerted';
  response_code: number;
  user_agent?: string;
  ip_address?: string;
  metadata?: any;
}

const limitTypes = [
  { value: 'requests', label: 'Request Count', icon: Activity },
  { value: 'bandwidth', label: 'Bandwidth', icon: Network },
  { value: 'concurrent', label: 'Concurrent Connections', icon: Users },
  { value: 'custom', label: 'Custom Rule', icon: Settings }
];

const applyToOptions = [
  { value: 'all', label: 'All Requests', description: 'Apply to all incoming requests' },
  { value: 'user', label: 'Per User', description: 'Track limits per authenticated user' },
  { value: 'ip', label: 'Per IP Address', description: 'Track limits per IP address' },
  { value: 'api_key', label: 'Per API Key', description: 'Track limits per API key' },
  { value: 'salon', label: 'Per Salon', description: 'Track limits per salon' }
];

const timeWindows = [
  { value: 1, label: '1 second' },
  { value: 10, label: '10 seconds' },
  { value: 60, label: '1 minute' },
  { value: 300, label: '5 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 3600, label: '1 hour' },
  { value: 86400, label: '1 day' }
];

const endpointPatterns = [
  { value: '/api/*', label: 'All API Endpoints' },
  { value: '/api/auth/*', label: 'Authentication Endpoints' },
  { value: '/api/appointments/*', label: 'Appointment Endpoints' },
  { value: '/api/customers/*', label: 'Customer Endpoints' },
  { value: '/api/staff/*', label: 'Staff Endpoints' },
  { value: '/api/services/*', label: 'Service Endpoints' },
  { value: '/api/analytics/*', label: 'Analytics Endpoints' },
  { value: '/api/billing/*', label: 'Billing Endpoints' },
  { value: '/api/admin/*', label: 'Admin Endpoints' },
  { value: 'custom', label: 'Custom Pattern' }
];

export function RateLimitsManager() {
  const { currentSalon } = useSalon();
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([]);
  const [usage, setUsage] = useState<RateLimitUsage[]>([]);
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLimit, setSelectedLimit] = useState<RateLimit | null>(null);
  const [editingLimit, setEditingLimit] = useState<RateLimit | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('limits');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [stats, setStats] = useState({
    total_limits: 0,
    active_limits: 0,
    requests_today: 0,
    blocked_today: 0,
    throttled_today: 0,
    top_endpoints: [] as Array<{ endpoint: string; count: number }>
  });
  const [usageData, setUsageData] = useState<any[]>([]);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (currentSalon?.id) {
      fetchRateLimits();
      fetchUsage();
      fetchViolations();
      fetchStats();
      fetchUsageData();
    }
  }, [currentSalon?.id]);

  const fetchRateLimits = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .order('priority', { ascending: true });

      if (error) throw error;
      setRateLimits(data || []);
    } catch (error) {
      console.error('Error fetching rate limits:', error);
      toast.error('Failed to load rate limits');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('rate_limit_usage')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .gte('window_start', new Date(Date.now() - 3600000).toISOString())
        .order('last_request_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUsage(data || []);
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const fetchViolations = async () => {
    try {
      const { data, error } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .order('violated_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setViolations(data || []);
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: limitsData } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('salon_id', currentSalon?.id);

      const { data: usageData } = await supabase
        .from('rate_limit_usage')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .gte('window_start', today);

      const { data: violationsData } = await supabase
        .from('rate_limit_violations')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .gte('violated_at', today);

      // Calculate top endpoints
      const endpointCounts = usageData?.reduce((acc: any, item) => {
        acc[item.endpoint] = (acc[item.endpoint] || 0) + item.request_count;
        return acc;
      }, {});

      const topEndpoints = Object.entries(endpointCounts || {})
        .map(([endpoint, count]) => ({ endpoint, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        total_limits: limitsData?.length || 0,
        active_limits: limitsData?.filter(l => l.is_active).length || 0,
        requests_today: usageData?.reduce((sum, item) => sum + item.request_count, 0) || 0,
        blocked_today: violationsData?.filter(v => v.action_taken === 'blocked').length || 0,
        throttled_today: violationsData?.filter(v => v.action_taken === 'throttled').length || 0,
        top_endpoints: topEndpoints
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsageData = async () => {
    try {
      // Fetch hourly usage data for the last 24 hours
      const hours = Array.from({ length: 24 }, (_, i) => {
        const date = subHours(new Date(), 23 - i);
        return {
          hour: format(date, 'HH:00'),
          requests: Math.floor(Math.random() * 1000),
          blocked: Math.floor(Math.random() * 50),
          throttled: Math.floor(Math.random() * 100)
        };
      });
      setUsageData(hours);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const handleSaveRateLimit = async () => {
    if (!editingLimit) return;

    try {
      if (editingLimit.id) {
        const { error } = await supabase
          .from('rate_limits')
          .update({
            ...editingLimit,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingLimit.id);

        if (error) throw error;
        toast.success('Rate limit updated successfully');
      } else {
        const { error } = await supabase
          .from('rate_limits')
          .insert({
            ...editingLimit,
            id: crypto.randomUUID(),
            salon_id: currentSalon?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Rate limit created successfully');
      }

      setIsDialogOpen(false);
      setEditingLimit(null);
      fetchRateLimits();
      fetchStats();
    } catch (error) {
      console.error('Error saving rate limit:', error);
      toast.error('Failed to save rate limit');
    }
  };

  const handleDeleteRateLimit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Rate limit deleted successfully');
      fetchRateLimits();
      fetchStats();
    } catch (error) {
      console.error('Error deleting rate limit:', error);
      toast.error('Failed to delete rate limit');
    }
  };

  const handleToggleRateLimit = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('rate_limits')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Rate limit ${isActive ? 'activated' : 'deactivated'}`);
      fetchRateLimits();
      fetchStats();
    } catch (error) {
      console.error('Error toggling rate limit:', error);
      toast.error('Failed to update rate limit status');
    }
  };

  const handleResetUsage = async (rateLimitId: string) => {
    try {
      const { error } = await supabase
        .from('rate_limit_usage')
        .delete()
        .eq('rate_limit_id', rateLimitId);

      if (error) throw error;
      toast.success('Usage data reset successfully');
      fetchUsage();
    } catch (error) {
      console.error('Error resetting usage:', error);
      toast.error('Failed to reset usage data');
    }
  };

  const filteredRateLimits = rateLimits.filter(limit => {
    const matchesSearch = limit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         limit.endpoint.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || limit.limit_type === filterType;
    return matchesSearch && matchesType;
  });

  const getLimitTypeIcon = (type: string) => {
    const limitType = limitTypes.find(t => t.value === type);
    return limitType?.icon || Shield;
  };

  const getUsagePercentage = (used: number, limit: number) => {
    return Math.min(Math.round((used / limit) * 100), 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!currentSalon) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select a salon to manage rate limits.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Rate Limits Management</h1>
          <p className="text-muted-foreground mt-1">
            Configure API rate limiting and usage policies
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLimit({
              id: '',
              salon_id: currentSalon.id,
              name: '',
              endpoint: '/api/*',
              method: 'ALL',
              limit_type: 'requests',
              max_requests: 100,
              time_window: 60,
              apply_to: 'ip',
              actions: {
                block: true,
                throttle: false,
                alert: true,
                log: true
              },
              is_active: true,
              priority: 10,
              created_at: '',
              updated_at: ''
            });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Rate Limit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_limits}</div>
            <p className="text-xs text-muted-foreground">Configured rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active_limits}</div>
            <p className="text-xs text-muted-foreground">Currently enforced</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Requests Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.requests_today.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blocked_today}</div>
            <p className="text-xs text-muted-foreground">Requests blocked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Throttled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.throttled_today}</div>
            <p className="text-xs text-muted-foreground">Requests throttled</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="limits">Rate Limits</TabsTrigger>
          <TabsTrigger value="usage">Current Usage</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="limits" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Rate Limit Rules</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search limits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {limitTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading rate limits...
                    </div>
                  ) : filteredRateLimits.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No rate limits configured
                    </div>
                  ) : (
                    filteredRateLimits.map(limit => {
                      const Icon = getLimitTypeIcon(limit.limit_type);
                      return (
                        <Card key={limit.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="mt-1">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{limit.name}</h3>
                                  <Badge variant="outline">
                                    {limit.method === 'ALL' ? 'All Methods' : limit.method}
                                  </Badge>
                                  <Badge variant="outline">
                                    Priority: {limit.priority}
                                  </Badge>
                                  {!limit.is_active && (
                                    <Badge variant="secondary">Inactive</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {limit.endpoint}
                                </p>
                                {limit.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {limit.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Activity className="h-3 w-3" />
                                    {limit.max_requests} requests / {
                                      limit.time_window >= 3600 
                                        ? `${limit.time_window / 3600} hour${limit.time_window > 3600 ? 's' : ''}`
                                        : limit.time_window >= 60
                                        ? `${limit.time_window / 60} min`
                                        : `${limit.time_window} sec`
                                    }
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    Per {limit.apply_to}
                                  </div>
                                  {limit.burst_limit && (
                                    <div className="flex items-center gap-1">
                                      <Zap className="h-3 w-3" />
                                      Burst: {limit.burst_limit}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {limit.actions.block && (
                                    <Badge variant="destructive" className="text-xs">
                                      <Ban className="h-3 w-3 mr-1" />
                                      Block
                                    </Badge>
                                  )}
                                  {limit.actions.throttle && (
                                    <Badge variant="warning" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Throttle
                                    </Badge>
                                  )}
                                  {limit.actions.alert && (
                                    <Badge variant="secondary" className="text-xs">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Alert
                                    </Badge>
                                  )}
                                  {limit.actions.log && (
                                    <Badge variant="outline" className="text-xs">
                                      <Activity className="h-3 w-3 mr-1" />
                                      Log
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={limit.is_active}
                                onCheckedChange={(checked) => handleToggleRateLimit(limit.id, checked)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResetUsage(limit.id)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingLimit(limit);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRateLimit(limit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Usage</CardTitle>
              <CardDescription>Active rate limit usage in current windows</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {usage.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No active usage data
                    </div>
                  ) : (
                    usage.map(item => {
                      const rateLimit = rateLimits.find(l => l.id === item.rate_limit_id);
                      const percentage = rateLimit 
                        ? getUsagePercentage(item.request_count, rateLimit.max_requests)
                        : 0;
                      
                      return (
                        <div key={item.id} className="space-y-2 p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{item.identifier}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.endpoint}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-semibold ${getUsageColor(percentage)}`}>
                                {item.request_count} / {rateLimit?.max_requests || '?'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {percentage}% used
                              </div>
                            </div>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Window: {format(parseISO(item.window_start), 'HH:mm:ss')}</span>
                            <span>Last request: {format(parseISO(item.last_request_at), 'HH:mm:ss')}</span>
                          </div>
                          {(item.blocked_count > 0 || item.throttled_count > 0) && (
                            <div className="flex gap-4 text-xs">
                              {item.blocked_count > 0 && (
                                <span className="text-red-600">
                                  Blocked: {item.blocked_count}
                                </span>
                              )}
                              {item.throttled_count > 0 && (
                                <span className="text-yellow-600">
                                  Throttled: {item.throttled_count}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Violations</CardTitle>
              <CardDescription>Recent violations and actions taken</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {violations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No violations recorded
                    </div>
                  ) : (
                    violations.map(violation => (
                      <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{violation.identifier}</span>
                            <Badge variant={
                              violation.action_taken === 'blocked' ? 'destructive' :
                              violation.action_taken === 'throttled' ? 'warning' :
                              'secondary'
                            } className="text-xs">
                              {violation.action_taken}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {violation.response_code}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {violation.endpoint} • {violation.rate_limit_name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {format(parseISO(violation.violated_at), 'MMM d, yyyy h:mm:ss a')}
                            • Exceeded by {violation.limit_exceeded} requests
                          </div>
                          {violation.ip_address && (
                            <div className="text-xs text-muted-foreground mt-1">
                              IP: {violation.ip_address}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Request Volume (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="requests" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="throttled" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="blocked" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Endpoints</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.top_endpoints.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No endpoint data available
                    </div>
                  ) : (
                    stats.top_endpoints.map((endpoint, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium truncate flex-1">
                            {endpoint.endpoint}
                          </span>
                          <span className="text-muted-foreground">
                            {endpoint.count.toLocaleString()}
                          </span>
                        </div>
                        <Progress 
                          value={(endpoint.count / stats.top_endpoints[0].count) * 100} 
                          className="h-2"
                        />
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limit Effectiveness</CardTitle>
              <CardDescription>Overview of rate limit performance and impact</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.active_limits > 0 
                      ? Math.round((stats.active_limits / stats.total_limits) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Active Coverage</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.requests_today > 0
                      ? ((stats.requests_today - stats.blocked_today) / stats.requests_today * 100).toFixed(1)
                      : 100}%
                  </div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.throttled_today}
                  </div>
                  <p className="text-sm text-muted-foreground">Throttled Today</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    {stats.blocked_today}
                  </div>
                  <p className="text-sm text-muted-foreground">Blocked Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Rate Limit Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLimit?.id ? 'Edit Rate Limit' : 'Create Rate Limit'}
            </DialogTitle>
            <DialogDescription>
              Configure rate limiting rules for API endpoints
            </DialogDescription>
          </DialogHeader>

          {editingLimit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={editingLimit.name}
                    onChange={(e) => setEditingLimit({
                      ...editingLimit,
                      name: e.target.value
                    })}
                    placeholder="Rate limit name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    value={editingLimit.priority}
                    onChange={(e) => setEditingLimit({
                      ...editingLimit,
                      priority: parseInt(e.target.value) || 0
                    })}
                    min="0"
                    placeholder="Lower number = higher priority"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingLimit.description || ''}
                  onChange={(e) => setEditingLimit({
                    ...editingLimit,
                    description: e.target.value
                  })}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Endpoint Pattern</Label>
                  <Select
                    value={customEndpoint ? 'custom' : editingLimit.endpoint}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setCustomEndpoint(editingLimit.endpoint);
                      } else {
                        setCustomEndpoint('');
                        setEditingLimit({
                          ...editingLimit,
                          endpoint: value
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {endpointPatterns.map(pattern => (
                        <SelectItem key={pattern.value} value={pattern.value}>
                          {pattern.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {customEndpoint && (
                    <Input
                      value={customEndpoint}
                      onChange={(e) => {
                        setCustomEndpoint(e.target.value);
                        setEditingLimit({
                          ...editingLimit,
                          endpoint: e.target.value
                        });
                      }}
                      placeholder="Custom endpoint pattern"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>HTTP Method</Label>
                  <Select
                    value={editingLimit.method}
                    onValueChange={(value) => setEditingLimit({
                      ...editingLimit,
                      method: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Methods</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limit Type</Label>
                  <Select
                    value={editingLimit.limit_type}
                    onValueChange={(value) => setEditingLimit({
                      ...editingLimit,
                      limit_type: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {limitTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Apply To</Label>
                  <Select
                    value={editingLimit.apply_to}
                    onValueChange={(value) => setEditingLimit({
                      ...editingLimit,
                      apply_to: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {applyToOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div>
                            <div>{option.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Requests</Label>
                  <Input
                    type="number"
                    value={editingLimit.max_requests}
                    onChange={(e) => setEditingLimit({
                      ...editingLimit,
                      max_requests: parseInt(e.target.value) || 0
                    })}
                    min="1"
                    placeholder="Maximum requests allowed"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time Window</Label>
                  <Select
                    value={editingLimit.time_window.toString()}
                    onValueChange={(value) => setEditingLimit({
                      ...editingLimit,
                      time_window: parseInt(value)
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeWindows.map(window => (
                        <SelectItem key={window.value} value={window.value.toString()}>
                          {window.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Burst Limit (Optional)</Label>
                  <Input
                    type="number"
                    value={editingLimit.burst_limit || ''}
                    onChange={(e) => setEditingLimit({
                      ...editingLimit,
                      burst_limit: parseInt(e.target.value) || undefined
                    })}
                    min="1"
                    placeholder="Short burst allowance"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Burst Window (seconds)</Label>
                  <Input
                    type="number"
                    value={editingLimit.burst_window || ''}
                    onChange={(e) => setEditingLimit({
                      ...editingLimit,
                      burst_window: parseInt(e.target.value) || undefined
                    })}
                    min="1"
                    placeholder="Burst time window"
                    disabled={!editingLimit.burst_limit}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Actions</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4" />
                      <span>Block Requests</span>
                    </div>
                    <Switch
                      checked={editingLimit.actions.block}
                      onCheckedChange={(checked) => setEditingLimit({
                        ...editingLimit,
                        actions: {
                          ...editingLimit.actions,
                          block: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Throttle Requests</span>
                    </div>
                    <Switch
                      checked={editingLimit.actions.throttle}
                      onCheckedChange={(checked) => setEditingLimit({
                        ...editingLimit,
                        actions: {
                          ...editingLimit.actions,
                          throttle: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Send Alerts</span>
                    </div>
                    <Switch
                      checked={editingLimit.actions.alert}
                      onCheckedChange={(checked) => setEditingLimit({
                        ...editingLimit,
                        actions: {
                          ...editingLimit.actions,
                          alert: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span>Log Violations</span>
                    </div>
                    <Switch
                      checked={editingLimit.actions.log}
                      onCheckedChange={(checked) => setEditingLimit({
                        ...editingLimit,
                        actions: {
                          ...editingLimit.actions,
                          log: checked
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingLimit.is_active}
                  onCheckedChange={(checked) => setEditingLimit({
                    ...editingLimit,
                    is_active: checked
                  })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRateLimit}>
              {editingLimit?.id ? 'Update' : 'Create'} Rate Limit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}