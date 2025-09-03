'use client'
import * as React from 'react'
import { Heart } from 'lucide-react'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Checkbox,
} from '@/components/ui'
import { Control } from 'react-hook-form'
import { CreateReviewInput } from '@/lib/validations/review-schema'

interface ContentStepProps {
  control: Control<CreateReviewInput>
  watchedContent: string
  disabled?: boolean
}

export function ContentStep({ control, watchedContent, disabled }: ContentStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Share Your Experience</h3>
        <p className="text-muted-foreground">
          Tell others about your visit in your own words
        </p>
      </div>
      <div className="space-y-4">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review Title (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Summarize your experience..."
                  {...field}
                  disabled={disabled}
                  maxLength={100}
                />
              </FormControl>
              <FormDescription>
                Give your review a catchy title (up to 100 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Review *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your experience. What did you like? What could be improved? Be specific and helpful to other customers..."
                  className="min-h-32"
                  {...field}
                  disabled={disabled}
                  maxLength={2000}
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                <span>Share details about your visit (minimum 10 characters)</span>
                <span className="text-xs">
                  {watchedContent?.length || 0}/2000
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="would_recommend"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  I would recommend this salon to others
                </FormLabel>
              </div>
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}