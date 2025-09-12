'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Database, Globe, Mail, Bell, Key, Server, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemConfig {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  is_sensitive: boolean;
  is_readonly: boolean;
  validation_rules?: any;
  default_value?: any;
  updated_at: string;
  updated_by?: string;
}

const CONFIG_CATEGORIES = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API', icon: Key },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'performance', label: 'Performance', icon: Server },
  { id: 'features', label: 'Features', icon: Globe }
];

const DEFAULT_CONFIGS: Partial<SystemConfig>[] = [
  // General
  { key: 'app_name', category: 'general', value: 'FigDream', data_type: 'string', description: 'Application name' },
  { key: 'app_url', category: 'general', value: '', data_type: 'string', description: 'Application base URL' },
  { key: 'timezone', category: 'general', value: 'America/New_York', data_type: 'string', description: 'Default timezone' },
  { key: 'maintenance_mode', category: 'general', value: false, data_type: 'boolean', description: 'Enable maintenance mode' },
  
  // Security
  { key: 'session_timeout', category: 'security', value: 3600, data_type: 'number', description: 'Session timeout in seconds' },
  { key: 'max_login_attempts', category: 'security', value: 5, data_type: 'number', description: 'Maximum login attempts before lockout' },
  { key: 'password_min_length', category: 'security', value: 8, data_type: 'number', description: 'Minimum password length' },
  { key: 'require_2fa', category: 'security', value: false, data_type: 'boolean', description: 'Require two-factor authentication' },
  { key: 'allowed_domains', category: 'security', value: [], data_type: 'json', description: 'Allowed email domains for registration' },
  
  // Email
  { key: 'smtp_host', category: 'email', value: '', data_type: 'string', description: 'SMTP server host', is_sensitive: true },
  { key: 'smtp_port', category: 'email', value: 587, data_type: 'number', description: 'SMTP server port' },
  { key: 'smtp_user', category: 'email', value: '', data_type: 'string', description: 'SMTP username', is_sensitive: true },
  { key: 'from_email', category: 'email', value: 'noreply@figdream.com', data_type: 'string', description: 'Default from email' },
  { key: 'email_enabled', category: 'email', value: true, data_type: 'boolean', description: 'Enable email notifications' },
  
  // Notifications
  { key: 'sms_enabled', category: 'notifications', value: true, data_type: 'boolean', description: 'Enable SMS notifications' },
  { key: 'push_enabled', category: 'notifications', value: true, data_type: 'boolean', description: 'Enable push notifications' },
  { key: 'reminder_hours', category: 'notifications', value: 24, data_type: 'number', description: 'Send reminders X hours before appointment' },
  { key: 'followup_days', category: 'notifications', value: 2, data_type: 'number', description: 'Send follow-up X days after appointment' },
  
  // API
  { key: 'api_rate_limit', category: 'api', value: 1000, data_type: 'number', description: 'API calls per hour limit' },
  { key: 'api_timeout', category: 'api', value: 30, data_type: 'number', description: 'API request timeout in seconds' },
  { key: 'cors_origins', category: 'api', value: ['*'], data_type: 'json', description: 'Allowed CORS origins' },
  { key: 'api_key_expiry', category: 'api', value: 90, data_type: 'number', description: 'API key expiry in days' },
  
  // Database
  { key: 'max_connections', category: 'database', value: 100, data_type: 'number', description: 'Maximum database connections' },
  { key: 'connection_timeout', category: 'database', value: 30, data_type: 'number', description: 'Connection timeout in seconds' },
  { key: 'auto_vacuum', category: 'database', value: true, data_type: 'boolean', description: 'Enable automatic vacuum' },
  { key: 'backup_retention_days', category: 'database', value: 30, data_type: 'number', description: 'Backup retention in days' },
  
  // Performance
  { key: 'cache_ttl', category: 'performance', value: 3600, data_type: 'number', description: 'Cache TTL in seconds' },
  { key: 'max_upload_size', category: 'performance', value: 10, data_type: 'number', description: 'Max upload size in MB' },
  { key: 'pagination_limit', category: 'performance', value: 50, data_type: 'number', description: 'Default pagination limit' },
  { key: 'enable_compression', category: 'performance', value: true, data_type: 'boolean', description: 'Enable response compression' },
  
  // Features
  { key: 'enable_booking', category: 'features', value: true, data_type: 'boolean', description: 'Enable online booking' },
  { key: 'enable_payments', category: 'features', value: true, data_type: 'boolean', description: 'Enable online payments' },
  { key: 'enable_reviews', category: 'features', value: true, data_type: 'boolean', description: 'Enable customer reviews' },
  { key: 'enable_loyalty', category: 'features', value: true, data_type: 'boolean', description: 'Enable loyalty programs' },
  { key: 'enable_referrals', category: 'features', value: true, data_type: 'boolean', description: 'Enable referral system' }
];

