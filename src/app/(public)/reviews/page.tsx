import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getPublicReviews() {
  const supabase = await createClient()
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      profiles:customer_id (
        first_name,
        last_name
      ),
      salons (
        name
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(12)
  
  return reviews || []
}

export default async function ReviewsPage() {
  const reviews = await getPublicReviews()
  
  return (
    <main className="min-h-screen">
      <section className="w-full py-20 md:py-24 bg-gradient-to-br from-primary/10 to-background">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Customer Reviews
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              See what our customers are saying about their experiences
            </p>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto max-w-7xl px-4 py-12">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No reviews available yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{review.salons?.name || 'Salon'}</CardTitle>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.comment}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    - {review.profiles?.first_name} {review.profiles?.last_name?.[0]}.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}