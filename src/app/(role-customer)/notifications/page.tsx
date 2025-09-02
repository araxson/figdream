'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/database/supabase/client';
import type { Database } from '@/types/database.types';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
  Label,
  Input,
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ScrollArea,
  Separator,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  BellOff, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Settings,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  Star,
  CreditCard,
  Users,
  AlertCircle,
  Info,
  Clock,
  Volume2,
  VolumeX,
  Filter,
  Search,
  RefreshCw,
  Archive,
  ChevronRight,
  Inbox,
  Send
} from 'lucide-react';

// ULTRA-TYPES: Comprehensive notification types
type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationSettings = Database['public']['Tables']['notification_settings']['Row'];

interface NotificationWithMetadata extends Notification {
  category?: string;
  icon?: any;
  color?: string;
  action_url?: string;
  action_label?: string;
}

// ULTRA-CONSTANTS: Notification category configurations
const NOTIFICATION_CATEGORIES = {
  appointments: { icon: Calendar, color: 'text-blue-500', label: 'Appointments' },
  reviews: { icon: Star, color: 'text-yellow-500', label: 'Reviews' },
  billing: { icon: CreditCard, color: 'text-green-500', label: 'Billing' },
  staff: { icon: Users, color: 'text-purple-500', label: 'Staff' },
  marketing: { icon: Send, color: 'text-pink-500', label: 'Marketing' },
  system: { icon: Info, color: 'text-gray-500', label: 'System' },
  alerts: { icon: AlertCircle, color: 'text-red-500', label: 'Alerts' }
} as const;

