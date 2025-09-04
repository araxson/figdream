'use client'

import * as React from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Mail, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import type { CreateCampaignInput, UpdateCampaignInput } from '@/lib/validations/marketing-schema'
import { campaignTypeInfo } from './campaign-form.constants'
import { RichTextEditor } from './rich-text-editor'

interface CampaignFormContentProps {
  form: UseFormReturn<CreateCampaignInput | UpdateCampaignInput>
  isSubmitting: boolean
}

export function CampaignFormContent({
  form,
  isSubmitting
}: CampaignFormContentProps) {
  const watchedType = form.watch('type')
  const typeInfo = campaignTypeInfo[watchedType]

  return (
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
}