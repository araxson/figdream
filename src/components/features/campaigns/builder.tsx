'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Mail, MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CampaignBuilder() {
  const [campaign, setCampaign] = useState({
    name: '',
    type: 'email',
    audience: 'all',
    subject: '',
    content: '',
    scheduledFor: '',
    sendImmediately: true,
    includeUnsubscribe: true
  })
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  const handleSubmit = async () => {
    setSending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { error } = await supabase
        .from('email_campaigns')
        .insert({
          salon_id: salon.id,
          name: campaign.name,
          subject: campaign.subject,
          content: campaign.content,
          status: campaign.sendImmediately ? 'sent' : 'scheduled',
          scheduled_at: campaign.sendImmediately ? null : campaign.scheduledFor,
          sent_at: campaign.sendImmediately ? new Date().toISOString() : null,
          recipients_count: 0,
          opens_count: 0,
          clicks_count: 0
        })

      if (error) throw error

      // Reset form
      setCampaign({
        name: '',
        type: 'email',
        audience: 'all',
        subject: '',
        content: '',
        scheduledFor: '',
        sendImmediately: true,
        includeUnsubscribe: true
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error creating campaign:', error)
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                value={campaign.name}
                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                placeholder="Summer Special Offer"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Campaign Type</Label>
              <Select
                value={campaign.type}
                onValueChange={(value) => setCampaign({ ...campaign, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Select
              value={campaign.audience}
              onValueChange={(value) => setCampaign({ ...campaign, audience: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active Customers (Last 3 months)</SelectItem>
                <SelectItem value="inactive">Inactive Customers</SelectItem>
                <SelectItem value="vip">VIP Customers</SelectItem>
                <SelectItem value="new">New Customers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaign.type === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Email Subject</Label>
              <Input
                id="subject"
                value={campaign.subject}
                onChange={(e) => setCampaign({ ...campaign, subject: e.target.value })}
                placeholder="Special offer just for you!"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="content">
              {campaign.type === 'email' ? 'Email Body' : 'SMS Message'}
            </Label>
            <Textarea
              id="content"
              value={campaign.content}
              onChange={(e) => setCampaign({ ...campaign, content: e.target.value })}
              placeholder={
                campaign.type === 'email' 
                  ? "Dear [Customer Name],\n\nWe have an exclusive offer for you..."
                  : "Hi [Name]! Book your next appointment and get 20% off. Reply STOP to unsubscribe."
              }
              rows={campaign.type === 'email' ? 10 : 4}
            />
            <p className="text-sm text-muted-foreground">
              {campaign.type === 'sms' && `${campaign.content.length}/160 characters`}
            </p>
          </div>

          {campaign.type === 'email' && (
            <div className="flex items-center space-x-2">
              <Switch
                id="unsubscribe"
                checked={campaign.includeUnsubscribe}
                onCheckedChange={(checked) => 
                  setCampaign({ ...campaign, includeUnsubscribe: checked })
                }
              />
              <Label htmlFor="unsubscribe">Include unsubscribe link</Label>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="immediate"
              checked={campaign.sendImmediately}
              onCheckedChange={(checked) => 
                setCampaign({ ...campaign, sendImmediately: checked })
              }
            />
            <Label htmlFor="immediate">Send immediately</Label>
          </div>

          {!campaign.sendImmediately && (
            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule for</Label>
              <Input
                id="schedule"
                type="datetime-local"
                value={campaign.scheduledFor}
                onChange={(e) => setCampaign({ ...campaign, scheduledFor: e.target.value })}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={handleSubmit} 
              disabled={sending || !campaign.name || !campaign.content}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : campaign.sendImmediately ? 'Send Campaign' : 'Schedule Campaign'}
            </Button>
            <Button variant="outline">
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}