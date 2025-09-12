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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Send, Save, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface EmailCampaignBuilderProps {
  salonId: string
  campaign?: any
}

export function EmailCampaignBuilder({ salonId, campaign }: EmailCampaignBuilderProps) {
  const [name, setName] = useState(campaign?.name || '')
  const [subject, setSubject] = useState(campaign?.subject || '')
  const [content, setContent] = useState(campaign?.content || '')
  const [template, setTemplate] = useState(campaign?.template_id || 'custom')
  const [scheduledAt, setScheduledAt] = useState(campaign?.scheduled_at || '')
  const [loading, setLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const emailTemplates = [
    { id: 'custom', name: 'Custom Email' },
    { id: 'welcome', name: 'Welcome Email' },
    { id: 'promotion', name: 'Promotion Announcement' },
    { id: 'reminder', name: 'Appointment Reminder' },
    { id: 'birthday', name: 'Birthday Wishes' },
    { id: 'newsletter', name: 'Monthly Newsletter' },
  ]

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId)
    
    // Load template content
    switch (templateId) {
      case 'welcome':
        setSubject('Welcome to {{salon_name}}!')
        setContent(`Dear {{customer_name}},\n\nWelcome to our salon! We're thrilled to have you as part of our community.\n\nAs a new member, enjoy 20% off your first appointment.\n\nBook now: {{booking_link}}\n\nBest regards,\n{{salon_name}} Team`)
        break
      case 'promotion':
        setSubject('Special Offer Just for You!')
        setContent(`Hi {{customer_name}},\n\nWe have an exclusive offer for you!\n\n** {{promotion_details}} **\n\nOffer valid until {{expiry_date}}.\n\nBook your appointment: {{booking_link}}\n\nSee you soon!\n{{salon_name}}`)
        break
      case 'reminder':
        setSubject('Appointment Reminder')
        setContent(`Hi {{customer_name}},\n\nThis is a friendly reminder about your upcoming appointment:\n\n• Date: {{appointment_date}}\n• Time: {{appointment_time}}\n• Service: {{service_name}}\n• With: {{staff_name}}\n\nIf you need to reschedule, please let us know.\n\nSee you soon!\n{{salon_name}}`)
        break
      case 'birthday':
        setSubject('Happy Birthday from {{salon_name}}!')
        setContent(`Dear {{customer_name}},\n\n** Happy Birthday! **\n\nTo celebrate your special day, we're offering you a special birthday discount:\n\n[Special Offer] {{birthday_offer}}\n\nTreat yourself: {{booking_link}}\n\nWishing you a wonderful year ahead!\n{{salon_name}} Team`)
        break
      case 'newsletter':
        setSubject('{{salon_name}} Monthly Newsletter')
        setContent(`Hi {{customer_name}},\n\nHere's what's new this month at {{salon_name}}:\n\n[News & Updates]\n{{news_content}}\n\n[Featured Services]\n{{featured_services}}\n\n[Staff Spotlight]\n{{staff_spotlight}}\n\n[Upcoming Events]\n{{upcoming_events}}\n\nBook your next appointment: {{booking_link}}\n\nStay beautiful!\n{{salon_name}} Team`)
        break
    }
  }

  const handleSave = async (status: 'draft' | 'scheduled' | 'sent') => {
    if (!name || !subject || !content) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
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
        campaign ? `/api/campaigns/email/${campaign.id}` : '/api/campaigns/email',
        {
          method: campaign ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            salon_id: salonId,
            name,
            subject,
            content,
            template_id: template !== 'custom' ? template : null,
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
        description: `Campaign ${status === 'sent' ? 'sent' : 'saved'} successfully`,
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

  const renderPreview = () => {
    // Replace variables with sample data
    let previewContent = content
      .replace(/{{customer_name}}/g, 'John Doe')
      .replace(/{{salon_name}}/g, 'Beauty Salon')
      .replace(/{{booking_link}}/g, 'https://example.com/book')
      .replace(/{{appointment_date}}/g, 'January 15, 2024')
      .replace(/{{appointment_time}}/g, '2:00 PM')
      .replace(/{{service_name}}/g, 'Haircut & Style')
      .replace(/{{staff_name}}/g, 'Jane Smith')
      .replace(/{{promotion_details}}/g, '30% off all services')
      .replace(/{{expiry_date}}/g, 'January 31, 2024')
      .replace(/{{birthday_offer}}/g, '25% off any service')
      .replace(/{{[^}]+}}/g, '[Content]')

    return (
      <div className="bg-white p-6 rounded-lg border">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Subject:</p>
          <p className="font-semibold">{subject.replace(/{{salon_name}}/g, 'Beauty Salon')}</p>
        </div>
        <div className="prose prose-sm max-w-none">
          <pre className="whitespace-pre-wrap font-sans">{previewContent}</pre>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {campaign ? 'Edit Email Campaign' : 'Create Email Campaign'}
        </CardTitle>
        <CardDescription>
          Build and customize your email campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., January Newsletter"
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
                    {emailTemplates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use variables like {`{{customer_name}}`} to personalize
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your email content here..."
                  className="min-h-[300px]"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Available variables: {`{{customer_name}}, {{salon_name}}, {{booking_link}}`}
                </p>
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
          </TabsContent>
          
          <TabsContent value="preview">
            {renderPreview()}
          </TabsContent>
        </Tabs>
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