export function SystemConfigurationManager() {
  const { isAdmin } = useSalon();
  
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [editedConfigs, setEditedConfigs] = useState<Map<string, any>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const supabase = createClient();

  useEffect(() => {
    if (isAdmin) {
      fetchConfigs();
    }
  }, [isAdmin]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('system_configuration')
        .select('*')
        .order('category, key');

      if (error) throw error;
      
      // Merge with defaults to ensure all configs exist
      const existingKeys = new Set(data?.map(c => c.key));
      const mergedConfigs = [
        ...(data || []),
        ...DEFAULT_CONFIGS.filter(dc => !existingKeys.has(dc.key)).map(dc => ({
          id: crypto.randomUUID(),
          ...dc,
          is_sensitive: dc.is_sensitive || false,
          is_readonly: false,
          updated_at: new Date().toISOString()
        } as SystemConfig))
      ];
      
      setConfigs(mergedConfigs);
    } catch (error) {
      console.error('Error fetching system configuration:', error);
      toast.error('Failed to load system configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = Array.from(editedConfigs.entries()).map(([key, value]) => {
        const config = configs.find(c => c.key === key);
        return {
          key,
          value,
          category: config?.category,
          description: config?.description,
          data_type: config?.data_type,
          is_sensitive: config?.is_sensitive,
          is_readonly: config?.is_readonly,
          updated_at: new Date().toISOString(),
          updated_by: user.id
        };
      });

      const { error } = await supabase
        .from('system_configuration')
        .upsert(updates, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast.success('Configuration saved successfully');
      setEditedConfigs(new Map());
      setHasChanges(false);
      fetchConfigs();
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setEditedConfigs(new Map());
    setHasChanges(false);
    fetchConfigs();
    toast.success('Configuration reset to last saved state');
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset all configurations to default values? This action cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const defaults = DEFAULT_CONFIGS.map(dc => ({
        ...dc,
        is_sensitive: dc.is_sensitive || false,
        is_readonly: false,
        updated_at: new Date().toISOString(),
        updated_by: user.id
      }));

      const { error } = await supabase
        .from('system_configuration')
        .upsert(defaults, {
          onConflict: 'key'
        });

      if (error) throw error;

      toast.success('Configuration reset to defaults');
      fetchConfigs();
    } catch (error) {
      console.error('Error resetting to defaults:', error);
      toast.error('Failed to reset to defaults');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: string, value: any) => {
    const config = configs.find(c => c.key === key);
    if (!config || config.is_readonly) return;

    const newEditedConfigs = new Map(editedConfigs);
    newEditedConfigs.set(key, value);
    setEditedConfigs(newEditedConfigs);
    setHasChanges(true);
  };

  const getConfigValue = (config: SystemConfig) => {
    return editedConfigs.has(config.key) ? editedConfigs.get(config.key) : config.value;
  };

  const renderConfigInput = (config: SystemConfig) => {
    const value = getConfigValue(config);
    const isEdited = editedConfigs.has(config.key);

    if (config.is_readonly) {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{JSON.stringify(value)}</span>
          <Badge variant="secondary">Read-only</Badge>
        </div>
      );
    }

    switch (config.data_type) {
      case 'boolean':
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => updateConfig(config.key, checked)}
            className={isEdited ? 'ring-2 ring-primary' : ''}
          />
        );
      
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateConfig(config.key, parseFloat(e.target.value) || 0)}
            className={isEdited ? 'ring-2 ring-primary' : ''}
          />
        );
      
      case 'json':
        return (
          <Textarea
            value={JSON.stringify(value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateConfig(config.key, parsed);
              } catch {}
            }}
            className={`font-mono text-xs ${isEdited ? 'ring-2 ring-primary' : ''}`}
            rows={3}
          />
        );
      
      default:
        return (
          <Input
            type={config.is_sensitive ? 'password' : 'text'}
            value={value}
            onChange={(e) => updateConfig(config.key, e.target.value)}
            className={isEdited ? 'ring-2 ring-primary' : ''}
          />
        );
    }
  };

  const filteredConfigs = configs.filter(config => {
    const matchesCategory = config.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      config.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isAdmin) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold">Admin Access Required</p>
          <p className="text-muted-foreground mt-2">
            Only system administrators can access system configuration.
          </p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Manage system-wide settings and parameters
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToDefaults}
                disabled={saving}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Changes
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Warning Alert */}
      {hasChanges && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Remember to save your configuration before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <Input
            placeholder="Search configurations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
              {CONFIG_CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id}>
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {CONFIG_CATEGORIES.map(category => (
              <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
                {filteredConfigs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No configurations found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredConfigs.map(config => (
                      <div key={config.key} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={config.key} className="text-sm font-medium">
                                {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Label>
                              {config.is_sensitive && (
                                <Badge variant="outline" className="text-xs">
                                  <Key className="mr-1 h-3 w-3" />
                                  Sensitive
                                </Badge>
                              )}
                              {editedConfigs.has(config.key) && (
                                <Badge variant="default" className="text-xs">
                                  Modified
                                </Badge>
                              )}
                            </div>
                            {config.description && (
                              <p className="text-sm text-muted-foreground">
                                {config.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="pl-0">
                          {renderConfigInput(config)}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}