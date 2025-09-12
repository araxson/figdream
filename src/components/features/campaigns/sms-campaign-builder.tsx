'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MessageSquare, Send, Save, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SMSCampaignBuilderProps {
  salonId: string
  campaign?: any
}

export function SMSCampaignBuilder({ salonId, campaign }: SMSCampaignBuilderProps) {
  const [name, setName] = useState(campaign?.name || '')
  const [message, setMessage] = useState(campaign?.message || '')
  const [template, setTemplate] = useState('custom')
  const [scheduledAt, setScheduledAt] = useState(campaign?.scheduled_at || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const smsTemplates = [
    { id: 'custom', name: 'Custom Message' },
    { id: 'reminder', name: 'Appointment Reminder' },
    { id: 'confirmation', name: 'Booking Confirmation' },
    { id: 'promotion', name: 'Special Offer' },
    { id: 'follow-up', name: 'Follow Up' },
  ]

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId)
    
    switch (templateId) {
      case 'reminder':
        setMessage('Hi {{customer_name}}, reminder: You have an appointment on {{date}} at {{time}} for {{service}}. Reply CANCEL to cancel.')
        break
      case 'confirmation':
        setMessage('Hi {{customer_name}}, your appointment is confirmed for {{date}} at {{time}}. See you at {{salon_name}}!')
        break
      case 'promotion':
        setMessage('{{customer_name}}, special offer! Get {{discount}}% off {{service}} this week only. Book now: {{link}}')
        break
      case 'follow-up':
        setMessage('Hi {{customer_name}}, thank you for visiting {{salon_name}}! We\'d love your feedback. Rate us: {{link}}')
        break
    }
  }

  const handleSave = async (status: 'draft' | 'scheduled' | 'sent') => {
    if (!name || !message) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    if (message.length > 160) {
      toast({
        title: 'Warning',
        description: `Message is ${message.length} characters. SMS will be split into multiple parts.`,
        variant: 'destructive',
      })
    }

    if (status === 'scheduled' && !scheduledAt) {
      toast({
        title: 'Error',
        description: 'Please select a schedule date and time',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        campaign ? `/api/campaigns/sms/${campaign.id}` : '/api/campaigns/sms',
        {
          method: campaign ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            salon_id: salonId,
            name,
            message,
            status,
            scheduled_at: status === 'scheduled' ? scheduledAt : null,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to save campaign')
      }

      toast({
        title: 'Success',
        description: `SMS campaign ${status === 'sent' ? 'sent' : 'saved'} successfully`,
      })

      router.push('/dashboard/campaigns')
    } catch (error) {
      console.error('Error saving campaign:', error)
      toast({
        title: 'Error',
        description: 'Failed to save campaign',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const characterCount = message.length
  const messageCount = Math.ceil(characterCount / 160)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {campaign ? 'Edit SMS Campaign' : 'Create SMS Campaign'}
        </CardTitle>
        <CardDescription>
          Create and send SMS messages to your customers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekend Promotion"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="template">Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {smsTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your SMS message here..."
              className="min-h-[120px]"
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                Variables: {`{{customer_name}}, {{date}}, {{time}}, {{service}}`}
              </span>
              <span className={characterCount > 160 ? 'text-destructive' : ''}>
                {characterCount}/160 characters ({messageCount} {messageCount === 1 ? 'message' : 'messages'})
              </span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="schedule">Schedule Send (Optional)</Label>
            <Input
              id="schedule"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">Preview</p>
          <div className="bg-background p-3 rounded border">
            <p className="text-sm whitespace-pre-wrap">
              {message
                .replace(/{{customer_name}}/g, 'John Doe')
                .replace(/{{date}}/g, 'Jan 15')
                .replace(/{{time}}/g, '2:00 PM')
                .replace(/{{service}}/g, 'Haircut')
                .replace(/{{salon_name}}/g, 'Beauty Salon')
                .replace(/{{discount}}/g, '20')
                .replace(/{{link}}/g, 'bit.ly/abc123')
                .replace(/{{[^}]+}}/g, '[value]')}
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/campaigns')}
        >
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSave('draft')}
            disabled={loading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          {scheduledAt && (
            <Button
              variant="outline"
              onClick={() => handleSave('scheduled')}
              disabled={loading}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
          )}
          <Button
            onClick={() => handleSave('sent')}
            disabled={loading}
          >
            <Send className="mr-2 h-4 w-4" />
            Send Now
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}