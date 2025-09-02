'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Separator,
  Badge,
  Alert,
  AlertDescription,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Label,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Avatar,
  AvatarFallback,
  AspectRatio,
} from '@/components/ui'
import { 
  Star, 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Heart,
  ThumbsUp,
  MessageSquare,
  Calendar,
  User,
  Sparkles,
  Award,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { createReviewSchema, type CreateReviewInput } from '@/lib/validations/review-schema'
import { createReview } from '@/lib/data-access/reviews/reviews'

// Predefined tags for quick selection
const REVIEW_TAGS = [
  'Professional',
  'Friendly Staff',
  'Clean Environment',
  'On Time',
  'Great Value',
  'Relaxing',
  'Expert Service',
  'Comfortable',
  'Welcoming',
  'High Quality',
  'Attention to Detail',
  'Great Results',
  'Exceeded Expectations',
  'Will Return',
  'Highly Recommend'
]

// Service rating categories
const RATING_CATEGORIES = [
  { key: 'service_rating', label: 'Service Quality', description: 'How would you rate the service itself?' },
  { key: 'staff_rating', label: 'Staff Performance', description: 'How professional and skilled was the staff?' },
  { key: 'cleanliness_rating', label: 'Cleanliness', description: 'How clean and hygienic was the salon?' },
  { key: 'value_rating', label: 'Value for Money', description: 'Was the service worth what you paid?' }
]

interface ReviewFormProps {
  bookingId?: string
  salonId: string
  locationId?: string
  serviceId?: string
  staffId?: string
  onSuccess?: (review: any) => void
  onCancel?: () => void
  className?: string
  disabled?: boolean
  defaultValues?: Partial<CreateReviewInput>
  trigger?: React.ReactNode
}

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
  const [selectedTags, setSelectedTags] = React.useState<string[]>(defaultValues?.tags || [])
  const [uploadedPhotos, setUploadedPhotos] = React.useState<Array<{
    url: string
    caption: string
    width?: number
    height?: number
  }>>(defaultValues?.photos || [])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)

  const form = useForm<CreateReviewInput>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      booking_id: bookingId,
      salon_id: salonId,
      location_id: locationId,
      service_id: serviceId,
      staff_id: staffId,
      customer_id: '', // This would be set by the server
      rating: 5,
      title: '',
      content: '',
      service_rating: 5,
      staff_rating: 5,
      cleanliness_rating: 5,
      value_rating: 5,
      photos: [],
      tags: [],
      is_anonymous: false,
      would_recommend: true,
      visited_date: new Date().toISOString(),
      ...defaultValues
    }
  })

  const watchedRating = form.watch('rating')
  const watchedContent = form.watch('content')

  const steps = [
    {
      id: 'rating',
      title: 'Overall Rating',
      description: 'How was your overall experience?',
      icon: Star
    },
    {
      id: 'details',
      title: 'Detailed Ratings',
      description: 'Rate specific aspects of your visit',
      icon: CheckCircle
    },
    {
      id: 'review',
      title: 'Write Review',
      description: 'Share your experience in detail',
      icon: MessageSquare
    },
    {
      id: 'enhance',
      title: 'Enhance Review',
      description: 'Add photos and tags',
      icon: Camera
    }
  ]

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      const updated = prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
      form.setValue('tags', updated)
      return updated
    })
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // In a real implementation, you would upload these files and get URLs back
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const photo = {
          url: e.target?.result as string,
          caption: '',
          width: undefined,
          height: undefined
        }
        setUploadedPhotos(prev => {
          const updated = [...prev, photo]
          form.setValue('photos', updated)
          return updated
        })
      }
      reader.readAsDataURL(file)
    })
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
      case 0: // Overall Rating
        return form.watch('rating') > 0
      case 1: // Detailed Ratings
        return true // All detailed ratings are optional
      case 2: // Review Content
        return form.watch('content')?.length >= 10
      case 3: // Enhance
        return true // Photos and tags are optional
      default:
        return false
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

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor'
      case 2: return 'Fair'
      case 3: return 'Good'
      case 4: return 'Very Good'
      case 5: return 'Excellent'
      default: return ''
    }
  }

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 1: return 'text-red-500'
      case 2: return 'text-orange-500'
      case 3: return 'text-yellow-500'
      case 4: return 'text-blue-500'
      case 5: return 'text-green-500'
      default: return 'text-gray-400'
    }
  }

  const StarRating = ({ 
    value, 
    onChange, 
    size = 'lg',
    showLabel = true,
    allowHalf = true 
  }: {
    value: number
    onChange: (rating: number) => void
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    allowHalf?: boolean
  }) => {
    const [hoverValue, setHoverValue] = React.useState<number>(0)
    
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8'
    }

    const handleClick = (rating: number) => {
      onChange(rating)
    }

    const handleMouseEnter = (rating: number) => {
      setHoverValue(rating)
    }

    const handleMouseLeave = () => {
      setHoverValue(0)
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((rating) => {
            const isFilled = (hoverValue || value) >= rating
            const isHalfFilled = allowHalf && (hoverValue || value) >= rating - 0.5 && (hoverValue || value) < rating
            
            return (
              <Button
                key={rating}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleClick(rating)}
                onMouseEnter={() => handleMouseEnter(rating)}
                onMouseLeave={handleMouseLeave}
                disabled={disabled}
                className={cn(
                  'p-1 h-auto transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded',
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    'transition-colors',
                    isFilled 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : isHalfFilled
                      ? 'fill-yellow-200 text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  )}
                />
              </Button>
            )
          })}
        </div>
        {showLabel && (
          <span className={cn(
            'text-sm font-medium transition-colors',
            getRatingColor(hoverValue || value)
          )}>
            {getRatingLabel(hoverValue || value)}
          </span>
        )}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Overall Rating
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
                control={form.control}
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

      case 1: // Detailed Ratings
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
                    control={form.control}
                    name={category.key as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <StarRating
                            value={field.value || 5}
                            onChange={field.onChange}
                            size="md"
                            showLabel={false}
                            allowHalf={false}
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

      case 2: // Review Content
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
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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

      case 3: // Enhance Review
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Enhance Your Review</h3>
              <p className="text-muted-foreground">
                Add photos and tags to make your review more helpful
              </p>
            </div>

            {/* Photo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Add Photos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedPhotos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <AspectRatio ratio={1}>
                          <img 
                            src={photo.url} 
                            alt={`Review photo ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        </AspectRatio>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 hidden group-hover:block"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <Input
                          placeholder="Add caption..."
                          value={photo.caption}
                          onChange={(e) => updatePhotoCaption(index, e.target.value)}
                          maxLength={200}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {uploadedPhotos.length < 10 && (
                  <Card>
                    <CardContent>
                      <div className="text-center space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Upload photos of your results</p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG up to 5MB each. Maximum 10 photos.
                        </p>
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          disabled={disabled}
                          className="hidden"
                          id="photo-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                          disabled={disabled}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Choose Photos
                        </Button>
                      </div>
                    </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Tags Selection */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Award className="h-5 w-5 inline-block mr-2" />
                  What did you like?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {REVIEW_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Click tags to add them to your review
                </p>
              </CardContent>
            </Card>

            {/* Privacy Options */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="is_anonymous"
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
                        <FormLabel>Post this review anonymously</FormLabel>
                        <FormDescription>
                          Your name won't be shown with this review
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
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
        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progressPercentage} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{steps[currentStep].title}</span>
          </div>
        </div>

        {/* Step Content */}
        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStepContent()}

              {/* Error Display */}
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

            <div className="flex justify-between pt-4">
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
              
              <div className="ml-auto">
                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
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
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}