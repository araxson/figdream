'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star, MessageSquare, Send } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'

type Review = Database['public']['Tables']['reviews']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  staff_profiles?: Database['public']['Tables']['staff_profiles']['Row'] | null
}

export function ReviewResponses() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [respondingTo, setRespondingTo] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  const fetchReviews = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_customer_id_fkey(*),
          staff_profiles(*)
        `)
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching reviews:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  async function submitResponse(reviewId: string) {
    if (!responseText.trim()) return

    setSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: salon } = await supabase
        .from('salons')
        .select('id')
        .eq('created_by', user.id)
        .single()

      if (!salon) return

      const { error } = await supabase
        .from('reviews')
        .update({
          response: responseText.trim(),
          responded_at: new Date().toISOString()
        })
        .eq('id', reviewId)

      if (error) throw error

      setResponseText('')
      setRespondingTo(null)
      await fetchReviews()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error submitting response:', error)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading reviews...
          </div>
        </CardContent>
      </Card>
    )
  }

  const pendingResponses = reviews.filter(r => !r.response)
  const respondedReviews = reviews.filter(r => !!r.response)

  return (
    <div className="space-y-6">
      {pendingResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Responses ({pendingResponses.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingResponses.map((review) => {
              const customerName = `${review.profiles?.first_name || ''} ${review.profiles?.last_name || ''}`.trim() || 
                                 review.profiles?.email || 'Customer'
              const initials = customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
              
              return (
                <div key={review.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials || 'C'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{customerName}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating
                                    ? 'fill-yellow-500 text-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
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
                    <p className="text-sm">{review.comment}</p>
                  )}

                  {respondingTo === review.id ? (
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write your response..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => submitResponse(review.id)}
                          disabled={submitting || !responseText.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
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
                      <MessageSquare className="h-4 w-4 mr-2" />
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
            <p className="text-center py-8 text-muted-foreground">
              No responded reviews yet
            </p>
          ) : (
            <div className="space-y-4">
              {respondedReviews.map((review) => {
                const customerName = `${review.profiles?.first_name || ''} ${review.profiles?.last_name || ''}`.trim() || 
                                   review.profiles?.email || 'Customer'
                const initials = customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                
                return (
                  <div key={review.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials || 'C'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customerName}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline">Responded</Badge>
                    </div>

                    {review.comment && (
                      <p className="text-sm">{review.comment}</p>
                    )}

                    {review.response && (
                      <div className="bg-muted rounded-lg p-3 mt-2">
                        <p className="text-sm font-medium mb-1">Your Response:</p>
                        <p className="text-sm">{review.response}</p>
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