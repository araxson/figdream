import { Calendar, Users, TrendingUp, Clock, Shield, Smartphone } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    title: 'Smart Scheduling',
    description: 'Automated appointment booking with conflict detection and staff availability management.',
    icon: Calendar,
  },
  {
    title: 'Customer Management',
    description: 'Build lasting relationships with detailed customer profiles and preferences.',
    icon: Users,
  },
  {
    title: 'Performance Analytics',
    description: 'Track revenue, monitor trends, and make data-driven decisions.',
    icon: TrendingUp,
  },
  {
    title: 'Real-time Updates',
    description: 'Instant notifications for bookings, cancellations, and schedule changes.',
    icon: Clock,
  },
  {
    title: 'Secure Platform',
    description: 'Enterprise-grade security with role-based access control and data encryption.',
    icon: Shield,
  },
  {
    title: 'Mobile Optimized',
    description: 'Access your salon dashboard from anywhere, on any device.',
    icon: Smartphone,
  },
]

export function FeaturesGrid() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run your salon
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed specifically for beauty and wellness businesses.
          </p>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="border-2">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}