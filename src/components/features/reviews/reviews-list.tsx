'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { cn } from '@/lib/utils'
import { ReviewDTO } from '@/lib/api/dal/reviews'

interface ReviewsListClientProps {
  initialReviews: ReviewDTO[]
  loading?: boolean
}

export function ReviewsListClient({ initialReviews, loading = false }: ReviewsListClientProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className={cn("text-lg font-semibold")}>Recent Reviews</h3>
        </CardHeader>
        <CardContent>
          <div className={cn("flex items-center justify-center py-8")}>
            Loading reviews...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className={cn("text-lg font-semibold")}>Recent Reviews</h3>
      </CardHeader>
      <CardContent className={cn("space-y-4")}>
        {initialReviews.length === 0 ? (
          <p className={cn("text-center py-8 text-muted-foreground")}>
            No reviews yet
          </p>
        ) : (
          initialReviews.map((review) => (
            <div key={review.id} className={cn("border-b last:border-0 pb-4 last:pb-0")}>
              <div className={cn("flex items-start justify-between")}>
                <div className={cn("flex items-start gap-3")}>
                  <Avatar>
                    <AvatarFallback>
                      {review.customer_id.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn("space-y-1")}>
                    <div className={cn("flex items-center gap-2")}>
                      <span className={cn("font-medium")}>Customer</span>
                      <div className={cn("flex")}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(`h-4 w-4 ${
                              star <= review.rating
                                ? 'fill-yellow-500 text-yellow-500'
                                : 'text-gray-300'
                            }`)}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className={cn("text-sm text-muted-foreground")}>
                        {review.comment}
                      </p>
                    )}
                    <div className={cn("flex items-center gap-4 text-xs text-muted-foreground")}>
                      <span>{formatDate(review.created_at)}</span>
                      {review.is_verified && (
                        <Badge variant="secondary" className={cn("text-xs")}>
                          Verified
                        </Badge>
                      )}
                    </div>
                    {review.response && (
                      <div className={cn("mt-2 p-2 bg-muted rounded-md")}>
                        <p className={cn("text-sm font-medium mb-1")}>Response:</p>
                        <p className={cn("text-sm text-muted-foreground")}>
                          {review.response}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {!review.response && (
                  <Button size="sm" variant="outline">
                    <MessageSquare className={cn("h-3 w-3 mr-1")} />
                    Reply
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}