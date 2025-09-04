'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus, Edit, Copy, Mail, MessageCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/database/supabase/client'
const templateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  type: z.enum(['email', 'sms']),
  subject: z.string().optional(),
  content: z.string().min(10, 'Template content is required'),
  variables: z.array(z.string()).optional(),
  is_active: z.boolean(),
})
type TemplateFormData = z.infer<typeof templateSchema>
interface ReviewRequestTemplatesProps {
  salonId: string
}
// Default templates
const defaultTemplates = [
  {
    name: 'Standard Email Request',
    type: 'email' as const,
    subject: 'We&apos;d love your feedback on your recent visit!',
    content: `Hi {{customer_name}},
Thank you for visiting {{salon_name}} on {{appointment_date}}. We hope you enjoyed your {{service_name}} service!
Your feedback helps us improve our services and ensure every visit exceeds your expectations. Would you mind taking a moment to share your experience?
[Leave a Review Button]
Thank you for being a valued customer!
Best regards,
{{salon_name}} Team`,
    variables: ['customer_name', 'salon_name', 'appointment_date', 'service_name'],
  },
  {
    name: 'SMS Quick Request',
    type: 'sms' as const,
    content: `Hi {{customer_name}}! Thanks for visiting {{salon_name}}. We&apos;d love to hear about your experience! Leave a review: {{review_link}}`,
    variables: ['customer_name', 'salon_name', 'review_link'],
  },
  {
    name: 'Follow-up Reminder',
    type: 'email' as const,
    subject: 'A quick reminder about your review',
    content: `Hi {{customer_name}},
We noticed you haven&apos;t had a chance to leave a review for your recent visit to {{salon_name}}. Your feedback is incredibly valuable to us!
It only takes a minute, and your honest review helps other customers and helps us improve.
[Leave a Review Button]
Thank you!
{{salon_name}}`,
    variables: ['customer_name', 'salon_name'],
  },
]
export function ReviewRequestTemplates({ salonId }: ReviewRequestTemplatesProps) {
  const router = useRouter()
  const [templates, _setTemplates] = useState(defaultTemplates)
  const [open, setOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<{ name: string; subject: string; content: string; channel: string; } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: '',
      type: 'email',
      subject: '',
      content: '',
      variables: [],
      is_active: true,
    }
  })
  const handleSubmit = async (data: TemplateFormData) => {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      // Extract variables from content
      const variableMatches = data.content.match(/\{\{(\w+)\}\}/g) || []
      const variables = variableMatches.map(v => v.replace(/\{\{|\}\}/g, ''))
      const templateData = {
        salon_id: salonId,
        ...data,
        variables,
      }
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('review_request_templates')
          .update(templateData)
          .eq('id', editingTemplate.id)
        if (error) throw error
        toast.success('Template updated successfully')
      } else {
        // Create new template
        const { error } = await supabase
          .from('review_request_templates')
          .insert(templateData)
        if (error) throw error
        toast.success('Template created successfully')
      }
      setOpen(false)
      setEditingTemplate(null)
      form.reset()
      router.refresh()
    } catch (_error) {
      toast.error('Failed to save template')
    } finally {
      setIsSubmitting(false)
    }
  }
  const handleEdit = (template: { name: string; subject: string; content: string; channel: string; }) => {
    setEditingTemplate(template)
    form.reset({
      name: template.name,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables || [],
      is_active: template.is_active !== false,
    })
    setOpen(true)
  }
  const handleDuplicate = (template: { name: string; subject: string; content: string; channel: string; }) => {
    form.reset({
      name: `${template.name} (Copy)`,
      type: template.type,
      subject: template.subject || '',
      content: template.content,
      variables: template.variables || [],
      is_active: true,
    })
    setEditingTemplate(null)
    setOpen(true)
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Review Request Templates</CardTitle>
              <CardDescription>
                Customize messages for review requests and reminders
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Edit Template' : 'Create Template'}
                  </DialogTitle>
                  <DialogDescription>
                    Create a template for review request messages
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Standard Email Request" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">
                                <span className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Email
                                </span>
                              </SelectItem>
                              <SelectItem value="sms">
                                <span className="flex items-center gap-2">
                                  <MessageCircle className="h-4 w-4" />
                                  SMS
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch('type') === 'email' && (
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject Line</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., We&apos;d love your feedback!" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your message template..."
                              className="min-h-[200px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Use variables like {'{{customer_name}}'}, {'{{salon_name}}'}, {'{{appointment_date}}'}, {'{{service_name}}'}, {'{{review_link}}'}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Active</FormLabel>
                            <FormDescription>
                              Make this template available for use
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
                          setEditingTemplate(null)
                          form.reset()
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={template.type === 'email' ? 'default' : 'secondary'}>
                          {template.type === 'email' ? (
                            <Mail className="h-3 w-3 mr-1" />
                          ) : (
                            <MessageCircle className="h-3 w-3 mr-1" />
                          )}
                          {template.type}
                        </Badge>
                        {template.variables && template.variables.length > 0 && (
                          <Badge variant="outline">
                            {template.variables.length} variables
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.type === 'email' && template.subject && (
                    <p className="text-sm font-medium mb-2">
                      Subject: {template.subject}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.content}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}