'use client';
import { useState } from 'react';
import { Button, Label, Switch, Toggle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Separator } from '@/components/ui';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { upsertCustomerPreferences } from '@/lib/data-access/customers/preferences';
import type { Database } from '@/types/database.types';
type CustomerPreferences = Database['public']['Tables']['customer_preferences']['Row'];
interface PreferencesFormProps {
  customerId: string;
  currentPreferences: CustomerPreferences | null;
}
const TIME_SLOTS = [
  'Early Morning (6am-9am)',
  'Morning (9am-12pm)',
  'Afternoon (12pm-3pm)',
  'Late Afternoon (3pm-6pm)',
  'Evening (6pm-9pm)',
];
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
export default function PreferencesForm({ customerId, currentPreferences }: PreferencesFormProps) {
  const [loading, setLoading] = useState(false);
  // Parse the preference value if it exists
  const parsedPreferences = currentPreferences?.preference_value 
    ? JSON.parse(currentPreferences.preference_value)
    : {};
  const [formData, setFormData] = useState({
    preferred_days: parsedPreferences.preferred_days || [],
    preferred_time_slots: parsedPreferences.preferred_time_slots || [],
    marketing_emails: parsedPreferences.marketing_emails ?? true,
    marketing_sms: parsedPreferences.marketing_sms ?? false,
    appointment_reminders: parsedPreferences.appointment_reminders ?? true,
    reminder_hours_before: parsedPreferences.reminder_hours_before || 24,
    language: parsedPreferences.language || 'en',
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Store preferences as JSON in preference_value
      await upsertCustomerPreferences(customerId, {
        preference_type: 'preferences',
        preference_value: JSON.stringify(formData)
      });
      toast.success('Preferences updated successfully');
    } catch (_error) {
      toast.error('Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };
  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_days: prev.preferred_days.includes(day)
        ? prev.preferred_days.filter((d: string) => d !== day)
        : [...prev.preferred_days, day]
    }));
  };
  const handleTimeSlotToggle = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      preferred_time_slots: prev.preferred_time_slots.includes(slot)
        ? prev.preferred_time_slots.filter((s: string) => s !== slot)
        : [...prev.preferred_time_slots, slot]
    }));
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold mb-3 block">Preferred Days</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Toggle
                key={day}
                pressed={formData.preferred_days.includes(day)}
                onPressedChange={() => handleDayToggle(day)}
                variant="outline"
                className="text-sm"
              >
                {day.substring(0, 3)}
              </Toggle>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-base font-semibold mb-3 block">Preferred Time Slots</Label>
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((slot) => (
              <Toggle
                key={slot}
                pressed={formData.preferred_time_slots.includes(slot)}
                onPressedChange={() => handleTimeSlotToggle(slot)}
                variant="outline"
                className="text-sm"
              >
                {slot}
              </Toggle>
            ))}
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Communication Preferences</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing_emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive promotional offers and news via email
              </p>
            </div>
            <Switch
              id="marketing_emails"
              checked={formData.marketing_emails}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, marketing_emails: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing_sms">SMS Marketing</Label>
              <p className="text-sm text-muted-foreground">
                Receive text message promotions
              </p>
            </div>
            <Switch
              id="marketing_sms"
              checked={formData.marketing_sms}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, marketing_sms: checked })
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="appointment_reminders">Appointment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminded about upcoming appointments
              </p>
            </div>
            <Switch
              id="appointment_reminders"
              checked={formData.appointment_reminders}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, appointment_reminders: checked })
              }
            />
          </div>
          {formData.appointment_reminders && (
            <div className="pl-4 space-y-2">
              <Label htmlFor="reminder_hours">Reminder Time</Label>
              <Select
                value={formData.reminder_hours_before.toString()}
                onValueChange={(value) => 
                  setFormData({ ...formData, reminder_hours_before: parseInt(value) })
                }
              >
                <SelectTrigger id="reminder_hours" className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour before</SelectItem>
                  <SelectItem value="2">2 hours before</SelectItem>
                  <SelectItem value="4">4 hours before</SelectItem>
                  <SelectItem value="12">12 hours before</SelectItem>
                  <SelectItem value="24">24 hours before</SelectItem>
                  <SelectItem value="48">48 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Separator />
        <div className="space-y-2">
          <Label htmlFor="language">Preferred Language</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => setFormData({ ...formData, language: value })}
          >
            <SelectTrigger id="language" className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="ja">日本語</SelectItem>
              <SelectItem value="zh">中文</SelectItem>
            </SelectContent>
          </Select>
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
            Save Preferences
          </>
        )}
      </Button>
    </form>
  );
}