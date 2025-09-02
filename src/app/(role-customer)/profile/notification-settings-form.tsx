'use client';

import { useState } from 'react';
import { Button, Label, Switch } from '@/components/ui';
import { Loader2, Save, Bell, Calendar, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { upsertNotificationSettings } from '@/lib/data-access/notification-settings';
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
    email_appointments: currentSettings?.email_appointments ?? true,
    email_reminders: currentSettings?.email_reminders ?? true,
    email_marketing: currentSettings?.email_marketing ?? false,
    sms_appointments: currentSettings?.sms_appointments ?? false,
    sms_reminders: currentSettings?.sms_reminders ?? false,
    sms_marketing: currentSettings?.sms_marketing ?? false,
    push_appointments: currentSettings?.push_appointments ?? true,
    push_reminders: currentSettings?.push_reminders ?? true,
    push_marketing: currentSettings?.push_marketing ?? false,
    reminder_hours_before: currentSettings?.reminder_hours_before ?? 24,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await upsertNotificationSettings(userId, formData);
      toast.success('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const notificationChannels = [
    { channel: 'email', label: 'Email' },
    { channel: 'sms', label: 'SMS' },
    { channel: 'push', label: 'Push' },
  ] as const;

  const notificationTypes = [
    { type: 'appointments', label: 'Appointments', icon: Calendar },
    { type: 'reminders', label: 'Reminders', icon: Bell },
    { type: 'marketing', label: 'Marketing', icon: Gift },
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold mb-4">Notification Settings</h3>
          <div className="space-y-6">
            {notificationTypes.map(({ type, label, icon: Icon }) => (
              <div key={type} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <div className="grid grid-cols-3 gap-4 pl-6">
                  {notificationChannels.map(({ channel, label: channelLabel }) => {
                    const key = `${channel}_${type}` as keyof typeof formData;
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <Label htmlFor={key} className="text-sm font-normal">
                          {channelLabel}
                        </Label>
                        <Switch
                          id={key}
                          checked={formData[key] as boolean ?? false}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, [key]: checked })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-base font-semibold mb-4">Reminder Settings</h3>
          <div className="space-y-2">
            <Label htmlFor="reminder_hours_before">Remind me before appointments (hours)</Label>
            <input
              type="number"
              id="reminder_hours_before"
              min="1"
              max="72"
              value={formData.reminder_hours_before}
              onChange={(e) => 
                setFormData({ ...formData, reminder_hours_before: parseInt(e.target.value) || 24 })
              }
              className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-sm text-muted-foreground">
              How many hours before your appointment would you like to be reminded?
            </p>
          </div>
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