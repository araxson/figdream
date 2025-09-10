'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export function GeneralSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Platform name, description, and basic configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="platform-name">Platform Name</Label>
            <Input id="platform-name" defaultValue="FigDream" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="platform-url">Platform URL</Label>
            <Input id="platform-url" defaultValue="https://figdream.com" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="support-email">Support Email</Label>
            <Input id="support-email" type="email" defaultValue="support@figdream.com" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="platform-description">Platform Description</Label>
            <Textarea 
              id="platform-description" 
              defaultValue="Professional salon booking and management platform"
              rows={3}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance">Maintenance Mode</Label>
              <Switch id="maintenance" />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="registrations">Allow New Registrations</Label>
              <Switch id="registrations" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="booking">Allow Online Booking</Label>
              <Switch id="booking" defaultChecked />
            </div>
          </div>
        </div>
        
        <Button>Save Changes</Button>
      </CardContent>
    </Card>
  )
}