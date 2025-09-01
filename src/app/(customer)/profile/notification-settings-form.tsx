'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Save, Bell, Mail, MessageSquare, Calendar, CreditCard, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { updateNotificationSettings } from '@/lib/data-access/notification-settings';
import type { Database } from '@/types/database.types';

type NotificationSettings = Database['public']['Tables']['notification_settings']['Row'];
type CustomerPreferences = Database['public']['Tables']['customer_preferences']['Row'];

interface NotificationSettingsFormProps {
  userId: string;
  currentSettings: NotificationSettings | null;
  customerPreferences: CustomerPreferences | null;
}

export default function NotificationSettingsForm({ 
  userId, 
  currentSettings,
  customerPreferences 
}: NotificationSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email_enabled: currentSettings?.email_enabled ?? true,
    sms_enabled: currentSettings?.sms_enabled ?? false,
    push_enabled: currentSettings?.push_enabled ?? true,
    appointment_reminders: currentSettings?.appointment_reminders ?? true,
    marketing_messages: currentSettings?.marketing_messages ?? false,
    system_updates: currentSettings?.system_updates ?? true,
    loyalty_updates: currentSettings?.loyalty_updates ?? true,
    review_requests: currentSettings?.review_requests ?? true,
    staff_messages: currentSettings?.staff_messages ?? true,
    quiet_hours_enabled: currentSettings?.quiet_hours_enabled ?? false,
    quiet_hours_start: currentSettings?.quiet_hours_start || '22:00',
    quiet_hours_end: currentSettings?.quiet_hours_end || '08:00',
    notification_frequency: currentSettings?.notification_frequency || 'immediate',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateNotificationSettings(userId, formData);
      toast.success('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const notificationTypes = [
    {
      key: 'appointment_reminders',
      label: 'Appointment Reminders',
      description: 'Get notified about upcoming appointments',
      icon: Calendar,
    },
    {
      key: 'marketing_messages',
      label: 'Promotional Offers',
      description: 'Receive special deals and promotions',
      icon: Gift,
    },
    {
      key: 'loyalty_updates',
      label: 'Loyalty Program',
      description: 'Points earned and rewards available',
      icon: CreditCard,
    },
    {
      key: 'review_requests',
      label: 'Review Requests',
      description: 'Requests to review services after appointments',
      icon: MessageSquare,
    },
    {
      key: 'staff_messages',
      label: 'Staff Messages',
      description: 'Direct messages from your service providers',
      icon: Mail,
    },
    {
      key: 'system_updates',
      label: 'System Updates',
      description: 'Important account and system notifications',
      icon: Bell,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold mb-4">Notification Channels</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_enabled">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email_enabled"
                checked={formData.email_enabled}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, email_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms_enabled">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive text message notifications
                </p>
              </div>
              <Switch
                id="sms_enabled"
                checked={formData.sms_enabled}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, sms_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push_enabled">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser or mobile app notifications
                </p>
              </div>
              <Switch
                id="push_enabled"
                checked={formData.push_enabled}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, push_enabled: checked })
                }
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-base font-semibold mb-4">Notification Types</h3>
          <div className="space-y-4">
            {notificationTypes.map(({ key, label, description, icon: Icon }) => (
              <div key={key} className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-0.5">
                    <Label htmlFor={key}>{label}</Label>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </div>
                <Switch
                  id={key}
                  checked={formData[key as keyof typeof formData] as boolean}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, [key]: checked })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-base font-semibold mb-4">Notification Frequency</h3>
          <RadioGroup
            value={formData.notification_frequency}
            onValueChange={(value) => 
              setFormData({ ...formData, notification_frequency: value })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="immediate" id="immediate" />
              <Label htmlFor="immediate" className="font-normal">
                Immediate - Get notified as soon as something happens
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hourly" id="hourly" />
              <Label htmlFor="hourly" className="font-normal">
                Hourly - Receive a summary every hour
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="font-normal">
                Daily - Receive a daily summary
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="font-normal">
                Weekly - Receive a weekly summary
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-0.5">
              <Label htmlFor="quiet_hours_enabled">Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Pause notifications during specific hours
              </p>
            </div>
            <Switch
              id="quiet_hours_enabled"
              checked={formData.quiet_hours_enabled}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, quiet_hours_enabled: checked })
              }
            />
          </div>

          {formData.quiet_hours_enabled && (
            <div className="grid grid-cols-2 gap-4 pl-4">
              <div className="space-y-2">
                <Label htmlFor="quiet_start">Start Time</Label>
                <input
                  type="time"
                  id="quiet_start"
                  value={formData.quiet_hours_start}
                  onChange={(e) => 
                    setFormData({ ...formData, quiet_hours_start: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet_end">End Time</Label>
                <input
                  type="time"
                  id="quiet_end"
                  value={formData.quiet_hours_end}
                  onChange={(e) => 
                    setFormData({ ...formData, quiet_hours_end: e.target.value })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </>
        )}
      </Button>
    </form>
  );
}