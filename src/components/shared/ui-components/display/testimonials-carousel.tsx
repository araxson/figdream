'use client'
import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star } from 'lucide-react'
import Autoplay from 'embla-carousel-autoplay'
interface Testimonial {
  id: string
  name: string
  avatar?: string
  rating: number
  content: string
  service?: string
  date: string
}
interface TestimonialsCarouselProps {
  testimonials: Testimonial[]
  autoplay?: boolean
  className?: string
}
export function TestimonialsCarousel({
  testimonials,
  autoplay = true,
  className
}: TestimonialsCarouselProps) {
  const plugin = React.useRef(
    autoplay ? Autoplay({ delay: 5000, stopOnInteraction: true }) : undefined
  )
  return (
    <Carousel
      plugins={plugin.current ? [plugin.current] : []}
      className={className}
      opts={{
        align: 'start',
        loop: true,
      }}
    >
      <CarouselContent>
        {testimonials.map((testimonial) => (
          <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
            <div className="p-1">
              <Card>
                <CardContent>
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback>
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      {testimonial.service && (
                        <p className="text-sm text-muted-foreground">{testimonial.service}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm line-clamp-4">{testimonial.content}</p>
                  <p className="text-xs text-muted-foreground mt-4">
                    {new Date(testimonial.date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}