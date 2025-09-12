'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Star, TrendingUp, MessageSquare, ThumbsUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewMetrics {
  totalReviews: number
  averageRating: number
  ratingDistribution: { rating: number; count: number }[]
  recentTrend: number
  responseRate: number
  recommendationRate: number
}

interface ReviewMetricsClientProps {
  metrics: ReviewMetrics
}

export function ReviewMetricsClient({ metrics }: ReviewMetricsClientProps) {
  return (
    <div className={cn("space-y-6")}>
      <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4")}>
        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>Average Rating</CardTitle>
            <Star className={cn("h-4 w-4 text-yellow-600")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>{metrics.averageRating.toFixed(1)}</div>
            <div className={cn("flex items-center gap-1 mt-1")}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(`h-3 w-3 ${
                    i < Math.floor(metrics.averageRating)
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'text-gray-300'
                  }`)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>Total Reviews</CardTitle>
            <MessageSquare className={cn("h-4 w-4 text-blue-600")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>{metrics.totalReviews}</div>
            <p className={cn("text-xs text-muted-foreground")}>
              {metrics.recentTrend > 0 ? '+' : ''}{metrics.recentTrend.toFixed(1)}% trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>Response Rate</CardTitle>
            <TrendingUp className={cn("h-4 w-4 text-green-600")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>{metrics.responseRate.toFixed(0)}%</div>
            <Progress value={metrics.responseRate} className={cn("mt-2")} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2")}>
            <CardTitle className={cn("text-sm font-medium")}>Would Recommend</CardTitle>
            <ThumbsUp className={cn("h-4 w-4 text-purple-600")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold")}>{metrics.recommendationRate.toFixed(0)}%</div>
            <p className={cn("text-xs text-muted-foreground")}>4+ star reviews</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn("space-y-3")}>
            {metrics.ratingDistribution.map((item) => {
              const percentage = metrics.totalReviews > 0 
                ? (item.count / metrics.totalReviews) * 100 
                : 0
              
              return (
                <div key={item.rating} className={cn("flex items-center gap-3")}>
                  <div className={cn("flex items-center gap-1 w-20")}>
                    <span className={cn("text-sm font-medium")}>{item.rating}</span>
                    <Star className={cn("h-3 w-3 fill-yellow-500 text-yellow-500")} />
                  </div>
                  <Progress value={percentage} className={cn("flex-1")} />
                  <span className={cn("text-sm text-muted-foreground w-16 text-right")}>
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