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
import { createBrowserClient } from '@supabase/ssr';
import { useSalon } from '@/lib/contexts/salon-context';
import { Database } from '@/types/database.types';
import { toast } from 'sonner';
import { 
  Shield,
  Lock,
  Unlock,
  Key,
  Smartphone,
  Mail,
  MessageSquare,
  QrCode,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  Download,
  Upload,
  Copy,
  Eye,
  EyeOff,
  Settings,
  Users,
  UserCheck,
  UserX,
  Activity,
  TrendingUp,
  BarChart3,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  Send
} from 'lucide-react';
import { format, parseISO, subDays, differenceInDays } from 'date-fns';
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

interface OTPConfiguration {
  id: string;
  salon_id: string;
  enabled: boolean;
  provider: 'twilio' | 'aws_sns' | 'custom' | 'email';
  settings: {
    otp_length: number;
    otp_expiry: number; // in seconds
    max_attempts: number;
    cooldown_period: number; // in seconds
    alphanumeric: boolean;
    case_sensitive: boolean;
    delivery_method: 'sms' | 'email' | 'both';
    template: string;
    sender_id?: string;
    from_email?: string;
    from_phone?: string;
  };
  rate_limits: {
    max_per_hour: number;
    max_per_day: number;
    max_per_phone: number;
    max_per_email: number;
  };
  security: {
    require_for_login: boolean;
    require_for_sensitive: boolean;
    trusted_devices: boolean;
    remember_duration: number; // in days
    ip_whitelist: string[];
    country_whitelist: string[];
  };
  customization: {
    brand_name: string;
    message_prefix: string;
    message_suffix: string;
    support_email: string;
    support_phone: string;
  };
  stats: {
    total_sent: number;
    total_verified: number;
    total_failed: number;
    success_rate: number;
    avg_verification_time: number;
  };
  created_at: string;
  updated_at: string;
}

interface OTPLog {
  id: string;
  salon_id: string;
  user_id?: string;
  identifier: string; // phone or email
  identifier_type: 'phone' | 'email';
  otp_code: string;
  status: 'sent' | 'verified' | 'expired' | 'failed' | 'blocked';
  attempts: number;
  sent_at: string;
  verified_at?: string;
  expired_at?: string;
  ip_address?: string;
  user_agent?: string;
  error_message?: string;
  metadata?: any;
}

interface UserOTPSettings {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  otp_enabled: boolean;
  delivery_method: 'sms' | 'email' | 'both';
  phone_number?: string;
  phone_verified: boolean;
  email_verified: boolean;
  trusted_devices: string[];
  last_otp_at?: string;
  total_otps: number;
  failed_attempts: number;
  is_blocked: boolean;
  blocked_until?: string;
}

const providers = [
  { value: 'twilio', label: 'Twilio', icon: MessageSquare },
  { value: 'aws_sns', label: 'AWS SNS', icon: Cloud },
  { value: 'email', label: 'Email Only', icon: Mail },
  { value: 'custom', label: 'Custom Provider', icon: Settings }
];

const deliveryMethods = [
  { value: 'sms', label: 'SMS', icon: Smartphone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'both', label: 'Both', icon: Send }
];

