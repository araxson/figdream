'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-primary/80 px-6 py-24 shadow-2xl sm:px-12 animate-in fade-in zoom-in-95 duration-500"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          </div>
          
          <div className="relative mx-auto max-w-2xl text-center">
            <Sparkles className="mx-auto h-12 w-12 text-white/90 mb-6" />
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Beauty Routine?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/90">
              Join thousands of happy customers who have discovered their perfect beauty match. 
              Start booking appointments today!
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="min-w-[200px]"
                asChild
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="min-w-[200px] text-white hover:bg-white/20"
                asChild
              >
                <Link href="/book">
                  Browse Salons
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}