'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createBrowserClient } from '@supabase/ssr';
import { useSalon } from '@/lib/contexts/salon-context';
import { Database } from '@/types/database.types';
import { toast } from 'sonner';
import { 
  AlertTriangle, 
  XCircle,
  AlertCircle,
  Info,
  Bug,
  Code,
  Server,
  Database as DatabaseIcon,
  Globe,
  Shield,
  User,
  Calendar,
  Clock,
  Filter,
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileText,
  Terminal,
  Trash2,
  Archive,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { format, parseISO, subHours, subDays, isWithinInterval } from 'date-fns';
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

interface ErrorLog {
  id: string;
  salon_id?: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info' | 'debug' | 'critical';
  category: 'api' | 'database' | 'auth' | 'payment' | 'integration' | 'system' | 'client';
  message: string;
  error_code?: string;
  stack_trace?: string;
  context: {
    user_id?: string;
    user_email?: string;
    endpoint?: string;
    method?: string;
    ip_address?: string;
    user_agent?: string;
    request_id?: string;
    session_id?: string;
    browser?: string;
    os?: string;
    device?: string;
  };
  metadata?: any;
  resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  resolution_notes?: string;
  occurrence_count: number;
  first_seen: string;
  last_seen: string;
}

interface ErrorSummary {
  category: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

const errorLevels = [
  { value: 'critical', label: 'Critical', color: 'destructive', icon: XCircle },
  { value: 'error', label: 'Error', color: 'destructive', icon: AlertCircle },
  { value: 'warning', label: 'Warning', color: 'warning', icon: AlertTriangle },
  { value: 'info', label: 'Info', color: 'secondary', icon: Info },
  { value: 'debug', label: 'Debug', color: 'outline', icon: Bug }
];

const errorCategories = [
  { value: 'api', label: 'API', icon: Globe },
  { value: 'database', label: 'Database', icon: DatabaseIcon },
  { value: 'auth', label: 'Authentication', icon: Shield },
  { value: 'payment', label: 'Payment', icon: TrendingUp },
  { value: 'integration', label: 'Integration', icon: Activity },
  { value: 'system', label: 'System', icon: Server },
  { value: 'client', label: 'Client', icon: User }
];

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '6h', label: 'Last 6 Hours' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' }
];

export function ErrorLogsViewer() {
  const { currentSalon } = useSalon();
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterResolved, setFilterResolved] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    errors: 0,
    warnings: 0,
    resolved: 0,
    unresolved: 0,
    error_rate: 0,
    categories: [] as ErrorSummary[]
  });
  const [errorTrends, setErrorTrends] = useState<any[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<any[]>([]);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchErrors();
    fetchStats();
    fetchTrends();
  }, [currentSalon?.id, timeRange]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      let startDate = new Date();
      
      switch (timeRange) {
        case '1h':
          startDate = subHours(new Date(), 1);
          break;
        case '6h':
          startDate = subHours(new Date(), 6);
          break;
        case '24h':
          startDate = subDays(new Date(), 1);
          break;
        case '7d':
          startDate = subDays(new Date(), 7);
          break;
        case '30d':
          startDate = subDays(new Date(), 30);
          break;
      }

      let query = supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (currentSalon?.id) {
        query = query.eq('salon_id', currentSalon.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setErrors(data || []);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast.error('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const startDate = getStartDate();
      
      let query = supabase
        .from('error_logs')
        .select('*')
        .gte('timestamp', startDate.toISOString());

      if (currentSalon?.id) {
        query = query.eq('salon_id', currentSalon.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logs = data || [];
      
      // Calculate category distribution
      const categoryCount: Record<string, number> = {};
      const categoryTrends: Record<string, number[]> = {};
      
      logs.forEach(log => {
        categoryCount[log.category] = (categoryCount[log.category] || 0) + 1;
        if (!categoryTrends[log.category]) {
          categoryTrends[log.category] = [];
        }
        categoryTrends[log.category].push(1);
      });

      const categories = Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count,
        trend: 'stable' as const, // Would need historical data to calculate actual trend
        percentage: (count / logs.length) * 100
      }));

      setStats({
        total: logs.length,
        critical: logs.filter(l => l.level === 'critical').length,
        errors: logs.filter(l => l.level === 'error').length,
        warnings: logs.filter(l => l.level === 'warning').length,
        resolved: logs.filter(l => l.resolved).length,
        unresolved: logs.filter(l => !l.resolved).length,
        error_rate: logs.length > 0 ? (logs.filter(l => l.level === 'error' || l.level === 'critical').length / logs.length) * 100 : 0,
        categories
      });

      // Set category distribution for pie chart
      setCategoryDistribution(
        categories.map(cat => ({
          name: cat.category,
          value: cat.count
        }))
      );
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      // Generate mock trend data for visualization
      const hours = Array.from({ length: 24 }, (_, i) => {
        const date = subHours(new Date(), 23 - i);
        return {
          time: format(date, 'HH:00'),
          errors: Math.floor(Math.random() * 50),
          warnings: Math.floor(Math.random() * 30),
          info: Math.floor(Math.random() * 100)
        };
      });
      setErrorTrends(hours);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const getStartDate = () => {
    switch (timeRange) {
      case '1h':
        return subHours(new Date(), 1);
      case '6h':
        return subHours(new Date(), 6);
      case '24h':
        return subDays(new Date(), 1);
      case '7d':
        return subDays(new Date(), 7);
      case '30d':
        return subDays(new Date(), 30);
      default:
        return subDays(new Date(), 1);
    }
  };

  const handleResolveError = async (errorId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: 'current_user', // Would use actual user ID
          resolution_notes: notes
        })
        .eq('id', errorId);

      if (error) throw error;
      
      toast.success('Error marked as resolved');
      fetchErrors();
      fetchStats();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error resolving:', error);
      toast.error('Failed to resolve error');
    }
  };

  const handleDeleteError = async (errorId: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .delete()
        .eq('id', errorId);

      if (error) throw error;
      
      toast.success('Error log deleted');
      fetchErrors();
      fetchStats();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete error log');
    }
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Category', 'Message', 'Error Code', 'User', 'Endpoint', 'Resolved'],
      ...filteredErrors.map(error => [
        error.timestamp,
        error.level,
        error.category,
        error.message,
        error.error_code || '',
        error.context.user_email || '',
        error.context.endpoint || '',
        error.resolved ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const toggleErrorExpansion = (errorId: string) => {
    const newExpanded = new Set(expandedErrors);
    if (newExpanded.has(errorId)) {
      newExpanded.delete(errorId);
    } else {
      newExpanded.add(errorId);
    }
    setExpandedErrors(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.error_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.context.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = filterLevel === 'all' || error.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || error.category === filterCategory;
    const matchesResolved = filterResolved === 'all' || 
                           (filterResolved === 'resolved' && error.resolved) ||
                           (filterResolved === 'unresolved' && !error.resolved);
    return matchesSearch && matchesLevel && matchesCategory && matchesResolved;
  });

  const getLevelIcon = (level: string) => {
    const levelConfig = errorLevels.find(l => l.value === level);
    return levelConfig?.icon || AlertCircle;
  };

  const getLevelColor = (level: string) => {
    const levelConfig = errorLevels.find(l => l.value === level);
    return levelConfig?.color || 'default';
  };

  const getCategoryIcon = (category: string) => {
    const cat = errorCategories.find(c => c.value === category);
    return cat?.icon || Server;
  };

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f97316'];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and analyze system errors and warnings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchErrors()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.errors}</div>
            <p className="text-xs text-muted-foreground">Need fixing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
            <p className="text-xs text-muted-foreground">Should review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Fixed issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.error_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Of all logs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logs">Error Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Error Logs</CardTitle>
                <div className="flex gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search errors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    icon={<Search className="h-4 w-4" />}
                  />
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      {errorLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {errorCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterResolved} onValueChange={setFilterResolved}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="unresolved">Unresolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading error logs...
                    </div>
                  ) : filteredErrors.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No error logs found
                    </div>
                  ) : (
                    filteredErrors.map(error => {
                      const Icon = getLevelIcon(error.level);
                      const CategoryIcon = getCategoryIcon(error.category);
                      const isExpanded = expandedErrors.has(error.id);
                      
                      return (
                        <Card key={error.id} className={`p-4 ${error.resolved ? 'opacity-60' : ''}`}>
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex gap-3 flex-1">
                                <div className="mt-1">
                                  <Icon className={`h-5 w-5 ${
                                    error.level === 'critical' || error.level === 'error' ? 'text-red-500' :
                                    error.level === 'warning' ? 'text-yellow-500' :
                                    'text-muted-foreground'
                                  }`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={getLevelColor(error.level) as any}>
                                      {error.level}
                                    </Badge>
                                    <Badge variant="outline">
                                      <CategoryIcon className="h-3 w-3 mr-1" />
                                      {error.category}
                                    </Badge>
                                    {error.error_code && (
                                      <Badge variant="outline">
                                        {error.error_code}
                                      </Badge>
                                    )}
                                    {error.resolved && (
                                      <Badge variant="success">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Resolved
                                      </Badge>
                                    )}
                                    {error.occurrence_count > 1 && (
                                      <Badge variant="secondary">
                                        {error.occurrence_count}x
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium text-sm">{error.message}</p>
                                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {format(parseISO(error.timestamp), 'MMM d, h:mm:ss a')}
                                    </div>
                                    {error.context.user_email && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {error.context.user_email}
                                      </div>
                                    )}
                                    {error.context.endpoint && (
                                      <div className="flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        {error.context.method} {error.context.endpoint}
                                      </div>
                                    )}
                                    {error.context.ip_address && (
                                      <div className="flex items-center gap-1">
                                        <Globe className="h-3 w-3" />
                                        {error.context.ip_address}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleErrorExpansion(error.id)}
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </Button>
                                {!error.resolved && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedError(error);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteError(error.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {isExpanded && (
                              <>
                                <Separator />
                                <div className="space-y-3">
                                  {error.stack_trace && (
                                    <div>
                                      <div className="flex justify-between items-center mb-2">
                                        <Label>Stack Trace</Label>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => copyToClipboard(error.stack_trace!)}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                                        <code>{error.stack_trace}</code>
                                      </pre>
                                    </div>
                                  )}
                                  
                                  {Object.keys(error.context).length > 0 && (
                                    <div>
                                      <Label>Context</Label>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        {Object.entries(error.context).filter(([_, value]) => value).map(([key, value]) => (
                                          <div key={key} className="text-sm">
                                            <span className="text-muted-foreground">{key}:</span>{' '}
                                            <span className="font-mono">{value}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {error.metadata && (
                                    <div>
                                      <Label>Metadata</Label>
                                      <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto mt-2">
                                        <code>{JSON.stringify(error.metadata, null, 2)}</code>
                                      </pre>
                                    </div>
                                  )}

                                  {error.resolved && error.resolution_notes && (
                                    <div>
                                      <Label>Resolution Notes</Label>
                                      <p className="text-sm mt-1">{error.resolution_notes}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Resolved by {error.resolved_by} on {format(parseISO(error.resolved_at!), 'MMM d, yyyy')}
                                      </p>
                                    </div>
                                  )}

                                  <div className="flex gap-4 text-xs text-muted-foreground">
                                    <div>
                                      First seen: {format(parseISO(error.first_seen), 'MMM d, h:mm a')}
                                    </div>
                                    <div>
                                      Last seen: {format(parseISO(error.last_seen), 'MMM d, h:mm a')}
                                    </div>
                                    <div>
                                      Occurrences: {error.occurrence_count}
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Trends (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={errorTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="errors" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="warnings" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="info" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Error Categories</CardTitle>
              <CardDescription>Most common error categories in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.categories.slice(0, 5).map((category, index) => {
                  const CategoryIcon = getCategoryIcon(category.category);
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{category.category}</div>
                          <div className="text-sm text-muted-foreground">
                            {category.count} errors ({category.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {category.trend === 'up' && (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        )}
                        {category.trend === 'down' && (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        {category.trend === 'stable' && (
                          <Activity className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Patterns</CardTitle>
              <CardDescription>Common error patterns and recurring issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    pattern: 'Database Connection Timeout',
                    count: 45,
                    lastSeen: '2 hours ago',
                    impact: 'high',
                    description: 'Multiple database timeout errors during peak hours'
                  },
                  {
                    pattern: 'Authentication Token Expired',
                    count: 32,
                    lastSeen: '5 hours ago',
                    impact: 'medium',
                    description: 'Users experiencing token expiration issues'
                  },
                  {
                    pattern: 'Rate Limit Exceeded',
                    count: 28,
                    lastSeen: '1 hour ago',
                    impact: 'low',
                    description: 'API rate limits being hit by certain users'
                  },
                  {
                    pattern: 'Payment Gateway Error',
                    count: 12,
                    lastSeen: '3 days ago',
                    impact: 'critical',
                    description: 'Payment processing failures affecting transactions'
                  },
                  {
                    pattern: 'File Upload Size Limit',
                    count: 8,
                    lastSeen: '1 day ago',
                    impact: 'low',
                    description: 'Users attempting to upload files exceeding size limit'
                  }
                ].map((pattern, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{pattern.pattern}</h3>
                          <Badge variant={
                            pattern.impact === 'critical' ? 'destructive' :
                            pattern.impact === 'high' ? 'destructive' :
                            pattern.impact === 'medium' ? 'warning' :
                            'secondary'
                          }>
                            {pattern.impact} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {pattern.description}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {pattern.count} occurrences
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last seen {pattern.lastSeen}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resolve Error Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Error</DialogTitle>
            <DialogDescription>
              Mark this error as resolved and add resolution notes
            </DialogDescription>
          </DialogHeader>
          
          {selectedError && (
            <div className="space-y-4">
              <div>
                <Label>Error Message</Label>
                <p className="text-sm mt-1">{selectedError.message}</p>
              </div>
              
              <div>
                <Label>Resolution Notes</Label>
                <textarea
                  className="w-full mt-1 p-2 border rounded-md"
                  rows={4}
                  placeholder="Describe how this error was resolved..."
                  id="resolution-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              const notes = (document.getElementById('resolution-notes') as HTMLTextAreaElement)?.value;
              if (selectedError) {
                handleResolveError(selectedError.id, notes);
              }
            }}>
              Mark as Resolved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}