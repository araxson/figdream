'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Save } from 'lucide-react'
import { useState } from 'react'

interface ScheduleSettings {
  allowBookingAdvance: number
  autoConfirm: boolean
  bufferTime: number
  workingDays: string[]
  timezone: string
}

export function ScheduleSettings() {
  const [settings, setSettings] = useState<ScheduleSettings>({
    allowBookingAdvance: 30,
    autoConfirm: false,
    bufferTime: 15,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timezone: 'America/New_York'
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save schedule settings
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Schedule Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="advance">Allow booking up to (days in advance)</Label>
            <Input
              id="advance"
              type="number"
              value={settings.allowBookingAdvance}
              onChange={(e) => setSettings({
                ...settings,
                allowBookingAdvance: parseInt(e.target.value) || 0
              })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-confirm appointments</Label>
              <p className="text-sm text-muted-foreground">
                Automatically confirm new appointment requests
              </p>
            </div>
            <Switch
              checked={settings.autoConfirm}
              onCheckedChange={(checked) => setSettings({
                ...settings,
                autoConfirm: checked
              })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="buffer">Buffer time between appointments (minutes)</Label>
            <Select
              value={settings.bufferTime.toString()}
              onValueChange={(value) => setSettings({
                ...settings,
                bufferTime: parseInt(value)
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No buffer</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Timezone</Label>
            <Select
              value={settings.timezone}
              onValueChange={(value) => setSettings({
                ...settings,
                timezone: value
              })}
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

          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}