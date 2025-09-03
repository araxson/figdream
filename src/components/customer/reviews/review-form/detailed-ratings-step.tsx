'use client'
import * as React from 'react'
import {
  Card,
  CardContent,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui'
import { StarRating } from './star-rating'
import { RATING_CATEGORIES } from './review-form.constants'
import { Control } from 'react-hook-form'
import { CreateReviewInput } from '@/lib/validations/review-schema'

interface DetailedRatingsStepProps {
  control: Control<CreateReviewInput>
  disabled?: boolean
}

export function DetailedRatingsStep({ control, disabled }: DetailedRatingsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Rate Specific Areas</h3>
        <p className="text-muted-foreground">
          Help others by rating different aspects of your visit
        </p>
      </div>
      <div className="grid gap-6">
        {RATING_CATEGORIES.map((category) => (
          <Card key={category.key}>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium">{category.label}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
              <FormField
                control={control}
                name={category.key as keyof CreateReviewInput}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <StarRating
                        value={field.value || 5}
                        onChange={field.onChange}
                        size="md"
                        showLabel={false}
                        allowHalf={false}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}