export default function NotificationCenterPage() {
  // ULTRA-STATE: Comprehensive notification management
  const [notifications, setNotifications] = useState<NotificationWithMetadata[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // ULTRA-SETTINGS: Form state for notification preferences
  const [settingsForm, setSettingsForm] = useState({
    email_appointments: true,
    email_marketing: false,
    email_reminders: true,
    sms_appointments: true,
    sms_reminders: true,
    sms_marketing: false,
    push_appointments: true,
    push_reminders: true,
    push_marketing: false,
    reminder_hours_before: 24
  });

  // ULTRA-FETCH: Load notifications and settings
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Not authenticated');
        return;
      }

      // Fetch notifications
      const { data: notificationsData, error: notifError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (notifError) throw notifError;

      // Process notifications with metadata
      const processedNotifications = (notificationsData || []).map(notif => {
        const category = getCategoryFromType(notif.type);
        const categoryConfig = NOTIFICATION_CATEGORIES[category as keyof typeof NOTIFICATION_CATEGORIES] || NOTIFICATION_CATEGORIES.system;
        
        return {
          ...notif,
          category,
          icon: categoryConfig.icon,
          color: categoryConfig.color,
          action_url: getActionUrl(notif),
          action_label: getActionLabel(notif.type)
        };
      });

      setNotifications(processedNotifications);
      setUnreadCount(processedNotifications.filter(n => !n.is_read).length);

      // Fetch notification settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!settingsError && settingsData) {
        setSettings(settingsData);
        setSettingsForm({
          email_appointments: settingsData.email_appointments ?? true,
          email_marketing: settingsData.email_marketing ?? false,
          email_reminders: settingsData.email_reminders ?? true,
          sms_appointments: settingsData.sms_appointments ?? true,
          sms_reminders: settingsData.sms_reminders ?? true,
          sms_marketing: settingsData.sms_marketing ?? false,
          push_appointments: settingsData.push_appointments ?? true,
          push_reminders: settingsData.push_reminders ?? true,
          push_marketing: settingsData.push_marketing ?? false,
          reminder_hours_before: settingsData.reminder_hours_before ?? 24
        });
      }

    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Set up real-time subscription for new notifications
    const supabase = createClient();
    
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, (payload) => {
        // Add new notification to the list
        const newNotif = processNotification(payload.new as Notification);
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        toast.info('New notification received');
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadData]);

  // ULTRA-HANDLER: Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  // ULTRA-HANDLER: Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  // ULTRA-HANDLER: Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const supabase = createClient();

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // ULTRA-HANDLER: Save notification settings
  const handleSaveSettings = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('notification_settings')
          .update({
            ...settingsForm,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id,
            ...settingsForm,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast.success('Notification settings updated');
      setShowSettings(false);
      loadData();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save notification settings');
    }
  };

  // ULTRA-FILTER: Filter notifications
  const filteredNotifications = notifications.filter(notif => {
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'unread' && !notif.is_read);
    const matchesCategory = selectedCategory === 'all' || 
                           notif.category === selectedCategory;
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notif.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesCategory && matchesSearch;
  });

  // ULTRA-HELPER: Process notification
  function processNotification(notif: Notification): NotificationWithMetadata {
    const category = getCategoryFromType(notif.type);
    const categoryConfig = NOTIFICATION_CATEGORIES[category as keyof typeof NOTIFICATION_CATEGORIES] || NOTIFICATION_CATEGORIES.system;
    
    return {
      ...notif,
      category,
      icon: categoryConfig.icon,
      color: categoryConfig.color,
      action_url: getActionUrl(notif),
      action_label: getActionLabel(notif.type)
    };
  }

  // ULTRA-HELPER: Get category from type
  function getCategoryFromType(type: string): string {
    if (type.includes('appointment')) return 'appointments';
    if (type.includes('review')) return 'reviews';
    if (type.includes('payment') || type.includes('subscription')) return 'billing';
    if (type.includes('staff')) return 'staff';
    if (type.includes('marketing')) return 'marketing';
    if (type.includes('alert')) return 'alerts';
    return 'system';
  }

  // ULTRA-HELPER: Get action URL
  function getActionUrl(notif: Notification): string | undefined {
    const data = notif.data as any;
    if (data?.appointment_id) return `/appointments/${data.appointment_id}`;
    if (data?.review_id) return `/reviews/${data.review_id}`;
    return undefined;
  }

  // ULTRA-HELPER: Get action label
  function getActionLabel(type: string): string {
    if (type.includes('appointment')) return 'View Appointment';
    if (type.includes('review')) return 'View Review';
    if (type.includes('payment')) return 'View Payment';
    return 'View Details';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      {/* ULTRA-HEADER: Notification center header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Center
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All Read
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={loadData}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ULTRA-SETTINGS: Notification preferences */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>
              Manage how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Email Notifications</Label>
                <Switch
                  checked={settingsForm.email_appointments || settingsForm.email_reminders || settingsForm.email_marketing}
                  onCheckedChange={(checked) => setSettingsForm(prev => ({ 
                    ...prev, 
                    email_appointments: checked,
                    email_reminders: checked,
                    email_marketing: checked 
                  }))}
                />
              </div>
              {(settingsForm.email_appointments || settingsForm.email_reminders || settingsForm.email_marketing) && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-appointments"
                      checked={settingsForm.email_appointments}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, email_appointments: !!checked }))}
                    />
                    <Label htmlFor="email-appointments" className="text-sm">Appointment updates</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-reviews"
                      checked={settingsForm.email_reminders}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, email_reminders: !!checked }))}
                    />
                    <Label htmlFor="email-reviews" className="text-sm">Review requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email-marketing"
                      checked={settingsForm.email_marketing}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, email_marketing: !!checked }))}
                    />
                    <Label htmlFor="email-marketing" className="text-sm">Marketing & promotions</Label>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* SMS Settings */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold">SMS Notifications</Label>
                <Switch
                  checked={settingsForm.sms_appointments || settingsForm.sms_reminders || settingsForm.sms_marketing}
                  onCheckedChange={(checked) => setSettingsForm(prev => ({ 
                    ...prev, 
                    sms_appointments: checked,
                    sms_reminders: checked,
                    sms_marketing: checked 
                  }))}
                />
              </div>
              {(settingsForm.sms_appointments || settingsForm.sms_reminders || settingsForm.sms_marketing) && (
                <div className="ml-6 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-appointments"
                      checked={settingsForm.sms_appointments}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, sms_appointments: !!checked }))}
                    />
                    <Label htmlFor="sms-appointments" className="text-sm">Appointment confirmations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms-reminders"
                      checked={settingsForm.sms_reminders}
                      onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, sms_reminders: !!checked }))}
                    />
                    <Label htmlFor="sms-reminders" className="text-sm">Appointment reminders</Label>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Quiet Hours */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="text-base font-semibold">Quiet Hours</Label>
                <Switch
                  checked={false}
                  onCheckedChange={(checked) => console.log('Quiet hours not implemented')}
                />
              </div>
              {false && (
                <div className="ml-6 flex gap-4">
                  <div>
                    <Label className="text-sm">Start Time</Label>
                    <Input
                      type="time"
                      value="22:00"
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">End Time</Label>
                    <Input
                      type="time"
                      value="08:00"
                      onChange={(e) => setSettingsForm(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ULTRA-FILTERS: Notification filters */}
      <div className="flex gap-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(NOTIFICATION_CATEGORIES).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* ULTRA-LIST: Notifications list */}
      <Card>
        <ScrollArea className="h-[600px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => {
                const Icon = notification.icon;
                
                return (
                  <ContextMenu key={notification.id}>
                    <ContextMenuTrigger asChild>
                      <div
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-context-menu ${
                          !notification.is_read ? 'bg-muted/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className={`mt-1 ${notification.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {notification.title}
                                </p>
                                {notification.message && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {!notification.is_read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleMarkAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                {notification.action_url && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                  >
                                    <a href={notification.action_url}>
                                      {notification.action_label}
                                      <ChevronRight className="ml-1 h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteNotification(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      {!notification.is_read ? (
                        <ContextMenuItem onClick={() => handleMarkAsRead(notification.id)}>
                          Mark as Read
                        </ContextMenuItem>
                      ) : (
                        <ContextMenuItem onClick={() => console.log('Mark as unread not implemented')}>
                          Mark as Unread
                        </ContextMenuItem>
                      )}
                      {notification.action_url && (
                        <>
                          <ContextMenuSeparator />
                          <ContextMenuItem asChild>
                            <a href={notification.action_url}>
                              {notification.action_label || 'Open Link'}
                            </a>
                          </ContextMenuItem>
                        </>
                      )}
                      <ContextMenuSeparator />
                      <ContextMenuItem 
                        className="text-destructive"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        Delete Notification
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}