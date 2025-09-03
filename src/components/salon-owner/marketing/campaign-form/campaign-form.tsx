'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { 
  Calendar,
  Eye,
  Save,
  Send,
  Loader2,
  FileText,
  Palette,
  Target
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Form,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { cn } from '@/lib/utils'
import { 
  createCampaignSchema, 
  updateCampaignSchema,
  type CreateCampaignInput,
  type UpdateCampaignInput
} from '@/lib/validations/marketing-schema'
import type { CampaignFormProps } from './campaign-form.types'
import { CampaignFormBasic } from './campaign-form-basic'
import { CampaignFormContent } from './campaign-form-content'
import { CampaignFormAudience } from './campaign-form-audience'
import { CampaignFormSchedule } from './campaign-form-schedule'

export function CampaignForm({
  campaign,
  emailTemplates,
  smsTemplates,
  segments,
  salonId,
  locationIds = [],
  onSubmit,
  onCancel,
  onPreview,
  className,
  isSubmitting = false,
}: CampaignFormProps) {
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>('')
  const [scheduledDate, setScheduledDate] = React.useState<Date>()
  const [activeTab, setActiveTab] = React.useState('basic')
  
  const isEditing = !!campaign

  const form = useForm<CreateCampaignInput | UpdateCampaignInput>({
    resolver: zodResolver(isEditing ? updateCampaignSchema : createCampaignSchema),
    defaultValues: {
      ...(isEditing && { id: campaign.id }),
      name: campaign?.name || '',
      description: campaign?.description || '',
      type: campaign?.type || 'email',
      status: campaign?.status || 'draft',
      salon_id: campaign?.salon_id || salonId,
      location_ids: campaign?.location_ids || locationIds,
      subject: campaign?.subject || '',
      content: campaign?.content || '',
      preview_text: campaign?.preview_text || '',
      from_name: campaign?.from_name || '',
      from_email: campaign?.from_email || '',
      reply_to: campaign?.reply_to || '',
      scheduled_at: campaign?.scheduled_at || undefined,
      segment_id: campaign?.segment_id || undefined,
      tags: campaign?.tags || [],
      metadata: campaign?.metadata || {},
    },
  })

  const watchedType = form.watch('type')
  const watchedStatus = form.watch('status')

  React.useEffect(() => {
    if (campaign?.scheduled_at) {
      setScheduledDate(new Date(campaign.scheduled_at))
    }
  }, [campaign])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    
    if (watchedType === 'email') {
      const template = emailTemplates.find(t => t.id === templateId)
      if (template) {
        form.setValue('subject', template.subject)
        form.setValue('content', template.html_content)
      }
    } else if (watchedType === 'sms') {
      const template = smsTemplates.find(t => t.id === templateId)
      if (template) {
        form.setValue('content', template.content)
      }
    }
  }

  const handleScheduledDateChange = (date: Date | undefined) => {
    setScheduledDate(date)
    if (date) {
      form.setValue('scheduled_at', date.toISOString())
    } else {
      form.setValue('scheduled_at', undefined)
    }
  }

  const handleFormSubmit = async (data: CreateCampaignInput | UpdateCampaignInput) => {
    try {
      await onSubmit(data)
    } catch (_error) {
      // Error handled by parent component
    }
  }

  const handlePreview = () => {
    const data = form.getValues()
    onPreview?.(data)
  }

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Edit Campaign' : 'Create Campaign'}
          </h2>
          <p className="text-muted-foreground">
            {isEditing 
              ? `Edit "${campaign?.name}" campaign`
              : 'Create a new marketing campaign to engage your customers'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={isSubmitting}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Basic</span>
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              <TabsTrigger value="audience" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Audience</span>
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <CampaignFormBasic
                form={form}
                isEditing={isEditing}
                isSubmitting={isSubmitting}
                emailTemplates={emailTemplates}
                smsTemplates={smsTemplates}
                selectedTemplate={selectedTemplate}
                onTemplateSelect={handleTemplateSelect}
              />
            </TabsContent>

            <TabsContent value="content">
              <CampaignFormContent
                form={form}
                isSubmitting={isSubmitting}
              />
            </TabsContent>

            <TabsContent value="audience">
              <CampaignFormAudience
                form={form}
                segments={segments}
                locationIds={locationIds}
              />
            </TabsContent>

            <TabsContent value="schedule">
              <CampaignFormSchedule
                form={form}
                scheduledDate={scheduledDate}
                onScheduledDateChange={handleScheduledDateChange}
              />
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2">
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-32"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? 'Update Campaign' : 'Save Campaign'}
                      </>
                    )}
                  </Button>
                  {watchedStatus === 'draft' && (
                    <Button
                      type="button"
                      onClick={() => {
                        form.setValue('status', 'active')
                        form.handleSubmit(handleFormSubmit)()
                      }}
                      disabled={isSubmitting}
                      className="min-w-32"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send Now
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}