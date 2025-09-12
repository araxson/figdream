'use client';

import { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Save, RotateCcw, Shield, Calendar, CreditCard, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useSalon } from '@/lib/contexts/salon-context';
import { Skeleton } from '@/components/ui/skeleton';

interface NotificationSetting {
  id: string;
  user_id: string;
  salon_id?: string;
  notification_type: string;
  category: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly' | 'never';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  types: NotificationType[];
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  defaultEmail: boolean;
  defaultSms: boolean;
  defaultPush: boolean;
  defaultInApp: boolean;
}

const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'appointments',
    name: 'Appointments',
    description: 'Booking confirmations, reminders, and changes',
    icon: Calendar,
    types: [
      {
        id: 'appointment_confirmed',
        name: 'Appointment Confirmed',
        description: 'When an appointment is successfully booked',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'appointment_reminder',
        name: 'Appointment Reminder',
        description: '24 hours before your appointment',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'appointment_cancelled',
        name: 'Appointment Cancelled',
        description: 'When an appointment is cancelled',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'appointment_rescheduled',
        name: 'Appointment Rescheduled',
        description: 'When an appointment time is changed',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'waitlist_available',
        name: 'Waitlist Opening',
        description: 'When a spot becomes available',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      }
    ]
  },
  {
    id: 'payments',
    name: 'Payments',
    description: 'Payment confirmations and billing updates',
    icon: CreditCard,
    types: [
      {
        id: 'payment_received',
        name: 'Payment Received',
        description: 'When a payment is successfully processed',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'payment_failed',
        name: 'Payment Failed',
        description: 'When a payment fails to process',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'refund_processed',
        name: 'Refund Processed',
        description: 'When a refund is issued',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'invoice_generated',
        name: 'Invoice Generated',
        description: 'When a new invoice is available',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: false,
        defaultInApp: true
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'Promotions, offers, and salon updates',
    icon: TrendingUp,
    types: [
      {
        id: 'new_promotions',
        name: 'New Promotions',
        description: 'Special offers and discounts',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'loyalty_rewards',
        name: 'Loyalty Rewards',
        description: 'Points earned and rewards available',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'salon_news',
        name: 'Salon News',
        description: 'Updates and announcements',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: false,
        defaultInApp: true
      },
      {
        id: 'birthday_offers',
        name: 'Birthday Offers',
        description: 'Special birthday promotions',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      }
    ]
  },
  {
    id: 'staff',
    name: 'Staff Updates',
    description: 'Schedule changes and staff notifications',
    icon: Users,
    types: [
      {
        id: 'schedule_updated',
        name: 'Schedule Updated',
        description: 'When your work schedule changes',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'new_booking',
        name: 'New Booking',
        description: 'When a customer books with you',
        defaultEmail: false,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'customer_arrived',
        name: 'Customer Arrived',
        description: 'When your customer checks in',
        defaultEmail: false,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'tips_received',
        name: 'Tips Received',
        description: 'When you receive a tip',
        defaultEmail: false,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      }
    ]
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Account security and login alerts',
    icon: Shield,
    types: [
      {
        id: 'new_login',
        name: 'New Login',
        description: 'When your account is accessed from a new device',
        defaultEmail: true,
        defaultSms: false,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'password_changed',
        name: 'Password Changed',
        description: 'When your password is updated',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      },
      {
        id: 'two_factor_enabled',
        name: 'Two-Factor Authentication',
        description: 'When 2FA is enabled or disabled',
        defaultEmail: true,
        defaultSms: true,
        defaultPush: true,
        defaultInApp: true
      }
    ]
  }
];

export function NotificationSettingsManager() {
  const { currentSalon, isLoading: salonLoading, isAdmin } = useSalon();
  const salonId = currentSalon?.id;
  
  const [settings, setSettings] = useState<Map<string, NotificationSetting>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('appointments');
  const [globalSettings, setGlobalSettings] = useState({
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    emailDigest: 'instant' as 'instant' | 'daily' | 'weekly',
    unsubscribeAll: false
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [user, setUser] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user, salonId]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch existing settings
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq(salonId ? 'salon_id' : 'user_id', salonId || user.id);

      if (error) throw error;

      // Create a map for quick lookup
      const settingsMap = new Map<string, NotificationSetting>();
      
      // Initialize with defaults
      NOTIFICATION_CATEGORIES.forEach(category => {
        category.types.forEach(type => {
          const existing = data?.find(s => s.notification_type === type.id);
          
          if (existing) {
            settingsMap.set(type.id, existing);
          } else {
            // Create default setting
            settingsMap.set(type.id, {
              id: '',
              user_id: user.id,
              salon_id: salonId,
              notification_type: type.id,
              category: category.id,
              email_enabled: type.defaultEmail,
              sms_enabled: type.defaultSms,
              push_enabled: type.defaultPush,
              in_app_enabled: type.defaultInApp,
              frequency: 'instant',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        });
      });

      setSettings(settingsMap);
      
      // Load global settings from first setting or defaults
      if (data && data.length > 0) {
        const firstSetting = data[0];
        setGlobalSettings({
          quietHoursEnabled: !!firstSetting.quiet_hours_start,
          quietHoursStart: firstSetting.quiet_hours_start || '22:00',
          quietHoursEnd: firstSetting.quiet_hours_end || '08:00',
          emailDigest: 'instant',
          unsubscribeAll: false
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast.error('Failed to load notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (typeId: string, channel: 'email' | 'sms' | 'push' | 'in_app', enabled: boolean) => {
    const newSettings = new Map(settings);
    const setting = newSettings.get(typeId);
    
    if (setting) {
      const updatedSetting = { ...setting };
      switch (channel) {
        case 'email':
          updatedSetting.email_enabled = enabled;
          break;
        case 'sms':
          updatedSetting.sms_enabled = enabled;
          break;
        case 'push':
          updatedSetting.push_enabled = enabled;
          break;
        case 'in_app':
          updatedSetting.in_app_enabled = enabled;
          break;
      }
      newSettings.set(typeId, updatedSetting);
      setSettings(newSettings);
      setHasChanges(true);
    }
  };

  const handleCategoryToggle = (categoryId: string, channel: 'email' | 'sms' | 'push' | 'in_app', enabled: boolean) => {
    const category = NOTIFICATION_CATEGORIES.find(c => c.id === categoryId);
    if (!category) return;

    const newSettings = new Map(settings);
    category.types.forEach(type => {
      const setting = newSettings.get(type.id);
      if (setting) {
        const updatedSetting = { ...setting };
        switch (channel) {
          case 'email':
            updatedSetting.email_enabled = enabled;
            break;
          case 'sms':
            updatedSetting.sms_enabled = enabled;
            break;
          case 'push':
            updatedSetting.push_enabled = enabled;
            break;
          case 'in_app':
            updatedSetting.in_app_enabled = enabled;
            break;
        }
        newSettings.set(type.id, updatedSetting);
      }
    });
    
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepare settings for save
      const settingsToSave = Array.from(settings.values()).map(setting => ({
        user_id: user.id,
        salon_id: salonId,
        notification_type: setting.notification_type,
        category: setting.category,
        email_enabled: globalSettings.unsubscribeAll ? false : setting.email_enabled,
        sms_enabled: globalSettings.unsubscribeAll ? false : setting.sms_enabled,
        push_enabled: globalSettings.unsubscribeAll ? false : setting.push_enabled,
        in_app_enabled: setting.in_app_enabled, // Keep in-app always available
        frequency: setting.frequency,
        quiet_hours_start: globalSettings.quietHoursEnabled ? globalSettings.quietHoursStart : null,
        quiet_hours_end: globalSettings.quietHoursEnabled ? globalSettings.quietHoursEnd : null,
        updated_at: new Date().toISOString()
      }));

      // Upsert all settings
      const { error } = await supabase
        .from('notification_settings')
        .upsert(settingsToSave, {
          onConflict: 'user_id,notification_type,salon_id'
        });

      if (error) throw error;

      toast.success('Notification settings saved successfully');
      setHasChanges(false);
      fetchSettings(); // Refresh to get IDs
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchSettings();
    setHasChanges(false);
    toast.success('Settings reset to last saved state');
  };

  const handleUnsubscribeAll = (unsubscribe: boolean) => {
    setGlobalSettings({ ...globalSettings, unsubscribeAll: unsubscribe });
    setHasChanges(true);
    
    if (unsubscribe) {
      toast.warning('All notifications will be disabled except in-app');
    }
  };

  if (salonLoading || loading) {
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
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={!hasChanges || saving}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
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

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Global Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Pause notifications during specific hours
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={globalSettings.quietHoursEnabled}
                onCheckedChange={(checked) => {
                  setGlobalSettings({ ...globalSettings, quietHoursEnabled: checked });
                  setHasChanges(true);
                }}
              />
              {globalSettings.quietHoursEnabled && (
                <div className="flex items-center gap-2 text-sm">
                  <Select
                    value={globalSettings.quietHoursStart}
                    onValueChange={(value) => {
                      setGlobalSettings({ ...globalSettings, quietHoursStart: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>to</span>
                  <Select
                    value={globalSettings.quietHoursEnd}
                    onValueChange={(value) => {
                      setGlobalSettings({ ...globalSettings, quietHoursEnd: value });
                      setHasChanges(true);
                    }}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {i.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Unsubscribe from All</Label>
              <p className="text-sm text-muted-foreground">
                Disable all email and SMS notifications
              </p>
            </div>
            <Switch
              checked={globalSettings.unsubscribeAll}
              onCheckedChange={handleUnsubscribeAll}
            />
          </div>

          {globalSettings.unsubscribeAll && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have unsubscribed from all notifications. You will only receive critical security alerts and in-app notifications.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Category Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-5 w-full">
              {NOTIFICATION_CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger key={category.id} value={category.id}>
                    <Icon className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {NOTIFICATION_CATEGORIES.map((category) => (
              <TabsContent key={category.id} value={category.id} className="space-y-4 mt-6">
                <div>
                  <h3 className="font-medium mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                </div>

                {/* Category-wide toggles */}
                <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">All Email</Label>
                    <Switch
                      disabled={globalSettings.unsubscribeAll}
                      checked={category.types.every(t => settings.get(t.id)?.email_enabled)}
                      onCheckedChange={(checked) => handleCategoryToggle(category.id, 'email', checked)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">All SMS</Label>
                    <Switch
                      disabled={globalSettings.unsubscribeAll}
                      checked={category.types.every(t => settings.get(t.id)?.sms_enabled)}
                      onCheckedChange={(checked) => handleCategoryToggle(category.id, 'sms', checked)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">All Push</Label>
                    <Switch
                      disabled={globalSettings.unsubscribeAll}
                      checked={category.types.every(t => settings.get(t.id)?.push_enabled)}
                      onCheckedChange={(checked) => handleCategoryToggle(category.id, 'push', checked)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm">All In-App</Label>
                    <Switch
                      checked={category.types.every(t => settings.get(t.id)?.in_app_enabled)}
                      onCheckedChange={(checked) => handleCategoryToggle(category.id, 'in_app', checked)}
                    />
                  </div>
                </div>

                {/* Individual notification types */}
                <div className="space-y-3">
                  {category.types.map((type) => {
                    const setting = settings.get(type.id);
                    if (!setting) return null;

                    return (
                      <div key={type.id} className="border rounded-lg p-4">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">{type.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`${type.id}-email`}
                                disabled={globalSettings.unsubscribeAll}
                                checked={setting.email_enabled}
                                onCheckedChange={(checked) => handleToggle(type.id, 'email', checked)}
                              />
                              <Label htmlFor={`${type.id}-email`} className="text-sm">
                                <Mail className="h-4 w-4" />
                                <span className="sr-only">Email</span>
                              </Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`${type.id}-sms`}
                                disabled={globalSettings.unsubscribeAll}
                                checked={setting.sms_enabled}
                                onCheckedChange={(checked) => handleToggle(type.id, 'sms', checked)}
                              />
                              <Label htmlFor={`${type.id}-sms`} className="text-sm">
                                <MessageSquare className="h-4 w-4" />
                                <span className="sr-only">SMS</span>
                              </Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`${type.id}-push`}
                                disabled={globalSettings.unsubscribeAll}
                                checked={setting.push_enabled}
                                onCheckedChange={(checked) => handleToggle(type.id, 'push', checked)}
                              />
                              <Label htmlFor={`${type.id}-push`} className="text-sm">
                                <Smartphone className="h-4 w-4" />
                                <span className="sr-only">Push</span>
                              </Label>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                id={`${type.id}-inapp`}
                                checked={setting.in_app_enabled}
                                onCheckedChange={(checked) => handleToggle(type.id, 'in_app', checked)}
                              />
                              <Label htmlFor={`${type.id}-inapp`} className="text-sm">
                                <Bell className="h-4 w-4" />
                                <span className="sr-only">In-App</span>
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Channel Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Channel Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-2xl font-bold">
                {Array.from(settings.values()).filter(s => s.email_enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">Active notifications</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">SMS</span>
              </div>
              <p className="text-2xl font-bold">
                {Array.from(settings.values()).filter(s => s.sms_enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">Active notifications</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Push</span>
              </div>
              <p className="text-2xl font-bold">
                {Array.from(settings.values()).filter(s => s.push_enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">Active notifications</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">In-App</span>
              </div>
              <p className="text-2xl font-bold">
                {Array.from(settings.values()).filter(s => s.in_app_enabled).length}
              </p>
              <p className="text-xs text-muted-foreground">Active notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}