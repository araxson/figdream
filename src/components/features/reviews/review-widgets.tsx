/**
 * Review Display Widgets for FigDream
 * Embeddable review components for various display contexts
 */

'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight, TrendingUp, Users, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  customer_name: string
  customer_avatar?: string
  rating: number
  title?: string
  content: string
  created_at: string
  verified_purchase: boolean
  photos?: { url: string }[]
  response?: {
    content: string
    responder_name: string
  }
}

interface ReviewWidgetProps {
  salonId: string
  locationId?: string
  className?: string
}

/**
 * Review Carousel Widget
 * Displays reviews in a rotating carousel
 */
export function ReviewCarousel({ 
  reviews,
  autoPlay = true,
  interval = 5000,
  className 
}: {
  reviews: Review[]
  autoPlay?: boolean
  interval?: number
  className?: string
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!autoPlay || reviews.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length)
    }, interval)

    return () => clearInterval(timer)
  }, [autoPlay, interval, reviews.length])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length)
  }

  if (reviews.length === 0) {
    return null
  }

  const currentReview = reviews[currentIndex]

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Quote className="h-8 w-8 text-muted-foreground/20 flex-shrink-0" />
          
          <div className="flex-1 space-y-4">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < currentReview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              {currentReview.verified_purchase && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>

            {/* Title */}
            {currentReview.title && (
              <h4 className="font-semibold">{currentReview.title}</h4>
            )}

            {/* Content */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {currentReview.content}
            </p>

            {/* Customer Info */}
            <div className="flex items-center gap-3 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentReview.customer_avatar} />
                <AvatarFallback>
                  {currentReview.customer_name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{currentReview.customer_name}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(currentReview.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {reviews.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Indicators */}
            <div className="flex justify-center gap-1 mt-4">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    index === currentIndex
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30"
                  )}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Review Summary Badge
 * Compact rating display widget
 */
export function ReviewSummaryBadge({
  averageRating,
  totalReviews,
  salonName,
  className
}: {
  averageRating: number
  totalReviews: number
  salonName: string
  className?: string
}) {
  return (
    <Card className={cn("inline-block", className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.round(averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{salonName}</p>
            <p className="text-xs text-muted-foreground">
              {totalReviews.toLocaleString()} reviews
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Review Grid Widget
 * Displays reviews in a grid layout
 */
export function ReviewGrid({
  reviews,
  columns = 3,
  className
}: {
  reviews: Review[]
  columns?: number
  className?: string
}) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "md:grid-cols-2",
      columns === 3 && "md:grid-cols-3",
      columns === 4 && "md:grid-cols-4",
      className
    )}>
      {reviews.map((review) => (
        <Card key={review.id} className="h-full">
          <CardContent className="p-4 space-y-3">
            {/* Rating */}
            <div className="flex items-center justify-between">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              {review.verified_purchase && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>

            {/* Content */}
            <p className="text-sm text-muted-foreground line-clamp-3">
              {review.content}
            </p>

            {/* Customer */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {review.customer_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">
                  {review.customer_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * Review Stats Widget
 * Displays rating breakdown and statistics
 */
export function ReviewStatsWidget({
  stats,
  className
}: {
  stats: {
    averageRating: number
    totalReviews: number
    ratingDistribution: Record<number, number>
    recommendationRate: number
    responseRate: number
  }
  className?: string
}) {
  const maxCount = Math.max(...Object.values(stats.ratingDistribution))

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Customer Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
          <div className="flex justify-center mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-5 w-5",
                  i < Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Based on {stats.totalReviews.toLocaleString()} reviews
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating] || 0
            const percentage = stats.totalReviews > 0 
              ? (count / stats.totalReviews) * 100 
              : 0

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-3">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <Progress 
                  value={percentage} 
                  className="flex-1 h-2"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {count}
                </span>
              </div>
            )
          })}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="font-semibold">{stats.recommendationRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Would Recommend</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600">
              <Users className="h-4 w-4 mr-1" />
              <span className="font-semibold">{stats.responseRate}%</span>
            </div>
            <p className="text-xs text-muted-foreground">Response Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Floating Review Widget
 * Displays reviews in a floating corner widget
 */
export function FloatingReviewWidget({
  reviews,
  position = 'bottom-right',
  className
}: {
  reviews: Review[]
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
  className?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
  }

  if (reviews.length === 0) return null

  const currentReview = reviews[currentIndex]
  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className={cn("fixed z-50", positionClasses[position], className)}>
      {isOpen ? (
        <Card className="w-80 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Customer Reviews</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Average Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">
                {averageRating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            {/* Current Review */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-3 w-3",
                      i < currentReview.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm line-clamp-2">{currentReview.content}</p>
              <p className="text-xs text-muted-foreground">
                — {currentReview.customer_name}
              </p>
            </div>

            {/* Navigation */}
            {reviews.length > 1 && (
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => 
                    (prev - 1 + reviews.length) % reviews.length
                  )}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} / {reviews.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentIndex((prev) => 
                    (prev + 1) % reviews.length
                  )}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Button
          className="shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
          {averageRating.toFixed(1)} Reviews
        </Button>
      )}
    </div>
  )
}

/**
 * Trust Badge Widget
 * Displays trust indicators and certifications
 */
export function TrustBadgeWidget({
  stats,
  certifications = [],
  className
}: {
  stats: {
    averageRating: number
    totalReviews: number
    verifiedReviews: number
    responseRate: number
  }
  certifications?: string[]
  className?: string
}) {
  return (
    <Card className={cn("bg-gradient-to-br from-primary/5 to-primary/10", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Trust & Quality</h3>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">Total Reviews</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.verifiedReviews}%</div>
              <p className="text-xs text-muted-foreground">Verified Reviews</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.responseRate}%</div>
              <p className="text-xs text-muted-foreground">Response Rate</p>
            </div>
          </div>

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {cert}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}