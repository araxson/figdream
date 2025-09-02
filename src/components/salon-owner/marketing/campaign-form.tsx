'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format, addDays } from 'date-fns'
import { 
  Calendar,
  Clock,
  Eye,
  Save,
  Send,
  Mail,
  MessageSquare,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  Palette,
  Target,
  Settings
} from 'lucide-react'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Switch,
  Checkbox,
  Badge,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar as CalendarComponent,
  Alert,
  AlertDescription,
  Progress,
  Separator
} from '@/components/ui'
import { cn } from '@/lib/utils'

import { 
  createCampaignSchema, 
  updateCampaignSchema,
  type CreateCampaignInput,
  type UpdateCampaignInput,
  campaignTypes,
  campaignStatuses
} from '@/lib/validations/marketing-schema'
import type { Database } from '@/types/database.types'

type Campaign = Database['public']['Tables']['marketing_campaigns']['Row']
type EmailTemplate = Database['public']['Tables']['email_templates']['Row']
type SmsTemplate = Database['public']['Tables']['sms_templates']['Row']
// Note: customer_segments table does not exist in database
// Using a temporary type definition until table is implemented
interface Segment {
  id: string
  salon_id: string
  name: string
  description?: string
  conditions: any
  member_count?: number
  created_at: string
  updated_at: string
}

export interface CampaignFormProps {
  campaign?: Campaign
  emailTemplates: EmailTemplate[]
  smsTemplates: SmsTemplate[]
  segments: Segment[]
  salonId: string
  locationIds?: string[]
  onSubmit: (data: CreateCampaignInput | UpdateCampaignInput) => Promise<void>
  onCancel?: () => void
  onPreview?: (data: CreateCampaignInput | UpdateCampaignInput) => void
  className?: string
  isSubmitting?: boolean
}

const campaignTypeInfo = {
  email: {
    icon: Mail,
    label: 'Email Campaign',
    description: 'Send rich HTML emails to your customers',
    maxContentLength: 10000,
  },
  sms: {
    icon: MessageSquare,
    label: 'SMS Campaign',
    description: 'Send text messages directly to customer phones',
    maxContentLength: 1600,
  },
  push: {
    icon: Users,
    label: 'Push Notification',
    description: 'Send push notifications to mobile app users',
    maxContentLength: 160,
  },
  in_app: {
    icon: Users,
    label: 'In-App Message',
    description: 'Display messages within your mobile app',
    maxContentLength: 500,
  },
}

