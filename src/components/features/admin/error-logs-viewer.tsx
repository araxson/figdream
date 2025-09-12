'use client';

import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { AlertCircle, Bug, Filter, RefreshCw, Search, Server, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  error_context?: any;
  user_id?: string;
  salon_id?: string;
  request_url?: string;
  request_method?: string;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function ErrorLogsViewer() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });

  const supabase = createClient();

  useEffect(() => {
    fetchErrorLogs();
  }, [severityFilter, typeFilter]);

  const fetchErrorLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('error_type', typeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setLogs(data || []);
      
      // Calculate stats
      const newStats = {
        total: data?.length || 0,
        critical: data?.filter(l => l.severity === 'critical').length || 0,
        high: data?.filter(l => l.severity === 'high').length || 0,
        medium: data?.filter(l => l.severity === 'medium').length || 0,
        low: data?.filter(l => l.severity === 'low').length || 0
      };
      setStats(newStats);
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast.error('Failed to load error logs');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Bug className="h-4 w-4" />;
      case 'low':
        return <Server className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.error_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSeverityFilter('all');
    setTypeFilter('all');
  };

  const viewDetails = (log: ErrorLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  if (loading) {
    return <div>Loading error logs...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Error Logs</h1>
          <p className="text-muted-foreground">Monitor and analyze system errors</p>
        </div>
        <Button onClick={fetchErrorLogs} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.low}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Error Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="auth">Authentication</SelectItem>
                <SelectItem value="validation">Validation</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Errors</CardTitle>
          <CardDescription>Click on an error to view details</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No error logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="text-sm">
                        {format(parseISO(log.created_at), 'MMM dd, HH:mm:ss')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityColor(log.severity) as any}>
                        <span className="flex items-center gap-1">
                          {getSeverityIcon(log.severity)}
                          {log.severity}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.error_type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.error_message}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.request_url || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetails(log)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Error Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
            <DialogDescription>
              Full error information and stack trace
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="h-[60vh]">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">General Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID:</span> {selectedLog.id}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timestamp:</span>{' '}
                      {format(parseISO(selectedLog.created_at), 'PPpp')}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Severity:</span>{' '}
                      <Badge variant={getSeverityColor(selectedLog.severity) as any}>
                        {selectedLog.severity}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span> {selectedLog.error_type}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Error Message</h4>
                  <div className="p-3 bg-muted rounded-md">
                    <code className="text-sm">{selectedLog.error_message}</code>
                  </div>
                </div>

                {selectedLog.error_stack && (
                  <div>
                    <h4 className="font-medium mb-2">Stack Trace</h4>
                    <div className="p-3 bg-muted rounded-md overflow-x-auto">
                      <pre className="text-xs">{selectedLog.error_stack}</pre>
                    </div>
                  </div>
                )}

                {selectedLog.request_url && (
                  <div>
                    <h4 className="font-medium mb-2">Request Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Method:</span>{' '}
                        {selectedLog.request_method || 'N/A'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">URL:</span>{' '}
                        {selectedLog.request_url}
                      </div>
                    </div>
                  </div>
                )}

                {selectedLog.error_context && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Context</h4>
                    <div className="p-3 bg-muted rounded-md overflow-x-auto">
                      <pre className="text-xs">
                        {JSON.stringify(selectedLog.error_context, null, 2)}
                      </pre>
                    </div>
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