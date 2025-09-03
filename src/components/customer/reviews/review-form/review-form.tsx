'use client'
import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Alert,
  AlertDescription,
  Progress,
} from '@/components/ui'
import { 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2
} from 'lucide-react'
import { createReviewSchema, type CreateReviewInput } from '@/lib/validations/review-schema'
import { createReview } from '@/lib/data-access/reviews/reviews'
import { ReviewFormProps, PhotoUpload } from './review-form.types'
import { REVIEW_FORM_STEPS } from './review-form.constants'
import { OverallRatingStep } from './overall-rating-step'
import { DetailedRatingsStep } from './detailed-ratings-step'
import { ContentStep } from './content-step'
import { EnhanceStep } from './enhance-step'

export function ReviewForm({
  bookingId,
  salonId,
  locationId,
  serviceId,
  staffId,
  onSuccess,
  onCancel,
  className,
  disabled = false,
  defaultValues,
  trigger
}: ReviewFormProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentStep, setCurrentStep] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [uploadedPhotos, setUploadedPhotos] = React.useState<PhotoUpload[]>([])

  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      booking_id: bookingId,
      salon_id: salonId,
      location_id: locationId,
      service_id: serviceId,
      staff_id: staffId,
      rating: 0,
      service_rating: 5,
      staff_rating: 5,
      cleanliness_rating: 5,
      value_rating: 5,
      content: '',
      title: '',
      would_recommend: true,
      is_anonymous: false,
      ...defaultValues
    },
  })

  const watchedRating = form.watch('rating')
  const watchedContent = form.watch('content')
  const steps = REVIEW_FORM_STEPS

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newPhotos = files.slice(0, 10 - uploadedPhotos.length).map(file => ({
      file,
      url: URL.createObjectURL(file),
      caption: ''
    }))
    setUploadedPhotos(prev => [...prev, ...newPhotos])
    form.setValue('photos', [...uploadedPhotos, ...newPhotos])
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => {
      const updated = prev.filter((_, i) => i !== index)
      form.setValue('photos', updated)
      return updated
    })
  }

  const updatePhotoCaption = (index: number, caption: string) => {
    setUploadedPhotos(prev => {
      const updated = prev.map((photo, i) => 
        i === index ? { ...photo, caption } : photo
      )
      form.setValue('photos', updated)
      return updated
    })
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: return form.watch('rating') > 0
      case 1: return true
      case 2: return form.watch('content')?.length >= 10
      case 3: return true
      default: return false
    }
  }

  const onSubmit = async (data: CreateReviewInput) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const review = await createReview({
        ...data,
        tags: selectedTags,
        photos: uploadedPhotos
      })
      if (review) {
        onSuccess?.(review)
        setIsOpen(false)
        form.reset()
        setCurrentStep(0)
        setSelectedTags([])
        setUploadedPhotos([])
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit review'
      setSubmitError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <OverallRatingStep
            control={form.control}
            watchedRating={watchedRating}
            disabled={disabled}
          />
        )
      case 1:
        return (
          <DetailedRatingsStep
            control={form.control}
            disabled={disabled}
          />
        )
      case 2:
        return (
          <ContentStep
            control={form.control}
            watchedContent={watchedContent}
            disabled={disabled}
          />
        )
      case 3:
        return (
          <EnhanceStep
            control={form.control}
            uploadedPhotos={uploadedPhotos}
            selectedTags={selectedTags}
            onPhotoUpload={handlePhotoUpload}
            onRemovePhoto={removePhoto}
            onUpdatePhotoCaption={updatePhotoCaption}
            onTagToggle={handleTagToggle}
            disabled={disabled}
          />
        )
      default:
        return null
    }
  }

  const progressPercentage = ((currentStep + 1) / steps.length) * 100

  const DialogContent_ = (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogDescription>
          Share your experience to help other customers
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 flex-1 overflow-hidden">
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{steps[currentStep].title}</span>
          </div>
        </div>
        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </ScrollArea>
      </div>
      <DialogFooter className="flex justify-between">
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={disabled}
            >
              Previous
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false)
              onCancel?.()
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {currentStep === steps.length - 1 ? (
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={!form.formState.isValid || isSubmitting || disabled}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceedToNextStep() || disabled}
            >
              Next
            </Button>
          )}
        </div>
      </DialogFooter>
    </DialogContent>
  )

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        {DialogContent_}
      </Dialog>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Write a Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStepContent()}
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || disabled}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}