// Rich text editor placeholder component
const RichTextEditor: React.FC<{
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  maxLength?: number
}> = ({ value, onChange, placeholder, disabled, maxLength }) => {
  const [characterCount, setCharacterCount] = React.useState(value?.length || 0)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    if (maxLength && newValue.length > maxLength) {
      return
    }
    setCharacterCount(newValue.length)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="min-h-40"
      />
      {maxLength && (
        <div className="flex justify-between items-center text-sm">
          <div className="text-muted-foreground">
            Rich text editor placeholder (HTML supported)
          </div>
          <div className={cn(
            "text-muted-foreground",
            characterCount > maxLength * 0.9 && "text-yellow-600",
            characterCount === maxLength && "text-red-600"
          )}>
            {characterCount} / {maxLength}
          </div>
        </div>
      )}
    </div>
  )
}

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
  const watchedContent = form.watch('content')

  const typeInfo = campaignTypeInfo[watchedType]

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
    } catch (error) {
      console.error('Error submitting campaign:', error)
    }
  }

  const handlePreview = () => {
    const data = form.getValues()
    onPreview?.(data)
  }

  const getAvailableTemplates = () => {
    return watchedType === 'email' ? emailTemplates : smsTemplates
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Campaign Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Campaign Name *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter campaign name..."
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description of the campaign..."
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Optional description to help organize your campaigns
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Type *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isEditing || isSubmitting}
                      className="grid grid-cols-1 gap-4"
                    >
                      {campaignTypes.map((type) => {
                        const Icon = campaignTypeInfo[type].icon
                        const info = campaignTypeInfo[type]
                        return (
                          <div key={type} className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50">
                            <RadioGroupItem
                              value={type}
                              id={`type-${type}`}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`type-${type}`}
                                className="flex items-center gap-2 cursor-pointer font-medium"
                              >
                                <Icon className="h-4 w-4" />
                                <span>{info.label}</span>
                              </label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {info.description}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormDescription>
                    Select the delivery method for your campaign
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {campaignStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          <span className="capitalize">{status}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Alert>
            <typeInfo.icon className="h-4 w-4" />
            <AlertDescription>
              <strong>{typeInfo.label}:</strong> {typeInfo.description}
              <br />
              Maximum content length: {typeInfo.maxContentLength.toLocaleString()} characters
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Template Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Choose a template (optional)</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                {getAvailableTemplates().map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                    <Badge variant="secondary" className="ml-2">
                      {template.category}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Selecting a template will populate the content fields below
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => (
    <div className="space-y-6">
      {watchedType === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject Line *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter email subject..."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preview_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preview Text</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Text that appears in email previews..."
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    This text appears in email client previews
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="from_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your Salon Name"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="from_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email"
                        placeholder="noreply@yoursalon.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reply_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply To Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="hello@yoursalon.com"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Where replies to this email will be sent
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {watchedType === 'email' ? 'Email Content' : 'Message Content'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content *</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={
                      watchedType === 'email' 
                        ? "Enter your email content (HTML supported)..."
                        : "Enter your message content..."
                    }
                    disabled={isSubmitting}
                    maxLength={typeInfo.maxContentLength}
                  />
                </FormControl>
                {watchedType === 'sms' && (
                  <FormDescription>
                    SMS messages are limited to {typeInfo.maxContentLength} characters. 
                    Messages longer than 160 characters will be split into multiple messages.
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )

  const renderAudience = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Target Audience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="segment_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer Segment</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a segment..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">All Customers</SelectItem>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{segment.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {segment.member_count || 0} members
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose a specific customer segment or send to all customers
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {locationIds.length > 1 && (
          <FormField
            control={form.control}
            name="location_ids"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Locations</FormLabel>
                <FormDescription>
                  Select specific locations or leave empty to target all locations
                </FormDescription>
                <div className="space-y-2">
                  {locationIds.map((locationId) => (
                    <div key={locationId} className="flex items-center space-x-2">
                      <Checkbox
                        id={locationId}
                        checked={field.value?.includes(locationId) || false}
                        onCheckedChange={(checked) => {
                          const current = field.value || []
                          if (checked) {
                            field.onChange([...current, locationId])
                          } else {
                            field.onChange(current.filter(id => id !== locationId))
                          }
                        }}
                      />
                      <Label htmlFor={locationId}>
                        Location {locationId.slice(-8)}
                      </Label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            {form.watch('segment_id') 
              ? `Sending to ${segments.find(s => s.id === form.watch('segment_id'))?.member_count || 0} customers`
              : 'Sending to all customers'
            }
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )

  const renderScheduling = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduling
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={watchedStatus === 'scheduled'}
            onCheckedChange={(checked) => {
              form.setValue('status', checked ? 'scheduled' : 'draft')
            }}
          />
          <Label>Schedule for later</Label>
        </div>

        {watchedStatus === 'scheduled' && (
          <div className="space-y-4">
            <Label>Schedule Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !scheduledDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={scheduledDate}
                  onSelect={handleScheduledDateChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {scheduledDate && (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  onChange={(e) => {
                    if (scheduledDate && e.target.value) {
                      const [hours, minutes] = e.target.value.split(':')
                      const newDate = new Date(scheduledDate)
                      newDate.setHours(parseInt(hours), parseInt(minutes))
                      handleScheduledDateChange(newDate)
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tomorrow = addDays(new Date(), 1)
                    tomorrow.setHours(9, 0, 0, 0)
                    handleScheduledDateChange(tomorrow)
                  }}
                >
                  Tomorrow 9 AM
                </Button>
              </div>
            )}

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Campaign will be automatically sent at the scheduled time
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )

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
              {renderBasicInfo()}
            </TabsContent>

            <TabsContent value="content">
              {renderContent()}
            </TabsContent>

            <TabsContent value="audience">
              {renderAudience()}
            </TabsContent>

            <TabsContent value="schedule">
              {renderScheduling()}
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