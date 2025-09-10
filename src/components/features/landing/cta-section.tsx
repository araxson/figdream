import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-24 text-center shadow-2xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to transform your salon business?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/90">
            Join thousands of salon professionals who are already using FigDream to grow their business.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Start Your Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/10" asChild>
              <Link href="/contact">Talk to Sales</Link>
            </Button>
          </div>
          <div className="mt-8 text-sm text-primary-foreground/80">
            No credit card required • 14-day free trial • Cancel anytime
          </div>
        </div>
      </div>
    </section>
  )
}