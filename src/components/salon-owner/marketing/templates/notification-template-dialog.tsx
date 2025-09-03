'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Badge,
} from '@/components/ui'
import { Plus, Save, Mail, MessageCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  notification_type: z.enum(['appointment', 'customer', 'marketing', 'system']),
  channel: z.enum(['email', 'sms', 'both']),
  subject: z.string().optional(),
  body: z.string().min(10, 'Template body is required'),
  sms_body: z.string().optional(),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean(),
})
type TemplateFormData = z.infer<typeof templateSchema>
interface NotificationTemplateDialogProps {
  salonId: string
  template?: Database['public']['Tables']['notification_templates']['Row']
  trigger?: React.ReactNode
}
export function NotificationTemplateDialog({ 
  salonId, 
  template,
  trigger
}: NotificationTemplateDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: template ? {
      name: template.name,
      notification_type: template.notification_type,
      channel: template.channel,
      subject: template.subject || '',
      body: template.body,
      sms_body: template.sms_body || '',
      variables: template.variables || [],
      is_active: template.is_active,
    } : {
      name: '',
      notification_type: 'appointment',
      channel: 'email',
      subject: '',
      body: '',
      sms_body: '',
      variables: [],
      is_active: true,
    }
  })
  const availableVariables = [
    '{{customer_name}}',
    '{{salon_name}}',
    '{{appointment_date}}',
    '{{appointment_time}}',
    '{{service_name}}',
    '{{staff_name}}',
    '{{location_address}}',
    '{{total_amount}}',
    '{{cancellation_link}}',
    '{{review_link}}',
    '{{booking_link}}',
  ]
  const handleSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      // Extract variables from content
      const emailVariables = data.body.match(/\{\{(\w+)\}\}/g) || []
      const smsVariables = data.channel === 'both' && data.sms_body 
        ? data.sms_body.match(/\{\{(\w+)\}\}/g) || []
        : []
      const allVariables = [...new Set([...emailVariables, ...smsVariables])]
        .map(v => v.replace(/\{\{|\}\}/g, ''))
      const templateData = {
        salon_id: salonId,
        name: data.name,
        notification_type: data.notification_type,
        channel: data.channel === 'both' ? 'email' : data.channel,
        subject: data.channel !== 'sms' ? data.subject : null,
        body: data.body,
        variables: allVariables,
        is_active: data.is_active,
      }
      if (template) {
        // Update existing template
        const { error } = await supabase
          .from('notification_templates')
          .update(templateData)
          .eq('id', template.id)
        if (error) throw error
        // If channel is 'both', create/update SMS version
        if (data.channel === 'both' && data.sms_body) {
          const smsTemplateData = {
            ...templateData,
            channel: 'sms',
            subject: null,
            body: data.sms_body,
          }
          await supabase
            .from('notification_templates')
            .upsert(smsTemplateData, {
              onConflict: 'salon_id,name,channel'
            })
        }
        toast.success('Template updated successfully')
      } else {
        // Create new template(s)
        if (data.channel === 'both') {
          // Create both email and SMS templates
          const { error: emailError } = await supabase
            .from('notification_templates')
            .insert(templateData)
          if (emailError) throw emailError
          const smsTemplateData = {
            ...templateData,
            channel: 'sms',
            subject: null,
            body: data.sms_body || data.body,
          }
          const { error: smsError } = await supabase
            .from('notification_templates')
            .insert(smsTemplateData)
          if (smsError) throw smsError
        } else {
          // Create single template
          const { error } = await supabase
            .from('notification_templates')
            .insert(templateData)
          if (error) throw error
        }
        toast.success('Template created successfully')
      }
      setOpen(false)
      form.reset()
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save template')
    } finally {
      setIsSubmitting(false)
    }
  }
  const insertVariable = (variable: string) => {
    const currentBody = form.getValues('body')
    form.setValue('body', currentBody + ' ' + variable)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? 'Edit Template' : 'Create Notification Template'}
          </DialogTitle>
          <DialogDescription>
            Create customizable templates for automated notifications
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Appointment Confirmation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notification_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="appointment">Appointment</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">
                        <span className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Only
                        </span>
                      </SelectItem>
                      <SelectItem value="sms">
                        <span className="flex items-center gap-2">
                          <MessageCircle className="h-4 w-4" />
                          SMS Only
                        </span>
                      </SelectItem>
                      <SelectItem value="both">
                        Both Email & SMS
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('channel') !== 'sms' && (
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Your appointment is confirmed!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch('channel') === 'sms' ? 'SMS Message' : 'Email Body'}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your template content..."
                      className="min-h-[200px] font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Available variables:
                    <div className="flex flex-wrap gap-1 mt-2">
                      {availableVariables.map((variable) => (
                        <Badge
                          key={variable}
                          variant="secondary"
                          className="cursor-pointer text-xs"
                          onClick={() => insertVariable(variable)}
                        >
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('channel') === 'both' && (
              <FormField
                control={form.control}
                name="sms_body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMS Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter SMS version (160 characters recommended)..."
                        className="min-h-[100px] font-mono text-sm"
                        maxLength={320}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Character count: {field.value?.length || 0}/320
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable this template for automatic notifications
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false)
                  form.reset()
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {template ? 'Update' : 'Create'} Template
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}