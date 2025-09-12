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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createBrowserClient } from '@supabase/ssr';
import { useSalon } from '@/lib/contexts/salon-context';
import { Database } from '@/types/database.types';
import { toast } from 'sonner';
import { 
  Bell, 
  BellOff, 
  Plus, 
  Trash2, 
  Edit, 
  AlertTriangle, 
  Info, 
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Shield,
  Zap,
  Filter,
  Download,
  Upload,
  RefreshCw,
  Settings,
  ChevronRight
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AlertConfig {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  type: 'system' | 'business' | 'performance' | 'security' | 'custom';
  category: 'critical' | 'warning' | 'info' | 'success';
  trigger_type: 'threshold' | 'event' | 'schedule' | 'manual';
  trigger_conditions: {
    metric?: string;
    operator?: 'greater' | 'less' | 'equal' | 'not_equal' | 'contains';
    value?: any;
    schedule?: string;
    event_type?: string;
  };
  notification_channels: {
    email: boolean;
    sms: boolean;
    push: boolean;
    in_app: boolean;
    webhook?: string;
  };
  recipients: {
    roles?: string[];
    users?: string[];
    emails?: string[];
    phones?: string[];
  };
  cooldown_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered?: string;
  trigger_count: number;
  metadata?: any;
}

interface AlertHistory {
  id: string;
  alert_id: string;
  alert_name: string;
  triggered_at: string;
  trigger_value?: any;
  notification_sent: boolean;
  notification_channels: string[];
  recipients_count: number;
  status: 'triggered' | 'sent' | 'failed' | 'acknowledged';
  acknowledged_by?: string;
  acknowledged_at?: string;
  error_message?: string;
}

const alertTypes = [
  { value: 'system', label: 'System', icon: Shield },
  { value: 'business', label: 'Business', icon: TrendingUp },
  { value: 'performance', label: 'Performance', icon: Activity },
  { value: 'security', label: 'Security', icon: AlertTriangle },
  { value: 'custom', label: 'Custom', icon: Settings }
];

const alertCategories = [
  { value: 'critical', label: 'Critical', color: 'destructive' },
  { value: 'warning', label: 'Warning', color: 'warning' },
  { value: 'info', label: 'Info', color: 'secondary' },
  { value: 'success', label: 'Success', color: 'success' }
];

const triggerTypes = [
  { value: 'threshold', label: 'Threshold', description: 'Trigger when metric crosses threshold' },
  { value: 'event', label: 'Event', description: 'Trigger on specific events' },
  { value: 'schedule', label: 'Schedule', description: 'Trigger on schedule' },
  { value: 'manual', label: 'Manual', description: 'Manually triggered' }
];

const metricOptions = [
  { value: 'revenue_daily', label: 'Daily Revenue' },
  { value: 'revenue_monthly', label: 'Monthly Revenue' },
  { value: 'appointments_daily', label: 'Daily Appointments' },
  { value: 'appointments_cancelled', label: 'Cancelled Appointments' },
  { value: 'new_customers', label: 'New Customers' },
  { value: 'staff_utilization', label: 'Staff Utilization %' },
  { value: 'inventory_low', label: 'Low Inventory Items' },
  { value: 'response_time', label: 'API Response Time' },
  { value: 'error_rate', label: 'Error Rate %' },
  { value: 'database_size', label: 'Database Size' },
  { value: 'active_users', label: 'Active Users' },
  { value: 'payment_failures', label: 'Payment Failures' }
];

const eventOptions = [
  { value: 'appointment_created', label: 'Appointment Created' },
  { value: 'appointment_cancelled', label: 'Appointment Cancelled' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'payment_failed', label: 'Payment Failed' },
  { value: 'new_review', label: 'New Review' },
  { value: 'low_rating', label: 'Low Rating Review' },
  { value: 'staff_login', label: 'Staff Login' },
  { value: 'unauthorized_access', label: 'Unauthorized Access' },
  { value: 'data_export', label: 'Data Export' },
  { value: 'system_error', label: 'System Error' }
];

export function AlertConfigurationManager() {
  const { currentSalon } = useSalon();
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [history, setHistory] = useState<AlertHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertConfig | null>(null);
  const [editingAlert, setEditingAlert] = useState<AlertConfig | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    triggered_today: 0,
    critical_alerts: 0
  });

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (currentSalon?.id) {
      fetchAlerts();
      fetchHistory();
      fetchStats();
    }
  }, [currentSalon?.id]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_configurations')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_history')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .order('triggered_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: alertData } = await supabase
        .from('alert_configurations')
        .select('*')
        .eq('salon_id', currentSalon?.id);

      const { data: historyData } = await supabase
        .from('alert_history')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .gte('triggered_at', new Date().toISOString().split('T')[0]);

      setStats({
        total: alertData?.length || 0,
        active: alertData?.filter(a => a.is_active).length || 0,
        triggered_today: historyData?.length || 0,
        critical_alerts: alertData?.filter(a => a.category === 'critical').length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSaveAlert = async () => {
    if (!editingAlert) return;

    try {
      if (editingAlert.id) {
        const { error } = await supabase
          .from('alert_configurations')
          .update({
            ...editingAlert,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAlert.id);

        if (error) throw error;
        toast.success('Alert updated successfully');
      } else {
        const { error } = await supabase
          .from('alert_configurations')
          .insert({
            ...editingAlert,
            id: crypto.randomUUID(),
            salon_id: currentSalon?.id,
            trigger_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        toast.success('Alert created successfully');
      }

      setIsDialogOpen(false);
      setEditingAlert(null);
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error saving alert:', error);
      toast.error('Failed to save alert');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alert_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Alert deleted successfully');
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_configurations')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Alert ${isActive ? 'activated' : 'deactivated'}`);
      fetchAlerts();
      fetchStats();
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Failed to update alert status');
    }
  };

  const handleTestAlert = async (alert: AlertConfig) => {
    try {
      // Simulate alert trigger
      const { error } = await supabase
        .from('alert_history')
        .insert({
          id: crypto.randomUUID(),
          alert_id: alert.id,
          salon_id: currentSalon?.id,
          alert_name: alert.name,
          triggered_at: new Date().toISOString(),
          trigger_value: 'Test trigger',
          notification_sent: true,
          notification_channels: Object.entries(alert.notification_channels)
            .filter(([_, enabled]) => enabled)
            .map(([channel]) => channel),
          recipients_count: 1,
          status: 'sent'
        });

      if (error) throw error;
      toast.success('Test alert sent successfully');
      fetchHistory();
    } catch (error) {
      console.error('Error testing alert:', error);
      toast.error('Failed to test alert');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         alert.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getAlertIcon = (type: string) => {
    const alertType = alertTypes.find(t => t.value === type);
    return alertType?.icon || Bell;
  };

  const getCategoryBadgeColor = (category: string) => {
    const cat = alertCategories.find(c => c.value === category);
    return cat?.color || 'default';
  };

  if (!currentSalon) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select a salon to manage alert configurations.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alert Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Configure system alerts and notifications
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAlert({
              id: '',
              salon_id: currentSalon.id,
              name: '',
              type: 'system',
              category: 'info',
              trigger_type: 'threshold',
              trigger_conditions: {},
              notification_channels: {
                email: true,
                sms: false,
                push: false,
                in_app: true
              },
              recipients: {},
              cooldown_minutes: 60,
              is_active: true,
              created_at: '',
              updated_at: '',
              trigger_count: 0
            });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Configured alerts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently monitoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Triggered Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.triggered_today}</div>
            <p className="text-xs text-muted-foreground">Alerts triggered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical_alerts}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="alerts">Alert Rules</TabsTrigger>
          <TabsTrigger value="history">Alert History</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Alert Rules</CardTitle>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search alerts..."
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
                      {alertTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {alertCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
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
                      Loading alerts...
                    </div>
                  ) : filteredAlerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No alerts found
                    </div>
                  ) : (
                    filteredAlerts.map(alert => {
                      const Icon = getAlertIcon(alert.type);
                      return (
                        <Card key={alert.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="mt-1">
                                <Icon className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{alert.name}</h3>
                                  <Badge variant={getCategoryBadgeColor(alert.category) as any}>
                                    {alert.category}
                                  </Badge>
                                  <Badge variant="outline">
                                    {alert.trigger_type}
                                  </Badge>
                                  {!alert.is_active && (
                                    <Badge variant="secondary">Inactive</Badge>
                                  )}
                                </div>
                                {alert.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {alert.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Cooldown: {alert.cooldown_minutes}m
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Zap className="h-3 w-3" />
                                    Triggered: {alert.trigger_count} times
                                  </div>
                                  {alert.last_triggered && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Last: {format(parseISO(alert.last_triggered), 'MMM d, h:mm a')}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {alert.notification_channels.email && (
                                    <Badge variant="outline" className="text-xs">
                                      <Mail className="h-3 w-3 mr-1" />
                                      Email
                                    </Badge>
                                  )}
                                  {alert.notification_channels.sms && (
                                    <Badge variant="outline" className="text-xs">
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      SMS
                                    </Badge>
                                  )}
                                  {alert.notification_channels.push && (
                                    <Badge variant="outline" className="text-xs">
                                      <Smartphone className="h-3 w-3 mr-1" />
                                      Push
                                    </Badge>
                                  )}
                                  {alert.notification_channels.in_app && (
                                    <Badge variant="outline" className="text-xs">
                                      <Bell className="h-3 w-3 mr-1" />
                                      In-App
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={alert.is_active}
                                onCheckedChange={(checked) => handleToggleAlert(alert.id, checked)}
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTestAlert(alert)}
                              >
                                <Zap className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingAlert(alert);
                                  setIsDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteAlert(alert.id)}
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

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>Recent alert triggers and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No alert history available
                    </div>
                  ) : (
                    history.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.alert_name}</span>
                            <Badge variant={
                              item.status === 'sent' ? 'success' :
                              item.status === 'failed' ? 'destructive' :
                              item.status === 'acknowledged' ? 'secondary' :
                              'default'
                            } className="text-xs">
                              {item.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {format(parseISO(item.triggered_at), 'MMM d, yyyy h:mm a')}
                            {item.trigger_value && ` • Value: ${item.trigger_value}`}
                          </div>
                          <div className="flex gap-2 mt-1">
                            {item.notification_channels.map(channel => (
                              <Badge key={channel} variant="outline" className="text-xs">
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {item.acknowledged_by && (
                          <div className="text-sm text-muted-foreground">
                            Acknowledged by {item.acknowledged_by}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Templates</CardTitle>
              <CardDescription>Pre-configured alert templates for common scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: 'Low Inventory Alert',
                    description: 'Alert when product inventory falls below threshold',
                    type: 'business',
                    category: 'warning'
                  },
                  {
                    name: 'High Cancellation Rate',
                    description: 'Alert when cancellation rate exceeds normal',
                    type: 'business',
                    category: 'warning'
                  },
                  {
                    name: 'Revenue Target',
                    description: 'Alert when daily revenue meets target',
                    type: 'business',
                    category: 'success'
                  },
                  {
                    name: 'System Error Rate',
                    description: 'Alert on high system error rates',
                    type: 'system',
                    category: 'critical'
                  },
                  {
                    name: 'Unauthorized Access',
                    description: 'Alert on unauthorized access attempts',
                    type: 'security',
                    category: 'critical'
                  },
                  {
                    name: 'New Customer Milestone',
                    description: 'Alert when reaching customer milestones',
                    type: 'business',
                    category: 'success'
                  }
                ].map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setEditingAlert({
                        id: '',
                        salon_id: currentSalon.id,
                        name: template.name,
                        description: template.description,
                        type: template.type as any,
                        category: template.category as any,
                        trigger_type: 'threshold',
                        trigger_conditions: {},
                        notification_channels: {
                          email: true,
                          sms: false,
                          push: false,
                          in_app: true
                        },
                        recipients: {},
                        cooldown_minutes: 60,
                        is_active: true,
                        created_at: '',
                        updated_at: '',
                        trigger_count: 0
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge variant={getCategoryBadgeColor(template.category) as any}>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Configuration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAlert?.id ? 'Edit Alert' : 'Create Alert'}
            </DialogTitle>
            <DialogDescription>
              Configure alert rules and notification settings
            </DialogDescription>
          </DialogHeader>

          {editingAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Alert Name</Label>
                  <Input
                    value={editingAlert.name}
                    onChange={(e) => setEditingAlert({
                      ...editingAlert,
                      name: e.target.value
                    })}
                    placeholder="Enter alert name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editingAlert.type}
                    onValueChange={(value) => setEditingAlert({
                      ...editingAlert,
                      type: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {alertTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingAlert.description || ''}
                  onChange={(e) => setEditingAlert({
                    ...editingAlert,
                    description: e.target.value
                  })}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={editingAlert.category}
                    onValueChange={(value) => setEditingAlert({
                      ...editingAlert,
                      category: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {alertCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select
                    value={editingAlert.trigger_type}
                    onValueChange={(value) => setEditingAlert({
                      ...editingAlert,
                      trigger_type: value as any
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div>{type.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editingAlert.trigger_type === 'threshold' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Metric</Label>
                      <Select
                        value={editingAlert.trigger_conditions.metric || ''}
                        onValueChange={(value) => setEditingAlert({
                          ...editingAlert,
                          trigger_conditions: {
                            ...editingAlert.trigger_conditions,
                            metric: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select metric" />
                        </SelectTrigger>
                        <SelectContent>
                          {metricOptions.map(metric => (
                            <SelectItem key={metric.value} value={metric.value}>
                              {metric.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Operator</Label>
                      <Select
                        value={editingAlert.trigger_conditions.operator || ''}
                        onValueChange={(value) => setEditingAlert({
                          ...editingAlert,
                          trigger_conditions: {
                            ...editingAlert.trigger_conditions,
                            operator: value as any
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="greater">Greater than</SelectItem>
                          <SelectItem value="less">Less than</SelectItem>
                          <SelectItem value="equal">Equal to</SelectItem>
                          <SelectItem value="not_equal">Not equal to</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Value</Label>
                      <Input
                        type="number"
                        value={editingAlert.trigger_conditions.value || ''}
                        onChange={(e) => setEditingAlert({
                          ...editingAlert,
                          trigger_conditions: {
                            ...editingAlert.trigger_conditions,
                            value: e.target.value
                          }
                        })}
                        placeholder="Threshold value"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editingAlert.trigger_type === 'event' && (
                <div className="space-y-2">
                  <Label>Event Type</Label>
                  <Select
                    value={editingAlert.trigger_conditions.event_type || ''}
                    onValueChange={(value) => setEditingAlert({
                      ...editingAlert,
                      trigger_conditions: {
                        ...editingAlert.trigger_conditions,
                        event_type: value
                      }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventOptions.map(event => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label>Notification Channels</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </div>
                    <Switch
                      checked={editingAlert.notification_channels.email}
                      onCheckedChange={(checked) => setEditingAlert({
                        ...editingAlert,
                        notification_channels: {
                          ...editingAlert.notification_channels,
                          email: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <span>SMS</span>
                    </div>
                    <Switch
                      checked={editingAlert.notification_channels.sms}
                      onCheckedChange={(checked) => setEditingAlert({
                        ...editingAlert,
                        notification_channels: {
                          ...editingAlert.notification_channels,
                          sms: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Push Notifications</span>
                    </div>
                    <Switch
                      checked={editingAlert.notification_channels.push}
                      onCheckedChange={(checked) => setEditingAlert({
                        ...editingAlert,
                        notification_channels: {
                          ...editingAlert.notification_channels,
                          push: checked
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <span>In-App Notifications</span>
                    </div>
                    <Switch
                      checked={editingAlert.notification_channels.in_app}
                      onCheckedChange={(checked) => setEditingAlert({
                        ...editingAlert,
                        notification_channels: {
                          ...editingAlert.notification_channels,
                          in_app: checked
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cooldown Period (minutes)</Label>
                <Input
                  type="number"
                  value={editingAlert.cooldown_minutes}
                  onChange={(e) => setEditingAlert({
                    ...editingAlert,
                    cooldown_minutes: parseInt(e.target.value) || 0
                  })}
                  min="0"
                  placeholder="Minutes between alerts"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingAlert.is_active}
                  onCheckedChange={(checked) => setEditingAlert({
                    ...editingAlert,
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
            <Button onClick={handleSaveAlert}>
              {editingAlert?.id ? 'Update' : 'Create'} Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}