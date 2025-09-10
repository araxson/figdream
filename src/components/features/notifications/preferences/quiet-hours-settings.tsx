'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Moon } from 'lucide-react'

interface QuietHoursSettings {
  enabled: boolean
  start: string
  end: string
}

interface QuietHoursSettingsProps {
  settings: QuietHoursSettings
  onSettingsChange: (settings: QuietHoursSettings) => void
}

export function QuietHoursSettings({ settings, onSettingsChange }: QuietHoursSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5" />
          <CardTitle>Quiet Hours</CardTitle>
        </div>
        <CardDescription>
          Pause non-urgent notifications during specific hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="quiet-hours"
            checked={settings.enabled}
            onCheckedChange={(enabled) => 
              onSettingsChange({ ...settings, enabled })
            }
          />
          <Label htmlFor="quiet-hours">Enable quiet hours</Label>
        </div>
        
        {settings.enabled && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">Start time</Label>
              <Input
                id="quiet-start"
                type="time"
                value={settings.start}
                onChange={(e) => 
                  onSettingsChange({ ...settings, start: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quiet-end">End time</Label>
              <Input
                id="quiet-end"
                type="time"
                value={settings.end}
                onChange={(e) => 
                  onSettingsChange({ ...settings, end: e.target.value })
                }
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}