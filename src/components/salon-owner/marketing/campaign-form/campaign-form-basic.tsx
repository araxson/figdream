'use client'

import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FileText, Palette } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Badge,
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
  Alert,
  AlertDescription,
} from '@/components/ui'
import { campaignTypes, campaignStatuses } from '@/lib/validations/marketing-schema'
import type { CreateCampaignInput, UpdateCampaignInput } from '@/lib/validations/marketing-schema'
import { campaignTypeInfo } from './campaign-form.constants'
import type { EmailTemplate, SmsTemplate } from './campaign-form.types'

interface CampaignFormBasicProps {
  form: UseFormReturn<CreateCampaignInput | UpdateCampaignInput>
  isEditing: boolean
  isSubmitting: boolean
  emailTemplates: EmailTemplate[]
  smsTemplates: SmsTemplate[]
  selectedTemplate: string
  onTemplateSelect: (templateId: string) => void
}

export function CampaignFormBasic({
  form,
  isEditing,
  isSubmitting,
  emailTemplates,
  smsTemplates,
  selectedTemplate,
  onTemplateSelect
}: CampaignFormBasicProps) {
  const watchedType = form.watch('type')
  const typeInfo = campaignTypeInfo[watchedType]

  const getAvailableTemplates = () => {
    return watchedType === 'email' ? emailTemplates : smsTemplates
  }

  return (
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
                          <div key={type} className="flex items-start space-x-3 rounded-lg border p-3">
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
            <Select value={selectedTemplate} onValueChange={onTemplateSelect}>
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
}