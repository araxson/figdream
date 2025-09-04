'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Save } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
import type { Database } from '@/types/database.types'
type SystemConfiguration = Database['public']['Tables']['system_configurations']['Row']
interface SystemSettingsFormProps {
  configurations: SystemConfiguration[]
}
export function SystemSettingsForm({ configurations: _configurations }: SystemSettingsFormProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_name: 'FigDream',
    site_url: 'https://figdream.com',
    support_email: 'support@figdream.com',
    default_timezone: 'America/New_York',
    default_currency: 'USD',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    week_starts_on: 'sunday',
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    appointment_buffer_time: '15',
    max_advance_booking_days: '90',
    cancellation_hours_notice: '24',
    enable_waitlist: true,
    enable_reviews: true,
    enable_loyalty_program: true,
  })
  const handleSave = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      // Update each configuration
      for (const [key, value] of Object.entries(settings)) {
        const { error } = await supabase
          .from('system_configurations')
          .upsert({
            key,
            value: value.toString(),
            category: 'general',
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'key'
          })
        if (error) throw error
      }
      toast.success('System settings updated successfully')
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save system settings')
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="site_name">Site Name</Label>
          <Input
            id="site_name"
            value={settings.site_name}
            onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="site_url">Site URL</Label>
          <Input
            id="site_url"
            type="url"
            value={settings.site_url}
            onChange={(e) => setSettings({ ...settings, site_url: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="support_email">Support Email</Label>
          <Input
            id="support_email"
            type="email"
            value={settings.support_email}
            onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="default_timezone">Default Timezone</Label>
          <Select
            value={settings.default_timezone}
            onValueChange={(value) => setSettings({ ...settings, default_timezone: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="default_currency">Default Currency</Label>
          <Select
            value={settings.default_currency}
            onValueChange={(value) => setSettings({ ...settings, default_currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="CAD">CAD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date_format">Date Format</Label>
          <Select
            value={settings.date_format}
            onValueChange={(value) => setSettings({ ...settings, date_format: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="time_format">Time Format</Label>
          <Select
            value={settings.time_format}
            onValueChange={(value) => setSettings({ ...settings, time_format: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12 Hour</SelectItem>
              <SelectItem value="24h">24 Hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="week_starts_on">Week Starts On</Label>
          <Select
            value={settings.week_starts_on}
            onValueChange={(value) => setSettings({ ...settings, week_starts_on: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sunday">Sunday</SelectItem>
              <SelectItem value="monday">Monday</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium">Booking Settings</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="appointment_buffer_time">Buffer Time (minutes)</Label>
            <Input
              id="appointment_buffer_time"
              type="number"
              value={settings.appointment_buffer_time}
              onChange={(e) => setSettings({ ...settings, appointment_buffer_time: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="max_advance_booking_days">Max Advance Booking (days)</Label>
            <Input
              id="max_advance_booking_days"
              type="number"
              value={settings.max_advance_booking_days}
              onChange={(e) => setSettings({ ...settings, max_advance_booking_days: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="cancellation_hours_notice">Cancellation Notice (hours)</Label>
            <Input
              id="cancellation_hours_notice"
              type="number"
              value={settings.cancellation_hours_notice}
              onChange={(e) => setSettings({ ...settings, cancellation_hours_notice: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="font-medium">Feature Toggles</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable_waitlist">Enable Waitlist</Label>
            <Switch
              id="enable_waitlist"
              checked={settings.enable_waitlist}
              onCheckedChange={(checked) => setSettings({ ...settings, enable_waitlist: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enable_reviews">Enable Reviews</Label>
            <Switch
              id="enable_reviews"
              checked={settings.enable_reviews}
              onCheckedChange={(checked) => setSettings({ ...settings, enable_reviews: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="enable_loyalty_program">Enable Loyalty Program</Label>
            <Switch
              id="enable_loyalty_program"
              checked={settings.enable_loyalty_program}
              onCheckedChange={(checked) => setSettings({ ...settings, enable_loyalty_program: checked })}
            />
          </div>
        </div>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </>
        )}
      </Button>
    </div>
  )
}