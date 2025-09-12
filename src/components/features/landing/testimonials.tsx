import { Star, Quote, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'

async function getTopReviews() {
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
    .gte('rating', 4)
    .order('rating', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(6)
  
  return reviews || []
}

export default async function Testimonials() {
  const reviews = await getTopReviews()
  
  if (reviews.length === 0) {
    return null
  }
  
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/50">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4" variant="secondary">
            Testimonials
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover why thousands of customers trust us for their beauty and wellness needs
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => {
            const initials = `${review.profiles?.first_name?.[0] || ''}${review.profiles?.last_name?.[0] || ''}`
            
            return (
              <Card key={review.id} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {review.profiles?.first_name} {review.profiles?.last_name?.[0]}.
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {review.salons?.name}
                        </p>
                      </div>
                    </div>
                    <Quote className="h-5 w-5 text-muted-foreground/20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'text-muted'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <a href="/reviews">
              Read More Reviews
              <ChevronRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}