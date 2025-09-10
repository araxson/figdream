'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, MessageSquare } from 'lucide-react'
import { useEffect, useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database.types'
import { formatDate } from '@/lib/utils/format'

type Review = Database['public']['Tables']['reviews']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row']
  appointments?: {
    appointment_services?: Array<{
      services?: Database['public']['Tables']['services']['Row']
    }>
    staff_profiles?: {
      profiles?: Database['public']['Tables']['profiles']['Row']
    }
  }
}

export function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchReviews = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get salon owned by user
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
          appointments(
            appointment_services(
              services(*)
            ),
            staff_profiles(
              profiles(*)
            )
          )
        `)
        .eq('salon_id', salon.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setReviews(data || [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Reviews</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            Loading reviews...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Recent Reviews</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No reviews yet
          </p>
        ) : (
          reviews.map((review) => {
            const customerName = `${review.profiles?.first_name || ''} ${review.profiles?.last_name || ''}`.trim() || 
                               review.profiles?.email || 'Customer'
            const serviceName = review.appointments?.appointment_services?.[0]?.services?.name || 'Service'
            const staffName = review.appointments?.staff_profiles?.profiles?.full_name || 
                            review.appointments?.staff_profiles?.profiles?.email || 'Staff'
            
            return (
              <div key={review.id} className="space-y-3 pb-4 border-b last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {customerName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{customerName}</p>
                        <div className="flex">
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
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {serviceName} with {staffName} • {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  {review.response ? (
                    <Badge variant="secondary">Responded</Badge>
                  ) : (
                    <Button size="sm" variant="outline">
                      <MessageSquare className="mr-1 h-3 w-3" />
                      Reply
                    </Button>
                  )}
                </div>
                <p className="text-sm pl-11">{review.comment}</p>
                {review.response && (
                  <div className="ml-11 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Owner Response:</p>
                    <p className="text-sm">{review.response}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}