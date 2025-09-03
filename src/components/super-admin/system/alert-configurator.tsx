'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/data-display/card'
import { Button } from '@/components/ui/form/button'
import { Switch } from '@/components/ui/form/switch'
import { Label } from '@/components/ui/form/label'

export interface AlertConfiguratorProps {
  systemId?: string
}

export function AlertConfigurator({ }: AlertConfiguratorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alert Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="email-alerts">Email Alerts</Label>
          <Switch id="email-alerts" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="sms-alerts">SMS Alerts</Label>
          <Switch id="sms-alerts" />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="push-alerts">Push Notifications</Label>
          <Switch id="push-alerts" />
        </div>
        <Button className="w-full">Save Configuration</Button>
      </CardContent>
    </Card>
  )
}
