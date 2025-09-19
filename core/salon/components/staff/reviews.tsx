"use client"

import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"

interface Review {
  id: string
  customer: string
  rating: number
  comment: string
  date: string
}

interface StaffReviewsProps {
  reviews: Review[]
}

export function StaffReviews({ reviews }: StaffReviewsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Reviews</CardTitle>
        <CardDescription>Customer feedback and ratings</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {review.customer.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{review.customer}</span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-muted-foreground break-words">
                      {review.comment}
                    </p>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {format(new Date(review.date), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No reviews yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}