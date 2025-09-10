// import { PricingCards } from '@/components/sections/pricing/pricing-cards'
import { Badge } from '@/components/ui/badge'

export default function PricingPage() {
  return (
    <main className="min-h-screen">
        <section className="w-full py-20 md:py-24 bg-gradient-to-br from-primary/10 to-background">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="text-center">
              <Badge className="mb-4">Pricing</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Choose the perfect plan for your salon. No hidden fees, 
                cancel anytime.
              </p>
            </div>
          </div>
        </section>
        {/* <PricingCards /> */}
    </main>
  )
}