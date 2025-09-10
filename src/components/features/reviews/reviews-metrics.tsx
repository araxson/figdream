'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star, TrendingUp, MessageSquare, ThumbsUp } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ReviewMetrics() {
  const [metrics, setMetrics] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: [] as { rating: number; count: number }[],
    recentTrend: 0,
    responseRate: 0,
    recommendationRate: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReviewMetrics = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { data: reviews } = await supabase
        .from('reviews')
        .select('*')
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })

      if (!reviews) return

      // Calculate average rating
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

      // Calculate rating distribution
      const distribution = [5, 4, 3, 2, 1].map(rating => ({
        rating,
        count: reviews.filter(r => r.rating === rating).length
      }))

      // Calculate recent trend (last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const recentReviews = reviews.filter(r => 
        new Date(r.created_at) > thirtyDaysAgo
      )
      const previousReviews = reviews.filter(r => 
        new Date(r.created_at) > sixtyDaysAgo && 
        new Date(r.created_at) <= thirtyDaysAgo
      )

      const recentAvg = recentReviews.length > 0
        ? recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length
        : 0
      const previousAvg = previousReviews.length > 0
        ? previousReviews.reduce((sum, r) => sum + r.rating, 0) / previousReviews.length
        : 0

      const trend = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0

      // Calculate response rate based on reviews with responses
      const responsesCount = reviews.filter(r => r.response !== null).length
      const responseRate = reviews.length > 0 ? responsesCount / reviews.length * 100 : 0

      // Calculate recommendation rate (4+ stars)
      const positiveReviews = reviews.filter(r => r.rating >= 4).length
      const recommendationRate = reviews.length > 0 ? positiveReviews / reviews.length * 100 : 0

      setMetrics({
        totalReviews: reviews.length,
        averageRating,
        ratingDistribution: distribution,
        recentTrend: trend,
        responseRate,
        recommendationRate
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching review metrics:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchReviewMetrics()
  }, [fetchReviewMetrics])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(metrics.averageRating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.recentTrend > 0 ? '+' : ''}{metrics.recentTrend.toFixed(1)}% trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseRate.toFixed(0)}%</div>
            <Progress value={metrics.responseRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Would Recommend</CardTitle>
            <ThumbsUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.recommendationRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">4+ star reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.ratingDistribution.map((item) => {
              const percentage = metrics.totalReviews > 0 
                ? (item.count / metrics.totalReviews) * 100 
                : 0
              
              return (
                <div key={item.rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium">{item.rating}</span>
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  </div>
                  <Progress value={percentage} className="flex-1" />
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {item.count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}