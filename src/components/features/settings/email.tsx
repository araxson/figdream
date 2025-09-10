'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function EmailSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>Configure email service and templates</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email-provider">Email Provider</Label>
            <Select defaultValue="sendgrid">
              <SelectTrigger id="email-provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="ses">Amazon SES</SelectItem>
                <SelectItem value="postmark">Postmark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input id="api-key" type="password" placeholder="Enter API key" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="from-email">From Email</Label>
            <Input id="from-email" type="email" defaultValue="noreply@figdream.com" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="from-name">From Name</Label>
            <Input id="from-name" defaultValue="FigDream" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="reply-to">Reply-To Email</Label>
            <Input id="reply-to" type="email" defaultValue="support@figdream.com" />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="daily-limit">Daily Email Limit</Label>
            <Input id="daily-limit" type="number" defaultValue="10000" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline">Test Connection</Button>
          <Button>Save Email Settings</Button>
        </div>
      </CardContent>
    </Card>
  )
}