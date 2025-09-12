'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Send } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ReviewDTO } from '@/lib/api/dal/reviews'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'

interface ReviewResponsesClientProps {
  initialReviews: ReviewDTO[]
}

export function ReviewResponsesClient({ initialReviews }: ReviewResponsesClientProps) {
  const [reviews, setReviews] = useState<ReviewDTO[]>(initialReviews)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function submitResponse(reviewId: string) {
    if (!responseText.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch('/api/reviews/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewId,
          response: responseText.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit response')
      }

      // Update local state
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response: responseText.trim(), responded_at: new Date().toISOString() }
          : review
      ))
      
      setResponseText('')
      setRespondingTo(null)
      
      toast({
        title: 'Response sent',
        description: 'Your response has been posted successfully.'
      })
      
      // Refresh to get latest data
      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit response',
        variant: 'destructive'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const pendingResponses = reviews.filter(r => !r.response)
  const respondedReviews = reviews.filter(r => !!r.response)

  return (
    <div className={cn("space-y-6")}>
      {pendingResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Responses ({pendingResponses.length})</CardTitle>
          </CardHeader>
          <CardContent className={cn("space-y-4")}>
            {pendingResponses.map((review) => {
              const initials = review.customer_id.slice(0, 2).toUpperCase()
              
              return (
                <div key={review.id} className={cn("border rounded-lg p-4 space-y-3")}>
                  <div className={cn("flex items-start justify-between")}>
                    <div className={cn("flex items-center gap-3")}>
                      <Avatar>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className={cn("font-medium")}>Customer</p>
                        <div className={cn("flex items-center gap-2")}>
                          <div className={cn("flex items-center gap-1")}>
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-gray-300'
                                }`)}
                              />
                            ))}
                          </div>
                          <span className={cn("text-sm text-muted-foreground")}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={review.rating >= 4 ? 'default' : review.rating >= 3 ? 'secondary' : 'destructive'}>
                      {review.rating >= 4 ? 'Positive' : review.rating >= 3 ? 'Neutral' : 'Negative'}
                    </Badge>
                  </div>

                  {review.comment && (
                    <p className={cn("text-sm")}>{review.comment}</p>
                  )}

                  {respondingTo === review.id ? (
                    <div className={cn("space-y-2")}>
                      <Textarea
                        placeholder="Write your response..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={3}
                      />
                      <div className={cn("flex gap-2")}>
                        <Button
                          size="sm"
                          onClick={() => submitResponse(review.id)}
                          disabled={submitting || !responseText.trim()}
                        >
                          <Send className={cn("h-4 w-4 mr-2")} />
                          {submitting ? 'Sending...' : 'Send Response'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRespondingTo(null)
                            setResponseText('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setRespondingTo(review.id)}
                    >
                      <MessageSquare className={cn("h-4 w-4 mr-2")} />
                      Respond
                    </Button>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Responded Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {respondedReviews.length === 0 ? (
            <p className={cn("text-center py-8 text-muted-foreground")}>
              No responded reviews yet
            </p>
          ) : (
            <div className={cn("space-y-4")}>
              {respondedReviews.map((review) => {
                const initials = review.customer_id.slice(0, 2).toUpperCase()
                
                return (
                  <div key={review.id} className={cn("border rounded-lg p-4 space-y-3")}>
                    <div className={cn("flex items-start justify-between")}>
                      <div className={cn("flex items-center gap-3")}>
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={cn("font-medium")}>Customer</p>
                          <div className={cn("flex items-center gap-2")}>
                            <div className={cn("flex items-center gap-1")}>
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(`h-3 w-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'
                                  }`)}
                                />
                              ))}
                            </div>
                            <span className={cn("text-sm text-muted-foreground")}>
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Responded</Badge>
                    </div>

                    {review.comment && (
                      <p className={cn("text-sm")}>{review.comment}</p>
                    )}

                    {review.response && (
                      <div className={cn("bg-muted rounded-lg p-3 mt-2")}>
                        <p className={cn("text-sm font-medium mb-1")}>Your Response:</p>
                        <p className={cn("text-sm")}>{review.response}</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}