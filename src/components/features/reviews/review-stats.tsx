'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Star,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  ThumbsUp,
  Camera,
  CheckCircle,
  Award,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Eye,
  Heart,
  RefreshCw,
  Download,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { getReviews } from '@/lib/data-access/reviews/reviews'
import type { ReviewFilterInput } from '@/lib/validations/review-schema'

interface ReviewStatsProps {
  salonId: string
  locationId?: string
  serviceId?: string
  staffId?: string
  className?: string
  showComparison?: boolean
  showDetailedBreakdown?: boolean
  showTrends?: boolean
}

interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: number]: number }
  verifiedReviews: number
  reviewsWithPhotos: number
  reviewsWithResponses: number
  responseRate: number
  helpfulVotes: number
  recentReviews: number
  growth: {
    reviewsChange: number
    ratingChange: number
  }
  categoryRatings: {
    service: number
    staff: number
    cleanliness: number
    value: number
  }
  monthlyTrend: Array<{
    month: string
    reviews: number
    rating: number
  }>
}

const TIME_PERIODS = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'quarter', label: 'Last 3 months' },
  { value: 'year', label: 'Last 12 months' },
  { value: 'all', label: 'All time' }
]

export function ReviewStats({
  salonId,
  locationId,
  serviceId,
  staffId,
  className,
  showComparison = true,
  showDetailedBreakdown = true,
  showTrends = true
}: ReviewStatsProps) {
  const [stats, setStats] = React.useState<ReviewStats | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [timePeriod, setTimePeriod] = React.useState('month')

  const fetchStats = React.useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Calculate date range based on selected period
      let dateFrom: string | undefined
      const now = new Date()

      switch (timePeriod) {
        case 'week':
          dateFrom = subDays(now, 7).toISOString()
          break
        case 'month':
          dateFrom = subDays(now, 30).toISOString()
          break
        case 'quarter':
          dateFrom = subMonths(now, 3).toISOString()
          break
        case 'year':
          dateFrom = subYears(now, 1).toISOString()
          break
        default:
          dateFrom = undefined
      }

      // Base filters
      const baseFilters: ReviewFilterInput = {
        salon_id: salonId,
        location_id: locationId,
        service_id: serviceId,
        staff_id: staffId,
        status: 'approved',
        limit: 1000, // Get more data for calculations
        offset: 0
      }

      // Current period data
      const currentResult = await getReviews({
        ...baseFilters,
        date_from: dateFrom
      })

      // Previous period for comparison (if enabled)
      let previousResult = null
      if (showComparison && dateFrom) {
        let previousDateFrom: string
        let previousDateTo: string

        switch (timePeriod) {
          case 'week':
            previousDateFrom = subDays(now, 14).toISOString()
            previousDateTo = subDays(now, 7).toISOString()
            break
          case 'month':
            previousDateFrom = subDays(now, 60).toISOString()
            previousDateTo = subDays(now, 30).toISOString()
            break
          case 'quarter':
            previousDateFrom = subMonths(now, 6).toISOString()
            previousDateTo = subMonths(now, 3).toISOString()
            break
          case 'year':
            previousDateFrom = subYears(now, 2).toISOString()
            previousDateTo = subYears(now, 1).toISOString()
            break
          default:
            previousDateFrom = ''
            previousDateTo = ''
        }

        if (previousDateFrom && previousDateTo) {
          previousResult = await getReviews({
            ...baseFilters,
            date_from: previousDateFrom,
            date_to: previousDateTo
          })
        }
      }

      // Calculate stats
      const reviews = currentResult.reviews
      const totalReviews = currentResult.total
      const averageRating = currentResult.average_rating

      // Rating distribution
      const ratingDistribution: { [key: number]: number } = {
        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
      }
      reviews.forEach(review => {
        ratingDistribution[Math.floor(review.rating)]++
      })

      // Count different types of reviews
      const verifiedReviews = reviews.filter(r => r.verified_purchase).length
      const reviewsWithPhotos = reviews.filter(r => r.photos && JSON.parse(r.photos as string || '[]').length > 0).length
      const reviewsWithResponses = reviews.filter(r => r.review_responses && r.review_responses.length > 0).length
      const responseRate = totalReviews > 0 ? Math.round((reviewsWithResponses / totalReviews) * 100) : 0
      const helpfulVotes = reviews.reduce((sum, r) => sum + (r.helpful_count || 0), 0)

      // Recent reviews (last 7 days)
      const sevenDaysAgo = subDays(now, 7).toISOString()
      const recentReviewsResult = await getReviews({
        ...baseFilters,
        date_from: sevenDaysAgo
      })
      const recentReviews = recentReviewsResult.total

      // Growth calculations
      const reviewsChange = previousResult 
        ? totalReviews - previousResult.total
        : 0
      const ratingChange = previousResult 
        ? Number((averageRating - previousResult.average_rating).toFixed(2))
        : 0

      // Category ratings (average of detailed ratings)
      const categoryRatings = {
        service: 0,
        staff: 0,
        cleanliness: 0,
        value: 0
      }

      const reviewsWithServiceRating = reviews.filter(r => r.service_rating).length
      const reviewsWithStaffRating = reviews.filter(r => r.staff_rating).length
      const reviewsWithCleanlinessRating = reviews.filter(r => r.cleanliness_rating).length
      const reviewsWithValueRating = reviews.filter(r => r.value_rating).length

      if (reviewsWithServiceRating > 0) {
        categoryRatings.service = reviews
          .filter(r => r.service_rating)
          .reduce((sum, r) => sum + r.service_rating!, 0) / reviewsWithServiceRating
      }

      if (reviewsWithStaffRating > 0) {
        categoryRatings.staff = reviews
          .filter(r => r.staff_rating)
          .reduce((sum, r) => sum + r.staff_rating!, 0) / reviewsWithStaffRating
      }

      if (reviewsWithCleanlinessRating > 0) {
        categoryRatings.cleanliness = reviews
          .filter(r => r.cleanliness_rating)
          .reduce((sum, r) => sum + r.cleanliness_rating!, 0) / reviewsWithCleanlinessRating
      }

      if (reviewsWithValueRating > 0) {
        categoryRatings.value = reviews
          .filter(r => r.value_rating)
          .reduce((sum, r) => sum + r.value_rating!, 0) / reviewsWithValueRating
      }

      // Monthly trend (last 12 months)
      const monthlyTrend = []
      if (showTrends) {
        for (let i = 11; i >= 0; i--) {
          const monthDate = subMonths(now, i)
          const monthStart = startOfMonth(monthDate).toISOString()
          const monthEnd = endOfMonth(monthDate).toISOString()

          const monthResult = await getReviews({
            ...baseFilters,
            date_from: monthStart,
            date_to: monthEnd
          })

          monthlyTrend.push({
            month: format(monthDate, 'MMM'),
            reviews: monthResult.total,
            rating: monthResult.average_rating || 0
          })
        }
      }

      const compiledStats: ReviewStats = {
        totalReviews,
        averageRating,
        ratingDistribution,
        verifiedReviews,
        reviewsWithPhotos,
        reviewsWithResponses,
        responseRate,
        helpfulVotes,
        recentReviews,
        growth: {
          reviewsChange,
          ratingChange
        },
        categoryRatings,
        monthlyTrend
      }

      setStats(compiledStats)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stats'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [salonId, locationId, serviceId, staffId, timePeriod, showComparison, showTrends])

  React.useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const renderOverallStats = () => {
    if (!stats) return null

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.totalReviews}</p>
                  {showComparison && stats.growth.reviewsChange !== 0 && (
                    <div className={cn(
                      "flex items-center text-xs",
                      stats.growth.reviewsChange > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {stats.growth.reviewsChange > 0 ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(stats.growth.reviewsChange)}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  {showComparison && stats.growth.ratingChange !== 0 && (
                    <div className={cn(
                      "flex items-center text-xs",
                      stats.growth.ratingChange > 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {stats.growth.ratingChange > 0 ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : stats.growth.ratingChange < 0 ? (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      ) : (
                        <Minus className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(stats.growth.ratingChange)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3 w-3",
                        i < Math.round(stats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">{stats.responseRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.reviewsWithResponses} of {stats.totalReviews} reviews
                </p>
              </div>
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MessageSquare className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Activity</p>
                <p className="text-2xl font-bold">{stats.recentReviews}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  reviews this week
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Activity className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!stats) return null

    const maxCount = Math.max(...Object.values(stats.ratingDistribution))

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Rating Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratingDistribution[rating] || 0
              const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0

              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium">{rating}</span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={percentage} 
                      className="h-2"
                    />
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="w-12 text-right">
                    <span className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCategoryRatings = () => {
    if (!stats || !showDetailedBreakdown) return null

    const categories = [
      { key: 'service', label: 'Service Quality', icon: Target, color: 'blue' },
      { key: 'staff', label: 'Staff Performance', icon: Users, color: 'green' },
      { key: 'cleanliness', label: 'Cleanliness', icon: CheckCircle, color: 'purple' },
      { key: 'value', label: 'Value for Money', icon: Award, color: 'orange' }
    ]

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Category Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const rating = stats.categoryRatings[category.key as keyof typeof stats.categoryRatings]
              const Icon = category.icon

              return (
                <div key={category.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        `bg-${category.color}-100`
                      )}>
                        <Icon className={cn("h-4 w-4", `text-${category.color}-600`)} />
                      </div>
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold">
                        {rating > 0 ? rating.toFixed(1) : 'N/A'}
                      </span>
                      {rating > 0 && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  {rating > 0 && (
                    <Progress value={(rating / 5) * 100} className="h-2" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderAdditionalMetrics = () => {
    if (!stats) return null

    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Reviews</p>
                <p className="text-2xl font-bold">{stats.verifiedReviews}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalReviews > 0 
                    ? Math.round((stats.verifiedReviews / stats.totalReviews) * 100)
                    : 0
                  }% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Camera className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reviews with Photos</p>
                <p className="text-2xl font-bold">{stats.reviewsWithPhotos}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalReviews > 0 
                    ? Math.round((stats.reviewsWithPhotos / stats.totalReviews) * 100)
                    : 0
                  }% of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <ThumbsUp className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Helpful Votes</p>
                <p className="text-2xl font-bold">{stats.helpfulVotes}</p>
                <p className="text-xs text-muted-foreground">
                  {stats.totalReviews > 0 
                    ? (stats.helpfulVotes / stats.totalReviews).toFixed(1)
                    : 0
                  } per review
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderTrendChart = () => {
    if (!stats || !showTrends || stats.monthlyTrend.length === 0) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Review Trends (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Simple trend visualization */}
            <div className="grid grid-cols-12 gap-2">
              {stats.monthlyTrend.map((data, index) => {
                const maxReviews = Math.max(...stats.monthlyTrend.map(d => d.reviews))
                const height = maxReviews > 0 ? (data.reviews / maxReviews) * 100 : 0

                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {data.reviews}
                    </div>
                    <div className="w-full bg-muted rounded-t h-[60px] relative overflow-hidden">
                      <div 
                        className="bg-primary rounded-t absolute bottom-0 w-full transition-all duration-300"
                        style={{ 
                          height: `${height}%`,
                          '--chart-height': `${height}%` 
                        } as React.CSSProperties}
                      />
                    </div>
                    <div className="text-xs font-medium mt-1">{data.month}</div>
                    <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      {data.rating.toFixed(1)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={fetchStats} className="mt-2">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive review statistics and insights
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchStats} disabled={isLoading}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      {renderOverallStats()}

      {/* Detailed Breakdown */}
      <div className="grid gap-6 md:grid-cols-2">
        {renderRatingDistribution()}
        {renderCategoryRatings()}
      </div>

      {/* Additional Metrics */}
      {renderAdditionalMetrics()}

      {/* Trend Chart */}
      {renderTrendChart()}
    </div>
  )
}