'use client';

import { useState, useEffect } from 'react';
import { Shield, Activity, User, Calendar, Search, Filter, Download, AlertCircle, CheckCircle, XCircle, Info, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';
import { format, startOfDay, endOfDay, subDays, formatDistanceToNow } from 'date-fns';

interface AuditLog {
  id: string;
  salon_id?: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failure' | 'warning';
  error_message?: string;
  created_at: string;
}

interface LogFilter {
  dateRange: string;
  action: string;
  resource: string;
  status: string;
  user: string;
}

const ACTION_CATEGORIES = {
  auth: ['login', 'logout', 'register', 'password_reset', 'two_factor_enabled'],
  appointments: ['appointment_created', 'appointment_updated', 'appointment_cancelled', 'appointment_completed'],
  customers: ['customer_created', 'customer_updated', 'customer_deleted', 'customer_imported'],
  staff: ['staff_added', 'staff_updated', 'staff_removed', 'schedule_updated'],
  services: ['service_created', 'service_updated', 'service_deleted', 'price_changed'],
  billing: ['payment_processed', 'refund_issued', 'subscription_updated', 'invoice_generated'],
  settings: ['settings_updated', 'permissions_changed', 'integration_added', 'backup_created'],
  security: ['suspicious_activity', 'access_denied', 'api_key_created', 'data_exported']
};

const SEVERITY_LEVELS = {
  high: ['customer_deleted', 'staff_removed', 'suspicious_activity', 'access_denied', 'data_exported'],
  medium: ['password_reset', 'permissions_changed', 'price_changed', 'refund_issued'],
  low: ['login', 'logout', 'appointment_created', 'settings_updated']
};

export function AuditLogsViewer() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filters, setFilters] = useState<LogFilter>({
    dateRange: '7days',
    action: 'all',
    resource: 'all',
    status: 'all',
    user: 'all'
  });
  const [stats, setStats] = useState({
    totalLogs: 0,
    successRate: 0,
    failedActions: 0,
    uniqueUsers: 0,
    criticalEvents: 0
  });
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (salonId || isAdmin) {
      fetchLogs();
      fetchStats();
      fetchUsers();
    }
  }, [salonId, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles!user_id(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      // Apply salon filter for non-admins
      if (!isAdmin && salonId) {
        query = query.eq('salon_id', salonId);
      }

      // Date range filter
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = startOfDay(now);
          break;
        case '7days':
          startDate = subDays(now, 7);
          break;
        case '30days':
          startDate = subDays(now, 30);
          break;
        case '90days':
          startDate = subDays(now, 90);
          break;
        default:
          startDate = subDays(now, 7);
      }
      
      query = query.gte('created_at', startDate.toISOString());

      // Other filters
      if (filters.action !== 'all') {
        query = query.eq('action', filters.action);
      }
      if (filters.resource !== 'all') {
        query = query.eq('resource_type', filters.resource);
      }
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.user !== 'all') {
        query = query.eq('user_id', filters.user);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Map user data
      const mappedData = data?.map(log => ({
        ...log,
        user_name: log.user?.full_name,
        user_email: log.user?.email
      })) || [];
      
      setLogs(mappedData);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .eq(salonId ? 'salon_id' : 'id', salonId || 'id')
        .gte('created_at', subDays(new Date(), 30).toISOString());

      if (data) {
        const totalLogs = data.length;
        const successCount = data.filter(l => l.status === 'success').length;
        const failedActions = data.filter(l => l.status === 'failure').length;
        const uniqueUsers = new Set(data.map(l => l.user_id)).size;
        
        // Count critical events
        const criticalEvents = data.filter(l => 
          SEVERITY_LEVELS.high.includes(l.action)
        ).length;

        setStats({
          totalLogs,
          successRate: totalLogs > 0 ? (successCount / totalLogs) * 100 : 0,
          failedActions,
          uniqueUsers,
          criticalEvents
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq(salonId ? 'salon_id' : 'id', salonId || 'id');

      if (data) {
        setUsers(data.map(u => ({ id: u.id, name: u.full_name || 'Unknown' })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const exportLogs = async () => {
    try {
      setExportLoading(true);
      
      // Create CSV content
      const headers = ['Date', 'User', 'Action', 'Resource', 'Status', 'IP Address', 'Details'];
      const rows = filteredLogs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.user_email || log.user_id,
        log.action,
        log.resource_type,
        log.status,
        log.ip_address || '-',
        JSON.stringify(log.details || {})
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export audit logs');
    } finally {
      setExportLoading(false);
    }
  };

  const getSeverityColor = (action: string) => {
    if (SEVERITY_LEVELS.high.includes(action)) return 'text-destructive';
    if (SEVERITY_LEVELS.medium.includes(action)) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionCategory = (action: string) => {
    for (const [category, actions] of Object.entries(ACTION_CATEGORIES)) {
      if (actions.includes(action)) return category;
    }
    return 'other';
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Group logs by category for the tabbed view
  const logsByCategory = Object.keys(ACTION_CATEGORIES).reduce((acc, category) => {
    acc[category] = filteredLogs.filter(log => 
      ACTION_CATEGORIES[category as keyof typeof ACTION_CATEGORIES].includes(log.action)
    );
    return acc;
  }, {} as Record<string, AuditLog[]>);

  if (salonLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
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
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of all actions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Actions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedActions}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">
              Unique users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              High severity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                Track all system activities and user actions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportLogs}
                disabled={exportLoading || filteredLogs.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                {exportLoading ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={filters.dateRange} onValueChange={(value) => setFilters({ ...filters, dateRange: value })}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.user} onValueChange={(value) => setFilters({ ...filters, user: value })}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for categories */}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="auth">Authentication</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                {filteredLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No audit logs found</p>
                    <p className="text-sm mt-2">Adjust your filters or search term</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">Status</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="text-right">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.slice(0, 100).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>{getStatusIcon(log.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{format(new Date(log.created_at), 'MMM d, h:mm a')}</div>
                              <div className="text-muted-foreground">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{log.user_name || 'Unknown'}</div>
                              <div className="text-muted-foreground">{log.user_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={getSeverityColor(log.action)}>
                              {formatAction(log.action)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{log.resource_type}</div>
                              {log.resource_name && (
                                <div className="text-muted-foreground">{log.resource_name}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.ip_address || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedLog(log)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {['auth', 'appointments', 'billing', 'security'].map(category => (
                <TabsContent key={category} value={category} className="mt-4">
                  {logsByCategory[category]?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No {category} logs found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]">Status</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsByCategory[category]?.slice(0, 50).map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{getStatusIcon(log.status)}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {log.user_name || log.user_email}
                            </TableCell>
                            <TableCell>
                              <span className={getSeverityColor(log.action)}>
                                {formatAction(log.action)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedLog(log)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete information about this event
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Event ID</p>
                    <p className="font-mono text-sm">{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedLog.status)}
                      <span className="capitalize">{selectedLog.status}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                    <p className="text-sm">
                      {format(new Date(selectedLog.created_at), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User</p>
                    <p className="text-sm">
                      {selectedLog.user_name || 'Unknown'}
                      <br />
                      <span className="text-muted-foreground">{selectedLog.user_email}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Action</p>
                    <p className="text-sm">{formatAction(selectedLog.action)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resource</p>
                    <p className="text-sm">
                      {selectedLog.resource_type}
                      {selectedLog.resource_id && (
                        <span className="text-muted-foreground"> ({selectedLog.resource_id})</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IP Address</p>
                    <p className="text-sm font-mono">{selectedLog.ip_address || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <Badge variant="outline" className="capitalize">
                      {getActionCategory(selectedLog.action)}
                    </Badge>
                  </div>
                </div>

                {selectedLog.user_agent && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">User Agent</p>
                    <p className="text-sm font-mono break-all">{selectedLog.user_agent}</p>
                  </div>
                )}

                {selectedLog.error_message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Error Message</p>
                    <p className="text-sm text-destructive">{selectedLog.error_message}</p>
                  </div>
                )}

                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Additional Details</p>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}