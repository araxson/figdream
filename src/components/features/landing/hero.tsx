'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Calendar, MapPin, Star } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
      <div className="container relative z-10 mx-auto px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-4xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Book Your Perfect{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Beauty Experience
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Discover and book appointments at top-rated salons and spas near you. 
            From haircuts to full spa treatments, find your perfect beauty match.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="min-w-[200px]" asChild>
              <Link href="/book">
                Book Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px]" asChild>
              <Link href="/book">
                Browse Salons
              </Link>
            </Button>
          </div>
        </div>

        <div 
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500 [animation-delay:200ms]"
        >
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Find Nearby</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Discover salons in your area with real-time availability
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Easy Booking</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Book appointments 24/7 with instant confirmation
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Trusted Reviews</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Read verified reviews from real customers
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}