import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function PricingPage() {
  // Pricing plans will be loaded from the database
  // No hardcoded pricing data allowed per project rules
  
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the perfect plan for your salon. No hidden fees, cancel anytime.
        </p>
      </section>

      {/* Pricing Plans - Empty State */}
      <Card>
        <CardContent className="text-center py-16">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Pricing Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Pricing information will be loaded from the database when available. 
            We do not display mock or sample pricing.
          </p>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <Card className="max-w-3xl mx-auto">
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              FAQ content will be loaded from the database when available.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="mt-16 text-center">
        <Card className="bg-primary text-primary-foreground max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Start your free trial today. No credit card required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}