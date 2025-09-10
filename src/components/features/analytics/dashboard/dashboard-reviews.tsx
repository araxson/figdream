import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'

interface Review {
  customer: string
  rating: number
  comment: string
  date: string
}

interface DashboardReviewsProps {
  reviews: Review[]
}

export function DashboardReviews({ reviews }: DashboardReviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
        <CardDescription>Latest feedback from your clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="space-y-2 pb-4 border-b last:border-0">
              <div className="flex items-center justify-between">
                <p className="font-medium">{review.customer}</p>
                <span className="text-sm text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}