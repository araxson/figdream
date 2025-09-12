'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type FAQCategory = Database['public']['Tables']['faq_categories']['Row']
type FAQQuestion = Database['public']['Tables']['faq_questions']['Row']

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  category_id: z.string().nullable().optional(),
  sort_order: z.number().min(0),
  is_active: z.boolean(),
})

type FAQFormData = z.infer<typeof faqSchema>

interface FAQFormProps {
  categories: FAQCategory[]
  question?: FAQQuestion | null
  onSuccess?: () => void
}

export function FAQForm({ categories, question, onSuccess }: FAQFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: question?.question || '',
      answer: question?.answer || '',
      category_id: question?.category_id || undefined,
      sort_order: question?.sort_order || 0,
      is_active: question?.is_active ?? true,
    },
  })

  useEffect(() => {
    if (question) {
      reset({
        question: question.question,
        answer: question.answer,
        category_id: question.category_id || undefined,
        sort_order: question.sort_order || 0,
        is_active: question.is_active ?? true,
      })
    }
  }, [question, reset])

  const onSubmit = async (data: FAQFormData) => {
    setIsLoading(true)
    try {
      const submitData = {
        ...data,
        is_active: data.is_active
      }
      
      if (question) {
        const { error } = await supabase
          .from('faq_questions')
          .update(submitData)
          .eq('id', question.id)

        if (error) throw error
        toast.success('Question updated successfully')
      } else {
        const { error } = await supabase
          .from('faq_questions')
          .insert(submitData)

        if (error) throw error
        toast.success('Question added successfully')
      }

      onSuccess?.()
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error('Failed to save question')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          {...register('question')}
          placeholder="Enter the question"
          disabled={isLoading}
        />
        {errors.question && (
          <p className="text-sm text-destructive">{errors.question.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          {...register('answer')}
          placeholder="Enter the answer"
          rows={5}
          disabled={isLoading}
        />
        {errors.answer && (
          <p className="text-sm text-destructive">{errors.answer.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          onValueChange={(value) => setValue('category_id', value || undefined)}
          defaultValue={question?.category_id || ''}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No category</SelectItem>
            {categories.map(category => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Sort Order</Label>
        <Input
          id="sort_order"
          type="number"
          min="0"
          {...register('sort_order', { valueAsNumber: true })}
          disabled={isLoading}
        />
        {errors.sort_order && (
          <p className="text-sm text-destructive">{errors.sort_order.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={question?.is_active ?? true}
          onCheckedChange={(checked) => setValue('is_active', checked)}
          disabled={isLoading}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
      </Button>
    </form>
  )
}