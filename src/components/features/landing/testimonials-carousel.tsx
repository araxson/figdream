'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Owner, Bella Salon',
    content: 'FigDream transformed how we manage our salon. Booking appointments is now seamless, and our revenue has increased by 30%.',
    avatar: '/avatars/sarah.jpg',
  },
  {
    name: 'Michael Chen',
    role: 'Manager, Luxe Beauty',
    content: 'The analytics dashboard gives us insights we never had before. We can now make data-driven decisions to grow our business.',
    avatar: '/avatars/michael.jpg',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Stylist, Hair Studio',
    content: 'As a stylist, I love how easy it is to manage my schedule and track my earnings. The mobile app is a game-changer.',
    avatar: '/avatars/emily.jpg',
  },
]

export function TestimonialsCarousel() {
  return (
    <section className="py-24 lg:py-32 bg-muted/50">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Loved by salon professionals
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what our customers have to say about FigDream.
          </p>
        </div>
        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-background">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}