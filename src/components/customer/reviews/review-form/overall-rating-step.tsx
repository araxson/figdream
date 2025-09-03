'use client'
import * as React from 'react'
import { Star, Sparkles } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  Avatar,
  AvatarFallback,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui'
import { StarRating } from './star-rating'
import { Control } from 'react-hook-form'
import { CreateReviewInput } from '@/lib/validations/review-schema'

interface OverallRatingStepProps {
  control: Control<CreateReviewInput>
  watchedRating: number
  disabled?: boolean
}

export function OverallRatingStep({ control, watchedRating, disabled }: OverallRatingStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              <Star className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Rate Your Experience</h3>
          <p className="text-muted-foreground">
            How would you rate your overall experience at this salon?
          </p>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <FormField
          control={control}
          name="rating"
          render={({ field }) => (
            <FormItem className="text-center">
              <FormControl>
                <StarRating
                  value={field.value}
                  onChange={field.onChange}
                  size="xl"
                  showLabel={true}
                  allowHalf={false}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {watchedRating > 0 && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              {watchedRating >= 4 
                ? "Great! We're thrilled you had such a positive experience."
                : watchedRating >= 3
                ? "Thank you for your feedback. We'd love to hear more about your experience."
                : "We're sorry your experience wasn't perfect. Your feedback helps us improve."
              }
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}