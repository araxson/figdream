'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function SecuritySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Authentication and security configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="2fa">Two-Factor Authentication</Label>
              <Switch id="2fa" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email-verification">Email Verification Required</Label>
              <Switch id="email-verification" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="captcha">Enable CAPTCHA</Label>
              <Switch id="captcha" defaultChecked />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input id="session-timeout" type="number" defaultValue="60" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="max-attempts">Max Login Attempts</Label>
            <Input id="max-attempts" type="number" defaultValue="5" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="lockout-duration">Lockout Duration (minutes)</Label>
            <Input id="lockout-duration" type="number" defaultValue="30" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password-policy">Password Policy</Label>
            <Select defaultValue="strong">
              <SelectTrigger id="password-policy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                <SelectItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password-expiry">Password Expiry (days)</Label>
            <Input id="password-expiry" type="number" defaultValue="90" />
          </div>
        </div>
        
        <Button>Save Security Settings</Button>
      </CardContent>
    </Card>
  )
}