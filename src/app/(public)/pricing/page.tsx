import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for independent stylists',
    price: 49,
    interval: 'month',
    features: [
      { name: 'Up to 2 staff members', included: true },
      { name: 'Unlimited bookings', included: true },
      { name: 'Basic analytics', included: true },
      { name: 'Email support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Customer reviews', included: true },
      { name: 'Multiple locations', included: false },
      { name: 'Marketing campaigns', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'Priority support', included: false },
    ],
  },
  {
    name: 'Professional',
    description: 'For growing salons',
    price: 149,
    interval: 'month',
    badge: 'Most Popular',
    features: [
      { name: 'Up to 10 staff members', included: true },
      { name: 'Unlimited bookings', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Customer reviews', included: true },
      { name: 'Up to 3 locations', included: true },
      { name: 'Email marketing', included: true },
      { name: 'Loyalty programs', included: true },
      { name: 'Inventory management', included: true },
    ],
  },
  {
    name: 'Enterprise',
    description: 'For multi-location chains',
    price: 399,
    interval: 'month',
    features: [
      { name: 'Unlimited staff members', included: true },
      { name: 'Unlimited bookings', included: true },
      { name: 'Custom analytics & reports', included: true },
      { name: '24/7 phone & email support', included: true },
      { name: 'Mobile app access', included: true },
      { name: 'Customer reviews', included: true },
      { name: 'Unlimited locations', included: true },
      { name: 'Omnichannel marketing', included: true },
      { name: 'Advanced loyalty programs', included: true },
      { name: 'API access', included: true },
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      {/* Header */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Choose the perfect plan for your salon. All plans include our core features with no hidden fees.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.badge ? 'border-primary' : ''}>
            <CardHeader>
              {plan.badge && (
                <Badge className="w-fit mb-2">{plan.badge}</Badge>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature.name} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-4 w-4 text-primary mr-2" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground/50 mr-2" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground/50'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.badge ? 'default' : 'outline'} asChild>
                <Link href="/auth/register/salon">
                  Start Free Trial
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! All plans come with a 14-day free trial. No credit card required to start.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and ACH bank transfers for annual plans.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Is there a setup fee?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                No setup fees, no hidden charges. The price you see is the price you pay.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Do you offer discounts for annual billing?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Yes! Save 20% when you choose annual billing. That&apos;s two months free every year.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center mt-16 p-8 bg-muted/50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Ready to transform your salon?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Join thousands of salons using FigDream to streamline operations and grow their business.
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/register/salon">Start Free Trial</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}