export function OTPConfigurationManager() {
  const { currentSalon } = useSalon();
  const [config, setConfig] = useState<OTPConfiguration | null>(null);
  const [logs, setLogs] = useState<OTPLog[]>([]);
  const [userSettings, setUserSettings] = useState<UserOTPSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('configuration');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserOTPSettings | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [stats, setStats] = useState({
    sent_today: 0,
    verified_today: 0,
    failed_today: 0,
    active_users: 0,
    success_rate: 0,
    avg_time: 0
  });
  const [usageData, setUsageData] = useState<any[]>([]);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (currentSalon?.id) {
      fetchConfiguration();
      fetchLogs();
      fetchUserSettings();
      fetchStats();
    }
  }, [currentSalon?.id]);

  const fetchConfiguration = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('otp_configurations')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setConfig(data);
      } else {
        // Create default configuration
        const defaultConfig: OTPConfiguration = {
          id: crypto.randomUUID(),
          salon_id: currentSalon!.id,
          enabled: false,
          provider: 'email',
          settings: {
            otp_length: 6,
            otp_expiry: 300,
            max_attempts: 3,
            cooldown_period: 3600,
            alphanumeric: false,
            case_sensitive: false,
            delivery_method: 'email',
            template: 'Your verification code is: {{otp}}',
          },
          rate_limits: {
            max_per_hour: 5,
            max_per_day: 20,
            max_per_phone: 10,
            max_per_email: 10
          },
          security: {
            require_for_login: false,
            require_for_sensitive: true,
            trusted_devices: true,
            remember_duration: 30,
            ip_whitelist: [],
            country_whitelist: []
          },
          customization: {
            brand_name: currentSalon?.name || 'Salon',
            message_prefix: '',
            message_suffix: '',
            support_email: '',
            support_phone: ''
          },
          stats: {
            total_sent: 0,
            total_verified: 0,
            total_failed: 0,
            success_rate: 0,
            avg_verification_time: 0
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error fetching OTP configuration:', error);
      toast.error('Failed to load OTP configuration');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('otp_logs')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .order('sent_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching OTP logs:', error);
    }
  };

  const fetchUserSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_otp_settings')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .order('user_name');

      if (error) throw error;
      setUserSettings(data || []);
    } catch (error) {
      console.error('Error fetching user settings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayLogs } = await supabase
        .from('otp_logs')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .gte('sent_at', today);

      const sent = todayLogs?.length || 0;
      const verified = todayLogs?.filter(l => l.status === 'verified').length || 0;
      const failed = todayLogs?.filter(l => l.status === 'failed' || l.status === 'blocked').length || 0;

      const { data: activeUsers } = await supabase
        .from('user_otp_settings')
        .select('*')
        .eq('salon_id', currentSalon?.id)
        .eq('otp_enabled', true);

      // Calculate average verification time
      const verifiedLogs = todayLogs?.filter(l => l.status === 'verified' && l.verified_at);
      let avgTime = 0;
      if (verifiedLogs && verifiedLogs.length > 0) {
        const totalTime = verifiedLogs.reduce((sum, log) => {
          const sentTime = new Date(log.sent_at).getTime();
          const verifiedTime = new Date(log.verified_at!).getTime();
          return sum + (verifiedTime - sentTime) / 1000; // in seconds
        }, 0);
        avgTime = totalTime / verifiedLogs.length;
      }

      setStats({
        sent_today: sent,
        verified_today: verified,
        failed_today: failed,
        active_users: activeUsers?.length || 0,
        success_rate: sent > 0 ? (verified / sent) * 100 : 0,
        avg_time: avgTime
      });

      // Generate usage data for chart
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, 'MMM d'),
          sent: Math.floor(Math.random() * 50),
          verified: Math.floor(Math.random() * 40),
          failed: Math.floor(Math.random() * 5)
        };
      });
      setUsageData(last7Days);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSaveConfiguration = async () => {
    if (!config) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('otp_configurations')
        .upsert({
          ...config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success('OTP configuration saved successfully');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestOTP = async () => {
    try {
      // Simulate sending test OTP
      const testLog: OTPLog = {
        id: crypto.randomUUID(),
        salon_id: currentSalon!.id,
        identifier: testPhone || testEmail,
        identifier_type: testPhone ? 'phone' : 'email',
        otp_code: Math.random().toString().slice(2, 8),
        status: 'sent',
        attempts: 0,
        sent_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('otp_logs')
        .insert(testLog);

      if (error) throw error;
      
      toast.success(`Test OTP sent to ${testPhone || testEmail}`);
      setIsTestDialogOpen(false);
      fetchLogs();
      fetchStats();
    } catch (error) {
      console.error('Error sending test OTP:', error);
      toast.error('Failed to send test OTP');
    }
  };

  const handleToggleUserOTP = async (userId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('user_otp_settings')
        .update({ otp_enabled: enabled })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success(`OTP ${enabled ? 'enabled' : 'disabled'} for user`);
      fetchUserSettings();
    } catch (error) {
      console.error('Error updating user OTP settings:', error);
      toast.error('Failed to update user settings');
    }
  };

  const handleUnblockUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_otp_settings')
        .update({ 
          is_blocked: false,
          blocked_until: null,
          failed_attempts: 0
        })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('User unblocked successfully');
      fetchUserSettings();
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const handleResendOTP = async (logId: string) => {
    try {
      const log = logs.find(l => l.id === logId);
      if (!log) return;

      // Create new OTP log
      const newLog: OTPLog = {
        ...log,
        id: crypto.randomUUID(),
        otp_code: Math.random().toString().slice(2, 8),
        status: 'sent',
        attempts: 0,
        sent_at: new Date().toISOString(),
        verified_at: undefined,
        expired_at: undefined
      };

      const { error } = await supabase
        .from('otp_logs')
        .insert(newLog);

      if (error) throw error;
      
      toast.success('OTP resent successfully');
      fetchLogs();
      fetchStats();
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP');
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user_id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = userSettings.filter(user => {
    return user.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           user.user_email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!currentSalon) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please select a salon to manage OTP configuration.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">OTP Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage One-Time Password authentication settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsTestDialogOpen(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Test OTP
          </Button>
          <Button
            onClick={handleSaveConfiguration}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent_today}</div>
            <p className="text-xs text-muted-foreground">OTPs sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified_today}</div>
            <p className="text-xs text-muted-foreground">Successfully verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed_today}</div>
            <p className="text-xs text-muted-foreground">Failed attempts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_users}</div>
            <p className="text-xs text-muted-foreground">OTP enabled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.success_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Verification rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_time.toFixed(0)}s</div>
            <p className="text-xs text-muted-foreground">To verify</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="users">User Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>Configure OTP generation and delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable OTP Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require OTP for user authentication
                  </p>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Provider</Label>
                  <Select
                    value={config.provider}
                    onValueChange={(value: any) => setConfig({ ...config, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map(provider => {
                        const Icon = provider.icon;
                        return (
                          <SelectItem key={provider.value} value={provider.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {provider.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Method</Label>
                  <Select
                    value={config.settings.delivery_method}
                    onValueChange={(value: any) => setConfig({
                      ...config,
                      settings: { ...config.settings, delivery_method: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryMethods.map(method => {
                        const Icon = method.icon;
                        return (
                          <SelectItem key={method.value} value={method.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {method.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>OTP Length</Label>
                  <Input
                    type="number"
                    value={config.settings.otp_length}
                    onChange={(e) => setConfig({
                      ...config,
                      settings: { ...config.settings, otp_length: parseInt(e.target.value) }
                    })}
                    min="4"
                    max="8"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry (seconds)</Label>
                  <Input
                    type="number"
                    value={config.settings.otp_expiry}
                    onChange={(e) => setConfig({
                      ...config,
                      settings: { ...config.settings, otp_expiry: parseInt(e.target.value) }
                    })}
                    min="60"
                    max="900"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Attempts</Label>
                  <Input
                    type="number"
                    value={config.settings.max_attempts}
                    onChange={(e) => setConfig({
                      ...config,
                      settings: { ...config.settings, max_attempts: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message Template</Label>
                <Input
                  value={config.settings.template}
                  onChange={(e) => setConfig({
                    ...config,
                    settings: { ...config.settings, template: e.target.value }
                  })}
                  placeholder="Your verification code is: {{otp}}"
                />
                <p className="text-xs text-muted-foreground">
                  Use {"{{otp}}"} as placeholder for the code
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Alphanumeric OTP</Label>
                  <Switch
                    checked={config.settings.alphanumeric}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      settings: { ...config.settings, alphanumeric: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Case Sensitive</Label>
                  <Switch
                    checked={config.settings.case_sensitive}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      settings: { ...config.settings, case_sensitive: checked }
                    })}
                    disabled={!config.settings.alphanumeric}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rate Limits</CardTitle>
              <CardDescription>Prevent abuse and control usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Per Hour</Label>
                  <Input
                    type="number"
                    value={config.rate_limits.max_per_hour}
                    onChange={(e) => setConfig({
                      ...config,
                      rate_limits: { ...config.rate_limits, max_per_hour: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Per Day</Label>
                  <Input
                    type="number"
                    value={config.rate_limits.max_per_day}
                    onChange={(e) => setConfig({
                      ...config,
                      rate_limits: { ...config.rate_limits, max_per_day: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Per Phone Number</Label>
                  <Input
                    type="number"
                    value={config.rate_limits.max_per_phone}
                    onChange={(e) => setConfig({
                      ...config,
                      rate_limits: { ...config.rate_limits, max_per_phone: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Per Email</Label>
                  <Input
                    type="number"
                    value={config.rate_limits.max_per_email}
                    onChange={(e) => setConfig({
                      ...config,
                      rate_limits: { ...config.rate_limits, max_per_email: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure when OTP is required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require for Login</Label>
                    <p className="text-sm text-muted-foreground">
                      Always require OTP when users log in
                    </p>
                  </div>
                  <Switch
                    checked={config.security.require_for_login}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      security: { ...config.security, require_for_login: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require for Sensitive Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Require OTP for password changes, etc.
                    </p>
                  </div>
                  <Switch
                    checked={config.security.require_for_sensitive}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      security: { ...config.security, require_for_sensitive: checked }
                    })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trust Devices</Label>
                    <p className="text-sm text-muted-foreground">
                      Remember trusted devices
                    </p>
                  </div>
                  <Switch
                    checked={config.security.trusted_devices}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      security: { ...config.security, trusted_devices: checked }
                    })}
                  />
                </div>
              </div>
              
              {config.security.trusted_devices && (
                <div className="space-y-2">
                  <Label>Remember Duration (days)</Label>
                  <Input
                    type="number"
                    value={config.security.remember_duration}
                    onChange={(e) => setConfig({
                      ...config,
                      security: { ...config.security, remember_duration: parseInt(e.target.value) }
                    })}
                    min="1"
                    max="90"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>User OTP Settings</CardTitle>
                  <CardDescription>Manage OTP settings for individual users</CardDescription>
                </div>
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                  icon={<Search className="h-4 w-4" />}
                />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <Card key={user.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              user.otp_enabled ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {user.otp_enabled ? (
                                <UserCheck className="h-5 w-5 text-green-600" />
                              ) : (
                                <UserX className="h-5 w-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{user.user_name}</div>
                              <div className="text-sm text-muted-foreground">{user.user_email}</div>
                              <div className="flex gap-2 mt-1">
                                {user.phone_verified && (
                                  <Badge variant="outline" className="text-xs">
                                    <Smartphone className="h-3 w-3 mr-1" />
                                    Phone Verified
                                  </Badge>
                                )}
                                {user.email_verified && (
                                  <Badge variant="outline" className="text-xs">
                                    <Mail className="h-3 w-3 mr-1" />
                                    Email Verified
                                  </Badge>
                                )}
                                {user.is_blocked && (
                                  <Badge variant="destructive" className="text-xs">
                                    <Lock className="h-3 w-3 mr-1" />
                                    Blocked
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <div className="text-sm text-muted-foreground">
                                {user.total_otps} OTPs sent
                              </div>
                              {user.last_otp_at && (
                                <div className="text-xs text-muted-foreground">
                                  Last: {format(parseISO(user.last_otp_at), 'MMM d, h:mm a')}
                                </div>
                              )}
                            </div>
                            {user.is_blocked && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUnblockUser(user.user_id)}
                              >
                                <Unlock className="h-4 w-4" />
                              </Button>
                            )}
                            <Switch
                              checked={user.otp_enabled}
                              onCheckedChange={(checked) => handleToggleUserOTP(user.user_id, checked)}
                            />
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>OTP Activity Logs</CardTitle>
                  <CardDescription>Recent OTP verification attempts</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                    icon={<Search className="h-4 w-4" />}
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No OTP logs found
                    </div>
                  ) : (
                    filteredLogs.map(log => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.identifier}</span>
                            <Badge variant={
                              log.status === 'verified' ? 'success' :
                              log.status === 'sent' ? 'secondary' :
                              log.status === 'expired' ? 'warning' :
                              'destructive'
                            } className="text-xs">
                              {log.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {log.identifier_type}
                            </Badge>
                            {log.attempts > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {log.attempts} attempts
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Sent: {format(parseISO(log.sent_at), 'MMM d, h:mm:ss a')}
                            {log.verified_at && ` • Verified: ${format(parseISO(log.verified_at), 'h:mm:ss a')}`}
                          </div>
                          {log.error_message && (
                            <div className="text-xs text-red-600 mt-1">
                              Error: {log.error_message}
                            </div>
                          )}
                        </div>
                        {log.status === 'sent' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendOTP(log.id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
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
                <CardTitle>OTP Usage (7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sent" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="verified" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'SMS', value: 65 },
                        { name: 'Email', value: 35 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'SMS', value: 65 },
                        { name: 'Email', value: 35 }
                      ].map((entry, index) => (
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
              <CardTitle>OTP Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators for OTP system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-2xl font-bold">{config.stats.total_sent.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Total OTPs Sent</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {config.stats.success_rate.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {config.stats.avg_verification_time.toFixed(0)}s
                  </div>
                  <p className="text-sm text-muted-foreground">Avg Verification Time</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {config.stats.total_failed.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">Failed Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test OTP Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test OTP</DialogTitle>
            <DialogDescription>
              Send a test OTP to verify configuration
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                disabled={config.settings.delivery_method === 'email'}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                disabled={config.settings.delivery_method === 'sms'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTestOTP} disabled={!testPhone && !testEmail}>
              Send Test OTP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}